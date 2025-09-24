import React, { useState, useRef, useEffect } from "react";
import { FaPlusCircle, FaArrowLeft, FaRocket } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function CreateProject({
  colorPalette = {
    "Black": "#000000", "Electric Blue": "#0000FF", "Neon Purple": "#BF00FF",
    "Bright Cyan": "#00FFFF", "Vibrant Magenta": "#FF00FF", "Neon Green": "#39FF14",
    "Hot Pink": "#FF69B4", "Neon Orange": "#FF4500", "Bright Yellow": "#FFFF00",
    "Electric Lime": "#CCFF00", "Vivid Red": "#FF0000", "Deep Sky Blue": "#00BFFF",
    "Vivid Violet": "#9F00FF", "Fluorescent Pink": "#FF1493", "Laser Lemon": "#FFFF66",
    "Screamin' Green": "#66FF66", "Ultra Red": "#FF2400", "Radical Red": "#FF355E",
    "Vivid Orange": "#FFA500", "Electric Indigo": "#6F00FF"
  },
}) {
  const navigate = useNavigate();

  const [waveType, setWaveType] = useState("uploaded");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [frequency, setFrequency] = useState(440);
  const [samplesPerWave, setSamplesPerWave] = useState(100);
  const [periods, setPeriods] = useState(10);

  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [positiveColor, setPositiveColor] = useState("#00FF00");
  const [negativeColor, setNegativeColor] = useState("#00FF00");

  const [loading, setLoading] = useState(false);
  const selectedColorField = useRef("positive");
  const wavePreviewRef = useRef(null);

  // Wave preview update effect
  useEffect(() => {
    if (waveType !== "uploaded") {
      updateWavePreview();
    }
  }, [waveType, frequency, samplesPerWave, periods]);

  // Wave preview generation function
  const updateWavePreview = () => {
    const canvas = wavePreviewRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    ctx.strokeStyle = '#58A6FF';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const samples = samplesPerWave * periods;
    const amplitude = canvas.height / 4;
    const centerY = canvas.height / 2;

    for (let i = 0; i < samples; i++) {
      const x = (i / samples) * canvas.width;
      let y = centerY;

      const phase = (i / samplesPerWave) * 2 * Math.PI;

      switch (waveType) {
        case 'sine':
          y = centerY + amplitude * Math.sin(phase);
          break;
        case 'square':
          y = centerY + amplitude * Math.sign(Math.sin(phase));
          break;
        case 'triangle':
          y = centerY + amplitude * (2 / Math.PI) * Math.asin(Math.sin(phase));
          break;
        case 'sawtooth':
          y = centerY + amplitude * (2 * (phase / (2 * Math.PI) - Math.floor(0.5 + phase / (2 * Math.PI))));
          break;
      }

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // Add grid
    ctx.strokeStyle = 'rgba(88, 166, 255, 0.1)';
    ctx.lineWidth = 1;

    // Horizontal lines
    for (let i = 1; i < 4; i++) {
      const y = (canvas.height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 1; i < periods; i++) {
      const x = (canvas.width / periods) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (waveType === "uploaded" && !audioFile) {
      alert("Please select an audio file to upload.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("wave_type", waveType);

      if (waveType === "uploaded" && audioFile) {
        formData.append("original_file", audioFile);
      } else {
        // Send wave parameters as JSON object
        const waveParams = {
          freq: frequency,
          spw: samplesPerWave,
          periods: periods
        };
        formData.append("wave_parameters", JSON.stringify(waveParams));
      }

      formData.append("background_color", backgroundColor);
      formData.append("positive_color", positiveColor);
      formData.append("negative_color", negativeColor);

      const res = await fetch("http://localhost:8000/api/projects/create/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error:", errorData);
        alert(`Error creating project: ${JSON.stringify(errorData)}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      console.log("Project created:", data);

      alert("Project created successfully! You will be redirected to the project page.");
      navigate(`/project/${data.id}`);
    } catch (err) {
      console.error("Error submitting project:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const applyPresetColor = (hex) => {
    if (selectedColorField.current === "background") setBackgroundColor(hex);
    if (selectedColorField.current === "positive") setPositiveColor(hex);
    if (selectedColorField.current === "negative") setNegativeColor(hex);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-black px-6 py-10 flex justify-center">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <FaPlusCircle /> Create New Audio Project
            </h3>
            <p className="text-gray-600">
              Configure project details, upload audio or generate waves, and customize your visualization colors.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Info Card */}
            <Card title="Project Info">
              <div className="grid md:grid-cols-2 gap-4">
                <TextInput label="Project Name" value={name} setValue={setName} required />
                <SelectInput label="Audio Source" value={waveType} setValue={setWaveType} />
              </div>
              <div className="mt-4">
                <TextArea label="Description" value={description} setValue={setDescription} />
              </div>
            </Card>

            {/* Audio Upload / Wave Parameters */}
            <Card title="Audio Input">
              {waveType === "uploaded" ? (
                <div>
                  <label className="block text-gray-300 mb-1">Audio File</label>
                  <input
                    type="file"
                    accept=".wav,.mp3,.flac"
                    onChange={(e) => setAudioFile(e.target.files[0])}
                    className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 
                      file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    required
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    Supported formats: WAV, MP3, FLAC. Max size: 50MB
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <NumberInput label="Frequency (Hz)" value={frequency} setValue={setFrequency} />
                    <NumberInput label="Samples per Wave" value={samplesPerWave} setValue={setSamplesPerWave} />
                    <NumberInput label="Number of Periods" value={periods} setValue={setPeriods} />
                  </div>

                  {/* Wave Preview */}
                  <div className="mt-4">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h6 className="text-blue-400 font-medium">Wave Preview</h6>
                        <button
                          type="button"
                          onClick={updateWavePreview}
                          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                        >
                          Update Preview
                        </button>
                      </div>
                      <canvas
                        ref={wavePreviewRef}
                        className="w-full bg-gray-900 rounded border border-gray-700"
                        style={{ height: "200px" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Color Settings */}
            <Card title="Visualization Colors">
              <div className="grid md:grid-cols-3 gap-4">
                <ColorPicker
                  label="Background"
                  value={backgroundColor}
                  onFocus={() => (selectedColorField.current = "background")}
                  onChange={setBackgroundColor}
                />
                <ColorPicker
                  label="Positive"
                  value={positiveColor}
                  onFocus={() => (selectedColorField.current = "positive")}
                  onChange={setPositiveColor}
                />
                <ColorPicker
                  label="Negative"
                  value={negativeColor}
                  onFocus={() => (selectedColorField.current = "negative")}
                  onChange={setNegativeColor}
                />
              </div>

              <div className="mt-4">
                <h6 className="text-gray-400 mb-2">Color Presets:</h6>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(colorPalette).map(([name, hex]) => (
                    <button
                      key={name}
                      type="button"
                      className="w-8 h-8 rounded-full border border-gray-600 hover:scale-110 transition"
                      style={{ backgroundColor: hex }}
                      title={name}
                      onClick={() => applyPresetColor(hex)}
                    ></button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <button
                type="button"
                onClick={() => navigate("/gallery")}
                className="px-4 py-2 border border-gray-500 text-gray-500 rounded-lg hover:bg-gray-800 transition"
              >
                <FaArrowLeft className="inline mr-2" /> Back to Gallery
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transform hover:scale-105 transition"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <FaRocket />}
                {loading ? "Creating Project..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

/* ---------- Reusable Components ---------- */
function Card({ title, children }) {
  return (
    <div className="bg-gray-900 rounded-2xl shadow-lg p-6 hover:shadow-2xl transition">
      <h4 className="text-lg font-semibold text-gray-200 mb-4">{title}</h4>
      {children}
    </div>
  );
}

function TextInput({ label, value, setValue, required }) {
  return (
    <div>
      <label className="block text-gray-300 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg bg-gray-800 border border-gray-700 p-2 text-white 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        required={required}
      />
    </div>
  );
}

function TextArea({ label, value, setValue }) {
  return (
    <div>
      <label className="block text-gray-300 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={3}
        className="w-full rounded-lg bg-gray-800 border border-gray-700 p-2 text-white 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Optional description of your project"
      />
    </div>
  );
}

function SelectInput({ label, value, setValue }) {
  return (
    <div>
      <label className="block text-gray-300 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg bg-gray-800 border border-gray-700 p-2 text-white 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="uploaded">Upload Audio File</option>
        <option value="sine">Sine Wave</option>
        <option value="square">Square Wave</option>
        <option value="triangle">Triangle Wave</option>
        <option value="sawtooth">Sawtooth Wave</option>
      </select>
    </div>
  );
}

function NumberInput({ label, value, setValue }) {
  return (
    <div>
      <label className="block text-gray-300 mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg bg-gray-800 border border-gray-700 p-2 text-white 
          focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function ColorPicker({ label, value, onChange, onFocus }) {
  return (
    <div>
      <label className="block text-gray-300 mb-1">{label} Color</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 p-0 border border-gray-700 rounded"
        />
        <input
          type="text"
          value={value}
          onFocus={onFocus}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-lg bg-gray-800 border border-gray-700 p-2 text-white 
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
    </div>
  );
}
