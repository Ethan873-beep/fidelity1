const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
const googleSheets = require('../services/googleSheets');

// Route pour créer une nouvelle boulangerie
router.post('/boulangerie', async (req, res) => {
  try {
    const { nom, adresse, pointsParScan } = req.body;
    const id = await googleSheets.addBoulangerie(nom, adresse, pointsParScan);
    
    // Générer le QR code
    const qrData = JSON.stringify({ type: 'scan', boulangerieId: id });
    const qrCodePath = path.join(__dirname, '../../public/qrcodes', `${id}.png`);
    
    await QRCode.toFile(qrCodePath, qrData);
    
    res.json({
      success: true,
      id,
      qrCodeUrl: `/qrcodes/${id}.png`
    });
  } catch (error) {
    console.error('Erreur lors de la création de la boulangerie:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de la boulangerie'
    });
  }
});

// Route pour scanner un QR code
router.post('/scan', async (req, res) => {
  try {
    const { clientId, boulangerieId } = req.body;
    
    if (!clientId || !boulangerieId) {
      return res.status(400).json({
        success: false,
        error: 'clientId et boulangerieId sont requis'
      });
    }

    const result = await googleSheets.recordScan(clientId, boulangerieId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erreur lors du scan:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors du scan'
    });
  }
});

// Route pour obtenir les informations d'une boulangerie
router.get('/boulangerie/:id', async (req, res) => {
  try {
    const boulangerie = await googleSheets.getBoulangerie(req.params.id);
    
    if (!boulangerie) {
      return res.status(404).json({
        success: false,
        error: 'Boulangerie non trouvée'
      });
    }
    
    res.json({
      success: true,
      boulangerie: {
        id: boulangerie[0],
        nom: boulangerie[1],
        adresse: boulangerie[2],
        pointsParScan: boulangerie[3]
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la boulangerie:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la boulangerie'
    });
  }
});

module.exports = router; 