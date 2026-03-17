import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Platform, Pressable,
    ActivityIndicator, TextInput, KeyboardAvoidingView, Dimensions, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import NetInfo from '@react-native-community/netinfo';
import { ChevronLeft, ChevronRight, Heart, Activity, Wind, Droplets, AlertTriangle, WifiOff, RefreshCw, Calendar, Clock, ActivityCircle } from 'lucide-react-native';
import axiosInstance, { handleAxiosError } from '../../lib/axiosInstance';
import { apiService } from '../../lib/api';
import { colors } from '../../theme';

const SCREEN_W = Dimensions.get('window').width;

// ─── Chart configuration builder (light theme) ─────────────────
const makeChartConfig = (accentColor) => ({
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#F8FAFC',
    decimalPlaces: 0,
    color: (opacity = 1) => accentColor.replace(')', `, ${opacity})`).replace('rgb', 'rgba'),
    labelColor: () => '#64748B',
    propsForDots: { r: '4', strokeWidth: '2', stroke: accentColor },
    propsForBackgroundLines: { stroke: '#E2E8F0', strokeDasharray: '' },
    style: { borderRadius: 16 },
});

// ─── Metric definitions ────────────────────────────────────────
const CHART_DEFS = [
    {
        id: 'heart_rate', title: 'Heart Rate', unit: 'bpm', yLabel: 'BPM',
        icon: Heart, accent: 'rgb(239, 68, 68)', bgTint: '#FEF2F2',
        extract: (v) => v.heart_rate || 0,
    },
    {
        id: 'blood_pressure', title: 'Blood Pressure', unit: 'mmHg', yLabel: 'mmHg',
        icon: Activity, accent: 'rgb(59, 134, 255)', accentAlt: 'rgb(168,85,247)',
        bgTint: '#EFF6FF',
        extract: (v) => v.blood_pressure?.systolic || 0,
        extractAlt: (v) => v.blood_pressure?.diastolic || 0,
        legend: ['Systolic', 'Diastolic'],
    },
    {
        id: 'oxygen_saturation', title: 'Oxygen Saturation', unit: '%', yLabel: 'SpO₂',
        icon: Wind, accent: 'rgb(34, 197, 94)', bgTint: '#F0FDF4',
        extract: (v) => v.oxygen_saturation || 0,
    },
    {
        id: 'hydration', title: 'Hydration', unit: '%', yLabel: '%',
        icon: Droplets, accent: 'rgb(6, 182, 212)', bgTint: '#ECFEFF',
        extract: (v) => v.hydration || 0,
    },
];

// ─── Predictive insight engine ─────────────────────────────────
const getInsight = (data, label, isSingle) => {
    if (!data || data.length < 2) {
        if (isSingle && data.length === 1) {
            return { emoji: '📌', text: `Single reading recorded today. Log more to see trends.`, type: 'stable' };
        }
        return null;
    }
    const mid = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, mid).filter(v => v > 0);
    const secondHalf = data.slice(mid).filter(v => v > 0);
    if (!firstHalf.length || !secondHalf.length) return null;

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    const pctChange = ((avgSecond - avgFirst) / avgFirst) * 100;

    const periodText = isSingle ? 'today' : 'over the selected period';

    if (pctChange > 5) return { text: `Your ${label} is trending higher ${periodText}.`, type: 'warning' };
    if (pctChange < -5) return { text: `Your ${label} is improving ${periodText}.`, type: 'positive' };
    return { text: `Your ${label} has been stable ${periodText}.`, type: 'stable' };
};

const insightBgs = { warning: '#FEF3C7', positive: '#DCFCE7', stable: '#F0F9FF' };
const insightColors = { warning: '#92400E', positive: '#166534', stable: '#1E40AF' };


