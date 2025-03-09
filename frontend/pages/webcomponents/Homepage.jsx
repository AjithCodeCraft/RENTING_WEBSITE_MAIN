"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, CreditCard, Star, Wallet,Briefcase, Home, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Homepage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <div className="relative w-full h-screen flex flex-col items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/photo1.jpg"
            alt="Hostel Booking Banner"
            layout="fill"
            objectFit="cover"
            className="opacity-100"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-10 pt-32"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-bold text-white drop-shadow-lg font-sans">
            Your Perfect Stay, Just a Click Away!
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl mt-4 font-sans">
            Book budget-friendly hostels effortlessly and experience comfort
            like never before. Your next adventure starts here.
          </p>
          
          <motion.button
            className="mt-6 px-8 py-3 bg-[#16a34a] text-white rounded-lg shadow-md hover:bg-green-700 font-sans"
            whileHover={{ scale: 1.1 }}
          >
            <Link href="/signup">
               Get Started</Link>
         
          </motion.button>
        </motion.div>
      </div>

      {/* Why Choose Hostelio? Section */}
      <section className="py-16 bg-gray-100 w-full text-center">
        <motion.h2
          className="text-4xl font-bold text-[#16a34a] mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Why Choose Hostelio?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <ShieldCheck className="w-10 h-10 text-[#16a34a]" />,
              title: "Verified Hostels",
              desc: "Safe & secure stays.",
            },
            {
              icon: <CreditCard className="w-10 h-10 text-[#16a34a]" />,
              title: "Easy Online Booking",
              desc: "Instant confirmation.",
            },
            {
              icon: <Star className="w-10 h-10 text-[#16a34a]" />,
              title: "Reviews & Ratings",
              desc: "Honest feedback from real users.",
            },
            {
              icon: <Wallet className="w-10 h-10 text-[#16a34a]" />,
              title: "Affordable Prices",
              desc: "Budget-friendly accommodations.",
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {item.icon}
              <h3 className="text-xl font-semibold text-[#16a34a] mt-4">
                {item.title}
              </h3>
              <p className="text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* A Few of the Benefits Section */}
      <section className="py-16 w-full text-center bg-white relative">
        <motion.h2
          className="text-4xl font-bold text-[#16a34a] mb-8"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          A Few of the Benefits
        </motion.h2>

        <div className="max-w-6xl mx-auto space-y-12">
          {[
            {
              imgSrc: "/photo2.svg",
              imgAlt: "Flexible Stay Durations",
              title: "Flexible Stay Durations",
              desc: "Whether you need a short-term or long-term stay, Hostelio offers flexible booking options to suit your schedule—perfect for students, travelers, and working professionals.",
              reverse: false,
            },
            {
              imgSrc: "/photo3.svg",
              imgAlt: "Community & Networking",
              title: "Community & Networking",
              desc: "Stay in vibrant hostels where you can meet like-minded people, build new friendships, and expand your professional or social network.",
              reverse: true,
            },
            {
              imgSrc: "/photo4.png",
              imgAlt: "Seamless Relocation Experience",
              title: "Seamless Relocation Experience",
              desc: "Moving to a new city? We make finding the perfect hostel stress-free with real images, verified listings, and user-friendly filters.",
              reverse: false,
            },
            {
              imgSrc: "/photo5.svg",
              imgAlt: "No Brokerage or Hidden Fees",
              title: "No Brokerage or Hidden Fees",
              desc: "Unlike traditional rental services, Hostelio eliminates middlemen, ensuring zero brokerage and transparent pricing with no hidden costs.",
              reverse: true,
            },
          ].map((benefit, index) => (
            <motion.div
              key={index}
              className={`flex flex-col lg:flex-row items-center bg-gray-100 rounded-lg shadow-md overflow-hidden ${
                benefit.reverse ? "lg:flex-row-reverse" : ""
              }`}
              initial={{ opacity: 0, x: benefit.reverse ? 100 : -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <motion.div className="w-full lg:w-1/2">
                <Image
                  src={benefit.imgSrc}
                  alt={benefit.imgAlt}
                  width={800}
                  height={600}
                  className="object-cover"
                />
              </motion.div>

              <motion.div className="p-8 text-left">
                <h3 className="text-2xl font-semibold text-[#16a34a] mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 mb-4">{benefit.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

{/* How It Works Section */}
<section className="bg-gray-100 py-16">
  <div className="max-w-6xl mx-auto px-6 text-center">
    <motion.h2
      className="text-4xl font-bold text-gray-800 mb-8"
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      How It Works
    </motion.h2>

    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          icon: "🔍",
          title: "Search & Compare",
          desc: "Find hostels in your preferred location and compare amenities.",
        },
        {
          icon: "🏠",
          title: "Book Easily",
          desc: "Secure your stay instantly with a simple booking process.",
        },
        {
          icon: "🎉",
          title: "Enjoy Your Stay",
          desc: "Check-in hassle-free and enjoy a comfortable experience.",
        },
      ].map((step, index) => (
        <motion.div
          key={index}
          className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
        >
          <div className="bg-[#16a34a] text-white p-4 rounded-full mb-4">
            {step.icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-700">{step.title}</h3>
          <p className="text-gray-600 mt-2">{step.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
</section>

{/* Host Your Property Section */}
<section className="py-16 bg-white text-center">
  <motion.h2
    className="text-4xl font-bold text-[#16a34a] mb-6"
    initial={{ opacity: 0, y: -20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
  >
    Host Your Property
  </motion.h2>
  <p className="text-gray-700 max-w-2xl mx-auto mb-8">
    Earn extra income by listing your hostel on Hostelio. Reach thousands of students, travelers, and working professionals looking for a perfect stay.
  </p>

  <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {[
      {
        icon: <Briefcase className="w-10 h-10" />,
        title: "List Your Hostel",
        desc: "Add property details, upload images, and set pricing easily.",
      },
      {
        icon: <Home className="w-10 h-10" />,
        title: "Manage Bookings",
        desc: "Track reservations, availability, and payments with ease.",
      },
      {
        icon: <CheckCircle className="w-10 h-10" />,
        title: "Start Earning",
        desc: "Get payments securely and grow your business hassle-free.",
      },
    ].map((step, index) => (
      <motion.div
        key={index}
        className="p-6 bg-gray-100 rounded-xl shadow-md flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.2 }}
      >
        <div className="bg-[#16a34a] text-white p-4 rounded-full mb-4">
          {step.icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-700">{step.title}</h3>
        <p className="text-gray-600 mt-2">{step.desc}</p>
      </motion.div>
    ))}
  </div>

  {/* Call to Action Button */}
  <motion.button
    className="mt-8 px-8 py-3 bg-[#16a34a] text-white rounded-lg shadow-md hover:bg-green-700 text-lg"
    whileHover={{ scale: 1.1 }}
  >
    List Your Property
  </motion.button>
</section>

    </div>
  );
}
