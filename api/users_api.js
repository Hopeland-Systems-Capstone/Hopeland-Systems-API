const { Mongo } = require('../mongo.js');

/**
 * Returns next user id
 * @returns {Number}
 */
async function getNextUserID() {
    const sequence = await Mongo.users.findOneAndUpdate({
       "_id":`user_id`
    },{ $inc: { "sequencevalue":1 },},{ new:true }
    );
    return sequence.value.sequencevalue;
 }

/**
 * Create a new user with a name, email, and hashed_password
 * @param {String} name
 * @param {String} email
 * @param {String} hashed_password
 * @param {String} phone_number
 * @param {String} company_name
 * @param {String} timezone
 */
async function createUser(name, email, hashed_password, phone_number = "", company_name = "", timezone = "") {

    const nameExists = await Mongo.users.findOne({
        "name":`${name}`
    });
    if (nameExists) {
        console.log(`User with name: ${name} already exists.`);
        return;
    }

    const emailExists = await Mongo.users.findOne({
        "email":`${email}`
    });
    if (emailExists) {
        console.log(`User with email: ${email} already exists.`);
        return;
    }

    const user_id = await getNextUserID();
    Mongo.users.insertOne({
        "user_id":user_id,
        "name":`${name}`,
        "email":`${email}`,
        "password":`${hashed_password}`,
        "phone_number":`${phone_number}`,
        "company_name":`${company_name}`,
        "timezone":`${timezone}`,
        "cards":[],
        "active_card":-1,
        "bills":[],
        "alarm_recipients":[],
        "sensors":[],
        "alerts":[]
    });
    console.log(`Created new user with name: ${name} and email ${email}.`);
}

/**
 * Update a user's basic information
 * @param {Number} user_id
 * @param {String} name
 * @param {String} email
 * @param {String} phone_number
 * @param {String} company_name
 */
async function updateUser(user_id, name, email, phone_number = "", company_name = "") {

    const exists = await Mongo.users.findOne({
        "user_id":user_id
    });
    if (!exists) {
        console.log(`User with id ${user_id} does not exist.`);
        return;
    }

    await Mongo.users.updateOne(
        { "user_id": user_id },
        { $set: {
            "name":`${name}`,
            "email":`${email}`,
            "phone_number":`${phone_number}`,
            "company_name":`${company_name}`
        } }
    );

    console.log(`Updated user ${user_id} with name: ${name}, email ${email}, phone_number ${phone_number}, and company_name ${company_name}.`);
}

/**
 * Delete a user given a user_id
 * @param {Number} user_id
 */
 async function deleteUser(user_id) {
    const result = Mongo.users.deleteOne({
        "user_id":parseInt(user_id),
    });
    if (result.deletedCount === 1) {
        console.log(`Deleted user with user_id: ${user_id}.`);
    }
}

/**
 * Get user given a user_id
 * @param {Number} user_id
 */
async function getUser(user_id) {

    const result = await Mongo.users.find({
        "user_id":user_id
    });

    if (result) {
        console.log(`Found user with id ${user_id}.`);
    } else {
        console.log(`Did not find any user with this user_id.`);
        return null;
    }
    return result;
}

/**
 * Get all the sensors a user has access to
 * @param {Number} user_id
 */
async function getUserSensors(user_id) {

    const projection = { sensors: 1, _id: 0 };

    const exists = await Mongo.users.findOne({
        "user_id":user_id
    }, projection);
    if (!exists) {
        console.log(`User with id: ${user_id} does not exist.`);
        return;
    }

    return JSON.parse(JSON.stringify(exists));
}

/**
 * Check if a username/password combo is correct
 * @param {Number} user_id
 * @param {String} hashed_password
 */
async function verifyUserPassword(user_id, hashed_password) {

    const exists = await Mongo.users.findOne({
        "user_id":user_id,
        "password":`${hashed_password}`
    });
    if (!exists) {
        console.log(`User ${user_id} with hashed password ${hashed_password} is invalid.`);
        return false;
    }

    return true;
}

/**
 * Add a sensor to a user's list of sensors
 * @param {Number} user_id
 * @param {Number} sensor_id
 */
