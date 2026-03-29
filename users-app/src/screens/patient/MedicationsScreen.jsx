import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Animated, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { Pill, Sunrise, Sun, Moon, CheckCircle2, Circle, Bell, Activity, Plus, Coffee, Utensils, BedDouble, AlertCircle, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle as SvgCircle } from 'react-native-svg';
import { colors } from '../../theme';
import { apiService } from '../../lib/api';

const { width } = Dimensions.get('window');

const ACCENT_MAP = { morning: colors.success, afternoon: colors.warning, night: '#8B5CF6' };
const TIME_LABELS = { morning: 'Morning', afternoon: 'Afternoon', night: 'Night' };

const FONT = {
    regular: { fontFamily: 'Inter_400Regular' },
    medium: { fontFamily: 'Inter_500Medium' },
    semiBold: { fontFamily: 'Inter_600SemiBold' },
    bold: { fontFamily: 'Inter_700Bold' },
    heavy: { fontFamily: 'Inter_800ExtraBold' },
};

const CircularProgress = ({ progress = 0, size = 64, strokeWidth = 8, color = '#6366F1' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    
    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <SvgCircle cx={size/2} cy={size/2} r={radius} stroke="#EEF2FF" strokeWidth={strokeWidth} fill="none" />
                <SvgCircle 
                    cx={size/2} cy={size/2} r={radius} 
                    stroke={color} strokeWidth={strokeWidth} fill="none" 
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
                    strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} 
                />
            </Svg>
            <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#1E293B' }}>{Math.round(progress)}%</Text>
            </View>
        </View>
    );
};

const TimePill = ({ type, timeStr }) => {
    let IconCmp, bg, color;
    if (type === 'morning') { IconCmp = Sunrise; bg = '#DCFCE7'; color = colors.success; }
    else if (type === 'afternoon') { IconCmp = Sun; bg = '#FEF3C7'; color = colors.warning; }
    else { IconCmp = Moon; bg = '#EDE9FE'; color = '#8B5CF6'; }

    return (
        <View style={styles.timeSectionHeaderWrapper}>
            <View style={[styles.timeBadge, { backgroundColor: bg }]}>
                <IconCmp size={14} color={color} strokeWidth={2.5} />
                <Text style={[styles.timeBadgeTxt, { color }]}>{timeStr}</Text>
            </View>
        </View>
    );
};

const AnimatedMedCard = ({ med, onToggle }) => {
    const [taken, setTaken] = useState(med.taken);
    const [scale] = useState(new Animated.Value(1));

    const handleCheck = async () => {
        const newVal = !taken;
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
        setTaken(newVal);
        try {
            await apiService.medicines.markMedicine({ medicine_name: med.name, scheduled_time: med.type, taken: newVal });
        } catch (err) {
            console.warn('Failed to mark medicine:', err.message);
            setTaken(!newVal); // rollback
        }
    };

    let ContextIcon = Coffee;
    if (med.type === 'afternoon') ContextIcon = Utensils;
    if (med.type === 'night') ContextIcon = BedDouble;

    return (
        <View style={[styles.medCard, taken && styles.medCardDimmed]}>
            <View style={[styles.medAccentBar, { backgroundColor: med.accent }]} />
            <View style={styles.medCardInner}>
                <View style={styles.medIconBox}>
                    <Pill size={22} color={med.accent} strokeWidth={2.5} />
                </View>
                <View style={styles.medContent}>
                    <Text style={[styles.medTitle, taken && styles.textStrikethrough]}>{med.name}</Text>
                    <Text style={styles.medSub}>{med.dosage}</Text>
                    
                    <View style={styles.medContextRow}>
                        <ContextIcon size={12} color="#94A3B8" />
                        <Text style={styles.medInstructions}>{med.instructions}</Text>
                    </View>
                </View>
                <Pressable onPress={handleCheck} style={styles.checkboxTouch}>
                    <Animated.View style={{ transform: [{ scale }] }}>
                        {taken ? (
                            <CheckCircle2 color={colors.success} fill="#DCFCE7" size={34} />
                        ) : (
                            <Circle color="#CBD5E1" size={34} />
                        )}
                    </Animated.View>
                </Pressable>
            </View>
        </View>
    );
};

