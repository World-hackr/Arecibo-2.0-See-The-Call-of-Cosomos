import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Gallery from './components/Gallery';
import CreateProject from './components/CreateProject';
import ProjectPage from './components/ProjectPage';
import VisualizerPage from './components/VisualizerPage';




function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="create" element={<CreateProject />} />
        <Route path="project/:id" element={<ProjectPage />} />
        <Route path="/visualize/:id" element={<VisualizerPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
