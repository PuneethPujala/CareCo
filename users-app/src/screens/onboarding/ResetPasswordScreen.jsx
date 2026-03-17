/**
 * ResetPasswordScreen.jsx — §7 FIX
 *
 * Handles the PASSWORD_RECOVERY deep link from Supabase.
 * User enters new password → calls auth.updatePassword() → navigates to Login.
 */

import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable, Platform,
    KeyboardAvoidingView, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react-native';
import { auth } from '../../lib/supabase';
import { parseError } from '../../utils/parseError';
import analytics from '../../utils/analytics';

export default function ResetPasswordScreen({ navigation }) {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const isSubmittingRef = useRef(false);

    const handleResetPassword = async () => {
        if (isSubmittingRef.current) return;

        // Validate
        if (!newPassword) {
            setError('Please enter a new password.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (!/[A-Z]/.test(newPassword)) {
            setError('Password must contain at least one uppercase letter.');
            return;
        }
        if (!/[0-9]/.test(newPassword)) {
            setError('Password must contain at least one number.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        isSubmittingRef.current = true;
        setLoading(true);
        setError('');

        try {
            await auth.updatePassword(newPassword);
            setSuccess(true);
            analytics.track('password_reset_success');
            // Clear sensitive state
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            const { general } = parseError(err);
            setError(general);
            analytics.track('password_reset_failure', { errorCode: err?.code });
        } finally {
            setLoading(false);
            isSubmittingRef.current = false;
        }
    };

    const handleGoToLogin = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    if (success) {
        return (
            <View style={styles.container}>
                <View style={styles.successCenter}>
                    <View style={styles.successCircle}>
                        <CheckCircle2 size={64} color="#22C55E" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.successTitle}>Password Updated!</Text>
                    <Text style={styles.successSub}>Your password has been changed. You can now log in with your new password.</Text>
                    <Pressable style={styles.primaryBtn} onPress={handleGoToLogin}>
                        <LinearGradient colors={['#3A86FF', '#1E5FAD']} style={styles.primaryBtnGradient}>
                            <Text style={styles.primaryBtnText}>Continue to Login</Text>
                            <ChevronRight size={20} color="#FFFFFF" />
                        </LinearGradient>
                    </Pressable>
                </View>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
                {/* Hero */}
                <LinearGradient colors={['#0A2463', '#3A86FF']} style={styles.hero}>
                    <View style={styles.heroIconWrap}>
                        <ShieldCheck size={48} color="#FFFFFF" strokeWidth={1.5} />
                    </View>
                    <Text style={styles.heroTitle}>Set New Password</Text>
                    <Text style={styles.heroSubtitle}>Create a strong, secure password</Text>
                </LinearGradient>

                {/* Form */}
                <View style={styles.formCard}>
                    {error ? (
                        <View style={styles.errorBox}>
                            <AlertCircle size={16} color="#DC2626" />
                            <Text style={styles.errorMsg}>{error}</Text>
                        </View>
                    ) : null}

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>New Password</Text>
                        <View style={styles.inputWrap}>
                            <Lock size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter new password"
                                placeholderTextColor="#94A3B8"
                                value={newPassword}
                                onChangeText={(v) => { setNewPassword(v); if (error) setError(''); }}
                                secureTextEntry={!showPassword}
                                textContentType="newPassword"
                            />
                            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={12}>
                                {showPassword ? <Eye size={18} color="#3A86FF" /> : <EyeOff size={18} color="#94A3B8" />}
                            </Pressable>
                        </View>
                    </View>

                    {/* Requirements */}
                    <View style={styles.reqWrap}>
                        <Text style={[styles.reqItem, newPassword.length >= 8 && styles.reqMet]}>
                            {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                        </Text>
                        <Text style={[styles.reqItem, /[A-Z]/.test(newPassword) && styles.reqMet]}>
                            {/[A-Z]/.test(newPassword) ? '✓' : '○'} One uppercase letter
                        </Text>
                        <Text style={[styles.reqItem, /[0-9]/.test(newPassword) && styles.reqMet]}>
                            {/[0-9]/.test(newPassword) ? '✓' : '○'} One number
                        </Text>
                    </View>

                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <View style={styles.inputWrap}>
                            <Lock size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Confirm new password"
                                placeholderTextColor="#94A3B8"
                                value={confirmPassword}
                                onChangeText={(v) => { setConfirmPassword(v); if (error) setError(''); }}
                                secureTextEntry={!showConfirm}
                                textContentType="newPassword"
                            />
                            <Pressable onPress={() => setShowConfirm(!showConfirm)} hitSlop={12}>
                                {showConfirm ? <Eye size={18} color="#3A86FF" /> : <EyeOff size={18} color="#94A3B8" />}
                            </Pressable>
                        </View>
                    </View>

                    <Pressable style={[styles.primaryBtn, loading && { opacity: 0.7 }]} onPress={handleResetPassword} disabled={loading}>
                        <LinearGradient colors={['#3A86FF', '#1E5FAD']} style={styles.primaryBtnGradient}>
                            {loading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Text style={styles.primaryBtnText}>Update Password</Text>
                                    <ChevronRight size={20} color="#FFFFFF" />
                                </>
                            )}
                        </LinearGradient>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    hero: { height: 260, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, alignItems: 'center', justifyContent: 'center', paddingTop: Platform.OS === 'ios' ? 60 : 40 },
    heroIconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    heroTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
    heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4, fontWeight: '500' },
    formCard: { marginTop: -30, marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 30, shadowColor: 'rgba(0,0,0,0.1)', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 20, elevation: 8 },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#FEE2E2' },
    errorMsg: { color: '#DC2626', fontSize: 13, flex: 1, fontWeight: '500' },
    fieldGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, height: 56, paddingHorizontal: 16 },
    textInput: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },
    reqWrap: { marginTop: -8, marginBottom: 20, marginLeft: 4, gap: 4 },
    reqItem: { fontSize: 12, color: '#94A3B8' },
    reqMet: { color: '#22C55E', fontWeight: '600' },
    primaryBtn: { borderRadius: 20, height: 64, overflow: 'hidden', shadowColor: '#3A86FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 6, marginTop: 12 },
    primaryBtnGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    successCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
    successCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#F0FDF4', alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#DCFCE7' },
    successTitle: { fontSize: 28, fontWeight: '800', color: '#166534', marginBottom: 12 },
    successSub: { fontSize: 16, color: '#475569', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
});
