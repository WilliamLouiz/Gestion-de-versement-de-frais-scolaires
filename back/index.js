const express = require("express");
const app = express();
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');


app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Permettre à http://localhost:3000 d'accéder
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
app.use('/images', express.static('public/images'));
app.use(express.json());
app.use(cors(
  { 
    origin: [""],
    method: ["POST,GET"],
    Credential: true
  }
)); 

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


// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  console.log('Token reçu côté serveur:', token);

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, 'jwebtoken', (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

app.post('/auth', function (req, res) {
  const { NomUtilisateur, Password } = req.body;
  console.log('NomUtilisateur:', NomUtilisateur);
  console.log('Password:', Password);

  const query = 'SELECT * FROM utilisateur WHERE NomUtilisateur = ? AND Password = ?';

  db.query(query, [req.body.NomUtilisateur, req.body.Password], (err, data) => {
    if(err) return res.json({Message: "Erreur du Serveur"});
    if(data.length > 0){
      const name = data[0].NomUtilisateur;
      const token = jwt.sign({ name }, "jwebtoken", { expiresIn: '1d' });
      console.log('Réponse du serveur:', { Status: 'Success', token });
      res.cookie('token', token);
      return res.json({ Status: 'Success', token });
    }else{
      return res.json({Message: "utilisateur non trouvé"});
    }
  })

});

// Exemple d'utilisation du middleware pour protéger une route
/*app.get('/accueil', authenticateToken, (req, res) => {
  // La route est accessible uniquement si le token est valide
  res.json({ message: 'Accès autorisé', user: req.user });
});*/

app.post('/ajoutE', (req, res)=>{
  const NomEtudiant = req.body.NomEtudiant
  //const Image = req.body.Image
  const PrenomEtudiant = req.body.PrenomEtudiant
  const DateNaiss = req.body.DateNaiss
  const Contact = req.body.Contact
  const CIN = req.body.CIN
  const Adresse = req.body.Adresse
  const NiveauEt = req.body.NiveauEt
  const Sexe = req.body.Sexe
  const LieuNaiss = req.body.LieuNaiss

  db.query(
      'INSERT INTO etudiant(NomEtudiant, PrenomEtudiant, DateNaiss, LieuNaiss,Contact,CIN,Adresse,Sex,NiveauEt) VALUES(?,?,?,?,?,?,?,?,?)',
      [NomEtudiant,PrenomEtudiant,DateNaiss,LieuNaiss,Contact,CIN,Adresse,Sexe,NiveauEt], (err,result)=>{
          if(err){
            return res.json({Status: "Erreur"})
          }else{
            return res.status(200).json({ Status: 'Success' });
          }
      }
  );
});
//code d'ajout d'un bacc
app.post('/ajoutB', (req, res)=>{
  const IdEtudiant = req.body.IdEtudiant
  const NumBacc = req.body.NumBacc
  const Serie = req.body.Serie
  const Centre = req.body.Centre
  const Annee = req.body.Annee

  db.query(
      'INSERT INTO bacc(IdEtudiant, NumBacc, Centre,Serie, Annee) VALUES(?,?,?,?,?)',
      [IdEtudiant, NumBacc,Centre,Serie,Annee], (err,result)=>{
          if(err){
            return res.json({Status: "Erreur"})
          }else{
            return res.json({Status: "Success"})
          }
      }
  );
});
//code d'ajout d'un Parent
app.post('/ajoutP', (req, res)=>{
  const IdEtudiant = req.body.IdEtudiant
  const NomParent = req.body.NomParent
  const Adresse = req.body.Adresse
  const Contact = req.body.Contact

  db.query(
      'INSERT INTO parent(IdEtudiant, NomParent, Contact,Adresse) VALUES(?,?,?,?)',
      [IdEtudiant, NomParent,Contact,Adresse], (err,result)=>{
          if(err){
            return res.json({Status: "Erreur"})
          }else{
            return res.json({Status: "Success"})
          }
      }
  );
});
//pour lister les etudiants
app.get('/etudiant', (req, res) =>{
  const sql= "SELECT * FROM etudiant"; 
  db.query(sql, (err, data) => {
    if (err) return res.json({Status: "Success"})
    return res.json(data);
 });
});
//pour lister les etudiants qui ne sont pas encore diplomé baccalauréat
app.get('/etnonbacc', (req, res) =>{
  const sql= "SELECT e.* FROM etudiant e LEFT JOIN bacc b ON e.IdEtudiant = b.IdEtudiant WHERE b.IdEtudiant IS NULL"; 
  db.query(sql, (err, data) => {
    if (err) return res.json({Status: "Success"})
    return res.json(data);
 });
});

//pour lister les etudiants qui n'ont pas encore des parents
app.get('/etnonparent', (req, res) =>{
  const sql= "SELECT e.* FROM etudiant e LEFT JOIN parent p ON e.IdEtudiant = p.IdEtudiant WHERE p.IdEtudiant IS NULL"; 
  db.query(sql, (err, data) => {
    if (err) return res.json({Status: "Success"})
    return res.json(data);
 });
});

//pour lister les parents
app.get('/parent', (req, res) =>{
  const sql= "SELECT IdParent, etudiant.NomEtudiant, parent.NomParent, parent.Adresse, parent.Contact FROM etudiant,parent WHERE parent.IdEtudiant = etudiant.IdEtudiant"; 
  db.query(sql, (err, data) => {
    if (err) return res.json({Status: "Success"})
    return res.json(data);
 });
});
//pour lister les baccs
app.get('/bacc', (req, res) =>{
  const sql= "SELECT IdBacc, etudiant.NomEtudiant, bacc.NumBacc, bacc.Serie, bacc.Centre, bacc.annee FROM etudiant,bacc WHERE bacc.IdEtudiant = etudiant.IdEtudiant"; 
  db.query(sql, (err, data) => {
    if (err) return res.json({Status: "Success"})
    return res.json(data);
 });
});
//pour supprimer les etudiants
app.delete('/etudiant/:IdEtudiant', (req, res) => {
  const idEtudiant = req.params.IdEtudiant;

  db.query('DELETE FROM etudiant WHERE IdEtudiant = ?', idEtudiant, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ Status: 'Erreur' });
    } else {
      if (result.affectedRows === 0) {
        res.status(404).json({ Status: 'Erreur' });
      } else {
        res.status(200).json({ Status: 'Success' });
      }
    }
  });
});

