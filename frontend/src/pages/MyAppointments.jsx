import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const MyAppointments = () => {
  const { userData, token } = useContext(AppContext);
  
  if (!token) {
    return <div>Please login to view your appointments</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
      {/* Add appointments content here */}
    </div>
  );
};

export default MyAppointments;