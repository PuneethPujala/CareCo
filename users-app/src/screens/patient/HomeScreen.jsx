import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Pill, PhoneCall, CalendarCheck, Sunrise, Sun, Moon,
    Sparkles, ChevronRight, PhoneIncoming, TrendingUp, Activity, CalendarDays, CheckCircle2, Circle, Bell,
    Heart, Wind, Thermometer, Droplets, MapPin
} from 'lucide-react-native';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../lib/api';

const ACCENT_MAP = { morning: colors.success, afternoon: colors.warning, night: '#8B5CF6' };
const TIME_LABELS = { morning: 'Morning', afternoon: 'Afternoon', night: 'Night' };

const TimeBadge = ({ type, timeStr }) => {
    let IconCmp, bg, color;
    if (type === 'morning') { IconCmp = Sunrise; bg = '#DCFCE7'; color = colors.success; }
    else if (type === 'afternoon') { IconCmp = Sun; bg = '#FEF3C7'; color = colors.warning; }
    else { IconCmp = Moon; bg = '#EDE9FE'; color = '#8B5CF6'; }

    return (
        <View style={[styles.timeBadge, { backgroundColor: bg }]}>
            <IconCmp size={14} color={color} strokeWidth={2.5} />
            <Text style={[styles.timeBadgeTxt, { color }]}>{timeStr}</Text>
        </View>
    );
};

const VitalsCard = ({ label, value, unit, icon: Icon, color, bg, status = 'Stable' }) => (
    <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.vitalsCardPremium}
    >
        <View style={styles.vitalsRowTop}>
            <View style={[styles.vitalsIconBoxPremium, { backgroundColor: color + '15' }]}>
                <Icon size={20} color={color} strokeWidth={2.5} />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: color + '10' }]}>
                <View style={[styles.statusDot, { backgroundColor: color }]} />
                <Text style={[styles.statusText, { color }]}>{status}</Text>
            </View>
        </View>

        <View style={styles.vitalsMainInfo}>
            <Text style={styles.vitalsLabelPremium}>{label}</Text>
            <View style={styles.vitalsValueRow}>
                <Text style={styles.vitalsValuePremium}>{value}</Text>
                <Text style={styles.vitalsUnitPremium}>{unit}</Text>
            </View>
        </View>

        <View style={styles.trendContainer}>
            <TrendingUp size={14} color="#22C55E" />
            <Text style={styles.trendText}>2% from yesterday</Text>
        </View>
    </LinearGradient>
);

const MedicationCard = ({ med, onCheck }) => {
    const [scale] = useState(new Animated.Value(1));
    const [fade] = useState(new Animated.Value(med.taken ? 0.6 : 1));

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
            Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
        ]).start(() => {
            onCheck(med);
            Animated.timing(fade, { toValue: !med.taken ? 0.6 : 1, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start();
        });
    };

    return (
        <Animated.View style={[styles.medCardContainer, { opacity: fade, transform: [{ scale }] }]}>
            <View style={[styles.medAccentBar, { backgroundColor: med.accent }]} />
            <View style={styles.medCardInner}>
                <View style={styles.medContent}>
                    <TimeBadge type={med.type} timeStr={med.time} />
                    <View style={styles.medTextGroup}>
                        <Text style={[styles.medNameText, med.taken && styles.textStrikethrough]}>{med.name}</Text>
                        <Text style={styles.medDosageText}>{med.dosage}</Text>
                    </View>
                </View>
                <Pressable onPress={handlePress} style={styles.checkboxTouch}>
                    {med.taken ? <CheckCircle2 size={28} color={colors.success} fill="#DCFCE7" /> : <Circle size={28} color="#CBD5E1" />}
                </Pressable>
            </View>
        </Animated.View>
    );
};

