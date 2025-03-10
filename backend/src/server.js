const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const scanRoutes = require('./routes/scan');
const googleSheets = require('./services/googleSheets');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', scanRoutes);

// Route de test
app.get('/test', (req, res) => {
  res.json({ message: 'Le serveur fonctionne correctement!' });
});

// Initialisation des feuilles Google Sheets
const initializeApp = async () => {
  try {
    await googleSheets.initializeSheets();
    console.log('Google Sheets initialisé avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de Google Sheets:', error);
  }
};

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
  initializeApp();
}); 