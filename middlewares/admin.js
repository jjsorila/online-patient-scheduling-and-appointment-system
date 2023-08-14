require("dotenv").config({ path: `${process.cwd()}/.env` })
const jwt = require("jsonwebtoken")

exports.protected = (req, res, next) => {
    if (!req.session.admin) return res.redirect('/login')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return next()
}

exports.onlyAdmin = (req, res, next) => {
    if (req.session.admin.specialty != "admin") return res.redirect('/admin/dashboard')
    return next()
}