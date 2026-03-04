import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native';
import { colors } from '../../theme';

export default function WelcomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.headerArea}>
                {/* Placeholder for SVG/Graphic */}
                <View style={styles.graphicPlaceholder}>
                    <Text style={styles.graphicEmoji}>🩺</Text>
                </View>
                <Text style={styles.headline}>Care, Delivered Daily</Text>
                <Text style={styles.subtext}>
                    Personalized health support, right in your pocket.
                </Text>
            </View>

            <View style={styles.bottomArea}>
                <Pressable
                    style={styles.primaryBtn}
                    onPress={() => navigation.navigate('PatientSignup')}
                >
                    <Text style={styles.primaryBtnText}>Sign Up</Text>
                </Pressable>

                <Pressable
                    style={styles.secondaryBtn}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.secondaryBtnText}>Log In</Text>
                </Pressable>

                <Pressable
                    style={styles.callerLink}
                    onPress={() => navigation.navigate('Login', { defaultRole: 'caller' })}
                >
                    <Text style={styles.callerLinkText}>
                        Are you a Care Caller? <Text style={styles.linkBold}>Log in here</Text>
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A2463', // Deep Navy gradient conceptually, keeping it clean
        justifyContent: 'space-between',
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 80 : 60,
    },
    headerArea: {
        alignItems: 'center',
        marginTop: 40,
    },
    graphicPlaceholder: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 40,
    },
    graphicEmoji: { fontSize: 48 },
    headline: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtext: {
        fontSize: 16,
        color: '#BDD4EE', // light blue
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    bottomArea: {
        marginBottom: 20,
    },
    primaryBtn: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    primaryBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0A2463',
    },
    secondaryBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
        borderRadius: 8,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    secondaryBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    callerLink: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    callerLinkText: {
        fontSize: 14,
        color: '#BDD4EE',
    },
    linkBold: {
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
