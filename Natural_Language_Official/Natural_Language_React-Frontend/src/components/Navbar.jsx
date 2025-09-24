import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import image1 from "../assets/image1.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleScrollOrNavigate = (id) => {
    if (location.pathname === "/") {
      // Scroll to section if already on home
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to home with hash
      navigate(`/#${id}`);
    }
    setIsOpen(false); // close mobile menu if open
  };

  return (
    <div className="w-full bg-black">
      <div className="flex items-center justify-between h-20 px-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <img src={image1} alt="Logo" className="w-36 md:w-40" />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-24">
          <button
            onClick={() => handleScrollOrNavigate("dashboard")}
            className="text-white hover:underline border w-[70px] rounded-lg"
          >
            Home
          </button>
          <button
            onClick={() => handleScrollOrNavigate("about")}
            className="text-white hover:underline border w-[70px] rounded-lg"
          >
            About
          </button>
          <button
            onClick={() => window.location.href="/Gallery"}
            className="text-white hover:underline border w-[70px] rounded-lg"
          >
            Gallery
          </button>
          <button
            onClick={() => handleScrollOrNavigate("contact")}
            className="text-white hover:underline border w-[70px] rounded-lg"
          >
            Contact
          </button>
        </div>

        {/* Mobile Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <X size={28} className="text-white" />
            ) : (
              <Menu size={28} className="text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center bg-black pb-4 space-y-4">
          <button
            onClick={() => handleScrollOrNavigate("dashboard")}
            className="text-white hover:underline"
          >
            Home
          </button>
          <button
            onClick={() => handleScrollOrNavigate("about")}
            className="text-white hover:underline"
          >
            About
          </button>
          <button
            onClick={() => handleScrollOrNavigate("gallery")}
            className="text-white hover:underline"
          >
            Gallery
          </button>
          <button
            onClick={() => handleScrollOrNavigate("contact")}
            className="text-white hover:underline"
          >
            Contact
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
