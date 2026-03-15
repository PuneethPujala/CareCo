import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Platform,
  Pressable, ActivityIndicator, Linking, Animated,
} from 'react-native';
import {
  Phone, PhoneIncoming, AlertTriangle, ShieldCheck,
  Flag, Clock, Globe, Calendar, ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { apiService } from '../../lib/api';

const C = {
  primary:     '#3B82F6',
  primaryDark: '#1D4ED8',
  primarySoft: '#EFF6FF',
  cardBg:      '#FFFFFF',
  pageBg:      '#F8FAFC',
  dark:        '#0F172A',
  mid:         '#1E293B',
  muted:       '#64748B',
  light:       '#94A3B8',
  border:      '#F1F5F9',
  borderMid:   '#E2E8F0',
  success:     '#22C55E',
  successBg:   '#F0FDF4',
  danger:      '#EF4444',
  dangerBg:    '#FEF2F2',
  warning:     '#F59E0B',
  warningBg:   '#FEFCE8',
};

const STATUS_CONFIG = {
  completed:   { color: C.success,  bg: C.successBg,  Icon: PhoneIncoming, label: 'Completed'   },
  missed:      { color: C.danger,   bg: C.dangerBg,   Icon: AlertTriangle, label: 'Missed'      },
  attempted:   { color: C.warning,  bg: C.warningBg,  Icon: Clock,         label: 'Attempted'   },
  refused:     { color: C.danger,   bg: C.dangerBg,   Icon: AlertTriangle, label: 'Refused'     },
  rescheduled: { color: C.warning,  bg: C.warningBg,  Icon: Calendar,      label: 'Rescheduled' },
};

export default function MyCallerScreen({ navigation }) {
  const [patient, setPatient]                 = useState(null);
  const [caller, setCaller]                   = useState(null);
  const [calls, setCalls]                     = useState([]);
  const [previousCallers, setPreviousCallers] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [callPressed, setCallPressed]         = useState(false);
  const [flagPressed, setFlagPressed]         = useState(false);

  const staggerAnims = useRef([...Array(20)].map(() => new Animated.Value(0))).current;

  const runAnimations = useCallback(() => {
    staggerAnims.forEach(a => a.setValue(0));
    Animated.stagger(55,
      staggerAnims.map(a =>
        Animated.spring(a, { toValue: 1, friction: 8, tension: 42, useNativeDriver: true }),
      ),
    ).start();
  }, [staggerAnims]);

  useEffect(() => {
    (async () => {
      try {
        const pRes = await apiService.patients.getMe();
        setPatient(pRes.data.patient);
        if (pRes.data.patient?.subscription?.plan !== 'free') {
          const [callerRes, callsRes, prevRes] = await Promise.all([
            apiService.patients.getMyCaller(),
            apiService.patients.getMyCalls(),
            apiService.patients.getPreviousCallers(),
          ]);
          setCaller(callerRes.data.caller);
          setCalls(callsRes.data.calls || []);
          setPreviousCallers(prevRes.data.previous_callers || []);
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
    const d   = new Date(dateStr);
    const now = new Date();
    const isToday     = d.toDateString() === now.toDateString();
    const isYesterday = d.toDateString() === new Date(now - 86400000).toDateString();
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (isToday)     return `Today, ${time}`;
    if (isYesterday) return `Yesterday, ${time}`;
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return null;
    return `${Math.floor(seconds / 60)} min`;
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // ── Free plan gate ───────────────────────────────────────────────
  if (patient?.subscription?.plan === 'free') {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <ShieldCheck size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#1A202C', textAlign: 'center', marginBottom: 8 }}>
          Premium Feature
        </Text>
        <Text style={{ fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22 }}>
          A dedicated care team caller is included in the Basic Plan. Upgrade on the Home screen to
          get matched with a caller from your city.
        </Text>
      </View>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────
  return (
    <View style={s.container}>

      {/* ── Header — exactly matching HealthProfileScreen ── */}
      <LinearGradient
        colors={['#0A2463', '#1E5FAD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <View style={[s.decorativeCircle, { top: -20, right: -20, opacity: 0.2 }]} />
        <View style={[s.decorativeCircle, { bottom: -40, left: -30, width: 180, height: 180, opacity: 0.1 }]} />
        <Text style={s.headerLabel}>CareCo</Text>
        <Text style={s.headerTitle}>Your Care Team</Text>
      </LinearGradient>

      <ScrollView
        style={s.body}
        contentContainerStyle={s.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {caller ? (
          <>
            {/* ── Caller Profile Card ── */}
            <Animated.View style={{
              opacity: staggerAnims[0],
              transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            }}>
              <View style={s.callerCard}>

                {/* Avatar + name */}
                <View style={s.profileRow}>
                  <View style={s.avatarWrap}>
                    <LinearGradient colors={['#1E5FAD', '#0A2463']} style={s.avatar}>
                      <Text style={s.avatarLetter}>{caller.name?.charAt(0)}</Text>
                    </LinearGradient>
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

                {/* Stats strip */}
                <View style={s.statsStrip}>
                  <View style={s.statItem}>
                    <Clock size={16} color={colors.accent} strokeWidth={1.8} />
                    <Text style={s.statVal}>{caller.experience_years} yrs</Text>
                    <Text style={s.statLbl}>Experience</Text>
                  </View>
                  <View style={s.statDivider} />
                  <View style={s.statItem}>
                    <Globe size={16} color={colors.accent} strokeWidth={1.8} />
                    <Text style={[s.statVal, { fontSize: 12 }]} numberOfLines={1}>
                      {caller.languages_spoken?.slice(0, 3).join(' · ')}
                    </Text>
                    <Text style={s.statLbl}>Languages</Text>
                  </View>
                  <View style={s.statDivider} />
                  <View style={s.statItem}>
                    <ShieldCheck size={16} color={colors.accent} strokeWidth={1.8} />
                    <Text style={s.statVal}>Certified</Text>
                    <Text style={s.statLbl}>Status</Text>
                  </View>
                </View>

                {/* Buttons */}
                <View style={s.actionRow}>
                  <Pressable
                    style={[s.btnCall, callPressed && s.btnPressed]}
                    onPressIn={() => setCallPressed(true)}
                    onPressOut={() => setCallPressed(false)}
                    onPress={() => caller?.phone && Linking.openURL(`tel:${caller.phone}`)}
                  >
                    <LinearGradient
                      colors={['#1E5FAD', '#0A2463']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={s.btnCallGrad}
                    >
                      <Phone size={16} color="#FFF" strokeWidth={2.2} />
                      <Text style={s.btnCallText}>Call Now</Text>
                    </LinearGradient>
                  </Pressable>
                  <Pressable
                    style={[s.btnFlag, flagPressed && s.btnPressed]}
                    onPressIn={() => setFlagPressed(true)}
                    onPressOut={() => setFlagPressed(false)}
                  >
                    <Flag size={16} color={C.danger} strokeWidth={2} />
                    <Text style={s.btnFlagText}>Flag Issue</Text>
                  </Pressable>
                </View>

              </View>
            </Animated.View>

            {/* ── Previous Callers ── */}
            <Animated.View style={{
              opacity: staggerAnims[1],
              transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            }}>
              <View style={s.sectionHead}>
                <View style={s.sectionBar} />
                <Text style={s.sectionTitle}>Previous Callers</Text>
              </View>

              {previousCallers.length === 0 ? (
                <Text style={s.emptyTxt}>No previous callers.</Text>
              ) : (
                previousCallers.map((pc, i) => (
                  <Animated.View key={pc._id} style={{
                    opacity: staggerAnims[i + 2],
                    transform: [{ translateY: staggerAnims[i + 2].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                  }}>
                    <Pressable
                      style={s.prevCard}
                      onPress={() => navigation.navigate('CallerProfile', { callerId: pc._id })}
                    >
                      <View style={s.prevAvatarRing}>
                        <View style={s.prevAvatar}>
                          <Text style={s.prevAvatarText}>{pc.name?.charAt(0)}</Text>
                        </View>
                      </View>
                      <View style={s.prevInfo}>
                        <Text style={s.prevName}>{pc.name}</Text>
                        <Text style={s.prevMeta}>ID: {pc.employee_id} • {pc.total_calls || 0} calls</Text>
                      </View>
                      <ChevronRight size={16} color={C.light} />
                    </Pressable>
                  </Animated.View>
                ))
              )}
            </Animated.View>

            {/* ── Call History ── */}
            <Animated.View style={{
              opacity: staggerAnims[2],
              transform: [{ translateY: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            }}>
              <View style={s.sectionHead}>
                <View style={s.sectionBar} />
                <Text style={s.sectionTitle}>Call History</Text>
              </View>

              {calls.length === 0 ? (
                <Text style={s.emptyTxt}>No call history yet.</Text>
              ) : (
                calls.map((call, i) => {
                  const cfg      = STATUS_CONFIG[call.status] || STATUS_CONFIG.completed;
                  const Icon     = cfg.Icon;
                  const duration = formatDuration(call.call_duration_seconds);
                  return (
                    <Animated.View key={call._id} style={{
                      opacity: staggerAnims[i + 3],
                      transform: [{ translateY: staggerAnims[i + 3].interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                    }}>
                      <View style={[s.historyCard, call.status === 'missed' && s.historyCardMissed]}>
                        <View style={[s.historyIconBox, { backgroundColor: cfg.bg }]}>
                          <Icon size={17} color={cfg.color} strokeWidth={2} />
                        </View>
                        <View style={s.historyBody}>
                          <View style={s.historyTop}>
                            <Text style={s.historyDate}>{formatDate(call.call_date)}</Text>
                            <View style={[s.badge, { backgroundColor: duration ? C.primarySoft : cfg.bg }]}>
                              <Text style={[s.badgeText, { color: duration ? C.primaryDark : cfg.color }]}>
                                {duration || cfg.label}
                              </Text>
                            </View>
                          </View>
                          <Text style={s.historyNote} numberOfLines={2}>
                            {call.ai_summary || 'Routine check-in call.'}
                          </Text>
                        </View>
                      </View>
                    </Animated.View>
                  );
                })
              )}
            </Animated.View>
          </>
        ) : (
          <Text style={s.emptyTxt}>No caller assigned yet.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.pageBg },

  // ── Header — identical to HealthProfileScreen ──
  header: {
    height: 140,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    overflow: 'hidden',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerLabel: {
    fontSize: 12, fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1, marginBottom: 4,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },

  // ── Body ──
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 110 },

  // ── Caller card ──
  callerCard: {
    backgroundColor: C.cardBg,
    borderRadius: 24, padding: 24, marginBottom: 20,
    shadowColor: '#0A2463',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05, shadowRadius: 20, elevation: 4,
    borderWidth: 1, borderColor: C.border,
  },

  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatarWrap: { position: 'relative', marginRight: 16 },
  avatar: { width: 62, height: 62, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  onlineDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: C.success, borderWidth: 2.5, borderColor: C.cardBg,
  },

  profileInfo: { flex: 1 },
  callerName: { fontSize: 21, fontWeight: '800', color: C.dark, marginBottom: 7, letterSpacing: -0.3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  idChip: { backgroundColor: C.primarySoft, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  idChipText: {
    fontSize: 11, fontWeight: '700', color: C.primaryDark,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  onlinePillDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.success },
  onlinePillText: { fontSize: 12, fontWeight: '600', color: '#15803D' },

  statsStrip: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.borderMid,
    paddingVertical: 14, marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 5 },
  statVal: { fontSize: 14, fontWeight: '700', color: C.mid, textAlign: 'center', marginTop: 4 },
  statLbl: { fontSize: 10, fontWeight: '800', color: C.light, letterSpacing: 0.8, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 36, backgroundColor: C.borderMid },

  actionRow: { flexDirection: 'row', gap: 10 },
  btnCall: {
    flex: 1.3, borderRadius: 24, overflow: 'hidden',
    shadowColor: '#0A2463', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 4,
  },
  btnCallGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 50,
  },
  btnCallText: { fontSize: 15, fontWeight: '800', color: '#FFF', letterSpacing: 0.2 },
  btnFlag: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 50, borderRadius: 24,
    backgroundColor: C.cardBg, borderWidth: 1.5, borderColor: C.borderMid,
  },
  btnFlagText: { fontSize: 14, fontWeight: '700', color: C.danger },
  btnPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  // ── Section headers ──
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12, marginTop: 4 },
  sectionBar: { width: 3, height: 15, backgroundColor: colors.accent, borderRadius: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: C.light, letterSpacing: 1.2, textTransform: 'uppercase' },

  // ── Previous callers ──
  prevCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.cardBg, borderRadius: 20,
    padding: 16, marginBottom: 10,
    shadowColor: '#0A2463', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    borderWidth: 1, borderColor: C.border,
  },
  prevAvatarRing: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: C.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  prevAvatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1E5FAD', alignItems: 'center', justifyContent: 'center',
  },
  prevAvatarText: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  prevInfo: { flex: 1 },
  prevName: { fontSize: 15, fontWeight: '700', color: C.dark, marginBottom: 3 },
  prevMeta: { fontSize: 13, color: C.muted, fontWeight: '500' },

  // ── Call history ──
  historyCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: C.cardBg, borderRadius: 20,
    padding: 16, marginBottom: 10,
    shadowColor: '#0A2463', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
    borderWidth: 1, borderColor: C.border,
  },
  historyCardMissed: { backgroundColor: C.dangerBg, borderColor: '#FECACA' },
  historyIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  historyBody: { flex: 1 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  historyDate: { fontSize: 13, fontWeight: '700', color: C.mid },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  historyNote: { fontSize: 13, color: C.muted, lineHeight: 18, fontWeight: '500' },

  // ── Empty ──
  emptyTxt: { fontSize: 14, color: C.light, fontStyle: 'italic', paddingVertical: 10, textAlign: 'center' },
});