// accueilRoutes.js

const express = require('express');
const { requireAuth } = require('./authMiddleware');
const router = express.Router();

router.get('/accueil', requireAuth, (req, res) => {
  // Affichez la page d'accueil
  res.send(`Bienvenue sur la page d'accueil, ${req.session.user.username}!`);
});

module.exports = router;