async function addSensorToUser(user_id, sensor_id) {
    await Mongo.users.updateOne({
        "user_id":user_id
    }, {
        $addToSet: {
            "sensors": sensor_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Added sensor with sensor_id ${sensor_id} to ${user_id}'s sensors.`);
            } else {
                console.log(`Sensor with sensor_id ${sensor_id} already exists in ${user_id}'s sensors.`);
            }
        } else {
            console.log(`User with id ${user_id} does not exist.`);
        } 
    });
}

/**
 * Remove a sensor from a user's list of sensors
 * @param {Number} user_id
 * @param {Number} sensor_id
 */
async function removeSensorFromUser(user_id, sensor_id) {
    await Mongo.users.updateOne({
        "user_id":user_id
    }, {
        $pull: {
            "sensors": sensor_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Removed sensor with sensor_id ${sensor_id} from ${user_id}'s sensors.`);
            } else {
                console.log(`Sensor with sensor_id ${sensor_id} does not exist in ${user_id}'s sensors.`);
            }
        } else {
            console.log(`User with id ${user_id} does not exist.`);
        } 
    });
}

/**
 * Add an alert to a user's list of alerts
 * @param {Number} user_id
 * @param {Number} alert_id
 */
async function addAlertToUser(user_id, alert_id) {
    await Mongo.users.updateOne({
        "user_id":user_id
    }, {
        $addToSet: {
            "alerts": alert_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Added alert with alert_id ${alert_id} to ${user_id}'s alerts.`);
            } else {
                console.log(`Alert with alert_id ${alert_id} already exists in ${user_id}'s alerts.`);
            }
        } else {
            console.log(`User with id ${user_id} does not exist.`);
        } 
    });
}

/**
 * Remove an alert from a user's list of alert
 * @param {Number} user_id
 * @param {Number} alert_id
 */
async function removeAlertFromUser(user_id, alert_id) {
    await Mongo.users.updateOne({
        "user_id":user_id
    }, {
        $pull: {
            "alerts": alert_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Removed alert with alert_id ${alert_id} from ${user_id}'s alerts.`);
            } else {
                console.log(`Alert with alert_id ${alert_id} does not exist in ${user_id}'s alerts.`);
            }
        } else {
            console.log(`User with id ${user_id} does not exist.`);
        } 
    });
}

/**
 * Remove an alert from a user's list of alert
 * @param {String} email
 * @param {Number} alert_id
 */
async function removeAlertFromUserWithEmail(email, alert_id) {
    await Mongo.users.updateOne({
        "email":`${email}`
    }, {
        $pull: {
            "alerts": alert_id
        }
    }).then((res) => {
        if (res.matchedCount > 0) {
            if (res.modifiedCount > 0) {
                console.log(`Removed alert with alert_id ${alert_id} from ${email}'s alerts.`);
            } else {
                console.log(`Alert with alert_id ${alert_id} does not exist in ${email}'s alerts.`);
            }
        } else {
            console.log(`User with email ${email} does not exist.`);
        } 
    });
}

/**
 * Get all alerts for a user
 * @param {Number} user_id
 */
async function getAlerts(user_id) {

    const exists = await Mongo.users.findOne({
        "user_id":user_id
    });
    if (!exists) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    return exists.alerts;
}

/**
 * Get email for a user
 * @param {Number} user_id
 */
async function getEmail(user_id) {

    const exists = await Mongo.users.findOne({
        "user_id":user_id
    });
    if (!exists) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    return exists.email;
}

/**
 * Get name for a user
 * @param {Number} user_id
 */
async function getName(user_id) {

    const exists = await Mongo.users.findOne({
        "user_id":user_id
    });
    if (!exists) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    return exists.name;
}

/**
 * Get company name for a user
 * @param {Number} user_id
 */
async function getCompanyName(user_id) {

    const exists = await Mongo.users.findOne({
        "user_id":user_id
    });
    if (!exists) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    return exists.company_name;
}

/**
 * Get phone number for a user
 * @param {Number} user_id
 */
async function getPhoneNumber(user_id) {

    const exists = await Mongo.users.findOne({
        "user_id":user_id
    });
    if (!exists) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    return exists.phone_number;
}

/**
 * Get timezone for a user
 * @param {Number} user_id
 */
