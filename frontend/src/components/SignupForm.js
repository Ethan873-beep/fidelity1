import React, { useState } from 'react';
import axios from 'axios';
import './SignupForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const SignupForm = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/clients`, formData);
      if (response.data.success) {
        // Stocker l'ID client en local sans l'afficher
        localStorage.setItem('clientId', response.data.clientId);
        setMessage('Inscription réussie ! Bienvenue dans notre programme de fidélité.');
        setFormData({ nom: '', email: '' });
        // Rediriger vers la vue principale après 2 secondes
        setTimeout(() => {
          onSignupSuccess();
        }, 2000);
      }
    } catch (error) {
      setMessage('Erreur lors de l\'inscription. Veuillez réessayer.');
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <h2>Bienvenue chez votre boulanger</h2>
        <p className="subtitle">Inscrivez-vous pour commencer à gagner des points fidélité</p>
        <div className="form-group">
          <label htmlFor="nom">Prénom</label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            placeholder="Entrez votre prénom"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Entrez votre email"
          />
        </div>
        <button type="submit">S'inscrire</button>
        {message && <div className="message">{message}</div>}
      </form>
    </div>
  );
};

export default SignupForm; 