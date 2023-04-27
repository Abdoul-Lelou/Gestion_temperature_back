const express = require('express');
const adminFirebase = require('../firestoreConfig');
// const databaserRealtime = require('../firestoreConfig');
const testImage = require('./uploadImage');
const { reference,databaserRealtime } = require('../firestoreConfig');
const { ref, set, child, get, setWithPriority, onValue,storage }= require("firebase/database");
const { getStorage }= require("firebase/storage");
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateEmail, sendPasswordResetEmail, updateProfile }= require ("firebase/auth");
const fsAdmin = require('firebase-admin');
const { async } = require('@firebase/util');


const router = express.Router();

const dbAdmin = adminFirebase.dbAdmin;
const authFirestore = adminFirebase.authFirestore;

module.exports = router;

const auth = getAuth();

//Post Method
router.post('/login',   async(req, res) => {
    
  const { email, password } = req.body;
  
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    return res.send(user)  
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    return res.send(errorMessage)
  });
      

  
})

router.post('/logout/:id',   async(req, res) => {
    
  const uid = req.params.id
  fsAdmin.auth()
  .revokeRefreshTokens(uid)
  .then(() => {
    signOut(auth).then(() => {
      // Sign-out successful.
      return res.send('Token revoké avec succès');
    }).catch((error) => {
      res.send(error)
    });
    
  })
  // .then((userRecord) => {
  //   // const msg = new Date(userRecord).getTime() / 1000
  //   // return res.send('Token revoké avec succès');
  // })
  // .then((timestamp) => {
  //   console.log(`Tokens revoked at: ${timestamp}`)
  //   return res.send('timestamp');
  // });
      
  
})

router.post('/post',   (req, res) => {


  const token = req.headers.authorization?.split(' ')[1] || req.headers?.authorization;
  
  if(!token) return res.send("Veillez ajouter un token")
  
  const { email, password, prenom, nom,role} = req.body;
  let matricule = email.substring(0,2)+Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
  
    fsAdmin.auth().verifyIdToken(token, true)
    .then(async(user) => {
      // Token is valid.
      
      // Verifier le role
      if (user.role !='admin') {
        return res.sendStatus(403)
      }
      // async pour dire que c'est une fonction asynchrone
      try {
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            uidUser= user.uid;
            const id = user.uid;

            updateProfile(user,{displayName: prenom+' '+nom, phoneNumber: role})

            const userJson = {
            email: email,
            nom: nom,
            prenom:prenom,
            matricule:matricule,
            date_inscri: new Date().toISOString(),
            role:role,
            date_modif:new Date().toISOString(),
            // photo: photo
          };

          const usersDb = dbAdmin.collection('users'); 
          const response =  usersDb.doc(id).set(userJson);
          fsAdmin.auth().setCustomUserClaims(id, { role })
          
          return res.send("Utilisateur ajouté");
          
        }).catch((error)=>{
          return res.send(error)
        })
    
        } catch(error) {
          return res.send(error);
        }
    })
    .catch((error) => {
      if (error.code == 'auth/id-token-revoked') {
        // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
       
        return res.send('Token is revoked')
      } else {
      //   // Token is invalid.
        
        return res.send('Token is invalid')
      }
    });
    
})

router.get('/getAll', async  (req, res) => {

 
  const token = req.headers.authorization?.split(' ')[1] || req.headers?.authorization;

  if(!token) return res.send("Veillez ajouter un token")
  // console.log((await fsAdmin.auth().listUsers()).users.filter(e=> e.disabled));
  // fsAdmin?.auth().verifyIdToken(token, true)
  // .then(async(user) => {
    // Token is valid.
        try {    
          const userRef = dbAdmin.collection("users");
          const dataGet = [];
          const snapshot = await userRef.get();
          
          snapshot.forEach(doc => {
           
            let tmp={'id':doc.id,"data":doc.data()}
            dataGet.push(tmp)
          });
        return res.send(dataGet);
      } catch(error) {
        return res.send(error);
      }
  // })
  // .catch((error) => {
  //   if (error.code == 'auth/id-token-revoked') {
  //     // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
  //     return res.send('Token is revoked')
  //   } else {
  //   //   // Token is invalid.
  //     return res.send('Token is invalid')
  //   }
  // });

})

