import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { supabase, auth, handleAuthError } from '../lib/supabase';
import { apiService, handleApiError } from '../lib/api';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    const skipNextFetchRef = useRef(false);
    const profileRef = useRef(profile);
    useEffect(() => { profileRef.current = profile; }, [profile]);

    // Initialization — check existing session
    useEffect(() => {
        const init = async () => {
            try {
                const session = await auth.getCurrentSession();
                if (session?.user) {
                    setUser(session.user);
                    try {
                        const response = await apiService.auth.getProfile();
                        setProfile(response.data.profile);
                    } catch {
                        await auth.signOut().catch(() => { });
                        setUser(null);
                        setProfile(null);
                    }
                }
            } catch {
                // No session
            } finally {
                setInitializing(false);
            }
        };
        init();
    }, []);

    // Auth state listener
    useEffect(() => {
        const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                return;
            }
            if (session?.user) {
                setUser(session.user);
                if (skipNextFetchRef.current) {
                    skipNextFetchRef.current = false;
                    return;
                }
                if (!profileRef.current) {
                    try {
                        const response = await apiService.auth.getProfile();
                        setProfile(response.data.profile);
                    } catch { }
                }
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    // Sign In — backend-validated with role
    const signIn = useCallback(async (email, password, role) => {
        setLoading(true);
        try {
            const response = await apiService.auth.login({ email, password, role });
            const { session, profile: profileData } = response.data;

            setProfile(profileData);
            skipNextFetchRef.current = true;

            await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
            });

            setLoading(false);
            return response.data;
        } catch (error) {
            setLoading(false);
            const msg = error?.response?.data?.error || error?.message || 'Login failed.';
            throw new Error(msg);
        }
    }, []);

    // Sign Up
    const signUp = useCallback(async (email, password, fullName, role, additionalData = {}) => {
        setLoading(true);
        try {
            const authData = await auth.signUp(email, password, {
                data: { full_name: fullName, role, ...additionalData },
            });

            if (authData.session) {
                try {
                    await apiService.auth.register({
                        supabaseUid: authData.user.id, email, fullName, role, ...additionalData,
                    });
                } catch (e) {
                    console.warn('Profile creation warning:', e?.message);
                }
            }

            return {
                user: authData.user,
                session: authData.session,
                needsEmailVerification: !authData.session,
            };
        } catch (error) {
            throw handleAuthError(error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Sign Out
    const signOut = useCallback(async () => {
        try { await auth.signOut(); } catch { }
        setUser(null);
        setProfile(null);
    }, []);

    // Google Sign In
    const signInWithGoogle = useCallback(async (idToken) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });
            if (error) throw error;

            setUser(data.user);
            skipNextFetchRef.current = true;

            // Try to fetch existing profile, or create one
            try {
                const response = await apiService.auth.getProfile();
                setProfile(response.data.profile);
            } catch {
                // New Google user — profile doesn't exist yet
                // Return info so the screen can route to sign-up step 2
                setLoading(false);
                return { isNewUser: true, user: data.user };
            }

            setLoading(false);
            return { isNewUser: false, user: data.user };
        } catch (error) {
            setLoading(false);
            throw new Error(error?.message || 'Google sign-in failed');
        }
    }, []);

    // Reset Password
    const resetPassword = useCallback(async (email) => {
        try { await auth.resetPassword(email); }
        catch (error) { throw handleAuthError(error); }
    }, []);

    const isAuthenticated = !!user && !!profile;
    const displayName = profile?.fullName || user?.user_metadata?.full_name || 'User';
    const userRole = profile?.role; // 'patient' or 'caller'/'caretaker'

    const value = {
        user, profile, loading, initializing,
        isAuthenticated, displayName, userRole, userEmail: user?.email,
        signIn, signUp, signOut, resetPassword, signInWithGoogle,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
