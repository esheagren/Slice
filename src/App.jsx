import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar.jsx'
import HomePage from './components/HomePage.jsx'
import AboutPage from './components/about/AboutPage.jsx'
import './App.css'

function App() {
  return (
    <Router>
      <NavBar />
      <div className="app-container">
        <div className="animated-background">
          <div className="orb orb1"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
          <div className="dots-container">
            {Array(12).fill().map((_, i) => (
              <div key={i} className="dot" style={{ 
                transform: `rotate(${i * 30}deg) translateX(150px)`,
                animationDelay: `${i * 0.2}s`
              }}></div>
            ))}
          </div>
        </div>

        <div className="main-layout">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<div className="content-page"><h2>Contact</h2></div>} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
