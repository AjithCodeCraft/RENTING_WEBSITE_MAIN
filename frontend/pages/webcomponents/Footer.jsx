export default function Footer() {
  const handleSubscribe = (event) => {
    event.preventDefault();
    alert("You're all set! Thanks for subscribing. We'll keep you updated with the latest news, expert tips, and important announcements—only the emails that truly matter!");
  };

  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <p className="flex items-center text-gray-400">
            <i className="fa-regular fa-envelope text-[#16a34a] mr-2"></i>
            support@hostelio.com
          </p>
          <p className="flex items-center text-gray-400">
            <i className="fa-solid fa-phone text-[#16a34a] mr-2"></i>
            +91 9876543210
          </p>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            {[
              { name: "Facebook", icon: "fa-brands fa-facebook", link: "#" },
              { name: "Instagram", icon: "fa-brands fa-instagram", link: "#" },
              { name: "LinkedIn", icon: "fa-brands fa-linkedin", link: "#" },
              { name: "Twitter", icon: "fa-brands fa-x-twitter", link: "#" },
            ].map((social, index) => (
              <a
                key={index}
                href={social.link}
                className="text-gray-400 hover:text-[#16a34a] text-2xl transition transform hover:scale-110"
                aria-label={social.name}
              >
                <i className={social.icon}></i>
              </a>
            ))}
          </div>
        </div>
        
        {/* Email Subscription */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Subscribe for Updates</h3>
          <form className="flex" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-3 py-2 text-black rounded-l-md focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-[#16a34a] text-white px-4 py-2 rounded-r-md hover:bg-green-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-gray-700 text-center text-gray-500 text-sm mt-8 pt-4">
        &copy; {new Date().getFullYear()} Hostelio. All rights reserved.
      </div>
    </footer>
  );
}
