import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import AdminPanel from './pages/AdminPanel'
import AdminAccess from './pages/AdminAccess'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Navbar />
      
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        
        {/* Patient Authentication Routes */}
        <Route path='/login' element={<Login />} />
        
        {/* Admin Access Routes */}
        <Route path='/admin' element={<AdminAccess />} />
        <Route path='/admin/login' element={<AdminAccess />} />
        
        {/* Patient Protected Routes */}
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        
        {/* Admin Protected Routes */}
        <Route path='/admin/dashboard' element={<AdminPanel />} />
        <Route path='/admin/panel' element={<AdminPanel />} />
      </Routes>
      
      <Footer />
    </div>
  )
}

export default App