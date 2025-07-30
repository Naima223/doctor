import React from 'react'
import Header from '../components/Header'
import Banner from '../components/Banner'
import Navbar from '../components/Navbar'
import SpecialityMenu from '../components/SpecialityMenu'

const Home = () => {
  return (
    <div>
     
      <Header />
      <SpecialityMenu/>
      <Banner />
    </div>
  )
}

export default Home