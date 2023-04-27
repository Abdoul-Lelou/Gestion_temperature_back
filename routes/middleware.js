const fs = require('firebase-admin');

const checkToken=(req, res, next) =>{
    let checkRevoked = true;
    // fs.auth().verifyIdToken()
  // getAuth()
  let idToken = req.headers.authorization && req.headers.authorization.split(' ')[1]; //req.headers["authorization"].split(" ")[1];
  
  if (!token) {
    return res.status(403).send({ message: "Veillez ajouter un token..!" });
  }

  fs.auth().verifyIdToken(idToken, checkRevoked)
    .then((payload) => {
      // Token is valid.
      console.log("Token is valid");
      next();
    })
    .catch((error) => {
      if (error.code == 'auth/id-token-revoked') {
        // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
        console.log("Token is revoked");
        return res.status(403).send({ message: "Accès non authorisé!" });
      } else {
        // Token is invalid.
        console.log("Token is invalid");
        return res.status(401).send({ message: "Token non valid" });
      }
    });
}

module.exports = checkToken;