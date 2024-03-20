//dependencies
const crypto = require('crypto');
const environments = require('./environments');

// module scaffolding
const utilities = {};

// parse JSON string to object
utilities.parseJSON = (jsonString) => {
    let output = {};
    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }
    return output;
};

// hash string
utilities.hash = (string) => {
    if (typeof (string) === 'string' && string.length > 0) {
        let hash = crypto
            .createHmac('sha256', environments.secretKey)
            .update(string)
            .digest('hex');
        return hash;
    } else {
        return false;
    }
};

// create random string
utilities.createRandomString = (stringLength) => {
    const length = typeof (stringLength) === 'number' && stringLength > 0 ? stringLength : false;
    if (length) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
        let randomString = '';
        for (i = 1; i <= length; i++) {
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
            randomString += randomCharacter;
        }
        return randomString; 
    } else {
        return false;
    }

};


// export module 
module.exports = utilities;