const express = require('express'),
    router = express.Router(),
    db = require('../db/db'),
    { protected, login } = require('../middlewares/checkAuth'),
    jwt = require("jsonwebtoken"),
    nodemailer = require('nodemailer'),
    CryptoJS = require("crypto-js");

//VIEWS

//LOGIN PAGE (GET)
router.get('/login', login, (req, res) => {
    res.render('login.ejs')
})

//=================================================================================================

//API

//LOGIN (POST)
router.post('/login', (req, res) => {
    let { email, password } = req.body;

    db.query(`SELECT id,email,password FROM client_accounts WHERE email=${db.escape(email)}`,
        (err, result) => {
            if (err) throw err;

            if (result.length == 0) return res.redirect('/client/login?msg=invalidEmail')

            const user = { ...result[0] }

            //DECRYPT & COMPARE PASSWORD
            const isMatch = password == CryptoJS.AES.decrypt(user.password, '123').toString(CryptoJS.enc.Utf8);

            if (!isMatch) return res.redirect('/client/login?msg=invalidPassword')

            req.session.user = user.id;
            res.redirect('/user')
        })
})

//LOGOUT ACCOUNT
router.post('/logout', (req, res) => {
    req.session = null
    res.redirect('/client/login')
})

//REGISTER CLIENT ACCOUNT
router.post('/register', (req, res) => {

    let { email, password } = req.body

    db.query(`SELECT email FROM client_accounts WHERE email=${db.escape(email)}`, (err, results) => {
        if (err) throw err;

        if (results.length > 0) return res.json({ operation: false })

        //ENCRYPT PASSWORD
        password = CryptoJS.AES.encrypt(password, '123').toString();

        db.query(`INSERT INTO client_accounts(email,password) VALUES(${db.escape(email)},${db.escape(password)})`, (err, result) => {
            if (err) throw err;
        })

        return res.status(200).json({ operation: true })

        //SEND EMAIL VERIFICATION
        // const transporter = nodemailer.createTransport({
        //     host: "mail.gmx.com",
        //     port: 587,
        //     tls: {
        //         ciphers:'SSLv3',
        //         rejectUnauthorized: false
        //     },
        //     debug:true,
        //     auth: {
        //         user: "opass0101@gmx.com",
        //         pass: "Opass1234567"
        //     }
        // });

        // try {
        //     transporter.sendMail({
        //         from: `"OPASS" <plogic9@gmail.com>`,
        //         to: email,
        //         subject: `Online Patient Appointment and Scheduling System`,
        //         html: `<b>Click this <a href="http://${req.header('host')}/client/verify?token=${jwt.sign({ email }, '12345', { expiresIn: '365d' })}" >link</a> to verify your account.</b>`
        //     }).then((result) => {
        //         return res.json({ operation: true, msg: result.response })
        //     })
        // } catch (err) {
        //     console.log(err)
        //     res.status(500).json({ msg: "Server Error" })
        // }
    })
})

//VERIFY CLIENT ACCOUNT
router.get('/verify', async (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(401).send("Token is required");

    try {
        const decoded = jwt.verify(token, '12345');
        db.query(`UPDATE client_accounts SET verified=1 WHERE email=${db.escape(decoded.email)}`, (err, result) => {
            if (err) throw err;
            return res.redirect("/client/login");
        })
    } catch (error) {
        console.log(error.message);
        return res.status(401).send("Token Expired");
    }
})

//EXPORT
module.exports = router;