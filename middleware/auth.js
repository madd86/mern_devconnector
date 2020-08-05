const jwt = require('jsonwebtoken')
const config = require('config')

// next is a call back we have to run that will pass through the middleware
module.exports = function(req, res, next) {
    const token = req.header('x-auth-token')

    // check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' })
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        req.user = decoded.user
        next()
    } catch(err) {
        req.status(401).json({ msg: 'Token is not valid' })
    }
}