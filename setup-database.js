const pool = require('./config/database');

async function setupDatabase() {
  try {
    console.log('🔧 Création des tables...');

    // Table users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        summary_time TIME DEFAULT '07:00',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table users créée');

    // Table medias
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medias (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table medias créée');

    // Table keywords
    await pool.query(`
      CREATE TABLE IF NOT EXISTS keywords (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        term VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table keywords créée');

    // Table alerts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS alerts (
        id SERIAL PRIMARY KEY,
        keyword_id INTEGER REFERENCES keywords(id) ON DELETE CASCADE,
        media_name VARCHAR(255),
        article_title TEXT,
        article_url TEXT,
        detected_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table alerts créée');

    // Insérer un utilisateur de test
    await pool.query(`
      INSERT INTO users (email, summary_time) 
      VALUES ('votre.email@example.com', '07:00')
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log('✅ Utilisateur de test créé');

    console.log('🎉 Base de données configurée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  }
}

setupDatabase();