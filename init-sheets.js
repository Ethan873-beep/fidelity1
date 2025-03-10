const { google } = require('googleapis');
const fs = require('fs');

async function initializeSheets() {
  try {
    const credentials = require('./credentials.json');
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1AdUehQOV9snQ8i8JqDUpUmhnp6cJpSvIkNgisMzN51w';

    // Lire les boulangeries depuis le fichier JSON
    const boulangeries = JSON.parse(fs.readFileSync('./boulangeries.json')).boulangeries;

    // Créer ou mettre à jour les onglets
    try {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            { addSheet: { properties: { title: 'Boulangeries' } } },
            { addSheet: { properties: { title: 'Clients' } } },
            { addSheet: { properties: { title: 'Scans' } } }
          ]
        }
      });
      console.log('Onglets créés avec succès');
    } catch (error) {
      console.log('Les onglets existent déjà, mise à jour des données...');
    }

    // Mettre à jour l'onglet Boulangeries
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Boulangeries!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [
          ['ID Boulangerie', 'Nom', 'Adresse', 'Points par Scan'],
          ...boulangeries.map(b => [b.id, b.nom, b.adresse, b.pointsParScan])
        ]
      }
    });
    console.log('Données des boulangeries mises à jour');

    // Préparer l'onglet Clients
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Clients!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [
          ['ID Client', 'Nom', 'Email', 'Points Total', 'Date Inscription']
        ]
      }
    });
    console.log('En-tête des clients mis à jour');

    // Préparer l'onglet Scans
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Scans!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [
          ['ID Client', 'ID Boulangerie', 'Points Gagnés', 'Date Scan']
        ]
      }
    });
    console.log('En-tête des scans mis à jour');

    console.log('\nGoogle Sheets initialisé avec succès !');
    console.log('\nLes QR codes sont dans le dossier qrcodes/ :');
    boulangeries.forEach(b => {
      console.log(`- ${b.nom}: ${b.id}.png`);
    });

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
}

initializeSheets(); 