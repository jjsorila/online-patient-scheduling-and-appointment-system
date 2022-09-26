exports.protected = (req, res, next) => {
    if (!req.session.user) return res.redirect('/client/login')
    return next()
}

exports.login = (req, res, next) => {
    if (req.session.user) return res.redirect('/user')
    return next()
}

