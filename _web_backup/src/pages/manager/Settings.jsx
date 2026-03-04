import React, { useState } from 'react';
import { User, Bell, Shield, Moon, Save, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Mock form state
    const [formData, setFormData] = useState({
        name: user?.name || 'John Doe',
        email: user?.email || 'john@example.com',
        phone: '+1 (555) 123-4567',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        notifications: {
            email: true,
            push: true,
            sms: false,
            marketing: false
        },
        appearance: {
            darkMode: false,
            compactMode: false
        }
    });

    const handleSave = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            // Show success message (would check actual implementation for toast/alert)
            alert('Settings saved successfully!');
        }, 1000);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Moon },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500 text-sm">Manage your account preferences and settings</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar Navigation */}
                <Card className="lg:w-64 h-fit p-2">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </Card>

                {/* Content Area */}
                <div className="flex-1">
                    <Card className="p-6">
                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Profile Information</h2>
                                    <p className="text-sm text-gray-500">Update your personal details and contact confirmation.</p>
                                </div>

                                <div className="flex items-center space-x-6 pb-6 border-b border-gray-100">
                                    <img
                                        src={user?.avatar || `https://ui-avatars.com/api/?name=${formData.name}`}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full object-cover"
                                    />
                                    <div>
                                        <Button variant="outline" size="sm" className="mb-2">Change Avatar</Button>
                                        <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Full Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        icon={User}
                                    />
                                    <Input
                                        label="Email Address"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        icon={Mail}
                                        type="email"
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        icon={Phone}
                                        type="tel"
                                    />
                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                        <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm capitalize">
                                            {user?.role || 'Manager'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notification Settings */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Notifications</h2>
                                    <p className="text-sm text-gray-500">Choose how you want to be notified.</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { id: 'email', label: 'Email Notifications', desc: 'Receive daily summaries and critical alerts via email.' },
                                        { id: 'push', label: 'Push Notifications', desc: 'Receive real-time alerts on your device.' },
                                        { id: 'sms', label: 'SMS Notifications', desc: 'Receive text messages for urgent updates.' },
                                        { id: 'marketing', label: 'Marketing Emails', desc: 'Receive news about new features and updates.' },
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{item.label}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={formData.notifications[item.id]}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        notifications: { ...formData.notifications, [item.id]: e.target.checked }
                                                    })}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Security</h2>
                                    <p className="text-sm text-gray-500">Manage your password and security pfererences.</p>
                                </div>

                                <div className="space-y-4 max-w-md">
                                    <div className="relative">
                                        <Input
                                            label="Current Password"
                                            type={showPassword ? "text" : "password"}
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            icon={Lock}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>

                                    <Input
                                        label="New Password"
                                        type="password"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        icon={Lock}
                                    />

                                    <Input
                                        label="Confirm New Password"
                                        type="password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        icon={Lock}
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                                            <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account.</p>
                                        </div>
                                        <Button variant="outline" size="sm">Enable 2FA</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appearance Settings */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Appearance</h2>
                                    <p className="text-sm text-gray-500">Customize how the application looks.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div
                                        className={`cursor-pointer border-2 rounded-xl p-4 hover:border-blue-500 transition-colors ${!formData.appearance.darkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => setFormData({ ...formData, appearance: { ...formData.appearance, darkMode: false } })}
                                    >
                                        <div className="h-20 bg-gray-100 rounded-lg mb-3 border border-gray-200"></div>
                                        <p className="font-medium text-gray-900 text-sm">Light Mode</p>
                                    </div>
                                    <div
                                        className={`cursor-pointer border-2 rounded-xl p-4 hover:border-blue-500 transition-colors ${formData.appearance.darkMode ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                        onClick={() => setFormData({ ...formData, appearance: { ...formData.appearance, darkMode: true } })}
                                    >
                                        <div className="h-20 bg-gray-800 rounded-lg mb-3 border border-gray-700"></div>
                                        <p className="font-medium text-gray-900 text-sm">Dark Mode</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Compact Mode</h3>
                                        <p className="text-xs text-gray-500 mt-1">Increase data density on the screen.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.appearance.compactMode}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                appearance: { ...formData.appearance, compactMode: e.target.checked }
                                            })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
                            <Button variant="ghost">Cancel</Button>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Settings;
