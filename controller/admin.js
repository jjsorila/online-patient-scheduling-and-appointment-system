require("dotenv").config({ path: `${process.cwd()}/.env` })
const express = require('express');
const router = express.Router();
const { protected, login } = require('../middlewares/admin');
const db = require('../db/db')
const dayjs = require('dayjs')

//================================================================================================================================

//ADMIN LOGIN PAGE
router.get('/login', login, (req, res) => {
    res.render('admin/login.ejs')
})

//PATIENTS LIST
router.get('/patients', protected, (req, res) => {
    res.render('admin/patients/patients.ejs')
})

//APPOINTMENTS LIST
router.get('/appointments', protected, (req, res) => {
    res.render('admin/appointments/appointments.ejs')
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

//GET APPOINTMENTS
router.get('/list/appointments', (req, res) => {
    let { show } = req.query

    let query = "status='Pending'"
    if(show == "today") query = "DATE(schedule)=CURDATE() AND status='Pending'"
    if(show == "week") query = "WEEK(schedule)=WEEK(CURDATE()) AND status='Pending'"
    if(show == "month") query = "MONTH(schedule)=MONTH(CURDATE()) AND status='Pending'"

    db.query(`SELECT apt_id,schedule,status FROM appointments WHERE ${query} ORDER BY DATE(schedule), TIME(schedule);`, (err, result) => {
        if(err) throw err;

        const parsed = result.map((obj) => ({ ...obj, schedule: dayjs(obj.schedule).format("MMM DD, YYYY hh:mm A") }))

        res.json({ data: parsed })
    })
})

//APPROVE/CANCEL APPOINTMENTS
router.post('/action/appointments', (req, res) => {
    const { action,apt_id } = req.body

    db.query(`UPDATE appointments SET status=${db.escape(action)} WHERE apt_id=${db.escape(apt_id)}`,
    (err, result) => {
        if(err) throw err;

        res.json({ operation: true })
    })
})
module.exports = router;