import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Animated, PanResponder } from 'react-native';
import { X, CalendarCheck, PhoneIncoming, Activity, Pill, CheckCheck } from 'lucide-react-native';
import { colors } from '../../theme';

const NOTIFICATIONS = [
    { id: 1, group: 'TODAY', title: 'Upcoming Call', desc: 'Dr. Anjali Desai will call you at 10:30 AM.', time: '10:00 AM', read: false, type: 'call', Icon: PhoneIncoming, bg: '#EFF6FF', color: colors.accent },
    { id: 2, group: 'TODAY', title: 'Medication Reminder', desc: 'Time to take your Morning Metformin (500mg)', time: '08:00 AM', read: false, type: 'med', Icon: Pill, bg: '#DCFCE7', color: colors.success },
    { id: 3, group: 'YESTERDAY', title: 'Health Profile Updated', desc: 'Your recent blood test results were added.', time: '04:15 PM', read: true, type: 'health', Icon: Activity, bg: '#F3E8FF', color: '#9333EA' },
    { id: 4, group: 'THIS WEEK', title: 'Appointment Scheduled', desc: 'Follow-up on Friday, Oct 27 at Clinic.', time: 'Mon', read: true, type: 'appt', Icon: CalendarCheck, bg: '#FEF3C7', color: colors.warning },
];

const SwipableNotification = ({ item }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event([null, { dx: pan.x }], { useNativeDriver: false }),
            onPanResponderRelease: (e, gesture) => {
                if (gesture.dx < -100) {
                    Animated.timing(pan, { toValue: { x: -500, y: 0 }, duration: 200, useNativeDriver: false }).start();
                } else {
                    Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
                }
            }
        })
    ).current;

    return (
        <Animated.View style={[styles.notifCardContainer, { transform: [{ translateX: pan.x }] }]} {...panResponder.panHandlers}>
            <View style={[styles.notifAccentBar, { backgroundColor: item.read ? '#CBD5E1' : item.color }]} />
            <View style={[styles.notifInner, item.read && styles.notifOpaque]}>
                <View style={[styles.notifIconBox, { backgroundColor: item.bg }]}><item.Icon size={18} color={item.color} /></View>
                <View style={styles.notifContent}>
                    <View style={styles.notifTitleRow}>
                        <Text style={[styles.notifTitle, !item.read && styles.unreadText]}>{item.title}</Text>
                        <Text style={styles.notifTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.notifDesc} numberOfLines={2}>{item.desc}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </View>
        </Animated.View>
    );
};

export default function NotificationsScreen({ navigation }) {
    const groups = ['TODAY', 'YESTERDAY', 'THIS WEEK'];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
                    <X size={24} color="#FFFFFF" strokeWidth={2.5} />
                </Pressable>
            </View>

            <View style={styles.subheader}>
                <Text style={styles.subText}>You have 2 unread notifications</Text>
                <Pressable style={styles.markReadRow}>
                    <CheckCheck size={16} color={colors.accent} strokeWidth={2.5} />
                    <Text style={styles.markReadTxt}>Mark all read</Text>
                </Pressable>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
                {groups.map(group => {
                    const items = NOTIFICATIONS.filter(n => n.group === group);
                    if (!items.length) return null;
                    return (
                        <View key={group} style={styles.groupSection}>
                            <Text style={styles.groupHeader}>{group}</Text>
                            {items.map(item => <SwipableNotification key={item.id} item={item} />)}
                        </View>
                    );
                })}
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        backgroundColor: '#0A2463', // Deep Navy
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 16, paddingHorizontal: 20,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
    closeBtn: { position: 'absolute', right: 20, bottom: 16, zIndex: 10 },

    subheader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
    subText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    markReadRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    markReadTxt: { fontSize: 13, fontWeight: '700', color: colors.accent },

    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 8 },

    groupSection: { marginTop: 16 },
    groupHeader: { fontSize: 12, fontWeight: '700', color: '#94A3B8', letterSpacing: 1, marginBottom: 12, marginLeft: 4 },

    notifCardContainer: { backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2, elevation: 1 },
    notifAccentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
    notifInner: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, paddingLeft: 20 },
    notifOpaque: { opacity: 0.65 },
    notifIconBox: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 14, marginTop: 2 },
    notifContent: { flex: 1, marginRight: 10 },
    notifTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    notifTitle: { fontSize: 15, fontWeight: '600', color: '#1A202C', flex: 1, marginRight: 8 },
    unreadText: { fontWeight: '700', color: '#0F172A' },
    notifTime: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    notifDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent, marginTop: 8 },
});