async function getTimezone(user_id) {

    const exists = await Mongo.users.findOne({
        "user_id":user_id
    });
    if (!exists) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    return exists.timezone;
}

/**
 * Set timezone for a user
 * @param {Number} user_id
 * @param {String} timezone
 */
async function setTimezone(user_id, timezone) {
    const exists = await Mongo.users.findOne({ "user_id": user_id });
    if (!exists) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    await Mongo.users.updateOne({ "user_id": user_id }, { $set: { "timezone":`${timezone}` } });
}

/**
 * Update password for a user
 * @param {Number} user_id
 * @param {String} old_password
 * @param {String} new_password
 */
async function updatePassword(user_id, old_password, new_password) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }
    if (user.password !== old_password) {
        console.log(`Old password does not match current password.`);
        return null;
    }
    await Mongo.users.updateOne({ "user_id": user_id }, { $set: { password:`${new_password}` } });
}

/**
 * Gets the next available card ID by finding the highest existing card ID in the database and adding 1 to it.
 *
 * @returns {number} - The next available card ID.
 */
async function getNextCardID() {
    const result = await Mongo.users.aggregate([
      { $unwind: "$cards" },
      { $group: { _id: null, maxCardID: { $max: "$cards.card_id" } } }
    ]).toArray();
    
    const maxCardID = result[0].maxCardID || 0;
    
    return maxCardID + 1;
  }

/**
 * Adds a new card to the specified user's account and sets it as the active card.
 *
 * @param {string} user_id - The ID of the user to add the card to.
 * @param {string} cardNumber - The card number of the new card.
 * @param {string} nameOnCard - The name on the new card.
 * @param {string} cardExpiration - The expiration date of the new card.
 * @param {string} cvc - The security code of the new card.
 * @param {string} address1 - The first line of the billing address for the new card.
 * @param {string} address2 - The second line of the billing address for the new card.
 * @param {string} city - The city of the billing address for the new card.
 * @param {string} state - The state of the billing address for the new card.
 * @param {string} country - The country of the billing address for the new card.
 * @param {string} zip - The zip code of the billing address for the new card.
 */
async function addCard(user_id, cardNumber, nameOnCard, cardExpiration, cvc, address1, address2, city, state, country, zip) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return;
    }

    const card_id = await getNextCardID();
    
    const newCard = {
      "card_id": card_id,
      "cardNumber": cardNumber,
      "nameOnCard": nameOnCard,
      "cardExpiration": cardExpiration,
      "cvc": cvc,
      "address1": address1,
      "address2": address2,
      "city": city,
      "state": state,
      "country": country,
      "zip": zip
    };
    
    await Mongo.users.updateOne(
        { "user_id": user_id },
        { $push: { "cards": newCard }, $set: { "active_card": card_id } }
    );
    
    console.log(`Added card with id ${card_id} and number ${cardNumber} to user with id ${user_id}.`);
}

/**
 * Updates the specified card for the given user with the new values.
 *
 * @param {string} user_id - The ID of the user who owns the card to update.
 * @param {number} card_id - The ID of the card to update.
 * @param {string} cardNumber - The new card number for the card.
 * @param {string} nameOnCard - The new name on the card.
 * @param {string} cardExpiration - The new expiration date for the card.
 * @param {string} cvc - The new security code for the card.
 * @param {string} address1 - The new first line of the billing address for the card.
 * @param {string} address2 - The new second line of the billing address for the card.
 * @param {string} city - The new city of the billing address for the card.
 * @param {string} state - The new state of the billing address for the card.
 * @param {string} country - The new country of the billing address for the card.
 * @param {string} zip - The new zip code of the billing address for the card.
 */
async function updateCard(user_id, card_id, cardNumber, nameOnCard, cardExpiration, cvc, address1, address2, city, state, country, zip) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return;
    }
  
    const cardIndex = user.cards.findIndex((card) => card.card_id === card_id);
    if (cardIndex === -1) {
      console.log(`Card with id ${card_id} not found for user with id ${user_id}.`);
      return;
    }
  
    const updatedCard = {
      "card_id": card_id,
      "cardNumber": cardNumber,
      "nameOnCard": nameOnCard,
      "cardExpiration": cardExpiration,
      "cvc": cvc,
      "address1": address1,
      "address2": address2,
      "city": city,
      "state": state,
      "country": country,
      "zip": zip
    };
  
    await Mongo.users.updateOne(
      { "user_id": user_id, "cards.card_id": card_id },
      { $set: { "cards.$": updatedCard } }
    );
  
    console.log(`Updated card with id ${card_id} for user with id ${user_id}.`);
  }
  
  /**
 * Deletes the specified card for the given user.
 *
 * @param {string} user_id - The ID of the user who owns the card to delete.
 * @param {number} card_id - The ID of the card to delete.
 */
