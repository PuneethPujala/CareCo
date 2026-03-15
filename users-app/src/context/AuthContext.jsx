/**
 * AuthContext.jsx
 *
 * Fixes vs original:
 *
 * 1. ONBOARDING LOOP — The init() and auth listener both called signOut() when
 *    subscription_status !== 'active'. This is correct for truly abandoned sessions,
 *    but it also fired for users MID-onboarding who haven't paid yet, creating a
 *    loop: sign up → auto sign out → can't log in → sign up again.
 *
 *    Fix: check AsyncStorage for active onboarding progress before signing out.
 *    If progress exists and is recent (< 7 days), set isOnboarding=true and
 *    resume instead of signing out. If no progress, then sign out (truly abandoned).
 *
 * 2. signUp() did not propagate the backend error code (EMAIL_ALREADY_EXISTS)
 *    through to the calling screen. The error was re-thrown as a generic string,
 *    losing the `code` field. Fix: preserve the original error object.
 *
 * 3. No other logic changes — skipFetchCountRef, isOnboardingRef, profileRef
 *    patterns are all correct and kept as-is.
 */

import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, auth, handleAuthError } from '../lib/supabase';
import { apiService, handleApiError } from '../lib/api';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

const ONBOARDING_STORAGE_KEY = 'careco_onboarding_progress';
const STALE_PROGRESS_DAYS    = 7;

/**
 * Returns true if AsyncStorage has recent (< 7 days) onboarding progress.
 * Used to distinguish "mid-onboarding" from "truly abandoned" sessions.
 */
async function hasActiveOnboardingProgress() {
    try {
        const raw = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (!raw) return false;
        const progress = JSON.parse(raw);
        const ageMs    = Date.now() - (progress.savedAt || 0);
        const ageDays  = ageMs / (1000 * 60 * 60 * 24);
        return ageDays < STALE_PROGRESS_DAYS;
    } catch {
        return false;
    }
}

