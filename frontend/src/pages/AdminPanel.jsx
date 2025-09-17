import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { 
    adminToken, 
    adminData, 
    logoutAdmin, 
    isAdmin, 
    isAdminTokenValid,
    getDashboardStats,
    doctors,
    getDoctorsData,
    updateDoctorAvailability,
    toggleDoctorStatus
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availabilityForm, setAvailabilityForm] = useState({
    status: 'available',
    reason: '',
    expectedBackTime: '',
    availableSlots: 0
  });

  // Check authentication on component mount
// In AdminPanel.js, replace the useEffect with:
useEffect(() => {
    const checkAuthAndLoad = async () => {
        console.log('Checking admin authentication...');
        
        if (!adminToken) {
            console.log('No admin token, redirecting...');
            toast.error('Please login as admin to access this page');
            navigate('/admin');
            return;
        }

        if (!isAdminTokenValid()) {
            console.log('Invalid token, redirecting...');
            toast.error('Admin session expired. Please login again.');
            navigate('/admin');
            return;
        }

        if (!isAdmin()) {
            console.log('Not admin role, redirecting...');
            toast.error('Admin access required');
            navigate('/admin');
            return;
        }

        // If we get here, authentication is valid
        console.log('Auth valid, loading data...');
        await loadDashboardData();
    };

    checkAuthAndLoad();
}, []); // Remove all dependencies to prevent loops

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load dashboard stats
      const statsResult = await getDashboardStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }

      // Load doctors data
      await getDoctorsData();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin');
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor) {
      toast.error('No doctor selected');
      return;
    }

    try {
      const result = await updateDoctorAvailability(selectedDoctor._id, {
        status: availabilityForm.status,
        reason: availabilityForm.reason,
        expectedBackTime: availabilityForm.expectedBackTime || null,
        availableSlots: parseInt(availabilityForm.availableSlots) || 0
      });

      if (result.success) {
        setSelectedDoctor(null);
        setAvailabilityForm({
          status: 'available',
          reason: '',
          expectedBackTime: '',
          availableSlots: 0
        });
      }
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update doctor availability');
    }
  };

  const handleToggleStatus = async (doctorId) => {
    try {
      await toggleDoctorStatus(doctorId);
    } catch (error) {
      console.error('Error toggling doctor status:', error);
      toast.error('Failed to toggle doctor status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {adminData?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{adminData?.name}</span>
              </div>
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                🏠 Back to Site
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'doctors'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👨‍⚕️ Manage Doctors
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">👨‍⚕️</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Doctors</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalDoctors}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">✅</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Available</p>
                      <p className="text-2xl font-semibold text-green-600">{stats.availableDoctors}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">❌</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Unavailable</p>
                      <p className="text-2xl font-semibold text-red-600">{stats.unavailableDoctors}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">🔴</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Busy</p>
                      <p className="text-2xl font-semibold text-orange-600">{stats.busyDoctors}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Doctors by Specialty */}
            {stats?.doctorsBySpecialty && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Doctors by Specialty</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.doctorsBySpecialty.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600">{item._id}</span>
                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Doctors Management Tab */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Doctor Management</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specialty
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available Slots
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {doctors.map((doctor) => (
                        <tr key={doctor._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=3b82f6&color=ffffff&size=400`}
                                  alt=""
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                                <div className="text-sm text-gray-500">{doctor.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{doctor.speciality}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              doctor.isActive && doctor.availability?.status === 'available'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {doctor.isActive ? doctor.availability?.status || 'available' : 'inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {doctor.availableSlots || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setAvailabilityForm({
                                  status: doctor.availability?.status || 'available',
                                  reason: doctor.availability?.reason || '',
                                  expectedBackTime: doctor.availability?.expectedBackTime ? 
                                    new Date(doctor.availability.expectedBackTime).toISOString().slice(0, 16) : '',
                                  availableSlots: doctor.availableSlots || 0
                                });
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              ⚙️ Manage
                            </button>
                            <button
                              onClick={() => handleToggleStatus(doctor._id)}
                              className={`${
                                doctor.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {doctor.isActive ? '❌ Deactivate' : '✅ Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Availability Management Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Manage Availability: {selectedDoctor.name}
              </h3>
              
              <form onSubmit={handleUpdateAvailability} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={availabilityForm.status}
                    onChange={(e) => setAvailabilityForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="temporarily_unavailable">Temporarily Unavailable</option>
                    <option value="on_leave">On Leave</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                  <input
                    type="text"
                    value={availabilityForm.reason}
                    onChange={(e) => setAvailabilityForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional reason..."
                  />
                </div>

                {availabilityForm.status !== 'available' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Back Time</label>
                    <input
                      type="datetime-local"
                      value={availabilityForm.expectedBackTime}
                      onChange={(e) => setAvailabilityForm(prev => ({ ...prev, expectedBackTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={availabilityForm.availableSlots}
                    onChange={(e) => setAvailabilityForm(prev => ({ ...prev, availableSlots: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSelectedDoctor(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Update Availability
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;