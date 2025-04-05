import React from 'react'

export const Spinner = () => {
  return (
   <div className="flex items-center justify-center h-screen w-full">
      <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-green-600" />
   </div>
  )
}
