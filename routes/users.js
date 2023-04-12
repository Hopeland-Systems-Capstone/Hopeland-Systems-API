const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const users_api = require('../api/users_api');
const api_key_util = require('./util/api_key_util');

//GET | /users?key=apikey&username=name | Return user information when only given username
//GET | /users?key=apikey&email=email | Return user information when only given email
//GET | /users?key=apikey&username=name&hashed_password=hashed_password | Verify user password combo when given username and password
//GET | /users?key=apikey&email=email&hashed_password=hashed_password | Verify user password combo when given email and password
//GET | /users/:user_id/bills | Returns list of bills belonging to the indicated user_id |
//GET | /users/:user_id/alarmRecipients | Returns list of alarm recipients belonging to the indicated user_id |
//GET | /users/:user_id/alarmRecipients/:alarm_recipient_id/enabled | Returns whether an alarm recipient, given its alarm_recipient_id and associated user_id, is enabled |
//POST | /users?key=apikey&username=name&email=email&hashed_password=hashed_password&phone_number=0000000000&company_name=Hopeland&timezone=MST | Create new user given username, email, hashed_password (Optional phone_number, company_name, and timezone)
//POST | /users/:user_id/bills?billing_date=val&amount=val | Creates a new bill and adds bill to an indicated user_id given billing_date and amount |
//POST | /users/:user_id/alarmRecipients?name=val&email=val | Creates a new alarm recipient and adds alarm recipient to an indicated user_id given name and email|
//DELETE | /users?key=apikey&user_id=user_id | Delete user give user_id
//DELETE | /users?key=apikey&username=name&sensor_id=sensor_id | Delete sensor from user when given sensor_id and username
//DELETE | /users?key=apikey&email=email&sensor_id=sensor_id | Delete sensor from user when given sensor_id and email
//DELETE | /users?key=apikey&username=name&alert_id=alert_id | Delete alert from user when given alert_id and username
//DELETE | /users?key=apikey&email=email&alert_id=alert_id | Delete alert from user when given alert_id and email
//DELETE | /users/:user_id/bills/:bill_id | Deletes the bill with a given bill_id from the indicated user_id |
//DELETE | /users/:user_id/alarmRecipients/:alarm_recipient_id | Deletes the alarm recipient with a given alarm_recipient_id from the indicated user_id |
//PUT | /users?key=apikey&username=name&sensor_id=sensor_id | Add sensor to user when given sensor_id and name 
//PUT | /users?key=apikey&email=email&sensor_id=sensor_id | Add sensor to user when given sensor_id and email 
//PUT | /users?key=apikey&username=name&alert_id=alert_id | Add alert to user when given alert_id and username 
//PUT | /users?key=apikey&email=email&salert_id=alert_id | Add alert to user when given alert_id and email
//PUT | /users/:user_id/bills/:bill_id/update?status=val | Updates the bill when given status |
//PUT | /users/:user_id/alarmRecipients/:alarm_recipient_id/enabled/:enabled | Updates the alarm recipient when given enabled (must be true or false) |

