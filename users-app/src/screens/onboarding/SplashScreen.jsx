import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { colors, typography, spacing } from '../../theme';

export default function SplashScreen({ navigation }) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Fade in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: Platform.OS !== 'web',
        }).start();

        // Breathing pulse loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.15,
                    duration: 750,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: Platform.OS !== 'web',
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 750,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: Platform.OS !== 'web',
                }),
            ])
        ).start();

        // Auto-navigate after 2.5s
        const timer = setTimeout(() => {
            navigation.replace('Welcome');
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, { opacity: fadeAnim }]}>
                {/* Pulse heartbeat icon */}
                <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={styles.heartbeatIcon}>
                        <View style={styles.heartLine} />
                        <View style={styles.heartPeak} />
                        <View style={styles.heartLine2} />
                    </View>
                </Animated.View>

                {/* Wordmark */}
                <Text style={styles.logoText}>Care<Text style={styles.logoAccent}>Co</Text></Text>
                <Text style={styles.tagline}>Care, Delivered Daily</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    pulseCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(58, 134, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    heartbeatIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
    },
    heartLine: {
        width: 20,
        height: 2,
        backgroundColor: colors.accent,
        borderRadius: 1,
    },
    heartPeak: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: colors.accent,
        marginTop: -10,
    },
    heartLine2: {
        width: 20,
        height: 2,
        backgroundColor: colors.accent,
        borderRadius: 1,
    },
    logoText: {
        fontSize: 42,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: -1,
    },
    logoAccent: {
        color: colors.accent,
    },
    tagline: {
        fontSize: typography.sizes.body,
        color: 'rgba(255,255,255,0.6)',
        marginTop: spacing.sm,
        fontWeight: '400',
    },
});
