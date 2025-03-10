const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const googleSheets = require('./src/services/googleSheets');

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialiser les feuilles Google Sheets au démarrage
(async () => {
  try {
    await googleSheets.initializeSheets();
    console.log('Feuilles Google Sheets initialisées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des feuilles:', error);
  }
})();

// Routes

// 1. Créer un nouveau client
app.post('/clients', async (req, res) => {
  try {
    const { nom, email } = req.body;
    const clientId = await googleSheets.addClient(nom, email);
    res.json({ success: true, clientId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Obtenir les points d'un client
app.get('/clients/:clientId/points', async (req, res) => {
  try {
    const { clientId } = req.params;
    const points = await googleSheets.getAllPointsForClient(clientId);
    res.json({ success: true, points });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Scanner un QR code
app.post('/scans', async (req, res) => {
  try {
    const { clientId, boulangerieId } = req.body;
    const resultat = await googleSheets.recordScan(clientId, boulangerieId);
    res.json({ success: true, ...resultat });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Obtenir les informations d'une boulangerie
app.get('/boulangeries/:boulangerieId', async (req, res) => {
  try {
    const { boulangerieId } = req.params;
    const boulangerie = await googleSheets.getBoulangerie(boulangerieId);
    if (!boulangerie) {
      return res.status(404).json({ success: false, error: 'Boulangerie non trouvée' });
    }
    res.json({ success: true, boulangerie });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Liste de toutes les boulangeries
app.get('/boulangeries', async (req, res) => {
  try {
    const response = await googleSheets.sheets.spreadsheets.values.get({
      spreadsheetId: googleSheets.spreadsheetId,
      range: 'Boulangeries!A2:D'
    });

    const boulangeries = (response.data.values || []).map(row => ({
      id: row[0],
      nom: row[1],
      adresse: row[2],
      pointsParScan: parseInt(row[3])
    }));

    res.json({ success: true, boulangeries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
  console.log('\nEndpoints disponibles:');
  console.log('POST /clients - Créer un nouveau client');
  console.log('GET /clients/:clientId/points - Obtenir les points d\'un client');
  console.log('POST /scans - Enregistrer un scan de QR code');
  console.log('GET /boulangeries - Liste de toutes les boulangeries');
  console.log('GET /boulangeries/:boulangerieId - Obtenir les infos d\'une boulangerie');
}); 