const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const pool = require('./config/database');
const { fetchArticles, checkKeywords, isLast24Hours } = require('./services/scraper');
const { sendDailySummary, sendAlert } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.json({ message: '✅ Serveur fonctionnel !' });
});

// Routes API
app.use('/api/medias', require('./routes/medias'));
app.use('/api/keywords', require('./routes/keywords'));

// Fonction pour vérifier les articles et envoyer des alertes
async function checkArticlesForAlerts() {
  try {
    console.log('\n🔍 Vérification des nouveaux articles...');
    
    const userResult = await pool.query('SELECT * FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé');
      return;
    }
    
    const user = userResult.rows[0];
    
    const mediasResult = await pool.query(
      'SELECT * FROM medias WHERE user_id = $1 AND active = true',
      [user.id]
    );
    
    const keywordsResult = await pool.query(
      'SELECT * FROM keywords WHERE user_id = $1 AND active = true',
      [user.id]
    );
    
    if (mediasResult.rows.length === 0) {
      console.log('⚠️ Aucun média actif');
      return;
    }
    
    if (keywordsResult.rows.length === 0) {
      console.log('⚠️ Aucun mot-clé actif');
      return;
    }
    
    console.log(`📊 Surveillance de ${mediasResult.rows.length} média(s) pour ${keywordsResult.rows.length} mot(s)-clé(s)`);
    
    for (const media of mediasResult.rows) {
      const articles = await fetchArticles(media.url);
      
      for (const article of articles) {
        const matchedKeywords = checkKeywords(article, keywordsResult.rows);
        
        for (const keyword of matchedKeywords) {
          console.log(`🔔 Mot-clé "${keyword.term}" trouvé dans: ${article.title.substring(0, 50)}...`);
          
          await pool.query(
            'INSERT INTO alerts (keyword_id, media_name, article_title, article_url) VALUES ($1, $2, $3, $4)',
            [keyword.id, media.name, article.title, article.url]
          );
          
          await sendAlert(user.email, keyword.term, {
            ...article,
            media: media.name
          });
        }
      }
    }
    
    console.log('✅ Vérification terminée\n');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

async function sendDailyDigest() {
  try {
    console.log('\n📰 Préparation du condensé quotidien...');
    
    const userResult = await pool.query('SELECT * FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé');
      return;
    }
    
    const user = userResult.rows[0];
    
    const mediasResult = await pool.query(
      'SELECT * FROM medias WHERE user_id = $1 AND active = true',
      [user.id]
    );
    
    if (mediasResult.rows.length === 0) {
      console.log('⚠️ Aucun média actif');
      return;
    }
    
    const allArticles = [];
    
    for (const media of mediasResult.rows) {
      const articles = await fetchArticles(media.url);
      
      const recentArticles = articles
        .filter(a => isLast24Hours(a.pubDate))
        .slice(0, 5)
        .map(a => ({ ...a, media: media.name }));
      
      allArticles.push(...recentArticles);
    }
    
    if (allArticles.length === 0) {
      console.log('⚠️ Aucun article récent trouvé');
      return;
    }
    
    console.log(`📊 ${allArticles.length} article(s) dans le condensé`);
    
    await sendDailySummary(user.email, allArticles);
    
    console.log('✅ Condensé envoyé\n');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du condensé:', error);
  }
}

cron.schedule('0 * * * *', () => {
  console.log('⏰ Exécution planifiée : vérification des articles');
  checkArticlesForAlerts();
});

cron.schedule('0 7 * * *', () => {
  console.log('⏰ Exécution planifiée : envoi du condensé matinal');
  sendDailyDigest();
});

app.get('/api/test-alerts', async (req, res) => {
  await checkArticlesForAlerts();
  res.json({ message: 'Vérification des alertes lancée' });
});

app.get('/api/test-digest', async (req, res) => {
  await sendDailyDigest();
  res.json({ message: 'Envoi du condensé lancé' });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log('⏰ Tâches planifiées activées :');
  console.log('   - Vérification des alertes : toutes les heures');
  console.log('   - Condensé matinal : chaque jour à 7h00');
  console.log('\n💡 Testez manuellement :');
  console.log(`   - Alertes : http://localhost:${PORT}/api/test-alerts`);
  console.log(`   - Condensé : http://localhost:${PORT}/api/test-digest`);
});