async function deleteCard(user_id, card_id) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return;
    }
  
    const cardIndex = user.cards.findIndex((card) => card.card_id === card_id);
    if (cardIndex === -1) {
      console.log(`Card with id ${card_id} not found for user with id ${user_id}.`);
      return;
    }
  
    await Mongo.users.updateOne(
      { "user_id": user_id },
      { $pull: { "cards": { "card_id": card_id } } }
    );
  
    console.log(`Deleted card with id ${card_id} for user with id ${user_id}.`);
  }
  
/**
 * Gets the ID of the active card for the given user.
 *
 * @param {string} user_id - The ID of the user whose active card ID to get.
 * @returns {number|null} The ID of the active card, or null if the user or active card is not found.
 */
async function getActiveCard(user_id) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return null;
    }
  
    const activeCardId = user.active_card;
    const activeCard = user.cards.find((card) => card.card_id === activeCardId);
    if (!activeCard) {
      console.log(`Active card with id ${activeCardId} not found for user with id ${user_id}.`);
      return null;
    }
  
    return activeCardId;
  }
  
  
  /**
   * Sets the active card for the given user.
   *
   * @param {string} user_id - The ID of the user whose active card to set.
   * @param {number} card_id - The ID of the card to set as the active card.
   */
  async function setActiveCard(user_id, card_id) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return;
    }
  
    const card = user.cards.find((card) => card.card_id === card_id);
    if (!card) {
      console.log(`Card with id ${card_id} not found for user with id ${user_id}.`);
      return;
    }
  
    await Mongo.users.updateOne(
      { "user_id": user_id },
      { $set: { "active_card": card_id } }
    );
  
    console.log(`Set active card with id ${card_id} for user with id ${user_id}.`);
  }
  
/**
 * Gets all the cards for the given user.
 *
 * @param {string} user_id - The ID of the user whose cards to get.
 * @returns {Object[]} An array of card objects for the user, or an empty array if the user is not found or has no cards.
 */
async function getCards(user_id) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return [];
    }
  
    const cards = user.cards || [];
    return cards;
  }
  
/**
 * Generates a new unique bill ID.
 *
 * @returns {number} A new unique bill ID.
 */
async function getNextBillID() {
    const sequence = await Mongo.users.findOneAndUpdate({
        "_id":`bill_id`
    },{ $inc: { "sequencevalue":1 },},{ new:true }
    );
    return sequence.value.sequencevalue;
    }

/**
 * Creates a new bill for the given user.
 *
 * @param {string} user_id - The ID of the user to create the bill for.
 * @param {number} billing_date - The billing date of the bill as a Unix timestamp.
 * @param {number} amount - The amount of the bill.
 */
async function createBill(user_id, billing_date, amount) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return;
    }
  
    const bill_id = await getNextBillID();
    const newBill = {
      "bill_id": bill_id,
      "billing_date": billing_date,
      "amount": amount,
      "status": "Unpaid"
    };
  
    await Mongo.users.updateOne(
      { "user_id": user_id },
      { $push: { "bills": newBill } }
    );
  
    console.log(`Created new bill with id ${bill_id} for user with id ${user_id}.`);
  }

  /**
 * Updates the status of the specified bill for the given user.
 *
 * @param {string} user_id - The ID of the user whose bill to update.
 * @param {number} bill_id - The ID of the bill to update.
 * @param {string} status - The new status of the bill.
 */
