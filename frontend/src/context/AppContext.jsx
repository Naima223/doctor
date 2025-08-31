import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from 'axios'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = 'â‚¹'
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)

    // Getting User Profile using API
    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } })

            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
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
            toast.error(error.message)
            return { success: false, message: error.message }
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
            toast.error(error.message)
            return { success: false, message: error.message }
        }
    }

    // Logout function
    const logout = () => {
        localStorage.removeItem('token')
        setToken('')
        setUserData(false)
        toast.success('Logged out successfully!')
    }

    useEffect(() => {
        if (token) {
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
        logout
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider