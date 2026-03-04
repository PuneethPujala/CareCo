import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, CheckCircle2, ChevronRight, Activity } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme';

const PATIENTS = [
    { id: '1', name: 'Alok Gupta', age: 68, condition: 'Type 2 Diabetes', status: 'Pending', statusColor: '#94A3B8', lastCalled: 'Yesterday' },
    { id: '2', name: 'Sarita Sharma', age: 72, condition: 'Hypertension', status: 'Called', statusColor: colors.success, lastCalled: 'Today' },
    { id: '3', name: 'Rajesh Kumar', age: 65, condition: 'Post-Surgery', status: 'Missed', statusColor: colors.warning, lastCalled: '2 days ago' },
    { id: '4', name: 'Meena Devi', age: 75, condition: 'Osteoarthritis', status: 'Escalated', statusColor: colors.danger, lastCalled: '4 days ago' },
];

export default function CallerHomeScreen({ navigation }) {
    const { displayName } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <LinearGradient
                    colors={['#0A2463', '#1E5FAD']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.headerGradient}
                >
                    <View style={styles.radialGlow} />

                    <Text style={styles.greeting}>Caller Desk: {displayName}</Text>
                    <Text style={styles.dateLabel}>Today's Patients — Oct 24, 2023</Text>

                    <View style={styles.progressContainer}>
                        <View style={styles.progressTextRow}>
                            <Text style={styles.progressTxt}>12 / 30 Called</Text>
                            <Text style={styles.progressPct}>40%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View style={[styles.progressBarFill, { width: '40%' }]} />
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <FlatList
                data={PATIENTS}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <Pressable style={styles.card}>
                        <View style={[styles.cardAccent, { backgroundColor: item.statusColor }]} />

                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.patientName}>{item.name}</Text>
                                <Text style={styles.patientMeta}>{item.age} yrs • {item.condition}</Text>
                            </View>
                            <View style={[styles.statusChip, { backgroundColor: item.statusColor + '15', borderColor: item.statusColor }]}>
                                <Text style={[styles.statusTxt, { color: item.statusColor }]}>{item.status}</Text>
                            </View>
                        </View>

                        <View style={styles.cardActions}>
                            <Pressable style={styles.actionBtnPrimary}>
                                <Phone size={14} color="#FFF" />
                                <Text style={styles.actionBtnPrimaryTxt}>Log Call</Text>
                            </Pressable>

                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Pressable style={styles.actionBtnOutlined}>
                                    <Text style={styles.actionBtnTxt}>No Answer</Text>
                                </Pressable>
                                <Pressable style={styles.actionBtnDanger}>
                                    <Text style={styles.actionBtnDangerTxt}>Refused</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FB' },

    header: { paddingBottom: 16 },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
        paddingBottom: 32, paddingHorizontal: 20,
        borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 6,
        overflow: 'hidden',
    },
    radialGlow: { position: 'absolute', right: -50, top: -20, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(58,134,255,0.4)', blurRadius: 40 },

    greeting: { fontSize: 13, color: '#BDD4EE', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, zIndex: 2 },
    dateLabel: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginTop: 4, marginBottom: 20, zIndex: 2 },

    progressContainer: { marginTop: 4, zIndex: 2 },
    progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    progressTxt: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    progressPct: { color: colors.accent, fontSize: 14, fontWeight: '700' },
    progressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 },
    progressBarFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 3 },

    listContent: { paddingHorizontal: 16, paddingBottom: 40 },
    card: {
        backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, paddingLeft: 20, marginBottom: 12, overflow: 'hidden',
        borderWidth: 1, borderColor: '#E2E8F0',
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1,
    },
    cardAccent: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 4 },

    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    patientName: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
    patientMeta: { fontSize: 13, color: '#64748B', marginTop: 3 },
    statusChip: {
        borderWidth: 1, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4,
    },
    statusTxt: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

    cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    actionBtnPrimary: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 6,
    },
    actionBtnPrimaryTxt: { color: '#FFF', fontSize: 13, fontWeight: '600' },

    actionBtnOutlined: {
        borderWidth: 1, borderColor: '#CBD5E1', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6,
    },
    actionBtnTxt: { color: '#4A5568', fontSize: 13, fontWeight: '600' },

    actionBtnDanger: {
        backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6,
    },
    actionBtnDangerTxt: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
