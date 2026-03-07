import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable, Platform,
    KeyboardAvoidingView, ScrollView, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, HeartPulse, AlertCircle, Smartphone, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({ navigation }) {
    const { signIn, signInWithGoogle, resetPassword } = useAuth();

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        prompt: 'select_account',
    });

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [emailFocused, setEmailFocused] = useState(false);
    const [passFocused, setPassFocused] = useState(false);

    // Refs for programmatic focus
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    // Animations
    const heroAnim = useRef(new Animated.Value(-10)).current;
    const heroOpacity = useRef(new Animated.Value(0)).current;
    const cardAnim = useRef(new Animated.Value(20)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(heroAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(heroOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(cardAnim, { toValue: 0, duration: 350, delay: 100, useNativeDriver: true }),
            Animated.timing(cardOpacity, { toValue: 1, duration: 350, delay: 100, useNativeDriver: true }),
        ]).start();
    }, []);

    // Handle Google OAuth response
    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleSignIn(id_token);
        }
    }, [response]);

    const handleGoogleSignIn = async (idToken) => {
        try {
            setLoading(true);
            setErrorText('');
            const result = await signInWithGoogle(idToken);
            if (result?.isNewUser) {
                navigation.navigate('GoogleOnboarding');
            }
        } catch (error) {
            setErrorText(error.message || 'Google sign-in failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setErrorText('Please enter both email and password.');
            return;
        }
        setLoading(true);
        setErrorText('');
        try {
            await signIn(email, password, 'patient');
        } catch (error) {
            setErrorText(error?.message || 'Login failed. Please try again.');
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const resetEmail = email.trim();
        if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
            Alert.alert('Enter Your Email', 'Please enter a valid email address in the email field above, then tap Forgot Password again.');
            return;
        }
        try {
            setLoading(true);
            await resetPassword(resetEmail);
            Alert.alert('Check Your Email', `We've sent a password reset link to ${resetEmail}. Please check your inbox.`);
        } catch (error) {
            Alert.alert('Reset Failed', error?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: Platform.OS === 'ios' ? 100 : 150 }}
                keyboardShouldPersistTaps="handled"
                bounces={false}
                showsVerticalScrollIndicator={false}
            >

                {/* Hero Section */}
                <Animated.View style={{ transform: [{ translateY: heroAnim }], opacity: heroOpacity }}>
                    <LinearGradient
                        colors={['#0A2463', '#3A86FF']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.hero}
                    >
                        <View style={styles.decorativeCircle1} />
                        <View style={styles.decorativeCircle2} />

                        <View style={styles.heroIconWrap}>
                            <HeartPulse size={48} color="#FFFFFF" strokeWidth={1.5} />
                        </View>
                        <Text style={styles.heroTitle}>Welcome Back</Text>
                        <Text style={styles.heroSubtitle}>Your health journey continues here</Text>
                    </LinearGradient>
                </Animated.View>

                {/* Form Card */}
                <Animated.View style={[styles.formCard, { transform: [{ translateY: cardAnim }], opacity: cardOpacity }]}>

                    {/* Social/Alt Logins */}
                    <View style={styles.socialRowPremium}>
                        <Pressable style={styles.socialBtnPremium} onPress={() => promptAsync()} disabled={!request || loading}>
                            <Text style={styles.googleG}>G</Text>
                            <Text style={styles.socialBtnTextPremium}>Google</Text>
                        </Pressable>
                        <Pressable style={styles.socialBtnPremium} onPress={() => { }} disabled={loading}>
                            <Smartphone size={20} color="#64748B" />
                            <Text style={styles.socialBtnTextPremium}>Mobile</Text>
                        </Pressable>
                    </View>

                    {/* Divider */}
                    <View style={styles.dividerRowPremium}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR LOGIN WITH EMAIL</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Error */}
                    {errorText ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={16} color={colors.danger} />
                            <Text style={styles.errorMsg}>{errorText}</Text>
                        </View>
                    ) : null}

                    {/* Email Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <Pressable
                            style={[styles.inputWrap, emailFocused && styles.inputFocused]}
                            onPress={() => emailRef.current?.focus()}
                        >
                            <Mail size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                            <TextInput
                                ref={emailRef}
                                style={styles.textInput}
                                placeholder="name@example.com"
                                placeholderTextColor="#94A3B8"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                                blurOnSubmit={false}
                            />
                        </Pressable>
                    </View>

                    {/* Password Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password</Text>
                        <Pressable
                            style={[styles.inputWrap, passFocused && styles.inputFocused]}
                            onPress={() => passwordRef.current?.focus()}
                        >
                            <Lock size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                            <TextInput
                                ref={passwordRef}
                                style={styles.textInput}
                                placeholder="Enter password"
                                placeholderTextColor="#94A3B8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onFocus={() => setPassFocused(true)}
                                onBlur={() => setPassFocused(false)}
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={12}>
                                {showPassword ? <Eye size={18} color="#3A86FF" /> : <EyeOff size={18} color="#94A3B8" />}
                            </Pressable>
                        </Pressable>
                    </View>

                    {/* Forgot Password */}
                    <Pressable style={styles.forgotRow} onPress={handleForgotPassword}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </Pressable>

                    {/* Login Button */}
                    <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
                        <LinearGradient
                            colors={['#3A86FF', '#1E5FAD']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.primaryBtnGradient}
                        >
                            {loading ? (
                                <View style={styles.loadingRow}>
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                    <Text style={styles.primaryBtnText}>  Verifying...</Text>
                                </View>
                            ) : (
                                <>
                                    <Text style={styles.primaryBtnText}>Sign In to Dashboard</Text>
                                    <ChevronRight size={20} color="#FFFFFF" />
                                </>
                            )}
                        </LinearGradient>
                    </Pressable>

                    {/* Sign Up Link */}
                    <View style={styles.bottomLink}>
                        <Text style={styles.bottomLinkText}>Don't have an account?  </Text>
                        <Pressable onPress={() => navigation.navigate('PatientSignup')}>
                            <Text style={styles.bottomLinkAction}>Sign Up</Text>
                        </Pressable>
                    </View>

                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },

    // ─── Hero Section ────────────────
    hero: {
        height: 280,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        overflow: 'hidden',
    },
    decorativeCircle1: {
        position: 'absolute', top: -50, right: -50,
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    decorativeCircle2: {
        position: 'absolute', bottom: -30, left: -40,
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    heroIconWrap: {
        width: 80, height: 80, borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    },
    heroTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
    heroSubtitle: { fontSize: 15, fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginTop: 4 },

    // ─── Form Card Overlay ───────────
    formCard: {
        marginTop: -30,
        marginHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 30,
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 1,
        shadowRadius: 30,
        elevation: 10,
        marginBottom: 40,
        zIndex: 5, // Ensure it's above hero for touches
    },

    socialRowPremium: { flexDirection: 'row', gap: 16, marginBottom: 32 },
    socialBtnPremium: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1, borderColor: '#E2E8F0',
        borderRadius: 18, height: 60, gap: 12
    },
    socialBtnTextPremium: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
    googleG: { fontSize: 20, fontWeight: '800', color: '#4285F4' },

    dividerRowPremium: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingHorizontal: 10 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    dividerText: { marginHorizontal: 16, fontSize: 11, color: '#94A3B8', fontWeight: '800', letterSpacing: 1.5 },

    // ─── Fields ──────────────────────
    fieldGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 10, marginLeft: 2 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5, borderColor: '#F1F5F9',
        borderRadius: 18, height: 64,
        paddingHorizontal: 20,
    },
    inputFocused: { borderColor: '#3A86FF', shadowColor: '#3A86FF', shadowOpacity: 0.05, shadowRadius: 15, elevation: 4 },
    textInput: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '600' },

    errorBox: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 24,
        borderWidth: 1, borderColor: '#FEE2E2'
    },
    errorMsg: { color: '#DC2626', fontSize: 14, fontWeight: '600', flex: 1 },

    forgotRow: { alignSelf: 'flex-end', marginTop: -10, marginBottom: 32 },
    forgotText: { fontSize: 14, fontWeight: '700', color: '#3A86FF' },

    primaryBtn: {
        borderRadius: 20, height: 68,
        overflow: 'hidden',
        shadowColor: '#3A86FF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 8,
    },
    primaryBtnGradient: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12
    },
    primaryBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    loadingRow: { flexDirection: 'row', alignItems: 'center' },

    bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 40, paddingBottom: 20 },
    bottomLinkText: { fontSize: 15, color: '#94A3B8', fontWeight: '500' },
    bottomLinkAction: { fontSize: 15, fontWeight: '800', color: '#3A86FF' },
});
