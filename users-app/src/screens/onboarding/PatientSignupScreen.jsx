import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable, Platform,
    KeyboardAvoidingView, ScrollView, Animated, ActivityIndicator,
    Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    User, Mail, MapPin, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, AlertCircle,
    Search, X, CreditCard, Smartphone, ChevronDown,
} from 'lucide-react-native';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const STEP_LABELS = ['Basic Info', 'Choose Plan', 'Verification', 'Ready'];

const CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
    'Pune', 'Guntur', 'Vijayawada', 'Visakhapatnam', 'Ahmedabad', 'Jaipur',
    'Lucknow', 'Chandigarh', 'Indore', 'Bhopal', 'Nagpur', 'Coimbatore',
    'Kochi', 'Thiruvananthapuram', 'Surat', 'Vadodara',
];

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
    <View style={styles.stepRow}>
        {[1, 2, 3, 4].map((s, i) => (
            <React.Fragment key={s}>
                {i > 0 && <View style={styles.stepLine} />}
                <View style={[styles.stepDot, s === current && styles.stepDotActive, s < current && styles.stepDotDone]} />
            </React.Fragment>
        ))}
    </View>
);

const IconInput = ({ icon: Icon, label, rightIcon, error, focused, onFocus, onBlur, ...rest }) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.inputWrap, focused && styles.inputFocused, error && styles.inputError]}>
            <Icon size={18} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
                style={styles.textInput}
                placeholderTextColor="#94A3B8"
                onFocus={onFocus}
                onBlur={onBlur}
                {...rest}
            />
            {rightIcon}
        </View>
        {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
);

