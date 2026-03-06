import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable, Platform,
    KeyboardAvoidingView, ScrollView, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, HeartPulse, AlertCircle } from 'lucide-react-native';
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
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>

                {/* Hero Section */}
                <Animated.View style={{ transform: [{ translateY: heroAnim }], opacity: heroOpacity }}>
                    <LinearGradient colors={['#0A2463', '#1E5FAD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
                        <View style={styles.decorativeCircle} />

                        <Text style={styles.logoText}>CareCo</Text>

                        <View style={styles.heroIconWrap}>
                            <HeartPulse size={56} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
                        </View>

                        <Text style={styles.heroTitle}>Welcome Back</Text>
                        <Text style={styles.heroSubtitle}>Log in to your care dashboard</Text>
                    </LinearGradient>
                </Animated.View>

                {/* Form Card */}
                <Animated.View style={[styles.formCard, { transform: [{ translateY: cardAnim }], opacity: cardOpacity }]}>

                    {/* Google Login */}
                    <Pressable style={styles.googleBtn} onPress={() => promptAsync()} disabled={!request || loading}>
                        <Text style={styles.googleG}>G</Text>
                        <Text style={styles.googleBtnText}>Continue with Google</Text>
                    </Pressable>

                    {/* Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>or continue with email</Text>
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
                        <View style={[styles.inputWrap, emailFocused && styles.inputFocused]}>
                            <Mail size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="name@example.com"
                                placeholderTextColor="#94A3B8"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onFocus={() => setEmailFocused(true)}
                                onBlur={() => setEmailFocused(false)}
                            />
                        </View>
                    </View>

                    {/* Password Field */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.inputWrap, passFocused && styles.inputFocused]}>
                            <Lock size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter password"
                                placeholderTextColor="#94A3B8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                onFocus={() => setPassFocused(true)}
                                onBlur={() => setPassFocused(false)}
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                                {showPassword ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />}
                            </Pressable>
                        </View>
                    </View>

                    {/* Forgot Password */}
                    <Pressable style={styles.forgotRow} onPress={handleForgotPassword}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </Pressable>

                    {/* Login Button */}
                    <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
                        {loading ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={styles.primaryBtnText}>  Logging in...</Text>
                            </View>
                        ) : (
                            <Text style={styles.primaryBtnText}>Log In</Text>
                        )}
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
    container: { flex: 1, backgroundColor: '#F4F7FB' },

    // ─── Hero ─────────────────────────
    hero: {
        height: 260,
        borderBottomLeftRadius: 36,
        borderBottomRightRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 60 : 44,
        overflow: 'hidden',
    },
    decorativeCircle: {
        position: 'absolute', top: -35, right: -35,
        width: 140, height: 140, borderRadius: 70,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    logoText: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1, marginBottom: 16 },
    heroIconWrap: { marginBottom: 12 },
    heroTitle: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
    heroSubtitle: { fontSize: 14, fontWeight: '400', color: '#BDD4EE' },

    // ─── Form Card ────────────────────
    formCard: {
        marginTop: -24,
        marginHorizontal: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 32,
        shadowColor: 'rgba(10,36,99,0.12)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 24,
        elevation: 8,
    },

    // ─── Google ───────────────────────
    googleBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5, borderColor: '#BDD4EE',
        borderRadius: 12, height: 48,
        marginBottom: 20,
        shadowColor: 'rgba(0,0,0,0.08)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2,
    },
    googleG: { fontSize: 20, fontWeight: '700', color: '#4285F4', marginRight: 10 },
    googleBtnText: { fontSize: 15, fontWeight: '600', color: '#1A202C' },

    // ─── Divider ──────────────────────
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    dividerText: { marginHorizontal: 12, fontSize: 12, color: '#94A3B8' },

    // ─── Error ────────────────────────
    errorBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 16,
    },
    errorMsg: { color: colors.danger, fontSize: 13, flex: 1 },

    // ─── Fields ───────────────────────
    fieldGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#4A5568', marginBottom: 6 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F4F7FB',
        borderWidth: 1.5, borderColor: '#BDD4EE',
        borderRadius: 12, height: 52,
        paddingHorizontal: 14,
    },
    inputFocused: { borderColor: '#3A86FF', backgroundColor: '#FFFFFF' },
    textInput: { flex: 1, fontSize: 15, color: '#1A202C' },

    // ─── Forgot ───────────────────────
    forgotRow: { alignSelf: 'flex-end', marginTop: -8, marginBottom: 20 },
    forgotText: { fontSize: 13, fontWeight: '600', color: '#3A86FF' },

    // ─── Primary Button ───────────────
    primaryBtn: {
        backgroundColor: '#3A86FF', borderRadius: 12, height: 52,
        alignItems: 'center', justifyContent: 'center', marginTop: 8,
        shadowColor: 'rgba(58,134,255,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
    },
    primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    loadingRow: { flexDirection: 'row', alignItems: 'center' },

    // ─── Bottom Link ──────────────────
    bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    bottomLinkText: { fontSize: 14, color: '#64748B' },
    bottomLinkAction: { fontSize: 14, fontWeight: '600', color: '#3A86FF' },
});
