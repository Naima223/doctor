import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { backendUrl, setToken, setUserData } = useContext(AppContext)

  // URL থেকে mode ধরো
  const params = new URLSearchParams(location.search)
  const mode = params.get('mode')

  // ডিফল্ট state হবে Sign Up
  const [state, setState] = useState('Sign Up')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  // URL mode অনুযায়ী state সেট করো
  useEffect(() => {
    if (mode === 'login') {
      setState('Login')
    } else if (mode === 'signup') {
      setState('Sign Up')
    }
  }, [mode])

  // ফর্ম সাবমিট হ্যান্ডলার
  const onSubmitHandler = async (e) => {
    e.preventDefault()
    try {
      if (state === 'Login') {
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password })
        if (data.success) {
          setToken(data.token)
          setUserData(data.userData)
          localStorage.setItem('token', data.token)
          toast.success('Login successful!')
          navigate('/')
        } else {
          toast.error(data.message)
        }
      } else {
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, email, password })
        if (data.success) {
          setToken(data.token)
          setUserData(data.userData)
          localStorage.setItem('token', data.token)
          toast.success('Account created!')
          navigate('/')
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <form
        onSubmit={onSubmitHandler}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center mb-6">{state}</h2>

        {state === 'Sign Up' && (
          <input
            type="text"
            placeholder="Name"
            className="w-full border p-3 rounded mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-6"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-primary text-white py-3 rounded-lg hover:opacity-90 transition"
        >
          {state}
        </button>

        <p className="text-center mt-4">
          {state === 'Login' ? (
            <>
              Don’t have an account?{' '}
              <span
                onClick={() => navigate('/login?mode=signup')}
                className="text-primary cursor-pointer font-medium"
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span
                onClick={() => navigate('/login?mode=login')}
                className="text-primary cursor-pointer font-medium"
              >
                Login
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  )
}

export default Login
