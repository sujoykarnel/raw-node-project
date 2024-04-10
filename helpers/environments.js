// dependencies
require('dotenv').config();

// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: 'staging',
    secretKey: 'dfdfasdfasdf',
    maxChecks: 5,
    twilio: {
        fromPhone: process.env.FROM_PHONE,
        accountSid: process.env.ACCOUNT_SID,
        authToken: process.env.AUTH_TOKEN
    }
};

environments.production = {
    port: 5000,
    envName: 'production',
    secretKey: 'dfdfasdfdfddfasdf',
    maxChecks: 5,
    twilio: {
        fromPhone: process.env.FROM_PHONE,
        accountSid: process.env.ACCOUNT_SID,
        authToken: process.env.AUTH_TOKEN
    }
};
// determine which environment was passed
const currentEnvironment = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment object
const environmentToExport = typeof environments[currentEnvironment] === 'object' ? environments[currentEnvironment] : environments.staging;

// export module
module.exports = environmentToExport;