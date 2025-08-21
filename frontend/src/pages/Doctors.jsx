import React, { useState, useEffect, useMemo } from 'react';

const Doctors = () => {
  // ============ DATA LAYER ============
  const doctorsData = [
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
      degree: "MBBS, FCPS",
      consultationFee: 800
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
      degree: "MBBS, DDV",
      consultationFee: 1200
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
      degree: "MBBS, FCPS (Gynae)",
      consultationFee: 1000
    },
    {
      id: 4,
      name: "Dr. Mohammad Rahman",
      speciality: "Pediatrician",
      image: "/api/placeholder/400/400",
      rating: 4.9,
      experience: "15 years",
      location: "Bangladesh Specialized Hospital",
      phone: "+880 1714-456789",
      availableSlots: 10,
      degree: "MBBS, DCH, FCPS",
      consultationFee: 900
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
      degree: "MBBS, FCPS (Neuro)",
      consultationFee: 1500
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
      degree: "MBBS, FCPS (Medicine)",
      consultationFee: 1100
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
      degree: "MBBS",
      consultationFee: 600
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
      degree: "MBBS, CCD",
      consultationFee: 1000
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
      degree: "MBBS, MS (Gynae)",
      consultationFee: 950
    },
    {
      id: 10,
      name: "Dr. Habibur Rahman",
      speciality: "Pediatrician",
      image: "/api/placeholder/400/400",
      rating: 4.6,
      experience: "11 years",
      location: "Evercare Hospital Dhaka",
      phone: "+880 1720-012345",
      availableSlots: 9,
      degree: "MBBS, FCPS (Paediatrics)",
      consultationFee: 850
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
      degree: "MBBS, MD (Neurology)",
      consultationFee: 1800
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
      degree: "MBBS, FCPS (Gastroenterology)",
      consultationFee: 1300
    }
  ];

  const specialtyFilters = [
    { name: 'All Doctors', specialty: '', icon: '👨‍⚕️', color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50' },
    { name: 'General Medicine', specialty: 'General physician', icon: '🩺', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { name: 'Women\'s Health', specialty: 'Gynecologist', icon: '👩‍⚕️', color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50' },
    { name: 'Skin Specialist', specialty: 'Dermatologist', icon: '🧴', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
    { name: 'Child Care', specialty: 'Pediatrician', icon: '👶', color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-50' },
    { name: 'Brain & Nerves', specialty: 'Neurologist', icon: '🧠', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
    { name: 'Digestive Health', specialty: 'Gastroenterologist', icon: '🫃', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' }
  ];

  // ============ STATE MANAGEMENT ============
  const [filters, setFilters] = useState({
    specialty: '',
    sortBy: 'name',
    availableOnly: false,
    priceRange: 'all'
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // ============ COMPUTED VALUES ============
  const filteredAndSortedDoctors = useMemo(() => {
    let result = [...doctorsData];

    // Filter by specialty
    if (filters.specialty) {
      result = result.filter(doctor => doctor.speciality === filters.specialty);
    }

    // Filter by availability
    if (filters.availableOnly) {
      result = result.filter(doctor => doctor.availableSlots > 0);
    }

    // Filter by price range
    if (filters.priceRange !== 'all') {
      switch (filters.priceRange) {
        case 'low':
          result = result.filter(doctor => doctor.consultationFee <= 800);
          break;
        case 'medium':
          result = result.filter(doctor => doctor.consultationFee > 800 && doctor.consultationFee <= 1200);
          break;
        case 'high':
          result = result.filter(doctor => doctor.consultationFee > 1200);
          break;
      }
    }

    // Sort results
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return parseInt(b.experience) - parseInt(a.experience);
        case 'price-low':
          return a.consultationFee - b.consultationFee;
        case 'price-high':
          return b.consultationFee - a.consultationFee;
        case 'slots':
          return b.availableSlots - a.availableSlots;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [filters, doctorsData]);

  const statistics = useMemo(() => ({
    total: filteredAndSortedDoctors.length,
    avgRating: filteredAndSortedDoctors.length > 0 
      ? (filteredAndSortedDoctors.reduce((acc, doc) => acc + doc.rating, 0) / filteredAndSortedDoctors.length).toFixed(1)
      : '0.0',
    totalSlots: filteredAndSortedDoctors.reduce((acc, doc) => acc + doc.availableSlots, 0),
    avgFee: filteredAndSortedDoctors.length > 0
      ? Math.round(filteredAndSortedDoctors.reduce((acc, doc) => acc + doc.consultationFee, 0) / filteredAndSortedDoctors.length)
      : 0
  }), [filteredAndSortedDoctors]);

  const getSpecialtyCount = (specialty) => {
    if (!specialty) return doctorsData.length;
    return doctorsData.filter(doc => doc.speciality === specialty).length;
  };

  // ============ EVENT HANDLERS ============
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      specialty: '',
      sortBy: 'name',
      availableOnly: false,
      priceRange: 'all'
    });
  };

  const handleBookAppointment = (doctor) => {
    alert(`🎉 Booking appointment with ${doctor.name}!\n\n📋 Details:\n• Specialty: ${doctor.speciality}\n• Fee: ৳${doctor.consultationFee}\n• Phone: ${doctor.phone}\n• Available Slots: ${doctor.availableSlots}`);
  };

  // ============ COMPONENTS ============
  const DoctorCard = ({ doctor }) => (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 ${viewMode === 'list' ? 'flex' : ''}`}>
      <div className={`${viewMode === 'list' ? 'w-32 h-32' : 'w-full h-48'} relative overflow-hidden`}>
        <img 
          src={doctor.image} 
          alt={doctor.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=3b82f6&color=ffffff&size=400`;
          }}
        />
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
          {doctor.availableSlots > 0 ? 'Available' : 'Busy'}
        </div>
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
          ⭐ {doctor.rating}
        </div>
      </div>
      
      <div className="p-6 flex-1">
        <div className="mb-3">
          <h3 className="font-bold text-xl text-gray-900 mb-1">{doctor.name}</h3>
          <p className="text-blue-600 font-semibold text-sm mb-1">{doctor.speciality}</p>
          <p className="text-xs text-gray-500">{doctor.degree}</p>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            <span>🏥</span>
            <span className="truncate">{doctor.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📞</span>
            <span>{doctor.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💼</span>
            <span>{doctor.experience} experience</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💰</span>
            <span className="font-semibold text-green-600">৳{doctor.consultationFee}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🕒</span>
            <span className={`font-semibold ${doctor.availableSlots > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {doctor.availableSlots} slots available
            </span>
          </div>
        </div>
        
        <button 
          onClick={() => handleBookAppointment(doctor)}
          disabled={doctor.availableSlots === 0}
          className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
            doctor.availableSlots > 0
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {doctor.availableSlots > 0 ? '📅 Book Appointment' : '❌ Not Available'}
        </button>
      </div>
    </div>
  );

  const SpecialtyFilter = ({ filter }) => (
    <button
      onClick={() => updateFilter('specialty', filter.specialty)}
      className={`group flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 min-w-[140px] ${
        filters.specialty === filter.specialty
          ? `border-blue-400 ${filter.bgColor} shadow-lg scale-105`
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
      }`}
    >
      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${filter.color} flex items-center justify-center text-2xl mb-2 group-hover:scale-110 transition-transform`}>
        {filter.icon}
      </div>
      <span className="font-semibold text-sm text-center text-gray-800">{filter.name}</span>
      <span className="text-xs text-gray-500 mt-1">
        {getSpecialtyCount(filter.specialty)} doctors
      </span>
    </button>
  );

  const StatsCard = ({ icon, label, value, color = "text-gray-600" }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className={`font-bold text-lg ${color}`}>{value}</p>
        </div>
      </div>
    </div>
  );

  // ============ RENDER ============
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Perfect Doctor</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with experienced healthcare professionals across Bangladesh. 
            Book appointments with top-rated doctors in various specialties.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard icon="👨‍⚕️" label="Total Doctors" value={statistics.total} color="text-blue-600" />
          <StatsCard icon="⭐" label="Avg Rating" value={statistics.avgRating} color="text-yellow-600" />
          <StatsCard icon="🕒" label="Available Slots" value={statistics.totalSlots} color="text-green-600" />
          <StatsCard icon="💰" label="Avg Fee" value={`৳${statistics.avgFee}`} color="text-purple-600" />
        </div>

        {/* Quick Specialty Filters */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Specialty</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 justify-center">
            {specialtyFilters.map((filter) => (
              <SpecialtyFilter key={filter.name} filter={filter} />
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Advanced Filters Sidebar */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-4">
              <h3 className="font-bold text-lg text-gray-900 mb-6 flex items-center gap-2">
                <span>🔧</span>
                Advanced Filters
              </h3>
              
              {/* Sort Options */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Sort By</label>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="rating">Highest Rating</option>
                  <option value="experience">Most Experience</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="slots">Most Available</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Prices', count: doctorsData.length },
                    { value: 'low', label: 'Under ৳800', count: doctorsData.filter(d => d.consultationFee <= 800).length },
                    { value: 'medium', label: '৳800 - ৳1200', count: doctorsData.filter(d => d.consultationFee > 800 && d.consultationFee <= 1200).length },
                    { value: 'high', label: 'Above ৳1200', count: doctorsData.filter(d => d.consultationFee > 1200).length }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="priceRange"
                        value={option.value}
                        checked={filters.priceRange === option.value}
                        onChange={(e) => updateFilter('priceRange', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                      <span className="text-xs text-gray-500">({option.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                  <input 
                    type="checkbox"
                    checked={filters.availableOnly}
                    onChange={(e) => updateFilter('availableOnly', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">Available Doctors Only</span>
                </label>
              </div>

              {/* View Mode Toggle */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">View Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`flex-1 p-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🔲 Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 p-2 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    📋 List
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearAllFilters}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                🔄 Clear All Filters
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {filters.specialty ? `${filters.specialty}s` : 'All Doctors'}
                </h2>
                <p className="text-gray-600">
                  Showing {filteredAndSortedDoctors.length} of {doctorsData.length} doctors
                </p>
              </div>
            </div>

            {/* Doctors Grid/List */}
            {filteredAndSortedDoctors.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 xl:grid-cols-2' 
                  : 'grid-cols-1'
              }`}>
                {filteredAndSortedDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <span className="text-8xl animate-bounce block mb-4">🔍</span>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">No Doctors Found</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We couldn't find any doctors matching your current filters. 
                  Try adjusting your search criteria.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all transform hover:scale-105"
                >
                  🔄 Reset Filters
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