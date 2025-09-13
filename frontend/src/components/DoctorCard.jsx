import React from 'react';

const DoctorCard = ({ doctor, onBookAppointment }) => {
  const getAvailabilityDisplay = () => {
    if (!doctor.isActive) {
      return {
        status: 'Temporarily Closed',
        className: 'bg-gray-500 text-white',
        icon: '🚫',
        description: 'This doctor is currently unavailable',
        textColor: 'text-gray-500'
      };
    }

    switch (doctor.availability?.status) {
      case 'temporarily_unavailable':
        return {
          status: 'Temporarily Unavailable',
          className: 'bg-red-500 text-white',
          icon: '⏰',
          description: doctor.availability.reason || 'Currently unavailable',
          textColor: 'text-red-600'
        };
      case 'on_leave':
        return {
          status: 'On Leave',
          className: 'bg-yellow-500 text-white',
          icon: '📅',
          description: doctor.availability.reason || 'Doctor is on leave',
          textColor: 'text-yellow-600'
        };
      case 'busy':
        return {
          status: 'Busy',
          className: 'bg-orange-500 text-white',
          icon: '🔴',
          description: doctor.availability.reason || 'Currently busy',
          textColor: 'text-orange-600'
        };
      case 'available':
      default:
        if (doctor.availableSlots > 0) {
          return {
            status: 'Available',
            className: 'bg-green-500 text-white',
            icon: '✅',
            description: `${doctor.availableSlots} slots available`,
            textColor: 'text-green-600'
          };
        } else {
          return {
            status: 'Fully Booked',
            className: 'bg-red-500 text-white',
            icon: '📅',
            description: 'No slots available today',
            textColor: 'text-red-600'
          };
        }
    }
  };

  const availabilityInfo = getAvailabilityDisplay();
  const isBookable = doctor.isActive && 
                    doctor.availability?.status === 'available' && 
                    doctor.availableSlots > 0;

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString() + ' at ' + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${
      !isBookable ? 'opacity-75' : 'hover:border-blue-200 transform hover:-translate-y-1'
    }`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img 
              src={doctor.image} 
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-50 bg-gray-200"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=3b82f6&color=ffffff&size=400`;
              }}
            />
            {/* Status indicator */}
            <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-medium ${availabilityInfo.className}`}>
              {availabilityInfo.icon}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 mb-1">{doctor.name}</h3>
            <p className="text-blue-600 font-medium mb-1">{doctor.speciality}</p>
            <p className="text-xs text-gray-500 mb-2">{doctor.degree}</p>
            
            {/* Availability Status Banner */}
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-2 ${availabilityInfo.className}`}>
              <span>{availabilityInfo.icon}</span>
              <span>{availabilityInfo.status}</span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm font-medium text-gray-700">{doctor.rating}</span>
              <span className="text-sm text-gray-500">• {doctor.experience} exp</span>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>🏥</span>
                <span>{doctor.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💰</span>
                <span className="font-semibold text-green-600">৳{doctor.consultationFee}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕒</span>
                <span className={`font-medium ${availabilityInfo.textColor}`}>
                  {availabilityInfo.description}
                </span>
              </div>
            </div>

            {/* Expected back time for unavailable doctors */}
            {!isBookable && doctor.availability?.expectedBackTime && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <span className="font-medium">Expected back:</span> {' '}
                  {formatDate(doctor.availability.expectedBackTime)}
                </p>
              </div>
            )}

            {/* Last updated info */}
            {doctor.availability?.lastUpdated && doctor.availability?.updatedBy && (
              <div className="mt-2 text-xs text-gray-400">
                Last updated: {formatDate(doctor.availability.lastUpdated)} by {doctor.availability.updatedBy}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button 
            onClick={() => onBookAppointment && onBookAppointment(doctor)}
            disabled={!isBookable}
            className={`w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 ${
              isBookable
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-md transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isBookable ? '📅 Book Appointment' : availabilityInfo.status}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;