router.get('/getById/:id',  async (req, res) => {

  const token = req.headers.authorization?.split(' ')[1] || req.headers.authorization ;

  if(!token) return res.send("Veillez ajouter un token")

    fsAdmin?.auth().verifyIdToken(token, true)
    .then(async(user) => {
      // Token is valid.
      try {
        // recuperation de l'id du documment a modifier
          const id=req.params.id;
        //Recuperation des données envoyer par destructuration
          const {nom, prenom}= req.body
        // Recuperation du document via la collection et l'id
        // en utilisant le mot await qui est obligatoire si on declare
        // la function comme asynchrone
          const userRef = await dbAdmin.collection("users").doc(id).get()
          return res.send(userRef.data());
      }catch(error) {
        // renvoie de l'erreur en cas d'echec
          return res.send(error);
      }
    })
    .catch((error) => {
      if (error.code == 'auth/id-token-revoked') {
        // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
        // console.log("Token is revoked");
        return res.send('Token is revoked')
      } else {
      //   // Token is invalid.
        return res.send('Token is invalid')
      }
    }); 
})

router.patch('/update/:id',  async (req, res) => {

    const token = req.headers.authorization?.split(' ')[1] || req.headers?.authorization;

    if(!token) return res.send("Veillez ajouter un token")

    fsAdmin?.auth().verifyIdToken(token, true)
    .then(async(user) => {
      // Token is valid.

      if (user.role !='admin') {
        return res.sendStatus(403)
      }
      // async pour dire que c'est une fonction asynchrone
      try {
        // recuperation de l'id du documment a modifier
          const id= req.params.id.trim();
        //Recuperation des données envoyer par destructuration
          const {nom, prenom}= req.body
        // Recuperation du document via la collection et l'id
        // en utilisant le mot await qui est obligatoire si on declare
        // la function comme asynchrone
       
          
          const userRef = await dbAdmin.collection("users").doc(id)
          // Mise à jour des champs specifier
          .update({
            nom:nom,
            prenom:prenom,
            date_modif:new Date().toISOString(),
          });
          // renvoie de la reponse
          return res.send("Utilisateur modifié");
      }catch(error) {
        // renvoie de l'erreur en cas d'echec
          return res.send(error);
      }
    })
    .catch((error) => {
      if (error.code == 'auth/id-token-revoked') {
        // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
        
        return res.send('Token is revoked')
      } else {
      //   // Token is invalid.
        
        return res.send('Token is invalid')
      }
    });
})

router.patch('/switch/:id',   async(req, res) => {


  const token = req.headers.authorization?.split(' ')[1] || req.headers?.authorization ;
  // const role = "admin";
  // const role = "user";


  // if(!token) return res.send("Veillez ajouter un token")
    
  //   fsAdmin?.auth().verifyIdToken(token, true)
  //   .then(async(user) => {
      // Token is valid.
      try {
        // recuperation de l'id du documment a modifier
          const id=req.params.id.split(' ').join('');
          //Recupere le user via son id
          const userRef = await  fsAdmin?.auth().getUser(id)
      
          //Verification du role de l'utilisateur

          if(userRef.customClaims?.role == "admin"){
            const role ="user"
            fsAdmin?.auth().setCustomUserClaims(id,{role})
            await dbAdmin.collection("users").doc(id)
          // Mise à jour des champs specifier
            .update({
              role:role,
              date_modif:new Date().toISOString(),
            });
          }else{
            const role ="admin"
            fsAdmin?.auth().setCustomUserClaims(id,{role})
            await dbAdmin.collection("users").doc(id)
          // Mise à jour des champs specifier
            .update({
              role:role,
              date_modif:new Date().toISOString(),
            });
          }
          
          return res.send("Role modifié");
      }catch(error) {
        // renvoie de l'erreur en cas d'echec
          return res.send(error);
      }
    
    
})