app.delete('/parent/:IdParent', (req, res) => {
  const idParent = req.params.IdParent;

  db.query('DELETE FROM parent WHERE IdParent = ?', idParent, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ Status: 'Erreur' });
    } else {
      if (result.affectedRows === 0) {
        res.status(404).json({ Status: 'Erreur' });
      } else {
        res.status(200).json({ Status: 'Success' });
      }
    }
  });
});

app.delete('/bacc/:IdBacc', (req, res) => {
  const idBacc = req.params.IdBacc;

  db.query('DELETE FROM bacc WHERE IdBacc = ?', idBacc, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ Status: 'Erreur' });
    } else {
      if (result.affectedRows === 0) {
        res.status(404).json({ Status: 'Erreur' });
      } else {
        res.status(200).json({ Status: 'Success' });
      }
    }
  });
});
// Route pour récupérer les détails d'un étudiant par ID
app.get('/etudiant/:id', (req, res) => {
  const idEtudiant = req.params.id;
  db.query('SELECT * FROM etudiant WHERE IdEtudiant = ?', idEtudiant, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des détails de l\'étudiant: ' + err);
      res.status(500).json({ Status: 'Erreur' });
    } else {
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).json({ Status: 'Non trouvé' });
      }
    }
  });
});

app.put('/etudiant/:id', (req, res) => {
  const idEtudiant = req.params.id;
  const {
    NomEtudiant,
    PrenomEtudiant,
    DateNaiss,
    LieuNaiss,
    Sex,
    Contact,
    Cin,
    Adresse,
    NiveauEt,
  } = req.body;

  db.query(
    'UPDATE etudiant SET NomEtudiant=?, PrenomEtudiant=?, DateNaiss=?, LieuNaiss=?, Sex=?, Contact=?, Cin=?, Adresse=?, NiveauEt=? WHERE IdEtudiant=?',
    [NomEtudiant, PrenomEtudiant, DateNaiss, LieuNaiss, Sex, Contact, Cin, Adresse, NiveauEt, idEtudiant],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ Status: 'Erreur' });
      } else {
        res.json({ Status: 'Success' });
      }
    }
  );
});

