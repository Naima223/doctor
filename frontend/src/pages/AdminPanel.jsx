import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const { 
    backendUrl, 
    token, 
    doctors, 
    getDoctorsData,
    updateDoctorAvailability,
    toggleDoctorStatus,
    addDoctorNote
  } = useContext(AppContext);
  
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'availability', 'note', 'toggle'
  const [formData, setFormData] = useState({
    status: 'available',
    reason: '',
    expectedBackTime: '',
    availableSlots: '',
    note: ''
  });

  useEffect(() => {
    if (token) {
      getDoctorsData();
    }
  }, [token]);

  const resetForm = () => {
    setFormData({
      status: 'available',
      reason: '',
      expectedBackTime: '',
      availableSlots: '',
      note: ''
    });
  };

  const openModal = (type, doctor) => {
    setModalType(type);
    setSelectedDoctor(doctor);
    if (type === 'availability') {
      setFormData({
        status: doctor.availability?.status || 'available',
        reason: doctor.availability?.reason || '',
        expectedBackTime: doctor.availability?.expectedBackTime ? 
          new Date(doctor.availability.expectedBackTime).toISOString().slice(0, 16) : '',
        availableSlots: doctor.availableSlots || '',
        note: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedDoctor) return;

    setLoading(true);
    let result = { success: false };

    if (modalType === 'availability') {
      const data = {
        status: formData.status,
        reason: formData.reason,
        expectedBackTime: formData.expectedBackTime || null,
        availableSlots: formData.status === 'available' ? parseInt(formData.availableSlots) || 0 : 0
      };
      result = await updateDoctorAvailability(selectedDoctor._id, data);
    } else if (modalType === 'note') {
      if (formData.note.trim()) {
        result = await addDoctorNote(selectedDoctor._id, formData.note);
      }
    } else if (modalType === 'toggle') {
      result = await toggleDoctorStatus(selectedDoctor._id);
    }

    if (result.success) {
      setShowModal(false);
      resetForm();
    }
    setLoading(false);
  };

  const getStatusBadge = (doctor) => {
    if (!doctor.isActive) {
      return <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">Temporarily Closed</span>;
    }

    switch (doctor.availability?.status) {
      case 'available':
        return doctor.availableSlots > 0 ? 
          <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Available ({doctor.availableSlots} slots)</span> :
          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">Fully Booked</span>;
      case 'temporarily_unavailable':
        return <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">Temporarily Unavailable</span>;
      case 'on_leave':
        return <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">On Leave</span>;
      case 'busy':
        return <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">Busy</span>;
      default:
        return <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">Unknown</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please login to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage doctor availability and status - Just like FoodPanda restaurant management</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">👨‍⚕️</span>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-sm font-medium text-gray-500">Total Doctors</h3>
                <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-sm font-medium text-gray-500">Available Now</h3>
                <p className="text-3xl font-bold text-green-600">
                  {doctors.filter(d => d.isActive && d.availability?.status === 'available' && d.availableSlots > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✗</span>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-sm font-medium text-gray-500">Unavailable</h3>
                <p className="text-3xl font-bold text-red-600">
                  {doctors.filter(d => !d.isActive || d.availability?.status !== 'available' || d.availableSlots === 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📅</span>
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-sm font-medium text-gray-500">On Leave</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {doctors.filter(d => d.availability?.status === 'on_leave').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Doctor Availability Management</h2>
            <p className="text-sm text-gray-600 mt-1">Control doctor availability status in real-time</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Back</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          className="h-10 w-10 rounded-full border-2 border-gray-200" 
                          src={doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=3b82f6&color=ffffff&size=400`} 
                          alt=""
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                          <div className="text-sm text-gray-500">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.speciality}</div>
                      <div className="text-sm text-gray-500">{doctor.degree}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(doctor)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="truncate" title={doctor.availability?.reason || '-'}>
                        {doctor.availability?.reason || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.availability?.expectedBackTime ? 
                        formatDate(doctor.availability.expectedBackTime) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {doctor.availability?.lastUpdated ? 
                        formatDate(doctor.availability.lastUpdated) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => openModal('availability', doctor)}
                          className="text-blue-600 hover:text-blue-900 text-left"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => openModal('toggle', doctor)}
                          className={`text-left ${doctor.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        >
                          {doctor.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openModal('note', doctor)}
                          className="text-purple-600 hover:text-purple-900 text-left"
                        >
                          Add Note
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" 
               onClick={(e) => e.target === e.currentTarget && (setShowModal(false), resetForm())}>
            <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {modalType === 'availability' && 'Update Doctor Availability'}
                    {modalType === 'note' && 'Add Admin Note'}
                    {modalType === 'toggle' && 'Toggle Doctor Status'}
                  </h3>
                  <button 
                    onClick={() => {setShowModal(false); resetForm();}}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {selectedDoctor && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <img 
                        className="h-8 w-8 rounded-full" 
                        src={selectedDoctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedDoctor.name)}&background=3b82f6&color=ffffff&size=400`} 
                        alt=""
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{selectedDoctor.name}</div>
                        <div className="text-xs text-gray-500">{selectedDoctor.speciality}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {modalType === 'availability' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Availability Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="available">Available</option>
                          <option value="temporarily_unavailable">Temporarily Unavailable</option>
                          <option value="on_leave">On Leave</option>
                          <option value="busy">Busy</option>
                        </select>
                      </div>

                      {formData.status === 'available' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={formData.availableSlots}
                            onChange={(e) => setFormData({...formData, availableSlots: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter number of available slots"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reason {formData.status !== 'available' ? '(Required)' : '(Optional)'}
                        </label>
                        <input
                          type="text"
                          value={formData.reason}
                          onChange={(e) => setFormData({...formData, reason: e.target.value})}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={
                            formData.status === 'temporarily_unavailable' ? 'e.g., Emergency surgery, System maintenance' :
                            formData.status === 'on_leave' ? 'e.g., Annual vacation, Medical leave' :
                            formData.status === 'busy' ? 'e.g., In conference, With patient' :
                            'Optional reason for availability change'
                          }
                        />
                      </div>

                      {(formData.status === 'temporarily_unavailable' || formData.status === 'on_leave') && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expected Back Time (Optional)</label>
                          <input
                            type="datetime-local"
                            value={formData.expectedBackTime}
                            onChange={(e) => setFormData({...formData, expectedBackTime: e.target.value})}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {modalType === 'note' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Admin Note</label>
                      <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({...formData, note: e.target.value})}
                        rows="4"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter admin note for internal reference..."
                      />
                    </div>
                  )}

                  {modalType === 'toggle' && (
                    <div className="text-center">
                      <div className="mb-4">
                        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                          selectedDoctor?.isActive ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          <span className="text-2xl">
                            {selectedDoctor?.isActive ? '⏸️' : '▶️'}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">
                        Are you sure you want to <strong>{selectedDoctor?.isActive ? 'deactivate' : 'activate'}</strong> Dr. {selectedDoctor?.name}?
                      </p>
                      {selectedDoctor?.isActive && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                          <p className="text-sm text-red-800">
                            <strong>Warning:</strong> Deactivating will:
                          </p>
                          <ul className="text-xs text-red-700 mt-1 list-disc list-inside">
                            <li>Set available slots to 0</li>
                            <li>Mark as temporarily unavailable</li>
                            <li>Hide from patient booking</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => {setShowModal(false); resetForm();}}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || (modalType === 'note' && !formData.note.trim())}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                      loading || (modalType === 'note' && !formData.note.trim())
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : modalType === 'toggle' && selectedDoctor?.isActive
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Processing...' : 
                     modalType === 'toggle' ? (selectedDoctor?.isActive ? 'Deactivate' : 'Activate') :
                     'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;