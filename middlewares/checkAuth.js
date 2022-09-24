exports.protected = (req, res, next) => {
    if (!req.session.user) return res.redirect('/auth/login')
    return next()
}

exports.auth = (req, res, next) => {
    if (req.session.user) return res.redirect('/home')
    return next()
}

