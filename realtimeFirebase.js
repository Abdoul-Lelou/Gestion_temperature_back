const { initializeApp } = require( "firebase/app");
const { getDatabase, ref }= require ("firebase/database");

const firebaseConfig = {
    apiKey: "AIzaSyCZ2mPuQfYVX20hkbrZC9tnbFP3Hy61DbM",
    authDomain: "simplon-gestion-temp-humidite.firebaseapp.com",
    databaseURL: "https://simplon-gestion-temp-humidite-default-rtdb.firebaseio.com",
    projectId: "simplon-gestion-temp-humidite",
    storageBucket: "simplon-gestion-temp-humidite.appspot.com",
    messagingSenderId: "434355557530",
    appId: "1:434355557530:web:6bf38c74af83f6239b3b23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Realtime Database and get a reference to the service
const databaserRealtime = getDatabase(app);

const reference = ref(databaserRealtime)

module.exports = databaserRealtime;
