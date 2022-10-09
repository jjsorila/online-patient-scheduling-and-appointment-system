require("dotenv").config({ path: `${process.cwd()}/.env` })
const express = require('express');
const router = express.Router();
const { protected, login } = require('../middlewares/admin');
const db = require('../db/db')
const dayjs = require('dayjs');
const uuid = require("uuid")
function getAge(dateString) {
    var ageInMilliseconds = new Date() - new Date(dateString);
    return Math.floor(ageInMilliseconds / 1000 / 60 / 60 / 24 / 365); // convert to years
}

//================================================================================================================================

//ADMIN LOGIN PAGE
router.get('/login', login, (req, res) => {
    res.render('admin/login.ejs')
})

//PATIENT LIST
router.get('/patients', protected, (req, res) => {
    res.render('admin/patients/patients.ejs')
})

//PATIENT INFO PAGE
router.get('/patients/:patient_id', protected, (req, res) => {
    const { patient_id } = req.params

    db.query(`SELECT picture,fullname,contact,gender,birthdate,age,address,patient_history,guardian FROM patient_accounts WHERE id=${db.escape(patient_id)}`,
        (err, result) => {
            if (err) throw err;

            res.render("admin/patients/patient-info.ejs", {
                patient_id,
                user: {
                    ...result[0],
                    fullname: JSON.parse(result[0].fullname),
                    birthdate: dayjs(result[0].birthdate).format("YYYY-MM-DD"),
                    guardian: JSON.parse(result[0].guardian)
                }
            })
        })
})

//UPDATE MEDICAL RECORD PAGE
router.get('/patients/:patient_id/:mr_id', protected, (req, res) => {
    const { patient_id, mr_id } = req.params

    const pa = `pa.fullname AS fullname,pa.age AS age,pa.birthdate AS birthdate,pa.contact AS contact,pa.address AS address,pa.gender AS gender,pa.patient_history AS patient_history,pa.guardian AS guardian`
    const apt = `apt.patient_type AS patient_type,apt.med_complain AS med_complain`
    const mr = `mr.temperature AS temperature,mr.bp AS bp,mr.weight AS weight,mr.height AS height,mr.ailment AS ailment`

    db.query(`
        SELECT ${pa},${apt},${mr} FROM ((patient_accounts AS pa INNER JOIN medical_records AS mr ON pa.id=mr.id) INNER JOIN appointments AS apt ON apt.apt_id=mr.mr_id) WHERE mr.mr_id=${db.escape(mr_id)} AND apt.apt_id=${db.escape(mr_id)};
    `,
        (err, result) => {
            if (err) throw err;
            res.render("admin/patients/med-record.ejs", {
                patient_id, mr_id,
                user: {
                    ...result[0],
                    fullname: JSON.parse(result[0].fullname),
                    ailment: JSON.parse(result[0].ailment),
                    birthdate: dayjs(result[0].birthdate).format("YYYY-MM-DD"),
                    guardian: JSON.parse(result[0].guardian)
                }
            })
        })
})

//APPOINTMENT LIST PAGE
router.get('/appointments', protected, (req, res) => {
    res.render('admin/appointments/appointments.ejs')
})

//SCHEDULED APPOINTMENTS PAGE
router.get('/scheduled', protected, (req, res) => {
    res.render("admin/scheduled/scheduled.ejs")
})

//CREATE MEDICAL RECORD PAGE
router.get('/scheduled/:apt_id', protected, (req, res) => {
    const { apt_id } = req.params

    const pa = `pa.id AS patient_id,pa.fullname AS fullname,pa.age AS age,pa.birthdate AS birthdate,pa.contact AS contact,pa.address AS address,pa.gender AS gender,pa.patient_history AS patient_history,pa.guardian AS guardian`
    const apt = `apt.patient_type AS patient_type,apt.med_complain AS med_complain`

    db.query(`SELECT ${pa},${apt} FROM patient_accounts AS pa INNER JOIN appointments AS apt ON pa.id=apt.id WHERE apt.apt_id=${db.escape(apt_id)}`,
        (err, result) => {
            if (err) throw err;

            res.render("admin/scheduled/new-med-record.ejs", {
                apt_id,
                user: {
                    ...result[0],
                    fullname: JSON.parse(result[0].fullname),
                    birthdate: dayjs(result[0].birthdate).format("YYYY-MM-DD"),
                    guardian: JSON.parse(result[0].guardian)
                }
            })
        })
})