router.get("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const username = req.query.username;
    const email = req.query.email;
    const hashed_password = req.query.hashed_password;
    
    if (hashed_password) {
        if (username) {
            const valid = await users_api.verifyUsernamePasswordCombo(username, hashed_password);
            return res.status(200).json(valid);
        } else if (email) {
            const valid = await users_api.verifyEmailPasswordCombo(email, hashed_password);
            return res.status(200).json(valid);
        } else {
            return res.status(400).json({ error: 'Invalid arguments.' });
        }
    }

    if (username && email) {
        return res.status(400).json({ error: 'Can only specify username or password.' });
    }

    if (username) {
        const user = await users_api.getUserByUsername(username);
        return res.status(200).json(user);
    }

    if (email) {
        const user = await users_api.getUserByEmail(email);
        return res.status(200).json(user);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

router.post("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const username = req.query.username;
    const email = req.query.email;
    const hashed_password = req.query.hashed_password;
    const phone_number = req.query.phone_number;
    const company_name = req.query.company_name;
    const timezone = req.query.timezone;

    if (!username || !email || !hashed_password) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    try {
        if (await users_api.createUser(username, email, hashed_password, phone_number, company_name, timezone)) {
            return res.status(201).json({ message: 'User created successfully.' });
        } else {
            return res.status(500).json({ message: 'Error creating user.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating user.' });
    }
});

router.delete("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = req.query.user_id;
    const username = req.query.username;
    const email = req.query.email;
    const sensor_id = req.query.sensor_id;
    const alert_id = req.query.alert_id;

    if (sensor_id) {
        if (username) {
            await users_api.removeSensorFromUserWithUsername(username, sensor_id);
            return res.status(200).json({ message: `Removed ${sensor_id} from user with name ${username}.` });
        } else if (email) {
            await users_api.removeSensorFromUserWithEmail(email, sensor_id);
            return res.status(200).json({ message: `Removed ${sensor_id} from user with email ${email}.` });
        } else {
            return res.status(400).json({ error: 'Invalid arguments.' });
        }
    }
    
    if (alert_id) {
        if (username) {
            await users_api.removeAlertFromUserWithUsername(username, alert_id);
            return res.status(200).json({ message: `Removed ${alert_id} from user with name ${username}.` });
        } else if (email) {
            await users_api.removeAlertFromUserWithEmail(email, alert_id);
            return res.status(200).json({ message: `Removed ${alert_id} from user with email ${email}.` });
        } else {
            return res.status(400).json({ error: 'Invalid arguments.' });
        }
    }

    if (user_id) {
        if (await users_api.deleteUser(user_id)) {
            return res.status(200).json({ message: 'User deleted successfully.' });
        } else {
            return res.status(500).json({ message: 'Error deleting user.' });
        }
    }

    return res.status(400).json({ error: 'Invalid arguments.' });

});

router.put("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const username = req.query.username;
    const email = req.query.email;
    const sensor_id = req.query.sensor_id;
    const alert_id = req.query.alert_id;

    if (sensor_id) {
        if (username) {
            await users_api.addSensorToUserWithUsername(username, sensor_id);
            return res.status(200).json({ message: `Added ${sensor_id} to user with name ${username}.` });
        } else if (email) {
            await users_api.addSensorToUserWithEmail(email, sensor_id);
            return res.status(200).json({ message: `Added ${sensor_id} to user with email ${email}.` });
        } else {
            return res.status(400).json({ error: 'Invalid arguments.' });
        }
    }
    
    if (alert_id) {
        if (username) {
            await users_api.addAlertToUserWithUsername(username, alert_id);
            return res.status(200).json({ message: `Added ${alert_id} to user with name ${name}.` });
        } else if (email) {
            await users_api.addAlertToUserWithEmail(email, alert_id);
            return res.status(200).json({ message: `Added ${alert_id} to user with email ${email}.` });
        } else {
            return res.status(400).json({ error: 'Invalid arguments.' });
        }
    }

    return res.status(400).json({ error: 'Invalid arguments.' });

});

router.post("/:user_id/bills", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const billing_date = parseInt(req.query.billing_date);
    const amount = parseFloat(req.query.amount);

    if (user_id === NaN || amount === NaN || billing_date === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.createBill(user_id, billing_date, amount);
        return res.status(200).json({ message: `Created a new bill for $${amount} and added to user with id ${user_id}` });
    }
});

router.put("/:user_id/bills/:bill_id/update", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const bill_id = parseInt(req.params.bill_id);
    const status = req.query.status;

    if (user_id === NaN || bill_id === NaN || !status) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.updateBill(user_id, bill_id, status);
        return res.status(200).json({ message: `Updated bill with id ${bill_id} for user with id ${user_id} to the status of ${status}`});
    }
});

router.delete("/:user_id/bills/:bill_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const bill_id = parseInt(req.params.bill_id);

    if (user_id === NaN || bill_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.deleteBill(user_id, bill_id);
        return res.status(200).json({ message: `Deleted bill with id ${bill_id}`});
    }
});

router.get("/:user_id/bills", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (user_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        const bills = await users_api.getBills(user_id)
        return res.status(200).json(bills);
    }
});

router.post("/:user_id/alarmRecipients", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const name = req.query.name;
    const email = req.query.email;

    if (user_id === NaN || !name || !email) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.addAlarmRecipient(user_id, name, email);
        return res.status(200).json({ 
            message: `Added ${name} with email ${email} to alarm recipients of user with id ${user_id}`
        });
    }
});

router.delete("/:user_id/alarmRecipients/:alarm_recipient_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const recipient_id = parseInt(req.params.alarm_recipient_id);

    if (user_id === NaN || recipient_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.deleteAlarmRecipient(user_id, recipient_id);
        return res.status(200).json({ 
            message: `Removed alarm recipient with id ${recipient_id} from user with id ${user_id}`
        });
    }    
});

router.get("/:user_id/alarmRecipients", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (user_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        const recipients = await users_api.getAlarmRecipients(user_id);
        return res.status(200).json(recipients);
    }
});

router.get("/:user_id/alarmRecipients/:alarm_recipient_id/enabled", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const recipient_id = parseInt(req.params.alarm_recipient_id);

    if (user_id === NaN || recipient_id === NaN) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        const status = await users_api.getAlarmRecipientStatus(user_id, recipient_id);
        return res.status(200).json(status);
    }    
});

router.put("/:user_id/alarmRecipients/:alarm_recipient_id/enabled/:enabled", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res,req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const recipient_id = parseInt(req.params.alarm_recipient_id);
    const enabled = req.params.enabled === "false" ? false : (req.params.enabled === "true" ? true : -1);

    if (user_id === NaN || recipient_id === NaN || enabled === -1) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    } else {
        await users_api.setAlarmRecipientStatus(user_id, recipient_id, enabled);
        return res.status(200).json({ 
            message: `Set status of alarm recipient with id ${recipient_id} from user with id ${user_id} to ${enabled}`
        });
    }    
});

module.exports = router;