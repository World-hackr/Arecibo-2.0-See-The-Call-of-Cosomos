import { useState } from "react";
import { motion } from "framer-motion";

export default function FeedbackSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contact-us" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl text-black mb-6">
            Get In <span style={{ color: "var(--neon-purple)" }}>Touch</span>
          </h2>
          <p className="text-xl text-black">
            Share your thoughts or questions about Arecibo 2.0
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-black/50 border border-gray-700 text-white placeholder-gray-200 focus:border-[var(--neon-blue)] px-4 py-2 rounded-md transition-colors"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-black/50 border border-gray-700 text-white placeholder-gray-200 focus:border-[var(--neon-blue)] px-4 py-2 rounded-md transition-colors"
            />
          </div>

          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full bg-black/50 border border-gray-700 text-white placeholder-gray-200 focus:border-[var(--neon-blue)] px-4 py-2 rounded-md resize-none transition-colors"
          />

          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
            >
              Send Message
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
