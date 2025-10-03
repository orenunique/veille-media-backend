const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Récupérer tous les mots-clés
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM keywords WHERE user_id = 1 ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter un mot-clé
router.post('/', async (req, res) => {
  try {
    const { term } = req.body;
    const result = await pool.query(
      'INSERT INTO keywords (user_id, term, active) VALUES (1, $1, true) RETURNING *',
      [term]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout' });
  }
});

// Supprimer un mot-clé
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM keywords WHERE id = $1', [id]);
    res.json({ message: 'Mot-clé supprimé' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Activer/désactiver un mot-clé
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE keywords SET active = NOT active WHERE id = $1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

module.exports = router;