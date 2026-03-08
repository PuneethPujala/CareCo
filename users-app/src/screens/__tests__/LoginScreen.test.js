import React from 'react';
import { render } from '@testing-library/react-native';
import LoginScreen from '../onboarding/LoginScreen';

// Mock the useAuth hook
jest.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        signIn: jest.fn(),
        signInWithGoogle: jest.fn(),
        resetPassword: jest.fn(),
        session: null,
        profile: null,
        loading: false,
    }),
}));

// Mock expo-auth-session Google provider
jest.mock('expo-auth-session/providers/google', () => ({
    useIdTokenAuthRequest: jest.fn(() => [null, null, jest.fn()]),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
    maybeCompleteAuthSession: jest.fn(),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
    const { View } = require('react-native');
    const react = require('react');
    return {
        LinearGradient: ({ children, ...props }) =>
            react.createElement(View, props, children),
    };
});

// Mock lucide-react-native icons — must include ALL icons used in LoginScreen
jest.mock('lucide-react-native', () => {
    const { View } = require('react-native');
    const react = require('react');
    const MockIcon = (props) => react.createElement(View, props);
    return {
        Mail: MockIcon,
        Lock: MockIcon,
        Eye: MockIcon,
        EyeOff: MockIcon,
        ArrowRight: MockIcon,
        Phone: MockIcon,
        Chrome: MockIcon,
        HeartPulse: MockIcon,
        AlertCircle: MockIcon,
    };
});

const mockNavigation = {
    navigate: jest.fn(),
    reset: jest.fn(),
    replace: jest.fn(),
};

describe('LoginScreen Smoke Test', () => {
    it('renders without crashing', () => {
        const { toJSON } = render(
            <LoginScreen navigation={mockNavigation} />
        );
        expect(toJSON()).toBeTruthy();
    });
});
