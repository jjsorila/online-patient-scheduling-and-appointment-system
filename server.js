require("dotenv").config({ path: "./.env" })
const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const db = require('./db/db');

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
    res.render('home.ejs', { user: null })
})

//CLIENT
app.use('/client', require('./controller/client'))

//ADMIN

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