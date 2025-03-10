const googleSheets = require('./src/services/googleSheets');

async function testLoyaltySystem() {
  try {
    // 1. Créer un nouveau client
    console.log('1. Création d\'un nouveau client...');
    const clientId = await googleSheets.addClient('Jean Dupont', 'jean.dupont@example.com');
    console.log(`Client créé avec l'ID: ${clientId}`);

    // 2. Récupérer deux boulangeries existantes
    console.log('\n2. Récupération des informations des boulangeries...');
    const boulangerie1 = await googleSheets.getBoulangerie('BAK103'); // Boulangerie du Coin
    const boulangerie2 = await googleSheets.getBoulangerie('BAK060'); // La Mie Dorée
    console.log('Boulangerie 1:', boulangerie1);
    console.log('Boulangerie 2:', boulangerie2);

    // 3. Simuler un scan de QR code dans la première boulangerie
    console.log('\n3. Simulation d\'un scan de QR code dans la première boulangerie...');
    const resultatScan1 = await googleSheets.recordScan(clientId, boulangerie1.id);
    console.log('Résultat du scan 1:', resultatScan1);

    // 4. Vérifier les points du client
    console.log('\n4. Vérification des points du client après le premier scan...');
    const pointsClient1 = await googleSheets.getAllPointsForClient(clientId);
    console.log('Points du client par boulangerie:', pointsClient1);

    // 5. Simuler un scan dans la deuxième boulangerie
    console.log('\n5. Simulation d\'un scan dans la deuxième boulangerie...');
    const resultatScan2 = await googleSheets.recordScan(clientId, boulangerie2.id);
    console.log('Résultat du scan 2:', resultatScan2);

    // 6. Vérifier les points mis à jour
    console.log('\n6. Vérification des points mis à jour...');
    const pointsClientMisAJour = await googleSheets.getAllPointsForClient(clientId);
    console.log('Points mis à jour du client:', pointsClientMisAJour);

  } catch (error) {
    console.error('Erreur lors du test:', error);
  }
}

testLoyaltySystem(); 