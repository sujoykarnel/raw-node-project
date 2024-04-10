//dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const data = require('./lib/data');
const { sendTwilioSms } = require('./helpers/notifications');

// app object - module scaffolding
const app = {};

// // test @TODO
// sendTwilioSms('01737300123', 'Hello World', (err) => {
//     console.log(`This is the error ${err}`);
// });


// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(environment.port, () => {
        console.log(`listening to post ${environment.port}`);
    });
};



// handle request response
app.handleReqRes = handleReqRes;

// start the server
app.createServer();