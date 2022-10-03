require("dotenv").config({ path: `${process.cwd()}/.env` })
const express = require('express');
const router = express.Router();
const { protected, login } = require('../middlewares/admin');
const db = require('../db/db')

//================================================================================================================================

//ADMIN LOGIN PAGE
router.get('/login', login, (req, res) => {
    res.render('admin/login.ejs')
})

//LIST ALL PATIENTS
router.get('/patients', protected, (req, res) => {
    res.render('admin/patients.ejs')
})

//================================================================================================================================

//LOGIN ACCOUNT
router.post('/login', (req, res) => {
    let { username, password } = req.body

    db.query(`SELECT admin_id,username,password FROM admin_accounts WHERE username=${db.escape(username)}`,
    (err, result) => {
        if(err) throw err;

        const user = { ...result[0] }

        if(password != user.password) return res.json({ operation: false })

        req.session.admin = {
            id: user.admin_id,
            user: user.username
        }

        res.json({ operation: true })
    })
})

//LOGOUT ACCOUNT
router.post('/logout', (req ,res) => {
    try {
        req.session = null
        res.json({ operation: true })
    } catch (error) {
        console.log(error)
        res.json({ operation: false })
    }
})
module.exports = router;