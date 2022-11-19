# Hopeland Systems API

Hopeland Systems backend API for sensor, alert, apikey, and user data.
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
    npm install

## Run in development mode
    npm run dev

# API
## Sensors:
TODO

## Alerts:
TODO

## API Keys:
TODO

# REST API

## Sensors:
| Method | Path | Description |
|:------- |:-------|:------|
| **GET** | /data?key=val&sensor=val | Returns all sensors with name of `sensor` |
| **GET** | /data?key=val&longitude=val&latitude=val&distance=val | Returns all sensors within `meters` of `longitude` and `latitude` |

## Alerts:
| Method | Path | Description |
|:------- |:-------|:------|
| **GET** | /alerts?key=val&from=val | Returns all alerts from `from` epoch to `to` epoch times |
| **GET** | /alerts?key=val&to=val | Returns all alerts from beginning of time to `to` epoch time |
| **GET** | /alerts?key=val&from=val&to=val | Returns all alerts from `from` epoch time to now |
| **GET** | /alerts?key=val&from=val&to=param&amount=val | Returns all alerts from `from` to `to` epoch times, but caps at `amount` alerts |
| **GET** | /alerts?key=val&days=val | Returns all alerts from the past `days` days |
| **GET** | /alerts?key=val&days=val&amount=val | Returns all alerts from the past `days` days, but caps at `amount` alerts |
| **GET** | /alerts?key=val&amount=val | Returns the last `amount` alerts |

## Rate Limiting:
API keys are rate limited based on their level. By default, API keys are issued at Level 1.
| API Key Level | Time | Requests |
|:------- |:-------|:------|
| 0 | - | Unlimited |
| 1 | 10s | 10 |
