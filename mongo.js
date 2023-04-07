const { MongoClient } = require('mongodb')

class Mongo {

    static async connect() {
        const credentials = 'X509-cert-2957358956160653009.pem'
        const client = new MongoClient('mongodb+srv://hopelandsystems.dobnt5r.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority', {
            sslKey: credentials,
            sslCert: credentials,
        });
        
        this.client = await client.connect();
        this.db = this.client.db("hopelandsystems");
        this.alerts = this.db.collection("alerts");
        
        if (! await this.alerts.findOne({
            "_id":"alert_id"
        })) {
            this.alerts.insertOne({
                "_id":"alert_id",
                "sequencevalue":0
            });
        }

        this.sensors = this.db.collection("sensors");

        if (! await this.sensors.findOne({
            "_id":"sensor_id"
        })) {
            this.sensors.insertOne({
                "_id":"sensor_id",
                "sequencevalue":0
            });
        }

        this.initializeGeospacialIndex();

        this.users = this.db.collection("users");

        if (! await this.users.findOne({
            "_id":"user_id"
        })) {
            this.users.insertOne({
                "_id":"user_id",
                "sequencevalue":0
            });
        }

        this.apikeys = this.db.collection("apikeys");
        console.log("Connected to MongoDB successfully");
        

        this.initializeSimulation(); //TODO: Delete this
    }

    static async initializeGeospacialIndex() {
        await this.sensors.createIndex({
            "geolocation":'2dsphere'
        });
    }

