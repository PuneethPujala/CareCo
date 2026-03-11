import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TriangleAlert, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme';
import { apiService } from '../../lib/api';

export default function HealthProfileScreen() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    const staggerAnims = useRef([...Array(10)].map(() => new Animated.Value(0))).current;

    const runAnimations = useCallback(() => {
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
                const { data } = await apiService.patients.getMe();
                setPatient(data.patient);
                runAnimations();
            } catch (err) {
                console.warn('Failed to load health profile:', err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [runAnimations]);


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
                <ShieldCheck size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A202C', textAlign: 'center', marginBottom: 8 }}>Premium Feature</Text>
                <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 }}>
                    Your centralized health profile (conditions, allergies, history) is included in the Basic Plan. Upgrade on the Home screen to build your health profile.
                </Text>
            </View>
        );
    }

    const conditions = patient?.conditions || [];
    const allergies = patient?.allergies || [];
    const history = patient?.medical_history || [];
    const meds = patient?.medications || [];
    const emergency = patient?.emergency_contact || {};

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0A2463', '#1E5FAD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                <View style={[styles.decorativeCircle, { top: -20, right: -20, opacity: 0.2 }]} />
                <View style={[styles.decorativeCircle, { bottom: -40, left: -30, width: 180, height: 180, opacity: 0.1 }]} />
                <Text style={styles.headerLabel}>CareCo</Text>
                <Text style={styles.headerTitle}>Health Profile</Text>
            </LinearGradient>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

                {/* Conditions */}
                <Animated.View style={{ opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <View style={styles.cardEnhanced}>
                        <Text style={styles.cardTitle}>CURRENT CONDITIONS</Text>
                        <View style={styles.chipWrap}>
                            {conditions.map((c, i) => (
                                <View key={i} style={styles.chipEnhanced}>
                                    <View style={styles.chipIndicator} />
                                    <Text style={styles.chipTxt}>{c.name}</Text>
                                    {c.status === 'managed' && <View style={styles.statusBadge}><Text style={styles.statusBadgeTxt}>Managed</Text></View>}
                                </View>
                            ))}
                            {conditions.length === 0 && <Text style={styles.emptyTxt}>No conditions recorded</Text>}
                        </View>
                    </View>
                </Animated.View>

                {/* Allergies */}
                <Animated.View style={{ opacity: staggerAnims[1], transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <View style={[styles.cardEnhanced, styles.alertBorderEnhanced]}>
                        <View style={styles.rowTitle}>
                            <Text style={[styles.cardTitle, { color: '#EF4444', marginBottom: 0 }]}>ALLERGIES</Text>
                            <TriangleAlert size={16} color="#EF4444" strokeWidth={2.5} />
                        </View>
                        <View style={styles.chipWrap}>
                            {allergies.map((a, i) => (
                                <View key={i} style={styles.chipDangerEnhanced}><Text style={styles.chipDangerTxt}>{a}</Text></View>
                            ))}
                            {allergies.length === 0 && <Text style={styles.emptyTxt}>No allergies recorded</Text>}
                        </View>
                    </View>
                </Animated.View>

                {/* Medical History Timeline */}
                <Animated.View style={{ opacity: staggerAnims[2], transform: [{ translateY: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <View style={styles.cardEnhanced}>
                        <Text style={styles.cardTitle}>MEDICAL HISTORY</Text>
                        <View style={styles.timelineContainer}>
                            {history.map((h, i) => (
                                <View key={i} style={styles.timelineRowEnhanced}>
                                    <View style={styles.timelineLeft}>
                                        <View style={styles.dotEnhanced} />
                                        {i < history.length - 1 && <View style={styles.lineEnhanced} />}
                                    </View>
                                    <View style={styles.timelineContentEnhanced}>
                                        <Text style={styles.timelineDateEnhanced}>
                                            {h.date ? new Date(h.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Unknown'}
                                        </Text>
                                        <Text style={styles.timelineTitleEnhanced}>{h.event}</Text>
                                        <Text style={styles.timelineDescEnhanced}>{h.notes}</Text>
                                    </View>
                                </View>
                            ))}
                            {history.length === 0 && <Text style={styles.emptyTxt}>No medical history available</Text>}
                        </View>
                    </View>
                </Animated.View>

                {/* Current Medications */}
                <Animated.View style={{ opacity: staggerAnims[3], transform: [{ translateY: staggerAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <View style={styles.cardEnhanced}>
                        <Text style={styles.cardTitle}>CURRENT MEDICATIONS</Text>
                        {meds.map((m, i) => (
                            <View key={i} style={styles.medRowEnhanced}>
                                <View style={styles.medCircleIcon}><ShieldCheck size={18} color={colors.accent} strokeWidth={2.5} /></View>
                                <View style={styles.medInfoEnhanced}>
                                    <Text style={styles.medNameEnhanced}>{m.name} — {m.dosage}</Text>
                                    <Text style={styles.medDetailEnhanced}>{m.frequency} • {m.times?.join(', ')} • {m.prescribed_by}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Emergency Contact */}
                <Animated.View style={{ opacity: staggerAnims[4], transform: [{ translateY: staggerAnims[4].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <LinearGradient colors={['#0F172A', '#1E293B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.managerCardEnhanced}>
                        <View style={styles.rowTitle}>
                            <View style={styles.managerIconBox}><ShieldCheck size={20} color="#4ADE80" strokeWidth={2.5} /></View>
                            <Text style={styles.managerLabelEnhanced}>EMERGENCY CONTACT</Text>
                        </View>
                        <Text style={styles.managerNameEnhanced}>{emergency.name || 'Not set'}</Text>
                        <Text style={styles.managerDetailEnhanced}>{emergency.relation} • {emergency.phone}</Text>
                    </LinearGradient>
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

    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 24 },

    cardEnhanced: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 20, shadowColor: '#0A2463', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4, borderWidth: 1, borderColor: '#F1F5F9' },
    cardTitle: { fontSize: 13, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.2, marginBottom: 20, textTransform: 'uppercase' },

    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chipEnhanced: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0' },
    chipIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginRight: 10 },
    chipTxt: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
    statusBadge: { backgroundColor: 'rgba(34,197,94,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 8 },
    statusBadgeTxt: { fontSize: 11, fontWeight: '700', color: '#16A34A' },

    alertBorderEnhanced: { borderColor: '#FEE2E2', backgroundColor: '#FFFBFB' },
    chipDangerEnhanced: { backgroundColor: '#FEE2E2', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1, borderColor: '#FECACA' },
    chipDangerTxt: { fontSize: 13, fontWeight: '700', color: '#DC2626' },

    timelineContainer: { marginTop: 4 },
    timelineRowEnhanced: { flexDirection: 'row', gap: 20, marginBottom: 24 },
    timelineLeft: { alignItems: 'center', width: 24 },
    dotEnhanced: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent, borderWidth: 3, borderColor: '#E0E7FF' },
    lineEnhanced: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 4 },
    timelineContentEnhanced: { flex: 1, paddingTop: 0 },
    timelineDateEnhanced: { fontSize: 12, fontWeight: '800', color: '#94A3B8', marginBottom: 4 },
    timelineTitleEnhanced: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    timelineDescEnhanced: { fontSize: 14, color: '#64748B', marginTop: 6, lineHeight: 22, fontWeight: '500' },

    medRowEnhanced: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
    medCircleIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
    medInfoEnhanced: { flex: 1 },
    medNameEnhanced: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    medDetailEnhanced: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '600' },

    managerCardEnhanced: { borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
    managerIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(74,222,128,0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
    managerLabelEnhanced: { fontSize: 12, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
    managerNameEnhanced: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginTop: 16 },
    managerDetailEnhanced: { fontSize: 14, color: '#BDD4EE', marginTop: 6, fontWeight: '600' },

    rowTitle: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    emptyTxt: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic', paddingVertical: 10 },
});

