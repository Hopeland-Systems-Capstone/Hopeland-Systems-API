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

// Get sensor status of sensor 0
sensor_api.getStatus(0)

// Set sensor status of sensor 0
sensor_api.setStatus(0,"Online")

// Get name of sensor 0
sensor_api.getName(0)

// Get readings for battery from sensor 0 from 1 epoch time to another
sensor_api.getReadings(0,"battery",1668466625,1668898625)

// Get last reading for battery from sensor 0
sensor_api.getLastReading(0,"battery")

// Get last update time for sensor 0
sensor_api.getLastUpdate(0)

// Count online sensors for user 0
sensor_api.getOnline(0)

// Count offline sensors for user 0
sensor_api.getOffline(0)
```

## Alerts:
```javascript
// Create a new alert titled "New Alert" with a message of "This is a test alert" and associated with sensor_id 0
alerts_api.createAlert("New Alert","This is a test alert",0);

// Delete alert with alert_id 0
alerts_api.deleteAlert(0);

// Get all alerts from 1668466625 (Sat, 14 Nov 2022 22:57:05 GMT in epoch) to 1668898625 (Sat, 19 Nov 2022 22:57:05 GMT in epoch)
alerts_api.getAlerts(1668466625,1668898625, NaN, NaN);

// Get all alerts from last 15 days
alerts_api.getAlerts(NaN, NaN, 15, NaN);

// Get last 10 alerts
alerts_api.getAlerts(NaN, NaN, NaN, 10);

// Get sensor id associated with alert 0
alerts_api.getSensor(0)

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
// Create a user with a name, username, password, phone number, company name, and timezone. Phone number, company name, and timezone are optional.
users_api.createUser("User1","user1@gmail.com","xxxx","4801234567","Hopeland","MST");

// Update a user's basic information (name, email, phone number, company name)
users_api.updateUser(0,"User1","user1@gmail.com","0000000000","Hopeland")

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

// Add alert with alert id 0 to user User1
users_api.addAlertToUserWithUsername("User1", 0)

// Add alert with alert id 0 to user user1@gmail.com
users_api.addAlertToUserWithEmail("user1@gmail.com", 0)

// Remove alert with alert id 0 from user User1
users_api.removeAlertFromUserWithUsername("User1", 0)

// Remove alert with alert id 0 from user user1@gmail.com
users_api.removeAlertFromUserWithEmail("user1@gmail.com", 0)

// Get all alerts from user with id 0
users_api.getAlerts(0)

// Get email for user with id 0
users_api.getEmail(0)

// Get name for user with id 0
users_api.getName(0)

// Get company name for user with id 0
users_api.getCompanyName(0)

// Get phone number for user with id 0
users_api.getPhoneNumber(0)

// Get timezone for user with id 0
users_api.getTimezone(0)

// Set timezone for user with id 0
users_api.setTimezone(0,"MST")

// Update password for user with id 0 (Password values should be hashed values)
users_api.updatePassword(0,"oldPassword","newPassword")

// Add new card for user with user_id 0
users_api.addCard(0, card_number, name, expiration, cvc, address1, address2, city, state, country, zip)

// Update card with card_id 1 for user with user_id 0
users_api.updateCard(0, 1, card_number, name, expiration, cvc, address1, address2, city, state, country, zip)

// Delete card with card_id 1 for user with user_id 0
users_api.deleteCard(0, 1)

// Get user_id 0's active card
users_api.getActiveCard(0)

// Set user_id 0's active card to their card with card_id 5
users_api.setActiveCard(0, 5)

// Get a list of all user_id 0's cards
users_api.getCards(0)

// Create a bill for user with user_id 0 using an epoch time and for $100
users_api.createBill(0, 1680591084, 100)

// Set user with user_id 0's bill with id 1 to status Paid
users_api.updateBill(0, 1, "Paid")

// Delete bill with bill_id 1 for user with user_id 0
users_api.deleteBill(0, 1)

// Get a list of all user_id 0's bills
users_api.getBills(0)

// Make John Doe with email joedoe@gmail.com an alarm recipient for user with id 0
users_api.addAlarmRecipient(0, "John Doe", "johndoe@gmail.com")

// Delete alarm recipient with id 1 from user with id 0
users_api.deleteAlarmRecipient(0, 1)

// Get a list of user with id 0's alarm recipients
users_api.getAlarmRecipients(0)

// Get alarm recipient status for recipient with id 1 for user with id 0
users_api.getAlarmRecipientStatus(0, 1)

