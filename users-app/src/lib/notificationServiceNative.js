import { Platform } from 'react-native';

// expo-notifications does not support web — export no-op stubs for web
if (Platform.OS === 'web') {
    module.exports = {
        registerForPushNotifications: async () => false,
        scheduleMedicationReminders: async () => {},
        cancelAllMedicationReminders: async () => {},
        scheduleMissedDoseAlert: async () => {},
        cancelMissedDoseAlert: async () => {},
    };
} else {
    const setupNative = require('./notificationServiceNative');
    module.exports = setupNative;
}
