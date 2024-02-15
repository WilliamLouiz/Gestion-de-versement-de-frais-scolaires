// authRoutes.js

const express = require('express');
const mysql = require('mysql2');
const router = express.Router();

// Configuration de la connexion à la base de données MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'frais_scolaires',
});

// Connexion à la base de données
db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données MySQL :', err);
  } else {
    console.log('Connecté à la base de données MySQL');
  }
});

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

router.post('/auth', (req, res) => {
  const { username, password } = req.body;

  // Vérification des informations d'identification dans la base de données
  const query = `SELECT * FROM utilisateur WHERE NomUtilisateur = ? AND Password = ?`;

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error('Erreur lors de la vérification des informations d\'identification :', err);
      return res.redirect('/');
    }

    // Vérifiez si l'utilisateur a été trouvé dans la base de données
    if (results.length > 0) {
      // Utilisateur authentifié, configurez la session
      req.session.user = { username };
      return res.redirect('/accueil');
    } else {
      // Échec de l'authentification
      res.redirect('/');
    }
  });
});

router.get('/logout', (req, res) => {
  // Déconnectez l'utilisateur en détruisant la session
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
