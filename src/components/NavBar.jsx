import React from 'react';
import { Link } from 'react-router-dom';
import luminodeLogo from '../assets/luminodeLogoSmall.png';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={luminodeLogo} alt="Luminode" className="logo-image" />
          Luminode
        </Link>
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-link">
              Contact
            </Link>
          </li>
        </ul>
      </div>
      
      <style jsx>{`
        .navbar {
          background: #0f0f10;
          height: 80px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.2rem;
          position: sticky;
          top: 0;
          z-index: 999;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        
        .navbar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1500px;
          padding: 0 24px;
        }
        
        .navbar-logo {
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-self: start;
          cursor: pointer;
          text-decoration: none;
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        .logo-image {
          height: 60px;
          width: auto;
          margin-right: 12px;
        }
        
        .nav-menu {
          display: flex;
          align-items: center;
          list-style: none;
          text-align: center;
          margin-right: 24px;
        }
        
        .nav-item {
          height: 80px;
          position: relative;
        }
        
        .nav-link {
          color: #f8fafc;
          display: flex;
          align-items: center;
          text-decoration: none;
          padding: 0 16px;
          height: 100%;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .nav-link:hover {
          color: #FF9D42;
        }
        
        .nav-link:after {
          content: '';
          position: absolute;
          width: 0;
          height: 3px;
          bottom: 20px;
          left: 50%;
          background: linear-gradient(90deg, #FF9D42 0%, #FFC837 100%);
          transition: all 0.3s ease;
          transform: translateX(-50%);
          border-radius: 3px;
        }
        
        .nav-link:hover:after {
          width: 60%;
        }
      `}</style>
    </nav>
  );
};

export default NavBar; 