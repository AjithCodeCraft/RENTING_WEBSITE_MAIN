import React from 'react'
import AdminChatInterface from './admin-chat'
import OwnerHeader from '../OwnerHeader'

const index = () => {
  return (
    <main className="min-h-screen">
        <div className="sticky top-0 z-50 bg-white shadow-md"><OwnerHeader/></div>
        <div>
            <AdminChatInterface/>
        </div>
        
      
    </main>
  )
}

export default index