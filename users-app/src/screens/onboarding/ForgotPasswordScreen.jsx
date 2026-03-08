import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable, Platform,
    KeyboardAvoidingView, ScrollView, Animated, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, Hash, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { apiService } from '../../lib/api';
import { colors } from '../../theme';

const SHOULD_USE_NATIVE_DRIVER = Platform.OS !== 'web';

export default function ForgotPasswordScreen({ navigation }) {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [resetToken, setResetToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Focus states
    const [emailFocused, setEmailFocused] = useState(false);
    const [otpFocused, setOtpFocused] = useState(false);
    const [passFocused, setPassFocused] = useState(false);
    const [confirmFocused, setConfirmFocused] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const fadeToStep = (nextStep) => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: SHOULD_USE_NATIVE_DRIVER }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: SHOULD_USE_NATIVE_DRIVER })
        ]).start();
        setTimeout(() => setStep(nextStep), 150);
    };

    // --- STEP 1: SEND OTP ---
    const handleSendOtp = async () => {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setErrorText('Please enter a valid email address.');
            return;
        }
        setLoading(true);
        setErrorText('');
        try {
            await apiService.auth.forgotPassword(email);
            fadeToStep(2);
        } catch (err) {
            setErrorText(err.response?.data?.error || 'Failed to send reset code.');
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: VERIFY OTP ---
    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            setErrorText('Please enter the 6-digit code.');
            return;
        }
        setLoading(true);
        setErrorText('');
        try {
            const res = await apiService.auth.verifyOtp(email, otp);
            setResetToken(res.data.resetToken);
            fadeToStep(3);
        } catch (err) {
            setErrorText(err.response?.data?.error || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 3: RESET PASSWORD ---
    const handleResetPassword = async () => {
        if (!newPassword || newPassword.length < 8) {
            setErrorText('Password must be at least 8 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorText('Passwords do not match.');
            return;
        }

        setLoading(true);
        setErrorText('');
        try {
            await apiService.auth.resetPasswordOtp(email, resetToken, newPassword);
            Alert.alert('Success', 'Your password has been reset! You can now log in.', [
                { text: 'Log In', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (err) {
            setErrorText(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setErrorText('');
            fadeToStep(step - 1);
        } else {
            navigation.goBack();
        }
    };

    const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <LinearGradient colors={['#0A2463', '#1E5FAD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={10}>
                    <ArrowLeft color="#fff" size={24} />
                </Pressable>
                <Text style={styles.headerTitle}>Reset Password</Text>
                <View style={{ width: 24 }} /> {/* Spacer */}
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                <Animated.View style={[styles.card, { opacity: fadeAnim }]}>

                    {/* Step Title Header */}
                    <View style={styles.stepHeader}>
                        <Text style={styles.stepTitle}>
                            {step === 1 ? 'Find Your Account' : step === 2 ? 'Enter Code' : 'Create New Password'}
                        </Text>
                        <Text style={styles.stepSubtitle}>
                            {step === 1 ? 'Enter the email associated with your account to receive a 6-digit verification code.' :
                                step === 2 ? `We sent a code to ${email}. Valid for 10 minutes.` :
                                    'Your new password must be at least 8 characters and include numbers and letters.'}
                        </Text>
                    </View>

                    {errorText ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={16} color={colors.danger} />
                            <Text style={styles.errorMsg}>{errorText}</Text>
                        </View>
                    ) : null}

                    {/* Form Fields Based on Step */}
                    <View style={styles.formArea}>
                        {step === 1 && (
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
                        )}

                        {step === 2 && (
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>6-Digit Code</Text>
                                <View style={[styles.inputWrap, otpFocused && styles.inputFocused]}>
                                    <Hash size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                                    <TextInput
                                        style={[styles.textInput, { letterSpacing: 4, fontWeight: '700' }]}
                                        placeholder="000000"
                                        placeholderTextColor="#CBD5E1"
                                        value={otp}
                                        onChangeText={(v) => setOtp(v.replace(/[^0-9]/g, '').slice(0, 6))}
                                        keyboardType="number-pad"
                                        onFocus={() => setOtpFocused(true)}
                                        onBlur={() => setOtpFocused(false)}
                                    />
                                </View>
                            </View>
                        )}

                        {step === 3 && (
                            <>
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>New Password</Text>
                                    <View style={[styles.inputWrap, passFocused && styles.inputFocused]}>
                                        <Lock size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Enter new password"
                                            placeholderTextColor="#94A3B8"
                                            value={newPassword}
                                            onChangeText={setNewPassword}
                                            secureTextEntry={!showPass}
                                            onFocus={() => setPassFocused(true)}
                                            onBlur={() => setPassFocused(false)}
                                        />
                                        <Pressable onPress={() => setShowPass(!showPass)} hitSlop={8}>
                                            {showPass ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />}
                                        </Pressable>
                                    </View>
                                </View>

                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Confirm New Password</Text>
                                    <View style={[styles.inputWrap, confirmFocused && styles.inputFocused]}>
                                        <Lock size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                                        <TextInput
                                            style={styles.textInput}
                                            placeholder="Re-enter new password"
                                            placeholderTextColor="#94A3B8"
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            secureTextEntry={!showConfirm}
                                            onFocus={() => setConfirmFocused(true)}
                                            onBlur={() => setConfirmFocused(false)}
                                        />
                                        <Pressable hitSlop={8}
                                            onPress={passwordsMatch ? undefined : () => setShowConfirm(!showConfirm)}
                                        >
                                            {passwordsMatch ? <CheckCircle2 size={18} color="#22C55E" /> :
                                                (showConfirm ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />)}
                                        </Pressable>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>

                    {/* Primary Button */}
                    <Pressable
                        style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
                        onPress={step === 1 ? handleSendOtp : step === 2 ? handleVerifyOtp : handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <Text style={styles.primaryBtnText}>  Processing...</Text>
                            </View>
                        ) : (
                            <Text style={styles.primaryBtnText}>
                                {step === 1 ? 'Send Reset Code' : step === 2 ? 'Verify Code' : 'Reset Password'}
                            </Text>
                        )}
                    </Pressable>

                    {step === 2 && !loading && (
                        <Pressable style={styles.resendBtn} onPress={handleSendOtp}>
                            <Text style={styles.resendText}>Didn't receive a code? Resend</Text>
                        </Pressable>
                    )}

                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FB' },
    header: {
        height: 120,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backBtn: { padding: 8, marginLeft: -8 },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
    scrollContent: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        shadowColor: 'rgba(10,36,99,0.08)',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 4,
    },
    stepHeader: { marginBottom: 24 },
    stepTitle: { fontSize: 24, fontWeight: '700', color: '#1A202C', marginBottom: 8 },
    stepSubtitle: { fontSize: 14, color: '#64748B', lineHeight: 22 },

    errorBox: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#FEE2E2', borderRadius: 10, padding: 12, marginBottom: 24,
    },
    errorMsg: { color: colors.danger, fontSize: 13, flex: 1 },

    formArea: { marginBottom: 12 },
    fieldGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5, borderColor: '#E2E8F0',
        borderRadius: 12, height: 52,
        paddingHorizontal: 14,
    },
    inputFocused: { borderColor: '#3A86FF', backgroundColor: '#fff', shadowColor: '#3A86FF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
    textInput: { flex: 1, fontSize: 15, color: '#1A202C' },

    primaryBtn: {
        backgroundColor: '#3A86FF', borderRadius: 12, height: 52,
        alignItems: 'center', justifyContent: 'center', marginTop: 8,
        shadowColor: 'rgba(58,134,255,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
    },
    primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    loadingRow: { flexDirection: 'row', alignItems: 'center' },

    resendBtn: { marginTop: 24, alignItems: 'center' },
    resendText: { color: '#3A86FF', fontSize: 14, fontWeight: '600' },
});
