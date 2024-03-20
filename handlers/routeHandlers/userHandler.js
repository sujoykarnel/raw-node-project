// dependencies
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utilities');
const { error } = require('console');
const tokenHandler = require('./tokenHandler');

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'put', 'post', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._users[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            massage: 'Method not allowed'
        });
    }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const tosAgreement = typeof (requestProperties.body.tosAgreement) === 'boolean' ? requestProperties.body.tosAgreement : false;


    if (firstName && lastName && phone && tosAgreement) {
        // make sure that the user doesn't  already exist

        data.read('users', phone, (err) => {
            if (err) {
                let userObject = {
                    firstName,
                    lastName,
                    phone,
                    password: hash(password),
                    tosAgreement,
                };
                // store the user to DB
                data.create('users', phone, userObject, (err) => {
                    if (!err) {
                        callback(200, {
                            massage: 'User was created successfully!'
                        });
                    } else {
                        callback(500, {
                            error: 'Could not create error!'
                        });
                    }
                });
            } else {
                callback(500, {
                    error: 'There was a problem in server site!'
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request!'
        });
    }

};

handler._users.get = (requestProperties, callback) => {
    // check the phone number if valid
    const phone = typeof (requestProperties.queryStringObject.phone) === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;
    if (phone) {
        // verify token
        const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                // lookup the user
                data.read('users', phone, (err, userData) => {
                    const user = { ...parseJSON(userData) };

                    if (!err && user) {
                        delete user.password;
                        callback(200, user);
                    } else {
                        callback(404, {
                            error: 'Requested user was not found'
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication failure!'
                });
            }
        });

    } else {
        callback(404, {
            error: 'Requested user was not found!'
        });
    }
};

handler._users.put = (requestProperties, callback) => {
    // check the phone number if valid
    const firstName = typeof (requestProperties.body.firstName) === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof (requestProperties.body.lastName) === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof (requestProperties.body.phone) === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof (requestProperties.body.password) === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone) {
        if (firstName || lastName || password) {
            // verify token
            const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
            tokenHandler._token.verify(token, phone, (tokenId) => {
                if (tokenId) {
                    // lookup the user
                    data.read('users', phone, (err, userData) => {
                        user = { ...parseJSON(userData) };
                        if (!err && user) {
                            if (firstName) {
                                user.firstName = firstName;
                            }
                            if (lastName) {
                                user.lastName = lastName;
                            }
                            if (password) {
                                user.password = hash(password);
                            }

                            // store to database
                            data.update('users', phone, user, (err) => {
                                if (!err) {
                                    callback(200, {
                                        massage: 'User was updated successfully!'
                                    });
                                } else {
                                    callback(500, {
                                        error: 'There was a problem in server site!'
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: 'You have a problem in your request!'
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: 'Authentication failure!'
                    });
                }
            });
            
        } else {
            callback(400, {
                error: 'You have a problem in your request!'
            });
        }
    } else {
        callback(400, {
            error: 'Invalid phone number. Please try again!'
        });
    }


};

handler._users.delete = (requestProperties, callback) => {
    // check the phone number if valid
    const phone = typeof (requestProperties.queryStringObject.phone) === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;

    if (phone) {
        // verify token
        const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
        tokenHandler._token.verify(token, phone, (tokenId) => {
            if (tokenId) {
                //lookup the user
                data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        data.delete('users', phone, (err) => {
                            if (!err) {
                                callback(200, {
                                    massage: 'User was successfully deleted!'
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
                callback(403, {
                    error: 'Authentication failure!'
                });
            }
        });
        
    } else {
        callback(400, {
            error: 'There was a problem in your request!'
        });
    }

};


module.exports = handler;