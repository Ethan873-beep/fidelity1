const { google } = require('googleapis');
const credentials = require('../../credentials.json');

class GoogleSheetsService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.spreadsheetId = '1AdUehQOV9snQ8i8JqDUpUmhnp6cJpSvIkNgisMzN51w';
  }

  formatDate(date) {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async initializeSheets() {
    const sheetsToCreate = [
      {
        title: 'Clients',
        headers: ['ID Client', 'Nom', 'Email', 'Date Inscription']
      },
      {
        title: 'Boulangeries',
        headers: ['ID Boulangerie', 'Nom', 'Adresse', 'Points par Scan']
      },
      {
        title: 'Scans',
        headers: ['ID Client', 'ID Boulangerie', 'Points Gagnés', 'Date Scan']
      },
      {
        title: 'PointsParBoulangerie',
        headers: ['ID Client', 'ID Boulangerie', 'Points Total']
      }
    ];

    try {
      // Récupérer la liste des onglets existants
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId
      });

      const existingSheets = response.data.sheets.map(s => s.properties.title);
      console.log('Onglets existants:', existingSheets);

      // Créer les onglets manquants
      for (const sheet of sheetsToCreate) {
        if (!existingSheets.includes(sheet.title)) {
          console.log(`Création de l'onglet ${sheet.title}...`);
          await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            resource: {
              requests: [{
                addSheet: {
                  properties: {
                    title: sheet.title,
                    gridProperties: {
                      rowCount: 1000,
                      columnCount: sheet.headers.length
                    }
                  }
                }
              }]
            }
          });

          // Ajouter les en-têtes
          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: `${sheet.title}!A1:${String.fromCharCode(65 + sheet.headers.length - 1)}1`,
            valueInputOption: 'RAW',
            resource: {
              values: [sheet.headers]
            }
          });
          console.log(`En-têtes ajoutés pour ${sheet.title}`);
        } else {
          console.log(`L'onglet ${sheet.title} existe déjà`);
        }
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des onglets:', error);
      throw error;
    }
  }

  async addBoulangerie(nom, adresse, pointsParScan) {
    const id = 'BAK' + String(Date.now()).slice(-3);
    const values = [[id, nom, adresse, pointsParScan]];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Boulangeries!A2',
      valueInputOption: 'RAW',
      resource: { values }
    });

    return id;
  }

  async getPointsParBoulangerie(clientId, boulangerieId) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'PointsParBoulangerie!A2:C'
    });

    const rows = response.data.values || [];
    const entry = rows.find(row => row[0] === clientId && row[1] === boulangerieId);
    return entry ? parseInt(entry[2]) : 0;
  }

  async updatePointsParBoulangerie(clientId, boulangerieId, points) {
    const currentPoints = await this.getPointsParBoulangerie(clientId, boulangerieId);
    const newPoints = currentPoints + points;
    const values = [[clientId, boulangerieId, newPoints]];

    if (currentPoints === 0) {
      // Nouvelle entrée
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'PointsParBoulangerie!A2',
        valueInputOption: 'RAW',
        resource: { values }
      });
    } else {
      // Mise à jour de l'entrée existante
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'PointsParBoulangerie!A2:C'
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex(row => row[0] === clientId && row[1] === boulangerieId);

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `PointsParBoulangerie!A${rowIndex + 2}:C${rowIndex + 2}`,
        valueInputOption: 'RAW',
        resource: { values }
      });
    }

    return newPoints;
  }

  async addClient(nom, email) {
    const id = 'CLI' + String(Date.now()).slice(-3);
    const dateInscription = this.formatDate(new Date());
    const values = [[id, nom, email, dateInscription]];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Clients!A2',
      valueInputOption: 'RAW',
      resource: { values }
    });

    return id;
  }

  async getBoulangerie(boulangerieId) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Boulangeries!A2:D'
    });

    const rows = response.data.values || [];
    const boulangerie = rows.find(row => row[0] === boulangerieId);
    
    if (!boulangerie) return null;

    return {
      id: boulangerie[0],
      nom: boulangerie[1],
      adresse: boulangerie[2],
      pointsParScan: parseInt(boulangerie[3])
    };
  }

  async recordScan(clientId, boulangerieId) {
    // Vérifier si la boulangerie existe
    const boulangerie = await this.getBoulangerie(boulangerieId);
    if (!boulangerie) {
      throw new Error('Boulangerie non trouvée');
    }

    const dateScan = this.formatDate(new Date());
    const pointsGagnes = boulangerie.pointsParScan;

    // Enregistrer le scan
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Scans!A2',
      valueInputOption: 'RAW',
      resource: {
        values: [[clientId, boulangerieId, pointsGagnes, dateScan]]
      }
    });

    // Mettre à jour les points
    const nouveauxPoints = await this.updatePointsParBoulangerie(clientId, boulangerieId, pointsGagnes);

    return {
      pointsGagnes,
      nouveauxPoints,
      nomBoulangerie: boulangerie.nom
    };
  }

  async getAllPointsForClient(clientId) {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'PointsParBoulangerie!A2:C'
    });

    const rows = response.data.values || [];
    const pointsParBoulangerie = rows
      .filter(row => row[0] === clientId)
      .map(async row => {
        const boulangerie = await this.getBoulangerie(row[1]);
        return {
          boulangerieId: row[1],
          nomBoulangerie: boulangerie ? boulangerie.nom : 'Inconnue',
          points: parseInt(row[2])
        };
      });

    return Promise.all(pointsParBoulangerie);
  }
}

module.exports = new GoogleSheetsService(); 