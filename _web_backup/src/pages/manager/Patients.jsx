import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, Download, Upload, Eye, Edit, Phone, Mail, User, Clock } from 'lucide-react';
import { mockPatients } from '../../mockData';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.assignedCaretaker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'discharged': return 'error';
      default: return 'default';
    }
  };

  const getAdherenceColor = (rate) => {
    if (rate >= 90) return 'success';
    if (rate >= 75) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-500 text-sm">Monitor and manage patient care plans</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/manager/enroll-patient">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Enroll New Patient
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 sticky top-0 z-10 shadow-sm border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients by name or caretaker..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 md:pb-0">
            {['all', 'active', 'paused', 'discharged'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Mobile Card View (Visible on small screens) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredPatients.map(patient => (
          <div key={patient.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name}`}
                  alt={patient.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-500">Age {patient.age}</p>
                </div>
              </div>
              <Badge variant={getStatusColor(patient.status)} size="sm">
                {patient.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Caretaker</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {patient.assignedCaretaker}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Adherence</p>
                <p className={`font-bold ${patient.adherenceRate >= 90 ? 'text-green-600' :
                  patient.adherenceRate >= 75 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {patient.adherenceRate}%
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link to={`/manager/patients/${patient.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full">View Profile</Button>
              </Link>
              <Button variant="outline" size="sm" className="flex-1">
                <Phone className="w-4 h-4 mx-auto" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View (Hidden on small screens) */}
      <Card className="hidden md:block overflow-hidden border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50">
              <tr className="text-left">
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Patient</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Caretaker</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Adherence</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Last Contact</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    No patients found matching your search.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={patient.avatar || `https://ui-avatars.com/api/?name=${patient.name}`}
                          alt={patient.name}
                          className="w-10 h-10 rounded-full bg-gray-200 object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">ID: #{patient.id.toString().padStart(4, '0')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                          {patient.assignedCaretaker.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-sm text-gray-700">{patient.assignedCaretaker}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 w-24 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${patient.adherenceRate >= 90 ? 'bg-emerald-500' :
                              patient.adherenceRate >= 75 ? 'bg-amber-400' : 'bg-red-500'
                              }`}
                            style={{ width: `${patient.adherenceRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{patient.adherenceRate}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1.5 text-gray-400" />
                        {patient.lastCallDate || 'Never'}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getStatusColor(patient.status)} size="sm">
                        {patient.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/manager/patients/${patient.id}`}>
                          <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-900">{filteredPatients.length}</span> patients
        </p>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Previous</button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm shadow-sm hover:bg-blue-700">1</button>
          <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">2</button>
          <button className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default Patients;
