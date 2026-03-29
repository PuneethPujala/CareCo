import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import { X, Search, Pill, CheckCheck, BellOff, Heart, MessageSquare } from 'lucide-react-native';

const C = {
  primary: '#6366F1',
  dark: '#0F172A',
  mid: '#334155',
  muted: '#94A3B8',
  light: '#CBD5E1',
  border: '#F1F5F9',
  danger: '#F43F5E', // Rose color for the View button from screenshot
  pageBg: '#FFFFFF',
};

const FONT = {
  regular: { fontFamily: 'Inter_400Regular' },
  medium: { fontFamily: 'Inter_500Medium' },
  semibold: { fontFamily: 'Inter_600SemiBold' },
  bold: { fontFamily: 'Inter_700Bold' },
  heavy: { fontFamily: 'Inter_800ExtraBold' },
};

const NOTIFICATIONS = [
  { id: 1, group: 'Last 7 days', name: 'Dr. Anjali Desai', action: 'scheduled a call with you', time: '14:20', isPerson: true, bg: '#EEF2FF', color: '#4338CA' },
  { id: 2, group: 'Last 7 days', name: 'Hi, Look!', action: 'Four new caregivers are currently in your location', time: '11:00', isPerson: false, Icon: BellOff },
  { id: 3, group: 'Last 7 days', name: 'Amazing!', action: 'You are in the same radius as 12 people. Go premium to see it!', time: '2:00', isPerson: false, Icon: BellOff },
  { id: 4, group: 'Last 30 days', name: 'Mentari Cinta', action: 'You both have a shared interest: Anime', time: '21:00', isPerson: true, bg: '#FFE4E6', color: '#E11D48' },
  { id: 5, group: 'Last 30 days', name: 'Congratulations!', action: 'Your account has been verified.', time: '17:00', isPerson: false, Icon: CheckCheck },
];

export default function NotificationsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Activity');
  const groups = ['Last 7 days', 'Last 30 days'];

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Notification</Text>
        <Pressable style={s.searchBtn} onPress={() => navigation.goBack()}>
          <X size={22} color={C.dark} strokeWidth={2.5} />
        </Pressable>
      </View>

      {/* ── Segmented Tabs ── */}
      <View style={s.tabsWrap}>
        <View style={s.tabsBg}>
          <Pressable style={[s.tab, activeTab === 'Activity' && s.tabActive]} onPress={() => setActiveTab('Activity')}>
            <Text style={[s.tabText, activeTab === 'Activity' && s.tabTextActive]}>Activity</Text>
          </Pressable>
          <Pressable style={[s.tab, activeTab === 'Archive' && s.tabActive]} onPress={() => setActiveTab('Archive')}>
            <Text style={[s.tabText, activeTab === 'Archive' && s.tabTextActive]}>Archive</Text>
          </Pressable>
        </View>
      </View>

      {/* ── Body ── */}
      <ScrollView style={s.list} contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'Archive' ? (
          <View style={s.emptyWrap}>
            <View style={s.emptyArtWrap}>
              <Heart size={40} color={C.light} style={{position:'absolute', top: -10, left: -20, transform: [{rotate: '-15deg'}]}} strokeWidth={1.5} />
              <MessageSquare size={32} color={C.light} style={{position:'absolute', bottom: 10, right: -20, transform: [{rotate: '10deg'}]}} strokeWidth={1.5} />
              <BellOff size={80} color={C.dark} strokeWidth={1.5} />
            </View>
            <Text style={s.emptyTitle}>No notification yet</Text>
            <Text style={s.emptyBody}>Return here for updates on activities and new matches.</Text>
          </View>
        ) : (
          groups.map((group) => {
            const items = NOTIFICATIONS.filter((n) => n.group === group);
            if (!items.length) return null;
            return (
              <View key={group} style={s.groupSection}>
                <Text style={s.groupHeader}>{group}</Text>
                {items.map((item) => (
                  <View key={item.id} style={s.card}>
                    <View style={s.avatarWrap}>
                      {item.isPerson ? (
                        <View style={[s.avatar, { backgroundColor: item.bg }]}>
                          <Text style={[s.avatarTxt, { color: item.color }]}>{item.name.charAt(0)}</Text>
                        </View>
                      ) : (
                        <View style={s.iconAvatar}>
                          <item.Icon size={18} color={C.dark} strokeWidth={2.5} />
                        </View>
                      )}
                    </View>

                    <View style={s.txtWrap}>
                      <Text style={s.mainTxt}>
                        <Text style={s.boldTxt}>{item.name}</Text> {item.action}
                      </Text>
                    </View>

                    <View style={s.rightSide}>
                      <Text style={s.timeTxt}>{item.time}</Text>
                      <Pressable style={s.viewBtn}>
                        <Text style={s.viewBtnTxt}>View</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.pageBg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: C.pageBg,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: C.dark, letterSpacing: -1 },
  searchBtn: { 
    width: 44, height: 44, borderRadius: 22, 
    borderWidth: 1.5, borderColor: C.border, backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center',
  },

  tabsWrap: { paddingHorizontal: 28, marginBottom: 28 },
  tabsBg: {
    flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 100, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 100 },
  tabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, ...FONT.semibold, color: C.muted },
  tabTextActive: { color: C.dark, ...FONT.bold },

  list: { flex: 1 },
  listContent: { paddingHorizontal: 28, paddingBottom: 60, minHeight: '100%' },
  
  groupSection: { marginBottom: 32 },
  groupHeader: { fontSize: 13, ...FONT.heavy, color: C.dark, marginBottom: 16 },

  card: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24 },
  
  avatarWrap: { marginRight: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 18, ...FONT.heavy },
  iconAvatar: { 
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF',
    borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },

  txtWrap: { flex: 1, marginRight: 12 },
  mainTxt: { fontSize: 14, ...FONT.regular, color: C.dark, lineHeight: 20 },
  boldTxt: { ...FONT.bold, color: C.dark },

  rightSide: { alignItems: 'center', paddingLeft: 8 },
  timeTxt: { fontSize: 11, ...FONT.semibold, color: C.muted, marginBottom: 8 },
  viewBtn: { 
    backgroundColor: C.danger, paddingHorizontal: 12, paddingVertical: 5, 
    borderRadius: 100,
  },
  viewBtnTxt: { fontSize: 10, ...FONT.heavy, color: '#FFF' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 40 },
  emptyArtWrap: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 18, ...FONT.heavy, color: C.dark, marginBottom: 8 },
  emptyBody: { fontSize: 14, ...FONT.medium, color: C.muted, textAlign: 'center', lineHeight: 22 },
});
