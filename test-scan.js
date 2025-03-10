const { google } = require('googleapis');
const credentials = require('./credentials.json');

async function testScan() {
  // Configuration de l'authentification
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1AdUehQOV9snQ8i8JqDUpUmhnp6cJpSvIkNgisMzN51w';

  try {
    // Simuler un scan pour un client
    const clientId = 'CLI_001';  // ID du client test
    const boulangerieId = 'BAK001';  // Boulangerie du Coin
    const timestamp = new Date().toISOString();
    const pointsGagnes = 10;

    // 1. Enregistrer le scan
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Scans!A1',
      valueInputOption: 'RAW',
      resource: {
        values: [[clientId, boulangerieId, pointsGagnes, timestamp]]
      }
    });

    // 2. Vérifier si le client existe déjà
    const clientsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Clients!A:E',
    });
    
    const clients = clientsResponse.data.values || [];
    const clientExistant = clients.find(row => row[0] === clientId);
    
    if (clientExistant) {
      // Mettre à jour les points du client
      const rowIndex = clients.findIndex(row => row[0] === clientId) + 1;
      const nouveauxPoints = parseInt(clientExistant[3] || 0) + pointsGagnes;
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Clients!D${rowIndex}`,
        valueInputOption: 'RAW',
        resource: {
          values: [[nouveauxPoints]]
        }
      });
      
      console.log(`Points mis à jour pour le client ${clientId}: ${nouveauxPoints} points`);
    } else {
      // Créer un nouveau client
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Clients!A1',
        valueInputOption: 'RAW',
        resource: {
          values: [[clientId, 'Client Test', 'test@email.com', pointsGagnes, timestamp]]
        }
      });
      
      console.log(`Nouveau client ${clientId} créé avec ${pointsGagnes} points`);
    }

    console.log('Scan enregistré avec succès !');

  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

testScan(); 