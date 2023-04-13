const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const users_api = require('../api/users_api');
const api_key_util = require('./util/api_key_util');

//GET | /users?key=apikey&username=name | Return user information when only given username
//GET | /users?key=apikey&email=email | Return user information when only given email
//GET | /users?key=apikey&username=name&hashed_password=hashed_password | Verify user password combo when given username and password
//GET | /users?key=apikey&email=email&hashed_password=hashed_password | Verify user password combo when given email and password
//GET | /users/:user_id/cards?key=val | Get all cards on file for a user
//GET | /users/:user_id/activeCard?key=val | Get the active card for a user
//GET | /users/:user_id/timezone | Get timezone for a user
//POST | /users?key=apikey&username=name&email=email&hashed_password=hashed_password&phone_number=0000000000&company_name=Hopeland&timezone=MST | Create new user given username, email, hashed_password (Optional phone_number, company_name, and timezone)
//POST | /users/:user_id/cards?cardNumber=cardNumber&nameOnCard=nameOnCard&cardExpiration=cardExpiration&cvc=cvc&address1=address1&address2=address2&city=city&state=state&country=country&zip=zip | Add a card for a user
//POST | /users/:user_id/cards/:card_id/update?cardNumber=cardNumber&nameOnCard=nameOnCard&cardExpiration=cardExpiration&cvc=cvc&address1=address1&address2=address2&city=city&state=state&country=country&zip=zip | Update a card for a user
//DELETE | /users?key=apikey&user_id=user_id | Delete user give user_id
//DELETE | /users?key=apikey&username=name&sensor_id=sensor_id | Delete sensor from user when given sensor_id and username
//DELETE | /users?key=apikey&email=email&sensor_id=sensor_id | Delete sensor from user when given sensor_id and email
//DELETE | /users?key=apikey&username=name&alert_id=alert_id | Delete alert from user when given alert_id and username
//DELETE | /users?key=apikey&email=email&alert_id=alert_id | Delete alert from user when given alert_id and email
//DELETE | /users/:user_id/cards/:card_id?key=val | Delete a card for a user
//PUT | /users?key=apikey&username=name&sensor_id=sensor_id | Add sensor to user when given sensor_id and name 
//PUT | /users?key=apikey&email=email&sensor_id=sensor_id | Add sensor to user when given sensor_id and email 
//PUT | /users?key=apikey&username=name&alert_id=alert_id | Add alert to user when given alert_id and username 
//PUT | /users?key=apikey&email=email&salert_id=alert_id | Add alert to user when given alert_id and email
//PUT | /users/:user_id/password?key=val&new=new_password&old=old_password | Update password for user
//PUT | /users/:user_id/timezone/:timezone?key=val | Set timezone for a user
//PUT | /users/:user_id/activeCard/:card_id?key=val | Set the active card for a user

