import React from 'react';
import { assets } from '../assets/assets';
import { FaClock } from 'react-icons/fa';
import { FaMapPin } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';

const About = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p><span className='text-gray-700 font-medium'>ABOUT US</span></p>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-12'>
        <img className='w-full md:max-w-[360px]' src={assets.about_image} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
          <p>Welcome To QuickDoc, Your Trusted Partner In Managing Your HealthCare Needs Conveniently And Efficiently.
            At QuickDoc, We Understand The Challenges Individuals Face When It Comes To Scheduling Doctor Appointments And Managing Their Health Records.
          </p>
          <p>QuickDoc Is Commited To Excellence In Healthcare Technology.
            We Continously Strive To Enhance Our Platform, Integrating The Latest Advancements To Improve User Experience And Deliver Superior Service.
            Whether You're Booking Your First Appointment Or Managing Ongoing Care, QuickDoc Is Here To Support You Every Step Of The Way.
          </p>
          <b className='text-gray-800'>Our Vision</b>
          <p>Our Vision At QuickDoc Is To Create A Seamless HealthCare Experience For Every User.
            We Aim To Bridge The Gap Between Patients And HealthCare Providers, Making It Easier For You To Access The Care You Need, When You Need It.
          </p>
        </div>
      </div>
      <div className='text-xl my-4'>
        <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span></p>
      </div>
      <div className='flex flex-col md:flex-row mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer group'>
          <div className='flex items-center gap-3'>
            <FaClock className='w-8 h-8 text-blue-500 group-hover:text-white transition-colors duration-300' />
            <b>EFFICIENCY:</b>
          </div>
          <p>Streamlined Appointment Scheduling That Fits Into Your Busy Lifestyle.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer group'>
          <div className='flex items-center gap-3'>
            <FaMapPin className='w-8 h-8 text-green-500 group-hover:text-white transition-colors duration-300' />
            <b>CONVENIENCE:</b>
          </div>
          <p>Access To A Network Of Trusted HealthCare Professionals In Your Area.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer group'>
          <div className='flex items-center gap-3'>
            <FaUser className='w-8 h-8 text-purple-500 group-hover:text-white transition-colors duration-300' />
            <b>PERSONALIZATION:</b>
          </div>
          <p>Tailored Recommenations And Remainders To Help You Stay On Top Of Your Health.</p>
        </div>
      </div>
    </div>
  );
};

export default About;