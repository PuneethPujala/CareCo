import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TriangleAlert, ShieldCheck } from 'lucide-react-native';
import { colors } from '../../theme';
import { apiService } from '../../lib/api';

export default function HealthProfileScreen() {
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await apiService.patients.getMe();
                setPatient(data.patient);
            } catch (err) {
                console.warn('Failed to load health profile:', err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.accent} />
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
                <View style={styles.decorativeCircle} />
                <Text style={styles.headerLabel}>CareCo</Text>
                <Text style={styles.headerTitle}>Health Profile</Text>
            </LinearGradient>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>

                {/* Conditions */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>CURRENT CONDITIONS</Text>
                    <View style={styles.chipWrap}>
                        {conditions.map((c, i) => (
                            <View key={i} style={styles.chip}>
                                <Text style={styles.chipTxt}>{c.name}</Text>
                                {c.status === 'managed' && <Text style={styles.chipStatusManaged}>Managed</Text>}
                            </View>
                        ))}
                        {conditions.length === 0 && <Text style={styles.emptyTxt}>No conditions recorded</Text>}
                    </View>
                </View>

                {/* Allergies */}
                <View style={[styles.card, styles.alertBorder]}>
                    <View style={styles.rowTitle}>
                        <Text style={[styles.cardTitle, { color: colors.danger, marginBottom: 0 }]}>ALLERGIES</Text>
                        <TriangleAlert size={16} color={colors.danger} />
                    </View>
                    <View style={styles.chipWrap}>
                        {allergies.map((a, i) => (
                            <View key={i} style={styles.chipDanger}><Text style={styles.chipDangerTxt}>{a}</Text></View>
                        ))}
                        {allergies.length === 0 && <Text style={styles.emptyTxt}>No allergies recorded</Text>}
                    </View>
                </View>

                {/* Medical History Timeline */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>MEDICAL HISTORY</Text>
                    {history.map((h, i) => (
                        <View key={i} style={styles.timelineRow}>
                            <View style={styles.dot} />
                            {i < history.length - 1 && <View style={styles.line} />}
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineDate}>
                                    {h.date ? new Date(h.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Unknown'}
                                </Text>
                                <Text style={styles.timelineTitle}>{h.event}</Text>
                                <Text style={styles.timelineDesc}>{h.notes}</Text>
                            </View>
                        </View>
                    ))}
                    {history.length === 0 && <Text style={styles.emptyTxt}>No medical history available</Text>}
                </View>

                {/* Current Medications */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>CURRENT MEDICATIONS</Text>
                    {meds.map((m, i) => (
                        <View key={i} style={styles.medRow}>
                            <View style={styles.medDot} />
                            <View style={styles.medInfo}>
                                <Text style={styles.medName}>{m.name} — {m.dosage}</Text>
                                <Text style={styles.medDetail}>{m.frequency} • {m.times?.join(', ')} • {m.prescribed_by}</Text>
                                {m.instructions && <Text style={styles.medInstruction}>"{m.instructions}"</Text>}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Emergency Contact */}
                <View style={styles.managerCard}>
                    <View style={styles.rowTitle}>
                        <ShieldCheck size={18} color="#4ADE80" />
                        <Text style={styles.managerLabel}>EMERGENCY CONTACT</Text>
                    </View>
                    <Text style={styles.managerName}>{emergency.name || 'Not set'}</Text>
                    <Text style={styles.managerDetail}>{emergency.relation} • {emergency.phone}</Text>
                </View>

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

    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 16, paddingBottom: 110, paddingTop: 16 },

    card: {
        backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, marginBottom: 16,
        borderWidth: 1.5, borderColor: '#E2E8F0',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    alertBorder: { borderColor: '#FCA5A5' },
    cardTitle: { fontSize: 13, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, marginBottom: 14 },
    rowTitle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { backgroundColor: '#EFF6FF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
    chipTxt: { fontSize: 14, fontWeight: '600', color: '#3B82F6' },
    chipStatusManaged: { fontSize: 10, fontWeight: '700', color: '#16A34A', backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    chipDanger: { backgroundColor: '#FEF2F2', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    chipDangerTxt: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
    emptyTxt: { fontSize: 14, color: '#94A3B8', fontStyle: 'italic' },

    timelineRow: { flexDirection: 'row', marginBottom: 20, position: 'relative' },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent, marginTop: 5, marginRight: 14, zIndex: 1 },
    line: { position: 'absolute', left: 4, top: 15, width: 2, height: '100%', backgroundColor: '#E2E8F0' },
    timelineContent: { flex: 1 },
    timelineDate: { fontSize: 12, fontWeight: '600', color: '#94A3B8', marginBottom: 2 },
    timelineTitle: { fontSize: 15, fontWeight: '700', color: '#1A202C', marginBottom: 2 },
    timelineDesc: { fontSize: 13, color: '#4A5568', lineHeight: 20 },

    medRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
    medDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 6, marginRight: 12 },
    medInfo: { flex: 1 },
    medName: { fontSize: 15, fontWeight: '700', color: '#1A202C' },
    medDetail: { fontSize: 12, color: '#64748B', marginTop: 2 },
    medInstruction: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic', marginTop: 2 },

    managerCard: {
        backgroundColor: '#0F172A', borderRadius: 16, padding: 20, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6,
    },
    managerLabel: { fontSize: 13, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, marginLeft: 8 },
    managerName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 12 },
    managerDetail: { fontSize: 14, color: '#94A3B8', marginTop: 4 },
});