export default function VitalsHistoryScreen({ navigation }) {
    // ─── State ──────────────────────────────────────────────────
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);

    // Date range state (Charts)
    const [rangeMode, setRangeMode] = useState('range');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());

    // History list state (Independent)
    const [historyLogs, setHistoryLogs] = useState([]);
    const [historyDate, setHistoryDate] = useState(new Date());

    // Log vitals form
    const [isLogging, setIsLogging] = useState(false);
    const [formValues, setFormValues] = useState({
        heart_rate: '', systolic: '', diastolic: '', oxygen_saturation: '', hydration: '',
    });
    const [formError, setFormError] = useState(null);

    // ─── Animations ─────────────────────────────────────────────
    const staggerAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

    const runAnimations = useCallback(() => {
        staggerAnims.forEach(anim => anim.setValue(0));
        Animated.stagger(100, staggerAnims.map(anim =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            })
        )).start();
    }, [staggerAnims]);

    useFocusEffect(
        useCallback(() => {
            runAnimations();
            return () => {};
        }, [runAnimations])
    );

    // ─── NetInfo: offline detection ─────────────────────────────
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            setIsOffline(!state.isConnected);
        });
        return () => unsubscribe();
    }, []);

    // ─── Fetch vitals from backend (Charts) ─────────────────────
    const fetchVitals = useCallback(async () => {
        setError(null);
        if (isOffline) {
            setError('You are offline. Please connect to the internet to view your vitals history.');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await apiService.patients.getVitals({
                start_date: startDate.toISOString(),
                end_date: rangeMode === 'single' ? startDate.toISOString() : endDate.toISOString(),
            });
            setVitals(res.data.vitals || []);
        } catch (err) {
            setError(handleAxiosError(err));
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, rangeMode, isOffline]);

    // ─── Fetch logs from backend (History List) ─────────────────
    const fetchHistoryLogs = useCallback(async () => {
        if (isOffline) return;
        try {
            const res = await apiService.patients.getVitals({
                start_date: historyDate.toISOString(),
                end_date: historyDate.toISOString(),
            });
            setHistoryLogs(res.data.vitals || []);
        } catch (err) {
            console.warn('Failed to fetch history logs:', err.message);
        }
    }, [historyDate, isOffline]);

    // Initial load & Refetches
    useEffect(() => { fetchVitals(); }, [fetchVitals]);
    useEffect(() => { fetchHistoryLogs(); }, [fetchHistoryLogs]);

    // ─── Chart labels ───────────────────────────────────────────
    const chartLabels = useMemo(() => {
        if (!vitals.length) return [];
        return vitals.map((v) => {
            const d = new Date(v.date);
            if (rangeMode === 'single') {
                return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
            }
            return `${d.getMonth() + 1}/${d.getDate()}`;
        });
    }, [vitals, rangeMode]);

    // ─── Submit new vitals ──────────────────────────────────────
    const handleLogVitals = async () => {
        setFormError(null);
        const hr = Number(formValues.heart_rate);
        const sys = Number(formValues.systolic);
        const dia = Number(formValues.diastolic);
        const o2 = Number(formValues.oxygen_saturation);
        const hyd = Number(formValues.hydration);

        if (!hr || !sys || !dia || !o2 || !hyd) {
            setFormError('All fields are required.');
            return;
        }

        try {
            setLoading(true);
            await apiService.patients.logVitals({
                date: new Date().toISOString(),
                heart_rate: hr,
                blood_pressure: { systolic: sys, diastolic: dia },
                oxygen_saturation: o2,
                hydration: hyd,
            });
            setIsLogging(false);
            setFormValues({ heart_rate: '', systolic: '', diastolic: '', oxygen_saturation: '', hydration: '' });
            fetchVitals();
            fetchHistoryLogs(); // update recent logs too
        } catch (err) {
            setFormError(handleAxiosError(err));
        } finally {
            setLoading(false);
        }
    };

    // ─── Date helpers ───────────────────────────────────────────
    const adjustDate = (setter, days) => {
        setter((prev) => {
            const d = new Date(prev);
            d.setDate(d.getDate() + days);
            return d;
        });
    };
    const formatDate = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });


    // ─── Render a single chart card ─────────────────────────────
    const renderChartCard = (def) => {
        const mainData = vitals.map(def.extract);
        const hasData = mainData.some((v) => v > 0);
        const insight = getInsight(mainData, def.title.toLowerCase(), rangeMode === 'single');
        const IconCmp = def.icon;

        const datasets = [{ data: hasData ? mainData : [0], color: () => def.accent, strokeWidth: 2 }];
        if (def.extractAlt) {
            const altData = vitals.map(def.extractAlt);
            datasets.push({ data: hasData ? altData : [0], color: () => def.accentAlt, strokeWidth: 2 });
        }

        return (
            <Animated.View key={def.id} style={[styles.chartCard, { opacity: staggerAnims[2], transform: [{ translateY: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                {/* Title row with icon pill */}
                <View style={styles.chartTitleRow}>
                    <View style={[styles.chartIconPill, { backgroundColor: def.bgTint }]}>
                        <IconCmp size={18} color={def.accent} />
                    </View>
                    <Text style={styles.chartTitle}>{def.title}</Text>
                    <Text style={styles.chartUnit}>({def.unit})</Text>
                </View>

                {hasData ? (
                    <LineChart
                        data={{
                            labels: chartLabels.length > 7
                                ? chartLabels.filter((_, i) => i % Math.ceil(chartLabels.length / 7) === 0)
                                : chartLabels,
                            datasets,
                            legend: def.legend || [],
                        }}
                        width={SCREEN_W - 72}
                        height={200}
                        chartConfig={makeChartConfig(def.accent)}
                        bezier
                        style={styles.chart}
                        withInnerLines={true}
                        withOuterLines={false}
                        fromZero={false}
                    />
                ) : (
                    <View style={styles.emptyChartBox}>
                        <Text style={styles.emptyChartText}>No {def.title.toLowerCase()} data for this period</Text>
                    </View>
                )}

                {insight && (
                    <View style={[styles.insightRow, { backgroundColor: insightBgs[insight.type], borderLeftColor: insightColors[insight.type] }]}>
                        <Text style={[styles.insightText, { color: insightColors[insight.type] }]}>
                            {insight.text}
                        </Text>
                    </View>
                )}
            </Animated.View>
        );
    };

    // ─── Error Banner ───────────────────────────────────────────
    const renderErrorBanner = () => {
        if (!error) return null;
        return (
            <View style={styles.errorBanner}>
                {isOffline
                    ? <WifiOff size={20} color="#DC2626" />
                    : <AlertTriangle size={20} color="#DC2626" />
                }
                <Text style={styles.errorText}>{error}</Text>
                {!isOffline && (
                    <Pressable style={styles.retryBtn} onPress={fetchVitals}>
                        <RefreshCw size={14} color="#FFF" />
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                )}
            </View>
        );
    };

    // ─── Main Render ────────────────────────────────────────────
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={styles.container}>

                {/* ── Premium Gradient Header ─────────────────── */}
                <View style={styles.headerWrap}>
                    <LinearGradient colors={['#0A2463', '#1E3A8A', '#1E5FAD']} style={styles.headerGradient}>
                        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ChevronLeft size={24} color="#FFF" />
                        </Pressable>
                        <Text style={styles.headerTitle}>Vitals History</Text>
                        <View style={styles.backBtn} />
                    </LinearGradient>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* ── Date Picker Section ─────────────────── */}
                    <Animated.View style={[styles.dateSection, { opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                        <View style={styles.dateToggle}>
                            {['single', 'range'].map((m) => (
                                <Pressable
                                    key={m}
                                    style={[styles.toggleBtn, rangeMode === m && styles.toggleBtnActive]}
                                    onPress={() => setRangeMode(m)}
                                >
                                    <View style={[styles.dateToggleIcon, rangeMode === m && styles.dateToggleIconActive]}>
                                        <Calendar size={14} color={rangeMode === m ? "#3B86FF" : "#94A3B8"} />
                                    </View>
                                    <Text style={[styles.toggleTxt, rangeMode === m && styles.toggleTxtActive]}>
                                        {m === 'single' ? 'Single Date' : 'Date Range'}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        <View style={styles.dateRow}>
                            <Pressable style={styles.dateArrow} onPress={() => adjustDate(setStartDate, -1)}>
                                <ChevronLeft size={20} color="#64748B" />
                            </Pressable>
                            <View style={styles.dateBox}>
                                <Text style={styles.dateLabel}>{rangeMode === 'single' ? 'Date' : 'Start'}</Text>
                                <Text style={styles.dateValue}>{formatDate(startDate)}</Text>
                            </View>
                            <Pressable style={styles.dateArrow} onPress={() => adjustDate(setStartDate, 1)}>
                                <ChevronRight size={20} color="#64748B" />
                            </Pressable>
                        </View>

                        {rangeMode === 'range' && (
                            <View style={styles.dateRow}>
                                <Pressable style={styles.dateArrow} onPress={() => adjustDate(setEndDate, -1)}>
                                    <ChevronLeft size={20} color="#64748B" />
                                </Pressable>
                                <View style={styles.dateBox}>
                                    <Text style={styles.dateLabel}>End</Text>
                                    <Text style={styles.dateValue}>{formatDate(endDate)}</Text>
                                </View>
                                <Pressable style={styles.dateArrow} onPress={() => adjustDate(setEndDate, 1)}>
                                    <ChevronRight size={20} color="#64748B" />
                                </Pressable>
                            </View>
                        )}
                    </Animated.View>

                    {/* ── Log Vitals Form (top for easy access) ── */}
                    <Animated.View style={[styles.chartCard, { opacity: staggerAnims[1], transform: [{ translateY: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                        <Pressable
                            style={styles.logToggleRow}
                            onPress={() => { setIsLogging(!isLogging); setFormError(null); }}
                        >
                            <Text style={styles.chartTitle}>Log Today's Vitals</Text>
                            <View style={[styles.addBadge, isLogging && styles.addBadgeCancel]}>
                                <Text style={[styles.addBadgeTxt, isLogging && styles.addBadgeCancelTxt]}>{isLogging ? 'Cancel' : '+ Add Entry'}</Text>
                            </View>
                        </Pressable>

                        {isLogging && (
                            <View style={styles.formArea}>
                                {formError && (
                                    <View style={[styles.errorBanner, { marginBottom: 12 }]}>
                                        <AlertTriangle size={16} color="#DC2626" />
                                        <Text style={styles.errorText}>{formError}</Text>
                                    </View>
                                )}

                                <View style={styles.formRow}>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.formLabel}>Heart Rate (bpm)</Text>
                                        <TextInput style={styles.formInput} keyboardType="numeric" placeholder="72" placeholderTextColor="#94A3B8"
                                            value={formValues.heart_rate} onChangeText={(t) => setFormValues((p) => ({ ...p, heart_rate: t }))} />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.formLabel}>O₂ Saturation (%)</Text>
                                        <TextInput style={styles.formInput} keyboardType="numeric" placeholder="98" placeholderTextColor="#94A3B8"
                                            value={formValues.oxygen_saturation} onChangeText={(t) => setFormValues((p) => ({ ...p, oxygen_saturation: t }))} />
                                    </View>
                                </View>

                                <Text style={[styles.formLabel, { marginTop: 14 }]}>Blood Pressure (mmHg)</Text>
                                <View style={styles.formRow}>
                                    <View style={styles.formGroup}>
                                        <TextInput style={styles.formInput} keyboardType="numeric" placeholder="Systolic (120)" placeholderTextColor="#94A3B8"
                                            value={formValues.systolic} onChangeText={(t) => setFormValues((p) => ({ ...p, systolic: t }))} />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <TextInput style={styles.formInput} keyboardType="numeric" placeholder="Diastolic (80)" placeholderTextColor="#94A3B8"
                                            value={formValues.diastolic} onChangeText={(t) => setFormValues((p) => ({ ...p, diastolic: t }))} />
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={[styles.formLabel, { marginTop: 14 }]}>Hydration (%)</Text>
                                    <TextInput style={styles.formInput} keyboardType="numeric" placeholder="65" placeholderTextColor="#94A3B8"
                                        value={formValues.hydration} onChangeText={(t) => setFormValues((p) => ({ ...p, hydration: t }))} />
                                </View>

                                <Pressable style={styles.submitBtn} onPress={handleLogVitals}>
                                    {loading
                                        ? <ActivityIndicator color="#FFF" />
                                        : <Text style={styles.submitTxt}>Save Record</Text>
                                    }
                                </Pressable>
                            </View>
                        )}
                    </Animated.View>

                    {/* ── Error / Offline Banner ──────────────── */}
                    {renderErrorBanner()}

                    {/* ── Loading State ────────────────────────── */}
                    {loading && (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color={colors.accent} />
                            <Text style={styles.loadingText}>Loading vitals...</Text>
                        </View>
                    )}

                    {/* ── Empty State ──────────────────────────── */}
                    {!loading && !error && vitals.length === 0 && (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconCircle}>
                                <Heart size={36} color="#3B86FF" />
                            </View>
                            <Text style={styles.emptyTitle}>No vitals recorded</Text>
                            <Text style={styles.emptySub}>Log your first vitals entry above to start tracking trends.</Text>
                        </View>
                    )}

                    {/* ── Charts ───────────────────────────────── */}
                    {!loading && vitals.length > 0 && CHART_DEFS.map(renderChartCard)}

                    {/* ── History List ─────────────────────────── */}
                    <Animated.View style={[styles.historySection, { opacity: staggerAnims[3], transform: [{ translateY: staggerAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
                        
                        {/* History Header & Independent Date Picker */}
                        <View style={styles.historySectionHeader}>
                            <Text style={styles.historyTitle}>Recent Logs</Text>
                            <View style={styles.historyDateControl}>
                                <Pressable style={styles.historyArrow} onPress={() => adjustDate(setHistoryDate, -1)}>
                                    <ChevronLeft size={16} color="#64748B" />
                                </Pressable>
                                <View style={styles.historyDateBox}>
                                    <Text style={styles.historyDateValue}>{formatDate(historyDate)}</Text>
                                </View>
                                <Pressable style={styles.historyArrow} onPress={() => adjustDate(setHistoryDate, 1)}>
                                    <ChevronRight size={16} color="#64748B" />
                                </Pressable>
                            </View>
                        </View>

                        {/* Logs List */}
                        {historyLogs.length === 0 ? (
                            <View style={styles.historyEmpty}>
                                <Text style={styles.historyEmptyText}>No logs recorded on this date.</Text>
                            </View>
                        ) : (
                            historyLogs.slice().reverse().map((log, idx) => (
                                <View key={log._id || idx} style={styles.historyCard}>
                                    <View style={styles.historyHeader}>
                                        <View style={styles.historyDateRow}>
                                            <Clock size={14} color="#3B86FF" />
                                            <Text style={styles.historyDate}>
                                                {new Date(log.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.historyGrid}>
                                        <View style={styles.historyItem}>
                                            <View style={styles.historyLabelRow}>
                                                <Heart size={12} color="#EF4444" />
                                                <Text style={styles.historyLabel}>Heart Rate</Text>
                                            </View>
                                            <Text style={styles.historyValue}>{log.heart_rate} <Text style={styles.historyUnit}>bpm</Text></Text>
                                        </View>
                                        <View style={styles.historyItem}>
                                            <View style={styles.historyLabelRow}>
                                                <Activity size={12} color="#3B86FF" />
                                                <Text style={styles.historyLabel}>Blood Pressure</Text>
                                            </View>
                                            <Text style={styles.historyValue}>{log.blood_pressure?.systolic}/{log.blood_pressure?.diastolic} <Text style={styles.historyUnit}>mmHg</Text></Text>
                                        </View>
                                        <View style={styles.historyItem}>
                                            <View style={styles.historyLabelRow}>
                                                <Wind size={12} color="#22C55E" />
                                                <Text style={styles.historyLabel}>SpO₂</Text>
                                            </View>
                                            <Text style={styles.historyValue}>{log.oxygen_saturation} <Text style={styles.historyUnit}>%</Text></Text>
                                        </View>
                                        <View style={styles.historyItem}>
                                            <View style={styles.historyLabelRow}>
                                                <Droplets size={12} color="#06B6D4" />
                                                <Text style={styles.historyLabel}>Hydration</Text>
                                            </View>
                                            <Text style={styles.historyValue}>{log.hydration} <Text style={styles.historyUnit}>%</Text></Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        )}
                    </Animated.View>

                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}


// ─── Styles (Light Premium Theme — consistent with HomeScreen) ──
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },

    /* Header — matches Patient HomeScreen gradient */
    headerWrap: { paddingBottom: 10, zIndex: 10 },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 20, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
        shadowColor: '#0A2463', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 8,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },

    scrollContent: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 },

    /* Date Picker */
    dateSection: {
        backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, marginBottom: 20,
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: 'rgba(10, 36, 99, 0.08)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 16, elevation: 4,
    },
    dateToggle: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 6, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
    toggleBtn: { flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    toggleBtnActive: { backgroundColor: '#FFFFFF', shadowColor: '#0A2463', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
    dateToggleIcon: { opacity: 0.5 },
    dateToggleIconActive: { opacity: 1 },
    toggleTxt: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
    toggleTxtActive: { color: '#1E293B', fontWeight: '800' },

    dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    dateArrow: {
        width: 44, height: 44, borderRadius: 14,
        backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: '#F1F5F9',
    },
    dateBox: {
        flex: 1, marginHorizontal: 12, backgroundColor: '#FFFFFF',
        borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16,
        borderWidth: 1.5, borderColor: '#F1F5F9',
        alignItems: 'center',
    },
    dateLabel: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
    dateValue: { fontSize: 15, fontWeight: '800', color: '#1E293B' },

    /* Error Banner */
    errorBanner: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
        borderRadius: 16, padding: 14, gap: 10, marginBottom: 16,
    },
    errorText: { flex: 1, color: '#991B1B', fontSize: 13, fontWeight: '600', lineHeight: 18 },
    retryBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#DC2626', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
    },
    retryText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

    /* Loading */
    loadingBox: { alignItems: 'center', paddingVertical: 60 },
    loadingText: { color: '#94A3B8', marginTop: 12, fontSize: 14, fontWeight: '500' },

    /* Empty State */
    emptyState: { alignItems: 'center', paddingVertical: 60 },
    emptyIconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF',
        alignItems: 'center', justifyContent: 'center', marginBottom: 16,
        borderWidth: 2, borderColor: '#DBEAFE',
    },
    emptyTitle: { color: '#1E293B', fontSize: 18, fontWeight: '700' },
    emptySub: { color: '#64748B', fontSize: 14, marginTop: 8, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20 },

    /* Chart Cards */
    chartCard: {
        backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, marginBottom: 24,
        borderWidth: 1, borderColor: '#F1F5F9',
        shadowColor: 'rgba(10, 36, 99, 0.08)', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 1, shadowRadius: 24, elevation: 6,
    },
    chartTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    chartIconPill: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    chartTitle: { fontSize: 17, fontWeight: '800', color: '#1E293B' },
    chartUnit: { fontSize: 13, color: '#94A3B8', fontWeight: '700' },
    chart: { borderRadius: 16, marginLeft: -24 },

    emptyChartBox: { height: 140, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed' },
    emptyChartText: { color: '#94A3B8', fontStyle: 'italic', fontSize: 14, fontWeight: '500' },

    insightRow: { marginTop: 18, borderRadius: 14, padding: 16, borderLeftWidth: 4 },
    insightText: { fontSize: 14, lineHeight: 22, fontWeight: '700' },

    /* Log Form */
    logToggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    addBadge: { backgroundColor: 'rgba(59,134,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    addBadgeTxt: { color: '#3B86FF', fontSize: 13, fontWeight: '800' },
    addBadgeCancel: { backgroundColor: 'rgba(239,68,68,0.1)' },
    addBadgeCancelTxt: { color: '#EF4444' },

    formArea: { marginTop: 24 },
    formRow: { flexDirection: 'row', gap: 16 },
    formGroup: { flex: 1, marginBottom: 4 },
    formLabel: { fontSize: 11, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
    formInput: {
        backgroundColor: '#FCFDFD', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 14,
        paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#1E293B', fontWeight: '700',
    },

    submitBtn: {
        borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24,
        overflow: 'hidden', backgroundColor: '#3B86FF',
        shadowColor: '#3B86FF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
    },
    submitTxt: { color: '#FFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },

    /* History List */
    historySection: { marginTop: 10 },
    historySectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingHorizontal: 4 },
    historyTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    
    historyDateControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 4, borderWidth: 1, borderColor: '#F1F5F9' },
    historyArrow: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    historyDateBox: { paddingHorizontal: 10 },
    historyDateValue: { fontSize: 13, fontWeight: '700', color: '#1E293B' },

    historyEmpty: { alignItems: 'center', paddingVertical: 20 },
    historyEmptyText: { color: '#94A3B8', fontSize: 14, fontStyle: 'italic' },

    historyCard: {
        backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 16,
        borderWidth: 1, borderColor: '#F1F5F9', borderLeftWidth: 4, borderLeftColor: '#3B86FF',
        shadowColor: 'rgba(10, 36, 99, 0.05)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 16, elevation: 3,
    },
    historyHeader: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC', paddingBottom: 14, marginBottom: 16 },
    historyDateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    historyDate: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
    historyGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 20 },
    historyItem: { width: '50%' },
    historyLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
    historyLabel: { fontSize: 11, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 },
    historyValue: { fontSize: 18, fontWeight: '900', color: '#1E293B' },
    historyUnit: { fontSize: 13, fontWeight: '700', color: '#94A3B8' },
});