// - User - getTimeZone(user_id) | Get timezone for a user | GET /users/:user_id/timezone
router.get("/:user_id/timezone", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (user_id) {
        const timezone = await users_api.getTimezone(user_id);
        return res.status(200).json(timezone);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

// - User - getActiveCard(user_id) | Get the active card for a user | GET /users/:user_id/activeCard
router.get("/:user_id/activeCard", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (user_id) {
        const activeCard = await users_api.getActiveCard(user_id);
        return res.status(200).json(activeCard);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

// - User - getCards(user_id) | Get all cards on file for a user | GET /users/:user_id/cards
router.get("/:user_id/cards", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);

    if (user_id) {

        const cards = await users_api.getCards(user_id);
        console.log(cards);
        return res.status(200).json(cards);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

// - User - addCard(user_id,cardNumber,nameOnCard,cardExpiration,cvc,address1,address2,city,state,country,zip) | Add a card for a user | POST /users/:user_id/cards?cardNumber=:cardNumber&nameOnCard=:nameOnCard&cardExpiration=:cardExpiration&cvc=:cvc&address1=:address1&address2=:address2&city=:city&state=:state&country=:country&zip=:zip
router.post("/:user_id/cards", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const card_number = req.query.cardNumber;
    const name_on_card = req.query.nameOnCard;
    const card_expiration = req.query.cardExpiration;
    const cvc = req.query.cvc;
    const address1 = req.query.address1;
    const address2 = req.query.address2;
    const city = req.query.city;
    const state = req.query.state;
    const country = req.query.country;
    const zip = req.query.zip;

    if (!user_id || !card_number || !name_on_card || !card_expiration || !cvc || !address1 || !city || !state || !country || !zip) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    try {
        await users_api.addCard(user_id, card_number, name_on_card, card_expiration, cvc, address1, address2, city, state, country, zip)
        return res.status(201).json({ message: 'Card created successfully.' });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error adding card to user.' });
    }
});

// - User - deleteCard(user_id,card_id) | Delete a card for a user | DELETE /users/:user_id/cards/:card_id
router.delete("/:user_id/cards/:card_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const card_id = parseInt(req.params.card_id);

    if (user_id && card_id) {
        await users_api.deleteCard(user_id, card_id);
        return res.status(200).json({ message: 'Deleted card successfully.' });
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

// - User - setActiveCard(user_id,card_id) | Set the active card for a user | PUT /users/:user_id/activeCard/:card_id
router.put("/:user_id/activeCard/:card_id", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const card_id = parseInt(req.params.card_id);

    if (user_id && card_id) {

        await users_api.setActiveCard(user_id, card_id)
        return res.status(200).json({ message: 'Set active card successfully.' });


    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

// - User - updateCard(user_id,card_id,cardNumber,nameOnCard,cardExpiration,cvc,address1,address2,city,state,country,zip) | Update a card for a user | POST /users/:user_id/cards/:card_id/update?cardNumber=:cardNumber&nameOnCard=:nameOnCard&cardExpiration=:cardExpiration&cvc=:cvc&address1=:address1&address2=:address2&city=:city&state=:state&country=:country&zip=:zip
router.post("/:user_id/cards/:card_id/update", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const card_id = parseInt(req.params.card_id);
    const card_number = req.query.cardNumber;
    const name_on_card = req.query.nameOnCard;
    const card_expiration = req.query.cardExpiration;
    const cvc = req.query.cvc;
    const address1 = req.query.address1;
    const address2 = req.query.address2;
    const city = req.query.city;
    const state = req.query.state;
    const country = req.query.country;
    const zip = req.query.zip;

    if (!user_id || !card_number || !name_on_card || !card_expiration || !cvc || !address1 || !city || !state || !country || !zip) {
        return res.status(400).json({ error: 'Invalid arguments.' });
    }

    try {
        await users_api.updateCard(user_id, card_id, card_number, name_on_card, card_expiration, cvc, address1, address2, city, state, country, zip);
        return res.status(201).json({ message: 'Card updated successfully.' });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error adding card to user.' });
    }
});

// - User - setTimeZone(user_id,timezone) | Set timezone for a user | PUT /users/:user_id/timezone/:timezone
router.put("/:user_id/timezone/:timezone", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const timezone = req.params.timezone;


    if (user_id && timezone) {

        if (await users_api.setTimezone(user_id, timezone)) {
            return res.status(201).json({ message: 'Timezone updated successfully.' });
        } else {
            return res.status(500).json({ message: 'Error updating timezone.' });
        }

    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

// - User - updatePassword(user_id,old_password,new_password) | Update password for user | PUT /users/:user_id/password?new=:new_password&old=:old_password
router.put("/:user_id/password", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = parseInt(req.params.user_id);
    const old_hashed_password = req.query.new;
    const new_hashed_password = req.query.old;

    if (user_id && new_hashed_password && old_hashed_password) {

        if (await users_api.updatePassword(user_id, old_hashed_password, new_hashed_password)) {
            return res.status(201).json({ message: 'Password updated successfully.' });
        } else {
            return res.status(500).json({ message: 'Error updating password.' });
        }

    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

router.get("/", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

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

    if (!await api_key_util.checkKey(res, req.query.key)) return;

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

    if (!await api_key_util.checkKey(res, req.query.key)) return;

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

    if (!await api_key_util.checkKey(res, req.query.key)) return;

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



module.exports = router;