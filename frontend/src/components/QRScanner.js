import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import axios from 'axios';
import './QRScanner.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState('');

  const handleScan = async (data) => {
    if (data) {
      try {
        const response = await axios.post(`${API_URL}/scans`, {
          clientId: localStorage.getItem('clientId'),
          boulangerieId: data.text
        });

        if (response.data.success) {
          setMessage(`Félicitations ! Vous avez gagné ${response.data.pointsGagnes} points chez ${response.data.nomBoulangerie}`);
        }
        setScanning(false);
      } catch (error) {
        setMessage('Erreur lors du scan. Veuillez réessayer.');
        setScanning(false);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    setMessage('Erreur de la caméra. Veuillez réessayer.');
    setScanning(false);
  };

  return (
    <div className="scanner-container">
      <div className="title-container">
        <h2>Scanner votre QR Code</h2>
      </div>
      
      {!scanning ? (
        <button 
          className="scan-button"
          onClick={() => setScanning(true)}
        >
          <div className="scan-icon"></div>
          <span className="scan-text">Scanner un QR Code</span>
        </button>
      ) : (
        <div className="scanner-wrapper">
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan}
            style={{ width: '100%' }}
          />
          <button 
            className="cancel-button"
            onClick={() => setScanning(false)}
          >
            Annuler
          </button>
        </div>
      )}

      {message && (
        <div className="message">
          {message}
        </div>
      )}
    </div>
  );
};

export default QRScanner; 