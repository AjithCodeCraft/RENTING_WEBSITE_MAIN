import React from 'react'
import ChatInterface from './chat-interface'
import UserHeader from '../UserHeader'

const index = () => {
  return (
    <main className="min-h-screen">
        <div className="sticky top-0 z-50 bg-white shadow-md"><UserHeader/></div>
        <div><ChatInterface/></div>
        
      
    </main>
  )
}

export default index