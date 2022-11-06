require("dotenv").config({ path: `${process.cwd()}/.env` })
const jwt = require("jsonwebtoken")

exports.protected = (req, res, next) => {
    if (!req.session.admin) return res.redirect('/admin/login')
    return next()
}

exports.login = (req, res, next) => {
    if (req.session.admin) return res.redirect('/admin/dashboard')
    return next()
}

exports.onlyAdmin = (req, res, next) => {
    if(req.session.admin.specialty != "admin") return res.redirect('/admin/dashboard')
    return next()
}