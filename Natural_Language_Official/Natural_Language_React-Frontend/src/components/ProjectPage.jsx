import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = "http://localhost:8000";

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageModal, setImageModal] = useState({ src: "", title: "", show: false });

  const getMediaUrl = (path) => (path ? `${backendUrl}${path}` : null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/projects/${id}/`);
        setProject(data);
      } catch (err) {
        setError("Failed to load project data.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  // Auto-refresh if processing
  useEffect(() => {
    if (project?.is_processing) {
      const timeout = setTimeout(() => location.reload(), 5000);
      return () => clearTimeout(timeout);
    }
  }, [project?.is_processing]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        const res = await fetch(`${backendUrl}/api/projects/${project.id}/delete/`, {
          method: 'DELETE',
        });
        
        if (res.ok) {
          alert('Project deleted successfully!');
          navigate('/gallery'); // Navigate back to gallery after successful deletion
        } else {
          alert('Failed to delete project. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('An error occurred while deleting the project.');
      }
    }
  };

  const openImageModal = (src, title) => setImageModal({ src, title, show: true });
  const closeImageModal = () => setImageModal({ src: "", title: "", show: false });

  if (loading) return <div className="text-gray-300 p-4">Loading project...</div>;
  if (error) return <div className="text-red-400 p-4">{error}</div>;
  if (!project) return <div className="text-red-400 p-4">No project found.</div>;

  // Tailwind reusable classes
  const cardClass = "border border-white/30 rounded p-4 bg-[#111]";
  const btnWhite =
    "bg-white border text-black px-3 py-1 rounded transition hover:bg-blue-500 hover:text-white";
  const btnGray = "bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition";
  const btnRed = "bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition";
  const imgHover =
    "w-full cursor-pointer hover:scale-105 hover:shadow-[0_0_10px_#3b82f6] transition";

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <div className="p-6 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center border-b border-black pb-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {project.name}
              {project.is_processing && (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin ml-2"></span>
              )}
            </h1>
            <p className="text-gray-400 mt-1">
              {project.get_wave_type_display} |{" "}
              {new Date(project.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-3 mt-3 lg:mt-0 ">
            <button
              onClick={() => navigate(`/visualize/${project.id}`)}
              className={btnWhite}
            >
              Interactive Visualizer
            </button>
            <button 
              onClick={handleDeleteProject}
              className={btnRed}
            >
              Delete
            </button>
            <button onClick={() => navigate("/gallery")} className={btnGray}>
              Back
            </button>
          </div>
        </div>

        {/* Visualizations */}
        <div className={cardClass}>
          <h2 className="text-xl font-semibold mb-3 text-white">Visualizations</h2>
          <div className="flex flex-col lg:flex-row gap-6">
            {project.final_drawing && (
              <div className="flex-1">
                <h3 className="text-gray-300 mb-1">Final Drawing</h3>
                <img
                  src={getMediaUrl(project.final_drawing)}
                  alt="Final Drawing"
                  className={imgHover}
                  onClick={() =>
                    openImageModal(getMediaUrl(project.final_drawing), "Final Drawing")
                  }
                />
                <div className="mt-2 flex gap-2">
                  <a href={getMediaUrl(project.final_drawing)} download className={btnWhite}>
                    PNG
                  </a>
                  {project.final_drawing_svg && (
                    <a
                      href={getMediaUrl(project.final_drawing_svg)}
                      download
                      className={btnWhite}
                    >
                      SVG
                    </a>
                  )}
                </div>
              </div>
            )}

            {project.natural_lang && (
              <div className="flex-1">
                <h3 className="text-gray-300 mb-1">Natural Language View</h3>
                <img
                  src={getMediaUrl(project.natural_lang)}
                  alt="Natural Language View"
                  className={imgHover}
                  onClick={() =>
                    openImageModal(getMediaUrl(project.natural_lang), "Natural Language View")
                  }
                />
                <div className="mt-2 flex gap-2">
                  <a href={getMediaUrl(project.natural_lang)} download className={btnWhite}>
                    PNG
                  </a>
                  {project.natural_lang_svg && (
                    <a
                      href={getMediaUrl(project.natural_lang_svg)}
                      download
                      className={btnWhite}
                    >
                      SVG
                    </a>
                  )}
                </div>
              </div>
            )}

            {project.wave_comparison && (
              <div className="flex-1">
                <h3 className="text-gray-300 mb-1">Wave Comparison</h3>
                <img
                  src={getMediaUrl(project.wave_comparison)}
                  alt="Wave Comparison"
                  className={imgHover}
                  onClick={() =>
                    openImageModal(getMediaUrl(project.wave_comparison), "Wave Comparison")
                  }
                />
                <div className="mt-2 flex gap-2">
                  <a href={getMediaUrl(project.wave_comparison)} download className={btnWhite}>
                    PNG
                  </a>
                  {project.wave_comparison_svg && (
                    <a
                      href={getMediaUrl(project.wave_comparison_svg)}
                      download
                      className={btnWhite}
                    >
                      SVG
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Audio Files */}
          <div className={cardClass + " lg:w-1/3"}>
            <h2 className="text-xl font-semibold mb-3 text-white">Audio Files</h2>
            {project.modified_file && (
              <div>
                <h6 className="text-gray-300">Modified Audio</h6>
                <audio controls className="w-full mb-2">
                  <source src={getMediaUrl(project.modified_file)} type="audio/wav" />
                </audio>
                <a href={getMediaUrl(project.modified_file)} download className={btnWhite}>
                  Download Modified
                </a>
              </div>
            )}
          </div>

          {/* Project Settings */}
          <div className={cardClass + " lg:w-1/3"}>
            <h2 className="text-xl font-semibold mb-3 text-white">Project Settings</h2>
            <p>
              <span className="text-gray-300">Wave Type:</span>{" "}
              <span className="px-2 py-1 bg-black border border-white/30 rounded">
                {project.wave_type}
              </span>
            </p>
            {project.colors && project.colors.length > 0 && (
              <div className="flex gap-2 mt-2">
                {project.colors.map((c, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded border border-white/30"
                    style={{ backgroundColor: c }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {/* API Access */}
          <div className={cardClass + " lg:w-1/3"}>
            <h2 className="text-xl font-semibold mb-3 text-white">API Access</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${backendUrl}/api/projects/${project.id}/`}
                readOnly
                className="flex-1 bg-black border border-white/30 rounded px-2 py-1 text-gray-200"
              />
              <button
                onClick={() => copyToClipboard(`${backendUrl}/api/projects/${project.id}/`)}
                className={btnWhite}
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {imageModal.show && (
          <div
            className="fixed inset-0 bg-black/90 flex justify-center items-center z-50"
            onClick={closeImageModal}
          >
            <img
              src={imageModal.src}
              alt={imageModal.title}
              className="max-h-[90%] max-w-[90%] border border-white rounded"
            />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ProjectPage;
