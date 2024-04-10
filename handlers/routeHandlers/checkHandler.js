// dependencies
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'put', 'post', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405, {
            massage: 'Method not allowed'
        });
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    // validate inputs
    const protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof (requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCodes = typeof (requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        // get token
        const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
        // lookup the user phone by reading the token
        data.read('tokens', token, (err, tokenData) => {

            if (!err && tokenData) {
                const userPhone = parseJSON(tokenData).phone;
                // lookup the user data by phone
                data.read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = parseJSON(userData);
                                const userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];

                                if (userChecks.length < maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };

                                    // save the object
                                    data.create('checks', checkId, checkObject, (err) => {
                                        if (!err) {
                                            // add check id to the users object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // save the new check data
                                            data.update('users', userPhone, userObject, (err) => {
                                                if (!err) {
                                                    // return the data about the new check
                                                    callback(200, checkObject);
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a server side error!'
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'There was a server side error!'
                                            });
                                        }
                                    });
                                } else {
                                    callback(401, {
                                        error: 'user already reached max check limit!'
                                    });
                                }
                            } else {
                                callback(403, {
                                    error: 'Authentication Problem!'
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'User not found!'
                        });
                    }
                });
            } else {
                callback(403, {
                    error: 'Authentication Problem!'
                });
            }
        });

    } else {
        callback(400, {
            error: 'You have a problem in your request!'
        });
    }

};

handler._check.get = (requestProperties, callback) => {
    const checkId = typeof (requestProperties.queryStringObject.checkId) === 'string' && requestProperties.queryStringObject.checkId.trim().length === 20 ? requestProperties.queryStringObject.checkId : false;

    if (checkId) {
        //lookup the check
        data.read('checks', checkId, (err, checkData) => {
            if (!err && checkData) {
                // get token
                const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
                console.log(token);
                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        callback(200, parseJSON(checkData));
                    } else {
                        callback(403, {
                            error: "Authentication failure!"
                        });
                    }
                });
            } else {
                callback(500, {
                    error: "Authentication problem!"
                });
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your request!"
        });
    }
};

handler._check.put = (requestProperties, callback) => {
    const checkId = typeof (requestProperties.body.checkId) === 'string' && requestProperties.body.checkId.trim().length === 20 ? requestProperties.body.checkId : false;

    const protocol = typeof (requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1 ? requestProperties.body.protocol : false;

    const url = typeof (requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 ? requestProperties.body.url : false;

    const method = typeof (requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1 ? requestProperties.body.method : false;

    const successCodes = typeof (requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes instanceof Array ? requestProperties.body.successCodes : false;

    const timeoutSeconds = typeof (requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? requestProperties.body.timeoutSeconds : false;


    if (checkId) {
        if (protocol || url || successCodes || timeoutSeconds) {
            data.read('checks', checkId, (err, checkData) => {
                if (!err && checkData) {
                    const checkObject = parseJSON(checkData);
                    const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }

                            // store the checkObject
                            data.update('checks', checkId, checkObject, (err) => {
                                if (!err) {
                                    callback(200);
                                } else {
                                    callback(500, {
                                        error: 'There was a server side error!'
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: "Authentication failure!"
                            });
                        }
                    });


                } else {
                    callback(500, {
                        error: 'There was a problem in the server side!'
                    });
                }
            });
        } else {
            callback(400, {
                error: 'You must provide at least one field to update!'
            });
        }
    } else {
        callback(400, {
            error: 'You have a problem in your request.'
        });
    }

};

handler._check.delete = (requestProperties, callback) => {
    const checkId = typeof (requestProperties.queryStringObject.checkId) === 'string' && requestProperties.queryStringObject.checkId.trim().length === 20 ? requestProperties.queryStringObject.checkId : false;

    

    if (checkId) {
        //lookup the check
        data.read('checks', checkId, (err, checkData) => {
            if (!err && checkData) {
                // get token
                const token = typeof (requestProperties.headersObject.token) === 'string' ? requestProperties.headersObject.token : false;
                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
            
                    if (tokenIsValid) {
                        // delete the check data
                        data.delete('checks', checkId, (err) => {
                            if (!err) {
                                data.read('users', parseJSON(checkData).userPhone, (err, userData) => {
                                    if (!err && userData) {
                                        const userObject = parseJSON(userData);
                                        const userChecks = typeof (userObject.checks) === 'object' && userObject.checks instanceof Array ? userObject.checks : [];
                                        // remove the deleted check id form user's check list
                                        const checkPosition = userChecks.indexOf(checkId);
                                        if (checkPosition > -1) {
                                            userChecks.splice(checkPosition, 1);
                                            // re save the user data
                                            userObject.checks = userChecks;
                                            data.update('users', userObject.phone, userObject, (err) => {
                                                if (!err) {
                                                    callback(200)
                                                } else {
                                                    callback(500, {
                                                        error: 'There was a server side problem!'
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(500, {
                                                error: 'The check id you are trying to remove is not fond in user!'
                                            });
                                        }
                                    } else {
                                        callback(500, {
                                            error: 'There was a server side problem!'
                                        });
                                    }
                                });
                            } else {
                                callback(500, {
                                    error: 'There was a server side problem!'
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: "Authentication failure!"
                        });
                    }
                });
            } else {
                callback(500, {
                    error: "Authentication problem!"
                });
            }
        });
    } else {
        callback(400, {
            error: "You have a problem in your request!"
        });
    }

};


module.exports = handler;