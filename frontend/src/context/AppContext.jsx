import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001'

    const [doctors, setDoctors] = useState([])
    
    // Patient authentication state
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)
    
    // Admin authentication state
    const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') ? localStorage.getItem('adminToken') : '')
    const [adminData, setAdminData] = useState(false)

    // Check if current user is patient
    const isPatient = () => {
        if (!token) return false
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            return payload.role === 'patient'
        } catch (error) {
            console.error('Error checking patient role:', error)
            return false
        }
    }

    // Check if current user is admin
    const isAdmin = () => {
        if (!adminToken) return false
        
        try {
            const payload = JSON.parse(atob(adminToken.split('.')[1]))
            return payload.role === 'admin' || payload.role === 'super_admin'
        } catch (error) {
            console.error('Error checking admin role:', error)
            return false
        }
    }

    // Getting User Profile using API (Patient only)
    const loadUserProfileData = async () => {
        try {
            if (!token || !isPatient()) {
                return // Skip if no token or not a patient
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
                logoutUser()
                toast.error('Session expired. Please login again.')
            } else {
                toast.error(error.response?.data?.message || error.message)
            }
        }
    }

    // Getting Admin Profile using API (Admin only)
   // In AppContext.js, modify this function:
const loadAdminProfileData = async () => {
    try {
        if (!adminToken || !isAdmin()) {
            return false // Return false instead of just returning
        }

        console.log('Loading admin profile with token:', adminToken.substring(0, 20) + '...')

        const { data } = await axios.get(backendUrl + '/api/admin/profile', { 
            headers: { 
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            } 
        })

        if (data.success) {
            setAdminData(data.admin)
            return true
        } else {
            console.log('Admin profile load failed:', data.message)
            toast.error(data.message)
            return false
        }

    } catch (error) {
        console.log('Admin profile load error:', error)
        // Handle 401 errors (token expired/invalid)
        if (error.response?.status === 401) {
            logoutAdmin()
            toast.error('Admin session expired. Please login again.')
        } else {
            console.error('Profile load error:', error.response?.data || error.message)
        }
        return false
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

    // Replace the admin login function in AppContext.js:
const loginAdmin = async (email, password) => {
    try {
        const { data } = await axios.post(backendUrl + '/api/admin/login', { 
            email, 
            password
        })

        if (data.success) {
            localStorage.setItem('adminToken', data.token)
            setAdminToken(data.token)
            setAdminData(data.admin)
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

// Remove these functions from AppContext:
// - requestAdminAccess
// - verifyAdminEmail  
// - resendAdminCode

// Update the value object to remove verification functions:


    // Update user profile function (Patient only)
    const updateUserProfile = async (profileData) => {
        try {
            if (!isPatient()) {
                toast.error('Patient login required')
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
                logoutUser()
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
            let headers = { 'Content-Type': 'application/json' }
            let endpoint = '/api/user/doctors'

            // Use admin endpoint if admin is logged in
            if (adminToken && isAdmin()) {
                headers['Authorization'] = `Bearer ${adminToken}`
                endpoint = '/api/admin/doctors'
            } else if (token && isPatient()) {
                headers['Authorization'] = `Bearer ${token}`
                endpoint = '/api/user/doctors'
            }

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
            if (!adminToken || !isAdmin()) {
                toast.error('Admin access required')
                return { success: false, message: 'Unauthorized' }
            }

            const { data } = await axios.put(`${backendUrl}/api/admin/doctors/${doctorId}/availability`, availabilityData, {
                headers: { 
                    'Authorization': `Bearer ${adminToken}`,
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
            if (!adminToken || !isAdmin()) {
                toast.error('Admin access required')
                return { success: false, message: 'Unauthorized' }
            }

            const { data } = await axios.put(`${backendUrl}/api/admin/doctors/${doctorId}/toggle-status`, {}, {
                headers: { 
                    'Authorization': `Bearer ${adminToken}`,
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
            if (!adminToken || !isAdmin()) {
                toast.error('Admin access required')
                return { success: false, message: 'Unauthorized' }
            }

            const { data } = await axios.post(`${backendUrl}/api/admin/doctors/${doctorId}/notes`, { note }, {
                headers: { 
                    'Authorization': `Bearer ${adminToken}`,
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
            if (!adminToken || !isAdmin()) {
                toast.error('Admin access required')
                return { success: false, message: 'Unauthorized' }
            }

            const { data } = await axios.get(`${backendUrl}/api/admin/dashboard/stats`, {
                headers: { 
                    'Authorization': `Bearer ${adminToken}`,
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

    // Patient Logout function
    const logoutUser = () => {
        localStorage.removeItem('token')
        setToken('')
        setUserData(false)
        toast.success('Logged out successfully!')
    }

    // Admin Logout function
    const logoutAdmin = () => {
        localStorage.removeItem('adminToken')
        setAdminToken('')
        setAdminData(false)
        toast.success('Admin logged out successfully!')
    }

    // Check if patient token is valid
    const isPatientTokenValid = () => {
        if (!token) return false
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            const currentTime = Date.now() / 1000
            
            if (payload.exp < currentTime || payload.role !== 'patient') {
                logoutUser()
                return false
            }
            return true
        } catch (error) {
            console.error('Patient token validation error:', error)
            logoutUser()
            return false
        }
    }

    // Check if admin token is valid
    const isAdminTokenValid = () => {
        if (!adminToken) return false
        
        try {
            const payload = JSON.parse(atob(adminToken.split('.')[1]))
            const currentTime = Date.now() / 1000
            
            if (payload.exp < currentTime || (payload.role !== 'admin' && payload.role !== 'super_admin')) {
                logoutAdmin()
                return false
            }
            return true
        } catch (error) {
            console.error('Admin token validation error:', error)
            logoutAdmin()
            return false
        }
    }

    // Initialize app state
   useEffect(() => {
    console.log('AppContext useEffect triggered');
    console.log('Admin token exists:', !!adminToken);
    console.log('Admin data exists:', !!adminData);
    
    if (adminToken && isAdminTokenValid()) {
        console.log('Loading admin profile...');
        loadAdminProfileData();
    }
}, [adminToken]); // Keep only adminToken as dependency

    // Auto-refresh doctors data when authentication state changes
    useEffect(() => {
        getDoctorsData()
    }, [token, adminToken])

    const value = {
    // State
    doctors, setDoctors,
    currencySymbol,
    backendUrl,
    
    // Patient state
    token, setToken,
    userData, setUserData, 
    
    // Admin state
    adminToken, setAdminToken,
    adminData, setAdminData,
    
    // Patient functions
    loadUserProfileData,
    loginUser,
    registerUser,
    updateUserProfile,
    logoutUser,
    isPatient,
    isPatientTokenValid,
    
    // Admin functions
    loginAdmin,  // Simplified function
    loadAdminProfileData,
    getDashboardStats,
    logoutAdmin,
    isAdmin,
    isAdminTokenValid,
    
    // Shared functions
    getDoctorsData,
    updateDoctorAvailability,
    toggleDoctorStatus,
    addDoctorNote
}

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider