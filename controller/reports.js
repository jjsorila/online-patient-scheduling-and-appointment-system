require("dotenv").config({ path: `${process.cwd()}/.env` })
const express = require('express');
const router = express.Router();
const { protected, login } = require('../middlewares/admin');
const db = require('../db/db')
const dayjs = require('dayjs');
const uuid = require("uuid");

//================================================================================================================================

router.get('/', protected, (req, res) => {
    res.render("reports/reports.ejs", {
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
    let { day, month, year } = req.query

    let sort = `WHERE NOT date_created IS NULL`

    if(year != "all") sort = `WHERE YEAR(date_created)=${db.escape(year)}`
    if(month != "all") sort = `WHERE MONTH(date_created)=${db.escape(month)}`
    if(day != "all") sort = `WHERE DAY(date_created)=${db.escape(day)}`

    if(year != "all" && month != "all") sort = `WHERE YEAR(date_created)=${db.escape(year)} AND MONTH(date_created)=${db.escape(month)}`
    if(year != "all" && day != "all") sort = `WHERE YEAR(date_created)=${db.escape(year)} AND DAY(date_created)=${db.escape(day)}`
    if(month != "all" && day != "all") sort = `WHERE MONTH(date_created)=${db.escape(month)} AND DAY(date_created)=${db.escape(day)}`
    if(year != "all" && month != "all" && day != "all") sort = `WHERE YEAR(date_created)=${db.escape(year)} AND MONTH(date_created)=${db.escape(month)} AND DAY(date_created)=${db.escape(day)}`

    const pa = `pa.fullname AS fullname`
    const apt = `apt.patient_type AS patient_type`
    const mr = `mr.ailment AS ailment,mr.date_created AS date_created`

    db.query(`SELECT ${pa},${apt},${mr} FROM ((patient_accounts AS pa INNER JOIN appointments AS apt ON pa.id=apt.id) INNER JOIN medical_records AS mr ON apt.apt_id=mr.mr_id) ${sort} ORDER BY date_created DESC;`,
    (err, result) => {
        if(err) throw err;
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

module.exports = router