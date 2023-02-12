require("dotenv").config({ path: `${process.cwd()}/.env` })
const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const db = require('./db/db');
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat")

//VIEW ENGINE
app.set("view engine", "ejs");

//SERVE ASSETS
app.use(express.static("assets"));

//GLOBAL MIDDLEWARES
app.use(express.urlencoded({ extended: true }), express.json())
app.use(cookieSession({
    secret: process.env.SECRET,
    maxAge: 86400000
}))


//ROUTES =============================================================

//HOME
app.get('/', (req, res) => {
    db.query(`
    SELECT * FROM admin_accounts WHERE NOT gender IS NULL;
    SELECT * FROM staff_list;
    SELECT * FROM schedule;
    `,
    (err, result) => {
        if(err) throw err;

        const d = result[0].map((doc) => {
            return ({
                ...doc,
                fullname: `${doc.gender == "Male" ? "Dr." : "Dra."} ${doc.fullname}`,
                specialty: doc.specialty == "Pedia" ? "Pediatrician" : "OB-GYNE"
            })
        });
        const s = result[1].map((staff) => ({
            ...staff,
            fullname: `${staff.gender == "Male" ? "Mr." : "Ms."} ${staff.fullname}`
        }));

        res.render('home.ejs', {
            user: null,
            doctors: d,
            staffs: s,
            schedule: {
                ...result[2][0],
                startTime: dayjs(`1991/01/01 ${result[2][0].startTime}`).format("h:mm A"),
                endTime: dayjs(`1991/01/01 ${result[2][0].endTime}`).format("h:mm A")
            }
        })
    })
})

//LOGIN
app.use('/login', require('./controller/login'))

//CLIENT
app.use('/client', require('./controller/client'))

//ADMIN
app.use('/admin', require('./controller/admin'))

//REPORTS
app.use('/reports', require('./controller/reports'))

//404 NOT FOUND
app.all("*", (req, res) => res.send("<h1>404 Not Found</h1>"))

//ROUTES =============================================================

//PORT & DATABASE
const PORT = process.env.PORT;

db.connect((error) => {
    if (error) throw error;
    app.listen(PORT, () => {
        console.log(`Listening to port ${PORT}`)
        console.log('DB Connected')
    })

})