export default function MedicationsScreen({ navigation }) {
    const [patient, setPatient] = useState(null);
    const [schedule, setSchedule] = useState({ morning: [], afternoon: [], night: [] });
    const [adherence, setAdherence] = useState([]);
    const [loading, setLoading] = useState(true);

    const staggerAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;

    const runAnimations = useCallback(() => {
        staggerAnims.forEach(anim => anim.setValue(0));
        Animated.stagger(80,
            staggerAnims.map(anim =>
                Animated.spring(anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
            )
        ).start();
    }, [staggerAnims]);

    useEffect(() => {
        (async () => {
            try {
                const pRes = await apiService.patients.getMe();
                setPatient(pRes.data.patient);

                if (pRes.data.patient?.subscription?.plan !== 'free') {
                    const [todayRes, weeklyRes] = await Promise.all([
                        apiService.medicines.getToday(),
                        apiService.medicines.getWeeklyAdherence(),
                    ]);

                    const medicines = todayRes.data.log?.medicines || [];
                    const grouped = { morning: [], afternoon: [], night: [] };
                    medicines.forEach(m => {
                        const slot = m.scheduled_time;
                        grouped[slot] = grouped[slot] || [];
                        grouped[slot].push({
                            id: `${m.medicine_name}_${slot}`,
                            name: m.medicine_name,
                            dosage: slot === 'morning' ? '500mg' : slot === 'afternoon' ? '5mg' : '10mg',
                            instructions: slot === 'morning' ? 'Take with food' : slot === 'afternoon' ? 'Take after lunch' : 'Take before sleep',
                            time: TIME_LABELS[slot],
                            type: slot,
                            taken: m.taken,
                            accent: ACCENT_MAP[slot],
                        });
                    });
                    setSchedule(grouped);

                    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                    const weeklyData = (weeklyRes.data.adherence || []).map(d => ({
                        day: days[new Date(d.date).getDay()],
                        p: d.rate,
                        isToday: new Date(d.date).toDateString() === new Date().toDateString(),
                    }));
                    setAdherence(weeklyData);
                    runAnimations();
                }
            } catch (err) {
                console.warn('Failed to load medications:', err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [runAnimations]);


    const allMeds = [...(schedule.morning || []), ...(schedule.afternoon || []), ...(schedule.night || [])];
    const takenCount = allMeds.filter(m => m.taken).length;
    const progressPerc = allMeds.length > 0 ? (takenCount / allMeds.length) * 100 : 0;

    if (loading) {
        return (
            <LinearGradient colors={['#F8FAFC', '#EEF2FF']} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={'#6366F1'} />
            </LinearGradient>
        );
    }

    if (patient?.subscription?.plan === 'free') {
        return (
            <LinearGradient colors={['#F8FAFC', '#EEF2FF']} style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
                <View style={styles.upgradeIconWrap}><Pill size={32} color={'#6366F1'} /></View>
                <Text style={styles.upgradeTitle}>Premium Feature</Text>
                <Text style={styles.upgradeBody}>Medication tracking and adherence insights are included in the Premium Plan. Upgrade to manage your daily schedule.</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={['#F8FAFC', '#EEF2FF']} style={styles.container}>
            <View style={[styles.headerWrap, { zIndex: 10 }]}>
                <Animated.View style={[styles.minimalHeader, { opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
                    <View style={styles.mainHeaderRow}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.headerLabel}>CARE RECORD</Text>
                            <Text style={styles.headerTitle}>Medications</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <Pressable style={styles.headerBtn} onPress={() => navigation.navigate('Notifications')}>
                                <Bell size={20} color={'#0F172A'} strokeWidth={2.5} />
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
                {allMeds.length === 0 ? (
                    <Animated.View style={[styles.emptyStateContainer, { opacity: staggerAnims[1], transform: [{ scale: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }]}>
                        <View style={styles.emptyIconCircle}>
                            <Calendar size={40} color="#6366F1" strokeWidth={1.5} />
                        </View>
                        <Text style={styles.emptyTitle}>You're all clear!</Text>
                        <Text style={styles.emptyBody}>You have no medications scheduled for today. Kick back and relax, or add a new medication below.</Text>
                        <Pressable style={styles.emptyAddBtn} onPress={() => Alert.alert('Coming Soon', 'You will soon be able to add medications directly from this screen.')}>
                            <Plus size={16} color="#FFF" style={{ marginRight: 6 }} />
                            <Text style={styles.emptyAddBtnTxt}>Add Medication</Text>
                        </Pressable>
                    </Animated.View>
                ) : (
                    <>
                        {/* Daily Progress Hero */}
                        <Animated.View style={{ opacity: staggerAnims[1], transform: [{ scale: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
                            <View style={styles.heroCard}>
                                <View style={styles.heroLeft}>
                                    <Text style={styles.heroTitle}>Today's Progress</Text>
                                    <Text style={styles.heroSub}>{takenCount} of {allMeds.length} medications taken</Text>
                                    <View style={styles.streakBadge}>
                                        <Activity size={12} color="#10B981" strokeWidth={3} />
                                        <Text style={styles.streakBadgeTxt}>On track!</Text>
                                    </View>
                                </View>
                                <CircularProgress progress={progressPerc} size={72} strokeWidth={8} color="#6366F1" />
                            </View>
                        </Animated.View>

                        {/* Weekly Adherence Mini Bar */}
                        <Animated.View style={{ opacity: staggerAnims[2], transform: [{ translateY: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                            <View style={styles.weeklyCard}>
                                <Text style={styles.weeklyTitle}>Weekly Adherence</Text>
                                <View style={styles.chartRow}>
                                    {adherence.map((d, i) => (
                                        <View key={i} style={styles.chartCol}>
                                            <View style={styles.chartBarBg}>
                                                <View style={[styles.chartBarFill, { height: `${d.p}%`, backgroundColor: d.p >= 75 ? '#4ADE80' : d.p > 0 ? '#FBBF24' : '#E2E8F0' }]} />
                                            </View>
                                            <Text style={[styles.chartDayLabel, d.isToday && styles.chartDayLabelToday]}>{d.day}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </Animated.View>

                        {/* List Schedule Sections */}
                        <Animated.View style={{ opacity: staggerAnims[3], transform: [{ translateY: staggerAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                            <View style={styles.timelineContainer}>
                                {/* Morning */}
                                {schedule.morning.length > 0 && (
                                    <>
                                        <TimePill type="morning" timeStr="Morning" />
                                        {schedule.morning.map((med, idx) => (
                                            <AnimatedMedCard key={med.id} med={med} />
                                        ))}
                                    </>
                                )}

                                {/* Afternoon */}
                                {schedule.afternoon.length > 0 && (
                                    <>
                                        <TimePill type="afternoon" timeStr="Afternoon" />
                                        {schedule.afternoon.map((med, idx) => (
                                            <AnimatedMedCard key={med.id} med={med} />
                                        ))}
                                    </>
                                )}

                                {/* Night */}
                                {schedule.night.length > 0 && (
                                    <>
                                        <TimePill type="night" timeStr="Night" />
                                        {schedule.night.map((med, idx) => (
                                            <AnimatedMedCard key={med.id} med={med} />
                                        ))}
                                    </>
                                )}
                            </View>
                        </Animated.View>
                    </>
                )}
            </ScrollView>

            {/* Floating Action Button */}
            <Animated.View style={[styles.fabWrapper, { opacity: staggerAnims[4], transform: [{ scale: staggerAnims[4].interpolate({ inputRange: [0, 1], outputRange: [0, 1] }) }] }]}>
                <Pressable style={styles.fab} onPress={() => Alert.alert('Coming Soon', 'You will soon be able to add medications directly from this screen.')}>
                    <LinearGradient colors={['#6366F1', '#4338CA']} style={styles.fabGradient}>
                        <Plus size={24} color="#FFF" strokeWidth={3} />
                    </LinearGradient>
                </Pressable>
            </Animated.View>
        </LinearGradient>
    );

}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'transparent' },
    headerWrap: { zIndex: 10 },
    minimalHeader: { paddingTop: Platform.OS === 'ios' ? 70 : 50, paddingHorizontal: 24, paddingBottom: 16, backgroundColor: 'transparent' },
    mainHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { flex: 1 },
    headerLabel: { fontSize: 13, fontWeight: '800', color: '#6366F1', letterSpacing: 1.5, marginBottom: 4 },
    headerTitle: { fontSize: 32, fontWeight: '800', color: '#0F172A', letterSpacing: -1 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0' },

    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 20, paddingBottom: 140, paddingTop: 12 },

    // Empty State
    emptyStateContainer: { backgroundColor: '#FFF', borderRadius: 28, padding: 32, alignItems: 'center', marginTop: 24, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 4 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 8, textAlign: 'center' },
    emptyBody: { fontSize: 15, fontWeight: '500', color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
    emptyAddBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#6366F1', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 100 },
    emptyAddBtnTxt: { fontSize: 15, fontWeight: '700', color: '#FFF' },

    // Upgrade State
    upgradeIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
    upgradeTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
    upgradeBody: { fontSize: 16, fontWeight: '500', color: '#64748B', textAlign: 'center', lineHeight: 24 },

    // Hero Daily Progress
    heroCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 16, elevation: 4 },
    heroLeft: { flex: 1, paddingRight: 16 },
    heroTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
    heroSub: { fontSize: 14, fontWeight: '500', color: '#64748B', marginBottom: 12 },
    streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', gap: 6 },
    streakBadgeTxt: { fontSize: 12, fontWeight: '700', color: '#10B981' },

    // Weekly Mini Card
    weeklyCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 28, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 2 },
    weeklyTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
    chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    chartCol: { alignItems: 'center', flex: 1 },
    chartBarBg: { width: 12, height: 48, backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
    chartBarFill: { width: '100%', borderRadius: 6 },
    chartDayLabel: { fontSize: 10, color: '#94A3B8', marginTop: 8, fontWeight: '700', textTransform: 'uppercase' },
    chartDayLabelToday: { color: '#6366F1', fontWeight: '800' },

    // Section Headers
    timelineContainer: { paddingLeft: 0, paddingRight: 0 },
    timeSectionHeaderWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 4 },
    timeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, gap: 8 },
    timeBadgeTxt: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Medication Card
    medCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 16, overflow: 'hidden', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F1F5F9' },
    medCardDimmed: { opacity: 0.6 },
    medAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
    medCardInner: { flexDirection: 'row', padding: 18, paddingLeft: 22, alignItems: 'center' },
    medIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    medContent: { flex: 1 },
    medTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
    medSub: { fontSize: 14, color: '#475569', fontWeight: '700', marginBottom: 6 },
    medContextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    medInstructions: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    textStrikethrough: { textDecorationLine: 'line-through', color: '#94A3B8' },
    checkboxTouch: { padding: 8 },

    // FAB
    fabWrapper: { position: 'absolute', bottom: Platform.OS === 'ios' ? 110 : 100, right: 24, zIndex: 100 },
    fab: { width: 64, height: 64, borderRadius: 32, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
    fabGradient: { flex: 1, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});
