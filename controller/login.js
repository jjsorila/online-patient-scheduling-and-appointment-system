require("dotenv").config({ path: `${process.cwd()}/.env` })
const express = require('express');
const router = express.Router();
const { login } = require('../middlewares/login');
const db = require('../db/db')
const bcrypt = require("bcryptjs")

router.get('/', login, (req, res) => {
    res.render('login.ejs')
})

//==================================================================================================================================================================================================

router.post('/', (req, res) => {
    let { username, password } = req.body;

    db.query(`
        SELECT id,email,password,fullname FROM patient_accounts WHERE username=${db.escape(username)};
        SELECT admin_id,username,password,specialty,fullname,license_number FROM admin_accounts WHERE username=${db.escape(username)};
    `, (err, result) => {
        if(err) throw err;

        const user = result[0];
        const admin = result[1];

        //ADMIN LOGIN
        if(admin.length > 0) {
            let creds = { ...admin[0] }

            if (password != creds.password || result.length <= 0) return res.json({ operation: false })

            req.session.admin = {
                id: creds.admin_id,
                specialty: creds.specialty,
                license_number: creds.license_number,
                fullname: creds.fullname
            }

            return res.json({ operation: true, goTo: 'admin' })
        }

        //CLIENT LOGIN
        if(user.length > 0) {
            let creds = { ...user[0] }
            let fullname = creds.fullname ? JSON.parse(creds.fullname) : null

            //DECRYPT & COMPARE PASSWORD
            const isMatch = bcrypt.compareSync(password, creds.password)
            if (!isMatch) return res.json({ operation: false })

            req.session.user = {
                fname: !fullname ? "PATIENT" : `${fullname.lname}, ${fullname.fname} ${fullname.mi ? `${fullname.mi}.` : ""}`,
                id: creds.id,
                email: creds.email
            };
            return res.json({ operation: true, goTo: 'client' })
        }

        return res.json({ operation: false })

    })
})

router.post("/logout", (req, res) => {
    try {
        req.session = null
        res.json({ operation: true })
    } catch (error) {
        console.log(error)
        res.json({ operation: false })
    }
})

//EXPORT
module.exports = router;