async function updateBill(user_id, bill_id, status) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return;
    }
  
    const billIndex = user.bills.findIndex((bill) => bill.bill_id === bill_id);
    if (billIndex === -1) {
      console.log(`Bill with id ${bill_id} not found for user with id ${user_id}.`);
      return;
    }
  
    await Mongo.users.updateOne(
      { "user_id": user_id, "bills.bill_id": bill_id },
      { $set: { "bills.$.status": status } }
    );
  
    console.log(`Updated status of bill with id ${bill_id} to ${status} for user with id ${user_id}.`);
  }
  
  /**
 * Deletes the specified bill for the given user.
 *
 * @param {string} user_id - The ID of the user whose bill to delete.
 * @param {number} bill_id - The ID of the bill to delete.
 */
async function deleteBill(user_id, bill_id) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return;
    }
  
    const billIndex = user.bills.findIndex((bill) => bill.bill_id === bill_id);
    if (billIndex === -1) {
      console.log(`Bill with id ${bill_id} not found for user with id ${user_id}.`);
      return;
    }
  
    await Mongo.users.updateOne(
      { "user_id": user_id },
      { $pull: { "bills": { "bill_id": bill_id } } }
    );
  
    console.log(`Deleted bill with id ${bill_id} for user with id ${user_id}.`);
  }

  /**
 * Gets all the bills for the given user.
 *
 * @param {string} user_id - The ID of the user whose bills to get.
 * @returns {Object[]} An array of bill objects for the user, or an empty array if the user is not found or has no bills.
 */
async function getBills(user_id) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return [];
    }
  
    const bills = user.bills || [];
    return bills;
  }
  
/**
 * Generates a new unique ID for an alarm recipient.
 *
 * @returns {number} A new unique ID for an alarm recipient.
 */
async function getNextAlarmRecipientID() {
    const result = await Mongo.users.findOneAndUpdate({
        "_id":`alarm_recipient_id`
    },{ $inc: { "sequencevalue":1 } },{ new:true }
    );
  
    return result.value.sequencevalue;
  }
  

/**
 * Adds a new alarm recipient for the given user.
 *
 * @param {string} user_id - The ID of the user to add the alarm recipient for.
 * @param {string} name - The name of the alarm recipient.
 * @param {string} email - The email of the alarm recipient.
 */
async function addAlarmRecipient(user_id, name, email) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return;
    }
  
    const alarmRecipientID = await getNextAlarmRecipientID();
    const newAlarmRecipient = {
      "alarm_recipient_id": alarmRecipientID,
      "name": name,
      "email": email,
      "enabled":true
    };
  
    await Mongo.users.updateOne(
      { "user_id": user_id },
      { $push: { "alarm_recipients": newAlarmRecipient } }
    );
  
    console.log(`Added new alarm recipient with id ${alarmRecipientID} for user with id ${user_id}.`);
  }

  /**
 * Deletes the specified alarm recipient for the given user.
 *
 * @param {string} user_id - The ID of the user whose alarm recipient to delete.
 * @param {number} alarm_recipient_id - The ID of the alarm recipient to delete.
 */
async function deleteAlarmRecipient(user_id, alarm_recipient_id) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return;
    }
  
    const alarmRecipientIndex = user.alarm_recipients.findIndex(
      (alarmRecipient) => alarmRecipient.alarm_recipient_id === alarm_recipient_id
    );
    if (alarmRecipientIndex === -1) {
      console.log(`Alarm recipient with id ${alarm_recipient_id} not found for user with id ${user_id}.`);
      return;
    }
  
    await Mongo.users.updateOne(
      { "user_id": user_id },
      { $pull: { "alarm_recipients": { "alarm_recipient_id": alarm_recipient_id } } }
    );
  
    console.log(`Deleted alarm recipient with id ${alarm_recipient_id} for user with id ${user_id}.`);
  }

  /**
 * Gets the alarm recipients for the given user.
 *
 * @param {string} user_id - The ID of the user whose alarm recipients to get.
 * @returns {Object[]} An array of alarm recipient objects for the user, or an empty array if the user is not found or has no alarm recipients.
 */
async function getAlarmRecipients(user_id) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return [];
    }
  
    const alarmRecipients = user.alarm_recipients || [];
    return alarmRecipients;
  }
  
/**
 * Gets the status of the specified alarm recipient for the given user.
 *
 * @param {string} user_id - The ID of the user whose alarm recipient to retrieve.
 * @param {number} alarm_recipient_id - The ID of the alarm recipient to retrieve.
 * @returns {boolean} The status of the alarm recipient, or null if the alarm recipient is not found.
 */
