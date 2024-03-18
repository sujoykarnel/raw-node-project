// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
    callback(404, {
        massage: 'Your requested URL not found!'
    })
}
module.exports = handler;