export default function PatientHomeScreen({ navigation }) {
    const { displayName, profile } = useAuth();
    const [patient, setPatient] = useState(null);
    const [meds, setMeds] = useState([]);
    const [loading, setLoading] = useState(true);

    const staggerAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;

    const runAnimations = useCallback(() => {
        staggerAnims.forEach(anim => anim.setValue(0));
        Animated.stagger(100,
            staggerAnims.map(anim =>
                Animated.spring(anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: Platform.OS !== 'web' })
            )
        ).start();
    }, [staggerAnims]);


    const fetchData = useCallback(async () => {
        try {
            // Get patient profile (auto-seeds basic profile if new)
            const pRes = await apiService.patients.getMe();
            const pData = pRes.data.patient;
            setPatient(pData);


            const { data } = await apiService.medicines.getToday();
            const medicines = (data.log?.medicines || []).map((m) => ({
                id: `${m.medicine_name}_${m.scheduled_time}`,
                name: m.medicine_name,
                dosage: m.scheduled_time === 'morning' ? '500mg' : m.scheduled_time === 'afternoon' ? '5mg' : '10mg',
                time: TIME_LABELS[m.scheduled_time] || m.scheduled_time,
                type: m.scheduled_time,
                taken: m.taken,
                accent: ACCENT_MAP[m.scheduled_time] || colors.accent,
            }));
            setMeds(medicines);
        } catch (err) {
            console.warn('Failed to fetch dashboard data:', err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        runAnimations();
    }, [fetchData, runAnimations]);


    const toggleMed = async (med) => {
        const newTaken = !med.taken;
        setMeds(prev => prev.map(m => m.id === med.id ? { ...m, taken: newTaken } : m));
        try {
            await apiService.medicines.markMedicine({ medicine_name: med.name, scheduled_time: med.type, taken: newTaken });
        } catch (err) {
            console.warn('Failed to mark med:', err.message);
            setMeds(prev => prev.map(m => m.id === med.id ? { ...m, taken: !newTaken } : m));
        }
    };

    const takenCount = meds.filter(m => m.taken).length;
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning,';
        if (hour < 17) return 'Good Afternoon,';
        return 'Good Evening,';
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerWrap}>
                <LinearGradient colors={['#0A2463', '#1E5FAD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
                    {/* Decorative Shapes */}
                    <View style={[styles.decorativeCircle, { top: -20, right: -20, opacity: 0.2 }]} />
                    <View style={[styles.decorativeCircle, { bottom: -40, left: -30, width: 180, height: 180, opacity: 0.1 }]} />

                    <Animated.View style={[styles.headerTop, { opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }] }]}>
                        <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                <MapPin size={12} color="#BDD4EE" />
                                <Text style={styles.locationLabel}>{patient?.city || profile?.city || 'Detecting...'}</Text>
                            </View>
                            <Text style={styles.greetingGreeting}>{getGreeting()}</Text>
                            <Text style={styles.greetingName}>{displayName?.split(' ')[0] || 'User'}</Text>
                            <Text style={styles.dateLabel}>{dateStr}</Text>
                        </View>
                        <View style={styles.avatarRowContainer}>
                            <Pressable style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
                                <Bell size={24} color="#FFFFFF" strokeWidth={2} />
                                <View style={styles.bellBadge} />
                            </Pressable>
                            <View style={styles.avatarGlowRing}>
                                <View style={styles.avatarInner}>
                                    <Text style={styles.avatarTxt}>{displayName?.charAt(0) || 'U'}</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </LinearGradient>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={[styles.headerStatsRow, { opacity: staggerAnims[1], transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
                    <View style={styles.statMiniCardEnhanced}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(14,165,233,0.1)' }]}><Pill size={18} color="#0EA5E9" /></View>
                        <Text style={styles.statMiniVal}>{takenCount}/{meds.length}</Text>
                        <Text style={styles.statMiniLabel}>Meds Taken</Text>
                    </View>
                    <View style={styles.statMiniCardEnhanced}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(34,197,94,0.1)' }]}><PhoneCall size={18} color="#22C55E" /></View>
                        <Text style={styles.statMiniVal}>2</Text>
                        <Text style={styles.statMiniLabel}>Calls Left</Text>
                    </View>
                    <View style={styles.statMiniCardEnhanced}>
                        <View style={[styles.statIconBox, { backgroundColor: 'rgba(234,179,8,0.1)' }]}><CalendarCheck size={18} color="#EAB308" /></View>
                        <Text style={styles.statMiniVal}>45</Text>
                        <Text style={styles.statMiniLabel}>Days Premium</Text>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: staggerAnims[2], transform: [{ translateY: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionHeader}>MY VITALS</Text>
                            <Pressable style={styles.viewAllBtn}>
                                <Text style={styles.viewAllText}>History</Text>
                                <ChevronRight size={14} color="#64748B" />
                            </Pressable>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vitalsScroll}>
                            <VitalsCard label="Heart Rate" value="72" unit="bpm" icon={Heart} color="#EF4444" status="Stable" />
                            <VitalsCard label="Blood Pressure" value="120/80" unit="mmHg" icon={Activity} color="#3B86FF" status="Normal" />
                            <VitalsCard label="Oxygen" value="98" unit="%" icon={Wind} color="#06B6D4" status="Good" />
                            <VitalsCard label="Hydration" value="1.8" unit="L" icon={Droplets} color="#0EA5E9" status="On Track" />
                        </ScrollView>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: staggerAnims[3], transform: [{ translateY: staggerAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>TODAY'S MEDICATIONS</Text>
                        {meds.map(med => <MedicationCard key={med.id} med={med} onCheck={toggleMed} />)}
                        {meds.length === 0 && <Text style={{ color: '#94A3B8', fontStyle: 'italic', marginTop: 10 }}>No medications scheduled for today.</Text>}
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: staggerAnims[3], transform: [{ translateY: staggerAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <View style={styles.section}>
                        <LinearGradient colors={['#EEF4FF', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.tipCardEnhanced}>
                            <View style={styles.tipTitleRow}>
                                <View style={styles.tipIconBox}><Sparkles size={16} color="#0EA5E9" /></View>
                                <Text style={styles.tipLabel}>DAILY HEALTH TIP</Text>
                            </View>
                            <Text style={styles.tipBodyText}>Stay hydrated! Drinking 8 glasses of water daily helps manage blood pressure and significantly improves kidney function.</Text>
                        </LinearGradient>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: staggerAnims[4], transform: [{ translateY: staggerAnims[4].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>
                        <View style={styles.quickGrid}>
                            <Pressable style={styles.quickCardEnhanced} onPress={() => navigation.navigate('MyCaller')}>
                                <View style={styles.quickContent}>
                                    <View style={[styles.quickIconBoxEnhanced, { backgroundColor: '#E0F2FE' }]}><PhoneIncoming size={20} color="#0284C7" /></View>
                                    <View style={styles.quickTextView}><Text style={styles.quickCardTitle}>Call History</Text><Text style={styles.quickCardSub}>View logs</Text></View>
                                </View><ChevronRight size={18} color="#CBD5E1" />
                            </Pressable>

                            <Pressable style={styles.quickCardEnhanced} onPress={() => navigation.navigate('Medications')}>
                                <View style={styles.quickContent}>
                                    <View style={[styles.quickIconBoxEnhanced, { backgroundColor: '#DCFCE7' }]}><TrendingUp size={20} color="#16A34A" /></View>
                                    <View style={styles.quickTextView}><Text style={styles.quickCardTitle}>Adherence</Text><Text style={styles.quickCardSub}>94% Weekly</Text></View>
                                </View><ChevronRight size={18} color="#CBD5E1" />
                            </Pressable>

                            <Pressable style={styles.quickCardEnhanced} onPress={() => navigation.navigate('HealthProfile')}>
                                <View style={styles.quickContent}>
                                    <View style={[styles.quickIconBoxEnhanced, { backgroundColor: '#F3E8FF' }]}><Activity size={20} color="#9333EA" /></View>
                                    <View style={styles.quickTextView}><Text style={styles.quickCardTitle}>Health Profile</Text><Text style={styles.quickCardSub}>Updated</Text></View>
                                </View><ChevronRight size={18} color="#CBD5E1" />
                            </Pressable>

                            <Pressable style={styles.quickCardEnhanced}>
                                <View style={styles.quickContent}>
                                    <View style={[styles.quickIconBoxEnhanced, { backgroundColor: '#FEF3C7' }]}><CalendarDays size={20} color="#D97706" /></View>
                                    <View style={styles.quickTextView}><Text style={styles.quickCardTitle}>Schedule</Text><Text style={styles.quickCardSub}>Next Appt</Text></View>
                                </View><ChevronRight size={18} color="#CBD5E1" />
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );

}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },

    headerWrap: { paddingBottom: 16 },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 25, paddingHorizontal: 20,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
        shadowColor: '#0A2463', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8,
        overflow: 'hidden',
    },
    decorativeCircle: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.15)' },

    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, zIndex: 2 },
    locationLabel: { fontSize: 12, color: '#BDD4EE', fontWeight: '600' },
    greetingGreeting: { fontSize: 14, color: '#BDD4EE', fontWeight: '600', marginBottom: 2 },
    greetingName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 4, letterSpacing: -0.5 },
    dateLabel: { fontSize: 13, color: '#FFFFFF', opacity: 0.7, fontWeight: '500' },

    avatarRowContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    bellBtn: { position: 'relative', width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    bellBadge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#1E5FAD' },

    avatarGlowRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#3A86FF', backgroundColor: 'rgba(58,134,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    avatarInner: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    avatarTxt: { fontSize: 18, fontWeight: '800', color: '#0A2463' },

    headerStatsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 0, // No longer overlaying
        paddingBottom: 20,
        width: '100%',
    },
    statMiniCardEnhanced: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: 'rgba(10, 36, 99, 0.15)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 1,
        shadowRadius: 15,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    statIconBox: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    statMiniVal: { fontSize: 16, fontWeight: '800', color: '#1E293B' },
    statMiniLabel: { fontSize: 10, fontWeight: '700', color: '#64748B', marginTop: 2, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },

    body: { flex: 1, width: '100%' },
    bodyContent: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 12, width: '100%' },

    section: { marginBottom: 32, width: '100%' },
    sectionHeader: { fontSize: 13, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 16, marginLeft: 4 },

    sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingRight: 4 },
    viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    viewAllText: { fontSize: 13, fontWeight: '700', color: '#64748B' },

    vitalsScroll: { paddingRight: 24, gap: 16 },
    vitalsCardPremium: {
        width: 170,
        borderRadius: 28,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: 'rgba(10, 36, 99, 0.1)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 6,
    },
    vitalsRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    vitalsIconBoxPremium: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

    vitalsMainInfo: { marginBottom: 16 },
    vitalsLabelPremium: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 4 },
    vitalsValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
    vitalsValuePremium: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
    vitalsUnitPremium: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },

    trendContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    trendText: { fontSize: 11, color: '#64748B', fontWeight: '500' },

    medCardContainer: { backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#0A2463', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    medAccentBar: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 6 },
    medCardInner: { flexDirection: 'row', padding: 18, paddingLeft: 22, alignItems: 'center', justifyContent: 'space-between' },
    medContent: { flex: 1 },
    timeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 10 },
    timeBadgeTxt: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
    medTextGroup: { justifyContent: 'center' },
    medNameText: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    medDosageText: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
    textStrikethrough: { textDecorationLine: 'line-through', color: '#94A3B8' },
    checkboxTouch: { padding: 4 },

    tipCardEnhanced: { borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E0F2FE', shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
    tipTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
    tipIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(14,165,233,0.1)', alignItems: 'center', justifyContent: 'center' },
    tipLabel: { fontSize: 12, fontWeight: '800', color: '#0EA5E9', letterSpacing: 1 },
    tipBodyText: { fontSize: 15, color: '#334155', lineHeight: 24, fontWeight: '500' },

    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
    quickCardEnhanced: { width: '47.5%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, borderWidth: 1.5, borderColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#0A2463', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    quickContent: { flex: 1, gap: 12 },
    quickIconBoxEnhanced: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    quickTextView: { flex: 1 },
    quickCardTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
    quickCardSub: { fontSize: 12, color: '#64748B', marginTop: 3, fontWeight: '600' },
});

