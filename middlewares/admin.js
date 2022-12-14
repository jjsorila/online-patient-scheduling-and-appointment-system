require("dotenv").config({ path: `${process.cwd()}/.env` })
const jwt = require("jsonwebtoken")

exports.protected = (req, res, next) => {
    if (!req.session.admin) return res.redirect('/login')
    return next()
}

exports.onlyAdmin = (req, res, next) => {
    if(req.session.admin.specialty != "admin") return res.redirect('/admin/dashboard')
    return next()
}