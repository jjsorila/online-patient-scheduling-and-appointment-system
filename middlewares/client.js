require("dotenv").config({ path: `${process.cwd()}/.env` })
const jwt = require("jsonwebtoken")

exports.protected = (req, res, next) => {
    if (!req.session.user) return res.redirect('/login')
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
        res.send(`<h1 style="text-align: center;">Invalid Token</h1>`)
    }
}