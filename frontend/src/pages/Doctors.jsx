
import React, { useState, useEffect } from 'react';
import { Filter, User, Star, MapPin, Phone, Clock } from 'lucide-react';


const Doctors = () => {
  const mockDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Khan",
      speciality: "General physician",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face",
      rating: 4.8,
      experience: "8 years",
      location: "Ibn Sina Medical College And Hospital",
      phone: "01552337495",
      availableSlots: 12
    },
    {
      id: 2,
      name: "Dr. Alim",
      speciality: "Dermatologist",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
      rating: 4.9,
      experience: "12 years",
      location: "Skin Care Clinic",
      phone: "+1 (555) 234-5678",
      availableSlots: 8
    },
    {
      id: 3,
      name: "Dr. Emily Rodriguez",
      speciality: "Gynecologist",
      image: "https://images.unsplash.com/photo-1594824209347-fe5bb45c3bb8?w=400&h=400&fit=crop&crop=face",
      rating: 4.7,
      experience: "10 years",
      location: "Women's Health Center",
      phone: "+1 (555) 345-6789",
      availableSlots: 6
    },
    {
      id: 4,
      name: "Dr. David Park",
      speciality: "Pediatricians",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face",
      rating: 4.9,
      experience: "15 years",
      location: "Children's Medical Group",
      phone: "+1 (555) 456-7890",
      availableSlots: 10
    },
    {
      id: 5,
      name: "Dr. Lisa Thompson",
      speciality: "Neurologist",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop&crop=face",
      rating: 4.8,
      experience: "18 years",
      location: "Neuro Specialty Center",
      phone: "+1 (555) 567-8901",
      availableSlots: 4
    },
    {
      id: 6,
      name: "Dr. James Wilson",
      speciality: "Gastroenterologist",
      image: "https://images.unsplash.com/photo-1582750869174-bcce13186b4a?w=400&h=400&fit=crop&crop=face",
      rating: 4.6,
      experience: "14 years",
      location: "Digestive Health Institute",
      phone: "+1 (555) 678-9012",
      availableSlots: 7
    }
  ];

  const specialties = [
    'General physician',
    'Gynecologist', 
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist'
  ];

  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState(mockDoctors);
  const [showFilter, setShowFilter] = useState(false);

  const applyFilter = () => {
    if (selectedSpecialty) {
      setFilteredDoctors(mockDoctors.filter(doc => doc.speciality === selectedSpecialty));
    } else {
      setFilteredDoctors(mockDoctors);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [selectedSpecialty]);

  const handleSpecialtyClick = (specialty) => {
    if (selectedSpecialty === specialty) {
      setSelectedSpecialty('');
    } else {
      setSelectedSpecialty(specialty);
    }
    setShowFilter(false);
  };

  const DoctorCard = ({ doctor }) => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img 
              src={doctor.image} 
              alt={doctor.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-50"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 mb-1">{doctor.name}</h3>
            <p className="text-blue-600 font-medium mb-2">{doctor.speciality}</p>
            
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">{doctor.rating}</span>
              <span className="text-sm text-gray-500">• {doctor.experience} exp</span>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{doctor.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{doctor.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-green-600 font-medium">{doctor.availableSlots} slots available</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:shadow-md">
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        <p className='text-gray-600 mb-5'>Browse through the doctors specialist.</p>

        {/* Filter Section */}
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile Filter Button */}
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="lg:hidden flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>{selectedSpecialty || 'All Specialties'}</span>
            </button>

            {/* Filter Sidebar */}
            <div className={`${showFilter ? 'block' : 'hidden lg:block'} lg:w-64 shrink-0`}>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter by Specialty
                </h3>
                
                <div className="space-y-2">
                  <button
                    onClick={() => handleSpecialtyClick('')}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                      !selectedSpecialty 
                        ? 'bg-blue-100 border-blue-300 text-blue-800 font-medium' 
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All Specialties
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
                      {specialty}
                    </button>
                  ))}
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
                  </p>
                </div>
              </div>

              {/* Doctors Grid */}
              {filteredDoctors.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {filteredDoctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No doctors found</h3>
                  <p className="text-gray-500">Try selecting a different specialty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Doctors;