// Set alarm recipient status to disabled for recipient with id 2 for user with id 0
users_api.setAlarmRecipientStatus(0, 2, false)
```

# REST API

## Sensors:
| Method | Path | Description |
|:------- |:-------|:------|
| **GET** | /sensors?key=val&sensor=val | Returns all sensors with name of `sensor` |
| **GET** | /sensors?key=val&longitude=val&latitude=val&distance=val | Returns all sensors within `distance` meters of `longitude` and `latitude` |
| **GET** | /sensors?key=val&username=val | Return all sensors a user has access to given username |
| **GET** | /sensors?key=val&email=val | Return all sensors a user has access to given email |
| **POST** | /sensors?key=val&sensor=val&longitude=val&latitude=val | Create a sensor with a `name`, `longitude`, and `latitude` |
| **DELETE** | /sensors?key=val&sensor=val | Delete a sensor with a `sensor` name |
| **PUT** | /sensors?key=val&sensor=val&datatype=val&value=val | Add new data of `datatype` with `value` to `sensor` with name |
| **GET** | /sensors/:sensor_id/name?key=val | Return sensor name given `sensor_id`|
| **GET** | /sensors/:sensor_id/status?&key=val | Return sensor status given `sensor_id`|
| **PUT** | /sensors/:sensor_id/status/:status?&key=val | Set sensor with `sensor_id` to `status`|
| **GET** | /sensors/:sensor_id/readings?dataType=dataType&timeStart=timeStart&timeEnd=timeEnd&key=val | Return sensor readings of `dataType` from `timeStart` to `timeEnd` for `sensor_id`|
| **GET** | /sensors/:sensor_id/lastReading?dataType=:dataType&key=val | Return last sensor reading of `dataType` for `sensor_id`|
| **GET** | /sensors/:sensor_id/LastUpdate?key=val | Return last sensor update for `sensor_id`|


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
| **POST** | /alerts?key=val&title=val&alert=val&associated_sensor=val | Create an alert with `title` and `alert` and associated with sensor_id `associated_sensor` |
| **DELETE** | /alerts?key=val&alert_id=val | Delete an alert given an `alert_id` |
| **GET** | /alerts/:alert_id/sensor?key=val | Return sensor_id associated with `alert_id`|

## Users:
| Method | Path | Description |
|:------- |:-------|:------|
| **GET** | /users?key=val&username=val | Return user information when only given username |
| **GET** | /users?key=val&email=val | Return user information when only given email |
| **GET** | /users?key=val&username=val&hashed_password=val | Verify user password combo when given username and password |
| **GET** | /users?key=val&email=val&hashed_password=val | Verify user password combo when given email and password |
| **POST** | /users?key=val&username=val&email=val&hashed_password=val&phone_number=val&company_name=val&timezone=val | Create new user given username, email, hashed_password, and optional phone_number, company_name, and timezone |
| **DELETE** | /users?key=val&user_id=val | Delete user give user_id |
| **DELETE** | /users?key=val&username=val&sensor_id=val | Delete sensor from user when given sensor_id and username |
| **DELETE** | /users?key=val&email=val&sensor_id=val | Delete sensor from user when given sensor_id and email |
| **DELETE** | /users?key=val&username=val&alert_id=val | Delete alert from user when given alert_id and username |
| **DELETE** | /users?key=val&email=val&alert_id=val | Delete alert from user when given alert_id and email |
| **PUT** | /users?key=val&username=val&sensor_id=val | Add sensor to user when given sensor_id and name |
| **PUT** | /users?key=val&email=val&sensor_id=val | Add sensor to user when given sensor_id and email |
| **PUT** | /users?key=val&username=val&alert_id=val | Add alert to user when given alert_id and username |
| **PUT** | /users?key=val&email=val&salert_id=val | Add alert to user when given alert_id and email |
| **PUT** | /users/user_id/update?name=name&email=email&phone_number=phone_number&company_name=company_name&key=val | Update user's `user_id` name, email, phone number, company name |
| **GET** | /users/user_id/alerts?key=val| Return Alerts for user with `user_id` |
| **GET** | /users/user_id/email?key=val | Return Email for user with `user_id` |
| **GET** | /users/user_id/name?key=val | Return Name for user with `user_id` |
| **GET** | /users/user_id/companyName?key=val | Return Company Name for user with `user_id` |
| **GET** | /users/user_id/phoneNumber?key=val | Return Phone Number for user with `user_id` |
| **GET** | /users/:user_id/sensors/countOnline?key=val | Return amount of online sensors for user `user_id`|
| **GET** | /users/:user_id/sensors/countOffline?key=val | Return amount of offline sensors for user `user_id`|

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
        "status":"Online",
        "last_update":1668896333401,
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
        "time": 1667786839503,
        "associated_sensor": 0
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
        "phone_number":"0000000000",
        "company_name":"Hopeland",
        "timezone":"MST",
        "cards":[],
        "active_card":-1,
        "bills":[],
        "alarm_recipients":[],
        "sensors":[],
        "alerts":[]
    }
]
```
