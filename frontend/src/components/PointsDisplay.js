import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PointsDisplay.css';

const PointsDisplay = () => {
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const clientId = localStorage.getItem('clientId');
        const response = await axios.get(`http://localhost:5001/clients/${clientId}/points`);
        if (response.data.success) {
          const totalPoints = response.data.points.reduce((sum, p) => sum + p.points, 0);
          setPoints(totalPoints);
        }
      } catch (error) {
        setError('Impossible de récupérer vos points');
      } finally {
        setLoading(false);
      }
    };

    fetchPoints();
  }, []);

  if (loading) return <div className="points-container"><div className="loading">Chargement...</div></div>;
  if (error) return <div className="points-container"><div className="error">{error}</div></div>;

  const nextReward = Math.ceil(points / 100) * 100;
  const progress = (points % 100) / 100 * 100;

  return (
    <div className="points-container">
      <div className="title-container">
        <h2>Vos Points Fidélité</h2>
      </div>

      <div className="points-card">
        <div className="points-total">
          <span className="points-number">{points}</span>
          <span className="points-label">points</span>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {points % 100} points sur {nextReward} pour votre prochaine récompense
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointsDisplay; 