// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');

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
    callback(200);
};

handler._users.put = (requestProperties, callback) => {

};

handler._users.delete = (requestProperties, callback) => {

};


module.exports = handler;