import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Modal, TextInput, Alert, ActivityIndicator, Switch, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Bell, Settings, LogOut, ChevronRight, UserRound, Phone, X, Save, ShieldCheck, Camera, CreditCard, HelpCircle } from 'lucide-react-native';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../lib/api';

export default function PatientProfileScreen({ navigation }) {
    const { signOut, displayName, userEmail } = useAuth();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [ecModalVisible, setEcModalVisible] = useState(false);
    const [accountModalVisible, setAccountModalVisible] = useState(false);
    const [editAccountModalVisible, setEditAccountModalVisible] = useState(false);
    const [cpModalVisible, setCpModalVisible] = useState(false);
    const [notifModalVisible, setNotifModalVisible] = useState(false);

    // Notification Prefs
    const [notifPrefs, setNotifPrefs] = useState({
        medications: true,
        appointments: true,
        messages: true,
        vitals: false,
    });

    // EC Form
    const [ecName, setEcName] = useState('');
    const [ecPhone, setEcPhone] = useState('');
    const [ecRelation, setEcRelation] = useState('');
    const [saving, setSaving] = useState(false);

    const staggerAnims = React.useRef([...Array(10)].map(() => new Animated.Value(0))).current;

    const runAnimations = React.useCallback(() => {
        staggerAnims.forEach(anim => anim.setValue(0));
        Animated.stagger(80,
            staggerAnims.map(anim =>
                Animated.spring(anim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true })
            )
        ).start();
    }, [staggerAnims]);


    // Edit Profile Form
    const [editName, setEditName] = useState('');
    const [editCity, setEditCity] = useState('');
    const [savingAccount, setSavingAccount] = useState(false);

    // Change Password Form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingCp, setSavingCp] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await apiService.patients.getMe();
                setPatient(data.patient);
                if (data.patient?.emergency_contact) {
                    setEcName(data.patient.emergency_contact.name || '');
                    setEcPhone(data.patient.emergency_contact.phone || '');
                    setEcRelation(data.patient.emergency_contact.relation || '');
                }
                setEditName(data.patient?.name || displayName || '');
                setEditCity(data.patient?.city || '');
                runAnimations();
            } catch (err) {
                console.warn('Failed to load profile:', err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [runAnimations]);


    const handleSaveEC = async () => {
        setSaving(true);
        try {
            await apiService.patients.updateEmergencyContact({ name: ecName, phone: ecPhone, relation: ecRelation });
            setPatient(prev => ({ ...prev, emergency_contact: { name: ecName, phone: ecPhone, relation: ecRelation } }));
            setEcModalVisible(false);
            Alert.alert('Success', 'Emergency contact updated successfully.');
        } catch (err) {
            Alert.alert('Error', 'Failed to update emergency contact.');
        } finally {
            setSaving(false);
        }
    };

    const planLabel = patient?.subscription?.plan === 'explore' ? 'Explore Plan' : patient?.subscription?.plan === 'basic' ? 'Basic Plan' : 'Free Plan';
    const planColor = patient?.subscription?.plan === 'explore' ? '#9333EA' : '#16A34A';
    const planBg = patient?.subscription?.plan === 'explore' ? '#F3E8FF' : '#DCFCE7';

    const handleSaveAccount = async () => {
        if (!editName.trim()) { Alert.alert('Error', 'Name cannot be empty.'); return; }
        setSavingAccount(true);
        try {
            await apiService.patients.updateMe({ name: editName, city: editCity });
            setPatient(prev => ({ ...prev, city: editCity, name: editName }));
            setEditAccountModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully.');
        } catch (err) {
            Alert.alert('Error', 'Failed to update profile.');
        } finally {
            setSavingAccount(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all password fields.'); return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.'); return;
        }
        setSavingCp(true);
        try {
            await apiService.auth.changePassword({ currentPassword, newPassword });
            setCpModalVisible(false);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            Alert.alert('Success', 'Password changed successfully. Please log back in.');
            signOut();
        } catch (err) {
            Alert.alert('Error', err?.message || 'Failed to change password. Validate requirements.');
        } finally {
            setSavingCp(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Minimal Header */}
            <View style={{ zIndex: 10, elevation: 10 }}>
                <Animated.View style={[styles.minimalHeader, { opacity: staggerAnims[0], transform: [{ translateY: staggerAnims[0].interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
                    <View style={styles.mainHeaderRow}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.heroLabel}>CARE RECORD</Text>
                            <Text style={styles.headerTitle}>My Profile</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <Pressable 
                                style={styles.headerRightBtn}
                                onPress={() => navigation.navigate('Notifications')}
                            >
                                <Bell size={20} color={colors.primary} strokeWidth={2.5} />
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>
            </View>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <Animated.View style={{ opacity: staggerAnims[1], transform: [{ scale: staggerAnims[1].interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
                    <View style={styles.profileCardEnhanced}>
                        <View style={styles.profileMain}>
                            <View style={styles.avatarLarge}>
                                <Text style={styles.avatarTxt}>{patient?.name?.charAt(0) || displayName?.charAt(0) || 'U'}</Text>
                                <View style={styles.editBadge}><Settings size={12} color="#FFF" /></View>
                            </View>
                            <View style={styles.profileInfo}>
                                <Text style={styles.profileName}>{patient?.name || displayName || 'User'}</Text>
                                <Text style={styles.profileEmail}>{userEmail || 'patient@careco.com'}</Text>
                                <View style={[styles.planBadgeEnhanced, { backgroundColor: planBg }]}>
                                    <ShieldCheck size={12} color={planColor} strokeWidth={2.5} />
                                    <Text style={[styles.planBadgeTxt, { color: planColor }]}>{planLabel}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.profileStats}>
                            <View style={styles.statBox}>
                                <Text style={styles.statVal}>Active</Text>
                                <Text style={styles.statLabel}>Status</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statBox}>
                                <Text style={styles.statVal}>{patient?.created_at ? new Date(patient.created_at).getFullYear() : '2024'}</Text>
                                <Text style={styles.statLabel}>Member</Text>
                            </View>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: staggerAnims[2], transform: [{ translateY: staggerAnims[2].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <Text style={styles.sectionHeader}>ACCOUNT SETTINGS</Text>
                    <View style={styles.settingsGroupEnhanced}>
                        <Pressable style={styles.settingRowEnhanced} onPress={() => setAccountModalVisible(true)}>
                            <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}><UserRound size={20} color="#3B82F6" /></View>
                            <Text style={styles.settingLabelEnhanced}>Account Details</Text>
                            <ChevronRight size={20} color="#CBD5E1" />
                        </Pressable>
                        <Pressable style={styles.settingRowEnhanced} onPress={() => setCpModalVisible(true)}>
                            <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}><Shield size={20} color="#8B5CF6" /></View>
                            <Text style={styles.settingLabelEnhanced}>Change Password</Text>
                            <ChevronRight size={20} color="#CBD5E1" />
                        </Pressable>
                        <Pressable style={styles.settingRowEnhanced} onPress={() => setEcModalVisible(true)}>
                            <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}><Phone size={20} color="#F97316" /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.settingLabelEnhanced}>Emergency Contacts</Text>
                                {patient?.emergency_contact?.name && (
                                    <Text style={styles.settingSubEnhanced}>{patient.emergency_contact.name} ({patient.emergency_contact.relation})</Text>
                                )}
                            </View>
                            <ChevronRight size={20} color="#CBD5E1" />
                        </Pressable>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: staggerAnims[3], transform: [{ translateY: staggerAnims[3].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <Text style={[styles.sectionHeader, { marginTop: 24 }]}>APP PREFERENCES</Text>
                    <View style={styles.settingsGroupEnhanced}>
                        <Pressable style={styles.settingRowEnhanced} onPress={() => setNotifModalVisible(true)}>
                            <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}><Bell size={20} color="#22C55E" /></View>
                            <Text style={styles.settingLabelEnhanced}>Notifications</Text>
                            <ChevronRight size={20} color="#CBD5E1" />
                        </Pressable>
                    </View>
                </Animated.View>

                <Animated.View style={{ opacity: staggerAnims[4], transform: [{ translateY: staggerAnims[4].interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
                    <Pressable style={styles.logoutBtnEnhanced} onPress={() => signOut()}>
                        <LogOut size={20} color="#EF4444" strokeWidth={2.5} />
                        <Text style={styles.logoutBtnTxtEnhanced}>Sign Out Account</Text>
                    </Pressable>
                    <Text style={styles.versionTxt}>v1.0.4 • Made with ♥ by CareCo</Text>
                </Animated.View>
            </ScrollView>


            {/* Emergency Contact Edit Modal */}
            <Modal visible={ecModalVisible} animationType="slide" transparent={true} onRequestClose={() => setEcModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Emergency Contact</Text>
                            <Pressable onPress={() => setEcModalVisible(false)} hitSlop={10}>
                                <X size={24} color="#64748B" />
                            </Pressable>
                        </View>

                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput style={styles.input} value={ecName} onChangeText={setEcName} placeholder="Contact name" placeholderTextColor="#94A3B8" />

                        <Text style={styles.inputLabel}>Phone</Text>
                        <TextInput style={styles.input} value={ecPhone} onChangeText={setEcPhone} placeholder="+91 XXXXX XXXXX" placeholderTextColor="#94A3B8" keyboardType="phone-pad" />

                        <Text style={styles.inputLabel}>Relation</Text>
                        <TextInput style={styles.input} value={ecRelation} onChangeText={setEcRelation} placeholder="e.g. Son, Daughter, Spouse" placeholderTextColor="#94A3B8" />

                        <Pressable style={styles.saveBtn} onPress={handleSaveEC} disabled={saving}>
                            <Save size={18} color="#FFFFFF" />
                            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Contact'}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Account Details Modal */}
            <Modal visible={accountModalVisible} animationType="slide" transparent={true} onRequestClose={() => setAccountModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Account Details</Text>
                            <Pressable onPress={() => setAccountModalVisible(false)} hitSlop={10}><X size={24} color="#64748B" /></Pressable>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Full Name</Text>
                            <Text style={styles.detailValue}>{patient?.name || displayName}</Text>
                        </View>
                        <View style={styles.line} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Email Address</Text>
                            <Text style={styles.detailValue}>{userEmail}</Text>
                        </View>
                        <View style={styles.line} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>City</Text>
                            <Text style={styles.detailValue}>{patient?.city || 'Not Provided'}</Text>
                        </View>
                        <View style={styles.line} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Current Plan</Text>
                            <Text style={[styles.detailValue, { color: planColor }]}>{planLabel}</Text>
                        </View>
                        <View style={styles.line} />
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Member Since</Text>
                            <Text style={styles.detailValue}>{patient?.created_at ? new Date(patient.created_at).toLocaleDateString() : 'N/A'}</Text>
                        </View>
                        <Pressable style={[styles.saveBtn, { backgroundColor: '#F1F5F9', marginTop: 24 }]} onPress={() => { setAccountModalVisible(false); setEditAccountModalVisible(true); }}>
                            <Text style={[styles.saveBtnText, { color: '#475569' }]}>Edit Information</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Edit Account Modal */}
            <Modal visible={editAccountModalVisible} animationType="slide" transparent={true} onRequestClose={() => setEditAccountModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <Pressable onPress={() => setEditAccountModalVisible(false)} hitSlop={10}><X size={24} color="#64748B" /></Pressable>
                        </View>
                        <Text style={styles.inputLabel}>Full Name</Text>
                        <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor="#94A3B8" />

                        <Text style={styles.inputLabel}>City</Text>
                        <TextInput style={styles.input} value={editCity} onChangeText={setEditCity} placeholder="e.g. Hyderabad" placeholderTextColor="#94A3B8" />

                        <Pressable style={styles.saveBtn} onPress={handleSaveAccount} disabled={savingAccount}>
                            <Save size={18} color="#FFFFFF" />
                            <Text style={styles.saveBtnText}>{savingAccount ? 'Saving...' : 'Save Profile'}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Change Password Modal */}
            <Modal visible={cpModalVisible} animationType="slide" transparent={true} onRequestClose={() => setCpModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Change Password</Text>
                            <Pressable onPress={() => setCpModalVisible(false)} hitSlop={10}><X size={24} color="#64748B" /></Pressable>
                        </View>

                        <Text style={styles.inputLabel}>Current Password</Text>
                        <TextInput style={styles.input} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Enter your current password" placeholderTextColor="#94A3B8" secureTextEntry />

                        <Text style={styles.inputLabel}>New Password</Text>
                        <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} placeholder="Enter your new password" placeholderTextColor="#94A3B8" secureTextEntry />

                        <Text style={styles.inputLabel}>Confirm New Password</Text>
                        <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm your new password" placeholderTextColor="#94A3B8" secureTextEntry />

                        <Pressable style={styles.saveBtn} onPress={handleChangePassword} disabled={savingCp}>
                            <Save size={18} color="#FFFFFF" />
                            <Text style={styles.saveBtnText}>{savingCp ? 'Changing...' : 'Change Password'}</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Notification Preferences Modal */}
            <Modal visible={notifModalVisible} animationType="slide" transparent={true} onRequestClose={() => setNotifModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notification Settings</Text>
                            <Pressable onPress={() => setNotifModalVisible(false)} hitSlop={10}><X size={24} color="#64748B" /></Pressable>
                        </View>

                        <Text style={styles.modalSubTxt}>Choose what updates you want to receive.</Text>

                        <View style={styles.switchRow}>
                            <View style={styles.switchTxtCol}>
                                <Text style={styles.switchTitle}>Medication Reminders</Text>
                                <Text style={styles.switchDesc}>Get alerted when it's time to take your pills.</Text>
                            </View>
                            <Switch 
                                trackColor={{ false: '#E2E8F0', true: '#818CF8' }} 
                                thumbColor={notifPrefs.medications ? '#4338CA' : '#F8FAFC'}
                                onValueChange={(v) => setNotifPrefs(prev => ({ ...prev, medications: v }))} 
                                value={notifPrefs.medications} 
                            />
                        </View>
                        <View style={styles.line} />

                        <View style={styles.switchRow}>
                            <View style={styles.switchTxtCol}>
                                <Text style={styles.switchTitle}>Upcoming Appointments</Text>
                                <Text style={styles.switchDesc}>Reminders for your scheduled visits.</Text>
                            </View>
                            <Switch 
                                trackColor={{ false: '#E2E8F0', true: '#818CF8' }} 
                                thumbColor={notifPrefs.appointments ? '#4338CA' : '#F8FAFC'}
                                onValueChange={(v) => setNotifPrefs(prev => ({ ...prev, appointments: v }))} 
                                value={notifPrefs.appointments} 
                            />
                        </View>
                        <View style={styles.line} />

                        <View style={styles.switchRow}>
                            <View style={styles.switchTxtCol}>
                                <Text style={styles.switchTitle}>Care Team Messages</Text>
                                <Text style={styles.switchDesc}>Alerts from caretakers and doctors.</Text>
                            </View>
                            <Switch 
                                trackColor={{ false: '#E2E8F0', true: '#818CF8' }} 
                                thumbColor={notifPrefs.messages ? '#4338CA' : '#F8FAFC'}
                                onValueChange={(v) => setNotifPrefs(prev => ({ ...prev, messages: v }))} 
                                value={notifPrefs.messages} 
                            />
                        </View>
                        <View style={styles.line} />

                        <View style={styles.switchRow}>
                            <View style={styles.switchTxtCol}>
                                <Text style={styles.switchTitle}>Vitals Logging Reminders</Text>
                                <Text style={styles.switchDesc}>Daily ping to track your health vitals.</Text>
                            </View>
                            <Switch 
                                trackColor={{ false: '#E2E8F0', true: '#818CF8' }} 
                                thumbColor={notifPrefs.vitals ? '#4338CA' : '#F8FAFC'}
                                onValueChange={(v) => setNotifPrefs(prev => ({ ...prev, vitals: v }))} 
                                value={notifPrefs.vitals} 
                            />
                        </View>

                        <Pressable style={styles.saveBtn} onPress={() => {
                            setNotifModalVisible(false);
                            Alert.alert('Success', 'Notification preferences updated!');
                        }}>
                            <Save size={18} color="#FFFFFF" />
                            <Text style={styles.saveBtnText}>Save Preferences</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    minimalHeader: {
        paddingTop: Platform.OS === 'ios' ? 70 : 50,
        paddingHorizontal: 24,
        paddingBottom: 20,
        backgroundColor: '#F8FAFC',
    },
    mainHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { flex: 1 },
    heroLabel: { fontSize: 13, fontWeight: '800', color: '#6366F1', letterSpacing: 1.5, marginBottom: 4, textTransform: 'uppercase' },
    headerTitle: { fontSize: 32, fontWeight: '800', color: '#0F172A', letterSpacing: -1 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    headerRightBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF',
        alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0',
    },

    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 24 },

    profileCardEnhanced: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, marginBottom: 32, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 8, borderWidth: 1, borderColor: '#F1F5F9' },
    profileMain: { flexDirection: 'row', alignItems: 'center' },
    avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(99,102,241,0.1)' },
    avatarTxt: { fontSize: 28, fontWeight: '800', color: '#6366F1' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#FFF' },
    profileInfo: { flex: 1, marginLeft: 20 },
    profileName: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
    profileEmail: { fontSize: 14, color: '#64748B', marginTop: 4, fontWeight: '500' },
    planBadgeEnhanced: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 10 },
    planBadgeTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 20 },
    profileStats: { flexDirection: 'row', justifyContent: 'space-around' },
    statBox: { alignItems: 'center' },
    statVal: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
    statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontWeight: '600' },
    statDivider: { width: 1, backgroundColor: '#F1F5F9', height: '80%' },

    sectionHeader: { fontSize: 13, fontWeight: '800', color: '#94A3B8', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4, textTransform: 'uppercase' },
    settingsGroupEnhanced: { backgroundColor: '#FFFFFF', borderRadius: 28, mb: 24, overflow: 'hidden', borderWidth: 1.5, borderColor: '#F1F5F9', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
    settingRowEnhanced: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1.5, borderBottomColor: '#F8FAFC' },
    iconBox: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    settingLabelEnhanced: { flex: 1, fontSize: 15, fontWeight: '700', color: '#334155' },
    settingSubEnhanced: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },

    logoutBtnEnhanced: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#FFF1F2', paddingVertical: 18, borderRadius: 100, marginTop: 40, borderWidth: 1.5, borderColor: '#FFE4E6' },
    logoutBtnTxtEnhanced: { fontSize: 16, fontWeight: '800', color: '#E11D48' },
    versionTxt: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 20, fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, padding: 24, paddingBottom: 40, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
    inputLabel: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 10, marginTop: 16, letterSpacing: 0.5 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#0F172A', fontWeight: '600' },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#6366F1', borderRadius: 100, paddingVertical: 16, marginTop: 32, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
    saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
    detailLabel: { fontSize: 15, color: '#64748B', fontWeight: '500' },
    detailValue: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
    line: { height: 1.5, backgroundColor: '#F8FAFC', marginVertical: 4 },

    modalSubTxt: { fontSize: 14, color: '#64748B', marginBottom: 20 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    switchTxtCol: { flex: 1, paddingRight: 16 },
    switchTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
    switchDesc: { fontSize: 13, color: '#94A3B8', fontWeight: '500', lineHeight: 18 },
});