// Route pour récupérer les détails d'un parent par ID
app.get('/parent/:id', (req, res) => {
  const idParent = req.params.id;
  db.query('SELECT * FROM parent WHERE IdParent = ?', idParent, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des détails du parent: ' + err);
      res.status(500).json({ Status: 'Erreur' });
    } else {
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).json({ Status: 'Non trouvé' });
      }
    }
  });
});

app.put('/parent/:id', (req, res) => {
  const idParent = req.params.id;
  const {
    IdEtudiant,
    NomParent,
    Adresse,
    Contact,
  } = req.body;

  db.query(
    'UPDATE parent SET IdEtudiant=?, NomParent=?, Adresse=?, Contact=? WHERE IdParent=?',
    [IdEtudiant, NomParent, Adresse, Contact, idParent],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ Status: 'Erreur' });
      } else {
        res.json({ Status: 'Success' });
      }
    }
  );
});

// Route pour récupérer les détails d'un bacc par ID
app.get('/bacc/:id', (req, res) => {
  const idBacc = req.params.id;
  db.query('SELECT * FROM bacc WHERE IdBacc = ?', idBacc, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des détails du bacc: ' + err);
      res.status(500).json({ Status: 'Erreur' });
    } else {
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).json({ Status: 'Non trouvé' });
      }
    }
  });
});

app.put('/bacc/:id', (req, res) => {
  const idBacc = req.params.id;
  const {
    IdEtudiant,
    NumBacc,
    Serie,
    Centre,
    Annee,
  } = req.body;

  db.query(
    'UPDATE bacc SET IdEtudiant=?, NumBacc=?, Serie=?, Centre=?, Annee=? WHERE IdBacc=?',
    [IdEtudiant, NumBacc, Serie, Centre, Annee, idBacc],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ Status: 'Erreur' });
      } else {
        res.json({ Status: 'Success' });
      }
    }
  );
});



// VERSEMENT
//pour lister les Versement
app.get('/versement', (req, res) =>{
  const sql= "SELECT versement.IdVersement, versement.Bordereau, etudiant.NomEtudiant, etudiant.NiveauEt, versement.DateVersement, versement.Montant, parent.NomParent,bacc.NumBacc, etudiant.CIN, etudiant.Adresse FROM etudiant, versement, parent, bacc WHERE versement.IdEtudiant = etudiant.IdEtudiant AND parent.IdEtudiant = etudiant.IdEtudiant AND bacc.IdEtudiant = etudiant.IdEtudiant"; 
  db.query(sql, (err, data) => {
    if (err) return res.json({Status: "Success"})
    return res.json(data);
 });
});

//pour lister les etudiants qui n'ont pas encore versé son inscription
app.get('/etnonvers', (req, res) =>{
  const sql= "SELECT e.* FROM etudiant e LEFT JOIN versement v ON e.IdEtudiant = v.IdEtudiant WHERE v.IdEtudiant IS NULL"; 
  db.query(sql, (err, data) => {
    if (err) return res.json({Status: "Success"})
    return res.json(data);
 });
});

//code d'ajout d'un Versement
app.post('/ajoutV', (req, res)=>{
  const IdEtudiant = req.body.IdEtudiant
  const Bordereau = req.body.Bordereau
  const Montant = req.body.Montant
  const DateVersement = req.body.DateVersement

  db.query(
      'INSERT INTO versement(IdEtudiant, Bordereau, Montant, DateVersement) VALUES(?,?,?,?)',
      [IdEtudiant, Bordereau,Montant,DateVersement], (err,result)=>{
          if(err){
            return res.json({Status: "Erreur"})
          }else{
            return res.json({Status: "Success"})
          }
      }
  );
});

