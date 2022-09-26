const express = require('express'),
    router = express.Router(),
    db = require('../db/db'),
    { protected, login } = require('../middlewares/checkAuth');

//VIEWS

//LOGIN PAGE
router.get('/login', login, (req, res) => {
    res.render('login.ejs')
})

//=================================================================================================

//API

//LOGIN
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query(`SELECT id,username,password FROM users WHERE username=${db.escape(email)} AND password=${db.escape(password)}`,
        (err, results) => {
            if (err) throw err;

            if(results.length == 0) return res.redirect('/client/login?msg=invalid')

            req.session.user = results[0].id;
            res.redirect('/user')
        })
})

//LOGOUT
router.post('/logout', (req, res) => {
    req.session = null
    res.redirect('/auth/login')
})

//EXPORT
module.exports = router;