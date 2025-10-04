const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

if (process.env.RESEND_API_KEY) {
  console.log('✅ Service Resend configuré');
}

async function sendDailySummary(userEmail, articles) {
  try {
    const articlesByMedia = {};
    articles.forEach(article => {
      if (!articlesByMedia[article.media]) {
        articlesByMedia[article.media] = [];
      }
      articlesByMedia[article.media].push(article);
    });

    const htmlContent = `<!DOCTYPE html><html><body><h1>📰 Condensé matinal</h1>${Object.keys(articlesByMedia).map(media => `<h2>${media}</h2>${articlesByMedia[media].map(a => `<div><h3>${a.title}</h3><p>${a.description}</p><a href="${a.url}">Lire</a></div>`).join('')}`).join('')}</body></html>`;

    await resend.emails.send({
      from: 'Veille <veille@veillepolitique64.com>',
      to: [userEmail],
      subject: `📰 Condensé du ${new Date().toLocaleDateString('fr-FR')}`,
      html: htmlContent
    });

    console.log('✅ Condensé envoyé');
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}

async function sendAlert(userEmail, keyword, article) {
  try {
    await resend.emails.send({
      from: 'Veille <veille@veillepolitique64.com>',
      to: [userEmail],
      subject: `🔔 Alerte : "${keyword}"`,
      html: `<h2>🔔 Alerte : ${keyword}</h2><h3>${article.title}</h3><p>Source : ${article.media}</p><a href="${article.url}">Lire</a>`
    });

    console.log('✅ Alerte envoyée');
    return true;
  } catch (error) {
    console.error('❌ Erreur:', error);
    return false;
  }
}

module.exports = { sendDailySummary, sendAlert };
