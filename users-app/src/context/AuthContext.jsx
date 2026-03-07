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
    const [isOnboarding, setIsOnboarding] = useState(false);

    const skipFetchCountRef = useRef(0);       // counter: how many auth events to skip
    const isOnboardingRef = useRef(false);      // ref mirror of isOnboarding for use inside listeners
    const profileRef = useRef(profile);
    useEffect(() => { profileRef.current = profile; }, [profile]);
    useEffect(() => { isOnboardingRef.current = isOnboarding; }, [isOnboarding]);

    // Initialization — check existing session
    useEffect(() => {
        const init = async () => {
            try {
                const session = await auth.getCurrentSession();
                if (session?.user) {
                    setUser(session.user);
                    try {
                        const response = await apiService.auth.getProfile();
                        const profileData = response.data.profile;
                        setProfile(profileData);

                        // If patient but NOT active subscription, they are in onboarding
                        if (profileData.role === 'patient' && profileData.subscription_status !== 'active') {
                            setIsOnboarding(true);
                            isOnboardingRef.current = true;
                        }
                    } catch (error) {
                        console.warn('Profile fetch failed, signing out:', error.message);
                        await signOut();
                    }
                }
            } catch (error) {
                console.warn('Auth initialization failed:', error.message);
                // If the error is about refresh tokens, we must clear the session
                if (error.message?.includes('Refresh Token')) {
                    await signOut();
                }
            } finally {
                setInitializing(false);
            }
        };
        init();
    }, [signOut]);

    // Auth state listener
    useEffect(() => {
        const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                setIsOnboarding(false);
                isOnboardingRef.current = false;
                return;
            }

            if (session?.user) {
                setUser(session.user);

                // During onboarding, we manage state directly — ignore automatic profile fetch
                if (isOnboardingRef.current) return;

                if (skipFetchCountRef.current > 0) {
                    skipFetchCountRef.current--;
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

            // Check if patient needs onboarding (not active subscription)
            if (profileData.role === 'patient' && profileData.subscription_status !== 'active') {
                setIsOnboarding(true);
                isOnboardingRef.current = true;
            }

            skipFetchCountRef.current = 2; // setSession can fire up to 2 events

            await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
            });

            setUser(session.user);
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
        setIsOnboarding(true);
        isOnboardingRef.current = true; // set ref immediately (don't wait for useEffect)
        try {
            // 1. Register with backend
            const registerRes = await apiService.auth.register({
                email, password, fullName, role, ...additionalData
            });

            // 2. Immediately login
            const loginRes = await apiService.auth.login({ email, password, role });
            const { session, profile: profileData } = loginRes.data;

            setUser(session.user);
            setProfile(profileData);

            const { error: sessionError } = await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token,
            });

            if (sessionError) {
                console.error("SetSession failed:", sessionError);
            }

            return {
                user: session.user,
                session: session,
                needsEmailVerification: false,
            };
        } catch (error) {
            const msg = error?.response?.data?.error || error?.message || 'Signup failed.';
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    // Sign Out
    const signOut = useCallback(async () => {
        try { await auth.signOut(); } catch { }
        setUser(null);
        setProfile(null);
        setIsOnboarding(false);
        isOnboardingRef.current = false;
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
            skipFetchCountRef.current = 2;

            // Try to fetch existing profile, or create one
            try {
                const response = await apiService.auth.getProfile();
                setProfile(response.data.profile);
            } catch {
                // New Google user — profile doesn't exist yet
                // Return info so the screen can route to sign-up step 2
                setLoading(false);
                setIsOnboarding(true);
                isOnboardingRef.current = true;
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

    const completeSignUp = useCallback(() => {
        setIsOnboarding(false);
        isOnboardingRef.current = false;
    }, []);

    const isAuthenticated = !!user && !!profile && !isOnboarding;
    const displayName = profile?.fullName || user?.user_metadata?.full_name || 'User';
    const userRole = profile?.role; // 'patient' or 'caller'/'caretaker'

    const value = {
        user, profile, loading, initializing,
        isAuthenticated, displayName, userRole, userEmail: user?.email,
        signIn, signUp, signOut, resetPassword, signInWithGoogle, completeSignUp
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
