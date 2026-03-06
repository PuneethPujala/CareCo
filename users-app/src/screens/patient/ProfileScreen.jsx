import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable, Modal, TextInput, Alert, ActivityIndicator, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Bell, Settings, LogOut, ChevronRight, UserRound, Phone, X, Save } from 'lucide-react-native';
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

    // EC Form
    const [ecName, setEcName] = useState('');
    const [ecPhone, setEcPhone] = useState('');
    const [ecRelation, setEcRelation] = useState('');
    const [saving, setSaving] = useState(false);

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
            } catch (err) {
                console.warn('Failed to load profile:', err.message);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

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
            {/* Gradient Header */}
            <LinearGradient colors={['#0A2463', '#1E5FAD']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
                <View style={styles.decorativeCircle} />
                <Text style={styles.heroLabel}>CareCo</Text>
                <Text style={styles.headerTitle}>My Profile</Text>
            </LinearGradient>

            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={styles.cardInfo}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarTxt}>{displayName?.charAt(0) || 'U'}</Text>
                    </View>
                    <View style={styles.infoTextGroup}>
                        <Text style={styles.nameText}>{patient?.name || displayName || 'User'}</Text>
                        <Text style={styles.emailText}>{userEmail || 'patient@careco.com'}</Text>
                        {patient?.city ? <Text style={styles.cityText}>{patient.city}</Text> : null}
                        <View style={[styles.planBadge, { backgroundColor: planBg }]}>
                            <Text style={[styles.planBadgeText, { color: planColor }]}>{planLabel}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionHeader}>SETTINGS</Text>
                <View style={styles.settingsGroup}>
                    <Pressable style={styles.settingRow} onPress={() => setAccountModalVisible(true)}>
                        <View style={styles.settingIconBox}><Settings size={20} color="#64748B" /></View>
                        <Text style={styles.settingLabel}>Account Details</Text>
                        <ChevronRight size={20} color="#CBD5E1" />
                    </Pressable>
                    <Pressable style={styles.settingRow} onPress={() => setCpModalVisible(true)}>
                        <View style={styles.settingIconBox}><Shield size={20} color="#64748B" /></View>
                        <Text style={styles.settingLabel}>Change Password</Text>
                        <ChevronRight size={20} color="#CBD5E1" />
                    </Pressable>
                    <Pressable style={styles.settingRow} onPress={async () => {
                        try {
                            await apiService.auth.resetPassword(userEmail);
                            Alert.alert('Email Sent', 'A password reset link has been sent to your email.');
                        } catch (err) {
                            Alert.alert('Error', 'Failed to send password reset email.');
                        }
                    }}>
                        <View style={styles.settingIconBox}><Shield size={20} color="#64748B" /></View>
                        <Text style={styles.settingLabel}>Forgot Password? (Email)</Text>
                        <ChevronRight size={20} color="#CBD5E1" />
                    </Pressable>
                    <Pressable style={styles.settingRow} onPress={() => setEcModalVisible(true)}>
                        <View style={styles.settingIconBox}><Phone size={20} color="#64748B" /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.settingLabel}>Emergency Contacts</Text>
                            {patient?.emergency_contact?.name && (
                                <Text style={styles.settingSub}>{patient.emergency_contact.name} ({patient.emergency_contact.relation})</Text>
                            )}
                        </View>
                        <ChevronRight size={20} color="#CBD5E1" />
                    </Pressable>
                </View>

                <View style={styles.logoutGroup}>
                    <Pressable style={styles.logoutBtn} onPress={() => signOut()}>
                        <LogOut size={20} color={colors.danger} strokeWidth={2.5} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </Pressable>
                </View>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    hero: {
        height: 140,
        borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
        alignItems: 'center', justifyContent: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 38, overflow: 'hidden',
    },
    decorativeCircle: { position: 'absolute', top: -35, right: -35, width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
    heroLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 4 },
    headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },

    body: { flex: 1 },
    bodyContent: { paddingHorizontal: 16, paddingBottom: 110, paddingTop: 16 },

    cardInfo: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginTop: -20, marginBottom: 28, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E2E8F0', shadowColor: 'rgba(10,36,99,0.12)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 16, elevation: 6 },
    avatarLarge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 16, borderWidth: 3, borderColor: 'rgba(58,134,255,0.2)' },
    avatarTxt: { fontSize: 24, fontWeight: '700', color: colors.accent },
    infoTextGroup: { flex: 1, alignItems: 'flex-start' },
    nameText: { fontSize: 20, fontWeight: '700', color: '#1A202C' },
    emailText: { fontSize: 14, color: '#64748B', marginTop: 4 },
    cityText: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
    planBadge: { marginTop: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    planBadgeText: { fontSize: 12, fontWeight: '700' },

    sectionHeader: { fontSize: 13, fontWeight: '600', color: '#94A3B8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 },

    settingsGroup: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
    settingRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    settingIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F4F7FB', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    settingLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A202C' },
    settingSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },

    logoutGroup: { alignItems: 'center' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FEF2F2', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
    logoutText: { fontSize: 16, fontWeight: '700', color: colors.danger },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A202C' },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: '#F8FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#1A202C' },
    saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 14, marginTop: 24 },
    saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
    detailLabel: { fontSize: 14, color: '#64748B' },
    detailValue: { fontSize: 14, fontWeight: '600', color: '#1A202C' },
    line: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
    toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
    toggleTitle: { fontSize: 15, fontWeight: '600', color: '#1A202C' },
    toggleDesc: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
    actionRowText: { fontSize: 15, fontWeight: '600', color: '#1A202C' },
});