async function getAlarmRecipientStatus(user_id, alarm_recipient_id) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return null;
    }
  
    const alarmRecipient = user.alarm_recipients.find(
      (alarmRecipient) => alarmRecipient.alarm_recipient_id === alarm_recipient_id
    );
    if (!alarmRecipient) {
      console.log(`Alarm recipient with id ${alarm_recipient_id} not found for user with id ${user_id}.`);
      return null;
    }
  
    console.log(`Retrieved status of alarm recipient with id ${alarm_recipient_id} for user with id ${user_id}.`);
    return alarmRecipient.enabled;
  }
  

  /**
 * Sets the status of the specified alarm recipient for the given user.
 *
 * @param {string} user_id - The ID of the user whose alarm recipient to update.
 * @param {number} alarm_recipient_id - The ID of the alarm recipient to update.
 * @param {boolean} enabled - Whether the alarm recipient should be enabled or not.
 */
async function setAlarmRecipientStatus(user_id, alarm_recipient_id, enabled) {
    const user = await Mongo.users.findOne({ "user_id": user_id });
    if (!user) {
      console.log(`User with id ${user_id} not found.`);
      return;
    }
  
    const alarmRecipientIndex = user.alarm_recipients.findIndex(
      (alarmRecipient) => alarmRecipient.alarm_recipient_id === alarm_recipient_id
    );
    if (alarmRecipientIndex === -1) {
      console.log(`Alarm recipient with id ${alarm_recipient_id} not found for user with id ${user_id}.`);
      return;
    }
  
    const updatedAlarmRecipient = {
      ...user.alarm_recipients[alarmRecipientIndex],
      "enabled": enabled
    };
  
    await Mongo.users.updateOne(
      { "user_id": user_id, "alarm_recipients.alarm_recipient_id": alarm_recipient_id },
      { $set: { "alarm_recipients.$": updatedAlarmRecipient } }
    );
  
    console.log(`Updated status of alarm recipient with id ${alarm_recipient_id} for user with id ${user_id}.`);
  }

  /**
 * Count the number of online sensors associated with a user_id
 * @param {Number} user_id - user id
 */
async function countOnline(user_id) {
    const projection = { sensors: 1, _id: 0 };

    const user = await Mongo.users.findOne({
        "user_id":user_id
    }, projection);

    if (!user) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    const sensorIds = user.sensors.map(sensor => sensor.sensor_id);

    const onlineSensors = await Mongo.sensors.countDocuments({
        sensor_id: { $in: sensorIds },
        status: "Online"
    });

    return onlineSensors;
}

/**
 * Count the number of offline sensors associated with a user_id
 * @param {Number} user_id - user id
 */
async function countOffline(user_id) {
    const projection = { sensors: 1, _id: 0 };

    const user = await Mongo.users.findOne({
        "user_id":user_id
    }, projection);

    if (!user) {
        console.log(`User ${user_id} does not exist.`);
        return null;
    }

    const sensorIds = user.sensors.map(sensor => sensor.sensor_id);

    const offlineSensors = await Mongo.sensors.countDocuments({
        sensor_id: { $in: sensorIds },
        status: "Offline"
    });

    return offlineSensors;
}

module.exports = {
    createUser,
    updateUser,
    deleteUser,
    getUser,
    getUserSensors,
    verifyUserPassword,
    addSensorToUser,
    removeSensorFromUser,
    addAlertToUser,
    removeAlertFromUser,
    getAlerts,
    getEmail,
    getName,
    getCompanyName,
    getPhoneNumber,
    getTimezone,
    setTimezone,
    updatePassword,
    getNextCardID,
    addCard,
    updateCard,
    deleteCard,
    getActiveCard,
    setActiveCard,
    getCards,
    getNextBillID,
    createBill,
    updateBill,
    deleteBill,
    getBills,
    getNextAlarmRecipientID,
    addAlarmRecipient,
    deleteAlarmRecipient,
    getAlarmRecipients,
    getAlarmRecipientStatus,
    setAlarmRecipientStatus,
    countOnline,
    countOffline,
};