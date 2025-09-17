import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginUser, registerUser } = useContext(AppContext)

  // URL থেকে mode ধরো
  const params = new URLSearchParams(location.search)
  const mode = params.get('mode') // 'login' or 'signup'

  // States
  const [state, setState] = useState(mode === 'signup' ? 'Sign Up' : 'Login')
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
  }, [mode])

  // Handle form submission
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result = { success: false }

      // Patient Login/Signup only
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

      if (result.success) {
        // Always redirect to home page for patients
        navigate('/')
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
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <span className="text-2xl">👨‍⚕️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to QuickDoc
          </h1>
          <p className="text-gray-600">
            {state === 'Login' ? 'Sign in to your patient account' : 'Create your patient account'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Form Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Patient {state}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {state === 'Login' 
                ? 'Sign in to book appointments with trusted doctors'
                : 'Join our platform to connect with healthcare professionals'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmitHandler} className="space-y-6">
            {/* Name Field (Patient Registration Only) */}
            {state === 'Sign Up' && (
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
                placeholder="your.email@example.com"
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
              {state === 'Sign Up' && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
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

          {/* Mode Switch */}
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

          {/* Admin Access Link */}
          <div className="mt-6 text-center border-t pt-6">
            <p className="text-sm text-gray-500 mb-2">
              Are you a healthcare administrator?
            </p>
            <button
              onClick={() => navigate('/admin')}
              className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              disabled={loading}
            >
              🔐 Admin Access Portal
            </button>
          </div>

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