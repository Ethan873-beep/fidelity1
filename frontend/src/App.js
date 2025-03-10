import React, { useState } from 'react';
import SignupForm from './components/SignupForm';
import QRScanner from './components/QRScanner';
import PointsDisplay from './components/PointsDisplay';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('points');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('clientId'));

  if (!isLoggedIn) {
    return <SignupForm onSignupSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="App">
      <div className="nav-buttons">
        <button 
          className={`nav-button ${currentView === 'scan' ? 'active' : ''}`}
          onClick={() => setCurrentView('scan')}
        >
          Scanner
        </button>
        <button 
          className={`nav-button ${currentView === 'points' ? 'active' : ''}`}
          onClick={() => setCurrentView('points')}
        >
          Mes Points
        </button>
      </div>

      {currentView === 'scan' ? <QRScanner /> : <PointsDisplay />}
    </div>
  );
}

export default App; 