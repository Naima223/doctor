import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    // Check if current user is admin
    const checkUserRole = () => {
        if (!token) return false
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const userRole = payload.role
            setIsAdmin(userRole === 'admin' || userRole === 'super_admin')
            return userRole === 'admin' || userRole === 'super_admin'
        } catch (error) {
            console.error('Error checking user role:', error)
            setIsAdmin(false)
            return false
        }
    }

    // Getting User Profile using API (Patient only)
    const loadUserProfileData = async () => {
        try {
            if (!token || checkUserRole()) {
                return // Skip if no token or user is admin
            }

            const { data } = await axios.get(backendUrl + '/api/user/profile', { 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            })

            if (data.success) {
                setUserData(data.user)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log('Profile load error:', error)
            // Handle 401 errors (token expired/invalid)
            if (error.response?.status === 401) {
                logout()
                toast.error('Session expired. Please login again.')
            } else {
                toast.error(error.response?.data?.message || error.message)
            }
        }
    }

    // Patient Login API function
    const loginUser = async (email, password) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })

            if (data.success) {
                localStorage.setItem('token', data.token)
                setToken(data.token)
                setUserData(data.user)
                setIsAdmin(false)
                toast.success('Login successful!')
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.log('Patient login error:', error)
            const errorMessage = error.response?.data?.message || error.message
            toast.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    // Patient Signup API function
    const registerUser = async (name, email, password) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })

            if (data.success) {
                localStorage.setItem('token', data.token)
                setToken(data.token)
                setUserData(data.user)
                setIsAdmin(false)
                toast.success('Account created successfully!')
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.log('Patient registration error:', error)
            const errorMessage = error.response?.data?.message || error.message
            toast.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    // Admin Login API function
    const loginAdmin = async (email, password) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })

            if (data.success) {
                localStorage.setItem('token', data.token)
                setToken(data.token)
                setUserData(data.admin)
                setIsAdmin(true)
                toast.success('Admin login successful!')
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.log('Admin login error:', error)
            const errorMessage = error.response?.data?.message || error.message
            toast.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    // Update user profile function (Patient only)
    const updateUserProfile = async (profileData) => {
        try {
            if (isAdmin) {
                toast.error('Admin accounts cannot update patient profile')
                return { success: false, message: 'Unauthorized' }
            }

            const { data } = await axios.put(backendUrl + '/api/user/profile', profileData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (data.success) {
                setUserData(data.user)
                toast.success('Profile updated successfully!')
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.log('Profile update error:', error)
            if (error.response?.status === 401) {
                logout()
                toast.error('Session expired. Please login again.')
            } else {
                const errorMessage = error.response?.data?.message || error.message
                toast.error(errorMessage)
            }
            return { success: false, message: error.response?.data?.message || error.message }
        }
    }

    // Get all doctors function (works for both patients and admins)
    const getDoctorsData = async () => {
        try {
            const headers = token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            }

            // Use appropriate endpoint based on user type
            const endpoint = isAdmin ? '/api/admin/doctors' : '/api/user/doctors'
            const { data } = await axios.get(backendUrl + endpoint, { headers })

            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log('Get doctors error:', error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    // Admin functions for managing doctors
    const updateDoctorAvailability = async (doctorId, availabilityData) => {
        try {
            if (!isAdmin) {
                toast.error('Admin access required')
                return { success: false, message: 'Unauthorized' }
            }

            const { data } = await axios.put(`${backendUrl}/api/admin/doctors/${doctorId}/availability`, availabilityData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (data.success) {
                toast.success('Doctor availability updated successfully!')
                getDoctorsData() // Refresh doctors list
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.log('Update availability error:', error)
            const errorMessage = error.response?.data?.message || error.message
            toast.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    const toggleDoctorStatus = async (doctorId) => {
        try {
            if (!isAdmin) {
                toast.error('Admin access required')
                return { success: false, message: 'Unauthorized' }
            }

            const { data } = await axios.put(`${backendUrl}/api/admin/doctors/${doctorId}/toggle-status`, {}, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (data.success) {
                toast.success(data.message)
                getDoctorsData() // Refresh doctors list
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.log('Toggle doctor status error:', error)
            const errorMessage = error.response?.data?.message || error.message
            toast.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    const addDoctorNote = async (doctorId, note) => {
        try {
            if (!isAdmin) {
                toast.error('Admin access required')
                return { success: false, message: 'Unauthorized' }
            }

            const { data } = await axios.post(`${backendUrl}/api/admin/doctors/${doctorId}/notes`, { note }, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (data.success) {
                toast.success('Note added successfully!')
                getDoctorsData() // Refresh doctors list
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.log('Add doctor note error:', error)
            const errorMessage = error.response?.data?.message || error.message
            toast.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    // Get admin dashboard stats
    const getDashboardStats = async () => {
        try {
            if (!isAdmin) {
                toast.error('Admin access required')
                return { success: false, message: 'Unauthorized' }
            }

            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard/stats`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (data.success) {
                return { success: true, stats: data.stats }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.log('Get dashboard stats error:', error)
            const errorMessage = error.response?.data?.message || error.message
            toast.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    // Logout function
    const logout = () => {
        localStorage.removeItem('token')
        setToken('')
        setUserData(false)
        setIsAdmin(false)
        toast.success('Logged out successfully!')
    }

    // Check if token is valid
    const isTokenValid = () => {
        if (!token) return false
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const currentTime = Date.now() / 1000
            
            if (payload.exp < currentTime) {
                logout()
                return false
            }
            return true
        } catch (error) {
            console.error('Token validation error:', error)
            logout()
            return false
        }
    }

    // Initialize app state
    useEffect(() => {
        if (token && isTokenValid()) {
            checkUserRole()
            
            // Only load profile for patients
            if (!checkUserRole()) {
                loadUserProfileData()
            }
        }
    }, [token])

    // Auto-refresh doctors data when user role changes
    useEffect(() => {
        if (token && isTokenValid()) {
            getDoctorsData()
        }
    }, [isAdmin])

    const value = {
        // State
        doctors, setDoctors,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, 
        isAdmin, setIsAdmin,
        
        // Patient functions
        loadUserProfileData,
        loginUser,
        registerUser,
        updateUserProfile,
        
        // Admin functions
        loginAdmin,
        getDashboardStats,
        
        // Shared functions
        getDoctorsData,
        updateDoctorAvailability,
        toggleDoctorStatus,
        addDoctorNote,
        logout,
        isTokenValid,
        checkUserRole
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider