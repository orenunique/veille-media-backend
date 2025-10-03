const { fetchArticles, checkKeywords } = require('./services/scraper');
const { sendDailySummary, sendAlert } = require('./services/emailService');

async function testServices() {
  console.log('🧪 Test des services...\n');

  // Test 1 : Scraping d'articles avec différents médias
  console.log('📰 Test 1 : Récupération d\'articles');
  
  const mediasToTest = [
    'lefigaro.fr',
    'liberation.fr',
    'france24.com'
  ];

  let allArticles = [];
  
  for (const media of mediasToTest) {
    console.log(`\n🔍 Test de ${media}...`);
    const articles = await fetchArticles(media);
    
    if (articles.length > 0) {
      console.log(`✅ ${articles.length} articles récupérés`);
      console.log(`   Premier article: ${articles[0].title.substring(0, 60)}...`);
      
      // Ajouter le nom du média à chaque article
      articles.forEach(a => a.media = media.replace('.fr', '').replace('.com', ''));
      allArticles = allArticles.concat(articles.slice(0, 3)); // Garder 3 articles par média
    } else {
      console.log(`⚠️ Aucun article récupéré pour ${media}`);
    }
  }

  console.log('\n---\n');

  // Test 2 : Détection de mots-clés
  console.log('🔍 Test 2 : Détection de mots-clés');
  
  if (allArticles.length > 0) {
    const testKeywords = [
      { term: 'france', active: true },
      { term: 'europe', active: true },
      { term: 'économie', active: true }
    ];

    let totalMatches = 0;
    allArticles.forEach(article => {
      const matches = checkKeywords(article, testKeywords);
      if (matches.length > 0) {
        totalMatches++;
        console.log(`✅ Mot-clé trouvé dans: "${article.title.substring(0, 50)}..."`);
        console.log(`   Mots-clés: ${matches.map(k => k.term).join(', ')}`);
      }
    });
    
    console.log(`\n📊 Total: ${totalMatches} article(s) avec mots-clés sur ${allArticles.length}`);
  }

  console.log('\n---\n');

  // Test 3 : Envoi d'un condensé
  console.log('📧 Test 3 : Préparation du condensé matinal');
  
  if (allArticles.length > 0) {
    await sendDailySummary('test@example.com', allArticles);
  } else {
    console.log('⚠️ Pas d\'articles à envoyer');
  }

  console.log('\n---\n');

  // Test 4 : Envoi d'une alerte
  console.log('🔔 Test 4 : Préparation d\'une alerte');
  
  if (allArticles.length > 0) {
    await sendAlert('test@example.com', 'test', allArticles[0]);
  } else {
    const testAlert = {
      title: 'Article de test',
      url: 'https://example.com',
      media: 'Média Test'
    };
    await sendAlert('test@example.com', 'intelligence artificielle', testAlert);
  }

  console.log('\n✅ Tous les tests terminés !');
  console.log('\n💡 Note: Les emails ne sont pas envoyés en mode test,');
  console.log('   ils sont juste affichés dans le terminal.');
}

testServices();