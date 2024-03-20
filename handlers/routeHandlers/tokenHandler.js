// dependencies
const data = require('../../lib/data');
const { hash, parseJSON, createRandomString } = require('../../helpers/utilities');
const { error } = require('console');

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'put', 'post', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            massage: 'Method not allowed'
        });
    }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone && password) {
        data.read('users', phone, (err, userData) => {
            let hashedPassword = hash(password);
            if (hashedPassword === parseJSON(userData).password) {
                let tokenId = createRandomString(20);
                let expires = Date.now() + 60 * 60 * 1000;
                let tokenObject = {
                    phone,
                    tokenId,
                    expires
                };
                // store the token
                data.create('tokens', tokenId, tokenObject, (err) => {
                    if (!err) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: 'There was a problem in the server side!'
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Password is not valid!'
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!'
        });
    }
};

handler._token.get = (requestProperties, callback) => {
    // check the token if valid
    const tokenId = typeof (requestProperties.queryStringObject.tokenId) === 'string' && requestProperties.queryStringObject.tokenId.trim().length === 20 ? requestProperties.queryStringObject.tokenId : false;

    if (tokenId) {
        // lookup the token
        data.read('tokens', tokenId, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };

            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Requested token was not found'
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested token was not found!'
        });
    }
};

handler._token.put = (requestProperties, callback) => {
    // check the token if valid
    const tokenId = typeof (requestProperties.body.tokenId) === 'string' && requestProperties.body.tokenId.trim().length === 20 ? requestProperties.body.tokenId : false;

    const extend = typeof (requestProperties.body.extend) === 'boolean' && requestProperties.body.extend === true ? true : false;

    if (tokenId && extend) {
        data.read('tokens', tokenId, (err, tokenData) => {
            let tokenObject = parseJSON(tokenData);
            if (tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60 * 60 * 1000;

                // store the update token
                data.update('tokens', tokenId, tokenObject, (err) => {
                    if (!err) {
                        callback(200, {
                            massage: 'Token was updated successfully!'
                        });
                    } else {
                        callback(500, {
                            error: 'There was a server side error!'
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Token already expired!'
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request!'
        });
    }

};

handler._token.delete = (requestProperties, callback) => {
    // check the token if valid
    const tokenId = typeof (requestProperties.queryStringObject.tokenId) === 'string' && requestProperties.queryStringObject.tokenId.trim().length === 20 ? requestProperties.queryStringObject.tokenId : false;

    if (tokenId) {
        //lookup the token
        data.read('tokens', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                data.delete('tokens', tokenId, (err) => {
                    if (!err) {
                        callback(200, {
                            massage: 'Token was successfully deleted!'
                        });
                    } else {
                        callback(500, {
                            error: 'There was a server site error!'
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a server site error!'
                });
            }
        });
    } else {
        callback(400, {
            error: 'There was a problem in your request!'
        });
    }
};

// verify token
handler._token.verify = (tokenId, phone, callback) => {
    data.read('tokens', tokenId, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};


module.exports = handler;