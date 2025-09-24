import { useState } from "react";
import { motion } from "framer-motion"; // ✅ correct import
import image4 from '../assets/image4.jpeg'
import image5 from '../assets/image5.jpeg'
import  image6 from '../assets/image6.jpeg'
import image7 from '../assets/image7.jpeg'
import image8 from '../assets/image8.jpeg'
import image9 from '../assets/image9.jpeg'
const galleryImages = [
  {
    src: image4,
    caption: "Advanced Research Technology",
    
  },
  {
    src: image5,
    caption: "Night Sky Observations",
  },
  {
    src: image6,
    caption: "Research Facility Operations",
  },
  {
    src: image7,
    caption: "Satellite Dish Array",
  },
  {
    src: image8,
    caption: "Space Exploration Equipment",
  },
  {
    src: image9,
    caption: "Futuristic Laboratory",
  },
];

export default function GallerySection() {
  const [hoveredIndex, setHoveredIndex] = useState(null); // ✅ plain React

  return (
    <section id="gallery" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl text-white mb-6">Gallery</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore the cutting-edge technology and facilities that make Arecibo
            2.0 possible
          </p>
        </motion.div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Image */}
              <img
                src={image.src}
                alt={image.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />

              {/* Dark Overlay */}
              <div
                className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
                  hoveredIndex === index ? "opacity-100" : "opacity-0"
                }`}
              ></div>

              {/* Caption */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  hoveredIndex === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="text-center">
                  <h3 className="text-xl text-white mb-2">{image.caption}</h3>
                  <div
                    className="w-12 h-0.5 mx-auto"
                    style={{ backgroundColor: "var(--neon-blue)" }}
                  ></div>
                </div>
              </div>

              {/* Neon Border */}
              <div
                className={`absolute inset-0 border-2 transition-all duration-300 ${
                  hoveredIndex === index
                    ? "border-[var(--neon-blue)] shadow-lg shadow-[var(--neon-blue)]/20"
                    : "border-transparent"
                }`}
              ></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