router.get('/getActif', async  (req, res) => {
 
  const token = req.headers.authorization?.split(' ')[1] || req.headers?.authorization 
 
  if(!token) return res.send("Veillez ajouter un token")
  const users = (await fsAdmin?.auth().listUsers()).users.filter(e=> e.disabled)

  fsAdmin?.auth().verifyIdToken(token, true)
  .then(async(user) => {
    // Token is valid.
        try {    
          const userRef = dbAdmin.collection("users");
          const dataGet = [];
          const snapshot = await userRef.get();

          snapshot.forEach(doc => {
            if (!users.find(e=> e.uid == doc.id)) {
              let tmp={'id':doc.id,"data":doc.data()}
              dataGet.push(tmp)
            }
          });
        return res.send(dataGet);
      } catch(error) {
        return res.send(error);
      }
  })
  .catch((error) => {
    if (error.code == 'auth/id-token-revoked') {
      // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
      return res.send('Token is revoked')
    } else {
    //   // Token is invalid.
      
      return res.send('Token is invalid')
    }
  });



})

router.get('/getDisabled', async  (req, res) => {
 
  const token = req.headers?.authorization ||  req.headers.authorization?.split(' ')[1];
 
  if(!token) return res.send("Veillez ajouter un token")
  const users = (await fsAdmin?.auth().listUsers()).users.filter(e=> e.disabled)

  fsAdmin?.auth().verifyIdToken(token, true)
  .then(async(user) => {
    // Token is valid.
        try {    
          const userRef = dbAdmin.collection("users");
          const dataGet = [];
          const snapshot = await userRef.get();

          snapshot.forEach(doc => {
            if (users.find(e=> e.uid == doc.id)) {
              let tmp={'id':doc.id,"data":doc.data()}
              dataGet.push(tmp)
            }
          });
        return res.send(dataGet);
      } catch(error) {
        return res.send(error);
      }
  })
  .catch((error) => {
    if (error.code == 'auth/id-token-revoked') {
      // Token has been revoked. Inform the user to reauthenticate or signOut() the user.
      return res.send('Token is revoked')
    } else {
    //   // Token is invalid.
      
      return res.send('Token is invalid')
    }
  });

})

router.post('/addImage/:id', (req,res)=>{

  const id = req.params.id;
  return false;
  testImage(req.files,id)
  // const storage = getStorage();
  // const storageRef = sRef(storage, 'some-child');

  // // 'file' comes from the Blob or File API
  // uploadBytes(storageRef, req.body.img).then((snapshot) => {
  //   console.log('Uploaded a blob or file!');
  // });
  // const storage = getStorage();
  // const mountainsRef = ref(storage, req.body.img);
  // const uploadTask = uploadBytesResumable(storageRef, req.body.img);

  // uploadTask.on("state_changed",
  //     (snapshot) => {
  //       const progress =
  //         Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
  //       // setProgresspercent(progress);
  //       console.log(progress);
  //     },
  //     (error) => {
  //       console.log(error);
  //     },
  //     () => {
  //       getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
  //         // setImgUrl(downloadURL)
  //         console.log(downloadURL)
  //       });
  //     }
  //   );
})

router.post('/temperature', (req, res)=>{
  const {matin, midi, soir,moy} = req.body;

  set(ref(databaserRealtime, 'temperature'), {
    matin: matin,
    midi: midi,
    soir : soir,
    moy : moy
  });
})

router.post('/humidite', (req, res)=>{
  const {matin, midi, soir, moy} = req.body;

  set(ref(databaserRealtime, 'humidite'), {
    matin: matin,
    midi: midi,
    soir : soir,
    moy : moy
  }).then(e=> {return res.send(e)})
})

router.post('/semaine', (req, res)=>{
  const {lundi,mardi,mercredi,jeudi,vendredi,samedi, dimanche} = req.body;

  try {
    set(ref(databaserRealtime, 'historique_semaine'), {
      lundi: lundi,
      mardi: mardi,
      mercredi : mercredi,
      jeudi: jeudi,
      vendredi: vendredi,
      samedi: samedi,
      dimanche: dimanche
    }).then(e=> {return res.send("ajouté")}).catch(e=> {return res.send(e)})
  
    
  
  } catch (error) {
    return res.send(error)
  }

})

