require("dotenv").config({ path: "./.env" })
const express = require('express'),
    router = express.Router(),
    db = require('../db/db'),
    { protected, login, getResetPasswordToken } = require('../middlewares/client'),
    jwt = require("jsonwebtoken"),
    nodemailer = require('nodemailer'),
    dayjs = require('dayjs'),
    CryptoJS = require("crypto-js"),
    transporter = (email, body) => {
        return nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PWD
            }
        }).sendMail({
            from: `"OPASS" <${process.env.EMAIL}>`,
            to: email,
            subject: `Online Patient Appointment and Scheduling System`,
            html: body
        })
    };

//==================================================================================================================================================================================================

//CLIENT LOGIN PAGE
router.get('/login', login, (req, res) => {
    res.render('login.ejs')
})

//CLIENT USER PAGE
router.get('/user', protected, (req, res) => {

    db.query(`
        SELECT fullname,contact,gender,address,birthdate FROM client_accounts WHERE id=${db.escape(req.session.user.id)};
        SELECT apt.schedule AS schedule,apt.status AS status,apt.ailment AS ailment FROM appointments AS apt INNER JOIN client_accounts AS ca ON ca.id=apt.id WHERE apt.id=${db.escape(req.session.user.id)};`,
        (err, result) => {
            if (err) throw err;

            const userAppointments = result[1].map((val) => ({ ...val, schedule: dayjs(val.schedule).format("hh:mm A MMM DD, YYYY") }));

            res.render('user.ejs', {
                user: {
                    ...req.session.user,
                    ...result[0][0],
                    birthdate: dayjs(result[0][0].birthdate).format("YYYY-MM-DD")
                },
                appointments: userAppointments
            })
        })


})

//CLIENT RESET PASSWORD PAGE
router.get('/reset', getResetPasswordToken, (req, res) => {
    res.render('reset.ejs', { email: req.email })
})

//==================================================================================================================================================================================================

//LOGIN ACCOUNT
router.post('/login', (req, res) => {
    let { email, password } = req.body;

    db.query(`SELECT id,email,password FROM client_accounts WHERE email=${db.escape(email)}`,
        (err, result) => {
            if (err) throw err;

            if (result.length == 0) return res.json({ operation: false })

            const user = { ...result[0] }

            //DECRYPT & COMPARE PASSWORD
            const isMatch = password == CryptoJS.AES.decrypt(user.password, process.env.SECRET).toString(CryptoJS.enc.Utf8);

            if (!isMatch) return res.json({ operation: false })

            req.session.user = {
                id: user.id,
                email: user.email
            };
            res.json({ operation: true })
        })
})

//LOGOUT ACCOUNT
router.post('/logout', (req, res) => {
    try {
        req.session = null
        res.json({ operation: true })
    } catch (error) {
        console.log(error)
        res.json({ operation: false })
    }
})

//REGISTER CLIENT ACCOUNT
router.post('/register', (req, res) => {

    let { email, password } = req.body

    db.query(`SELECT email FROM client_accounts WHERE email=${db.escape(email)}`, (err, results) => {
        if (err) throw err;

        if (results.length > 0) return res.json({ operation: false })

        //ENCRYPT PASSWORD
        password = CryptoJS.AES.encrypt(password, process.env.SECRET).toString();

        //INSERT ACCOUNT TO DATABASE
        db.query(`INSERT INTO client_accounts(email,password) VALUES(${db.escape(email)},${db.escape(password)})`, (err, result) => {
            if (err) throw err;
        })

        //SEND EMAIL VERIFICATION
        try {
            const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: '365d' })

            transporter(email, `<b>Click this <a href="http://${req.header('host')}/client/verify?token=${token}" >link</a> to verify your account.</b>`)
                .then((result) => {
                    return res.json({ operation: true, msg: result.response })
                })
        } catch (err) {
            res.status(500).json({ msg: "Server Error" })
        }
    })
})

//VERIFY CLIENT ACCOUNT
router.get('/verify', (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(401).send("Token is required");

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        db.query(`UPDATE client_accounts SET verified=1 WHERE email=${db.escape(decoded.email)}`, (err, result) => {
            if (err) throw err;
            return res.redirect("/client/login");
        })
    } catch (error) {
        console.log(error.message);
        return res.status(401).send("Token Expired");
    }
})

//SEND RESET PASSWORD LINK
router.post("/reset", (req, res) => {

    let { email } = req.body

    db.query(`SELECT email,verified FROM client_accounts WHERE email=${db.escape(email)}`, (err, result) => {
        if (err) throw err;
        if (result.length <= 0) return res.json({ found: false, verified: true })

        if (result[0].verified == 0) return res.json({ found: true, verified: false })

        const token = jwt.sign({ email: result[0].email }, process.env.SECRET, { expiresIn: "365d" })

        transporter(email, `<b>Click this <a href="http://${req.header('host')}/client/reset?token=${token}" >link</a> to reset password of your account.</b>`)
            .then((status) => {
                return res.json({ found: true, verified: true, msg: status.response })
            })
    })
})

//CHANGE LOST PASSWORD
router.put("/reset", (req, res) => {

    let { email, newPassword } = req.body;

    //CHECK IF OLD PASSWORD IS MATCHED
    db.query(`SELECT email,password FROM client_accounts WHERE email=${db.escape(email)}`,
        (err, result) => {
            if (err) throw err;

            const user = { ...result[0] }

            if (newPassword == CryptoJS.AES.decrypt(user.password, process.env.SECRET).toString(CryptoJS.enc.Utf8)) return res.json({ operation: false })

            //ENCRYPT NEW PASSWORD
            newPassword = CryptoJS.AES.encrypt(newPassword, process.env.SECRET).toString();

            //CHANGE PASSWORD
            db.query(`UPDATE client_accounts SET password=${db.escape(newPassword)} WHERE email=${db.escape(email)}`,
                (err1, result1) => {
                    if (err1) throw err1;

                    return res.json({ operation: true })
                })
        })
})

//SAVE/UPDATE USER INFORMATION
router.put('/update/user/:id', (req, res) => {
    let { id } = req.params;
    let { fullname, contact, address, gender, birthdate } = req.body

    //UPDATE USER INFORMATION
    db.query(`UPDATE client_accounts SET fullname=${db.escape(fullname)},contact=${db.escape(contact)},address=${db.escape(address)},gender=${db.escape(gender)},birthdate=${db.escape(birthdate)} WHERE id=${db.escape(id)}`,
        (err, result) => {
            if (err) {
                console.log(err)
                return res.json({ operation: false })
            }
            return res.json({ operation: true })
        })
})

//MAKE AN APPOINTMENT
router.post('/appointments/:id', (req, res) => {
    const { id } = req.params;
        db.query(`
        INSERT INTO appointments(id,schedule) VALUES(${db.escape(id)},${db.escape(req.body.schedule)});
        SELECT apt.schedule AS schedule,apt.status AS status,apt.ailment AS ailment FROM appointments AS apt INNER JOIN client_accounts AS ca ON ca.id=apt.id WHERE apt.id=${db.escape(id)};
        `,
            (err, result) => {
                if(err) throw err;
                const userAppointments = result[1].map((val) => ({ ...val, schedule: dayjs(val.schedule).format("hh:mm A MMM DD, YYYY") }));
                res.json({ operation: true, userAppointments })
            })
})

//EXPORT
module.exports = router;