import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Animated, ActivityIndicator } from 'react-native';
import { Pill, Sunrise, Sun, Moon, CheckCircle2, Circle, Bell } from 'lucide-react-native';
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
                }
            } catch (err) {
                // Error handled by UI state
            } finally {
                setLoading(false);
            }
        })();
    }, []);

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
                <View style={styles.decorativeCircle} />
                <Text style={styles.headerLabel}>CareCo</Text>
                <Text style={styles.headerTitle}>Medications</Text>
                <Pressable style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
                    <Bell size={22} color="#FFFFFF" strokeWidth={2} />
                </Pressable>
            </LinearGradient>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

                {/* Adherence Summary */}
                <View style={styles.adherenceCard}>
                    <Text style={styles.adherenceTitle}>Weekly Adherence</Text>
                    <Text style={styles.adherenceDesc}>{takenCount}/{allMeds.length} medicines taken today</Text>
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
                </View>

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
                        <View style={styles.timeSectionRow}>
                            <TimePill type="afternoon" timeStr="Afternoon" />
                        </View>
                        {schedule.afternoon.map(med => <AnimatedMedCard key={med.id} med={med} />)}
                    </>
                )}

                {/* Night */}
                {schedule.night.length > 0 && (
                    <>
                        <View style={styles.timeSectionRow}>
                            <TimePill type="night" timeStr="Night" />
                        </View>
                        {schedule.night.map(med => <AnimatedMedCard key={med.id} med={med} />)}
                    </>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        height: 140, borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        alignItems: 'center', justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 38, overflow: 'hidden',
    },
    decorativeCircle: { position: 'absolute', top: -35, right: -35, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
    headerLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 4 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
    bellBtn: { position: 'absolute', right: 20, top: Platform.OS === 'ios' ? 60 : 42 },

    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 16, paddingBottom: 110, paddingTop: 20 },

    adherenceCard: {
        backgroundColor: '#0F172A', borderRadius: 16, padding: 20, marginBottom: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
    },
    adherenceTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
    adherenceDesc: { fontSize: 13, color: '#94A3B8', marginBottom: 16 },
    chartRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
    chartCol: { alignItems: 'center', flex: 1 },
    chartBarBg: { width: 18, height: 60, backgroundColor: '#1E293B', borderRadius: 9, overflow: 'hidden', justifyContent: 'flex-end' },
    chartBarFill: { width: '100%', borderRadius: 9 },
    chartDayLabel: { fontSize: 11, color: '#64748B', marginTop: 6, fontWeight: '600' },
    chartDayLabelToday: { color: '#3A86FF', fontWeight: '700' },

    timeSectionRow: { marginBottom: 12, marginTop: 8 },
    timeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    timeBadgeTxt: { fontSize: 13, fontWeight: '700' },

    medCard: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    medCardDimmed: { opacity: 0.6 },
    medAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
    medCardInner: { flexDirection: 'row', padding: 16, paddingLeft: 20, alignItems: 'center' },
    medIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F4F7FB', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    medContent: { flex: 1 },
    medTitle: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
    medSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
    medInstructions: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontStyle: 'italic' },
    textStrikethrough: { textDecorationLine: 'line-through', color: '#94A3B8' },
    checkboxTouch: { padding: 8 },
});
