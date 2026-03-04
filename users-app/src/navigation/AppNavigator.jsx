import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, UserRound, Pill, HeartPulse, Users, Activity, Menu, Bell } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

// Onboarding screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import PatientSignupScreen from '../screens/onboarding/PatientSignupScreen';
import LoginScreen from '../screens/onboarding/LoginScreen';
import GoogleOnboardingScreen from '../screens/onboarding/GoogleOnboardingScreen';

// Patient screens
import PatientHomeScreen from '../screens/patient/HomeScreen';
import MyCallerScreen from '../screens/patient/MyCallerScreen';
import MedicationsScreen from '../screens/patient/MedicationsScreen';
import HealthProfileScreen from '../screens/patient/HealthProfileScreen';
import NotificationsScreen from '../screens/patient/NotificationsScreen';
import PatientProfileScreen from '../screens/patient/ProfileScreen'; // New profile tab view

// Caller screens
import CallerHomeScreen from '../screens/caller/HomeScreen';
import CallerPatientsScreen from '../screens/caller/PatientsScreen';
import ActivityFeedScreen from '../screens/caller/ActivityFeedScreen';
import CallerProfileScreen from '../screens/caller/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIconWrapper = ({ focused, IconConfig }) => {
    return (
        <View style={[styles.tabContainer, focused && styles.tabContainerFocused]}>
            <IconConfig color={focused ? colors.accent : '#94A3B8'} size={24} strokeWidth={focused ? 2.5 : 2} />
        </View>
    );
};

const tabScreenOptions = {
    headerShown: false,
    tabBarShowLabel: false,
    tabBarStyle: {
        backgroundColor: '#FFFFFF',
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 24 : 16,
        left: 16,
        right: 16,
        borderRadius: 24,
        borderTopWidth: 0,
        height: 64,
        paddingBottom: 0,
        paddingTop: 0,
        elevation: 8,
        shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16,
    },
};

function PatientTabNavigator() {
    return (
        <Tab.Navigator screenOptions={tabScreenOptions}>
            <Tab.Screen name="PatientHome" component={PatientHomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIconWrapper focused={focused} IconConfig={House} label="Home" /> }} />
            <Tab.Screen name="MyCaller" component={MyCallerScreen} options={{ tabBarIcon: ({ focused }) => <TabIconWrapper focused={focused} IconConfig={UserRound} label="Callers" /> }} />
            <Tab.Screen name="Medications" component={MedicationsScreen} options={{ tabBarIcon: ({ focused }) => <TabIconWrapper focused={focused} IconConfig={Pill} label="Meds" /> }} />
            <Tab.Screen name="HealthProfile" component={HealthProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIconWrapper focused={focused} IconConfig={HeartPulse} label="Health" /> }} />
            <Tab.Screen name="Profile" component={PatientProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIconWrapper focused={focused} IconConfig={UserRound} label="Profile" /> }} />
        </Tab.Navigator>
    );
}

function CallerTabNavigator() {
    return (
        <Tab.Navigator screenOptions={tabScreenOptions}>
            <Tab.Screen name="CallerHome" component={CallerHomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIconWrapper focused={focused} IconConfig={House} label="Home" /> }} />
            <Tab.Screen name="CallerPatients" component={CallerPatientsScreen} options={{ tabBarIcon: ({ focused }) => <TabIconWrapper focused={focused} IconConfig={Users} label="Patients" /> }} />
            <Tab.Screen name="ActivityFeed" component={ActivityFeedScreen} options={{ tabBarIcon: ({ focused }) => <TabIconWrapper focused={focused} IconConfig={Activity} label="Activity" /> }} />
            <Tab.Screen name="CallerProfile" component={CallerProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabIconWrapper focused={focused} IconConfig={Menu} label="Menu" /> }} />
        </Tab.Navigator>
    );
}

function LoadingScreen() {
    return (
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );
}

export default function AppNavigator() {
    const { initializing, isAuthenticated, userRole } = useAuth();

    if (initializing) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Loading" component={LoadingScreen} />
            </Stack.Navigator>
        );
    }

    if (!isAuthenticated) {
        return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="PatientSignup" component={PatientSignupScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
            </Stack.Navigator>
        );
    }

    const isCaller = userRole === 'caretaker' || userRole === 'caller';

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isCaller ? (
                <Stack.Screen name="CallerTabs" component={CallerTabNavigator} />
            ) : (
                <>
                    <Stack.Screen name="PatientTabs" component={PatientTabNavigator} />
                    <Stack.Screen name="GoogleOnboarding" component={GoogleOnboardingScreen} />
                    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ presentation: 'modal' }} />
                </>
            )}
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    loadingText: { color: colors.primary, marginTop: 12, fontSize: 16, fontWeight: '500' },

    tabContainer: {
        width: 48, height: 48, borderRadius: 24,
        alignItems: 'center', justifyContent: 'center',
    },
    tabContainerFocused: { backgroundColor: 'rgba(58, 134, 255, 0.12)' },
});
