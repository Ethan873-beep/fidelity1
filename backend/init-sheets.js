const googleSheets = require('./src/services/googleSheets');

async function initializeSheets() {
  try {
    // Créer un onglet temporaire
    await googleSheets.sheets.spreadsheets.batchUpdate({
      spreadsheetId: googleSheets.spreadsheetId,
      resource: {
        requests: [{
          addSheet: {
            properties: {
              title: 'Temp'
            }
          }
        }]
      }
    });

    // Récupérer tous les onglets
    const response = await googleSheets.sheets.spreadsheets.get({
      spreadsheetId: googleSheets.spreadsheetId
    });

    // Supprimer tous les onglets sauf le temporaire
    const deleteRequests = response.data.sheets
      .filter(sheet => sheet.properties.title !== 'Temp')
      .map(sheet => ({
        deleteSheet: {
          sheetId: sheet.properties.sheetId
        }
      }));

    if (deleteRequests.length > 0) {
      await googleSheets.sheets.spreadsheets.batchUpdate({
        spreadsheetId: googleSheets.spreadsheetId,
        resource: {
          requests: deleteRequests
        }
      });
    }

    // Initialiser les nouveaux onglets
    await googleSheets.initializeSheets();
    console.log('Google Sheets initialisé avec succès !');

    // Supprimer l'onglet temporaire
    const tempResponse = await googleSheets.sheets.spreadsheets.get({
      spreadsheetId: googleSheets.spreadsheetId
    });
    
    const tempSheet = tempResponse.data.sheets.find(s => s.properties.title === 'Temp');
    if (tempSheet) {
      await googleSheets.sheets.spreadsheets.batchUpdate({
        spreadsheetId: googleSheets.spreadsheetId,
        resource: {
          requests: [{
            deleteSheet: {
              sheetId: tempSheet.properties.sheetId
            }
          }]
        }
      });
    }

    // Ajouter les boulangeries de test
    const boulangeries = [
      { nom: 'Boulangerie du Coin', adresse: '123 Rue de Paris', pointsParScan: 10 },
      { nom: 'La Mie Dorée', adresse: '45 Avenue des Champs', pointsParScan: 10 },
      { nom: 'Le Pain Tradition', adresse: '78 Boulevard Central', pointsParScan: 10 }
    ];

    for (const b of boulangeries) {
      const id = await googleSheets.addBoulangerie(b.nom, b.adresse, b.pointsParScan);
      console.log(`Boulangerie créée: ${b.nom} (${id})`);
    }

    console.log('\nStructure des onglets:');
    console.log('1. Clients: ID Client, Nom, Email, Date Inscription');
    console.log('2. Boulangeries: ID Boulangerie, Nom, Adresse, Points par Scan');
    console.log('3. Scans: ID Client, ID Boulangerie, Points Gagnés, Date Scan');
    console.log('4. PointsParBoulangerie: ID Client, ID Boulangerie, Points Total');

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
  }
}

initializeSheets(); 