// Suppression du versement 
app.delete('/versement/:IdVersement', (req, res) => {
  const idVersement = req.params.IdVersement;

  db.query('DELETE FROM versement WHERE IdVersement = ?', idVersement, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).json({ Status: 'Erreur' });
    } else {
      if (result.affectedRows === 0) {
        res.status(404).json({ Status: 'Erreur' });
      } else {
        res.status(200).json({ Status: 'Success' });
      }
    }
  });
});

app.listen(3001, ()=>{
    console.log("By, tu es connecté au port 3001")
});

// Modification d'un versement
// Route pour récupérer les détails d'un versement par ID
app.get('/versement/:id', (req, res) => {
  const idVers = req.params.id;
  db.query('SELECT * FROM versement WHERE IdVersement = ?', idVers, (err, result) => {
    if (err) {
      console.error('Erreur lors de la récupération des détails du versement: ' + err);
      res.status(500).json({ Status: 'Erreur' });
    } else {
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).json({ Status: 'Non trouvé' });
      }
    }
  });
});

app.put('/versement/:id', (req, res) => {
  const idVers = req.params.id;
  const {
    Bordereau,
    Montant,
    DateVersement,
  } = req.body;

  db.query(
    'UPDATE versement SET Bordereau=?, Montant=?, DateVersement=? WHERE IdVersement=?',
    [Bordereau, Montant, DateVersement, idVers],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ Status: 'Erreur' });
      } else {
        res.json({ Status: 'Success' });
      }
    }
  );
});

// STATISTIQUE
//pour lister les etudiants qui n'ont pas encore versé son inscription
app.get('/etnonvers', (req, res) =>{
  const sql= "SELECT e.* FROM etudiant e LEFT JOIN versement v ON e.IdEtudiant = v.IdEtudiant WHERE v.IdEtudiant IS NULL"; 
  db.query(sql, (err, data) => {
    if (err) return res.json({Status: "Success"})
    return res.json(data);
 });
});

// STATISTIQUE

//pour compter les porcentages des etudiants qui n'ont pas encore versé son inscription
app.get('/etnonversment', (req, res) =>{
  const pourcentage = "SELECT COUNT(DISTINCT e.IdEtudiant) AS TotalEtudiants, COUNT(DISTINCT v.IdEtudiant) AS EtudiantsAvecVersement, (COUNT(DISTINCT e.IdEtudiant) - COUNT(DISTINCT v.IdEtudiant)) AS EtudiantsSansVersement, (COUNT(DISTINCT v.IdEtudiant) / COUNT(DISTINCT e.IdEtudiant) * 100) AS PourcentageAvecVersement, ((COUNT(DISTINCT e.IdEtudiant) - COUNT(DISTINCT v.IdEtudiant)) / COUNT(DISTINCT e.IdEtudiant) * 100) AS PourcentageSansVersement FROM etudiant e LEFT JOIN versement v ON e.IdEtudiant = v.IdEtudiant";
  db.query(pourcentage, (err, data) => {
    if (err) return res.json({Status: "Success"})
    return res.json(data);
 });
});

//DECONNEXION

app.get('/logout', (req, res) => {
  // Détruire la session et rediriger vers la page d'accueil par exemple
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect('/');
    }
  });
});


app.post('/isLoggedIn', (req, res) => {
  if (req.session.userID) {
      let cols = [req.session.userID];
      db.query("SELECT * FROM utilisateur WHERE IdUtilisateur = ? LIMIT 1", cols, (err, data) => {
          if (err) { throw err }
          if (data && data.length === 1) {
              res.json({
                  success: true,
                  username: data[0].nom_utilisateur,
                  userId: data[0].id,
                  admin: data[0].admin,
                  usersInformation: data[0],
                  //token d'authentification envoyer de la partie back end
                  token: jwt.sign(
                      { userId: data[0].id },
                      'RANDOM_TOKEN_SECRET',
                      { expiresIn: '24h' }
                  )
              });
          }
          else {
              res.json({
                  success: false
              });
          }
      });
  }
  else {
      res.json({
          success: false
      });
  }
});
