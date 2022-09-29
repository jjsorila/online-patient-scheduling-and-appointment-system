require("dotenv").config({ path: "./.env" })
const jwt = require("jsonwebtoken")

exports.protected = (req, res, next) => {
    if (!req.session.user) return res.redirect('/client/login')
    return next()
}

exports.login = (req, res, next) => {
    if (req.session.user) return res.redirect('/client/user')
    return next()
}

exports.getResetPasswordToken = (req, res, next) => {
    const token = req.query.token;

    if(!token) return res.send(`<h1 style="text-align: center;">Token Required</h1>`)

    try {
        const decoded = jwt.verify(token, process.env.SECRET)
        req.email = decoded.email
        next()
    } catch (error) {
        res.send(`<h1 style="text-align: center;">Token Expired</h1>`)
    }
}