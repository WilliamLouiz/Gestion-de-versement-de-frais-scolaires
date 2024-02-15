// authMiddleware.js

const requireAuth = (req, res, next) => {
    if (!req.session.user) {
      // Si l'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion
      return res.redirect('/');
    }
    // Si l'utilisateur est authentifié, continuez avec la demande
    next();
  };
  
module.exports = { requireAuth };