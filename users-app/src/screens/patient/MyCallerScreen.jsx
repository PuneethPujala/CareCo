import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Modal, ActivityIndicator, Linking, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Phone, PhoneIncoming, AlertTriangle, ShieldCheck, Flag, CalendarCheck, Globe, ChevronRight, X, Bell, Info, PhoneOff } from 'lucide-react-native';
import { colors } from '../../theme';
import { apiService } from '../../lib/api';

const STATUS_CONFIG = {
    completed: { accent: colors.success, Icon: PhoneIncoming, label: 'Completed' },
    missed: { accent: colors.danger, Icon: AlertTriangle, label: 'Missed' },
    attempted: { accent: colors.warning, Icon: PhoneIncoming, label: 'Attempted' },
    refused: { accent: '#EF4444', Icon: AlertTriangle, label: 'Refused' },
};

export default function MyCallerScreen({ navigation }) {
    const [patient, setPatient] = useState(null);
    const [caller, setCaller] = useState(null);
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailVisible, setDetailVisible] = useState(false);

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
                    const [callerRes, callsRes] = await Promise.all([
                        apiService.patients.getMyCaller(),
                        apiService.patients.getMyCalls(),
                    ]);
                    setCaller(callerRes.data.caller);
                    setCalls(callsRes.data.calls || []);
                    runAnimations();
                }
            } catch (err) {
                console.warn('Failed to load caller data:', err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [runAnimations]);



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

    if (patient?.subscription?.plan === 'free') {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <ShieldCheck size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A202C', textAlign: 'center', marginBottom: 8 }}>Premium Feature</Text>
                <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 }}>
                    A dedicated care team caller is included in the Basic Plan. Upgrade on the Home screen to get matched with a caller from your city.
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
                <Text style={styles.headerTitle}>Assigned Companions</Text>
                <Pressable style={styles.bellBtn} onPress={() => navigation.navigate('Notifications')}>
                    <Bell size={22} color="#FFFFFF" strokeWidth={2} />
                </Pressable>
            </LinearGradient>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <Text style={styles.sectionHeader}>YOUR CARE TEAM</Text>

                    {caller ? (
                        <Pressable style={[styles.callerCardEnhanced, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => setDetailVisible(true)}>
                            <View style={{ position: 'relative', marginRight: 16 }}>
                                <View style={styles.avatarEnhanced}><Text style={styles.avatarTxt}>{caller.name?.charAt(0)}</Text></View>
                                <View style={styles.onlineDot} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.callerName}>{caller.name}</Text>
                                <View style={styles.relationRow}>
                                    <ShieldCheck size={14} color="#16A34A" />
                                    <Text style={styles.callerRelation}>ID: {caller.employee_id} • {caller.experience_years} yrs</Text>
                                </View>
                                <View style={styles.langRow}>
                                    <Globe size={13} color={colors.accent} />
                                    <Text style={[styles.callerRelation, { fontWeight: '500' }]}>{caller.languages_spoken?.join(', ')}</Text>
                                </View>
                            </View>
                            <ChevronRight size={20} color="#CBD5E1" />
                        </Pressable>
                    ) : (
                        <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 20 }}>No caller assigned yet.</Text>
                    )}
                </Animated.View>

                <Animated.View style={{ opacity: staggerAnims[1], transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <Text style={[styles.sectionHeader, { marginTop: 24 }]}>QUICK HISTORY</Text>
                    {calls.slice(0, 3).map((call) => {
                        const config = STATUS_CONFIG[call.status] || STATUS_CONFIG.completed;
                        const Icon = config.Icon;
                        return (
                            <View key={call._id} style={styles.historyCardMini}>
                                <View style={[styles.historyIconBoxMini, { backgroundColor: config.accent + '15' }]}>
                                    <Icon size={16} color={config.accent} strokeWidth={2.5} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.historyCardTitle}>{formatDate(call.call_date)}</Text>
                                    <Text style={styles.historyCardSub} numberOfLines={1}>{call.ai_summary || 'Routine check-in call.'}</Text>
                                </View>
                                <Text style={[styles.durationTxtMini, { color: call.status === 'missed' ? colors.danger : '#64748B' }]}>
                                    {formatDuration(call.call_duration_seconds)}
                                </Text>
                            </View>
                        );
                    })}
                </Animated.View>
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
        paddingTop: Platform.OS === 'ios' ? 70 : 50, overflow: 'hidden',
    },
    decorativeCircle: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.15)' },
    headerLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 4 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
    bellBtn: { position: 'absolute', right: 20, top: Platform.OS === 'ios' ? 70 : 50, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },

    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 24 },

    sectionHeader: { fontSize: 13, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4, textTransform: 'uppercase' },

    callerCardEnhanced: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#0A2463', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 6 },
    callerTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    avatarEnhanced: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(58,134,255,0.1)' },
    avatarTxt: { fontSize: 22, fontWeight: '800', color: colors.accent },
    onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#22C55E', borderWidth: 2.5, borderColor: '#FFF' },
    callerInfo: { flex: 1, marginLeft: 16 },
    callerName: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    relationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    callerRelation: { fontSize: 13, color: '#64748B', fontWeight: '600' },
    infoBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
    callerDetails: { flexDirection: 'row', gap: 20 },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    detailText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
    idRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    langRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },

    historyCardMini: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    historyIconBoxMini: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    historyCardTitle: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
    historyCardSub: { fontSize: 12, color: '#64748B', marginTop: 2, fontWeight: '500' },
    durationTxtMini: { fontSize: 12, fontWeight: '700' },

    detailHeaderGradient: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    detailHeaderTopRow: { marginBottom: 20 },
    detailAvatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
    avatarLargeWrap: { marginRight: 20 },
    avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    avatarTxtLarge: { fontSize: 32, fontWeight: '800', color: colors.primary },
    detailName: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
    detailId: { fontSize: 14, color: '#BDD4EE', marginTop: 4, fontWeight: '600' },
    detailOnline: { fontSize: 13, fontWeight: '700', color: '#4ADE80', marginTop: 8 },

    statsMap: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20 },
    statCol: { flex: 1, alignItems: 'center' },
    statColVal: { fontSize: 15, fontWeight: '800', color: '#FFFFFF', marginTop: 8 },
    statColLabel: { fontSize: 11, color: '#BDD4EE', marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 10 },

    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 32, marginTop: 16 },
    callBtnFull: { flex: 1, flexDirection: 'row', backgroundColor: colors.accent, borderRadius: 14, height: 56, alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: colors.accent, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
    callBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
    flagBtnFull: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FEE2E2', borderRadius: 14, height: 56 },
    flagBtnText: { color: colors.danger, fontSize: 15, fontWeight: '800' },

    historyCard: { backgroundColor: '#FFFFFF', borderRadius: 18, marginBottom: 14, overflow: 'hidden', borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#0A2463', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    historyAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
    historyCardInner: { flexDirection: 'row', padding: 18, paddingLeft: 22, alignItems: 'center' },
    historyIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    historyContent: { flex: 1 },
    historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    historyDate: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
    durationTxt: { fontSize: 13, fontWeight: '700' },
    historySummary: { fontSize: 14, color: '#475569', lineHeight: 22, fontWeight: '500' },

    emptyCard: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 32, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0' },
    emptyTxt: { color: '#94A3B8', fontSize: 15, fontWeight: '600' },
    emptyLogs: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
    emptyLogsTxt: { marginTop: 12, color: '#64748B', fontWeight: '600' },
});

