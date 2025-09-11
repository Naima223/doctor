import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)

    // Getting User Profile using API
    const loadUserProfileData = async () => {
        try {
            // Use Authorization header instead of token header
            const { data } = await axios.get(backendUrl + '/api/user/profile', { 
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                } 
            })

            if (data.success) {
                setUserData(data.user) // Changed from data.userData to data.user (based on your backend response)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            // Handle 401 errors (token expired/invalid)
            if (error.response?.status === 401) {
                logout()
                toast.error('Session expired. Please login again.')
            } else {
                toast.error(error.response?.data?.message || error.message)
            }
        }
    }

    // Login API function
    const loginUser = async (email, password) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })

            if (data.success) {
                localStorage.setItem('token', data.token)
                setToken(data.token)
                toast.success('Login successful!')
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.log(error)
            const errorMessage = error.response?.data?.message || error.message
            toast.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    // Signup API function
    const registerUser = async (name, email, password) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })

            if (data.success) {
                localStorage.setItem('token', data.token)
                setToken(data.token)
                toast.success('Account created successfully!')
                return { success: true }
            } else {
                toast.error(data.message)
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.log(error)
            const errorMessage = error.response?.data?.message || error.message
            toast.error(errorMessage)
            return { success: false, message: errorMessage }
        }
    }

    // Update user profile function
    const updateUserProfile = async (profileData) => {
        try {
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
            console.log(error)
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

    // Get all doctors function
    const getDoctorsData = async () => {
        try {
            const headers = token ? {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            } : {
                'Content-Type': 'application/json'
            }

            const { data } = await axios.get(backendUrl + '/api/doctors', { headers })

            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    // Logout function
    const logout = () => {
        localStorage.removeItem('token')
        setToken('')
        setUserData(false)
        toast.success('Logged out successfully!')
    }

    // Check if token is valid (optional - for better UX)
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
            logout()
            return false
        }
    }

    useEffect(() => {
        if (token && isTokenValid()) {
            loadUserProfileData()
        }
    }, [token])

    const value = {
        doctors, setDoctors,
        currencySymbol,
        backendUrl,
        token, setToken,
        userData, setUserData, 
        loadUserProfileData,
        loginUser,
        registerUser,
        updateUserProfile,
        getDoctorsData,
        logout,
        isTokenValid
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider