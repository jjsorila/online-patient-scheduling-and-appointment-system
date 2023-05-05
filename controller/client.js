require("dotenv").config({ path: `${process.cwd()}/.env` })
const express = require('express'),
    router = express.Router(),
    db = require('../db/db'),
    { protected, getResetPasswordToken } = require('../middlewares/client'),
    jwt = require("jsonwebtoken"),
    nodemailer = require('nodemailer'),
    dayjs = require('dayjs'),
    bcrypt = require("bcryptjs"),
    transporter = (email, body) => {
        return nodemailer.createTransport({
            host: "smtp-relay.sendinblue.com",
            port: 587,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        }).sendMail({
            from: `"RMCC" <${process.env.EMAIL}>`,
            to: email,
            subject: `Rodis Maternal and Childcare Clinic`,
            html: body
        })
    },
    uuid = require('uuid'),
    form = require('formidable')({ keepExtensions: true }),
    fs = require('fs');

function getAge(dateString) {
    var ageInMilliseconds = new Date() - new Date(dateString);
    return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365);
}

//==================================================================================================================================================================================================

//CLIENT LOGIN PAGE
// router.get('/login', login, (req, res) => {
//     res.render('login.ejs')
// })

//DASHBOARD PAGE
router.get('/dashboard', protected, (req ,res) => {
    res.render('dashboard.ejs', { user: req.session.user })
})

//USER PAGE
router.get('/user', protected, (req, res) => {

    db.query(`
        SELECT picture,fullname,contact,gender,address,birthdate,age,guardian,email,username FROM patient_accounts WHERE id=${db.escape(req.session.user.id)};`,
        (err, result) => {
            if (err) throw err;

            res.render('user.ejs', {
                user: {
                    ...req.session.user,
                    ...result[0],
                    fullname: JSON.parse(result[0].fullname),
                    guardian: JSON.parse(result[0].guardian),
                    birthdate: dayjs(result[0].birthdate).format("YYYY-MM-DD"),
                    age: result[0].birthdate ? getAge(result[0].birthdate) : null
                }
            })
        })


})

//VIEW MEDICAL RECORD PAGE
router.get("/view/med-record/:mr_id", protected, (req, res) => {
    const { mr_id } = req.params

    let pa = `pa.patient_history AS patient_history`
    let apt = `apt.patient_type AS patient_type`
    let mr = `mr.temperature AS temperature,mr.bp AS bp,mr.weight AS weight,mr.height AS height,mr.ailment AS ailment,mr.date_created AS date_created`

    db.query(`SELECT ${pa},${apt},${mr} FROM ((patient_accounts AS pa INNER JOIN appointments AS apt ON pa.id=apt.id) INNER JOIN medical_records AS mr ON pa.id=mr.id) WHERE mr.mr_id=${db.escape(mr_id)} AND apt.apt_id=${db.escape(mr_id)};`,
        (err, result) => {
            if (err) throw err;

            res.render("user-med-record.ejs", {
                user: {
                    ...result[0],
                    ailment: JSON.parse(result[0].ailment),
                    date_created: dayjs(result[0].date_created).format("MMM DD, YYYY hh:mm A")
                }
            })
        })

})

//APPOINTMENTS PAGE
router.get("/appointments", protected, (req, res) => {

    db.query(`SELECT fullname FROM patient_accounts WHERE id=${db.escape(req.session.user.id)}`,
    (err, result) => {
        if(err) throw err;

        res.render("user-appointments.ejs", {
            user: {
                ...req.session.user,
                ...result[0]
            }
        })
    })


})

//CLIENT RESET PASSWORD PAGE
router.get('/reset', getResetPasswordToken, (req, res) => {
    res.render('reset.ejs', { email: req.email })
})

//==================================================================================================================================================================================================

//LOGIN ACCOUNT
// router.post('/login', (req, res) => {
//     let { email, password } = req.body;

//     db.query(`SELECT id,email,password FROM patient_accounts WHERE email=${db.escape(email)}`,
//         (err, result) => {
//             if (err) throw err;

//             if (result.length == 0) return res.json({ operation: false })

//             const user = { ...result[0] }

//             //DECRYPT & COMPARE PASSWORD
//             const isMatch = password == CryptoJS.AES.decrypt(user.password, process.env.SECRET).toString(CryptoJS.enc.Utf8);

//             if (!isMatch) return res.json({ operation: false })

//             req.session.user = {
//                 id: user.id,
//                 email: user.email
//             };
//             res.json({ operation: true })
//         })
// })

//CHECK FOR ONGOING APPOINTMENT
router.get(`/appointments/check`, (req, res) => {
    const { id } = req.session.user

    db.query(`SELECT * FROM appointments WHERE id=${db.escape(id)} AND (status='Approved' OR status='Pending' OR status='Follow-up')`, (err, result) => {
        if(err) throw err;

        if(result.length >= 1) return res.json({ operation: false, msg: "You have an ongoing appointment" })
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

    let { email, username, password } = req.body

    db.query(`
    SELECT email FROM patient_accounts WHERE email=${db.escape(email)};
    SELECT username FROM patient_accounts WHERE username=${db.escape(username)};
    SELECT username FROM admin_accounts WHERE username=${db.escape(username)};
    `,
    (err, results) => {
        if (err) throw err;

        const emailPatient = results[0]
        const usernamePatient = results[1]
        const usernameAdmin = results[2]

        if(emailPatient.length >= 1) return res.json({ operation: false, msg: "Email already exists" })
        if(usernameAdmin.length >= 1 || usernamePatient.length >= 1) return res.json({ operation: false, msg: "Username already exists" })

        //ENCRYPT PASSWORD
        password = bcrypt.hashSync(password, 10)

        //INSERT ACCOUNT TO DATABASE
        db.query(`INSERT INTO patient_accounts(email,password,username) VALUES(${db.escape(email)},${db.escape(password)},${db.escape(username)})`, (err1) => {
            if (err1) throw err1;

            return res.json({ operation: true })
        })

        //SEND EMAIL VERIFICATION
        // try {
        //     const token = jwt.sign({ email }, process.env.SECRET, { expiresIn: '365d' })

        //     transporter(email, `<b>Click this <a href="http://${req.header('host')}/client/verify?token=${token}" >link</a> to verify your account.</b>`)
        //         .then((result) => {
        //             return res.json({ operation: true, msg: result.response })
        //         })
        // } catch (err) {
        //     res.status(500).json({ msg: "Server Error" })
        // }
    })
})

//VERIFY CLIENT ACCOUNT
router.get('/verify', (req, res) => {
    const token = req.query.token;
    if (!token) return res.status(401).send("Token is required");

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        db.query(`UPDATE patient_accounts SET verified=1 WHERE email=${db.escape(decoded.email)}`, (err, result) => {
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

    db.query(`SELECT email,verified FROM patient_accounts WHERE email=${db.escape(email)}`, (err, result) => {
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
    db.query(`SELECT email,password FROM patient_accounts WHERE email=${db.escape(email)}`,
        (err, result) => {
            if (err) throw err;

            const user = { ...result[0] }

            if (bcrypt.compareSync(newPassword, user.password)) return res.json({ operation: false })

            //ENCRYPT NEW PASSWORD
            newPassword = bcrypt.hashSync(newPassword, 10);

            //CHANGE PASSWORD
            db.query(`UPDATE patient_accounts SET password=${db.escape(newPassword)} WHERE email=${db.escape(email)}`,
                (err1, result1) => {
                    if (err1) throw err1;

                    return res.json({ operation: true })
                })
        })
})

//SAVE/UPDATE USER INFORMATION
router.put('/update/user/:id', (req, res) => {
    let { id } = req.params;

    //UPDATE PICTURE
    if (req.headers['content-type'] != 'application/json') {
        form.parse(req, (err, fields, files) => {
            if (err) throw err;

            const { image } = files;

            db.query(`SELECT picture FROM patient_accounts WHERE id=${db.escape(id)}`,
                (queryError, checkPicture) => {
                    if (queryError) throw queryError;

                    let newFileName = '';
                    if (checkPicture[0].picture == '/images/profile-placeholder.jpg') {
                        newFileName = image.newFilename
                    } else {
                        const splittedFileName = checkPicture[0].picture.split("/");
                        newFileName = splittedFileName[splittedFileName.length - 1];
                    }

                    fs.renameSync(image.filepath, `${process.cwd()}/assets/images/${newFileName}`)

                    db.query(`UPDATE patient_accounts SET picture=${db.escape(`/images/${newFileName}`)} WHERE id=${db.escape(id)}`,
                    (updateError) => {
                        if (updateError) throw updateError;
                        res.json({ operation: true })
                    })
                })

        })
        return null
    }

    let { fullname, contact, address, gender, birthdate, age, guardian } = req.body

    fullname = JSON.stringify(fullname)
    guardian = JSON.stringify(guardian)

    //UPDATE USER INFORMATION
    db.query(`UPDATE patient_accounts SET guardian=${db.escape(guardian)},fullname=${db.escape(fullname)},contact=${db.escape(contact)},address=${db.escape(address)},gender=${db.escape(gender)},birthdate=${db.escape(birthdate)},age=${db.escape(age)} WHERE id=${db.escape(id)}`,
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
    const { patient_type, med_complain, schedule } = req.body
    const apt_id = uuid.v4();

    db.query(`SELECT * FROM patient_accounts WHERE id=${db.escape(id)}`,
        (err, result) => {
            if (err) throw err;

            if (!result[0].fullname || !result[0].address || !result[0].birthdate) return res.json({ operation: false })

            db.query(`INSERT INTO appointments(apt_id,id,schedule,apt_type,patient_type,med_complain) VALUES(${db.escape(apt_id)},${db.escape(id)},${db.escape(schedule)},'Online',${db.escape(patient_type)},${db.escape(med_complain)});`,
                (err) => {
                    if (err) throw err;
                    res.json({ operation: true })
                })
        })

})

//GET PATIENT APPOINTMENTS
router.get('/appointments/list', protected, (req, res) => {
    const { id } = req.session.user
    const { sort, show } = req.query

    let status = `NOT status='Done'`
    let schedule = `NOT schedule IS NULL`

    if (sort == "Approved") status = `status='Approved'`
    if (sort == "Pending") status = `status='Pending'`
    if (sort == "Cancelled") status = `status='Cancelled'`

    if (show == "Today") schedule = `DATE(schedule)=CURDATE()`
    if (show == "Week") schedule = `WEEK(schedule)=WEEK(CURDATE())`
    if (show == "Month") schedule = `MONTH(schedule)=MONTH(CURDATE())`

    db.query(`SELECT schedule,patient_type,status FROM appointments WHERE ${status} AND ${schedule} AND id=${db.escape(id)} ORDER BY schedule;`,
        (err, result) => {
            if (err) throw err;

            res.json({
                data: result.map((obj) => ({
                    ...obj,
                    schedule: dayjs(obj.schedule).format("MMM DD, YYYY hh:mm A")
                }))
            })
        })
})

//GET PATIENT APPOINTMENTS FOR FULLCALENDAR DISPLAY
router.get('/appointments/calendar', protected, (req, res) => {
    const { id } = req.session.user

    db.query(`SELECT id,patient_type AS title,schedule AS start,status,reason FROM appointments WHERE id=${db.escape(id)} AND NOT schedule IS NULL AND apt_type='Online';`,
    (err, result) => {
        if(err) throw err;

        let data = result.map((obj) => ({
            ...obj,
            title: `${dayjs(obj.start).format("h:mmA")} ${obj.title} - ${obj.status}`,
            header: dayjs(obj.start).format("MMM D, YYYY")
        }))

        res.status(200).json(data)
    })
})

//GET PATIENT MEDICAL RECORDS
router.get("/med-records", protected, (req, res) => {
    const { id } = req.session.user

    let mr = `mr.ailment AS ailment,mr.date_created AS date_created,mr.mr_id AS mr_id`
    let apt = `apt.patient_type AS patient_type`

    db.query(`SELECT ${mr},${apt} FROM medical_records AS mr INNER JOIN appointments AS apt ON mr.mr_id=apt.apt_id WHERE mr.id=${db.escape(id)} AND apt.status='Done' ORDER BY date_created DESC;`,
        (err, result) => {
            if (err) throw err;

            res.json({
                data: result.map((obj) => ({
                    ...obj,
                    date_created: dayjs(obj.date_created).format("MMM DD, YYYY hh:mm A"),
                    ailment: JSON.parse(obj.ailment)
                }))
            })
        })
})

//EXPORT
module.exports = router;