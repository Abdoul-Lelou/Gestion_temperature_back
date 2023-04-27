const { getStorage, ref, uploadBytes } =require ("firebase/storage");
const adminFirebase = require('../firestoreConfig');
const { readFileSync } = require("node:fs");

const testImage= (file,uid)=>{
    const storage = getStorage();
const storageRef = ref(storage, 'images');
 //firebase.storage().ref("users").child(user.uid);
console.log(storageRef);
// return;
// 'file' comes from the Blob or File API
uploadBytes(storageRef, file).then((snapshot) => {
  console.log('Uploaded a blob or file!');
  var storageRef = adminFirebase.dbAdmin.collection("users").doc(uid).update({
    image: snapshot
  })
})
}

module.exports = testImage;