    static async initializeSimulation() { //TODO: Delete this
        const names = [
            {
              "First Name": "Garry",
              "Last Name": "Baker"
            },
            {
              "First Name": "Lucia",
              "Last Name": "Murray"
            },
            {
              "First Name": "Garry",
              "Last Name": "Adams"
            },
            {
              "First Name": "Ashton",
              "Last Name": "Crawford"
            },
            {
              "First Name": "Emily",
              "Last Name": "Kelley"
            },
            {
              "First Name": "Cherry",
              "Last Name": "Murray"
            },
            {
              "First Name": "Violet",
              "Last Name": "Richardson"
            },
            {
              "First Name": "Natalie",
              "Last Name": "Gray"
            },
            {
              "First Name": "Maximilian",
              "Last Name": "Harrison"
            },
            {
              "First Name": "Owen",
              "Last Name": "Cole"
            },
            {
              "First Name": "Dale",
              "Last Name": "Higgins"
            },
            {
              "First Name": "Cherry",
              "Last Name": "Holmes"
            },
            {
              "First Name": "Harold",
              "Last Name": "Roberts"
            },
            {
              "First Name": "Connie",
              "Last Name": "Wright"
            },
            {
              "First Name": "Daisy",
              "Last Name": "Carroll"
            },
            {
              "First Name": "Vivian",
              "Last Name": "Chapman"
            },
            {
              "First Name": "Adrian",
              "Last Name": "Scott"
            },
            {
              "First Name": "Brooke",
              "Last Name": "Hunt"
            },
            {
              "First Name": "Arianna",
              "Last Name": "Russell"
            },
            {
              "First Name": "Derek",
              "Last Name": "Parker"
            },
            {
              "First Name": "Heather",
              "Last Name": "Adams"
            },
            {
              "First Name": "Adrianna",
              "Last Name": "Bailey"
            },
            {
              "First Name": "Abigail",
              "Last Name": "Reed"
            },
            {
              "First Name": "Amanda",
              "Last Name": "Elliott"
            },
            {
              "First Name": "Maya",
              "Last Name": "Campbell"
            },
            {
              "First Name": "Darcy",
              "Last Name": "Turner"
            },
            {
              "First Name": "Stuart",
              "Last Name": "Gray"
            },
            {
              "First Name": "Arnold",
              "Last Name": "Edwards"
            },
            {
              "First Name": "Lilianna",
              "Last Name": "Owens"
            },
            {
              "First Name": "Grace",
              "Last Name": "Walker"
            },
            {
              "First Name": "Lyndon",
              "Last Name": "Edwards"
            },
            {
              "First Name": "Violet",
              "Last Name": "Chapman"
            },
            {
              "First Name": "Mike",
              "Last Name": "Hamilton"
            },
            {
              "First Name": "Kevin",
              "Last Name": "Kelly"
            },
            {
              "First Name": "Sam",
              "Last Name": "Wells"
            },
            {
              "First Name": "Carl",
              "Last Name": "Murphy"
            },
            {
              "First Name": "Gianna",
              "Last Name": "Baker"
            },
            {
              "First Name": "Edith",
              "Last Name": "Kelly"
            },
            {
              "First Name": "Amelia",
              "Last Name": "Johnston"
            },
            {
              "First Name": "Alen",
              "Last Name": "Hawkins"
            },
            {
              "First Name": "Belinda",
              "Last Name": "Morrison"
            },
            {
              "First Name": "Emma",
              "Last Name": "Hamilton"
            },
            {
              "First Name": "Sienna",
              "Last Name": "Richardson"
            },
            {
              "First Name": "Camila",
              "Last Name": "Craig"
            },
            {
              "First Name": "Emily",
              "Last Name": "Moore"
            },
            {
              "First Name": "Justin",
              "Last Name": "Turner"
            },
            {
              "First Name": "Kelvin",
              "Last Name": "Cooper"
            },
            {
              "First Name": "Lily",
              "Last Name": "Hall"
            },
            {
              "First Name": "Albert",
              "Last Name": "Miller"
            },
            {
              "First Name": "Connie",
              "Last Name": "Riley"
            },
            {
              "First Name": "Lana",
              "Last Name": "Scott"
            },
            {
              "First Name": "Ryan",
              "Last Name": "Armstrong"
            },
            {
              "First Name": "Lilianna",
              "Last Name": "Johnston"
            },
            {
              "First Name": "Amy",
              "Last Name": "Gibson"
            },
            {
              "First Name": "Frederick",
              "Last Name": "Kelly"
            },
            {
              "First Name": "Lana",
              "Last Name": "Evans"
            },
            {
              "First Name": "Sabrina",
              "Last Name": "Morgan"
            },
            {
              "First Name": "Savana",
              "Last Name": "Anderson"
            },
            {
              "First Name": "Violet",
              "Last Name": "Scott"
            },
            {
              "First Name": "Abigail",
              "Last Name": "Clark"
            },
            {
              "First Name": "Honey",
              "Last Name": "Kelly"
            },
            {
              "First Name": "Emily",
              "Last Name": "Evans"
            },
            {
              "First Name": "Miller",
              "Last Name": "Carroll"
            },
            {
              "First Name": "Vincent",
              "Last Name": "Bennett"
            },
            {
              "First Name": "Edward",
              "Last Name": "Richardson"
            },
            {
              "First Name": "Chloe",
              "Last Name": "Bennett"
            },
            {
              "First Name": "Alina",
              "Last Name": "Fowler"
            },
            {
              "First Name": "Natalie",
              "Last Name": "Casey"
            },
            {
              "First Name": "Andrew",
              "Last Name": "Perkins"
            },
            {
              "First Name": "James",
              "Last Name": "Ross"
            },
            {
              "First Name": "Adele",
              "Last Name": "Henderson"
            },
            {
              "First Name": "Amy",
              "Last Name": "Murphy"
            },
            {
              "First Name": "Rosie",
              "Last Name": "Cooper"
            },
            {
              "First Name": "Sophia",
              "Last Name": "Ferguson"
            },
            {
              "First Name": "Jenna",
              "Last Name": "Murray"
            },
            {
              "First Name": "Valeria",
              "Last Name": "Nelson"
            },
            {
              "First Name": "Lily",
              "Last Name": "Nelson"
            },
            {
              "First Name": "Charlotte",
              "Last Name": "Cole"
            },
            {
              "First Name": "Julia",
              "Last Name": "Morris"
            },
            {
              "First Name": "Steven",
              "Last Name": "Wells"
            },
            {
              "First Name": "Alexander",
              "Last Name": "Foster"
            },
            {
              "First Name": "Antony",
              "Last Name": "Hamilton"
            },
            {
              "First Name": "Chester",
              "Last Name": "Lloyd"
            },
            {
              "First Name": "Jenna",
              "Last Name": "Richards"
            },
            {
              "First Name": "Luke",
              "Last Name": "Scott"
            },
            {
              "First Name": "Brianna",
              "Last Name": "Kelly"
            },
            {
              "First Name": "Kirsten",
              "Last Name": "Henderson"
            },
            {
              "First Name": "Naomi",
              "Last Name": "Armstrong"
            },
            {
              "First Name": "Aida",
              "Last Name": "Thompson"
            },
            {
              "First Name": "Chelsea",
              "Last Name": "Williams"
            },
            {
              "First Name": "Sam",
              "Last Name": "Brooks"
            },
            {
              "First Name": "Abraham",
              "Last Name": "Morgan"
            },
            {
              "First Name": "Nicholas",
              "Last Name": "Gray"
            },
            {
              "First Name": "Steven",
              "Last Name": "Stewart"
            },
            {
              "First Name": "Jordan",
              "Last Name": "Bailey"
            },
            {
              "First Name": "Alen",
              "Last Name": "Warren"
            },
            {
              "First Name": "Clark",
              "Last Name": "Wright"
            },
            {
              "First Name": "Eddy",
              "Last Name": "Montgomery"
            },
            {
              "First Name": "Dale",
              "Last Name": "Jones"
            },
            {
              "First Name": "Jack",
              "Last Name": "Walker"
            }
           ];
          
          const USERS_TO_GENERATE = 20;
          const SENSORS_TO_GENERATE = 40;
          const ALERTS_TO_GENERATE = 10;
          const MS_TO_5MIN = 1000*60*5;
          
          var userList = [];
          var sensorList = [];
          var alertList = []
          
          function makePassword(n) {
            let result = '';
            const characters = "abcdefghijklmnopqrstuvwxyz";
            let counter = 0;
            while (counter < n) {
              result += characters.charAt(Math.floor(Math.random() * 26));
              counter++;
            }
            return result;
          }
          
          //USERS
          var uid = 100;
          for (uid = 100; uid < 100 + USERS_TO_GENERATE; uid++) {
            const n = names.shift();
            const a1 = names.shift();
            const a2 = names.shift();
            const a3 = names.shift();
            
            const name = `${n["First Name"]} ${n["Last Name"]}`;
            const email = `${n["First Name"]}${n["Last Name"]}@mail.com`;
            const password = makePassword(3);
            const phone_number = `${Math.round(Math.random() * 9999999999)}`;
            const company_name = "Hopeland";
            const timezone = "MST";
            const card = {
              number: `${Math.round(Math.random() * 9999999999999999)}`,
              expiration_month: `${Math.ceil(Math.random() * 12)}`,
              expiration_month: `${Math.ceil(Math.random() * 5) + 2023}`,
              cvc: `${Math.round(Math.random() * 999)}`
            }
            const bill = {
              time: Date.now(),
              amount: `${Math.ceil(Math.random() * 100)}`,
              status: "Unpaid"
            }
            const alarm1 = {
              name: `${a1["First Name"]} ${a1["Last Name"]}`,
              email: `${a1["First Name"]}${a1["Last Name"]}@mail.com`
            }
            const alarm2 = {
              name: `${a2["First Name"]} ${a2["Last Name"]}`,
              email: `${a2["First Name"]}${a2["Last Name"]}@mail.com`
            }
            const alarm3 = {
              name: `${a3["First Name"]} ${a3["Last Name"]}`,
              email: `${a3["First Name"]}${a3["Last Name"]}@mail.com`
            }
          
            userList.push({
              user_id: uid,
              name: name,
              email: email,
              password: password,
              phone_number: phone_number,
              company_name: company_name,
              timezone: timezone,
              cards: [card],
              active_card: `1`,
              bills: [bill],
              alarm_recipients: [alarm1, alarm2, alarm3]
            })
          }
          
          
          //SENSORS
          var sid = 100;
          for (sid = 100; sid < 100 + SENSORS_TO_GENERATE; sid++) {
            const name = `sensor${sid}`;
            const status = Math.random() > 0.5 ? `Online` : `Offline`;
            const last_update = Date.now();
            const geolocation = [Math.random()*4.3+32.7, Math.random()*4.8-109];
            const battery = {
              time: Date.now(),
              value: Math.random()*100
            }
            const temperature1 = {
              time: Date.now() - MS_TO_5MIN,
              value: Math.random()*20+60
            }
            const temperature2 = {
              time: Date.now() - 2 * MS_TO_5MIN,
              value: Math.random()*20+60
            }
            const temperature3 = {
              time: Date.now() - 3 * MS_TO_5MIN,
              value: Math.random()*20+60
            }
          
            const humidity1 = {
              time: Date.now() - MS_TO_5MIN,
              value: Math.random()*100
            }
            const humidity2 = {
              time: Date.now() - 2 * MS_TO_5MIN,
              value: Math.random()*100
            }
            const humidity3 = {
              time: Date.now() - 3 * MS_TO_5MIN,
              value: Math.random()*100
            }
          
            const co1 = {
              time: Date.now() - MS_TO_5MIN,
              value: Math.random()*300+400
            }
            const co2 = {
              time: Date.now() - 2 * MS_TO_5MIN,
              value: Math.random()*300+400
            }
            const co3 = {
              time: Date.now() - 3 * MS_TO_5MIN,
              value: Math.random()*300+400
            }
          
            const pressure1 = {
              time: Date.now() - MS_TO_5MIN,
              value: Math.random()*50+1000
            }
            const pressure2 = {
              time: Date.now() - 2 * MS_TO_5MIN,
              value: Math.random()*50+1000
            }
            const pressure3 = {
              time: Date.now() - 3 * MS_TO_5MIN,
              value: Math.random()*50+1000
            }
          
            sensorList.push({
              sensor_id: sid,
              name: name,
              status: status,
              last_update: last_update,
              geolocation: { coordinates: geolocation },
              battery: [battery],
              temperature: [temperature3,temperature2,temperature1],
              humidity: [humidity3,humidity2,humidity1],
              co2: [co3,co2,co1],
              pressure: [pressure3, pressure2, pressure1]
            })
          }

          var aid;
          for (aid = 0; aid < ALERTS_TO_GENERATE; aid++) {
            alertList.push({
                title: `Alert ${aid}`,
                alert: `This is an alert...`,
                time: Date.now() - Math.random()*10000*MS_TO_5MIN,
                associated_sensor: aid*4
            })
          }


        const sensor_api = require('./api/sensor_api');
        var i;
        for (i = 0; i < SENSORS_TO_GENERATE; i++) {
            const s = sensorList[i];
            const coord = s.geolocation.coordinates
            await sensor_api.createSensor(s.name,coord[1],coord[0]);
            var j;
            for (j = 0; j < 3; j++) {
                await sensor_api.addSensorData(s.name,"temperature",s.temperature[j]);
                await sensor_api.addSensorData(s.name,"humidity",s.humidity[j]);
                await sensor_api.addSensorData(s.name,"co2",s.co2[j]);
                await sensor_api.addSensorData(s.name,"pressure",s.pressure[j]);
            }
        }

        const users_api = require('./api/users_api');
        for (i = 0; i < USERS_TO_GENERATE; i++) {
            const u = userList[i];
            await users_api.createUser(u.name,u.email,u.password,u.phone_number,u.company_name,u.timezone);
            await users_api.addSensorToUserWithUsername(u.name,i*2+3)
            await users_api.addSensorToUserWithUsername(u.name,i*2+4)
        }

        const alerts_api = require('./api/alerts_api');
        for (i = 0; i < ALERTS_TO_GENERATE; i++) {
            const a = alertList[i];
            await alerts_api.createAlert(a.title,a.alert,a.associated_sensor);
        }

        //const sensors = await sensor_api.getSensorsByGeolocation(0,0,1000000);
        //console.log(sensors);

        //await sensor_api.addSensorData("sensor3", "battery", 100)
        
        //const alerts_api = require("./api/alerts_api");
        //alerts_api.createAlert("New Alert", "This is a test alert");

        //const apikeys_api = require('./api/apikeys_api')
        //const level = await apikeys_api.getKeyLevel("aaa");
        //console.log(level);

    }

}

Mongo.client = null
Mongo.db = null
Mongo.alerts = null
Mongo.sensors = null
Mongo.users = null
Mongo.apikeys = null

module.exports = { Mongo }