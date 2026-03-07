import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable, Platform,
    KeyboardAvoidingView, ScrollView, Animated, ActivityIndicator,
    Modal, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    User, Mail, MapPin, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, AlertCircle,
    Search, X, CreditCard, Smartphone, Check, ChevronLeft, Activity, CloudUpload,
    Shield, Crown, Sparkles, Star, Zap, ChevronRight, LogOut
} from 'lucide-react-native';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../lib/api';
import * as Google from 'expo-auth-session/providers/google';
import * as Location from 'expo-location';

import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const STEP_LABELS = ['Personal Info', 'Location', 'Choose Plan', 'Verification', 'Ready'];



// ─── Password strength ───────────────────
const PasswordStrength = ({ password }) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const barColors = ['transparent', '#EF4444', '#F59E0B', '#3A86FF', '#22C55E'];
    if (!password) return null;
    return (
        <View style={styles.strengthWrap}>
            <View style={styles.strengthBarRow}>
                {[1, 2, 3, 4].map(i => (
                    <View key={i} style={[styles.strengthSeg, { backgroundColor: i <= score ? barColors[score] : '#E2E8F0' }]} />
                ))}
            </View>
            <Text style={[styles.strengthLabel, { color: barColors[score] }]}>{labels[score]}</Text>
        </View>
    );
};

const PasswordRequirements = ({ password }) => {
    const checks = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'One number', met: /[0-9]/.test(password) },
    ];
    if (!password) return null;
    return (
        <View style={styles.reqWrap}>
            {checks.map((c, i) => (
                <Text key={i} style={[styles.reqItem, { color: c.met ? '#22C55E' : '#64748B' }]}>
                    {c.met ? '✓' : '—'} {c.label}
                </Text>
            ))}
        </View>
    );
};

const StepIndicator = ({ current }) => (
    <View style={styles.modernProgressContainer}>
        {[1, 2, 3, 4, 5].map((s) => (
            <View key={s} style={styles.progressSegmentWrapper}>
                <View style={[
                    styles.progressSegment,
                    s < current && styles.progressSegmentDone,
                    s === current && styles.progressSegmentActive
                ]} />
            </View>
        ))}
    </View>
);

const IconInput = ({ icon: Icon, label, rightIcon, error, focused, onFocus, onBlur, ...rest }) => (
    <View style={styles.fieldGroup}>
        {typeof label === 'string' ? (
            <Text style={[styles.label, focused && { color: '#3A86FF' }]}>{label}</Text>
        ) : label}
        <View style={[
            styles.inputWrapEnhanced,
            focused && styles.inputFocusedEnhanced,
            error && styles.inputErrorEnhanced
        ]}>
            <View style={[styles.inlineIconBox, focused && { backgroundColor: '#EFF6FF' }]}>
                <Icon size={18} color={focused ? '#3A86FF' : '#94A3B8'} />
            </View>
            <TextInput
                style={styles.textInputEnhanced}
                placeholderTextColor="#94A3B8"
                onFocus={onFocus}
                onBlur={onBlur}
                {...rest}
            />
            {rightIcon && <View style={styles.rightIconWrap}>{rightIcon}</View>}
        </View>
        {error ? (
            <Animated.View style={styles.errorTextRow}>
                <AlertCircle size={12} color="#EF4444" />
                <Text style={styles.fieldErrorEnhanced}>{error}</Text>
            </Animated.View>
        ) : null}
    </View>
);

