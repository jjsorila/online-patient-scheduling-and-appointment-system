require("dotenv").config({ path: `${process.cwd()}/.env` })
const jwt = require("jsonwebtoken")

exports.protected = (req, res, next) => {
    if (!req.session.admin) return res.redirect('/admin/login')
    return next()
}

exports.login = (req, res, next) => {
    if (req.session.admin) return res.redirect('/admin/patients')
    return next()
}