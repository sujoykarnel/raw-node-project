// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
    console.log(requestProperties);
    callback(200, {
        massage: 'This is a sample URL'
    });
}
module.exports = handler;