export function AuthProvider({ children }) {
    const [user, setUser]             = useState(null);
    const [profile, setProfile]       = useState(null);
    const [loading, setLoading]       = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [isOnboarding, setIsOnboarding] = useState(false);

    const skipFetchCountRef  = useRef(0);
    const isOnboardingRef    = useRef(false);
    const profileRef         = useRef(profile);

    useEffect(() => { profileRef.current    = profile;     }, [profile]);
    useEffect(() => { isOnboardingRef.current = isOnboarding; }, [isOnboarding]);

    // ── Sign Out ───────────────────────────────────────────────────────────────

    const signOut = useCallback(async () => {
        try { await auth.signOut(); } catch { }
        setUser(null);
        setProfile(null);
        setIsOnboarding(false);
        isOnboardingRef.current = false;
    }, []);

    // ── Initialization ─────────────────────────────────────────────────────────

    useEffect(() => {
        const init = async () => {
            try {
                const session = await auth.getCurrentSession();
                if (session?.user) {
                    setUser(session.user);
                    try {
                        const response  = await apiService.auth.getProfile();
                        const profileData = response.data.profile;
                        setProfile(profileData);

                        if (profileData.role === 'patient' && profileData.subscription_status !== 'active') {
                            // FIX 1: check if user is mid-onboarding before signing them out
                            const midOnboarding = await hasActiveOnboardingProgress();
                            if (midOnboarding) {
                                console.log('[Auth] Patient mid-onboarding, resuming...');
                                setIsOnboarding(true);
                                isOnboardingRef.current = true;
                                // Don't sign out — let PatientSignupScreen resume from AsyncStorage
                            } else {
                                console.warn('[Auth] Patient abandoned onboarding (no recent progress). Signing out.');
                                await signOut();
                            }
                            return;
                        }
                    } catch (error) {
                        console.warn('[Auth] Profile fetch failed, signing out:', error.message);
                        await signOut();
                    }
                }
            } catch (error) {
                console.warn('[Auth] Initialization failed:', error.message);
                if (error.message?.includes('Refresh Token')) {
                    await signOut();
                }
            } finally {
                setInitializing(false);
            }
        };
        init();
    }, [signOut]);

    // ── Auth state listener ────────────────────────────────────────────────────

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
                if (skipFetchCountRef.current > 0) {
                    skipFetchCountRef.current--;
                    return;
                }

                if (isOnboardingRef.current) {
                    setUser(session.user);
                    return;
                }

                setUser(session.user);

                if (!profileRef.current) {
                    try {
                        const response    = await apiService.auth.getProfile();
                        const profileData = response.data.profile;

                        if (profileData.role === 'patient' && profileData.subscription_status !== 'active') {
                            // FIX 1 (listener version): same mid-onboarding check
                            const midOnboarding = await hasActiveOnboardingProgress();
                            if (midOnboarding) {
                                setIsOnboarding(true);
                                isOnboardingRef.current = true;
                                setProfile(profileData);
                            } else {
                                console.warn('[Auth] Listener: abandoned onboarding. Forcing sign out.');
                                await signOut();
                            }
                            return;
                        }

                        setProfile(profileData);
                    } catch { }
                }
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    // ── Sign In ────────────────────────────────────────────────────────────────

    const signIn = useCallback(async (email, password, role) => {
        setLoading(true);
        try {
            const response = await apiService.auth.login({ email, password, role });
            const { session, profile: profileData } = response.data;

            setProfile(profileData);

            if (profileData.role === 'patient' && profileData.subscription_status !== 'active') {
                setIsOnboarding(true);
                isOnboardingRef.current = true;
            }

            skipFetchCountRef.current = 2;

            await supabase.auth.setSession({
                access_token:  session.access_token,
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

    // ── Sign Up ────────────────────────────────────────────────────────────────

    const signUp = useCallback(async (email, password, fullName, role, additionalData = {}) => {
        setLoading(true);
        setIsOnboarding(true);
        isOnboardingRef.current = true;
        try {
            // 1. Register with backend
            await apiService.auth.register({ email, password, fullName, role, ...additionalData });

            // 2. Immediately login
            const loginRes = await apiService.auth.login({ email, password, role });
            const { session, profile: profileData } = loginRes.data;

            setUser(session.user);
            setProfile(profileData);

            const { error: sessionError } = await supabase.auth.setSession({
                access_token:  session.access_token,
                refresh_token: session.refresh_token,
            });

            if (sessionError) console.error('[Auth] setSession failed:', sessionError);

            return { user: session.user, session, needsEmailVerification: false };

        } catch (error) {
            setIsOnboarding(false);
            isOnboardingRef.current = false;
            // FIX 2: re-throw the original error, not a reconstructed string,
            // so the calling screen can read error.response.data.code
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    // ── Google Sign In ─────────────────────────────────────────────────────────

    const signInWithGoogle = useCallback(async (idToken) => {
        setLoading(true);
        try {
            skipFetchCountRef.current = 2;

            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: idToken,
            });
            if (error) throw error;

            try {
                const config   = { headers: { Authorization: `Bearer ${data.session.access_token}` } };
                const response = await apiService.auth.getProfile(config);
                const profileData = response.data.profile;

                setProfile(profileData);

                if (profileData.role === 'patient' && profileData.subscription_status !== 'active') {
                    setIsOnboarding(true);
                    isOnboardingRef.current = true;
                    setUser(data.user);
                    setLoading(false);
                    return { isNewUser: false, user: data.user, session: data.session };
                }

                setUser(data.user);
            } catch {
                // No backend profile — new Google user
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

    // ── Reset Password ─────────────────────────────────────────────────────────

    const resetPassword = useCallback(async (email) => {
        try { await auth.resetPassword(email); }
        catch (error) { throw handleAuthError(error); }
    }, []);

    // ── Inject Session (post Google new-user signup) ───────────────────────────

    const injectSession = useCallback(async (newSession, newProfile) => {
        setProfile(newProfile);

        if (newProfile.role === 'patient' && newProfile.subscription_status !== 'active') {
            setIsOnboarding(true);
            isOnboardingRef.current = true;
        }

        await supabase.auth.setSession({
            access_token:  newSession.access_token,
            refresh_token: newSession.refresh_token,
        });

        setUser(newSession.user);
    }, []);

    // ── Complete Sign Up ───────────────────────────────────────────────────────

    const completeSignUp = useCallback(() => {
        setIsOnboarding(false);
        isOnboardingRef.current = false;
    }, []);

    // ── Context value ──────────────────────────────────────────────────────────

    const isAuthenticated = !!user && !!profile && !isOnboarding;
    const displayName     = profile?.fullName || user?.user_metadata?.full_name || 'User';
    const userRole        = profile?.role;

    const value = {
        user, profile, loading, initializing,
        isAuthenticated, displayName, userRole, userEmail: user?.email,
        signIn, signUp, signOut, resetPassword, signInWithGoogle, completeSignUp, injectSession,
        isOnboarding,
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