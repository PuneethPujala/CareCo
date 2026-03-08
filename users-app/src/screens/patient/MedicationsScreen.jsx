import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Animated, ActivityIndicator } from 'react-native';
import { Pill, Sunrise, Sun, Moon, CheckCircle2, Circle, Bell, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { apiService } from '../../lib/api';

const ACCENT_MAP = { morning: colors.success, afternoon: colors.warning, night: '#8B5CF6' };
const TIME_LABELS = { morning: 'Morning', afternoon: 'Afternoon', night: 'Night' };

const TimePill = ({ type, timeStr }) => {
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
            // Error handled by UI state
            setTaken(!newVal); // rollback
        }
    };

    return (
        <View style={[styles.medCard, taken && styles.medCardDimmed]}>
            <View style={[styles.medAccentBar, { backgroundColor: med.accent }]} />
            <View style={styles.medCardInner}>
                <View style={styles.medIconBox}>
                    <Pill size={20} color={med.accent} strokeWidth={2.5} />
                </View>
                <View style={styles.medContent}>
                    <Text style={[styles.medTitle, taken && styles.textStrikethrough]}>{med.name}</Text>
                    <Text style={styles.medSub}>{med.dosage}</Text>
                    <Text style={styles.medInstructions}>{med.instructions}</Text>
                </View>
                <Pressable onPress={handleCheck} style={styles.checkboxTouch}>
                    <Animated.View style={{ transform: [{ scale }] }}>
                        {taken ? (
                            <CheckCircle2 color={colors.success} fill="#DCFCE7" size={32} />
                        ) : (
                            <Circle color="#CBD5E1" size={32} />
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

    const staggerAnims = React.useRef([...Array(10)].map(() => new Animated.Value(0))).current;

    const runAnimations = React.useCallback(() => {
        staggerAnims.forEach(anim => anim.setValue(0));
        Animated.stagger(100,
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

                    // Build adherence chart from weekly data
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
                // Error handled by UI state
            } finally {
                setLoading(false);
            }
        })();
    }, [runAnimations]);


    const allMeds = [...(schedule.morning || []), ...(schedule.afternoon || []), ...(schedule.night || [])];
    const takenCount = allMeds.filter(m => m.taken).length;

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (patient?.subscription?.plan === 'free') {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Pill size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A202C', textAlign: 'center', marginBottom: 8 }}>Premium Feature</Text>
                <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 }}>
                    Medication tracking and adherence insights are included in the Basic Plan. Upgrade on the Home screen to manage your daily schedule.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0A2463', '#1E5FAD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                <View style={[styles.decorativeCircle, { top: -20, right: -20, opacity: 0.2 }]} />
                <View style={[styles.decorativeCircle, { bottom: -40, left: -30, width: 180, height: 180, opacity: 0.1 }]} />
                <Text style={styles.headerLabel}>CareCo</Text>
                <Text style={styles.headerTitle}>Medication Schedule</Text>
                <Pressable style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
                    <Bell size={22} color="#FFFFFF" strokeWidth={2} />
                </Pressable>
            </LinearGradient>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

                {/* Adherence Summary */}
                <Animated.View style={{ opacity: staggerAnims[0], transform: [{ scale: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
                    <LinearGradient colors={['#0F172A', '#1E293B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.adherenceCardEnhanced}>
                        <View style={styles.adherenceHeader}>
                            <View>
                                <Text style={styles.adherenceTitle}>Weekly Adherence</Text>
                                <Text style={styles.adherenceDesc}>{takenCount}/{allMeds.length} medicines taken today</Text>
                            </View>
                            <View style={styles.circularProgressMini}>
                                <Activity size={20} color="#4ADE80" strokeWidth={2.5} />
                            </View>
                        </View>
                        <View style={styles.chartRow}>
                            {adherence.map((d, i) => (
                                <View key={i} style={styles.chartCol}>
                                    <View style={styles.chartBarBg}>
                                        <View style={[styles.chartBarFill, { height: `${d.p}%`, backgroundColor: d.p >= 75 ? '#4ADE80' : d.p > 0 ? '#FBBF24' : '#334155' }]} />
                                    </View>
                                    <Text style={[styles.chartDayLabel, d.isToday && styles.chartDayLabelToday]}>{d.day}</Text>
                                </View>
                            ))}
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Schedule Sections */}
                <Animated.View style={{ opacity: staggerAnims[1], transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    {/* Morning */}
                    {schedule.morning.length > 0 && (
                        <>
                            <View style={styles.timeSectionRow}>
                                <TimePill type="morning" timeStr="Morning" />
                            </View>
                            {schedule.morning.map(med => <AnimatedMedCard key={med.id} med={med} />)}
                        </>
                    )}

                    {/* Afternoon */}
                    {schedule.afternoon.length > 0 && (
                        <>
                            <View style={[styles.timeSectionRow, { marginTop: 16 }]}>
                                <TimePill type="afternoon" timeStr="Afternoon" />
                            </View>
                            {schedule.afternoon.map(med => <AnimatedMedCard key={med.id} med={med} />)}
                        </>
                    )}

                    {/* Night */}
                    {schedule.night.length > 0 && (
                        <>
                            <View style={[styles.timeSectionRow, { marginTop: 16 }]}>
                                <TimePill type="night" timeStr="Night" />
                            </View>
                            {schedule.night.map(med => <AnimatedMedCard key={med.id} med={med} />)}
                        </>
                    )}
                </Animated.View>
            </ScrollView>
        </View>
    );

}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        height: 140, borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        alignItems: 'center', justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 70 : 50, overflow: 'hidden',
    },
    decorativeCircle: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.15)' },
    headerLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 4 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
    bellBtn: { position: 'absolute', right: 20, top: Platform.OS === 'ios' ? 70 : 50 },

    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 24 },

    adherenceCardEnhanced: {
        borderRadius: 20, padding: 24, marginBottom: 28,
        shadowColor: '#0A2463', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
    },
    adherenceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    adherenceTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
    adherenceDesc: { fontSize: 13, color: '#94A3B8', fontWeight: '500' },
    circularProgressMini: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(74,222,128,0.1)', alignItems: 'center', justifyContent: 'center' },

    chartRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 8 },
    chartCol: { alignItems: 'center', flex: 1 },
    chartBarBg: { width: 14, height: 60, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 7, overflow: 'hidden', justifyContent: 'flex-end' },
    chartBarFill: { width: '100%', borderRadius: 7 },
    chartDayLabel: { fontSize: 11, color: '#64748B', marginTop: 10, fontWeight: '700', textTransform: 'uppercase' },
    chartDayLabelToday: { color: '#3A86FF', fontWeight: '800' },

    timeSectionRow: { marginBottom: 16, marginTop: 4 },
    timeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 8 },
    timeBadgeTxt: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },

    medCard: { backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#0A2463', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3 },
    medCardDimmed: { opacity: 0.6 },
    medAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 6 },
    medCardInner: { flexDirection: 'row', padding: 18, paddingLeft: 24, alignItems: 'center' },
    medIconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    medContent: { flex: 1 },
    medTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
    medSub: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '600' },
    medInstructions: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontStyle: 'italic', fontWeight: '500' },
    textStrikethrough: { textDecorationLine: 'line-through', color: '#94A3B8' },
    checkboxTouch: { padding: 8 },
});

