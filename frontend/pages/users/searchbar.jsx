import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Searchbar() {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    location: '',
    rentMin: '',
    rentMax: '',
    duration: '',
    roomSharingType: '',
    parkingAvailable: false,
    hostelType: '',
  });

  // Options data
  const durationChoices = [
    { value: 'short_term', label: 'Short Term' },
    { value: 'long_term', label: 'Long Term' },
    { value: 'monthly', label: 'Monthly' },
  ];
  
  const roomSharingChoices = [
    { value: 'single', label: 'Single' },
    { value: 'double', label: 'Double' },
    { value: 'triple', label: 'Triple' },
  ];
  
  const hostelTypeChoices = [
    { value: 'boys', label: 'Boys' },
    { value: 'girls', label: 'Girls' },
    { value: 'coed', label: 'Co-ed' },
  ];

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleFilters = () => setShowFilters(!showFilters);

  return (
    <div className="flex flex-col items-center w-full mt-2 px-4 max-w-4xl mx-auto">
      {/* Main Search Container */}
      <div className="w-full relative bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center p-2">
          <svg 
            className="w-6 h-6 text-gray-400 ml-3" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            placeholder="Search hostels, locations..."
            className="flex-1 px-4 py-3 text-gray-700 bg-transparent focus:outline-none"
          />
          <button
            onClick={toggleFilters}
            className="flex items-center px-4 py-2 mr-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
              />
            </svg>
            Filters
          </button>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {/* Rent Range */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Rent Range</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="rentMin"
                      value={filters.rentMin}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    />
                    <input
                      type="number"
                      name="rentMax"
                      value={filters.rentMax}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>

                {/* Duration & Hostel Type */}
                <div className="space-y-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <select
                      name="duration"
                      value={filters.duration}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="">Select Duration</option>
                      {durationChoices.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Hostel Type</label>
                    <select
                      name="hostelType"
                      value={filters.hostelType}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white"
                    >
                      <option value="">Select Type</option>
                      {hostelTypeChoices.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Room Type & Parking */}
                <div className="space-y-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Room Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {roomSharingChoices.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setFilters({...filters, roomSharingType: opt.value})}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            filters.roomSharingType === opt.value
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-center space-x-2 mt-3">
                    <input
                      type="checkbox"
                      name="parkingAvailable"
                      checked={filters.parkingAvailable}
                      onChange={handleFilterChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-600">Parking Available</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}