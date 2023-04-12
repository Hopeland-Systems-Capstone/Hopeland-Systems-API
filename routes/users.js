const express = require("express");
const router = express.Router();
const limiter = require('./rate_limit/rate_limiting').limiter
const users_api = require('../api/users_api');
const api_key_util = require('./util/api_key_util');

//GET | /users?key=apikey&username=name | Return user information when only given username
//GET | /users?key=apikey&email=email | Return user information when only given email
//GET | /users?key=apikey&username=name&hashed_password=hashed_password | Verify user password combo when given username and password
//GET | /users?key=apikey&email=email&hashed_password=hashed_password | Verify user password combo when given email and password
//POST | /users?key=apikey&username=name&email=email&hashed_password=hashed_password&phone_number=0000000000&company_name=Hopeland&timezone=MST | Create new user given username, email, hashed_password (Optional phone_number, company_name, and timezone)
//DELETE | /users?key=apikey&user_id=user_id | Delete user give user_id
//DELETE | /users?key=apikey&username=name&sensor_id=sensor_id | Delete sensor from user when given sensor_id and username
//DELETE | /users?key=apikey&email=email&sensor_id=sensor_id | Delete sensor from user when given sensor_id and email
//DELETE | /users?key=apikey&username=name&alert_id=alert_id | Delete alert from user when given alert_id and username
//DELETE | /users?key=apikey&email=email&alert_id=alert_id | Delete alert from user when given alert_id and email
//PUT | /users?key=apikey&username=name&sensor_id=sensor_id | Add sensor to user when given sensor_id and name 
//PUT | /users?key=apikey&email=email&sensor_id=sensor_id | Add sensor to user when given sensor_id and email 
//PUT | /users?key=apikey&username=name&alert_id=alert_id | Add alert to user when given alert_id and username 
//PUT | /users?key=apikey&email=email&salert_id=alert_id | Add alert to user when given alert_id and email

//GET | /users/:user_id/cards/getCards?key=apikey | Get the cards for a user
//GET | /users/:user_id/cards/getActiveCard?key=apikey | Get the user's active cards
//GET | /users/:user_id/getTimeZone?key=apikey | Get the user's timezone
//POST | /users/:user_id/cards/addCard?key=apikey&card_number=card_number&name_on_card=name_on_card&card_expiration=card_expiration&cvc=cvc&address1=address1&address2=address2&city=city&state=state&country=country&zip=zip | Add a card to a user's account
//DELETE | /users/:user_id/cards/:card_id/deleteCard?key=apikey | Delete a card from a user's account
//PUT | /users/:user_id/updatePassword?key=apikey&old_hashed_password=old_hashed_password&new_hashed_password=new_hashed_password | Update a user's password, confirm using the old password
//PUT | /users/:user_id/setTimeZone?key=apikey&timezone=timezone | Set the user's timezone
//PUT | /users/:user_id/cards/:card_id/updateCard?key=apikey&card_number=card_number&name_on_card=name_on_card&card_expiration=card_expiration&cvc=cvc&address1=address1&address2=address2&city=city&state=state&country=country&zip=zip | Update a user's card
//PUT | /users/:user_id/cards/:card_id/setActiveCard?key=apikey | Set the user's active card

