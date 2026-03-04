import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Modal, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, PhoneIncoming, AlertTriangle, ShieldCheck, Flag, CalendarCheck, Globe, ChevronRight, X, Bell } from 'lucide-react-native';
import { colors } from '../../theme';
import { apiService } from '../../lib/api';

const STATUS_CONFIG = {
    completed: { accent: colors.success, Icon: PhoneIncoming, label: 'Completed' },
    missed: { accent: colors.danger, Icon: AlertTriangle, label: 'Missed' },
    attempted: { accent: colors.warning, Icon: PhoneIncoming, label: 'Attempted' },
    refused: { accent: '#EF4444', Icon: AlertTriangle, label: 'Refused' },
};

export default function MyCallerScreen({ navigation }) {
    const [caller, setCaller] = useState(null);
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailVisible, setDetailVisible] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [callerRes, callsRes] = await Promise.all([
                    apiService.patients.getMyCaller(),
                    apiService.patients.getMyCalls(),
                ]);
                setCaller(callerRes.data.caller);
                setCalls(callsRes.data.calls || []);
            } catch (err) {
                console.warn('Failed to load caller data:', err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        const isYesterday = d.toDateString() === new Date(now - 86400000).toDateString();
        const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        if (isToday) return `Today, ${time}`;
        if (isYesterday) return `Yesterday, ${time}`;
        return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatDuration = (seconds) => {
        if (!seconds || seconds === 0) return 'N/A';
        return `${Math.floor(seconds / 60)} min`;
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
            <LinearGradient colors={['#0A2463', '#1E5FAD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                <View style={styles.decorativeCircle} />
                <Text style={styles.headerLabel}>CareCo</Text>
                <Text style={styles.headerTitle}>Assigned Callers</Text>
                <Pressable style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
                    <Bell size={22} color="#FFFFFF" strokeWidth={2} />
                </Pressable>
            </LinearGradient>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionHeader}>YOUR CARE TEAM</Text>

                {caller && (
                    <Pressable style={styles.callerListCard} onPress={() => setDetailVisible(true)}>
                        <View style={styles.avatarWrapSmall}>
                            <View style={styles.avatarSmall}><Text style={styles.avatarTxtSmall}>{caller.name?.charAt(0)}</Text></View>
                            <View style={styles.onlineDot} />
                        </View>
                        <View style={styles.callerListContent}>
                            <Text style={styles.callerListName}>{caller.name}</Text>
                            <Text style={styles.callerListSub}>ID: {caller.employee_id} • {caller.experience_years} yrs</Text>
                            <Text style={styles.callerListBottom}>Languages: {caller.languages_spoken?.join(', ')}</Text>
                        </View>
                        <ChevronRight size={20} color="#CBD5E1" />
                    </Pressable>
                )}
                {!caller && <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>No caller assigned yet.</Text>}
            </ScrollView>

            {/* Detail Modal */}
            <Modal visible={detailVisible} animationType="slide" transparent={false} onRequestClose={() => setDetailVisible(false)}>
                <View style={styles.container}>
                    <LinearGradient colors={['#0A2463', '#1E5FAD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.detailHeaderGradient}>
                        <View style={styles.detailHeaderTopRow}>
                            <Pressable onPress={() => setDetailVisible(false)} hitSlop={10}>
                                <X size={24} color="#FFFFFF" strokeWidth={2.5} />
                            </Pressable>
                        </View>
                        <View style={styles.detailAvatarRow}>
                            <View style={styles.avatarLargeWrap}>
                                <View style={styles.avatarLarge}><Text style={styles.avatarTxtLarge}>{caller?.name?.charAt(0)}</Text></View>
                            </View>
                            <View>
                                <Text style={styles.detailName}>{caller?.name}</Text>
                                <Text style={styles.detailId}>ID: {caller?.employee_id}</Text>
                                <Text style={styles.detailOnline}>● Online Now</Text>
                            </View>
                        </View>
                        <View style={styles.statsMap}>
                            <View style={styles.statCol}><CalendarCheck size={16} color="#BDD4EE" /><Text style={styles.statColVal}>{caller?.experience_years} yrs</Text><Text style={styles.statColLabel}>Experience</Text></View>
                            <View style={styles.statDivider} />
                            <View style={styles.statCol}><Globe size={16} color="#BDD4EE" /><Text style={styles.statColVal}>{caller?.languages_spoken?.join(', ')}</Text><Text style={styles.statColLabel}>Languages</Text></View>
                            <View style={styles.statDivider} />
                            <View style={styles.statCol}><ShieldCheck size={16} color="#BDD4EE" /><Text style={styles.statColVal}>Certified</Text><Text style={styles.statColLabel}>Status</Text></View>
                        </View>
                    </LinearGradient>

                    <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.actionRow}>
                            <Pressable style={styles.callBtnFull} onPress={() => caller?.phone && Linking.openURL(`tel:${caller.phone}`)}>
                                <Phone size={18} color="#FFFFFF" strokeWidth={2.5} /><Text style={styles.callBtnText}>Call Now</Text>
                            </Pressable>
                            <Pressable style={styles.flagBtnFull}>
                                <Flag size={18} color={colors.danger} strokeWidth={2.5} /><Text style={styles.flagBtnText}>Flag Issue</Text>
                            </Pressable>
                        </View>

                        <Text style={styles.sectionHeader}>CALL HISTORY</Text>
                        {calls.map((call) => {
                            const config = STATUS_CONFIG[call.status] || STATUS_CONFIG.completed;
                            const Icon = config.Icon;
                            return (
                                <View key={call._id} style={styles.historyCard}>
                                    <View style={[styles.historyAccentBar, { backgroundColor: config.accent }]} />
                                    <View style={styles.historyCardInner}>
                                        <View style={[styles.historyIconBox, { backgroundColor: config.accent + '15' }]}>
                                            <Icon size={18} color={config.accent} strokeWidth={2.5} />
                                        </View>
                                        <View style={styles.historyContent}>
                                            <View style={styles.historyTopRow}>
                                                <Text style={styles.historyDate}>{formatDate(call.call_date)}</Text>
                                                <Text style={[styles.durationTxt, { color: call.status === 'missed' ? colors.danger : '#64748B' }]}>
                                                    {formatDuration(call.call_duration_seconds)}
                                                </Text>
                                            </View>
                                            <Text style={styles.historySummary}>{call.ai_summary || 'No summary available.'}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                        {calls.length === 0 && <Text style={{ color: '#94A3B8', textAlign: 'center' }}>No call history yet.</Text>}
                    </ScrollView>
                </View>
            </Modal>
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

    sectionHeader: { fontSize: 13, fontWeight: '600', color: '#94A3B8', letterSpacing: 1, marginBottom: 16, marginLeft: 4, textTransform: 'uppercase' },

    callerListCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    avatarWrapSmall: { position: 'relative', marginRight: 16 },
    avatarSmall: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
    avatarTxtSmall: { fontSize: 18, fontWeight: '700', color: colors.accent },
    onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.success, borderWidth: 2, borderColor: '#FFF' },
    callerListContent: { flex: 1 },
    callerListName: { fontSize: 16, fontWeight: '700', color: '#1A202C' },
    callerListSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
    callerListBottom: { fontSize: 12, color: colors.accent, marginTop: 4, fontWeight: '600' },

    detailHeaderGradient: { paddingTop: Platform.OS === 'ios' ? 56 : 40, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    detailHeaderTopRow: { marginBottom: 20 },
    detailAvatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    avatarLargeWrap: { marginRight: 20 },
    avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    avatarTxtLarge: { fontSize: 28, fontWeight: '700', color: colors.primary },
    detailName: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
    detailId: { fontSize: 14, color: '#BDD4EE', marginTop: 4 },
    detailOnline: { fontSize: 13, fontWeight: '600', color: '#4ADE80', marginTop: 6 },

    statsMap: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 },
    statCol: { flex: 1, alignItems: 'center' },
    statColVal: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginTop: 6 },
    statColLabel: { fontSize: 11, color: '#BDD4EE', marginTop: 2 },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 10 },

    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 24, marginTop: 10 },
    callBtnFull: { flex: 1, flexDirection: 'row', backgroundColor: colors.accent, borderRadius: 8, height: 50, alignItems: 'center', justifyContent: 'center', gap: 8 },
    callBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    flagBtnFull: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8, height: 50 },
    flagBtnText: { color: colors.danger, fontSize: 15, fontWeight: '600' },

    historyCard: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E2E8F0' },
    historyAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
    historyCardInner: { flexDirection: 'row', padding: 16, paddingLeft: 20, alignItems: 'center' },
    historyIconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    historyContent: { flex: 1 },
    historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    historyDate: { fontSize: 14, fontWeight: '700', color: '#1A202C' },
    durationTxt: { fontSize: 12, fontWeight: '600' },
    historySummary: { fontSize: 13, color: '#4A5568', lineHeight: 20 },
});
