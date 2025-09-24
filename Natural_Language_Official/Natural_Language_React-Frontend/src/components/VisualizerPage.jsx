import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function VisualizerPage() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const waveformRef = useRef(null);
  const envelopeRef = useRef(null);
  const audioOriginalRef = useRef(null);
  const audioModifiedRef = useRef(null);

  const [project, setProject] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [envelopePos, setEnvelopePos] = useState([]);
  const [envelopeNeg, setEnvelopeNeg] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [envelopeHistory, setEnvelopeHistory] = useState([]);
  const [prevIdx, setPrevIdx] = useState(null);
  const [numPoints, setNumPoints] = useState(0);
  const [audioContext, setAudioContext] = useState(null);

  const backendUrl = "http://localhost:8000";

  // Initialize audio context
  useEffect(() => {
    const initAudioContext = () => {
      try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(context);
      } catch (error) {
        console.error('Audio context not supported:', error);
      }
    };
    
    initAudioContext();
    
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Stop all audio
  const stopAllAudio = () => {
    // Stop original audio
    if (audioOriginalRef.current) {
      audioOriginalRef.current.pause();
      audioOriginalRef.current.currentTime = 0;
    }
    
    // Stop modified audio
    if (audioModifiedRef.current) {
      audioModifiedRef.current.pause();
      audioModifiedRef.current.currentTime = 0;
    }
    
    // Stop any Web Audio API sources by recreating the context
    if (audioContext) {
      audioContext.close().then(() => {
        const newContext = new (window.AudioContext || window.webkitAudioContext)();
        setAudioContext(newContext);
      });
    }
  };
  const generateModifiedAudio = () => {
    if (!audioContext || !audioData || !audioData.audio_data) {
      console.error('Audio context or data not available');
      return null;
    }

    const sampleRate = audioData.sample_rate || 44100;
    const audioArray = audioData.audio_data;
    
    // Create modified audio by applying envelope - EXACTLY like Django script
    const modifiedAudio = audioArray.map((sample, i) => {
      // Apply envelope modification based on sample polarity (like Django)
      if (sample > 0) {
        // Positive sample - apply positive envelope with offset
        return (envelopePos[i] || 0) + 0.0; // offset is 0.0 like Django
      } else {
        // Negative sample - apply negative envelope with offset  
        return (envelopeNeg[i] || 0) + 0.0; // offset is 0.0 like Django
      }
    });

    // Create audio buffer
    const buffer = audioContext.createBuffer(1, modifiedAudio.length, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Normalize and clamp values like Django script
    for (let i = 0; i < modifiedAudio.length; i++) {
      channelData[i] = Math.max(-1, Math.min(1, modifiedAudio[i]));
    }
    
    return buffer;
  };

  // Play modified audio
  const playModifiedAudio = () => {
    if (!audioContext) {
      console.error('Audio context not available');
      return;
    }

    try {
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const buffer = generateModifiedAudio();
      if (!buffer) {
        console.error('Could not generate modified audio');
        return;
      }

      // Create and play audio source
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      console.log('Playing modified audio...');
    } catch (error) {
      console.error('Error playing modified audio:', error);
    }
  };

  // Helper function to get mouse position relative to canvas
  const getMousePos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  // Save current envelope state to history for undo functionality
  const saveToHistory = () => {
    setEnvelopeHistory(prev => [...prev, { pos: [...envelopePos], neg: [...envelopeNeg] }]);
  };

  // Undo last envelope change
  const undoEnvelope = () => {
    if (envelopeHistory.length > 0) {
      const lastState = envelopeHistory[envelopeHistory.length - 1];
      setEnvelopePos(lastState.pos);
      setEnvelopeNeg(lastState.neg);
      setEnvelopeHistory(prev => prev.slice(0, -1));
    }
  };

  // Reset envelope to original state
  const resetEnvelope = () => {
    if (audioData) {
      saveToHistory();
      setEnvelopePos(audioData.envelope_pos || []);
      setEnvelopeNeg(audioData.envelope_neg || []);
    }
  };

  // Handle mouse events for envelope editing - matching Django implementation
  const handleMouseDown = (event) => {
    const canvas = envelopeRef.current;
    if (!canvas || !audioData) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Check if mouse is within canvas bounds
    if (mouseX < 0 || mouseX >= canvas.width || mouseY < 0 || mouseY >= canvas.height) {
      return;
    }
    
    setIsDrawing(true);
    saveToHistory();
    setPrevIdx(null);
    
    // Convert mouse position to data index
    const scaleX = numPoints / (canvas.width * zoom);
    const idx = Math.floor((mouseX + pan) * scaleX);
    
    if (idx >= 0 && idx < numPoints) {
      updateDrawing(event);
    }
  };

  const handleMouseMove = (event) => {
    if (isDrawing) {
      updateDrawing(event);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setPrevIdx(null);
  };

  // Core drawing function - replicating Django's update_drawing method EXACTLY
  const updateDrawing = (event) => {
    const canvas = envelopeRef.current;
    if (!canvas || !audioData) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Convert mouse position to data coordinates
    const scaleX = numPoints / (canvas.width * zoom);
    const centerY = canvas.height / 2;
    const scaleY = centerY * 0.8;
    
    const idx = Math.floor((mouseX + pan) * scaleX);
    const amp = (centerY - mouseY) / scaleY; // This gives signed amplitude
    
    if (idx < 0 || idx >= numPoints) return;
    
    // Clone arrays for modification
    const newEnvPos = [...envelopePos];
    const newEnvNeg = [...envelopeNeg];
    
    // Choose envelope based on amplitude sign (EXACTLY like Django)
    const targetEnvelope = amp >= 0 ? newEnvPos : newEnvNeg;
    
    // Interpolation between points if drawing continuously - EXACTLY like Django
    if (prevIdx !== null && idx !== prevIdx) {
      let startIdx = prevIdx;
      let endIdx = idx;
      let startVal, endVal;
      
      if (startIdx > endIdx) {
        [startIdx, endIdx] = [endIdx, startIdx];
        startVal = amp;
        endVal = targetEnvelope[prevIdx];
      } else {
        startVal = targetEnvelope[prevIdx];
        endVal = amp;
      }
      
      // Linear interpolation between points
      for (let i = startIdx; i <= endIdx; i++) {
        const t = endIdx === startIdx ? 0 : (i - startIdx) / (endIdx - startIdx);
        const interpolatedValue = startVal + t * (endVal - startVal);
        
        // Store values in correct envelope based on their sign
        if (interpolatedValue >= 0) {
          newEnvPos[i] = interpolatedValue;
        } else {
          newEnvNeg[i] = interpolatedValue;
        }
      }
    } else {
      // Single point - store directly in the target envelope
      targetEnvelope[idx] = amp;
    }
    
    setPrevIdx(idx);
    setEnvelopePos(newEnvPos);
    setEnvelopeNeg(newEnvNeg);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === 'u') {
        undoEnvelope();
      } else if (event.key.toLowerCase() === 'r') {
        resetEnvelope();
      } else if (event.key.toLowerCase() === 'p') {
        playModifiedAudio();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [envelopeHistory, audioData]);

  // Fetch project data and audio data from API
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch project details
        const projectResponse = await axios.get(`${backendUrl}/api/projects/${projectId}/`);
        setProject(projectResponse.data);
        
        // Fetch audio data for visualization
        const audioResponse = await axios.get(`${backendUrl}/api/projects/${projectId}/audio-data/`);
        setAudioData(audioResponse.data);
        setEnvelopePos(audioResponse.data.envelope_pos || []);
        setEnvelopeNeg(audioResponse.data.envelope_neg || []);
        setNumPoints(audioResponse.data.audio_data.length);
        
      } catch (err) {
        console.error("Failed to fetch project data", err);
        alert("Failed to load project data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Draw waveform
  useEffect(() => {
    if (!audioData || !waveformRef.current) return;
    const canvas = waveformRef.current;
    const ctx = canvas.getContext("2d");

    // Resize fix
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#3b82f6"; // blue
    ctx.beginPath();

    const { audio_data } = audioData;
    const step = Math.ceil(audio_data.length / canvas.width);
    const amp = canvas.height / 2;

    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = audio_data[i * step + j];
        if (datum !== undefined) {
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
      }
      ctx.moveTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();
  }, [audioData, zoom, pan]);

  // Draw envelope - matching Django implementation
  useEffect(() => {
    if (!audioData || !envelopeRef.current) return;
    
    const canvas = envelopeRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Fill background with project background color
    ctx.fillStyle = project?.background_color || '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerY = canvas.height / 2;
    const scaleX = (canvas.width * zoom) / numPoints;
    const scaleY = centerY * 0.8;
    const offset = 0.0; // Like Django script

    // Draw original waveform faintly (like Django script)
    ctx.strokeStyle = 'rgba(64, 128, 255, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < audioData.audio_data.length; i++) {
      const x = i * scaleX - pan;
      const y = centerY - audioData.audio_data[i] * scaleY;
      if (x >= 0 && x <= canvas.width) {
        if (i === 0 || (i > 0 && (i-1) * scaleX - pan < 0)) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
    }
    ctx.stroke();

    // Draw positive envelope (like Django script)
    ctx.strokeStyle = project?.positive_color || '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < envelopePos.length; i++) {
      const x = i * scaleX - pan;
      const y = centerY - (envelopePos[i] + offset) * scaleY;
      if (x >= 0 && x <= canvas.width) {
        if (i === 0 || (i > 0 && (i-1) * scaleX - pan < 0)) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
    }
    ctx.stroke();

    // Draw negative envelope (EXACTLY like Django script)
    ctx.strokeStyle = project?.negative_color || '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < envelopeNeg.length; i++) {
      const x = i * scaleX - pan;
      const y = centerY - (envelopeNeg[i] + offset) * scaleY; // Same formula as positive!
      if (x >= 0 && x <= canvas.width) {
        if (i === 0 || (i > 0 && (i-1) * scaleX - pan < 0)) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
    }
    ctx.stroke();
  }, [audioData, envelopePos, envelopeNeg, zoom, pan, project]);

  // Save envelope API
  const saveEnvelope = async () => {
    try {
      setSaving(true);
      
      await axios.put(`${backendUrl}/api/projects/${projectId}/envelope/`, {
        envelope_data: {
          positive: envelopePos,
          negative: envelopeNeg,
        }
      });
      
      alert("Envelope saved successfully! Project is being reprocessed.");
      
      // Refresh project data after save
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save envelope. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Export functions - matching Django implementation
  const exportPNG = () => {
    try {
      const canvas = envelopeRef.current;
      if (!canvas) {
        alert('Canvas not available for export');
        return;
      }

      // Create download link
      const link = document.createElement('a');
      link.download = `project_${projectId}_envelope.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('PNG exported successfully!');
    } catch (error) {
      console.error('PNG export failed:', error);
      alert('Failed to export PNG');
    }
  };

  const exportSVG = () => {
    try {
      if (!audioData || !project) {
        alert('Data not available for SVG export');
        return;
      }

      const canvas = envelopeRef.current;
      const width = canvas.width;
      const height = canvas.height + 40;
      
      let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${project.background_color || '#000000'}"/>
  <text x="10" y="25" font-family="Arial" font-size="16" fill="white">Project: ${project.name} - Envelope Visualization Export</text>
  <g transform="translate(0, 40)">`;
      
      // Add envelope data as SVG paths
      if (audioData.audio_data.length > 0) {
        const scaleX = width / audioData.audio_data.length;
        const centerY = canvas.height / 2;
        const scaleY = centerY * 0.8;
        const offset = 0.0;
        
        // Original waveform (faint)
        svg += `<path d="M`;
        for (let i = 0; i < audioData.audio_data.length; i++) {
          const x = i * scaleX;
          const y = centerY - audioData.audio_data[i] * scaleY;
          svg += `${i === 0 ? '' : 'L'}${x},${y}`;
        }
        svg += `" stroke="rgba(64,128,255,0.15)" stroke-width="1" fill="none"/>`;
        
        // Positive envelope
        svg += `<path d="M`;
        for (let i = 0; i < envelopePos.length; i++) {
          const x = i * scaleX;
          const y = centerY - (envelopePos[i] + offset) * scaleY;
          svg += `${i === 0 ? '' : 'L'}${x},${y}`;
        }
        svg += `" stroke="${project.positive_color || '#22c55e'}" stroke-width="3" fill="none"/>`;
        
        // Negative envelope
        svg += `<path d="M`;
        for (let i = 0; i < envelopeNeg.length; i++) {
          const x = i * scaleX;
          const y = centerY + (envelopeNeg[i] + offset) * scaleY;
          svg += `${i === 0 ? '' : 'L'}${x},${y}`;
        }
        svg += `" stroke="${project.negative_color || '#ef4444'}" stroke-width="3" fill="none"/>`;
      }
      
      svg += `  </g>
</svg>`;

      // Create and download SVG file
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `project_${projectId}_envelope.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
      console.log('SVG exported successfully!');
    } catch (error) {
      console.error('SVG export failed:', error);
      alert('Failed to export SVG');
    }
  };

  const exportAudio = () => {
    try {
      console.log('Preparing audio export...');
      
      if (!project) {
        alert('No project data available for export');
        return;
      }
      
      let hasDownloads = false;
      
      // Download original audio if available
      if (project.original_file) {
        const link1 = document.createElement('a');
        link1.download = `project_${projectId}_original.wav`;
        link1.href = `${backendUrl}${project.original_file}`;
        link1.style.display = 'none';
        document.body.appendChild(link1);
        link1.click();
        document.body.removeChild(link1);
        hasDownloads = true;
      }
      
      // Download modified audio if available
      if (project.modified_file) {
        const link2 = document.createElement('a');
        link2.download = `project_${projectId}_modified.wav`;
        link2.href = `${backendUrl}${project.modified_file}`;
        link2.style.display = 'none';
        document.body.appendChild(link2);
        link2.click();
        document.body.removeChild(link2);
        hasDownloads = true;
      }
      
      if (hasDownloads) {
        console.log('Audio files downloaded!');
      } else {
        alert('No audio files available for download');
      }
    } catch (error) {
      console.error('Audio export failed:', error);
      alert('Failed to export audio files');
    }
  };

  if (loading) {
    return (
      
      <div className="p-6 space-y-6 bg-gray-100 min-h-screen dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading visualizer...</p>
        </div>
      </div>
    );
  }

  if (!project || !audioData) {
    return (
      <div className="p-6 space-y-6 bg-gray-100 min-h-screen dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load project data</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Navbar />
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen dark:bg-gray-900">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Interactive Visualizer
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Project: {project.name} | {project.get_wave_type_display}
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-2xl bg-gray-200 hover:bg-gray-300 
                     text-gray-800 dark:bg-gray-700 dark:text-gray-100 
                     dark:hover:bg-gray-600 transition shadow-sm"
          onClick={() => navigate(`/project/${projectId}`)}
        >
          ← Back to Project
        </button>
      </div>

      {/* Canvas Section */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <h5 className="font-semibold text-gray-700 dark:text-gray-200">
              Interactive Envelope Editor
            </h5>
            <div className="flex items-center gap-4">
              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Zoom:</label>
                <button 
                  onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  -
                </button>
                <span className="text-sm min-w-12 text-center">{zoom.toFixed(1)}x</span>
                <button 
                  onClick={() => setZoom(prev => Math.min(5, prev + 0.1))}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  +
                </button>
                <button 
                  onClick={() => setZoom(1)}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Reset
                </button>
              </div>
              
              {/* Pan Controls */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Pan:</label>
                <button 
                  onClick={() => setPan(prev => Math.max(0, prev - 100))}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  ←
                </button>
                <button 
                  onClick={() => setPan(prev => Math.min(numPoints - 100, prev + 100))}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  →
                </button>
                <button 
                  onClick={() => setPan(0)}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Reset
                </button>
              </div>
              
              <small className="text-gray-500 dark:text-gray-400">
                Click + drag to edit (P=Preview, R=Reset, U=Undo)
              </small>
            </div>
          </div>
          <canvas
            ref={envelopeRef}
            className="w-full  mt-6 mx-auto rounded-lg border dark:border-gray-700 
                       bg-gray-50 dark:bg-gray-900 cursor-crosshair max-w-[1600px] h-[32rem]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-6 flex flex-wrap gap-4 justify-between">
        <div className="flex gap-3">
          <button 
            className="px-4 py-2 rounded-2xl border shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={playModifiedAudio}
          >
            Preview (P)
          </button>
          <button 
            className="px-4 py-2 rounded-2xl border shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={undoEnvelope}
            disabled={envelopeHistory.length === 0}
          >
            Undo (U)
          </button>
          <button 
            className="px-4 py-2 rounded-2xl border shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={resetEnvelope}
          >
            Reset (R)
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => audioOriginalRef.current?.play()}
            className="px-4 py-2 rounded-2xl border shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Play Original
          </button>
          <button
            onClick={playModifiedAudio}
            className="px-4 py-2 rounded-2xl border shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Play Modified
          </button>
          <button
            onClick={stopAllAudio}
            className="px-4 py-2 rounded-2xl border shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Stop
          </button>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={exportPNG}
            className="px-4 py-2 rounded-2xl shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Export PNG
          </button>
          <button 
            onClick={exportSVG}
            className="px-4 py-2 rounded-2xl shadow-sm bg-green-600 text-white hover:bg-green-700 transition"
          >
            Export SVG
          </button>
          <button 
            onClick={exportAudio}
            className="px-4 py-2 rounded-2xl border shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Export Audio
          </button>
          <button
            onClick={saveEnvelope}
            disabled={saving}
            className="px-4 py-2 rounded-2xl shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Envelope & Regenerate"}
          </button>
        </div>
      </div>

      {/* Hidden audio elements */}
      <audio ref={audioOriginalRef} preload="auto" style={{ display: "none" }}>
        {project.original_file && (
          <source src={`${backendUrl}${project.original_file}`} />
        )}
      </audio>
      <audio ref={audioModifiedRef} preload="auto" style={{ display: "none" }}>
        {project.modified_file && (
          <source src={`${backendUrl}${project.modified_file}`} />
        )}
      </audio>
    </div>
    {/* <Footer /> */}
    </>
  );
}