//GET | /users/:user_id/getTimeZone?key=apikey | Get the user's timezone
router.get("/:user_id/getTimeZone", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = req.params.user_id;

    if (user_id) {
        const timezone = await users_api.getTimezone(user_id);
        return res.status(200).json(timezone);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

//GET | /users/:user_id/cards/getActiveCard?key=apikey | Get the user's active cards
router.get("/:user_id/getActiveCard", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = req.params.user_id;

    if (user_id) {
        const activeCard = users_api.getActiveCard(user_id);
        return res.status(200).json(activeCard);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

//GET | /users/:user_id/cards/getCards?key=apikey | Get the cards for a user
router.get("/:user_id/cards/getCards", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = req.params.user_id;

    if (user_id) {
        const cards = users_api.getCards(user_id);
        return res.status(200).json(cards);
    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

//POST | /users/:user_id/cards/addCard?key=apikey&card_number=card_number&name_on_card=name_on_card&card_expiration=card_expiration&cvc=cvc&address1=address1&address2=address2&city=city&state=state&country=country&zip=zip | Add a card to a user's account
router.post("/:user_id/cards/addCard", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = req.params.user_id;
    const card_number = req.query.card_number;
    const name_on_card = req.query.name_on_card;
    const card_expiration = req.query.card_expiration;
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
        if (await users_api.addCard(user_id, card_number, name_on_card, card_expiration, cvc, address1, address2, city, state, country, zip)) {
            return res.status(201).json({ message: 'Card created successfully.' });
        } else {
            return res.status(500).json({ message: 'Error adding card to user.' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error adding card to user.' });
    }
});

//DELETE | /users/:user_id/cards/:card_id/deleteCard?key=apikey | Delete a card from a user's account
router.delete("/:user_id/cards/:card_id/deleteCard", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = req.params.user_id;
    const card_id = req.query.card_id;

    if (user_id && card_id) {

        if (await users_api.deleteCard(user_id, card_id)) {
            return res.status(200).json( { message: 'Deleted card successfully.' });
        } else {
            return res.status(500).json( { message: 'Error deleting card.' });
        }

    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

//PUT | /users/:user_id/cards/:card_id/setActiveCard?key=apikey | Set the user's active card
router.put("/:user_id/cards/:card_id/setActiveCard", limiter, async (req, res, next) => {
    
    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = req.params.user_id;
    const card_id = req.params.card_id;

    if (user_id && card_id) {

        if (await users_api.setActiveCard(user_id, card_id)) {
            return res.status(200).json( { message: 'Set active card successfully.' });
        } else {
            return res.status(500).json( { message: 'Error setting active card.' });
        }

    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

//PUT | /users/:user_id/cards/:card_id/updateCard?key=apikey&card_number=card_number&name_on_card=name_on_card&card_expiration=card_expiration&cvc=cvc&address1=address1&address2=address2&city=city&state=state&country=country&zip=zip | Update a user's card
router.put("/:user_id/cards/:card_id/updateCard", limiter, async (req, res, next) => {

    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = req.params.user_id;
    const card_id = req.params.card_id;
    const card_number = req.query.card_number;
    const name_on_card = req.query.name_on_card;
    const card_expiration = req.query.card_expiration;
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
        if (await users_api.updateCard(user_id, card_id, card_number, name_on_card, card_expiration, cvc, address1, address2, city, state, country, zip)) {
            return res.status(201).json({ message: 'Card updated successfully.' });
        } else {
            return res.status(500).json({ message: 'Error updating card.' });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Error adding card to user.' });
    }
});

//PUT | /users/:user_id/setTimeZone?key=apikey&timezone=timezone | Set the user's timezone
router.put("/:user_id/setTimezone", limiter, async (req, res, next) => {
    
    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = req.params.user_id;
    const timezone = req.query.timezone;

    if(user_id && timezone) {

        if(await users_api.setTimezone(user_id, timezone)) {
            return res.status(201).json({ message: 'Timezone updated successfully.' });
        } else {
            return res.status(500).json({ message: 'Error updating card.' });
        }

    }

    return res.status(400).json({ error: 'Invalid arguments.' });
});

//PUT | /users/:user_id/updatePassword?key=apikey&old_hashed_password=old_hashed_password&new_hashed_password=new_hashed_password | Update a user's password, confirm using the old password
router.put("/:user_id/updatePassword", limiter, async (req, res, next) => {
    
    if (!await api_key_util.checkKey(res, req.query.key)) return;

    const user_id = req.params.user_id;
    const old_hashed_password = req.query.old_hashed_password;
    const new_hashed_password = req.query.new_hashed_password;

    if(user_id && new_hashed_password && old_hashed_password) {

        if(await users_api.updatePassword(user_id, old_hashed_password, new_hashed_password)) {
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