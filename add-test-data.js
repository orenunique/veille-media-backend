const pool = require('./config/database');

async function addTestData() {
  try {
    console.log('📝 Ajout de données de test...\n');

    // Ajouter des médias
    const medias = [
      { name: 'France 24', url: 'france24.com' },
      { name: 'Le Figaro', url: 'lefigaro.fr' },
      { name: 'Libération', url: 'liberation.fr' }
    ];

    for (const media of medias) {
      await pool.query(
        'INSERT INTO medias (user_id, name, url, active) VALUES (1, $1, $2, true) ON CONFLICT DO NOTHING',
        [media.name, media.url]
      );
      console.log(`✅ Média ajouté: ${media.name}`);
    }

    console.log('');

    // Ajouter des mots-clés
    const keywords = [
      'France',
      'Europe',
      'technologie',
      'climat',
      'économie'
    ];

    for (const keyword of keywords) {
      await pool.query(
        'INSERT INTO keywords (user_id, term, active) VALUES (1, $1, true) ON CONFLICT DO NOTHING',
        [keyword]
      );
      console.log(`✅ Mot-clé ajouté: ${keyword}`);
    }

    console.log('\n🎉 Données de test ajoutées avec succès !');
    console.log('\n💡 Vous pouvez maintenant tester :');
    console.log('   - Alertes : http://localhost:3000/api/test-alerts');
    console.log('   - Condensé : http://localhost:3000/api/test-digest');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addTestData();