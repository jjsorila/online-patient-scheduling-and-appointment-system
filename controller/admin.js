require("dotenv").config({ path: `${process.cwd()}/.env` })
const express = require('express');
const router = express.Router();
const { protected, onlyAdmin } = require('../middlewares/admin');
const db = require('../db/db')
const dayjs = require('dayjs');
const isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween)
const uuid = require("uuid");
const nodemailer = require("nodemailer")
const transporter = (email, body) => {
    return nodemailer.createTransport({
        host: "smtp-relay.sendinblue.com",
        port: 587,
        secure: false,
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
}

//================================================================================================================================

//ADMIN DASHBOARD
router.get('/dashboard', protected, (req, res) => {
    db.query(`
        SELECT COUNT(id) AS total_patients FROM patient_accounts WHERE NOT fullname IS NULL;
        SELECT COUNT(admin_id) AS total_doctors FROM admin_accounts;
        SELECT COUNT(apt_id) AS total_scheduled FROM appointments WHERE (status='Approved' OR status='Follow-up') AND (DAY(schedule)=DAY(CURDATE()) OR DAY(date_created_walk_in)=DAY(CURDATE()));
        SELECT COUNT(staff_id) AS total_staffs FROM staff_list;
        SELECT * FROM schedule;
    `, (err, result) => {
        if(err) throw err;

        res.render('admin/dashboard.ejs', {
            admin: { ...req.session.admin },
            data: {
                patients: result[0][0].total_patients,
                doctors: (result[1][0].total_doctors - 1),
                scheduled: result[2][0].total_scheduled,
                staffs: result[3][0].total_staffs,
                schedule: result[4][0]
            }
        })
    })

})

//ADMIN LOGIN PAGE
// router.get('/login', login, (req, res) => {
//     res.render('admin/login.ejs')
// })

//ADMIN ACCOUNT PAGE
router.get('/accounts', protected, onlyAdmin, (req, res) => {
    res.render('admin/accounts/accounts.ejs', { admin: { ...req.session.admin } })
})

//PATIENT LIST PAGE
router.get('/patients', protected, (req, res) => {
    res.render('admin/patients/patients.ejs', { admin: { ...req.session.admin } })
})

//PATIENT INFO PAGE
router.get('/patients/:patient_id', protected, (req, res) => {
    const { patient_id } = req.params

    db.query(`SELECT username,email,picture,fullname,contact,gender,birthdate,age,address,patient_history,guardian FROM patient_accounts WHERE id=${db.escape(patient_id)}`,
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

    const pa = `pa.picture AS picture,pa.fullname AS fullname,pa.age AS age,pa.birthdate AS birthdate,pa.contact AS contact,pa.address AS address,pa.gender AS gender,pa.patient_history AS patient_history,pa.guardian AS guardian`
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
    res.render('admin/appointments/appointments.ejs', { admin: { ...req.session.admin } })
})

//SCHEDULED APPOINTMENTS PAGE
router.get('/scheduled', protected, (req, res) => {
    res.render("admin/scheduled/scheduled.ejs", { admin: { ...req.session.admin } })
})

//CREATE MEDICAL RECORD PAGE
router.get('/scheduled/:apt_id', protected, (req, res) => {
    const { apt_id } = req.params

    const pa = `pa.id AS patient_id,pa.fullname AS fullname,pa.age AS age,pa.birthdate AS birthdate,pa.contact AS contact,pa.address AS address,pa.gender AS gender,pa.patient_history AS patient_history,pa.guardian AS guardian,pa.picture AS picture`
    const apt = `apt.patient_type AS patient_type,apt.med_complain AS med_complain,apt.status AS status,apt.link_to AS link_to`

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

//STAFFS PAGE
router.get('/staffs', protected, onlyAdmin, (req, res) => {
    res.render('admin/staffs/staffs.ejs', { admin: { ...req.session.admin } })
})

//================================================================================================================================

//LOGIN ACCOUNT
// router.post('/login', (req, res) => {
//     let { username, password } = req.body

//     db.query(`SELECT admin_id,username,password,specialty,fullname FROM admin_accounts WHERE username=${db.escape(username)}`,
//         (err, result) => {
//             if (err) throw err;

//             const user = { ...result[0] }

//             if (password != user.password || result.length <= 0) return res.json({ operation: false })

//             req.session.admin = {
//                 id: user.admin_id,
//                 specialty: user.specialty,
//                 fullname: user.fullname
//             }

//             res.json({ operation: true })
//         })
// })

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

    db.query(`SELECT pa.email AS email,apt.apt_id AS apt_id,apt.schedule AS schedule,apt.status AS status,pa.fullname AS fullname,pa.contact AS contact,pa.address AS address FROM appointments AS apt INNER JOIN patient_accounts AS pa ON apt.id=pa.id WHERE ${query} ORDER BY schedule;`, (err, result) => {
        if (err) throw err;

        const parsed = result.map((obj) => ({
            ...obj,
            apt_id: {
                id: obj.apt_id,
                email: obj.email,
                schedule: obj.schedule
            },
            schedule: dayjs(obj.schedule).format("MMM DD, YYYY h:mm A"),
            fullname: JSON.parse(obj.fullname)
        }))

        res.json({ data: parsed })
    })
})

//APPROVE/CANCEL APPOINTMENTS
router.post('/action/appointments', (req, res) => {
    const { action, apt_id, reason, email, schedule } = req.body

    db.query(`UPDATE appointments SET status=${db.escape(action)} WHERE apt_id=${db.escape(apt_id)}`,
    (err1) => {
        if (err1) throw err1;

        if(action == "Cancelled"){
            db.query(`UPDATE appointments SET reason=${db.escape(reason)} WHERE apt_id=${db.escape(apt_id)}`, (err2) => {
                if(err2) throw err2;
            })

            transporter(email, `
                <h3>Your appointment on ${dayjs(schedule).format("MMM DD, YYYY h:mm A")} has been cancelled</h3>
                <h5>Reason: ${reason}</h5>
            `).then((msg) => {
                res.json({ operation: true })
            })

            return null
        }

        res.json({ operation: true })
    })
})

//GET ALL PATIENTS
router.get('/list/patients', (req, res) => {
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

//SCHEDULE WALK-IN PATIENT
router.post('/schedule/walk-in', (req, res) => {
    const { patient_type, patient_id } = req.body

    const patientMedicalRecordDate = dayjs(dayjs(new Date().toLocaleString("en-US", { timeZone: 'Asia/Hong_Kong' }).replace(',', '')).toDate()).format("YYYY-MM-DD HH:mm:ss")

    db.query(`INSERT INTO appointments(apt_id,id,status,apt_type,date_created_walk_in,patient_type) VALUES(${db.escape(uuid.v4())},${db.escape(patient_id)},'Approved','Walk-in',${db.escape(patientMedicalRecordDate)},${db.escape(patient_type)})`,
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
    const { sort } = req.query

    let myquery;

    if(!sort){
        myquery = `
        SELECT pa.fullname AS fullname,pa.id AS id,apt.apt_id AS apt_id,apt.apt_type AS apt_type,apt.patient_type AS patient_type,apt.schedule AS schedule FROM appointments AS apt INNER JOIN patient_accounts AS pa ON apt.id=pa.id WHERE DAY(apt.schedule)=DAY(CURDATE()) AND apt.apt_type='Online' AND (apt.status='Approved' OR apt.status='Follow-up') ORDER BY apt.schedule;
        SELECT pa.fullname AS fullname,pa.id AS id,apt.apt_id AS apt_id,apt.apt_type AS apt_type,apt.patient_type AS patient_type,apt.date_created_walk_in AS schedule FROM appointments AS apt INNER JOIN patient_accounts AS pa ON apt.id=pa.id WHERE DAY(apt.date_created_walk_in)=DAY(CURDATE()) AND apt.apt_type='Walk-in' AND (apt.status='Approved' OR apt.status='Follow-up') ORDER BY apt.date_created_walk_in;
        `
    }else{
        myquery = `
        SELECT pa.fullname AS fullname,pa.id AS id,apt.apt_id AS apt_id,apt.apt_type AS apt_type,apt.patient_type AS patient_type,apt.schedule AS schedule FROM appointments AS apt INNER JOIN patient_accounts AS pa ON apt.id=pa.id WHERE ${sort}(apt.schedule)=${sort}(CURDATE()) AND apt.apt_type='Online' AND (apt.status='Approved' OR apt.status='Follow-up') ORDER BY apt.schedule;
        SELECT pa.fullname AS fullname,pa.id AS id,apt.apt_id AS apt_id,apt.apt_type AS apt_type,apt.patient_type AS patient_type,apt.date_created_walk_in AS schedule FROM appointments AS apt INNER JOIN patient_accounts AS pa ON apt.id=pa.id WHERE ${sort}(apt.date_created_walk_in)=${sort}(CURDATE()) AND apt.apt_type='Walk-in' AND (apt.status='Approved' OR apt.status='Follow-up') ORDER BY apt.date_created_walk_in;
        `
    }

    db.query(myquery,
        (err, result) => {
            if (err) throw err;

            const onlineScheduled = result[0].map((scheduled) => ({
                ...scheduled,
                fullname: JSON.parse(scheduled.fullname),
                schedule: dayjs(scheduled.schedule).format("MMM DD, YYYY hh:mm A")
            }))

            const walkinScheduled = result[1].map((scheduled) => ({
                ...scheduled,
                fullname: JSON.parse(scheduled.fullname),
                schedule: dayjs(scheduled.schedule).format("MMM DD, YYYY")
            }))

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
    const patientMedicalRecordDate = dayjs(dayjs(new Date().toLocaleString("en-US", { timeZone: 'Asia/Hong_Kong' }).replace(',', '')).toDate()).format("YYYY-MM-DD HH:mm:ss")

    db.query(`
        UPDATE appointments SET status='Done' WHERE apt_id=${db.escape(apt_id)};
        UPDATE patient_accounts SET patient_history=${db.escape(patient_history)} WHERE id=${db.escape(patient_id)};
        INSERT INTO medical_records(mr_id,id,temperature,bp,weight,height,ailment,date_created) VALUES(${db.escape(apt_id)},${db.escape(patient_id)},${db.escape(temperature)},${db.escape(bp)},${db.escape(weight)},${db.escape(height)},${db.escape(ailment)},${db.escape(patientMedicalRecordDate)});
    `,
        (err, result) => {
            if (err) throw err;
            res.json({ operation: true })
        })
})

//SUBMIT FOLLOW UP
router.post('/follow-up', (req, res) => {
    const follow_up_id = uuid.v4()

    const {
        patient_id,
        patient_type,
        med_complain,
        link_to,
        apt_id,
        sched,
    } = req.body

    db.query(`
        UPDATE appointments SET status='Done' WHERE apt_id=${db.escape(apt_id)};
        INSERT INTO appointments(apt_id,id,link_to,schedule,status,apt_type,patient_type,med_complain) VALUES(${db.escape(follow_up_id)},${db.escape(patient_id)},${db.escape(link_to || apt_id)},${db.escape(sched)},'Follow-up','Online',${db.escape(patient_type)},${db.escape(med_complain)});
    `,(err, result) => {
        if(err) throw err;
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
    const patientMedicalRecordDate = dayjs(dayjs(new Date().toLocaleString("en-US", { timeZone: 'Asia/Hong_Kong' }).replace(',', '')).toDate()).format("YYYY-MM-DD HH:mm:ss")

    db.query(`
        UPDATE patient_accounts SET patient_history=${db.escape(patient_history)} WHERE id=${db.escape(patient_id)};
        UPDATE medical_records SET temperature=${db.escape(temperature)},bp=${db.escape(bp)},height=${db.escape(height)},weight=${db.escape(weight)},ailment=${db.escape(ailment)},date_updated=${db.escape(patientMedicalRecordDate)} WHERE mr_id=${db.escape(mr_id)};
    `,
        (err, result) => {
            if (err) throw err;
            res.json({ operation: true })
        })
})

//GET ALL DOCTOR ACCOUNTS
router.get("/doctors", protected, onlyAdmin, (req, res) => {

    db.query(`SELECT fullname,license_number,admin_id,specialty FROM admin_accounts WHERE NOT specialty='admin' ORDER BY fullname;`,
        (err, result) => {
            if (err) throw err;

            res.json({
                data: result.map((acc) => ({
                    ...acc,
                    specialty: acc.specialty == "OB" ? "OB-GYNE" : acc.specialty
                }))
            })
        })
})

//GET ALL STAFFS
router.get('/staffs/list', (req, res) => {
    db.query(`SELECT * FROM staff_list;`,
    (err, result) => {
        if(err) throw err;

        res.json({
            data: result
        })
    })
})

//DELETE DOCTOR ACCOUNT
router.delete("/doctors", protected, onlyAdmin, (req, res) => {
    const { admin_id } = req.body;

    db.query(`DELETE FROM admin_accounts WHERE admin_id=${db.escape(admin_id)};`,
        (err, result) => {
            if (err) throw err;
            res.json({ operation: true })
        })
})

//ADD DOCTOR ACCOUNT
router.post("/doctors", protected, onlyAdmin, (req, res) => {
    const { fullname, license_number, username, specialty, password, gender } = req.body

    let values = `${db.escape(specialty)},${db.escape(username)},${db.escape(password)},${db.escape(fullname)},${db.escape(license_number)},${db.escape(gender)}`
    db.query(`
    SELECT username FROM admin_accounts WHERE username=${db.escape(username)};
    SELECT username FROM patient_accounts WHERE username=${db.escape(username)};
    `,
        (errMatch, checkMatch) => {
            if (errMatch) throw errMatch;

            const usernameAdmin = checkMatch[0];
            const usernamePatient = checkMatch[1];

            if (usernameAdmin.length >= 1 || usernamePatient.length >= 1) return res.json({ operation: false })

            db.query(`INSERT INTO admin_accounts(specialty,username,password,fullname,license_number,gender) VALUES(${values})`,
            (err, result) => {
                if (err) throw err;
                res.json({ operation: true })
            })
        })
})

//ADD STAFF
router.post('/staffs', (req, res) => {
    let { fullname, role, gender } = req.body

    console.log(req.body)

    db.query(`INSERT INTO staff_list(fullname,role,gender) VALUES(${db.escape(fullname)},${db.escape(role)},${db.escape(gender)})`,
    (err, result) => {
        if(err) throw err;

        res.json({ operation: true })
    })
})

//DELETE STAFF
router.delete('/staffs', (req, res) => {
    let { staff_id } = req.query

    db.query(`DELETE FROM staff_list WHERE staff_id=${db.escape(staff_id)}`,
    (err, result) => {
        if(err) throw err;
        res.json({ operation: true })
    })
})

//UPDATE STAFF
router.put('/staffs', (req ,res) => {
    const { staff_id, fullname, role, gender } = req.body
    db.query(`UPDATE staff_list SET gender=${db.escape(gender)},fullname=${db.escape(fullname)},role=${db.escape(role)} WHERE staff_id=${db.escape(staff_id)}`,
    (err, result) => {
        if(err) throw err;

        return res.json({ operation: true })
    })
})

//GET INFO STAFF
router.get('/getinfostaff', (req, res) => {
    const { staff_id } = req.query

    db.query(`SELECT * FROM staff_list WHERE staff_id=${db.escape(staff_id)}`,
    (err, result) => {
        if(err) throw err;
        return res.json({ ...result[0] })
    })
})

//CHECK THE CURRENT TIMESLOT SCHEDULE AND CHECK FOR UNAVAILABLE DATES
router.get("/schedule_count", (req, res) => {
    const { patient_type } = req.query
    db.query(`SELECT * FROM schedule`, (err, result1) => {
        if(err) throw err;

        let startTime = dayjs(`2020-01-01 ${result1[0].startTime}`)
        let endTime = dayjs(`2020-01-01 ${result1[0].endTime}`)

        let totalAvailableTime = [];

        while(startTime.isBefore(endTime)){
            totalAvailableTime.push(startTime)
            startTime = startTime.add(15, "m")
        }

        db.query(`SELECT COUNT(DATE(schedule)) AS schedule_count,DATE(schedule) AS schedule FROM appointments WHERE NOT schedule IS NULL AND patient_type=${db.escape(patient_type)} GROUP BY DATE(schedule) HAVING COUNT(DATE(schedule))>=${db.escape(totalAvailableTime.length)};
    SELECT * FROM schedule;`,
    (err, result) => {
        if(err) throw err;
        const unavailable_dates = result[0].map((schedule) => dayjs(schedule.schedule).format("YYYY-MM-DD"))
        res.json({
            unavailable_dates,
            schedule: result[1]
        })
    })
    })
})

//GET CURRENT TIMESLOT
router.get("/timeslot", (req, res) => {
    db.query(`SELECT * FROM schedule`, (err,[ schedule ]) => {
        if(err) throw err;
        res.json(schedule)
    })
})

//UPDATE CURRENT TIMESLOT
router.put("/timeslot", (req, res) => {
    const { startDay, endDay, startTime, endTime } = req.body;

    db.query(`UPDATE schedule SET startDay=${db.escape(startDay)},endDay=${db.escape(endDay)},startTime=${db.escape(startTime)},endTime=${db.escape(endTime)}`, (err, result) => {
        if(err) throw err;
        res.json({
            msg: "Successfully updated!",
            operation: true
        })
    })
})

//CHECK IF TIME IS AVAILABLE
router.post("/time/available", (req, res) => {
    const { dateSched, patient_type } = req.body


    db.query(`
        SELECT * FROM schedule;
        SELECT * FROM appointments WHERE DATE(schedule)=DATE(${db.escape(dateSched)}) AND patient_type=${db.escape(patient_type)};
    `,(err, result) => {
        if(err) throw err;

        let startTime = dayjs(`2020-01-01 ${result[0][0].startTime}`)
        let endTime = dayjs(`2020-01-01 ${result[0][0].endTime}`)

        let existingSchedules = result[1].map((apt) => (dayjs(apt.schedule).format("HH:mm:ss")))
        let availableTimes = []

        while(startTime.isBefore(endTime)){
            availableTimes.push(startTime.format("HH:mm:ss"))
            startTime = startTime.add(15, "m")
        }

        let results = []

        availableTimes.forEach((v, i) => {
            let time = {
                id: i,
                text: dayjs(`2020-01-01 ${v}`).format("h:mm A"),
                orig: v
            }

            if(existingSchedules.includes(v)){
                return;
            }

            if(dayjs(`2020-01-01 ${v}`).isBetween(`2020-01-01 11:59:00`,`2020-01-01 13:00:00`)){
                return;
            }

            results.push(time)
        })

        res.json({
            results
        })
    })
})

//GET LINKED CHECK UPS
router.get("/linked-checkup", (req, res) => {
    const { apt_id } = req.query;

    db.query(`
        SELECT mr.mr_id AS mr_id,mr.ailment AS ailment,mr.date_created AS date_created FROM medical_records AS mr INNER JOIN appointments AS apt ON apt.apt_id=mr.mr_id WHERE (apt.link_to=${db.escape(apt_id)} OR mr.mr_id=${db.escape(apt_id)}) AND apt.status='Done' ORDER BY mr.date_created DESC;
    `,(err, result) => {
        if(err) throw err;

        res.json({
            data: result.map((apt) => ({
                ...apt,
                ailment: JSON.parse(apt.ailment),
                date_created: dayjs(apt.date_created).format("MMM DD, YYYY hh:mm A")
            }))
        })
    })
})

//EXPORT
module.exports = router;