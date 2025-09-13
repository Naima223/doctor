import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';

const MyProfile = () => {
  const { userData, token } = useContext(AppContext);
  
  if (!token) {
    return <div>Please login to view your profile</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      {/* Add profile content here */}
    </div>
  );
};

export default MyProfile;