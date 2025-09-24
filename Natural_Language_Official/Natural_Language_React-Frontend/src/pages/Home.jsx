import { useEffect } from "react";
import { useLocation } from "react-router-dom"; // ✅ Add this
import Navbar from '../components/Navbar'
import Dashboard from '../components/Dashbord'
import AboutSection from '../components/AboutSection'
import GallerySection from '../components/GallerySection'
import FeedbackSection from '../components/FeedbackSection'
import Footer from '../components/Footer'


const Home = () => {
  const location = useLocation(); // ✅ Now it works

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <div>
      <Navbar />
      <div id="dashboard"><Dashboard /></div>
      <div id="about"><AboutSection /></div>
      <div id="gallery"><GallerySection /></div>
      <div id="contact"><FeedbackSection /></div>
      <div id="footer"><Footer /></div>
    </div>
  );
}

export default Home;