// ─── OTP Modal ──────────────────────────
const OTPModal = ({ visible, onClose, otp, setOtp, onVerify, timer, resend, attempts, field, error }) => (
    <Modal visible={visible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Verify {field === 'email' ? 'Email' : 'Phone'}</Text>
                    <Pressable onPress={onClose} hitSlop={12}><X size={22} color="#64748B" /></Pressable>
                </View>
                <Text style={styles.otpSubtext}>Enter the 6-digit code sent to your {field}.</Text>

                <View style={[styles.fieldGroup, { marginTop: 20 }]}>
                    <View style={[styles.inputWrapEnhanced, error && styles.inputErrorEnhanced]}>
                        <Lock size={18} color="#94A3B8" />
                        <TextInput
                            style={[styles.textInputEnhanced, { letterSpacing: 8, fontSize: 24, textAlign: 'center' }]}
                            placeholder="000000"
                            placeholderTextColor="#CBD5E1"
                            maxLength={6}
                            keyboardType="number-pad"
                            value={otp}
                            onChangeText={setOtp}
                        />
                    </View>
                    {error && (
                        <View style={styles.errorTextRow}>
                            <AlertCircle size={12} color="#EF4444" />
                            <Text style={styles.fieldErrorEnhanced}>{error}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.resendRow}>
                    {timer > 0 ? (
                        <Text style={styles.timerText}>Resend in {timer}s</Text>
                    ) : (
                        <Pressable onPress={resend}>
                            <Text style={styles.resendAction}>Resend Code</Text>
                        </Pressable>
                    )}
                </View>

                <Pressable style={styles.primaryBtnEnhanced} onPress={onVerify}>
                    <Text style={styles.primaryBtnText}>Verify OTP</Text>
                </Pressable>

                {attempts > 0 && (
                    <Text style={styles.attemptsText}>{3 - attempts} attempts remaining</Text>
                )}
            </View>
        </View>
    </Modal>
);



// ─── UPI Payment Modal ────────────────────
const UPIPaymentModal = ({ visible, onClose, onSuccess, planName, planPrice }) => (
    <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Complete Payment</Text>
                    <Pressable onPress={onClose} hitSlop={12}><X size={22} color="#64748B" /></Pressable>
                </View>
                <View style={styles.paymentSummary}>
                    <Text style={styles.payPlanName}>{planName}</Text>
                    <Text style={styles.payAmount}>{planPrice}</Text>
                </View>
                <Text style={styles.paySubtext}>Choose a UPI app to pay</Text>
                {['Google Pay', 'PhonePe', 'Paytm'].map(app => (
                    <Pressable key={app} style={styles.upiRow} onPress={onSuccess}>
                        <View style={styles.upiIconBox}>
                            <Smartphone size={20} color="#1A202C" />
                        </View>
                        <Text style={styles.upiAppName}>{app}</Text>
                        <Text style={styles.upiAction}>Pay →</Text>
                    </Pressable>
                ))}
                <View style={styles.payDivider} />
                <Pressable style={styles.payManualBtn} onPress={onSuccess}>
                    <CreditCard size={18} color="#FFFFFF" />
                    <Text style={styles.payManualText}>Pay with UPI ID</Text>
                </Pressable>
            </View>
        </View>
    </Modal>
);

// ─── Main Component ──────────────────────
export default function PatientSignupScreen({ navigation, route }) {
    const { user, signUp, signInWithGoogle, completeSignUp } = useAuth();
    const [step, setStep] = useState(route?.params?.step || 1);
    const [form, setForm] = useState({
        fullName: '', email: '', phoneNumber: '', city: '', password: '', confirmPassword: '',
    });
    const [selectedPlan, setSelectedPlan] = useState({ id: 'basic', name: 'Basic Plan', price: '₹500 / month' });

    // OTP States
    const [otpVisible, setOtpVisible] = useState(false);
    const [verificationField, setVerificationField] = useState(null); // 'email' or 'phone'
    const [otp, setOtp] = useState('');
    const [otpAttempts, setOtpAttempts] = useState(0);
    const [resendTimer, setResendTimer] = useState(0);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);

    // Location States
    const [detectingLocation, setDetectingLocation] = useState(false);
    const [locationAddress, setLocationAddress] = useState('');

    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focusField, setFocusField] = useState('');
    const [errors, setErrors] = useState({});
    const [googleLoading, setGoogleLoading] = useState(false);
    const [upiModalVisible, setUpiModalVisible] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const mainScrollRef = useRef(null);

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        prompt: 'select_account',
    });

    // Animations
    const heroAnim = useRef(new Animated.Value(-15)).current;
    const heroOpacity = useRef(new Animated.Value(0)).current;
    const cardAnim = useRef(new Animated.Value(30)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;

    // Staggered items
    const staggerAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;

    // OTP Timer
    useEffect(() => {
        let interval;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    useEffect(() => {
        // Stop any running animations and reset
        staggerAnims.forEach(anim => anim.stopAnimation());
        heroAnim.stopAnimation();
        heroOpacity.stopAnimation();
        cardAnim.stopAnimation();
        cardOpacity.stopAnimation();

        staggerAnims.forEach(anim => anim.setValue(0));
        heroAnim.setValue(-20);
        heroOpacity.setValue(0);
        cardAnim.setValue(20);
        cardOpacity.setValue(0);

        Animated.parallel([
            Animated.timing(heroAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(heroOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(cardAnim, { toValue: 0, duration: 500, delay: 100, useNativeDriver: true }),
            Animated.timing(cardOpacity, { toValue: 1, duration: 500, delay: 100, useNativeDriver: true }),
        ]).start();

        const animations = staggerAnims.map((anim, i) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true
            })
        );
        Animated.stagger(100, animations).start();

        if (mainScrollRef.current) {
            mainScrollRef.current.scrollTo({ y: 0, animated: true });
        }
    }, [step]);


    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            handleGoogleSignUp(id_token);
        }
    }, [response]);

    const handleGoogleSignUp = async (idToken) => {
        try {
            setGoogleLoading(true);
            const result = await signInWithGoogle(idToken);
            if (result?.isNewUser) {
                setStep(2);
            }
        } catch (error) {
            setErrors({ google: error.message || 'Google sign-up failed' });
        } finally {
            setGoogleLoading(false);
        }
    };

    const updateField = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const validateStep1 = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = 'Full name is required';
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Please enter a valid email address';
        if (!form.phoneNumber.trim() || form.phoneNumber.length < 10) e.phoneNumber = 'Enter a valid phone number';
        if (!isEmailVerified) e.email = 'Please verify your email';
        if (!isPhoneVerified) e.phoneNumber = 'Please verify your phone number';
        if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleVerifyPress = (field) => {
        const e = {};
        if (field === 'email') {
            if (!form.email.trim()) {
                e.email = 'Email not entered';
            } else if (!/\S+@\S+\.\S+/.test(form.email)) {
                e.email = 'Enter a valid email address';
            }
        } else if (field === 'phone') {
            if (!form.phoneNumber.trim()) {
                e.phoneNumber = 'Phone number not entered';
            } else if (!/^\d{10}$/.test(form.phoneNumber)) {
                e.phoneNumber = 'Enter a valid 10-digit number';
            }
        }

        if (Object.keys(e).length > 0) {
            setErrors(prev => ({ ...prev, ...e }));
            return;
        }

        setVerificationField(field);
        setOtpVisible(true);
        setResendTimer(60);
        setOtpAttempts(0);
        setOtp('');
    };

    const handleVerifyOtp = () => {
        if (otp === '123456') {
            if (verificationField === 'email') setIsEmailVerified(true);
            else setIsPhoneVerified(true);
            setOtpVisible(false);
            setOtp('');
        } else {
            const newAttempts = otpAttempts + 1;
            setOtpAttempts(newAttempts);
            if (newAttempts >= 3) {
                setOtpVisible(false);
                setErrors(prev => ({ ...prev, [verificationField]: `Too many attempts. Check your ${verificationField} or try again later.` }));
            } else {
                setErrors(prev => ({ ...prev, otp: 'OTP not correct' }));
            }
        }
    };

    const handleResendOtp = () => {
        if (resendTimer === 0) {
            setResendTimer(60);
            setOtp('');
            setOtpAttempts(0);
        }
    };

    const handleDetectLocation = async () => {
        setDetectingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrors({ location: 'Permission to access location was denied' });
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            const [address] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            if (address) {
                const addrStr = `${address.name || ''}, ${address.street || ''}, ${address.city || ''}, ${address.region || ''}, ${address.postalCode || ''}`;
                setLocationAddress(addrStr);
                setForm(prev => ({ ...prev, city: address.city || '' }));
            }
        } catch (error) {
            setErrors({ location: 'Failed to detect location' });
        } finally {
            setDetectingLocation(false);
        }
    };

    const handleStep1Continue = async () => {
        if (!validateStep1()) return;

        // If user already registered in this session and email is the same, just proceed
        if (user && user.email?.toLowerCase().trim() === form.email.toLowerCase().trim()) {
            setStep(2);
            return;
        }

        setSignupLoading(true);
        try {
            await signUp(form.email, form.password, form.fullName, 'patient', { phoneNumber: form.phoneNumber });
            setStep(2);
        } catch (error) {
            setErrors({ general: error?.message || 'Signup failed' });
        } finally {
            setSignupLoading(false);
        }
    };

    const handleStep2Continue = async () => {
        if (!locationAddress) return;
        setSignupLoading(true);
        try {
            await apiService.patients.updateMe({ city: form.city });
            setStep(3);
        } catch (error) {
            console.warn('Failed to save city:', error.message);
            setStep(3); // Proceed anyway for now to avoid blocking
        } finally {
            setSignupLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        setUpiModalVisible(false);
        try {
            await apiService.patients.subscribe({ plan: selectedPlan.id, paid: 1 });
        } catch (err) {
            console.warn('Backend payment save failed:', err.message);
        }
        setStep(4);
    };

    const handleBack = () => {
        if (step > 1) {
            // If going back from Step 3 (Plan) to Step 2 (Location), we need to handle step indexing correctly
            setStep(prev => prev - 1);
        }
    };

    const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;

    // ──── STEP 1 ────
    const renderStep1 = () => (
        <View>
            <Animated.View style={{ opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
                <Pressable style={styles.googleBtnEnhanced} onPress={() => promptAsync()} disabled={!request || googleLoading}>
                    <Text style={styles.googleG}>G</Text>
                    <Text style={styles.googleBtnText}>{googleLoading ? 'Signing up...' : 'Continue with Google'}</Text>
                </Pressable>
            </Animated.View>

            <Animated.View style={{ opacity: staggerAnims[1], transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
                <View style={styles.dividerRowPremium}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>OR SIGN UP WITH EMAIL</Text>
                    <View style={styles.dividerLine} />
                </View>

                <View style={styles.trustRowEnhanced}>
                    <View style={styles.trustItem}><Shield size={12} color="#3A86FF" /><Text style={styles.trustText}>HIPAA Secure</Text></View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}><Lock size={12} color="#3A86FF" /><Text style={styles.trustText}>256-bit SSL</Text></View>
                    <View style={styles.trustDivider} />
                    <View style={styles.trustItem}><CheckCircle2 size={12} color="#3A86FF" /><Text style={styles.trustText}>Privacy First</Text></View>
                </View>
            </Animated.View>

            {errors.general ? (
                <View style={styles.errorBoxEnhanced}>
                    <AlertCircle size={18} color="#EF4444" />
                    <Text style={styles.errorMsgEnhanced}>{errors.general}</Text>
                </View>
            ) : null}

            <Animated.View style={{ opacity: staggerAnims[2], transform: [{ translateY: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
                <IconInput icon={User} label="Full Name" placeholder="Enter your full name"
                    value={form.fullName} onChangeText={v => updateField('fullName', v)}
                    focused={focusField === 'fullName'} onFocus={() => setFocusField('fullName')} onBlur={() => setFocusField('')}
                    error={errors.fullName}
                />

                <View style={styles.verifyFieldRow}>
                    <View style={{ flex: 1 }}>
                        <IconInput
                            icon={Mail}
                            label={
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Text style={[styles.label, focusField === 'email' && { color: '#3A86FF' }]}>Email Address</Text>
                                    {isEmailVerified && <CheckCircle2 size={12} color="#22C55E" />}
                                </View>
                            }
                            placeholder="Enter your email"
                            value={form.email} onChangeText={v => updateField('email', v)}
                            autoCapitalize="none" keyboardType="email-address"
                            focused={focusField === 'email'} onFocus={() => setFocusField('email')} onBlur={() => setFocusField('')}
                            error={errors.email}
                        />
                    </View>
                    <Pressable
                        style={[styles.verifyBtnSmall, isEmailVerified && styles.verifiedBtn, errors.email && { marginTop: -12 }]}
                        onPress={() => !isEmailVerified && handleVerifyPress('email')}
                        disabled={isEmailVerified}
                    >
                        {isEmailVerified ? <Check size={14} color="#FFFFFF" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
                    </Pressable>
                </View>

                <View style={styles.verifyFieldRow}>
                    <View style={{ flex: 1 }}>
                        <IconInput
                            icon={Smartphone}
                            label={
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Text style={[styles.label, focusField === 'phoneNumber' && { color: '#3A86FF' }]}>Phone Number</Text>
                                    {isPhoneVerified && <CheckCircle2 size={12} color="#22C55E" />}
                                </View>
                            }
                            placeholder="10-digit number"
                            value={form.phoneNumber} onChangeText={v => updateField('phoneNumber', v)}
                            keyboardType="phone-pad" maxLength={10}
                            focused={focusField === 'phoneNumber'} onFocus={() => setFocusField('phoneNumber')} onBlur={() => setFocusField('')}
                            error={errors.phoneNumber}
                        />
                    </View>
                    <Pressable
                        style={[styles.verifyBtnSmall, isPhoneVerified && styles.verifiedBtn, errors.phoneNumber && { marginTop: -12 }]}
                        onPress={() => !isPhoneVerified && handleVerifyPress('phone')}
                        disabled={isPhoneVerified}
                    >
                        {isPhoneVerified ? <Check size={14} color="#FFFFFF" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
                    </Pressable>
                </View>
            </Animated.View>


            <Animated.View style={{ opacity: staggerAnims[4], transform: [{ translateY: staggerAnims[4].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
                <IconInput icon={Lock} label="Password" placeholder="Create a password"
                    value={form.password} onChangeText={v => updateField('password', v)}
                    secureTextEntry={!showPass}
                    focused={focusField === 'password'} onFocus={() => setFocusField('password')} onBlur={() => setFocusField('')}
                    error={errors.password}
                    rightIcon={
                        <Pressable onPress={() => setShowPass(!showPass)} hitSlop={8}>
                            {showPass ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />}
                        </Pressable>
                    }
                />
                <PasswordStrength password={form.password} />
                <PasswordRequirements password={form.password} />

                <IconInput icon={Lock} label="Confirm Password" placeholder="Re-enter your password"
                    value={form.confirmPassword} onChangeText={v => updateField('confirmPassword', v)}
                    secureTextEntry={!showConfirm}
                    focused={focusField === 'confirmPassword'} onFocus={() => setFocusField('confirmPassword')} onBlur={() => setFocusField('')}
                    error={errors.confirmPassword}
                    rightIcon={
                        passwordsMatch ? <CheckCircle2 size={18} color="#22C55E" /> :
                            <Pressable onPress={() => setShowConfirm(!showConfirm)} hitSlop={8}>
                                {showConfirm ? <Eye size={18} color="#94A3B8" /> : <EyeOff size={18} color="#94A3B8" />}
                            </Pressable>
                    }
                />
            </Animated.View>

            <Animated.View style={{ opacity: staggerAnims[5], transform: [{ translateY: staggerAnims[5].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
                <Pressable style={[styles.primaryBtnEnhanced, signupLoading && { opacity: 0.7 }]} onPress={handleStep1Continue} disabled={signupLoading}>
                    {signupLoading ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator size="small" color="#FFFFFF" />
                            <Text style={styles.primaryBtnText}>  Creating account...</Text>
                        </View>
                    ) : (
                        <>
                            <Text style={styles.primaryBtnText}>Continue</Text>
                            <ChevronRight size={20} color="#FFFFFF" />
                        </>
                    )}
                </Pressable>

                <View style={styles.bottomLink}>
                    <Text style={styles.bottomLinkText}>Already have an account?  </Text>
                    <Pressable onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.bottomLinkAction}>Log In</Text>
                    </Pressable>
                </View>
            </Animated.View>
        </View>
    );

    // ──── STEP 2 (Location) ────
    const renderStep2 = () => (
        <View style={styles.centerStepEnhanced}>
            <Animated.View style={{ opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }], alignItems: 'center', width: '100%' }}>
                <Text style={styles.locationTitlePremium}>What's your location?</Text>
                <Text style={styles.locationSubtitlePremium}>We need your location to show you our serviceable hubs.</Text>
            </Animated.View>

            <Animated.View style={{ opacity: staggerAnims[1], transform: [{ scale: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }], marginVertical: 30, width: '100%', height: 320, alignItems: 'center', justifyContent: 'center' }}>
                <Image
                    source={require('../../../assets/isometric_city.png')}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                />
            </Animated.View>

            <Animated.View style={{ opacity: staggerAnims[2], width: '100%', alignItems: 'center' }}>
                <Pressable
                    style={[styles.locationPrimaryBtn, detectingLocation && { opacity: 0.7 }]}
                    onPress={handleDetectLocation}
                    disabled={detectingLocation}
                >
                    {detectingLocation ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <MapPin size={20} color="#FFFFFF" strokeWidth={2.5} />
                            <Text style={styles.locationPrimaryBtnText}>Use current location</Text>
                        </>
                    )}
                </Pressable>

                <Pressable style={styles.locationSecondaryBtn} onPress={() => { /* Opne manual picker */ }}>
                    <Text style={styles.locationSecondaryBtnText}>Enter location manually</Text>
                </Pressable>

                {locationAddress ? (
                    <View style={styles.locationSuccessToast}>
                        <CheckCircle2 size={16} color="#22C55E" />
                        <Text style={styles.locationSuccessText}>{locationAddress}</Text>
                    </View>
                ) : null}

                {errors.location ? (
                    <Text style={styles.locationErrorText}>{errors.location}</Text>
                ) : null}
            </Animated.View>

            {locationAddress && (
                <Animated.View style={{ opacity: staggerAnims[3], width: '100%', marginTop: 20 }}>
                    <Pressable
                        style={[styles.primaryBtnEnhanced, signupLoading && { opacity: 0.5 }]}
                        onPress={handleStep2Continue}
                        disabled={signupLoading}
                    >
                        {signupLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.primaryBtnText}>Continue to Plans</Text>
                                <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                            </>
                        )}
                    </Pressable>
                </Animated.View>
            )}
        </View>
    );

    // ──── STEP 3 (Plan Selection - Original Step 2) ────
    const renderStep2_Original = () => (
        <View style={{ paddingBottom: 20 }}>
            <Animated.View style={{ opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
                <View style={styles.planCardGhost}>
                    <View style={styles.ghostIconWrap}>
                        <Sparkles size={18} color="#64748B" />
                    </View>
                    <View>
                        <Text style={styles.planTitleGhost}>Explore Features</Text>
                        <Text style={styles.planDesc}>Limited preview — no care calls</Text>
                    </View>
                </View>
            </Animated.View>

            {/* Basic Plan */}
            <Animated.View style={{ opacity: staggerAnims[1], transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <Pressable
                    onPress={() => setSelectedPlan({ id: 'basic', name: 'Basic Plan', price: '₹500 / month' })}
                    style={[styles.planCardEnhanced, selectedPlan.id === 'basic' && styles.planCardActive]}
                >
                    <LinearGradient
                        colors={['#FFFFFF', '#F8FAFC']}
                        style={styles.planCardGradient}
                    >
                        <View style={styles.planCardHeaderRow}>
                            <View style={[styles.planIconBoxEnhanced, { backgroundColor: '#E0F2FE' }]}>
                                <Shield size={24} color="#0EA5E9" />
                            </View>
                            <View style={styles.planPriceCol}>
                                <Text style={styles.planTitleEnhanced}>Basic Plan</Text>
                                <Text style={styles.planPriceEnhanced}>₹500<Text style={styles.planPriceSub}>/mo</Text></Text>
                            </View>
                            {selectedPlan.id === 'basic' && (
                                <View style={styles.selectedCheck}>
                                    <CheckCircle2 size={24} color="#0EA5E9" fill="#E0F2FE" />
                                </View>
                            )}
                        </View>

                        <View style={styles.planFeaturesEnhanced}>
                            <View style={styles.featureLine}><Check size={14} color="#0EA5E9" strokeWidth={3} /><Text style={styles.featureTextEnhanced}>Daily Care Calls</Text></View>
                            <View style={styles.featureLine}><Check size={14} color="#0EA5E9" strokeWidth={3} /><Text style={styles.featureTextEnhanced}>Medication Tracking</Text></View>
                            <View style={styles.featureLine}><Check size={14} color="#0EA5E9" strokeWidth={3} /><Text style={styles.featureTextEnhanced}>Assigned Caller</Text></View>
                            <View style={styles.featureLine}><Check size={14} color="#0EA5E9" strokeWidth={3} /><Text style={styles.featureTextEnhanced}>Health History</Text></View>
                        </View>

                        <Pressable
                            style={[styles.planActionBtn, selectedPlan.id === 'basic' ? styles.btnActive : styles.btnInactive]}
                            onPress={() => {
                                setSelectedPlan({ id: 'basic', name: 'Basic Plan', price: '₹500 / month' });
                                setUpiModalVisible(true);
                            }}
                        >
                            <Text style={[styles.planActionBtnText, selectedPlan.id === 'basic' ? styles.txtActive : styles.txtInactive]}>
                                {selectedPlan.id === 'basic' ? 'Selected — Pay ₹500' : 'Select Basic'}
                            </Text>
                            <ChevronRight size={18} color={selectedPlan.id === 'basic' ? '#FFFFFF' : '#64748B'} />
                        </Pressable>
                    </LinearGradient>
                </Pressable>
            </Animated.View>

            {/* Premium Plan */}
            <Animated.View style={{ opacity: staggerAnims[2], transform: [{ translateY: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <Pressable
                    onPress={() => setSelectedPlan({ id: 'premium', name: 'Premium Plan', price: '₹999 / month' })}
                    style={[styles.planCardEnhanced, selectedPlan.id === 'premium' && { borderColor: '#9333EA', shadowColor: '#9333EA' }]}
                >
                    <LinearGradient
                        colors={selectedPlan.id === 'premium' ? ['#F5F3FF', '#FFFFFF'] : ['#FFFFFF', '#FFFFFF']}
                        style={styles.planCardGradient}
                    >
                        <View style={styles.premiumBadge}>
                            <Star size={10} color="#FFFFFF" fill="#FFFFFF" />
                            <Text style={styles.premiumBadgeText}>BEST VALUE</Text>
                        </View>

                        <View style={styles.planCardHeaderRow}>
                            <View style={[styles.planIconBoxEnhanced, { backgroundColor: '#F3E8FF' }]}>
                                <Crown size={24} color="#9333EA" />
                            </View>
                            <View style={styles.planPriceCol}>
                                <Text style={[styles.planTitleEnhanced, { color: '#9333EA' }]}>Premium Plan</Text>
                                <Text style={[styles.planPriceEnhanced, { color: '#9333EA' }]}>₹999<Text style={styles.planPriceSub}>/mo</Text></Text>
                            </View>
                            {selectedPlan.id === 'premium' && (
                                <View style={styles.selectedCheck}>
                                    <CheckCircle2 size={24} color="#9333EA" fill="#F3E8FF" />
                                </View>
                            )}
                        </View>

                        <View style={styles.planFeaturesEnhanced}>
                            <View style={styles.featureLine}><Zap size={14} color="#9333EA" strokeWidth={3} /><Text style={styles.featureTextEnhanced}>Everything in Basic +</Text></View>
                            <View style={styles.featureLine}><Check size={14} color="#9333EA" strokeWidth={3} /><Text style={styles.featureTextEnhanced}>Detailed Health Analytics</Text></View>
                            <View style={styles.featureLine}><Check size={14} color="#9333EA" strokeWidth={3} /><Text style={styles.featureTextEnhanced}>Family Dashboard</Text></View>
                            <View style={styles.featureLine}><Check size={14} color="#9333EA" strokeWidth={3} /><Text style={styles.featureTextEnhanced}>Priority Support</Text></View>
                        </View>

                        <Pressable
                            style={[styles.planActionBtn, selectedPlan.id === 'premium' ? { backgroundColor: '#9333EA' } : styles.btnInactive]}
                            onPress={() => {
                                setSelectedPlan({ id: 'premium', name: 'Premium Plan', price: '₹999 / month' });
                                setUpiModalVisible(true);
                            }}
                        >
                            <Text style={[styles.planActionBtnText, selectedPlan.id === 'premium' ? styles.txtActive : styles.txtInactive]}>
                                {selectedPlan.id === 'premium' ? 'Selected — Pay ₹999' : 'Select Premium'}
                            </Text>
                            <ChevronRight size={18} color={selectedPlan.id === 'premium' ? '#FFFFFF' : '#64748B'} />
                        </Pressable>
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        </View>
    );

    // ──── STEP 3 ────
    const renderStep3 = () => (
        <View style={styles.centerStepEnhanced}>
            <Animated.View style={{ width: '100%', opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <LinearGradient
                    colors={['#F0FFF4', '#FFFFFF']}
                    style={styles.successCelebrationCard}
                >
                    <View style={styles.largeSuccessCircle}>
                        <CheckCircle2 size={56} color="#22C55E" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.successTitle}>Payment Successful!</Text>
                    <Text style={styles.successSubtitle}>Welcome to the CareCo family.</Text>
                </LinearGradient>
            </Animated.View>

            <Animated.View style={{ width: '100%', opacity: staggerAnims[1], transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <View style={styles.nextStepsCard}>
                    <View style={styles.nextStepsHeader}>
                        <Sparkles size={18} color="#0EA5E9" />
                        <Text style={styles.nextStepsTitle}>Your Onboarding Journey</Text>
                    </View>
                    <Text style={styles.nextStepsDesc}>
                        A Care Caller will reach out within 24 hours to finalize your profile:
                    </Text>

                    <View style={styles.journeyList}>
                        <Animated.View style={{ opacity: staggerAnims[2], transform: [{ translateX: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }}>
                            <View style={styles.journeyItem}>
                                <View style={styles.journeyIconBox}><Shield size={16} color="#0EA5E9" /></View>
                                <Text style={styles.journeyText}>Collect your health details</Text>
                            </View>
                        </Animated.View>
                        <Animated.View style={{ opacity: staggerAnims[3], transform: [{ translateX: staggerAnims[3].interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }}>
                            <View style={styles.journeyItem}>
                                <View style={styles.journeyIconBox}><Zap size={16} color="#0EA5E9" /></View>
                                <Text style={styles.journeyText}>Set up medication schedule</Text>
                            </View>
                        </Animated.View>
                        <Animated.View style={{ opacity: staggerAnims[4], transform: [{ translateX: staggerAnims[4].interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }}>
                            <View style={styles.journeyItem}>
                                <View style={styles.journeyIconBox}><Smartphone size={16} color="#0EA5E9" /></View>
                                <Text style={styles.journeyText}>Assign your dedicated care caller</Text>
                            </View>
                        </Animated.View>
                    </View>
                </View>
            </Animated.View>

            <Animated.View style={{ width: '100%', opacity: staggerAnims[5], transform: [{ scale: staggerAnims[5].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
                <Pressable style={styles.primaryBtnEnhanced} onPress={() => setStep(5)}>
                    <Text style={styles.primaryBtnText}>Continue</Text>
                    <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                </Pressable>
            </Animated.View>
        </View>
    );


    const renderStep4 = () => (
        <View style={styles.centerStepEnhanced}>
            <Animated.View style={{ opacity: staggerAnims[0], transform: [{ scale: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }}>
                <View style={styles.readyVisualWrap}>
                    <View style={styles.readyIconGrid}>
                        <View style={[styles.readyIconBox, { top: 0, left: 20, backgroundColor: '#EFF6FF' }]}><User size={24} color="#3A86FF" /></View>
                        <View style={[styles.readyIconBox, { top: 40, right: 10, backgroundColor: '#F0FFF4' }]}><CheckCircle2 size={24} color="#22C55E" /></View>
                        <View style={[styles.readyIconBox, { bottom: 0, left: 0, backgroundColor: '#FDF2F8' }]}><Sparkles size={24} color="#DB2777" /></View>
                    </View>
                    <View style={styles.mainReadyCircle}>
                        <Shield size={64} color="#0A2463" strokeWidth={1.5} />
                    </View>
                </View>
            </Animated.View>

            <Animated.View style={{ opacity: staggerAnims[1], transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <Text style={styles.megaTitle}>All Systems Go!</Text>
                <Text style={styles.megaSubtitle}>Your CareCo experience is ready and waiting.</Text>
            </Animated.View>

            <Animated.View style={{ opacity: staggerAnims[2], width: '100%', transform: [{ translateY: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                <View style={styles.welcomeCard}>
                    <Text style={styles.welcomeText}>
                        You can now explore your dashboard, add family contacts, and browse our health resources while we prepare your first call.
                    </Text>
                </View>
            </Animated.View>

            <Animated.View style={{ opacity: staggerAnims[3], width: '100%', transform: [{ scale: staggerAnims[3].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
                <Pressable style={styles.dashboardBtn} onPress={completeSignUp}>
                    <LinearGradient
                        colors={['#0A2463', '#1E5FAD']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.dashboardBtnGradient}
                    >
                        <Text style={styles.dashboardBtnText}>Enter My Dashboard</Text>
                        <ArrowLeft size={20} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        </View>
    );


    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                ref={mainScrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                bounces={false}
            >
                {/* Hero / Header */}
                <Animated.View style={{ transform: [{ translateY: heroAnim }], opacity: heroOpacity }}>
                    <LinearGradient
                        colors={['#0A2463', '#1E5FAD']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.heroEnhanced}
                    >
                        <View style={styles.decorativeCircleSmall} />
                        <View style={[styles.decorativeCircleSmall, { width: 80, height: 80, top: 20, right: 60, opacity: 0.05 }]} />
                        <View style={[styles.decorativeCircleSmall, { width: 60, height: 60, top: 40, left: -10, opacity: 0.1 }]} />

                        <View style={styles.heroInside}>
                            <View style={styles.headerTopLine}>
                                <View style={styles.stepBadge}>
                                    <Text style={styles.stepBadgeText}>STEP {step} OF 5</Text>
                                </View>
                                {step > 1 && step < 4 && (
                                    <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                                        <Pressable onPress={handleBack} style={styles.backBtnHeader} hitSlop={15}>
                                            <ArrowLeft size={16} color="rgba(255,255,255,0.8)" />
                                            <Text style={styles.backBtnText}>Back</Text>
                                        </Pressable>
                                        <Pressable onPress={() => useAuth().signOut()} style={styles.backBtnHeader} hitSlop={15}>
                                            <LogOut size={16} color="rgba(255,255,255,0.8)" />
                                            <Text style={styles.backBtnText}>Log Out</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>

                            <Text style={styles.heroTitleEnhanced}>{STEP_LABELS[step - 1]}</Text>
                            <Text style={styles.heroSubtitleSmall}>Complete this step to continue</Text>

                            <StepIndicator current={step} />
                        </View>
                    </LinearGradient>
                </Animated.View>


                {/* Form Card */}
                <Animated.View style={[styles.formCard, { transform: [{ translateY: cardAnim }], opacity: cardOpacity }]}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep2_Original()}
                    {step === 4 && renderStep3()}
                    {step === 5 && renderStep4()}
                </Animated.View>
            </ScrollView>

            <OTPModal
                visible={otpVisible}
                onClose={() => setOtpVisible(false)}
                otp={otp}
                setOtp={setOtp}
                onVerify={handleVerifyOtp}
                timer={resendTimer}
                resend={handleResendOtp}
                attempts={otpAttempts}
                field={verificationField}
                error={errors.otp}
            />



            <UPIPaymentModal
                visible={upiModalVisible}
                onClose={() => setUpiModalVisible(false)}
                onSuccess={handlePaymentSuccess}
                planName={selectedPlan.name}
                planPrice={selectedPlan.price}
            />
        </KeyboardAvoidingView>
    );

}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FB' },

    // ─── Hero Enhanced ────────────────
    heroEnhanced: {
        height: 190, borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
        paddingTop: Platform.OS === 'ios' ? 50 : 30, overflow: 'hidden',
    },
    heroInside: { paddingHorizontal: 24 },
    decorativeCircleSmall: { position: 'absolute', top: -40, right: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)' },
    headerTopLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    stepBadge: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    stepBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1.2 },
    backBtnHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backBtnText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
    heroTitleEnhanced: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
    heroSubtitleSmall: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginBottom: 20 },

    // ─── Progress Bar ─────────────────
    modernProgressContainer: { flexDirection: 'row', gap: 8, width: '100%' },
    progressSegmentWrapper: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' },
    progressSegment: { height: '100%', width: '0%' },
    progressSegmentActive: { width: '50%', backgroundColor: '#FFFFFF' }, // Half filled for current
    progressSegmentDone: { width: '100%', backgroundColor: '#FFFFFF' },

    // ─── Form Card ────────────────────

    formCard: {
        marginTop: -24, marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 20,
        paddingHorizontal: 20, paddingTop: 24, paddingBottom: 32, marginBottom: 40,
        shadowColor: 'rgba(10,36,99,0.12)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 24, elevation: 8,
    },

    // ─── Google ───────────────────────
    googleBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
        borderWidth: 1.5, borderColor: '#BDD4EE', borderRadius: 12, height: 48, marginBottom: 20,
        shadowColor: 'rgba(0,0,0,0.08)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 4, elevation: 2,
    },
    googleG: { fontSize: 20, fontWeight: '700', color: '#4285F4', marginRight: 10 },
    googleBtnText: { fontSize: 15, fontWeight: '600', color: '#1A202C' },

    // ─── Divider ──────────────────────
    dividerRowPremium: { flexDirection: 'row', alignItems: 'center', marginVertical: 32, paddingHorizontal: 10 },
    dividerLine: { flex: 1, height: 1.2, backgroundColor: '#F1F5F9' },
    dividerText: { marginHorizontal: 16, fontSize: 11, color: '#94A3B8', fontWeight: '800', letterSpacing: 1.5 },

    // ─── Error ────────────────────────
    errorBoxEnhanced: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF1F2', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#FECDD3' },
    errorMsgEnhanced: { color: '#E11D48', fontSize: 13, flex: 1, fontWeight: '500' },
    errorTextRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginLeft: 4 },

    // ─── Google Enhanced ──────────────
    googleBtnEnhanced: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
        borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, height: 56, marginBottom: 20,
        shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 10, elevation: 3,
    },

    // ─── Trust row ────────────────────
    trustRowEnhanced: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 24, paddingVertical: 10, backgroundColor: '#F0F7FF', borderRadius: 14, borderWidth: 1, borderColor: '#E0F2FE' },
    trustItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    trustText: { fontSize: 10, fontWeight: '700', color: '#1E40AF', letterSpacing: 0.2 },
    trustDivider: { width: 1, height: 10, backgroundColor: '#BFDBFE', marginHorizontal: 2 },


    // ─── Fields ───────────────────────
    fieldGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
    inputWrapEnhanced: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
        borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 16, height: 56, paddingHorizontal: 16,
        shadowColor: 'rgba(0,0,0,0.02)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 4, elevation: 1,
    },
    inputFocusedEnhanced: { borderColor: '#3A86FF', backgroundColor: '#FFFFFF', shadowColor: 'rgba(58,134,255,0.1)', shadowRadius: 8, elevation: 3 },
    inputErrorEnhanced: { borderColor: '#EF4444', backgroundColor: '#FFF1F2' },
    inlineIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    textInputEnhanced: { flex: 1, fontSize: 15, color: '#1E293B', fontWeight: '500' },
    fieldErrorEnhanced: { fontSize: 12, color: '#EF4444', fontWeight: '500' },
    rightIconWrap: { marginLeft: 10 },


    // ─── Password ─────────────────────
    strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: -8, marginBottom: 12 },
    strengthBarRow: { flexDirection: 'row', gap: 4 },
    strengthSeg: { width: 28, height: 4, borderRadius: 2 },
    strengthLabel: { fontSize: 11, fontWeight: '600' },
    reqWrap: { marginTop: -4, marginBottom: 12, marginLeft: 4 },
    reqItem: { fontSize: 12, marginBottom: 2 },

    // ─── Primary ──────────────────────
    primaryBtn: {
        backgroundColor: '#3A86FF', borderRadius: 12, height: 52,
        alignItems: 'center', justifyContent: 'center', marginTop: 8, width: '100%',
        shadowColor: 'rgba(58,134,255,0.35)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 12, elevation: 4,
    },
    primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    // ─── Bottom Link ──────────────────
    bottomLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    bottomLinkText: { fontSize: 14, color: '#64748B' },
    bottomLinkAction: { fontSize: 14, fontWeight: '600', color: '#3A86FF' },

    // ─── Plan cards ───────────────────
    planCardGhost: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 16, padding: 16, marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 12 },
    ghostIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    planTitleGhost: { fontSize: 14, fontWeight: '700', color: '#4A5568' },
    planDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },

    planCardEnhanced: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: 'rgba(10,36,99,0.08)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 6,
        overflow: 'hidden',
    },
    planCardActive: {
        borderColor: '#0EA5E9',
        shadowColor: '#0EA5E9',
        shadowOpacity: 0.15,
        elevation: 8,
    },
    planCardGradient: { padding: 20 },
    planCardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
    planIconBoxEnhanced: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    planPriceCol: { flex: 1 },
    planTitleEnhanced: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    planPriceEnhanced: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
    planPriceSub: { fontSize: 14, fontWeight: '500', color: '#64748B' },
    selectedCheck: { position: 'absolute', top: -5, right: -5 },

    planFeaturesEnhanced: { gap: 12, marginBottom: 24 },
    featureLine: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    featureTextEnhanced: { fontSize: 14, color: '#475569', fontWeight: '500' },

    planActionBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 16, gap: 8,
    },
    btnActive: { backgroundColor: '#0EA5E9' },
    btnInactive: { backgroundColor: '#F1F5F9' },
    planActionBtnText: { fontSize: 15, fontWeight: '700' },
    txtActive: { color: '#FFFFFF' },
    txtInactive: { color: '#64748B' },

    premiumBadge: {
        position: 'absolute', top: 0, right: 0,
        backgroundColor: '#9333EA', flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 12, paddingVertical: 6, borderBottomLeftRadius: 16,
        zIndex: 10,
    },
    premiumBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1 },

    // ─── Center Steps Enhanced ──────────
    centerStepEnhanced: { alignItems: 'center', paddingTop: 10 },
    successCelebrationCard: { width: '100%', borderRadius: 24, padding: 32, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#DCFCE7' },
    largeSuccessCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#22C55E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
    successTitle: { fontSize: 24, fontWeight: '800', color: '#166534', marginBottom: 4 },
    successSubtitle: { fontSize: 16, color: '#15803D', fontWeight: '500' },

    nextStepsCard: { backgroundColor: '#F8FAFC', borderRadius: 24, padding: 24, width: '100%', marginBottom: 32, borderWidth: 1, borderColor: '#E2E8F0' },
    nextStepsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    nextStepsTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    nextStepsDesc: { fontSize: 14, color: '#64748B', lineHeight: 20, marginBottom: 20 },
    journeyList: { gap: 16 },
    journeyItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    journeyIconBox: { width: 32, height: 32, borderRadius: 999, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
    journeyText: { fontSize: 14, fontWeight: '600', color: '#334155' },

    primaryBtnEnhanced: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#0A2463', borderRadius: 20, height: 64, width: '100%', gap: 8,
        shadowColor: '#0A2463', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
    },

    // ─── Step 4 Final ──────────────────
    readyVisualWrap: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
    readyIconGrid: { position: 'absolute', width: '100%', height: '100%' },
    readyIconBox: { position: 'absolute', width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    mainReadyCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#0A2463', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 12, borderWidth: 1, borderColor: '#F1F5F9' },

    megaTitle: { fontSize: 32, fontWeight: '900', color: '#0A2463', textAlign: 'center', marginBottom: 8 },
    megaSubtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', fontWeight: '500', marginBottom: 32 },
    welcomeCard: { paddingHorizontal: 20, marginBottom: 40 },
    welcomeText: { fontSize: 15, color: '#475569', textAlign: 'center', lineHeight: 24 },

    dashboardBtn: { width: '100%', borderRadius: 20, overflow: 'hidden', shadowColor: '#0A2463', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
    dashboardBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 68, gap: 12, paddingHorizontal: 24 },
    dashboardBtnText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },

    // ─── Modals ───────────────────────
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalSheet: {
        backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        maxHeight: '80%',
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A202C' },

    // ─── City Picker ──────────────────
    searchWrap: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F7FB',
        borderRadius: 12, paddingHorizontal: 14, height: 44, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0',
    },
    searchInput: { flex: 1, fontSize: 15, color: '#1A202C', marginLeft: 10 },
    cityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
    cityRowActive: { backgroundColor: '#EFF6FF', borderRadius: 10, marginHorizontal: -8, paddingHorizontal: 16 },
    cityText: { flex: 1, fontSize: 15, color: '#1A202C' },
    cityTextActive: { color: '#3A86FF', fontWeight: '600' },
    noCityText: { textAlign: 'center', color: '#94A3B8', fontSize: 14, paddingVertical: 20 },

    // ─── UPI Payment ──────────────────
    paymentSummary: { backgroundColor: '#F4F7FB', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
    payPlanName: { fontSize: 14, color: '#64748B', fontWeight: '500' },
    payAmount: { fontSize: 28, fontWeight: '700', color: '#1A202C', marginTop: 4 },
    paySubtext: { fontSize: 13, color: '#94A3B8', marginBottom: 12, textAlign: 'center' },
    upiRow: {
        flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FAFBFC',
        borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0',
    },
    upiIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: '#E2E8F0' },
    upiAppName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A202C' },
    upiAction: { fontSize: 14, fontWeight: '600', color: '#3A86FF' },
    payDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
    payManualBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#1A202C', borderRadius: 12, height: 48,
    },
    payManualText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

    // ─── Verification & Location Styles ───
    verifyFieldRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%' },
    verifyBtnSmall: { backgroundColor: '#3A86FF', paddingHorizontal: 16, height: 44, borderRadius: 14, minWidth: 70, alignItems: 'center', justifyContent: 'center', marginTop: 12, shadowColor: '#3A86FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
    verifiedBtn: { backgroundColor: '#22C55E', shadowColor: '#22C55E' },
    verifyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

    otpSubtext: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8 },
    resendRow: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
    resendAction: { color: '#3A86FF', fontSize: 14, fontWeight: '600' },
    timerText: { color: '#94A3B8', fontSize: 14 },
    attemptsText: { textAlign: 'center', marginTop: 12, fontSize: 12, color: '#94A3B8' },

    locationDetectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#EFF6FF', borderWidth: 2, borderStyle: 'dotted', borderColor: '#3A86FF', borderRadius: 16, padding: 20, width: '100%', marginBottom: 16 },
    locationDetectText: { color: '#3A86FF', fontSize: 15, fontWeight: '700' },
    addressSuccessBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#F0FFF4', borderRadius: 12, padding: 14, width: '100%', borderWidth: 1, borderColor: '#DCFCE7', marginBottom: 20 },
    addressText: { color: '#166534', fontSize: 13, flex: 1, lineHeight: 18 },
    bottomLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, paddingBottom: 10 },
    bottomLinkText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
    bottomLinkAction: { color: '#3A86FF', fontSize: 14, fontWeight: '700' },

    // ─── Premium Location Screen ──────
    locationTitlePremium: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 },
    locationSubtitlePremium: { fontSize: 15, fontWeight: '500', color: '#94A3B8', textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
    locationIllustration: { width: '100%', height: '100%' },
    locationPrimaryBtn: {
        backgroundColor: '#3A86FF', // Premium Blue for consistency
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        height: 58, borderRadius: 16, width: '100%', gap: 12,
        shadowColor: '#3A86FF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 6
    },
    locationPrimaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
    locationSecondaryBtn: { marginTop: 24, padding: 10 },
    locationSecondaryBtnText: { color: '#3A86FF', fontSize: 15, fontWeight: '700' },
    locationSuccessToast: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginTop: 20, gap: 8, borderWidth: 1, borderColor: '#BAE6FD' },
    locationSuccessText: { color: '#0369A1', fontSize: 13, fontWeight: '600' },
    locationErrorText: { color: '#EF4444', fontSize: 13, fontWeight: '600', marginTop: 16, textAlign: 'center' },
});