// ─── City Picker Modal ────────────────────
const CityPickerModal = ({ visible, onClose, onSelect, selectedCity }) => {
    const [search, setSearch] = useState('');
    const filtered = CITIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Your City</Text>
                        <Pressable onPress={onClose} hitSlop={12}><X size={22} color="#64748B" /></Pressable>
                    </View>
                    <View style={styles.searchWrap}>
                        <Search size={18} color="#94A3B8" />
                        <TextInput style={styles.searchInput} placeholder="Search city..." placeholderTextColor="#94A3B8" value={search} onChangeText={setSearch} />
                    </View>
                    <FlatList
                        data={filtered}
                        keyExtractor={item => item}
                        style={{ maxHeight: 300 }}
                        renderItem={({ item }) => (
                            <Pressable style={[styles.cityRow, item === selectedCity && styles.cityRowActive]} onPress={() => { onSelect(item); onClose(); }}>
                                <MapPin size={16} color={item === selectedCity ? '#3A86FF' : '#94A3B8'} />
                                <Text style={[styles.cityText, item === selectedCity && styles.cityTextActive]}>{item}</Text>
                                {item === selectedCity && <CheckCircle2 size={18} color="#3A86FF" />}
                            </Pressable>
                        )}
                        ListEmptyComponent={<Text style={styles.noCityText}>No cities found</Text>}
                    />
                </View>
            </View>
        </Modal>
    );
};

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
    const { signUp, signInWithGoogle, completeSignUp } = useAuth();
    const [step, setStep] = useState(route?.params?.step || 1);
    const [form, setForm] = useState({
        fullName: '', email: '', city: '', password: '', confirmPassword: '',
    });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [focusField, setFocusField] = useState('');
    const [errors, setErrors] = useState({});
    const [googleLoading, setGoogleLoading] = useState(false);
    const [cityModalVisible, setCityModalVisible] = useState(false);
    const [upiModalVisible, setUpiModalVisible] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

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
        if (!form.city.trim()) e.city = 'Please select your city';
        if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleStep1Continue = async () => {
        if (!validateStep1()) return;
        // Register account on step 1
        setSignupLoading(true);
        try {
            await signUp(form.email, form.password, form.fullName, 'patient', { city: form.city });
            setStep(2);
        } catch (error) {
            setErrors({ general: error?.message || 'Signup failed' });
        } finally {
            setSignupLoading(false);
        }
    };

    const handlePaymentSuccess = async () => {
        setUpiModalVisible(false);
        try {
            await apiService.patients.subscribe({ plan: 'basic', paid: 1 });
        } catch (err) {
            console.warn('Backend payment save failed:', err.message);
        }
        setStep(3);
    };

    const handleBack = () => {
        if (step > 1) setStep(prev => prev - 1);
    };

    const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;

    // ──── STEP 1 ────
    const renderStep1 = () => (
        <View>
            <Pressable style={styles.googleBtn} onPress={() => promptAsync()} disabled={!request || googleLoading}>
                <Text style={styles.googleG}>G</Text>
                <Text style={styles.googleBtnText}>{googleLoading ? 'Signing up...' : 'Continue with Google'}</Text>
            </Pressable>

            <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or sign up with email</Text>
                <View style={styles.dividerLine} />
            </View>

            {errors.general ? (
                <View style={styles.errorBox}>
                    <AlertCircle size={16} color="#EF4444" />
                    <Text style={styles.errorMsg}>{errors.general}</Text>
                </View>
            ) : null}

            <IconInput icon={User} label="Full Name" placeholder="Enter your full name"
                value={form.fullName} onChangeText={v => updateField('fullName', v)}
                focused={focusField === 'fullName'} onFocus={() => setFocusField('fullName')} onBlur={() => setFocusField('')}
                error={errors.fullName}
            />
            <IconInput icon={Mail} label="Email Address" placeholder="Enter your email"
                value={form.email} onChangeText={v => updateField('email', v)}
                autoCapitalize="none" keyboardType="email-address"
                focused={focusField === 'email'} onFocus={() => setFocusField('email')} onBlur={() => setFocusField('')}
                error={errors.email}
            />

            {/* City Dropdown */}
            <View style={styles.fieldGroup}>
                <Text style={styles.label}>City</Text>
                <Pressable style={[styles.inputWrap, errors.city && styles.inputError]} onPress={() => setCityModalVisible(true)}>
                    <MapPin size={18} color="#94A3B8" style={{ marginRight: 10 }} />
                    <Text style={[styles.textInput, { paddingVertical: 14 }, !form.city && { color: '#94A3B8' }]}>
                        {form.city || 'Select your city'}
                    </Text>
                    <ChevronDown size={18} color="#94A3B8" />
                </Pressable>
                {errors.city ? <Text style={styles.fieldError}>{errors.city}</Text> : null}
            </View>

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

            <Pressable style={[styles.primaryBtn, signupLoading && { opacity: 0.7 }]} onPress={handleStep1Continue} disabled={signupLoading}>
                {signupLoading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.primaryBtnText}>  Creating account...</Text>
                    </View>
                ) : (
                    <Text style={styles.primaryBtnText}>Continue</Text>
                )}
            </Pressable>

            <View style={styles.bottomLink}>
                <Text style={styles.bottomLinkText}>Already have an account?  </Text>
                <Pressable onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.bottomLinkAction}>Log In</Text>
                </Pressable>
            </View>

            <CityPickerModal
                visible={cityModalVisible}
                onClose={() => setCityModalVisible(false)}
                onSelect={city => updateField('city', city)}
                selectedCity={form.city}
            />
        </View>
    );

    // ──── STEP 2 ────
    const renderStep2 = () => (
        <View>
            <View style={styles.planCardGhost}>
                <Text style={styles.planTitleGhost}>Explore Features</Text>
                <Text style={styles.planDesc}>Limited preview — no care calls</Text>
            </View>

            <View style={styles.planCardPrimary}>
                <View style={styles.planBadge}><Text style={styles.planBadgeText}>RECOMMENDED</Text></View>
                <Text style={styles.planTitlePrimary}>Basic Plan</Text>
                <Text style={styles.planPrice}>₹500 / month</Text>
                <View style={styles.planFeatures}>
                    <Text style={styles.featureItem}>✓  Daily Care Calls</Text>
                    <Text style={styles.featureItem}>✓  Medication Tracking</Text>
                    <Text style={styles.featureItem}>✓  Assigned Caller</Text>
                    <Text style={styles.featureItem}>✓  Health History</Text>
                </View>
                <Pressable style={styles.primaryBtn} onPress={() => setUpiModalVisible(true)}>
                    <Text style={styles.primaryBtnText}>Subscribe — ₹500/mo</Text>
                </Pressable>
            </View>

            <UPIPaymentModal
                visible={upiModalVisible}
                onClose={() => setUpiModalVisible(false)}
                onSuccess={handlePaymentSuccess}
                planName="Basic Plan"
                planPrice="₹500 / month"
            />
        </View>
    );

    // ──── STEP 3 ────
    const renderStep3 = () => (
        <View style={styles.centerStep}>
            <View style={styles.successCircle}>
                <CheckCircle2 size={48} color="#22C55E" />
            </View>
            <Text style={styles.centerTitle}>Payment Successful!</Text>
            <Text style={styles.centerDesc}>
                Your onboarding call has been scheduled. A Care Caller will call you within 24 hours to:
            </Text>
            <View style={styles.callInfoCard}>
                <Text style={styles.callInfoItem}>📋  Collect your health details</Text>
                <Text style={styles.callInfoItem}>💊  Set up your medication schedule</Text>
                <Text style={styles.callInfoItem}>🩺  Note your medical history</Text>
                <Text style={styles.callInfoItem}>📞  Assign your dedicated care caller</Text>
            </View>
            <Text style={styles.keepPhoneText}>Please keep your phone available.</Text>
            <Pressable style={styles.primaryBtn} onPress={() => setStep(4)}>
                <Text style={styles.primaryBtnText}>Continue</Text>
            </Pressable>
        </View>
    );

    // ──── STEP 4 ────
    const renderStep4 = () => (
        <View style={styles.centerStep}>
            <View style={styles.successCircle}>
                <CheckCircle2 size={48} color={colors.accent} />
            </View>
            <Text style={styles.centerTitle}>You're All Set!</Text>
            <Text style={styles.centerDesc}>
                Your CareCo account is ready. Explore your dashboard while we schedule your onboarding call.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={completeSignUp}>
                <Text style={styles.primaryBtnText}>Go to Dashboard</Text>
            </Pressable>
        </View>
    );

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" bounces={false}>
                {/* Hero */}
                <Animated.View style={{ transform: [{ translateY: heroAnim }], opacity: heroOpacity }}>
                    <LinearGradient colors={['#0A2463', '#1E5FAD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
                        <View style={styles.decorativeCircle} />
                        <View style={styles.heroTopRow}>
                            {step > 1 ? (
                                <Pressable onPress={handleBack} hitSlop={12}><ArrowLeft size={22} color="#FFFFFF" /></Pressable>
                            ) : <View style={{ width: 22 }} />}
                            <Text style={styles.logoText}>CareCo</Text>
                            <View style={{ width: 22 }} />
                        </View>
                        <Text style={styles.heroTitle}>Create Your Account</Text>
                        <Text style={styles.heroSubtitle}>Step {step} of 4 · {STEP_LABELS[step - 1]}</Text>
                        <StepIndicator current={step} />
                        <View style={styles.stepChip}><Text style={styles.stepChipText}>{STEP_LABELS[step - 1]}</Text></View>
                    </LinearGradient>
                </Animated.View>

                {/* Form Card */}
                <Animated.View style={[styles.formCard, { transform: [{ translateY: cardAnim }], opacity: cardOpacity }]}>
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FB' },

    // ─── Hero ─────────────────────────
    hero: {
        height: 220, borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 56 : 38, overflow: 'hidden',
    },
    decorativeCircle: { position: 'absolute', top: -35, right: -35, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
    heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20, marginBottom: 8 },
    logoText: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
    heroTitle: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
    heroSubtitle: { fontSize: 13, color: '#BDD4EE', marginBottom: 12 },

    // ─── Steps ────────────────────────
    stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.35)' },
    stepDotActive: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFFFFF', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
    stepDotDone: { backgroundColor: '#FFFFFF' },
    stepLine: { width: 28, height: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 4 },
    stepChip: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
    stepChipText: { fontSize: 11, fontWeight: '600', color: '#FFFFFF' },

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
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    dividerText: { marginHorizontal: 12, fontSize: 12, color: '#94A3B8' },

    // ─── Error ────────────────────────
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEE2E2', borderRadius: 8, padding: 12, marginBottom: 16 },
    errorMsg: { color: '#EF4444', fontSize: 13, flex: 1 },

    // ─── Fields ───────────────────────
    fieldGroup: { marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#4A5568', marginBottom: 6 },
    inputWrap: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F7FB',
        borderWidth: 1.5, borderColor: '#BDD4EE', borderRadius: 12, height: 52, paddingHorizontal: 14,
    },
    inputFocused: { borderColor: '#3A86FF', backgroundColor: '#FFFFFF' },
    inputError: { borderColor: '#EF4444' },
    textInput: { flex: 1, fontSize: 15, color: '#1A202C' },
    fieldError: { fontSize: 12, color: '#EF4444', marginTop: 4, marginLeft: 4 },

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
    planCardGhost: { backgroundColor: '#FAFBFC', borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed', borderRadius: 16, padding: 20, marginBottom: 16 },
    planTitleGhost: { fontSize: 16, fontWeight: '700', color: '#4A5568' },
    planDesc: { fontSize: 13, color: '#64748B', marginTop: 4 },
    planCardPrimary: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: colors.accent, borderRadius: 16, padding: 20, marginBottom: 20 },
    planBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start', marginBottom: 8 },
    planBadgeText: { fontSize: 10, fontWeight: '700', color: colors.accent, letterSpacing: 0.5 },
    planTitlePrimary: { fontSize: 20, fontWeight: '700', color: '#1A202C' },
    planPrice: { fontSize: 28, fontWeight: '700', color: colors.accent, marginTop: 4, marginBottom: 16 },
    planFeatures: { marginBottom: 12 },
    featureItem: { fontSize: 14, color: '#4A5568', marginBottom: 8, lineHeight: 20 },

    // ─── Center Steps ─────────────────
    centerStep: { alignItems: 'center', paddingTop: 20 },
    successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0FFF4', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    centerTitle: { fontSize: 22, fontWeight: '700', color: '#1A202C', marginBottom: 12, textAlign: 'center' },
    centerDesc: { fontSize: 15, color: '#4A5568', textAlign: 'center', lineHeight: 22, marginBottom: 20, paddingHorizontal: 8 },
    callInfoCard: {
        backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, width: '100%', marginBottom: 20,
        borderWidth: 1, borderColor: '#E2E8F0',
    },
    callInfoItem: { fontSize: 14, color: '#1A202C', marginBottom: 10, lineHeight: 20 },
    keepPhoneText: { fontSize: 13, color: '#64748B', fontStyle: 'italic', marginBottom: 16 },

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
    upiAction: { fontSize: 14, fontWeight: '600', color: colors.accent },
    payDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
    payManualBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
        backgroundColor: '#1A202C', borderRadius: 12, height: 48,
    },
    payManualText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
