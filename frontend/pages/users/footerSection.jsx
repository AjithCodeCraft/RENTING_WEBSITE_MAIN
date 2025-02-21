import React from 'react';
import Image from 'next/image';

const FooterSection = () => {
  return (
    <footer className="">
      <div className="max-w-screen-xl p-4 mx-auto md:p-8 lg:p-10">
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <div className="text-center">
          <a href="#" className="flex items-center justify-center mb-5 text-2xl font-semibold text-gray-900 dark:text-white">
          {/* <Image
            src="/Logo.png"
            className="object-cover"
            alt="Atom Logo"
            width={70}
            height={180}
            style={{ width: '70', height: '190' }}
          /> */}

          </a>
          <span className="block text-sm text-center text-gray-500 dark:text-gray-400">
            © 2024-2025 twoPointers™. All Rights Reserved. 
          </span>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;