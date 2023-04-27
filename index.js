const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
var io = require("socket.io");
var ws = require('ws');

const routes = require('./routes/routes');
const app = express();

app.use(express.json());

app.use(bodyParser.json());
app.use(cors({origin: '*'}))

app.use('/api', routes)

app.listen(8000, () => {
    console.log(`Server Started at ${8000}`)
 })

 
//  var Serialport = require('serialport');
//  const { set, ref } = require('firebase/database');
//  const { databaserRealtime } = require('./firestoreConfig');
//  var Readline = Serialport.parsers.Readline;
 
//  console.log(Readline);
 
//  var port = new Serialport('/dev/ttyUSB0', {
//      baudRate: 9600
//  });
 
//  var parser = port.pipe(new Readline({ delimiter: '\r\n' }));
 
//  parser.on('readable', function() {
//      console.log('Connexion ouverte');
//  });
 
//  parser.on('data', data =>{
//      console.log('humidite :', data.slice(9, 11));
//      console.log('Temperature :', data.slice(26, 28));
//      addRealtimeWeather(data.slice(9, 11),data.slice(26, 28))
//    });
//  const addRealtimeWeather =(hum, temp)=>{
//          set(ref(databaserRealtime, 'realTime'), {
//                  hum:hum,
//         temp:temp
//       });
// }

// const addRealtimeWeather =(hum, temp)=>{
//     set(ref(databaserRealtime, 'realTime'), {
//         hum:hum,
//         temp:temp
//       });
// }

// parser.on('readable', function(data) {
//     // console.log(readable);
//     // io.emit('temp', data);
//     console.log(data);
//     //decoupe des donnees venant de la carte Arduino
//     var temperature = data.slice(0, 2); //decoupe de la temperature
//     var humidite = data.slice(5, 7); //decoupe de l'humidite
//     //calcul de la date et l'heure 
//     var datHeure = new Date();
//     var min = datHeure.getMinutes();
//     var heur = datHeure.getHours(); //heure
//     var sec = datHeure.getSeconds(); //secondes
//     var mois = datHeure.getDate(); //renvoie le chiffre du jour du mois 
//     var numMois = datHeure.getMonth() + 1; //le mois en chiffre
//     var laDate = datHeure.getFullYear(); // me renvoie en chiffre l'annee
//     if (numMois < 10) { numMois = '0' + numMois; }
//     if (mois < 10) { mois = '0' + mois; }
//     if (sec < 10) { sec = '0' + sec; }
//     if (min < 10) { min = '0' + min; }
//     var heureInsertion = heur + ':' + min + ':' + sec;
//     var heureEtDate = mois + '/' + numMois + '/' + laDate;
//     // TODO

//     //fin test
//     if ((heur == 08 && min == 00 && sec == 00) || (heur == 12 && min == 00 && sec == 00) || (heur == 19 && min == 00 && sec == 00)) {
//         var tempe = parseInt(temperature);
//         var humi = parseInt(humidite);
//         console.log("En number" + tempe);
//         console.log("En chaine de caractere" + temperature);
//         //l'objet qui contient la temperature, humidite et la date
//         var tempEtHum = { 'Temperature': tempe, 'Humidite': humi, 'Date': heureEtDate, 'Heure': heureInsertion };
//         //Connexion a mongodb et insertion Temperature et humidite
//         
//         console.log(tempEtHum);

//     } //Fin if
// });