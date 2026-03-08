import { supabase, handleAuthError } from '../supabase';

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            signOut: jest.fn(),
            getSession: jest.fn(),
        }
    }))
}));

jest.mock('expo-secure-store', () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
}));

jest.mock('expo-constants', () => ({
    __esModule: true,
    default: { expoConfig: { version: '1.0.0' } },
    expoConfig: { version: '1.0.0' }
}));

describe('Supabase Client auth helpers', () => {
    it('maps correct error messages in handleAuthError', () => {
        const error = { message: 'Invalid login credentials', status: 400 };
        const handled = handleAuthError(error);
        expect(handled.message).toBe('Invalid email or password');
        expect(handled.code).toBe(400);
    });

    it('returns default error message for unknown errors', () => {
        const error = { message: 'Something went incredibly wrong' };
        const handled = handleAuthError(error);
        expect(handled.message).toBe('Something went incredibly wrong');
    });
});
