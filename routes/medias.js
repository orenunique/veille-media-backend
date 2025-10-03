const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Récupérer tous les médias
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM medias WHERE user_id = 1 ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter un média
router.post('/', async (req, res) => {
  try {
    const { name, url } = req.body;
    const result = await pool.query(
      'INSERT INTO medias (user_id, name, url, active) VALUES (1, $1, $2, true) RETURNING *',
      [name, url]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout' });
  }
});

// Supprimer un média
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM medias WHERE id = $1', [id]);
    res.json({ message: 'Média supprimé' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Activer/désactiver un média
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE medias SET active = NOT active WHERE id = $1 RETURNING *',
      [id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

module.exports = router;