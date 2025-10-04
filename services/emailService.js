const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

if (process.env.RESEND_API_KEY) {
  console.log('✅ Service Resend configuré');
} else {
  console.error('❌ RESEND_API_KEY manquante');
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #1e40af; margin-top: 30px; border-left: 4px solid #2563eb; padding-left: 10px; }
          .article { 
            margin: 20px 0; 
            padding: 15px; 
            border-left: 3px solid #2563eb;
            background: #f8fafc;
            border-radius: 4px;
          }
          .article h3 { margin: 0 0 10px 0; color: #1e293b; }
          .article p { margin: 5px 0; color: #475569; }
          .article a { color: #2563eb; text-decoration: none; font-weight: bold; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <h1>📰 Votre condensé matinal</h1>
        <p>Bonjour ! Voici les articles du jour de vos médias suivis :</p>
        
        ${Object.keys(articlesByMedia).map(media => `
          <h2>${media}</h2>
          ${articlesByMedia[media].map(article => `
            <div class="article">
              <h3>${article.title}</h3>
              <p>${article.description}</p>
              <a href="${article.url}">Lire l'article →</a>
            </div>
          `).join('')}
        `).join('')}
        
        <div class="footer">
          <p>Vous recevez cet email car vous êtes abonné au service de veille médiatique.</p>
        </div>
      </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: 'Veille Médiatique <onboarding@resend.dev>',
      to: [userEmail],
      subject: `📰 Votre condensé du ${new Date().toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`,
      html: htmlContent
    });

    console.log('✅ Condensé envoyé à:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Erreur condensé:', error);
    return false;
  }
}

async function sendAlert(userEmail, keyword, article) {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert-box { 
            padding: 20px; 
            background: #dbeafe; 
            border-radius: 8px;
            border-left: 4px solid #2563eb;
          }
          h2 { color: #1e40af; margin: 0 0 15px 0; }
          .keyword { 
            display: inline-block;
            background: #2563eb; 
            color: white; 
            padding: 5px 12px; 
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
          }
          .article-title { 
            font-size: 18px; 
            font-weight: bold; 
            color: #1e293b; 
            margin: 15px 0 10px 0;
          }
          .source { color: #64748b; font-weight: bold; }
          a { 
            display: inline-block;
            margin-top: 15px;
            color: #2563eb; 
            text-decoration: none;
            font-weight: bold;
          }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="alert-box">
          <h2>🔔 Alerte mot-clé</h2>
          <p>Le mot-clé <span class="keyword">${keyword}</span> a été détecté !</p>
          
          <div class="article-title">${article.title}</div>
          <p class="source">Source : ${article.media}</p>
          
          <a href="${article.url}">Lire l'article →</a>
        </div>
        
        <div class="footer">
          <p>Vous recevez cette alerte car le mot-clé "${keyword}" est surveillé.</p>
        </div>
      </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: 'Veille Médiatique <onboarding@resend.dev>',
      to: [userEmail],
      subject: `🔔 Alerte : "${keyword}" détecté`,
      html: htmlContent
    });

    console.log(`✅ Alerte envoyée : "${keyword}"`);
    return true;
  } catch (error) {
    console.error('❌ Erreur alerte:', error);
    return false;
  }
}

module.exports = { sendDailySummary, sendAlert };
