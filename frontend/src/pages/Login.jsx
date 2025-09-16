import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginUser, registerUser, loginAdmin } = useContext(AppContext)

  // URL থেকে mode এবং type ধরো
  const params = new URLSearchParams(location.search)
  const mode = params.get('mode') // 'login' or 'signup'
  const userType = params.get('type') // 'patient' or 'admin'

  // States
  const [activeTab, setActiveTab] = useState(userType || 'patient') // 'patient' or 'admin'
  const [state, setState] = useState(mode || 'Login') // 'Login' or 'Sign Up'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  // URL mode অনুযায়ী state সেট করো
  useEffect(() => {
    if (mode === 'login') {
      setState('Login')
    } else if (mode === 'signup') {
      setState('Sign Up')
    }
    
    if (userType) {
      setActiveTab(userType)
    }
  }, [mode, userType])

  // Reset form when switching tabs
  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    setEmail('')
    setPassword('')
    setName('')
    
    // Update URL
    const newParams = new URLSearchParams(location.search)
    newParams.set('type', newTab)
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true })
  }

  // Handle form submission
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result = { success: false }

      if (activeTab === 'admin') {
        // Admin Login Only
        if (state === 'Sign Up') {
          toast.error('Admin registration is not allowed. Please contact system administrator.')
          setLoading(false)
          return
        }
        result = await loginAdmin(email, password)
      } else {
        // Patient Login/Signup
        if (state === 'Login') {
          result = await loginUser(email, password)
        } else {
          if (!name.trim()) {
            toast.error('Please provide your name')
            setLoading(false)
            return
          }
          result = await registerUser(name, email, password)
        }
      }

      if (result.success) {
        // Redirect based on user type
        if (activeTab === 'admin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }

    } catch (error) {
      console.error('Form submission error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle mode change (Login/Sign Up)
  const handleModeChange = (newMode) => {
    setState(newMode)
    const newParams = new URLSearchParams(location.search)
    newParams.set('mode', newMode.toLowerCase())
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to QuickDoc
          </h1>
          <p className="text-gray-600">
            {state === 'Login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-gray-100 p-1 rounded-lg flex">
          <button
            onClick={() => handleTabChange('patient')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'patient'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            👤 Patient Login
          </button>
          <button
            onClick={() => handleTabChange('admin')}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'admin'
                ? 'bg-white text-red-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🔐 Admin Login
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Form Header */}
          <div className="text-center mb-6">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              activeTab === 'admin' ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <span className="text-2xl">
                {activeTab === 'admin' ? '🛡️' : '👨‍⚕️'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeTab === 'admin' ? 'Admin ' : 'Patient '}
              {state}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {activeTab === 'admin' 
                ? 'Access admin dashboard to manage doctors and system'
                : state === 'Login' 
                  ? 'Sign in to book appointments with trusted doctors'
                  : 'Join our platform to connect with healthcare professionals'
              }
            </p>
          </div>

          {/* Admin Registration Warning */}
          {activeTab === 'admin' && state === 'Sign Up' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Admin Registration Disabled
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    Admin accounts can only be created by system administrators. 
                    Please contact support for admin access.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Demo Credentials */}
          {activeTab === 'admin' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-blue-500 text-xl">💡</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Demo Admin Credentials</h3>
                  <div className="mt-1 text-sm text-blue-700">
                    <p><strong>Email:</strong> admin@quickdoc.com</p>
                    <p><strong>Password:</strong> admin123</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="space-y-6">
            {/* Name Field (Patient Registration Only) */}
            {state === 'Sign Up' && activeTab === 'patient' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder={activeTab === 'admin' ? 'admin@quickdoc.com' : 'your.email@example.com'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength="6"
              />
              {state === 'Sign Up' && activeTab === 'patient' && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (activeTab === 'admin' && state === 'Sign Up')}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                loading || (activeTab === 'admin' && state === 'Sign Up')
                  ? 'bg-gray-400 cursor-not-allowed'
                  : activeTab === 'admin'
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              } focus:ring-2 focus:ring-offset-2`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  {state === 'Login' ? '🔑' : '📝'} {state}
                </>
              )}
            </button>
          </form>

          {/* Mode Switch (Patient Only) */}
          {activeTab === 'patient' && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {state === 'Login' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      onClick={() => handleModeChange('Sign Up')}
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                      disabled={loading}
                    >
                      Create Account
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      onClick={() => handleModeChange('Login')}
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                      disabled={loading}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </div>
          )}

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              disabled={loading}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login