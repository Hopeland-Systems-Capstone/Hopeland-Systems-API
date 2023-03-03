# Hopeland Systems API

> Hopeland Systems backend API for sensor, alert, apikey, and user data.
- Create/delete sensors
- Read sensor data
- Add timestamped sensor data
- Geospatial sensor filtering
- Create/delete alerts
- Filter alerts by epoch times
- Read alerts
- Create/delete API keys
- Update/read API key auth levels


#
## Install Packages
```
npm install
```

## Run in development mode
```
npm run dev
```

## Run normally
```
npm start
```

## Docker
```
docker build -t hopeland/backend-api:1.0 .
```
```
docker run -p 3000:3000 hopeland/backend-api:1.0
```

# API Usage
## Sensors:
```javascript
// Create sensor named sensor1 at longitude 10, latitude 20
sensor_api.createSensor("sensor1",10,20);

// Delete sensor named sensor1
sensor_api.deleteSensor("sensor1");

// Get all sensors within 100 meters of longitude 10, latitude 20
sensor_api.getSensorsByGeolocation(10,20,100);

// Get sensor data from sensor named sensor1
sensor_api.getSensorData("sensor1");

// Add battery value of 100 to sensor1
sensor_api.addSensorData("sensor1","battery",100);

// Add temperature value of 70 to sensor1
sensor_api.addSensorData("sensor1","temperature",70);
```

## Alerts:
```javascript
// Create a new alert titled "New Alert" with a message of "This is a test alert"
alerts_api.createAlert("New Alert","This is a test alert");

// Delete alert with alert_id 0
alerts_api.deleteAlert(0);

// Get all alerts from 1668466625 (Sat, 14 Nov 2022 22:57:05 GMT in epoch) to 1668898625 (Sat, 19 Nov 2022 22:57:05 GMT in epoch)
alerts_api.getAlerts(1668466625,1668898625, NaN, NaN);

// Get all alerts from last 15 days
alerts_api.getAlerts(NaN, NaN, 15, NaN);

// Get last 10 alerts
alerts_api.getAlerts(NaN, NaN, NaN, 10);

/*
getAlerts can have mixed parameters
Refer to REST API for more combination examples
*/
```

## API Keys:
```javascript
// Add API key 098f6bcd4621d373cade4e832627b4f6 with a default level of 1
apikeys_api.addKey("098f6bcd4621d373cade4e832627b4f6");

// Delete API key 098f6bcd4621d373cade4e832627b4f6
apikeys_api.deleteKey("098f6bcd4621d373cade4e832627b4f6");

// Add API key 4124bc0a9335c27f086f24ba207a4912 with a level of 0
apikeys_api.addKey("4124bc0a9335c27f086f24ba207a4912", 0);

// Check if API key 4124bc0a9335c27f086f24ba207a4912 exists
apikeys_api.keyExists("4124bc0a9335c27f086f24ba207a4912");

// Get API key level of 4124bc0a9335c27f086f24ba207a4912
apikeys_api.getKeyLevel("4124bc0a9335c27f086f24ba207a4912");

// Change API key level of 4124bc0a9335c27f086f24ba207a4912 to 1
apikeys_api.updateKeyLevel("4124bc0a9335c27f086f24ba207a4912", 1);
```

## Users:
```javascript
// Create a user with a name, username, and password
users_api.createUser("User1","user1@gmail.com","xxxx");

// Delete the user with user_id 0
users_api.deleteUser(0);

// Get the user who's name is User1
users_api.getUserByUsername("User1");

// Get the user who's email is user1@gmail.com
users_api.getUserByEmail("user1@gmail.com");

// Get all sensors User1 has access to
users_api.getUserSensorsByUsername("User1");

// Get all sensors user1@gmail.com has access to
users_api.getUserSensorsByEmail("user1@gmail.com");

// Check if User1's hashed password is xxxx
users_api.verifyUsernamePasswordCombo("User1","xxxx");

// Check if user1@gmail.com's hashed password is xxxx
users_api.verifyEmailPasswordCombo("user1@gmail.com","xxxx");

// Add sensor 0 to User1
users_api.addSensorToUserWithUsername("User1",0);

// Add sensor 0 to user1@gmail.com
users_api.addSensorToUserWithEmail("user1@gmail.com",0);

// Remove sensor 0 from User1
users_api.removeSensorFromUserWithUsername("User1",0);

// Remove sensor 0 from user1@gmail.com
users_api.removeSensorFromUserWithEmail("user1@gmail.com",0);
```

# REST API

## Sensors:
| Method | Path | Description |
|:------- |:-------|:------|
| **GET** | /sensors?key=val&sensor=val | Returns all sensors with name of `sensor` |
| **GET** | /sensors?key=val&longitude=val&latitude=val&distance=val | Returns all sensors within `distance` meters of `longitude` and `latitude` |

## Alerts:
| Method | Path | Description |
|:------- |:-------|:------|
| **GET** | /alerts?key=val&from=val | Returns all alerts from `from` to `to` epoch times |
| **GET** | /alerts?key=val&to=val | Returns all alerts from beginning of time to `to` epoch time |
| **GET** | /alerts?key=val&from=val&to=val | Returns all alerts from `from` epoch time to now |
| **GET** | /alerts?key=val&from=val&to=param&amount=val | Returns all alerts from `from` to `to` epoch times, but caps at `amount` alerts |
| **GET** | /alerts?key=val&days=val | Returns all alerts from the past `days` days |
| **GET** | /alerts?key=val&days=val&amount=val | Returns all alerts from the past `days` days, but caps at `amount` alerts |
| **GET** | /alerts?key=val&amount=val | Returns the last `amount` alerts |

## Rate Limiting:
> API keys are rate limited based on their level. By default, API keys are issued at Level 1.

| API Key Level | Time | Requests |
|:------- |:-------|:------|
| 0 | - | Unlimited |
| 1 | 10s | 10 |

# Database
> Data is stored in [MongoDB](https://www.mongodb.com/)

## Sensor Format
```json
[
    {
        "_id": "63785425c97a925662a44651",
        "sensor_id": 0,
        "name": "sensor1",
        "geolocation": {
            "type": "Point",
            "coordinates": [
                0,
                0
            ]
        },
        "battery": [
            {
                "time": 1668896333401,
                "value": 100
            }
        ],
        "temperature": [],
        "humidity": [],
        "co2": [],
        "pressure": []
    }
]
```

## Alert Format
```json
[
    {
        "_id": "636868574012fc7d47bfebaf",
        "alert_id": 0,
        "title": "New Alert",
        "alert": "This is a test alert",
        "time": 1667786839503
    }
]
```

## API Key Format
```json
[
    {
        "_id": "636850102c006ea387181db7",
        "key": "098f6bcd4621d373cade4e832627b4f6",
        "level": "1"
    }
]
```

## User Format
```json
[
    {
        "_id": "63f729a661a5521ee483e416",
        "user_id": 0,
        "name": "Jacob",
        "email": "jdpark10@asu.edu",
        "password": "aaa",
        "sensors": [],
    }
]
```
