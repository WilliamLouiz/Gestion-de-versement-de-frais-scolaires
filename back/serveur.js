const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const session = require('express-session');
const bcrypt = require('bcrypt');

app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'Cummial01', // Remplacez par une clé secrète sécurisée
  resave: false,
  saveUninitialized: true,
}));

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'frais_scolaires',
});

db.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données', err);
  } else {
    console.log('Connecté à la base de données');
  }
});

app.post('/create', (req, res)=>{
    const NomUtilisateur = req.body.NomUtilisateur
    const Email = req.body.Email
    const Role = req.body.Role
    const Password = req.body.Password

    db.query(
        'INSERT INTO utilisateur(NomUtilisateur, Role, Email, Password) VALUES(?,?,?,?)',
        [NomUtilisateur,Role,Email,Password], (err,result)=>{
            if(err){
                console.log(err)
            }else{
                res.send("valeur inséré");
            }
        }
    );
});

app.post('/auth', function (req, res) {
  const { NomUtilisateur, Password } = req.body;
  console.log('NomUtilisateur:', NomUtilisateur);
  console.log('Password:', Password);

  const query = 'SELECT * FROM utilisateur WHERE NomUtilisateur = ?';

  db.query(query, [NomUtilisateur], (error, results) => {
    if (error) {
      res.status(500).json({ message: 'Erreur du serveur' });
    } else if (results.length === 0) {
      res.status(401).json({ message: 'Nom d\'utilisateur incorrect' });
    } else {
      const user = results[0];
      if (user.Password === Password) {
        console.log("connexion avec succé")
        // Stockez l'utilisateur dans la session
        req.session.user = user;
        // Redirigez l'utilisateur vers la page d'accueil
        res.status(200).send({
          message: 'Connexion avec succès',
          redirect: '/accueil'
        });
      } else {
        console.log("connexion echoué")
        res.status(401).json({ message: 'Mot de passe incorrect' });
      }
    }
  });
  
});

app.listen(3001, ()=>{
    console.log("By, tu es connecté au port 3001")
});