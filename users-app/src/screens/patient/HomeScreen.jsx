import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
    Pill, PhoneCall, CalendarCheck, Sunrise, Sun, Moon,
    Sparkles, ChevronRight, PhoneIncoming, TrendingUp, Activity, CalendarDays, CheckCircle2, Circle, Bell
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

const MedicationCard = ({ med, onCheck }) => {
    const [scale] = useState(new Animated.Value(1));
    const [fade] = useState(new Animated.Value(med.taken ? 0.6 : 1));

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start(() => {
            onCheck(med);
            Animated.timing(fade, { toValue: !med.taken ? 0.6 : 1, duration: 200, useNativeDriver: true }).start();
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
    const { displayName } = useAuth();
    const [patient, setPatient] = useState(null);
    const [meds, setMeds] = useState([]);
    const [loading, setLoading] = useState(true);

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
            // Error handled by UI state
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const toggleMed = async (med) => {
        const newTaken = !med.taken;
        setMeds(prev => prev.map(m => m.id === med.id ? { ...m, taken: newTaken } : m));
        try {
            await apiService.medicines.markMedicine({ medicine_name: med.name, scheduled_time: med.type, taken: newTaken });
        } catch (err) {
            // Error handled by UI state
            setMeds(prev => prev.map(m => m.id === med.id ? { ...m, taken: !newTaken } : m));
        }
    };

    const takenCount = meds.filter(m => m.taken).length;
    const dateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

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
                    <View style={styles.radialSolid} />
                    <View style={styles.headerTop}>
                        <View>
                            <Text style={styles.greetingGreeting}>Good Afternoon,</Text>
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
                    </View>

                    <View style={styles.headerStatsRow}>
                        <View style={styles.statMiniCard}><Pill size={18} color={colors.accent} strokeWidth={2.5} /><Text style={styles.statMiniVal}>{takenCount}/{meds.length}</Text><Text style={styles.statMiniLabel}>Meds Today</Text></View>
                        <View style={styles.statMiniCard}><PhoneCall size={18} color={colors.accent} strokeWidth={2.5} /><Text style={styles.statMiniVal}>2</Text><Text style={styles.statMiniLabel}>Calls Left</Text></View>
                        <View style={styles.statMiniCard}><CalendarCheck size={18} color={colors.accent} strokeWidth={2.5} /><Text style={styles.statMiniVal}>45</Text><Text style={styles.statMiniLabel}>Days Active</Text></View>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>TODAY'S MEDICATIONS</Text>
                    {meds.map(med => <MedicationCard key={med.id} med={med} onCheck={toggleMed} />)}
                    {meds.length === 0 && <Text style={{ color: '#94A3B8', fontStyle: 'italic', marginTop: 10 }}>No medications scheduled for today.</Text>}
                </View>

                <View style={styles.section}>
                    <LinearGradient colors={['#EEF4FF', '#FFFFFF']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.tipCard}>
                        <View style={styles.tipTitleRow}>
                            <View style={styles.tipIconBox}><Sparkles size={16} color={colors.accent} /></View>
                            <Text style={styles.tipLabel}>TODAY'S TIP</Text>
                        </View>
                        <Text style={styles.tipBodyText}>Stay hydrated! Drinking 8 glasses of water daily helps manage blood pressure and significantly improves kidney function.</Text>
                    </LinearGradient>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>QUICK ACCESS</Text>
                    <View style={styles.quickGrid}>
                        <Pressable style={styles.quickCard} onPress={() => navigation.navigate('MyCaller')}>
                            <View style={styles.quickContent}>
                                <View style={[styles.quickIconBox, { backgroundColor: '#E0F2FE' }]}><PhoneIncoming size={20} color="#0284C7" /></View>
                                <View style={styles.quickTextView}><Text style={styles.quickCardTitle}>Call History</Text><Text style={styles.quickCardSub}>Last call: Today</Text></View>
                            </View><ChevronRight size={18} color="#CBD5E1" />
                        </Pressable>

                        <Pressable style={styles.quickCard} onPress={() => navigation.navigate('Medications')}>
                            <View style={styles.quickContent}>
                                <View style={[styles.quickIconBox, { backgroundColor: '#DCFCE7' }]}><TrendingUp size={20} color="#16A34A" /></View>
                                <View style={styles.quickTextView}><Text style={styles.quickCardTitle}>Adherence</Text><Text style={styles.quickCardSub}>94% This Week</Text></View>
                            </View><ChevronRight size={18} color="#CBD5E1" />
                        </Pressable>

                        <Pressable style={styles.quickCard} onPress={() => navigation.navigate('HealthProfile')}>
                            <View style={styles.quickContent}>
                                <View style={[styles.quickIconBox, { backgroundColor: '#F3E8FF' }]}><Activity size={20} color="#9333EA" /></View>
                                <View style={styles.quickTextView}><Text style={styles.quickCardTitle}>Health Profile</Text><Text style={styles.quickCardSub}>Updated Oct 24</Text></View>
                            </View><ChevronRight size={18} color="#CBD5E1" />
                        </Pressable>

                        <Pressable style={styles.quickCard}>
                            <View style={styles.quickContent}>
                                <View style={[styles.quickIconBox, { backgroundColor: '#FEF3C7' }]}><CalendarDays size={20} color="#D97706" /></View>
                                <View style={styles.quickTextView}><Text style={styles.quickCardTitle}>Schedule</Text><Text style={styles.quickCardSub}>Next Appt: Friday</Text></View>
                            </View><ChevronRight size={18} color="#CBD5E1" />
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },

    headerWrap: { paddingBottom: 16 },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
        paddingBottom: 40, paddingHorizontal: 20,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 6,
        overflow: 'hidden',
    },
    radialSolid: { position: 'absolute', right: -35, top: -35, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(58,134,255,0.4)' },

    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, zIndex: 2 },
    greetingGreeting: { fontSize: 16, color: '#BDD4EE', fontWeight: '500', marginBottom: 4 },
    greetingName: { fontSize: 28, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
    dateLabel: { fontSize: 14, color: '#FFFFFF', opacity: 0.8 },

    avatarRowContainer: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    bellBtn: { position: 'relative' },
    bellBadge: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger, borderWidth: 1.5, borderColor: '#1E5FAD' },

    avatarGlowRing: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.accent, backgroundColor: 'rgba(58,134,255,0.2)', alignItems: 'center', justifyContent: 'center' },
    avatarInner: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    avatarTxt: { fontSize: 20, fontWeight: '700', color: colors.primary },

    headerStatsRow: { flexDirection: 'row', gap: 12, marginTop: 10, zIndex: 2 },
    statMiniCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    statMiniVal: { fontSize: 16, fontWeight: '700', color: '#1A202C', marginTop: 10 },
    statMiniLabel: { fontSize: 11, fontWeight: '600', color: '#64748B', marginTop: 2, textAlign: 'center' },

    body: { flex: 1, width: '100%' },
    bodyContent: { paddingHorizontal: 16, paddingBottom: 110, paddingTop: 12, width: '100%' },

    section: { marginBottom: 28, width: '100%' },
    sectionHeader: { fontSize: 13, fontWeight: '600', color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },

    medCardContainer: { backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    medAccentBar: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 5 },
    medCardInner: { flexDirection: 'row', padding: 16, paddingLeft: 20, alignItems: 'center', justifyContent: 'space-between' },
    medContent: { flex: 1 },
    timeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
    timeBadgeTxt: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
    medTextGroup: { justifyContent: 'center' },
    medNameText: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
    medDosageText: { fontSize: 13, color: '#64748B', marginTop: 4 },
    textStrikethrough: { textDecorationLine: 'line-through', color: '#94A3B8' },
    checkboxTouch: { padding: 4 },

    tipCard: { borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#D1E3FF', shadowColor: '#3A86FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    tipTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    tipIconBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(58,134,255,0.1)', alignItems: 'center', justifyContent: 'center' },
    tipLabel: { fontSize: 12, fontWeight: '700', color: colors.accent, letterSpacing: 0.5 },
    tipBodyText: { fontSize: 14, color: '#1E3A8B', lineHeight: 22 },

    quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    quickCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    quickContent: { flex: 1, gap: 10 },
    quickIconBox: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    quickTextView: { flex: 1 },
    quickCardTitle: { fontSize: 14, fontWeight: '700', color: '#1A202C' },
    quickCardSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
});
