import React, { useContext, useState } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showMenu, setShowMenu] = useState(false)
  
  const { 
    token, 
    setToken, 
    userData, 
    adminToken, 
    adminData, 
    logoutUser, 
    logoutAdmin 
  } = useContext(AppContext)

  // Check if we're on admin pages
  const isAdminPage = location.pathname.startsWith('/admin')
  
  // Determine which user data and logout function to use
  const currentToken = isAdminPage ? adminToken : token
  const currentUser = isAdminPage ? adminData : userData
  const currentLogout = isAdminPage ? logoutAdmin : logoutUser

  const handleLogout = () => {
    currentLogout()
    if (isAdminPage) {
      navigate('/admin/login')
    } else {
      navigate('/login')
    }
  }

  // Don't show navbar on login pages
  if (location.pathname === '/login' || location.pathname === '/admin/login') {
    return null
  }

  return (
    <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD]'>
      <img onClick={() => navigate('/')} className='w-44 cursor-pointer' src={assets.logo} alt="" />
      
      <ul className='md:flex items-start gap-5 font-medium hidden'>
        <NavLink to='/' >
          <li className='py-1'>HOME</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/doctors' >
          <li className='py-1'>ALL DOCTORS</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/about' >
          <li className='py-1'>ABOUT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        <NavLink to='/contact' >
          <li className='py-1'>CONTACT</li>
          <hr className='border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden' />
        </NavLink>
        
        {/* Show different links based on current context */}
        {!isAdminPage && !currentToken && (
          <NavLink to='/admin/login' >
            <li className='py-1 text-red-600'>ADMIN LOGIN</li>
            <hr className='border-none outline-none h-0.5 bg-red-600 w-3/5 m-auto hidden' />
          </NavLink>
        )}
        
        {isAdminPage && currentToken && (
          <NavLink to='/admin' >
            <li className='py-1 text-red-600'>ADMIN PANEL</li>
            <hr className='border-none outline-none h-0.5 bg-red-600 w-3/5 m-auto hidden' />
          </NavLink>
        )}
      </ul>

      <div className='flex items-center gap-4'>
        {currentToken && currentUser ? (
          <div className='flex items-center gap-2 cursor-pointer group relative'>
            <img 
              className='w-8 rounded-full' 
              src={currentUser.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=3b82f6&color=ffffff&size=400`} 
              alt="" 
            />
            <img className='w-2.5' src={assets.dropdown_icon} alt="" />
            <div className='absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block'>
              <div className='min-w-48 bg-gray-50 rounded flex flex-col gap-4 p-4'>
                {isAdminPage ? (
                  // Admin dropdown menu
                  <>
                    <p className='text-sm text-red-600 font-semibold border-b pb-2'>
                      👨‍💼 Admin Panel
                    </p>
                    <p onClick={() => navigate('/admin')} className='hover:text-black cursor-pointer'>
                      📊 Dashboard
                    </p>
                    <p onClick={() => navigate('/')} className='hover:text-black cursor-pointer'>
                      🏠 Back to Site
                    </p>
                    <p onClick={handleLogout} className='hover:text-black cursor-pointer text-red-600'>
                      🚪 Admin Logout
                    </p>
                  </>
                ) : (
                  // Patient dropdown menu
                  <>
                    <p className='text-sm text-blue-600 font-semibold border-b pb-2'>
                      👤 Patient Account
                    </p>
                    <p onClick={() => navigate('/my-profile')} className='hover:text-black cursor-pointer'>
                      👤 My Profile
                    </p>
                    <p onClick={() => navigate('/my-appointments')} className='hover:text-black cursor-pointer'>
                      📅 My Appointments
                    </p>
                    <p onClick={() => navigate('/admin/login')} className='hover:text-black cursor-pointer text-red-600'>
                      🔐 Admin Login
                    </p>
                    <p onClick={handleLogout} className='hover:text-black cursor-pointer'>
                      🚪 Logout
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className='flex items-center gap-2'>
            {isAdminPage ? (
              <button 
                onClick={() => navigate('/admin/login')} 
                className='bg-red-600 text-white px-8 py-3 rounded-full font-light hidden md:block hover:bg-red-700 transition-colors'>
                Admin Login
              </button>
            ) : (
              <>
                <button 
                  onClick={() => navigate('/login?mode=signup')} 
                  className='bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block hover:bg-blue-700 transition-colors'>
                  Create account
                </button>
                <button 
                  onClick={() => navigate('/admin/login')} 
                  className='bg-red-600 text-white px-6 py-3 rounded-full font-light text-xs hidden md:block hover:bg-red-700 transition-colors'>
                  Admin
                </button>
              </>
            )}
          </div>
        )}
        
        <img onClick={() => setShowMenu(true)} className='w-6 md:hidden' src={assets.menu_icon} alt="" />

        {/* Mobile Menu */}
        <div className={`md:hidden ${showMenu ? 'fixed w-full' : 'h-0 w-0'} right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className='flex items-center justify-between px-5 py-6'>
            <img src={assets.logo} className='w-36' alt="" />
            <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className='w-7' alt="" />
          </div>
          <ul className='flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium'>
            <NavLink onClick={() => setShowMenu(false)} to='/'>
              <p className='px-4 py-2 rounded full inline-block'>HOME</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/doctors'>
              <p className='px-4 py-2 rounded full inline-block'>ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/about'>
              <p className='px-4 py-2 rounded full inline-block'>ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to='/contact'>
              <p className='px-4 py-2 rounded full inline-block'>CONTACT</p>
            </NavLink>
            
            {currentToken ? (
              isAdminPage ? (
                <>
                  <NavLink onClick={() => setShowMenu(false)} to='/admin'>
                    <p className='px-4 py-2 rounded full inline-block text-red-600'>ADMIN PANEL</p>
                  </NavLink>
                  <button onClick={() => { setShowMenu(false); handleLogout(); }} className='px-4 py-2 rounded full inline-block text-red-600'>
                    ADMIN LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <NavLink onClick={() => setShowMenu(false)} to='/my-profile'>
                    <p className='px-4 py-2 rounded full inline-block'>MY PROFILE</p>
                  </NavLink>
                  <NavLink onClick={() => setShowMenu(false)} to='/my-appointments'>
                    <p className='px-4 py-2 rounded full inline-block'>MY APPOINTMENTS</p>
                  </NavLink>
                  <NavLink onClick={() => setShowMenu(false)} to='/admin/login'>
                    <p className='px-4 py-2 rounded full inline-block text-red-600'>ADMIN LOGIN</p>
                  </NavLink>
                  <button onClick={() => { setShowMenu(false); handleLogout(); }} className='px-4 py-2 rounded full inline-block'>
                    LOGOUT
                  </button>
                </>
              )
            ) : (
              <>
                <NavLink onClick={() => setShowMenu(false)} to='/login?mode=signup'>
                  <p className='px-4 py-2 rounded full inline-block'>SIGN UP</p>
                </NavLink>
                <NavLink onClick={() => setShowMenu(false)} to='/admin/login'>
                  <p className='px-4 py-2 rounded full inline-block text-red-600'>ADMIN LOGIN</p>
                </NavLink>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar