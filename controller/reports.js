require("dotenv").config({ path: `${process.cwd()}/.env` })
const express = require('express');
const router = express.Router();
const { protected, login } = require('../middlewares/admin');
const db = require('../db/db')
const dayjs = require('dayjs');
const uuid = require("uuid");

//================================================================================================================================

router.get('/reports_masterlist', protected, (req, res) => {
    res.render("reports/reports_masterlist.ejs", {
        admin: { ...req.session.admin }
    })
})

router.get('/reports_accommodated', protected, (req, res) => {
    res.render("reports/reports_accommodated.ejs", {
        admin: { ...req.session.admin }
    })
})

router.get('/reports_scheduled', protected, (req, res) => {
    res.render("reports/reports_scheduled.ejs", {
        admin: { ...req.session.admin }
    })
})

//================================================================================================================================

//GET ALL PATIENTS' MASTERLIST
router.get('/patients', (req, res) => {
    db.query(`SELECT fullname,id,contact,address,birthdate FROM patient_accounts WHERE NOT fullname IS NULL;`,
        (err, result) => {
            if (err) throw err;
            res.json({
                data: result.map((patient) => ({
                    ...patient,
                    fullname: JSON.parse(patient.fullname),
                    birthdate: dayjs(patient.birthdate).format("MMM DD, YYYY")
                }))
            })
        })
})

//GET ALL DONE/ACCOMMODATED PATIENTS
router.get('/scheduled/done', (req, res) => {
    let { from, to } = req.query

    let sort = `WHERE NOT date_created IS NULL`

    if (from || to) sort = `WHERE DATE(date_created)=DATE(${db.escape(from || to)})`
    if (from && to) sort = `WHERE DATE(date_created) BETWEEN DATE(${db.escape(from)}) AND DATE(${db.escape(to)})`

    const pa = `pa.fullname AS fullname`
    const apt = `apt.patient_type AS patient_type`
    const mr = `mr.ailment AS ailment,mr.date_created AS date_created`

    db.query(`SELECT ${pa},${apt},${mr} FROM ((patient_accounts AS pa INNER JOIN appointments AS apt ON pa.id=apt.id) INNER JOIN medical_records AS mr ON apt.apt_id=mr.mr_id) ${sort} ORDER BY date_created DESC;`,
        (err, result) => {
            if (err) throw err;
            res.json({
                data: result.map((patient) => ({
                    ...patient,
                    fullname: JSON.parse(patient.fullname),
                    ailment: JSON.parse(patient.ailment),
                    date_created: dayjs(patient.date_created).format("MMM DD, YYYY hh:mm A")
                }))
            })
        })
})

//GET ALL SCHEDULED PATIENTS
router.get('/scheduled/all', (req, res) => {
    let { status, from, to } = req.query

    status = status == "All" ? null : status

    let sort = `WHERE NOT apt.status IS NULL`

    if(status) sort = `WHERE status=${db.escape(status)}`
    if(from || to) sort = `WHERE NOT status IS NULL AND DATE(schedule)=DATE(${db.escape(from || to)})`
    if(from && to) sort = `WHERE NOT status IS NULL AND DATE(schedule) BETWEEN DATE(${db.escape(from)}) AND DATE(${db.escape(to)})`

    if(status && (from || to)) sort = `WHERE status=${db.escape(status)} AND DATE(schedule)=DATE(${db.escape(from || to)})`
    if(status && from && to) sort = `WHERE status=${db.escape(status)} AND DATE(schedule) BETWEEN DATE(${db.escape(from)}) AND DATE(${db.escape(to)})`

    const pa = `pa.fullname AS fullname,pa.address AS address,pa.contact AS contact`
    const apt = `apt.patient_type AS patient_type,IF(apt.schedule IS NULL, apt.date_created_walk_in, apt.schedule) AS schedule`

    db.query(`SELECT ${pa},${apt} FROM patient_accounts AS pa INNER JOIN appointments AS apt ON pa.id=apt.id ${sort} ORDER BY schedule DESC`,
    (err, result) => {
        if(err) throw err;

        res.status(200).json({
            data: result.map((patient) => ({
                ...patient,
                fullname: JSON.parse(patient.fullname),
                schedule: dayjs(patient.schedule).format("MMM DD, YYYY hh:mm A")
            }))
        })
    })
})

module.exports = router