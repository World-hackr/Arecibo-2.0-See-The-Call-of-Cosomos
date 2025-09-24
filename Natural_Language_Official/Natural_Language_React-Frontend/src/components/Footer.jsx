import { Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl text-white">
              Arecibo <span style={{ color: "var(--neon-blue)" }}>2.0</span>
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Advancing the frontiers of radio astronomy and space exploration 
              for humanity's understanding of the universe.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg text-white mb-4">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail size={18} style={{ color: "var(--neon-blue)" }} />
                <span>contact@arecibo2.org</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone size={18} style={{ color: "var(--neon-blue)" }} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin size={18} style={{ color: "var(--neon-blue)" }} />
                <span>Puerto Rico Observatory Site</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h4 className="text-lg text-white mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
              >
                <Github
                  size={20}
                  className="text-gray-400 group-hover:text-[var(--neon-blue)] transition-colors"
                />
              </a>
              <a
                href="#"
                className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
              >
                <Twitter
                  size={20}
                  className="text-gray-400 group-hover:text-[var(--neon-blue)] transition-colors"
                />
              </a>
              <a
                href="#"
                className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors group"
              >
                <Linkedin
                  size={20}
                  className="text-gray-400 group-hover:text-[var(--neon-blue)] transition-colors"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © 2025 Arecibo 2.0. All rights reserved. |{" "}
            <span className="ml-2">Built for the future of space exploration</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