router.post('/user/updateEmail', async(req, res)=>{
    
    const { email, password,newEmail } = req.body;
  
  try {
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user) {
        updateEmail(user, newEmail).then(() => {
          
          return res.send('Email updated!')
        }).catch((error) => {
          res.send('An error occurred!')
        });
      }else{
        return res.send('Utilisateur introuvable')
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      return res.send(errorMessage)
    });
  } catch (error) {
    return res.send(error)
  }
    
 
})

router.post('/user/editPassword', async(req, res)=>{
  
  const { email } = req.body;
  
  try {

    sendPasswordResetEmail(auth, email)
    .then((e) => {
      // Password reset email sent!
      return res.send("Email envoyé à l'adresse "+email)
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      return res.send(errorMessage);
    });
    
  } catch (error) {
    return res.send(error)
  }
  

})

router.post('/user/disable/:id', async(req, res)=>{
  const uid = req.params.id
  const {email} = req.body;
  try {

    let test = (await (await fsAdmin?.auth().getUserByEmail(email)).disabled) //.users.filter(e=> e.disabled)
    // console.log(test == true);
    // return
    if (!test) {
        fsAdmin?.auth()?.updateUser(uid,{
        disabled: true,
      })
      return res.send("Utilisateur desactivé")    
    }else{
      return res.send("Utilisateur introuvable")    
    }
  } catch (error) {
    // return res.send(error)
  }
  

})

router.post('/user/enable/:id', async(req, res)=>{
  const uid = req.params.id
  
  const { email } = req.body;
  
  try {
    fsAdmin?.auth().updateUser(uid,{
      disabled: false,
    })
    return res.send("Utilisateur réactivé")  
  } catch (error) {
    return res.send(error)
  }
  

})

const getRealtimeData=()=>{
  const starCountRef = ref(databaserRealtime,  'historique/');
  onValue(starCountRef, (snapshot) => {
    const data = snapshot.val();
    // updateStarCount(postElement, data);
    
  });
}

const addTempHum = ()=>{
  try {

    var datHeure = new Date();
    var min = datHeure.getMinutes();
    var heur = datHeure.getHours(); //heure
    var sec = datHeure.getSeconds(); //secondes
    var mois = datHeure.getDate(); //renvoie le chiffre du jour du mois 
    var numMois = datHeure.getMonth() + 1; //le mois en chiffre
    var laDate = datHeure.getFullYear(); // me renvoie en chiffre l'annee
    if (numMois < 10) { numMois = '0' + numMois; }
    if (mois < 10) { mois = '0' + mois; }
    if (sec < 10) { sec = '0' + sec; }
    if (min < 10) { min = '0' + min; }
    var heureInsertion = heur + ':' + min + ':' + sec;
    var heureEtDate = mois + '/' + numMois + '/' + laDate;

    set(ref(databaserRealtime, 'historique/'), 

      {
        lundi:{'matin':{"temp": 32, "hum": 28},'midi':{"temp": 32, "hum": 28},'soir':{"temp": 32, "hum": 28}},
        mardi:{'matin':{"temp": 32, "hum": 28},'midi':{"temp": 32, "hum": 28},'soir':{"temp": 32, "hum": 28}},
        mercredi:{'matin':{"temp": 32, "hum": 28},'midi':{"temp": 32, "hum": 28},'soir':{"temp": 32, "hum": 28}},
        jeudi:{'matin':{"temp": 32, "hum": 28},'midi':{"temp": 32, "hum": 28},'soir':{"temp": 32, "hum": 28}},
        vendredi:{'matin':{"temp": 32, "hum": 28},'midi':{"temp": 32, "hum": 28},'soir':{"temp": 32, "hum": 28}},
        samedi:{'matin':{"temp": 32, "hum": 28},'midi':{"temp": 32, "hum": 28},'soir':{"temp": 32, "hum": 28}},
        dimanche:{'matin':{"temp": 19, "hum": 28},'midi':{"temp": 26, "hum": 28},'soir':{"temp": 17, "hum": 28}},

      }

    )
  
    // return res.send("ajouté")
  
  } catch (error) {
    // return res.send(error)
    // console.log(error);
    
  }
}

