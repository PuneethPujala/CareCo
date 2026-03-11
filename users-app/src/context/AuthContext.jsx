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

    // Sign Out
    const signOut = useCallback(async () => {
        try { await auth.signOut(); } catch { }
        setUser(null);
        setProfile(null);
        setIsOnboarding(false);
        isOnboardingRef.current = false;
    }, []);

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

                        // If patient but NOT active subscription, they abandoned onboarding
                        if (profileData.role === 'patient' && profileData.subscription_status !== 'active') {
                            console.warn('User abandoned onboarding. Signing out to force fresh login.');
                            await signOut();
                            return;
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
                // During managed flows (signInWithGoogle, signUp), skip entirely
                // The managed flow will handle setting user/profile state itself
                if (skipFetchCountRef.current > 0) {
                    skipFetchCountRef.current--;
                    return;
                }

                // During onboarding, we manage state directly
                if (isOnboardingRef.current) {
                    setUser(session.user);
                    return;
                }

                setUser(session.user);

                if (!profileRef.current) {
                    try {
                        const response = await apiService.auth.getProfile();
                        const profileData = response.data.profile;

                        // Reject abandoned onboarding in the background listener as well
                        if (profileData.role === 'patient' && profileData.subscription_status !== 'active') {
                            console.warn('Listener: User abandoned onboarding. Forcing fresh login.');
                            await signOut();
                            return;
                        }

                        setProfile(profileData);
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



    // Google Sign In
    const signInWithGoogle = useCallback(async (idToken) => {
        setLoading(true);
        try {
            // Set skip BEFORE signInWithIdToken to prevent auth listener from racing
            skipFetchCountRef.current = 2;

            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });
            if (error) throw error;

            // DON'T call setUser yet — wait until we know the profile status
            // The auth listener will also skip due to skipFetchCountRef

            // Try to fetch existing profile
            try {
                // Pass token directly to avoid race condition with axios interceptor reading from storage
                const config = {
                    headers: { Authorization: `Bearer ${data.session.access_token}` }
                };
                const response = await apiService.auth.getProfile(config);
                const profileData = response.data.profile;

                // Profile found — set both profile and user together
                setProfile(profileData);

                if (profileData.role === 'patient' && profileData.subscription_status !== 'active') {
                    console.warn('Google User abandoned onboarding. Forcing fresh login.');
                    await signOut();
                    setLoading(false);
                    return { isNewUser: false, user: null, session: null, error: 'Registration incomplete. Please log in to continue.' };
                }

                // NOW set user — AppNavigator will see user+profile together
                setUser(data.user);
            } catch {
                // No backend profile — this Google account is not registered yet
                // DON'T set user state — let the calling screen handle it
                setLoading(false);
                return { isNewUser: true, user: data.user, session: data.session };
            }

            setLoading(false);
            return { isNewUser: false, user: data.user, session: data.session };
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

    // Inject state manually after a new Google Signup from the signup screen
    const injectSession = useCallback(async (newSession, newProfile) => {
        setProfile(newProfile);

        if (newProfile.role === 'patient' && newProfile.subscription_status !== 'active') {
            setIsOnboarding(true);
            isOnboardingRef.current = true;
        }

        // Ensure supabase has it locally
        await supabase.auth.setSession({
            access_token: newSession.access_token,
            refresh_token: newSession.refresh_token,
        });

        setUser(newSession.user);
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
        signIn, signUp, signOut, resetPassword, signInWithGoogle, completeSignUp, injectSession
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
