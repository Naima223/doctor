import React, { useState, useEffect } from 'react';

const Doctors = () => {
  // Doctor data and utility functions (moved from separate component)
  const Doctor = {
    // All doctors data
    getAllDoctors: () => [
      {
        id: 1,
        name: "Dr. Aminul Islam",
        speciality: "General physician",
        image: "/api/placeholder/400/400",
        rating: 4.8,
        experience: "8 years",
        location: "Ibn Sina Medical College Hospital",
        phone: "+880 1711-123456",
        availableSlots: 12,
        degree: "MBBS, FCPS"
      },
      {
        id: 2,
        name: "Dr. Fatema Khatun",
        speciality: "Dermatologist",
        image: "/api/placeholder/400/400",
        rating: 4.9,
        experience: "12 years",
        location: "Square Hospitals Ltd.",
        phone: "+880 1712-234567",
        availableSlots: 8,
        degree: "MBBS, DDV"
      },
      {
        id: 3,
        name: "Dr. Rashida Begum",
        speciality: "Gynecologist",
        image: "/api/placeholder/400/400",
        rating: 4.7,
        experience: "10 years",
        location: "Labaid Specialized Hospital",
        phone: "+880 1713-345678",
        availableSlots: 6,
        degree: "MBBS, FCPS (Gynae)"
      },
      {
        id: 4,
        name: "Dr. Mohammad Rahman",
        speciality: "Pediatricians",
        image: "/api/placeholder/400/400",
        rating: 4.9,
        experience: "15 years",
        location: "Bangladesh Specialized Hospital",
        phone: "+880 1714-456789",
        availableSlots: 10,
        degree: "MBBS, DCH, FCPS"
      },
      {
        id: 5,
        name: "Dr. Nazrul Islam",
        speciality: "Neurologist",
        image: "/api/placeholder/400/400",
        rating: 4.8,
        experience: "18 years",
        location: "National Institute of Neurosciences & Hospital",
        phone: "+880 1715-567890",
        availableSlots: 4,
        degree: "MBBS, FCPS (Neuro)"
      },
      {
        id: 6,
        name: "Dr. Shahida Parveen",
        speciality: "Gastroenterologist",
        image: "/api/placeholder/400/400",
        rating: 4.6,
        experience: "14 years",
        location: "United Hospital Limited",
        phone: "+880 1716-678901",
        availableSlots: 7,
        degree: "MBBS, FCPS (Medicine)"
      },
      {
        id: 7,
        name: "Dr. Abdul Karim",
        speciality: "General physician",
        image: "/api/placeholder/400/400",
        rating: 4.5,
        experience: "6 years",
        location: "Government Employees Hospital",
        phone: "+880 1717-789012",
        availableSlots: 15,
        degree: "MBBS"
      },
      {
        id: 8,
        name: "Dr. Ruma Akter",
        speciality: "Dermatologist",
        image: "/api/placeholder/400/400",
        rating: 4.7,
        experience: "9 years",
        location: "Apollo Hospitals Dhaka",
        phone: "+880 1718-890123",
        availableSlots: 11,
        degree: "MBBS, CCD"
      },
      {
        id: 9,
        name: "Dr. Marium Begum",
        speciality: "Gynecologist",
        image: "/api/placeholder/400/400",
        rating: 4.8,
        experience: "13 years",
        location: "Dhaka Medical College Hospital",
        phone: "+880 1719-901234",
        availableSlots: 5,
        degree: "MBBS, MS (Gynae)"
      },
      {
        id: 10,
        name: "Dr. Habibur Rahman",
        speciality: "Pediatricians",
        image: "/api/placeholder/400/400",
        rating: 4.6,
        experience: "11 years",
        location: "Evercare Hospital Dhaka",
        phone: "+880 1720-012345",
        availableSlots: 9,
        degree: "MBBS, FCPS (Paediatrics)"
      },
      {
        id: 11,
        name: "Dr. Khalilur Rahman",
        speciality: "Neurologist",
        image: "/api/placeholder/400/400",
        rating: 4.9,
        experience: "20 years",
        location: "Bangabandhu Sheikh Mujib Medical University",
        phone: "+880 1721-123456",
        availableSlots: 3,
        degree: "MBBS, MD (Neurology)"
      },
      {
        id: 12,
        name: "Dr. Nasreen Sultana",
        speciality: "Gastroenterologist",
        image: "/api/placeholder/400/400",
        rating: 4.7,
        experience: "16 years",
        location: "Popular Medical College Hospital",
        phone: "+880 1722-234567",
        availableSlots: 8,
        degree: "MBBS, FCPS (Gastroenterology)"
      }
    ],

    // Get all specialties available
    getSpecialties: () => [
      'General physician',
      'Gynecologist', 
      'Dermatologist',
      'Pediatricians',
      'Neurologist',
      'Gastroenterologist'
    ],

    // Get quick filter configuration
    getQuickFilters: () => [
      { name: 'All', specialty: '', icon: '👨‍⚕️', color: 'bg-gray-100 hover:bg-gray-200' },
      { name: 'General', specialty: 'General physician', icon: '🩺', color: 'bg-blue-100 hover:bg-blue-200' },
      { name: 'Women\'s Health', specialty: 'Gynecologist', icon: '👩‍⚕️', color: 'bg-pink-100 hover:bg-pink-200' },
      { name: 'Skin Care', specialty: 'Dermatologist', icon: '🧴', color: 'bg-green-100 hover:bg-green-200' },
      { name: 'Children', specialty: 'Pediatricians', icon: '👶', color: 'bg-yellow-100 hover:bg-yellow-200' },
      { name: 'Brain & Nerves', specialty: 'Neurologist', icon: '🧠', color: 'bg-purple-100 hover:bg-purple-200' },
      { name: 'Digestive', specialty: 'Gastroenterologist', icon: '🫃', color: 'bg-orange-100 hover:bg-orange-200' }
    ],

    // Filter doctors by specialty
    filterBySpecialty: (doctors, specialty) => {
      if (!specialty) return doctors;
      return doctors.filter(doctor => doctor.speciality === specialty);
    },

    // Filter doctors by availability
    filterByAvailability: (doctors, availableOnly) => {
      if (!availableOnly) return doctors;
      return doctors.filter(doctor => doctor.availableSlots > 0);
    },

    // Sort doctors by different criteria
    sortDoctors: (doctors, sortBy) => {
      const sortedDoctors = [...doctors]; // Create a copy to avoid mutating original
      
      switch (sortBy) {
        case 'rating':
          return sortedDoctors.sort((a, b) => b.rating - a.rating);
        case 'experience':
          return sortedDoctors.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
        case 'slots':
          return sortedDoctors.sort((a, b) => b.availableSlots - a.availableSlots);
        default:
          return sortedDoctors.sort((a, b) => a.name.localeCompare(b.name));
      }
    },

    // Get doctors count by specialty
    getDoctorCountBySpecialty: (specialty, doctors) => {
      if (!specialty) return doctors.length;
      return doctors.filter(doctor => doctor.speciality === specialty).length;
    }
  };

  // Individual Doctor Card Component
  const DoctorCard = ({ doctor, onBookAppointment }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
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
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 mb-1">{doctor.name}</h3>
            <p className="text-blue-600 font-medium mb-1">{doctor.speciality}</p>
            <p className="text-xs text-gray-500 mb-2">{doctor.degree}</p>
            
            <div className="flex items-center gap-1 mb-2">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm font-medium text-gray-700">{doctor.rating}</span>
              <span className="text-sm text-gray-500">• {doctor.experience} exp</span>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{doctor.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📞</span>
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕒</span>
                <span className="text-green-600 font-medium">{doctor.availableSlots} slots available</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button 
            onClick={() => onBookAppointment && onBookAppointment(doctor)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:shadow-md transform hover:scale-105"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );

  // State management
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState(Doctor.getAllDoctors());
  const [sortBy, setSortBy] = useState('name');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  // Get data from Doctor object
  const allDoctors = Doctor.getAllDoctors();
  const specialties = Doctor.getSpecialties();
  const quickFilters = Doctor.getQuickFilters();

  // Apply all filters and sorting - using Doctor object methods
  const applyFilter = () => {
    let filtered = allDoctors;
    
    // Filter by specialty using Doctor object method
    filtered = Doctor.filterBySpecialty(filtered, selectedSpecialty);
    
    // Filter by availability using Doctor object method
    filtered = Doctor.filterByAvailability(filtered, showAvailableOnly);
    
    // Sort using Doctor object method
    filtered = Doctor.sortDoctors(filtered, sortBy);
    
    setFilteredDoctors(filtered);
  };

  // Auto-apply filters when any filter criteria changes
  useEffect(() => {
    applyFilter();
  }, [selectedSpecialty, sortBy, showAvailableOnly]);

  // Handle sidebar specialty click
  const handleSpecialtyClick = (specialty) => {
    if (selectedSpecialty === specialty) {
      setSelectedSpecialty('');
    } else {
      setSelectedSpecialty(specialty);
    }
    setShowFilter(false);
  };

  // Handle quick filter button clicks
  const handleQuickFilter = (specialty) => {
    setSelectedSpecialty(specialty);
  };

  // Handle appointment booking
  const handleBookAppointment = (doctor) => {
    alert(`Booking appointment with ${doctor.name}!\nSpecialty: ${doctor.speciality}\nPhone: ${doctor.phone}`);
    // In real app, this would navigate to booking page or open booking modal
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Your Doctor</h1>
          <p className='text-gray-600'>Browse through our specialist doctors.</p>
        </div>

        {/* Quick Filter Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span className="animate-pulse">⚡</span>
            Quick Filter by Specialty
          </h3>
          <div className="flex flex-wrap gap-3">
            {quickFilters.map((filter) => (
              <button
                key={filter.name}
                onClick={() => handleQuickFilter(filter.specialty)}
                className={`flex items-center gap-2 px-4 py-3 rounded-full border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedSpecialty === filter.specialty
                    ? 'border-blue-400 bg-blue-100 text-blue-800 shadow-lg scale-105'
                    : `border-gray-200 ${filter.color} text-gray-700 hover:shadow-md`
                }`}
              >
                <span className="text-xl animate-bounce" style={{animationDelay: `${Math.random() * 2}s`}}>
                  {filter.icon}
                </span>
                <span className="font-medium text-sm">{filter.name}</span>
                <span className="bg-white bg-opacity-60 text-xs px-2 py-1 rounded-full">
                  {Doctor.getDoctorCountBySpecialty(filter.specialty, allDoctors)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Mobile Filter Toggle Button */}
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="lg:hidden flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>🔍</span>
            <span>{selectedSpecialty || 'All Specialties'}</span>
          </button>

          {/* Advanced Filter Sidebar */}
          <div className={`${showFilter ? 'block' : 'hidden lg:block'} lg:w-64 shrink-0`}>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>🔽</span>
                Advanced Filters
              </h3>
              
              {/* Specialty Filter Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleSpecialtyClick('')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                    !selectedSpecialty 
                      ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium' 
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Specialties ({allDoctors.length})
                </button>
                
                {specialties.map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => handleSpecialtyClick(specialty)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                      selectedSpecialty === specialty
                        ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {specialty} ({Doctor.getDoctorCountBySpecialty(specialty, allDoctors)})
                  </button>
                ))}
              </div>
              
              {/* Additional Filters */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-3">Sort by</h4>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="rating">Rating (High to Low)</option>
                  <option value="experience">Experience (Most to Least)</option>
                  <option value="slots">Available Slots</option>
                </select>
                
                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={showAvailableOnly}
                      onChange={(e) => setShowAvailableOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Show only available doctors
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  {selectedSpecialty ? `${selectedSpecialty}s` : 'All Doctors'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
                  {selectedSpecialty && (
                    <span className="ml-2 text-blue-600 font-medium">
                      in {selectedSpecialty}
                    </span>
                  )}
                </p>
              </div>
              
              {/* Quick stats */}
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>Avg Rating: {(filteredDoctors.reduce((acc, doc) => acc + doc.rating, 0) / filteredDoctors.length || 0).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🕒</span>
                  <span>Total Slots: {filteredDoctors.reduce((acc, doc) => acc + doc.availableSlots, 0)}</span>
                </div>
              </div>
            </div>

            {/* Doctors Grid */}
            {filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard 
                    key={doctor.id} 
                    doctor={doctor} 
                    onBookAppointment={handleBookAppointment}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl animate-bounce">👨‍⚕️</span>
                <h3 className="text-xl font-medium text-gray-600 mb-2 mt-4">No doctors found</h3>
                <p className="text-gray-500 mb-4">
                  {selectedSpecialty 
                    ? `No ${selectedSpecialty.toLowerCase()}s match your criteria` 
                    : 'No doctors match your current filters'
                  }
                </p>
                <button
                  onClick={() => {
                    setSelectedSpecialty('');
                    setShowAvailableOnly(false);
                    setSortBy('name');
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctors;