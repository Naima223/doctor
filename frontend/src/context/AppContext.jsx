import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "./AuthProvider";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currencySymbol = "₹";

  // ✅ Base URL should already include /api to avoid double `/api`
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";

  
  const { token, user: userData, setUser, login, register, logout } = useAuth();

  const [doctors, setDoctors] = useState([]);

  
  
  const loadUserProfileData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (data.success) {
        setUser(data.user); // use AuthProvider's setter
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // Handle 401 (expired/invalid)
      if (error?.response?.status === 401) {
        logout();
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(error?.response?.data?.message || error.message);
      }
    }
  };

  // PUT profile
  const updateUserProfile = async (profileData) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/user/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        setUser(data.user); // keep AuthProvider in sync
        toast.success("Profile updated successfully!");
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        logout();
        toast.error("Session expired. Please login again.");
      } else {
        const msg = error?.response?.data?.message || error.message;
        toast.error(msg);
      }
      return {
        success: false,
        message: error?.response?.data?.message || error.message,
      };
    }
  };

 

  const loginUser = async (email, password) => {
    try {
      const res = await login({ email, password }); // AuthProvider.login
      toast.success("Login successful!");
      return { success: true, ...res };
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const registerUser = async (name, email, password) => {
    try {
      const res = await register({ name, email, password }); // AuthProvider.register
      toast.success("Account created successfully!");
      return { success: true, ...res };
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

 

  const getDoctorsData = async () => {
    try {
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" };

      const { data } = await axios.get(`${backendUrl}/doctors`, { headers });

      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
  };

  const updateDoctorAvailability = async (doctorId, availabilityData) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/admin/doctors/${doctorId}/availability`,
        availabilityData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        toast.success("Doctor availability updated successfully!");
        getDoctorsData(); // refresh
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const toggleDoctorStatus = async (doctorId) => {
    try {
      const { data } = await axios.put(
        `${backendUrl}/admin/doctors/${doctorId}/toggle-status`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData(); // refresh
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const addDoctorNote = async (doctorId, note) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/admin/doctors/${doctorId}/notes`,
        { note },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success) {
        toast.success("Note added successfully!");
        getDoctorsData(); // refresh
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // ---- Legacy helper kept (but simplified) ----
  const isTokenValid = () => !!token; // AuthProvider handles expiry via 401

  // Auto-load profile on mount if we have a token but no user loaded yet
  useEffect(() => {
    if (token && !userData) {
      loadUserProfileData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const value = {
    doctors,
    setDoctors,
    currencySymbol,
    backendUrl,

    // auth-facing values (aliases)
    token,
    userData, // <- from AuthProvider.user
    setUserData: setUser, // <- alias to AuthProvider.setUser

    // auth actions (wrappers)
    loginUser,
    registerUser,
    updateUserProfile,
    loadUserProfileData,
    logout,
    isTokenValid,

    // doctors/admin
    getDoctorsData,
    updateDoctorAvailability,
    toggleDoctorStatus,
    addDoctorNote,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
