import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  Pressable, ActivityIndicator, Linking, Animated,
  Modal, TouchableOpacity, TouchableWithoutFeedback, Alert,
} from 'react-native';
import {
  Phone, PhoneIncoming, AlertTriangle, ShieldCheck,
  Flag, Clock, Globe, Calendar, ChevronRight, X,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { apiService } from '../../lib/api';

const C = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  primarySoft: '#EFF6FF',
  cardBg: '#FFFFFF',
  pageBg: '#F5F7FA',
  dark: '#0A0F1E',
  mid: '#1E293B',
  muted: '#64748B',
  light: '#94A3B8',
  border: '#E8EEF4',
  borderMid: '#D1DCE8',
  success: '#10B981',
  successBg: '#ECFDF5',
  danger: '#EF4444',
  dangerBg: '#FEF2F2',
  warning: '#F59E0B',
  warningBg: '#FEFCE8',
  accent: '#6366F1',
};

const STATUS_CONFIG = {
  completed: { color: C.success, bg: C.successBg, Icon: PhoneIncoming, label: 'Completed' },
  missed: { color: C.danger, bg: C.dangerBg, Icon: AlertTriangle, label: 'Missed' },
  attempted: { color: C.warning, bg: C.warningBg, Icon: Clock, label: 'Attempted' },
  refused: { color: C.danger, bg: C.dangerBg, Icon: AlertTriangle, label: 'Refused' },
  rescheduled: { color: C.warning, bg: C.warningBg, Icon: Calendar, label: 'Rescheduled' },
};

