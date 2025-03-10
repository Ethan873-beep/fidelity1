const QRCode = require('qrcode');
const fs = require('fs');

// Lire le fichier des boulangeries
const boulangeries = JSON.parse(fs.readFileSync('./boulangeries.json')).boulangeries;

// Créer le dossier qrcodes s'il n'existe pas
if (!fs.existsSync('./qrcodes')) {
  fs.mkdirSync('./qrcodes');
}

// Générer un QR code pour chaque boulangerie
boulangeries.forEach(boulangerie => {
  const qrData = JSON.stringify({
    type: 'scan',
    boulangerieId: boulangerie.id
  });

  QRCode.toFile(
    `./qrcodes/${boulangerie.id}.png`,
    qrData,
    {
      width: 300,
      margin: 2
    },
    err => {
      if (err) {
        console.error(`Erreur pour ${boulangerie.id}:`, err);
      } else {
        console.log(`QR code généré pour ${boulangerie.nom} (${boulangerie.id})`);
      }
    }
  );
}); 