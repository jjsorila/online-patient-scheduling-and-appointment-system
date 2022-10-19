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
    let { show } = req.query
    let sort = `WHERE NOT date_created IS NULL`
    if(show == "year") sort = `WHERE YEAR(date_created)=YEAR(NOW())`
    if(show == "month") sort = `WHERE MONTH(date_created)=MONTH(NOW())`
    if(show == "week") sort = `WHERE WEEK(date_created)=WEEK(NOW())`
    if(show == "today") sort = `WHERE DAY(date_created)=DAY(NOW())`

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