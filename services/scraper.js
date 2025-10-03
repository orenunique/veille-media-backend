const axios = require('axios');
const cheerio = require('cheerio');

// Récupérer les articles d'un média via RSS
async function fetchArticles(mediaUrl) {
  try {
    // La plupart des médias français ont un flux RSS
    const possibleRssUrls = [
      `https://${mediaUrl}/rss`,
      `https://${mediaUrl}/feed`,
      `https://${mediaUrl}/rss.xml`,
      `https://www.${mediaUrl}/rss`
    ];

    let articles = [];
    
    for (const rssUrl of possibleRssUrls) {
      try {
        const response = await axios.get(rssUrl, { timeout: 5000 });
        
        // Parser le flux RSS (XML)
        const $ = cheerio.load(response.data, { xmlMode: true });
        
        $('item').each((i, elem) => {
          if (i < 10) { // Limiter à 10 articles par média
            articles.push({
              title: $(elem).find('title').text(),
              url: $(elem).find('link').text(),
              description: $(elem).find('description').text().replace(/<[^>]*>/g, ''),
              pubDate: $(elem).find('pubDate').text()
            });
          }
        });
        
        if (articles.length > 0) {
          console.log(`✅ ${articles.length} articles récupérés de ${mediaUrl}`);
          break; // On a trouvé un flux RSS qui fonctionne
        }
      } catch (err) {
        // Continuer avec l'URL suivante
        continue;
      }
    }
    
    if (articles.length === 0) {
      console.log(`⚠️ Aucun flux RSS trouvé pour ${mediaUrl}`);
    }
    
    return articles;
  } catch (error) {
    console.error(`❌ Erreur lors du scraping de ${mediaUrl}:`, error.message);
    return [];
  }
}

// Vérifier si un article contient un mot-clé
function checkKeywords(article, keywords) {
  const text = `${article.title} ${article.description}`.toLowerCase();
  return keywords.filter(kw => 
    text.includes(kw.term.toLowerCase())
  );
}

// Vérifier si un article a été publié dans les dernières 24h
function isLast24Hours(pubDate) {
  try {
    const articleDate = new Date(pubDate);
    const now = new Date();
    const diffHours = (now - articleDate) / (1000 * 60 * 60);
    return diffHours <= 24;
  } catch (error) {
    return true; // En cas de doute, on inclut l'article
  }
}

module.exports = { fetchArticles, checkKeywords, isLast24Hours };