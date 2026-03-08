import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase, auth, handleAuthError } from "../lib/supabase";
import {
  apiService,
  handleApiError,
  setApiAccessToken,
  clearApiAccessToken,
} from "../lib/api";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const skipFetchCountRef = useRef(0); // counter: how many auth events to skip
  const isOnboardingRef = useRef(false); // ref mirror of isOnboarding for use inside listeners
  const profileRef = useRef(profile);
  const onboardingProfileRef = useRef(null);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);
  useEffect(() => {
    isOnboardingRef.current = isOnboarding;
  }, [isOnboarding]);

  // Initialization — check existing session
  useEffect(() => {
    const init = async () => {
      try {
        const session = await auth.getCurrentSession();
        if (session?.user) {
          setApiAccessToken(session.access_token);
          setUser(session.user);
          try {
            const response = await apiService.auth.getProfile();
            onboardingProfileRef.current = response.data.profile;
            setProfile(response.data.profile);
          } catch {
            await auth.signOut().catch(() => {});
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
    const {
      data: { subscription },
    } = auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        clearApiAccessToken();
        setUser(null);
        setProfile(null);
        return;
      }

      // During onboarding, signUp() manages state directly — ignore all auth events
      if (isOnboardingRef.current) return;

      if (session?.user) {
        setApiAccessToken(session.access_token);
        setUser(session.user);
        if (skipFetchCountRef.current > 0) {
          skipFetchCountRef.current--;
          return;
        }
        if (!profileRef.current) {
          try {
            const response = await apiService.auth.getProfile();
            onboardingProfileRef.current = response.data.profile;
            setProfile(response.data.profile);
          } catch {}
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

      setApiAccessToken(session.access_token);
      onboardingProfileRef.current = profileData;
      setProfile(profileData);
      skipFetchCountRef.current = 2; // setSession can fire up to 2 events

      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      setLoading(false);
      return response.data;
    } catch (error) {
      setLoading(false);
      const msg =
        error?.response?.data?.error || error?.message || "Login failed.";
      throw new Error(msg);
    }
  }, []);

  // Sign Up
  const signUp = useCallback(
    async (email, password, fullName, role, additionalData = {}) => {
      setLoading(true);
      setIsOnboarding(true);
      isOnboardingRef.current = true; // set ref immediately (don't wait for useEffect)
      try {
        // 1. Register with backend (creates Supabase Admin user + MongoDB Profile + Patient)
        const registerRes = await apiService.auth.register({
          email,
          password,
          fullName,
          role,
          ...additionalData,
        });

        // 2. Immediately login to get the active session
        const loginRes = await apiService.auth.login({ email, password, role });
        const { session, profile: profileData } = loginRes.data;

        setApiAccessToken(session.access_token);
        setUser(session.user);
        onboardingProfileRef.current = profileData;
        setProfile(profileData);

        // 3. Set session in Supabase and wait for persistence
        // On web, Supabase stores session in localStorage - we need to ensure it's actually saved
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        if (sessionError) {
          console.warn('Session setup error:', sessionError?.message);
        }

        // 4. Verify the session with retry - ensures the persisted token belongs to this user
        let verified = false;
        for (let attempt = 0; attempt < 4; attempt++) {
          try {
            const { data: { session: verifiedSession } } = await supabase.auth.getSession();
            if (
              verifiedSession?.access_token &&
              verifiedSession?.user?.id === session.user.id
            ) {
              verified = true;
              break;
            }
          } catch (e) {
            console.log(`Session verification attempt ${attempt + 1} failed:`, e?.message);
          }
          
          if (attempt < 3) {
            // Wait before retrying
            await new Promise(res => setTimeout(res, 200 * (attempt + 1)));
          }
        }

        if (!verified) {
          console.warn('Session verification failed after 4 attempts - proceeding anyway');
        }

        return {
          user: session.user,
          session: session,
          profile: profileData,
          needsEmailVerification: false,
        };
      } catch (error) {
        const msg =
          error?.response?.data?.error || error?.message || "Signup failed.";
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
    } catch {}
    clearApiAccessToken();
    onboardingProfileRef.current = null;
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
        provider: "google",
        token: idToken,
      });
      if (error) throw error;

      setApiAccessToken(data.session?.access_token);
      setUser(data.user);
      skipFetchCountRef.current = 2;

      // Ensure session is persisted (similar to signUp flow)
      // Wait briefly for session to be stored
      await new Promise(res => setTimeout(res, 300));

      // Try to fetch existing profile, or create one
      try {
        const response = await apiService.auth.getProfile();
        onboardingProfileRef.current = response.data.profile;
        setProfile(response.data.profile);
        setLoading(false);
        return { isNewUser: false, user: data.user };
      } catch (err) {
        // New Google user — profile doesn't exist yet
        // Return info so the screen can route to sign-up step 2
        setLoading(false);
        setIsOnboarding(true);
        isOnboardingRef.current = true;
        return { isNewUser: true, user: data.user };
      }
    } catch (error) {
      setLoading(false);
      console.error('Google sign-in error:', error?.message);
      throw new Error(error?.message || "Google sign-in failed");
    }
  }, []);

  // Reset Password
  const resetPassword = useCallback(async (email) => {
    try {
      await auth.resetPassword(email);
    } catch (error) {
      throw handleAuthError(error);
    }
  }, []);

  const completeSignUp = useCallback(async (authSnapshot = null) => {
    try {
      if (authSnapshot?.session?.access_token) {
        setApiAccessToken(authSnapshot.session.access_token);
      }

      if (authSnapshot?.user) {
        setUser(authSnapshot.user);
      }

      if (authSnapshot?.profile) {
        onboardingProfileRef.current = authSnapshot.profile;
      }

      // The email signup flow already has profile data from /auth/login.
      // Avoid another /auth/me round-trip unless profile is actually missing.
      const cachedProfile =
        authSnapshot?.profile || profileRef.current || onboardingProfileRef.current;
      if (cachedProfile) {
        setProfile(cachedProfile);
        setIsOnboarding(false);
        isOnboardingRef.current = false;
        return;
      }

      // Fallback: If profile is missing, ensure we have a valid token before fetching
      let token = authSnapshot?.session?.access_token;
      
      // If no token in snapshot, try getting it from Supabase (but don't block on this)
      if (!token) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.access_token) {
            token = session.access_token;
            setApiAccessToken(token);
          }
        } catch (e) {
          console.warn('Could not retrieve token from Supabase:', e?.message);
        }
      }

      // Only try to fetch if we have a token
      if (token) {
        try {
          const response = await apiService.auth.getProfile();
          onboardingProfileRef.current = response.data.profile;
          setProfile(response.data.profile);
        } catch (err) {
          console.warn('Profile fetch in completeSignUp failed:', err?.message);
          // Continue anyway - we'll just not have the profile detail but can still access dashboard
        }
      }

      setIsOnboarding(false);
      isOnboardingRef.current = false;
    } catch (error) {
      console.error('completeSignUp error:', error?.message);
      // Even if there's an error, complete onboarding so user can access dashboard
      setIsOnboarding(false);
      isOnboardingRef.current = false;
    }
  }, []);

  const completeGoogleSignUp = useCallback(
    async (role, city) => {
      setLoading(true);
      try {
        if (!user) throw new Error("No active user session");
        const fullName =
          user.user_metadata?.full_name || user.email.split("@")[0];

        // Try to create the MongoDB profile
        try {
          await apiService.auth.register({
            email: user.email,
            fullName,
            role,
            city,
            supabaseUid: user.id,
          });
        } catch (err) {
          // Ignore register errors here (e.g. if the user profile already exists due to a previous click)
          console.log(
            "Registration step error (might already exist):",
            err?.message,
          );
        }

        // Try 4 times to fetch the profile with increasing wait times
        // This ensures the MongoDB profile is replicated/available
        let response = null;
        for (let i = 0; i < 4; i++) {
          try {
            response = await apiService.auth.getProfile();
            if (response?.data?.profile) break;
          } catch (err) {
            if (i === 3) throw err;
            // Wait progressively longer on each retry
            await new Promise((res) => setTimeout(res, 300 * (i + 1)));
          }
        }

        if (!response?.data?.profile) {
          throw new Error('Failed to fetch profile after registration');
        }

  onboardingProfileRef.current = response.data.profile;
  setProfile(response.data.profile);

        setIsOnboarding(false);
        isOnboardingRef.current = false;
      } catch (error) {
        console.warn("completeGoogleSignUp error:", error);
        setLoading(false);
        throw new Error(
          error?.response?.data?.error ||
            error?.message ||
            "Failed to finish sign up. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const resolvedProfile = profile || onboardingProfileRef.current;
  const isAuthenticated = !!user && !!resolvedProfile && !isOnboarding;
  const displayName =
    resolvedProfile?.fullName || user?.user_metadata?.full_name || "User";
  const userRole = resolvedProfile?.role; // 'patient' or 'caller'/'caretaker'

  const value = {
    user,
    profile,
    loading,
    initializing,
    isAuthenticated,
    displayName,
    userRole,
    userEmail: user?.email,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    completeSignUp,
    completeGoogleSignUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
