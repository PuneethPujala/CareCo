import React from 'react';
import { CreditCard, CheckCircle, Download, AlertTriangle, Shield, TrendingUp } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const OrganizationBilling = () => {
    const invoices = [
        { id: 'INV-2024-001', date: 'Oct 1, 2024', amount: '$499.00', status: 'Paid', items: 'Pro Plan (Monthly)' },
        { id: 'INV-2024-002', date: 'Sep 1, 2024', amount: '$499.00', status: 'Paid', items: 'Pro Plan (Monthly)' },
        { id: 'INV-2024-003', date: 'Aug 1, 2024', amount: '$499.00', status: 'Paid', items: 'Pro Plan (Monthly)' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
                <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Download All Invoices
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Plan Card */}
                <div className="md:col-span-2">
                    <Card className="h-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <Shield className="w-5 h-5 text-indigo-200" />
                                    <span className="text-indigo-200 font-medium">Current Plan</span>
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Professional Tier</h2>
                                <p className="text-indigo-100 opacity-90 mb-6">
                                    Advanced reporting, unlimited caretakers, and priority support.
                                </p>
                                <div className="flex items-center space-x-4">
                                    <span className="text-2xl font-bold">$499<span className="text-sm font-normal text-indigo-200">/mo</span></span>
                                    <Badge variant="success" className="bg-green-400/20 text-green-100 border-0">Active</Badge>
                                </div>
                            </div>
                            <div>
                                <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-gray-50 border-0">
                                    Change Plan
                                </Button>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/20 grid grid-cols-3 gap-8">
                            <div>
                                <p className="text-indigo-200 text-sm mb-1">Next Billing Date</p>
                                <p className="font-semibold">Nov 1, 2024</p>
                            </div>
                            <div>
                                <p className="text-indigo-200 text-sm mb-1">Payment Method</p>
                                <div className="flex items-center">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    <span>•••• 4242</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-indigo-200 text-sm mb-1">Auto-Renew</p>
                                <p className="font-semibold">On</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Usage Metrics */}
                <div className="space-y-6">
                    <Card>
                        <h3 className="font-semibold text-gray-900 mb-4">Plan Usage</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Patients</span>
                                    <span className="font-medium">750 / 1000</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Storage</span>
                                    <span className="font-medium">45GB / 100GB</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">API Calls</span>
                                    <span className="font-medium">1.2M / 2M</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Invoice History */}
            <Card>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice History</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 font-medium text-gray-500 text-sm">Invoice ID</th>
                                <th className="py-3 font-medium text-gray-500 text-sm">Date</th>
                                <th className="py-3 font-medium text-gray-500 text-sm">Items</th>
                                <th className="py-3 font-medium text-gray-500 text-sm">Amount</th>
                                <th className="py-3 font-medium text-gray-500 text-sm">Status</th>
                                <th className="py-3 font-medium text-gray-500 text-sm text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 text-sm font-medium text-gray-900">{invoice.id}</td>
                                    <td className="py-3 text-sm text-gray-600">{invoice.date}</td>
                                    <td className="py-3 text-sm text-gray-600">{invoice.items}</td>
                                    <td className="py-3 text-sm font-medium text-gray-900">{invoice.amount}</td>
                                    <td className="py-3 text-sm">
                                        <Badge variant="success" size="sm">{invoice.status}</Badge>
                                    </td>
                                    <td className="py-3 text-sm text-right">
                                        <button className="text-blue-600 hover:text-blue-800 font-medium text-xs">
                                            Download PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default OrganizationBilling;
