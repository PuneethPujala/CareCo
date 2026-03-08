import { apiService, handleApiError } from '../api';
import axios from 'axios';

jest.mock('axios', () => {
    return {
        create: jest.fn(() => ({
            interceptors: {
                request: { use: jest.fn() },
                response: { use: jest.fn() }
            },
            post: jest.fn(),
            get: jest.fn(),
            put: jest.fn()
        }))
    };
});

describe('API Service Helper Checks', () => {
    it('maps correct error object in handleApiError for response errors', () => {
        const error = {
            response: {
                data: { error: 'Invalid credentials' },
                status: 401
            }
        };
        const handled = handleApiError(error);
        expect(handled.message).toBe('Invalid credentials');
        expect(handled.status).toBe(401);
    });

    it('maps default error object for non-response errors', () => {
        const error = { message: 'Network Timeout' };
        const handled = handleApiError(error);
        expect(handled.message).toBe('Network Timeout');
        expect(handled.status).toBeNull();
    });
});