export default function MyCallerScreen({ navigation }) {
  const [patient, setPatient] = useState(null);
  const [caller, setCaller] = useState(null);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModal] = useState(false);
  const [flagging, setFlagging] = useState(false);

  const staggerAnims = useRef([...Array(20)].map(() => new Animated.Value(0))).current;
  const modalAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  const runAnimations = useCallback(() => {
    staggerAnims.forEach(a => a.setValue(0));
    Animated.parallel([
      Animated.spring(cardAnim, { toValue: 1, friction: 7, tension: 40, useNativeDriver: true }),
      Animated.stagger(55,
        staggerAnims.map(a =>
          Animated.spring(a, { toValue: 1, friction: 8, tension: 42, useNativeDriver: true }),
        ),
      ),
    ]).start();
  }, [staggerAnims, cardAnim]);

  const openModal = () => {
    setModal(true);
    Animated.parallel([
      Animated.spring(modalAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    Animated.parallel([
      Animated.timing(modalAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setModal(false));
  };

  const handleFlagIssue = async () => {
    if (flagging) return;
    setFlagging(true);
    try {
      await apiService.patients.flagIssue({
        type: 'general',
        description: 'Patient flagged an issue with their caller.',
      });
      Alert.alert('Issue Flagged', 'Your issue has been reported to the care team.');
    } catch (err) {
      Alert.alert('Error', 'Failed to flag issue. Please try again.');
      console.warn('Flag issue error:', err.message);
    } finally {
      setFlagging(false);
    }
  };

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
    if (!seconds || seconds === 0) return null;
    return `${Math.floor(seconds / 60)} min`;
  };

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1D4ED8" />
      </View>
    );
  }

  if (patient?.subscription?.plan === 'free') {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <View style={s.upgradeIconWrap}>
          <ShieldCheck size={32} color="#6366F1" />
        </View>
        <Text style={s.upgradeTitle}>Premium Feature</Text>
        <Text style={s.upgradeBody}>
          A dedicated care team caller is included in the Basic Plan. Upgrade on the Home screen to
          get matched with a caller from your city.
        </Text>
      </View>
    );
  }

  return (
    <View style={s.container}>

      {/* ── Header ── */}
      <LinearGradient
        colors={['#0A2463', '#1E5FAD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={[s.decorativeCircle, { top: -20, right: -20, opacity: 0.2 }]} />
        <View style={[s.decorativeCircle, { bottom: -40, left: -30, width: 180, height: 180, opacity: 0.1 }]} />
        <Text style={s.headerLabel}>CareCo</Text>
        <Text style={s.headerTitle}>Care Team</Text>
      </LinearGradient>

      <ScrollView
        style={s.body}
        contentContainerStyle={s.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {caller ? (
          <Animated.View style={{
            opacity: cardAnim,
            transform: [{
              translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
            }],
          }}>
            <Pressable onPress={openModal} style={({ pressed }) => [s.callerCard, pressed && s.callerCardPressed]}>

              {/* Avatar + name row */}
              <View style={s.profileRow}>
                <View style={s.avatarWrap}>
                  <View style={s.avatar}>
                    <Text style={s.avatarLetter}>{caller.name?.charAt(0)}</Text>
                  </View>
                  <View style={s.onlineDot} />
                </View>
                <View style={s.profileInfo}>
                  <Text style={s.callerName}>{caller.name}</Text>
                  <View style={s.metaRow}>
                    <View style={s.idChip}>
                      <Text style={s.idChipText}>{caller.employee_id}</Text>
                    </View>
                    <View style={s.onlinePill}>
                      <View style={s.onlinePillDot} />
                      <Text style={s.onlinePillText}>Online Now</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action buttons */}
              <View style={s.actionRow}>
                <Pressable
                  style={({ pressed }) => [s.btnCall, pressed && s.btnCallPressed]}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    caller?.phone && Linking.openURL(`tel:${caller.phone}`);
                  }}
                >
                  {({ pressed }) => (
                    <View style={s.btnCallGrad}>
                      <Phone size={15} color="#FFF" strokeWidth={2.5} />
                      <Text style={s.btnCallText}>Call Now</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  style={({ pressed }) => [s.btnFlag, pressed && s.btnFlagPressed]}
                  onPress={(e) => { e.stopPropagation?.(); handleFlagIssue(); }}
                >
                  <Flag size={15} color={C.danger} strokeWidth={2.2} />
                  <Text style={s.btnFlagText}>{flagging ? 'Flagging…' : 'Flag Issue'}</Text>
                </Pressable>
              </View>

            </Pressable>
          </Animated.View>
        ) : (
          <View style={s.emptyWrap}>
            <Text style={s.emptyTitle}>No Caller Assigned</Text>
            <Text style={s.emptyBody}>Your care team caller will appear here once assigned.</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeModal}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <Animated.View style={[s.backdrop, { opacity: backdropAnim }]} />
        </TouchableWithoutFeedback>

        <View style={s.modalWrapper}>
          <Animated.View style={[
            s.modalSheet,
            {
              transform: [{
                translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [800, 0] }),
              }],
            },
          ]}>

            {/* Modal handle */}
            <View style={s.modalHandle} />

            {/* Modal Header */}
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>CARE CONNECT</Text>
              <TouchableOpacity onPress={closeModal} style={s.closeBtn}>
                <X size={16} color={C.muted} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.modalBody}>

              {/* Profile row */}
              <View style={s.modalCallerRow}>
                <View style={s.avatarWrapLg}>
                  <LinearGradient colors={['#1E5FAD', '#060D1F']} style={s.avatarLg}>
                    <Text style={s.avatarLetterLg}>{caller?.name?.charAt(0)}</Text>
                  </LinearGradient>
                  <View style={s.onlineDotLg} />
                </View>
                <View style={s.profileInfo}>
                  <Text style={s.modalCallerName}>{caller?.name}</Text>
                  <View style={s.metaRow}>
                    <View style={s.idChip}>
                      <Text style={s.idChipText}>{caller?.employee_id}</Text>
                    </View>
                    <View style={s.onlinePill}>
                      <View style={s.onlinePillDot} />
                      <Text style={s.onlinePillText}>Online Now</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Stats strip */}
              <View style={s.statsStrip}>
                <View style={s.statItem}>
                  <View style={s.statIconWrap}>
                    <Clock size={16} color="#3B82F6" strokeWidth={2.5} />
                  </View>
                  <Text style={s.statVal}>{caller?.experience_years} yrs</Text>
                  <Text style={s.statLbl}>Experience</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <View style={s.statIconWrap}>
                    <Globe size={16} color="#3B82F6" strokeWidth={2.5} />
                  </View>
                  <Text style={[s.statVal, { fontSize: 11 }]} numberOfLines={1}>
                    {caller?.languages_spoken?.slice(0, 3).join(' · ')}
                  </Text>
                  <Text style={s.statLbl}>Languages</Text>
                </View>
                <View style={s.statDivider} />
                <View style={s.statItem}>
                  <View style={s.statIconWrap}>
                    <ShieldCheck size={16} color="#3B82F6" strokeWidth={2.5} />
                  </View>
                  <Text style={s.statVal}>Certified</Text>
                  <Text style={s.statLbl}>Status</Text>
                </View>
              </View>

              {/* Action buttons */}
              <View style={s.actionRow}>
                <Pressable
                  style={({ pressed }) => [s.btnCall, pressed && s.btnCallPressed]}
                  onPress={() => caller?.phone && Linking.openURL(`tel:${caller.phone}`)}
                >
                  {({ pressed }) => (
                    <View style={s.btnCallGrad}>
                      <Phone size={15} color="#FFF" strokeWidth={2.5} />
                      <Text style={s.btnCallText}>Call Now</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable
                  style={({ pressed }) => [s.btnFlag, pressed && s.btnFlagPressed]}
                  onPress={handleFlagIssue}
                >
                  <Flag size={15} color={C.danger} strokeWidth={2.2} />
                  <Text style={s.btnFlagText}>{flagging ? 'Flagging…' : 'Flag Issue'}</Text>
                </Pressable>
              </View>

              {/* Call History */}
              <View style={s.sectionHead}>
                <View style={s.sectionBar} />
                <Text style={s.sectionTitle}>Call History</Text>
              </View>

              {calls.length === 0 ? (
                <View style={s.emptyWrap}>
                  <Text style={s.emptyTitle}>No Calls Yet</Text>
                  <Text style={s.emptyBody}>Your call history will appear here.</Text>
                </View>
              ) : (
                calls.map((call) => {
                  const cfg = STATUS_CONFIG[call.status] || STATUS_CONFIG.completed;
                  const Icon = cfg.Icon;
                  const duration = formatDuration(call.call_duration_seconds);
                  return (
                    <View key={call._id} style={[
                      s.historyCard,
                      { borderLeftColor: cfg.color },
                      call.status === 'missed' && s.historyCardMissed,
                    ]}>
                      <View style={[s.historyIconBox, { backgroundColor: cfg.bg }]}>
                        <Icon size={15} color={cfg.color} strokeWidth={2.2} />
                      </View>
                      <View style={s.historyBody}>
                        <View style={s.historyTop}>
                          <Text style={s.historyDate}>{formatDate(call.call_date)}</Text>
                          <View style={[s.badge, { backgroundColor: duration ? '#EEF2FF' : cfg.bg }]}>
                            <Text style={[s.badgeText, { color: duration ? '#4338CA' : cfg.color }]}>
                              {duration || cfg.label}
                            </Text>
                          </View>
                        </View>
                        <Text style={s.historyNote} numberOfLines={2}>
                          {call.ai_summary || 'Routine check-in call.'}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}

            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

const FONT = {
  regular:  { fontFamily: 'Inter_400Regular' },
  medium:   { fontFamily: 'Inter_500Medium' },
  semibold: { fontFamily: 'Inter_600SemiBold' },
  bold:     { fontFamily: 'Inter_700Bold' }, 
  heavy:    { fontFamily: 'Inter_800ExtraBold' }, 
  black:    { fontFamily: 'Inter_900Black' },
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },

  // ── Header ──
  header: {
    height: 140,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerLabel: {
    fontSize: 12, ...FONT.bold,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1, marginBottom: 4,
  },
  headerTitle: { fontSize: 20, ...FONT.heavy, color: '#FFFFFF' },

  // ── Body ──
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 120 },

  // ── Caller Card ──
  callerCard: {
    backgroundColor: C.cardBg,
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 3,
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  callerCardPressed: {
    opacity: 0.98,
    transform: [{ scale: 0.99 }],
  },

  profileRow: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 22,
  },
  avatarWrap: { position: 'relative', marginRight: 16 },
  avatar: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E5FAD' },
  avatarLetter: { fontSize: 26, ...FONT.semibold, color: '#FFF' },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#10B981', borderWidth: 2.5, borderColor: C.cardBg,
  },
  profileInfo: { flex: 1 },
  callerName: {
    fontSize: 22,
    ...FONT.semibold,
    color: '#0A0F1E',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  idChip: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  idChipText: {
    fontSize: 11,
    ...FONT.semibold,
    color: '#1D4ED8',
    fontFamily: Platform.OS === 'ios' ? 'Inter_700Bold' : 'monospace',
    letterSpacing: 0.5,
  },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlinePillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981' },
  onlinePillText: { fontSize: 13, ...FONT.medium, color: '#059669' },

  // ── Action buttons ──
  actionRow: {
    flexDirection: 'row', gap: 12,
  },
  btnCall: {
    flex: 1.2, borderRadius: 25, overflow: 'hidden',
    shadowColor: '#0A0F1E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 6, elevation: 3,
  },
  btnCallPressed: { opacity: 0.85 },
  btnCallGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 50, borderRadius: 25,
    backgroundColor: '#0F172A',
  },
  btnCallText: { fontSize: 16, ...FONT.semibold, color: '#FFF', letterSpacing: 0.2 },

  btnFlag: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 50, borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: '#E2E8F0',
  },
  btnFlagPressed: { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' },
  btnFlagText: { fontSize: 14, ...FONT.semibold, color: '#EF4444' },

  // ── Empty state ──
  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 17, ...FONT.semibold, color: '#1E293B', marginBottom: 6 },
  emptyBody: { fontSize: 14, ...FONT.regular, color: '#94A3B8', textAlign: 'center', lineHeight: 20 },

  // ── Upgrade state ──
  upgradeIconWrap: {
    width: 72, height: 72, borderRadius: 24,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  upgradeTitle: { fontSize: 22, ...FONT.semibold, color: '#0A0F1E', marginBottom: 10, letterSpacing: -0.3 },
  upgradeBody: { fontSize: 15, ...FONT.regular, color: '#64748B', textAlign: 'center', lineHeight: 23 },

  // ── Modal ──
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,10,25,0.6)',
  },
  modalWrapper: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    height: '95%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 24,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 12, marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#EFF2F7',
  },
  modalTitle: {
    fontSize: 10,
    ...FONT.medium,
    color: '#94A3B8',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#EFF2F7',
    alignItems: 'center', justifyContent: 'center',
  },
  modalBody: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 52 },
  modalCallerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },

  avatarWrapLg: { position: 'relative', marginRight: 16 },
  avatarLg: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarLetterLg: { fontSize: 30, ...FONT.semibold, color: '#FFF' },
  onlineDotLg: {
    position: 'absolute', bottom: 1, right: 1,
    width: 15, height: 15, borderRadius: 8,
    backgroundColor: '#10B981', borderWidth: 3, borderColor: '#F8FAFC',
  },
  modalCallerName: {
    fontSize: 22,
    ...FONT.semibold,
    color: '#0A0F1E',
    marginBottom: 7,
    letterSpacing: -0.5,
  },

  // ── Stats strip ──
  statsStrip: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F5F9',
    paddingVertical: 18, marginBottom: 20, marginTop: 4,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: '#F0F9FF',
    alignItems: 'center', justifyContent: 'center',
  },
  statVal: { fontSize: 13, ...FONT.semibold, color: '#1E293B', textAlign: 'center' },
  statLbl: {
    fontSize: 9,
    ...FONT.semibold,
    color: '#94A3B8',
    letterSpacing: 1, textTransform: 'uppercase',
  },
  statDivider: { width: 1, height: 40, backgroundColor: '#EFF2F7' },

  // ── Section header ──
  sectionHead: {
    flexDirection: 'row', alignItems: 'center',
    gap: 9, marginBottom: 14, marginTop: 12,
  },
  sectionBar: { width: 3, height: 14, backgroundColor: '#3B82F6', borderRadius: 2 },
  sectionTitle: {
    fontSize: 10,
    ...FONT.semibold,
    color: '#94A3B8',
    letterSpacing: 1.8, textTransform: 'uppercase',
  },

  historyCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFF', borderRadius: 14,
    padding: 14, marginBottom: 10,
    shadowColor: '#0A2463', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    borderWidth: 1, borderColor: '#EFF2F7',
    borderLeftWidth: 3,
  },
  historyCardMissed: { backgroundColor: '#FFF8F8', borderColor: '#FECACA' },
  historyIconBox: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  historyBody: { flex: 1 },
  historyTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  historyDate: { fontSize: 13, ...FONT.semibold, color: '#1E293B' },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, ...FONT.medium },
  historyNote: { fontSize: 12.5, ...FONT.regular, color: '#64748B', lineHeight: 18 },
});