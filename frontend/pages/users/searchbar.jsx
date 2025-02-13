'use client';

import { useState, useRef, useEffect } from 'react';

export default function Searchbar() {
  const [selectedRegion, setSelectedRegion] = useState('Europe');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const regions = ['Europe', 'Australia', 'Africa'];

  const handleDropdownToggle = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSelectRegion = (region) => {
    setSelectedRegion(region);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex justify-center items-center w-full mt-2">
      <div className="w-full max-w-4xl min-w-[300px] px-4 sm:px-0">
        <div className="relative" ref={dropdownRef}>
          <div className="absolute top-1 left-1 flex items-center">
            <button
              onClick={handleDropdownToggle}
              className="rounded border border-transparent py-2 px-3 text-center flex items-center text-sm transition-all text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              <span className="text-ellipsis overflow-hidden">{selectedRegion}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-4 w-4 ml-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div className="h-8 border-l border-slate-200 ml-2"></div>
            {isDropdownOpen && (
              <div className="min-w-[150px] absolute left-0 mt-2 bg-white border border-slate-200 rounded-md shadow-lg z-10">
                <ul>
                  {regions.map((region) => (
                    <li
                      key={region}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-50 text-sm cursor-pointer"
                      onClick={() => handleSelectRegion(region)}
                    >
                      {region}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <input
            type="text"
            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-base border border-slate-200 rounded-md pr-14 pl-32 py-3 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
            placeholder="Germany..."
          />
          <button
            className="absolute right-1 top-1 rounded bg-slate-800 p-2 border border-transparent text-center text-sm text-white transition-all shadow-sm hover:shadow focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}