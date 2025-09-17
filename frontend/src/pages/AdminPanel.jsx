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
    users,
    getUsersData,
    updateDoctorAvailability,
    toggleDoctorStatus,
    addNewDoctor,
    updateExistingDoctor,
    removeDoctor,
    getAnalytics
  } = useContext(AppContext);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showEditDoctorModal, setShowEditDoctorModal] = useState(false);

  // Form states
  const [availabilityForm, setAvailabilityForm] = useState({
    status: 'available',
    reason: '',
    expectedBackTime: '',
    availableSlots: 0
  });

  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    speciality: '',
    experience: '',
    location: '',
    phone: '',
    degree: '',
    consultationFee: '',
    rating: 4.0,
    availableSlots: 5,
    image: ''
  });

  const specialties = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Gastroenterologist',
    'Cardiologist',
    'Orthopedist'
  ];

  // Check authentication
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      if (!adminToken || !isAdminTokenValid() || !isAdmin()) {
        toast.error('Please login as admin to access this page');
        navigate('/admin');
        return;
      }
      await loadDashboardData();
    };
    checkAuthAndLoad();
  }, []); 

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const statsResult = await getDashboardStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
      await getDoctorsData();
      if (getUsersData) await getUsersData();
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
    if (!selectedDoctor) return;

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
      toast.error('Failed to update doctor availability');
    }
  };

  const handleToggleStatus = async (doctorId) => {
    try {
      await toggleDoctorStatus(doctorId);
    } catch (error) {
      toast.error('Failed to toggle doctor status');
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      if (addNewDoctor) {
        const result = await addNewDoctor(doctorForm);
        if (result.success) {
          setShowAddDoctorModal(false);
          resetDoctorForm();
        }
      }
    } catch (error) {
      toast.error('Failed to add doctor');
    }
  };

  const handleEditDoctor = async (e) => {
    e.preventDefault();
    try {
      if (updateExistingDoctor && selectedDoctor) {
        const result = await updateExistingDoctor(selectedDoctor._id, doctorForm);
        if (result.success) {
          setShowEditDoctorModal(false);
          setSelectedDoctor(null);
          resetDoctorForm();
        }
      }
    } catch (error) {
      toast.error('Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to remove this doctor?')) {
      try {
        if (removeDoctor) {
          await removeDoctor(doctorId);
        }
      } catch (error) {
        toast.error('Failed to remove doctor');
      }
    }
  };

  const resetDoctorForm = () => {
    setDoctorForm({
      name: '',
      email: '',
      speciality: '',
      experience: '',
      location: '',
      phone: '',
      degree: '',
      consultationFee: '',
      rating: 4.0,
      availableSlots: 5,
      image: ''
    });
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
                Back to Site
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Logout
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
              {['dashboard', 'doctors', 'users', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'dashboard' && 'Dashboard'}
                  {tab === 'doctors' && 'Manage Doctors'}
                  {tab === 'users' && 'Manage Users'}
                  {tab === 'analytics' && 'Analytics'}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">👨‍⚕️</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Doctors</p>
                      <p className="text-2xl font-semibold text-gray-900">{stats.doctors?.total || stats.totalDoctors}</p>
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
                      <p className="text-2xl font-semibold text-green-600">{stats.doctors?.available || stats.availableDoctors}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">👥</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <p className="text-2xl font-semibold text-blue-600">{stats.users?.total || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="text-3xl">🕒</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Available Slots</p>
                      <p className="text-2xl font-semibold text-purple-600">{stats.doctors?.totalSlots || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    setActiveTab('doctors');
                    setShowAddDoctorModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add New Doctor
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  View All Users
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Management Tab */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
              <button
                onClick={() => setShowAddDoctorModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add New Doctor
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Doctors ({doctors.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slots</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=3b82f6&color=ffffff&size=400`;
                                }}
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
                          <div className="text-sm text-gray-500">{doctor.experience}</div>
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
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
                              Manage
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDoctor(doctor);
                                setDoctorForm({
                                  name: doctor.name,
                                  email: doctor.email,
                                  speciality: doctor.speciality,
                                  experience: doctor.experience,
                                  location: doctor.location,
                                  phone: doctor.phone,
                                  degree: doctor.degree,
                                  consultationFee: doctor.consultationFee,
                                  rating: doctor.rating,
                                  availableSlots: doctor.availableSlots,
                                  image: doctor.image
                                });
                                setShowEditDoctorModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggleStatus(doctor._id)}
                              className={`${
                                doctor.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {doctor.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Users ({users?.length || 0})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(users || []).map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff&size=400`}
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.phone || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.address || 'No address'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Availability Management Modal */}
      {selectedDoctor && !showEditDoctorModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
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
      )}

      {/* Add/Edit Doctor Modal */}
      {(showAddDoctorModal || showEditDoctorModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {showAddDoctorModal ? 'Add New Doctor' : `Edit Doctor: ${selectedDoctor?.name}`}
            </h3>
            
            <form onSubmit={showAddDoctorModal ? handleAddDoctor : handleEditDoctor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specialty *</label>
                  <select
                    required
                    value={doctorForm.speciality}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, speciality: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Specialty</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 5 years"
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    value={doctorForm.location}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Degree *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., MBBS, MD"
                    value={doctorForm.degree}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, degree: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={doctorForm.consultationFee}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, consultationFee: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={doctorForm.availableSlots}
                    onChange={(e) => setDoctorForm(prev => ({ ...prev, availableSlots: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    showAddDoctorModal ? setShowAddDoctorModal(false) : setShowEditDoctorModal(false);
                    setSelectedDoctor(null);
                    resetDoctorForm();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {showAddDoctorModal ? 'Add Doctor' : 'Update Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              User Details: {selectedUser.name}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center mb-4">
                <img
                  className="h-20 w-20 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=3b82f6&color=ffffff&size=400`}
                  alt={selectedUser.name}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-sm text-gray-900">{selectedUser.name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="text-sm text-gray-900">{selectedUser.phone || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <p className="text-sm text-gray-900">{selectedUser.address || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <p className="text-sm text-gray-900">{selectedUser.gender || 'Not specified'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Member Since</label>
                <p className="text-sm text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;