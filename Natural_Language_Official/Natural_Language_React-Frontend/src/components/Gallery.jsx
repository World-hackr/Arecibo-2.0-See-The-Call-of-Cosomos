import React, { useEffect, useState, createContext, useContext } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaEye,
  FaChartLine,
  FaTrash,
  FaSpinner,
  FaSun,
  FaMoon,
  FaSquare,
} from "react-icons/fa";

// ----------------- THEME CONTEXT -----------------
const ThemeContext = createContext();
export function useTheme() {
  return useContext(ThemeContext);
}
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark", "monochrome");
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : theme === "monochrome" ? "bg-gray-100 text-black filter grayscale" : "bg-white text-black"}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded ${theme === "light" ? "bg-black text-white" : "bg-gray-100 text-black"}`}
      >
        <FaSun />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded ${theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100"}`}
      >
        <FaMoon />
      </button>
      <button
        onClick={() => setTheme("monochrome")}
        className={`p-2 rounded ${theme === "monochrome" ? "bg-black text-white" : "bg-gray-100 text-black"}`}
      >
        <FaSquare />
      </button>
    </div>
  );
}

// ----------------- MAIN GALLERY -----------------
export default function Gallery() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const navigate = useNavigate();
  const backendUrl = "http://localhost:8000";

  // ----------------- API -----------------
  const fetchProjects = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${backendUrl}/api/projects/?page=${pageNum}`);
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();

      setProjects(data.results || []);
      setFilteredProjects(data.results || []);
      setTotalPages(data.total_pages || 1);
      setTotalProjects(data.total_projects || 0);
      setPage(pageNum);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(page);
  }, [page]);

  // Auto-refresh if processing
  useEffect(() => {
    const hasProcessing = projects.some((p) => p.is_processing);
    if (hasProcessing) {
      const interval = setInterval(() => {
        fetchProjects(page);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [projects, page]);

  // ----------------- SEARCH -----------------
  useEffect(() => {
    if (!search.trim()) {
      setFilteredProjects(projects);
    } else {
      const q = search.toLowerCase();
      setFilteredProjects(
        projects.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.wave_type && p.wave_type.toLowerCase().includes(q))
        )
      );
    }
  }, [search, projects]);

  // ----------------- ACTIONS -----------------
  const handleViewProject = (id) => navigate(`/project/${id}`);
  const handleVisualizeProject = (id) => navigate(`/visualize/${id}`);
  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${backendUrl}/api/projects/${id}/delete/`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Deleted!");
        fetchProjects(page);
      } else {
        alert("Failed to delete project.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting project.");
    }
  };

  // ----------------- UI HELPERS -----------------
  

  // ----------------- RENDER -----------------
  return (
    <ThemeProvider>
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Research Projects{" "}
              <span className="text-gray-500">({totalProjects})</span>
            </h1>
            <p className="text-gray-500">
              Radio astronomy data analysis and visualization projects
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800"
              onClick={() => navigate("/create")}
            >
              <FaPlus /> New Project
            </button>
          </div>
        </div>

        {/* Search & View Mode */}
        <div className="flex items-center gap-3 mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="flex-1 border px-4 py-2 rounded-lg"
          />
          <button
            onClick={() => setViewMode("grid")}
            className={`border px-3 py-2 rounded-lg ${viewMode === "grid" ? "bg-black" : "hover:bg-gray-100"
              }`}
          >
            ⬜
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`border px-3 py-2 rounded-lg ${viewMode === "list" ? "bg-black text-white" : "hover:bg-gray-100"
              }`}
          >
            ☰
          </button>
        </div>

        {/* Loader */}
        {loading && (
          <div className="text-center py-20 text-gray-400">
            <FaSpinner className="animate-spin mx-auto text-6xl mb-4" />
            <h3 className="text-2xl">Loading projects...</h3>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20 text-red-500">
            <h3 className="text-2xl mb-2">{error}</h3>
          </div>
        )}

        {/* Projects */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }
          >
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`bg-white border rounded-lg shadow hover:shadow-lg overflow-hidden ${viewMode === "list" 
                  }`}
              >
                {/* Status */}
                

                {/* Preview */}
                {project.final_drawing ? (
                  <img
                    src={`${backendUrl}${project.final_drawing}`}
                    alt="Wave visualization"
                    className={`${viewMode === "list"
                      ? "w-full h-auto object-cover"
                      : "w-full h-35 object-cover"
                      }`}
                    onClick={() => window.open(`${backendUrl}${project.final_drawing}`, '_blank')}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    className={`${viewMode === "list"
                      ? "w-48 h-32"
                      : "w-full h-40"
                      } bg-gray-200 flex items-center justify-center text-gray-500`}
                  >
                    No Preview
                  </div>
                )}

                {/* Info */}
                <div className="p-4 flex-1">
                  <h3 className="font-semibold text-lg">{project.name}</h3>
                  <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                    <span className="border px-2 py-0.5 rounded">
                      {project.get_wave_type_display || project.wave_type}
                    </span>
                    <span>
                      {new Date(project.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex gap-2 mt-4 border-t pt-4">
                    <button
                      onClick={() => handleViewProject(project.id)}
                      className="flex-1 bg-black text-white px-3 py-2 rounded hover:bg-gray-800 flex items-center justify-center gap-2"
                    >
                      <FaEye /> View
                    </button>
                    {!project.is_processing && (
                      <button
                        onClick={() => handleVisualizeProject(project.id)}
                        className="flex-1 border px-3 py-2 rounded hover:bg-gray-100 flex items-center justify-center gap-2"
                      >
                        <FaChartLine /> Analyze
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      className="flex-1 border border-red-500 text-red-500 px-3 py-2 rounded hover:bg-red-500 hover:text-white flex items-center justify-center gap-2"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <h3 className="text-2xl mb-2">No projects found</h3>
            <p className="mb-4">Try a different search or create a new one!</p>
            <button
              className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto hover:bg-gray-800"
              onClick={() => navigate("/create")}
            >
              <FaPlus /> Create Project
            </button>
          </div>
        )}
      </div>


    </ThemeProvider>
  );
}