//================================================================================================================================

//LOGIN ACCOUNT
router.post('/login', (req, res) => {
    let { username, password } = req.body

    db.query(`SELECT admin_id,username,password FROM admin_accounts WHERE username=${db.escape(username)}`,
        (err, result) => {
            if (err) throw err;

            const user = { ...result[0] }

            if (password != user.password) return res.json({ operation: false })

            req.session.admin = {
                id: user.admin_id,
                user: user.username
            }

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

//GET ALL APPOINTMENTS
router.get('/list/appointments', (req, res) => {
    let { show } = req.query

    let query = "status='Pending'"
    if (show == "today") query = "DATE(schedule)=CURDATE() AND status='Pending'"
    if (show == "week") query = "WEEK(schedule)=WEEK(CURDATE()) AND status='Pending'"
    if (show == "month") query = "MONTH(schedule)=MONTH(CURDATE()) AND status='Pending'"

    db.query(`SELECT apt.apt_id AS apt_id,apt.schedule AS schedule,apt.status AS status,pa.fullname AS fullname,pa.contact AS contact,pa.address AS address FROM appointments AS apt INNER JOIN patient_accounts AS pa ON apt.id=pa.id WHERE ${query} ORDER BY schedule;`, (err, result) => {
        if (err) throw err;

        const parsed = result.map((obj) => ({
            ...obj,
            schedule: dayjs(obj.schedule).format("MMM DD, YYYY hh:mm A"),
            fullname: JSON.parse(obj.fullname)
        }))

        res.json({ data: parsed })
    })
})

//APPROVE/CANCEL APPOINTMENTS
router.post('/action/appointments', (req, res) => {
    const { action, apt_id } = req.body

    db.query(`UPDATE appointments SET status=${db.escape(action)} WHERE apt_id=${db.escape(apt_id)}`,
        (err, result) => {
            if (err) throw err;

            res.json({ operation: true })
        })
})

//GET ALL PATIENTS
router.get('/list/patients', (req, res) => {
    db.query(`SELECT fullname,id,contact,address,birthdate FROM patient_accounts WHERE NOT fullname IS NULL;`,
        (err, result) => {
            if (err) throw err;
            res.json({ data: result.map((patient) => ({
                ...patient,
                fullname: JSON.parse(patient.fullname),
                birthdate: dayjs(patient.birthdate).format("MMM DD, YYYY")
            })) })
        })
})

//SCHEDULE WALK-IN PATIENT
router.post('/schedule/walk-in', (req, res) => {
    const { patient_type, patient_id } = req.body

    db.query(`INSERT INTO appointments(apt_id,id,status,apt_type,date_created_walk_in,patient_type) VALUES(${db.escape(uuid.v4())},${db.escape(patient_id)},'Approved','Walk-in',CURRENT_TIMESTAMP(),${db.escape(patient_type)})`,
        (err, result) => {
            if (err) throw err;
            res.json({ operation: true })
        })
})

//ADD NEW PATIENT
router.post('/patients/new', (req, res) => {
    let { fullname, age, birthday, contact, gender, address, guardian } = req.body

    fullname = JSON.stringify(fullname)
    guardian = JSON.stringify(guardian)

    let values = `VALUES(${db.escape(fullname)},${db.escape(age)},${db.escape(birthday)},${db.escape(contact)},${db.escape(gender)},${db.escape(address)},${db.escape(guardian)})`

    db.query(`INSERT INTO patient_accounts(fullname,age,birthdate,contact,gender,address,guardian) ${values};`,
        (err, result) => {
            if (err) throw err;
            res.json({ operation: true })
        })

})

//GET PATIENT MEDICAL RECORDS
router.get("/patient/medical-records/:patient_id", (req, res) => {
    const { patient_id } = req.params

    db.query(`SELECT mr.ailment AS ailment,mr.date_created AS date_created,mr.mr_id AS mr_id FROM medical_records AS mr INNER JOIN patient_accounts AS pa ON mr.id=pa.id WHERE mr.id=${db.escape(patient_id)} ORDER BY date_created DESC`,
        (err, result) => {
            if (err) throw err;

            res.json({
                data: result.map((mr) => ({ ...mr, ailment: JSON.parse(mr.ailment), date_created: dayjs(mr.date_created).format("MMM DD, YYYY hh:mm A") }))
            })
        })
})

//SAVE/UPDATE PATIENT INFORMATION
router.put("/patient/update", (req, res) => {
    let { fullname, id, contact, address, birthdate, age, patient_history, guardian, gender } = req.body

    fullname = JSON.stringify(fullname)
    guardian = JSON.stringify(guardian)

    db.query(`UPDATE patient_accounts SET gender=${db.escape(gender)},guardian=${db.escape(guardian)},fullname=${db.escape(fullname)},contact=${db.escape(contact)},address=${db.escape(address)},birthdate=${db.escape(birthdate)},age=${db.escape(age)},patient_history=${db.escape(patient_history)} WHERE id=${db.escape(id)}`,
        (err, result) => {
            if (err) throw err;

            res.json({ operation: true })
        })
})

//GET SCHEDULED PATIENT TODAY
router.get('/schedule/list', (req, res) => {

    db.query(`
        SELECT pa.fullname AS fullname,pa.id AS id,apt.apt_id AS apt_id,apt.apt_type AS apt_type FROM appointments AS apt INNER JOIN patient_accounts AS pa ON apt.id=pa.id WHERE DATE(apt.schedule)=CURDATE() AND apt.apt_type='Online' AND apt.status='Approved' ORDER BY apt.schedule;
        SELECT pa.fullname AS fullname,pa.id AS id,apt.apt_id AS apt_id,apt.apt_type AS apt_type FROM appointments AS apt INNER JOIN patient_accounts AS pa ON apt.id=pa.id WHERE DATE(apt.date_created_walk_in)=CURDATE() AND apt.apt_type='Walk-in' AND apt.status='Approved' ORDER BY apt.date_created_walk_in;
        `,
        (err, result) => {
            if (err) throw err;

            const onlineScheduled = result[0].map((scheduled) => ({ ...scheduled, fullname: JSON.parse(scheduled.fullname) }))

            const walkinScheduled = result[1].map((scheduled) => ({ ...scheduled, fullname: JSON.parse(scheduled.fullname) }))

            res.json({ data: [...onlineScheduled, ...walkinScheduled] })
        })
})

//ADD NEW MEDICAL RECORD
router.post('/med-record/add/:apt_id', (req, res) => {
    const { apt_id } = req.params
    let {
        patient_id,
        patient_history,
        temperature,
        bp,
        height,
        weight,
        ailment
    } = req.body

    ailment = JSON.stringify(ailment)

    db.query(`
        UPDATE appointments SET status='Done' WHERE apt_id=${db.escape(apt_id)};
        UPDATE patient_accounts SET patient_history=${db.escape(patient_history)} WHERE id=${db.escape(patient_id)};
        INSERT INTO medical_records VALUES(${db.escape(apt_id)},${db.escape(patient_id)},${db.escape(temperature)},${db.escape(bp)},${db.escape(weight)},${db.escape(height)},${db.escape(ailment)},CURRENT_TIMESTAMP(),NULL);
    `,
        (err, result) => {
            if (err) throw err;
            res.json({ operation: true })
        })
})

//UPDATE MEDICAL RECORD
router.put('/med-record/update/:mr_id', (req, res) => {
    const { mr_id } = req.params
    let {
        patient_id,
        patient_history,
        temperature,
        bp,
        height,
        weight,
        ailment
    } = req.body

    ailment = JSON.stringify(ailment)

    db.query(`
        UPDATE patient_accounts SET patient_history=${db.escape(patient_history)} WHERE id=${db.escape(patient_id)};
        UPDATE medical_records SET temperature=${db.escape(temperature)},bp=${db.escape(bp)},height=${db.escape(height)},weight=${db.escape(weight)},ailment=${db.escape(ailment)},date_updated=CURRENT_TIMESTAMP() WHERE mr_id=${db.escape(mr_id)};
    `,
        (err, result) => {
            if (err) throw err;
            res.json({ operation: true })
        })
})

//EXPORT
module.exports = router;