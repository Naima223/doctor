import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { X, MapPin, Clock, DollarSign } from 'lucide-react'

const Contact = () => {
  const [showJobs, setShowJobs] = useState(false);

  const handleExploreJobs = () => {
    setShowJobs(true);
  };

  const closeModal = () => {
    setShowJobs(false);
  };

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
            onClick={handleExploreJobs}
            className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'
          >
            Explore Jobs
          </button>
        </div>
      </div>

      {/* Job Modal */}
      {showJobs && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex justify-between items-center p-6 border-b'>
              <h2 className='text-2xl font-semibold text-gray-800'>Career Opportunities at QuickDoc</h2>
              <button 
                onClick={closeModal}
                className='text-gray-500 hover:text-gray-700 transition-colors'
              >
                <X className='w-6 h-6' />
              </button>
            </div>
            
            <div className='p-6'>
              <div className='space-y-6'>
                {/* Job 1 */}
                <div className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>Frontend Developer</h3>
                  <p className='text-gray-600 mb-3'>Join our tech team to build user-friendly healthcare interfaces using React and modern web technologies.</p>
                  <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <MapPin className='w-4 h-4' />
                      <span>Dhaka, Bangladesh</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='w-4 h-4' />
                      <span>Full-time</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <DollarSign className='w-4 h-4' />
                      <span>Competitive</span>
                    </div>
                  </div>
                </div>

                {/* Job 2 */}
                <div className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>Healthcare Coordinator</h3>
                  <p className='text-gray-600 mb-3'>Help patients navigate our platform and coordinate appointments with healthcare providers.</p>
                  <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <MapPin className='w-4 h-4' />
                      <span>Dhaka, Bangladesh</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='w-4 h-4' />
                      <span>Full-time</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <DollarSign className='w-4 h-4' />
                      <span>Competitive</span>
                    </div>
                  </div>
                </div>

                {/* Job 3 */}
                <div className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'>
                  <h3 className='text-lg font-semibold text-gray-800 mb-2'>UI/UX Designer</h3>
                  <p className='text-gray-600 mb-3'>Design intuitive and accessible healthcare experiences for patients and medical professionals.</p>
                  <div className='flex flex-wrap gap-4 text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <MapPin className='w-4 h-4' />
                      <span>Dhaka, Bangladesh</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='w-4 h-4' />
                      <span>Full-time</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <DollarSign className='w-4 h-4' />
                      <span>Competitive</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
                <h4 className='font-semibold text-gray-800 mb-2'>How to Apply</h4>
                <p className='text-gray-600 text-sm'>
                  Send your resume and cover letter to <span className='font-medium text-blue-600'>careers@quickdoc.com</span> 
                  or contact us at <span className='font-medium text-blue-600'>01991000166</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Contact