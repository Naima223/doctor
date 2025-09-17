import React, { useState } from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  const [showJobs, setShowJobs] = useState(false);

  return (
    <div>

      <div className='text-center text-2xl pt-10 text-[#707070]'>
        <p><span className='text-gray-700 font-semibold'>CONTACT US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[360px]' src={assets.contact_image} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className=' font-semibold text-lg text-gray-600'>OUR OFFICE</p>
          <p className=' text-gray-500'>407/2/c Shat Mosjid Road, Dhanmondi</p>
          <p className=' text-gray-500'>Tel: 01991000166 <br /> Email: quickdoc00987@gmail.com</p>
          <p className=' font-semibold text-lg text-gray-600'>CAREERS AT QUICKDOC</p>
          <p className=' text-gray-500'>Learn more about our teams and job openings.</p>
          <button 
            onClick={() => setShowJobs(true)}
            className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'
          >
            Explore Jobs
          </button>
        </div>
      </div>

      
      {showJobs && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white p-8 rounded-lg max-w-md mx-4'>
            <h3 className='text-xl font-semibold mb-4'>Career Opportunities</h3>
            <p className='text-gray-600 mb-6'>
              We're always looking for talented individuals to join our team! 
              Please send your resume to careers@quickdoc.com or contact us directly.
            </p>
            <button 
              onClick={() => setShowJobs(false)}
              className='bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors'
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Contact