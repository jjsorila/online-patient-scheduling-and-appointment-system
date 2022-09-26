const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const { protected, auth } = require('./middlewares/checkAuth');
const db = require('./db/db');

//VIEW ENGINE
app.set("view engine", "ejs");

//SERVE ASSETS
app.use(express.static("assets"));

//GLOBAL MIDDLEWARES
app.use(express.urlencoded({ extended: true }), express.json())
app.use(cookieSession({
    secret: 'asdasdas',
    maxAge: 86400000
}))


//ROUTES

//CLIENT
//LOGIN/LOGOUT
app.use('/client', require('./controller/client'))

//HOME
app.get('/home', (req, res) => {
    res.render('home.ejs')
})

//user
app.get('/user', protected, (req, res) => {
    res.render('user.ejs')
})


//ADMIN


//PORT & DATABASE
const PORT = process.env.PORT || 5000;

db.connect((error) => {
    if (error) throw error;
    app.listen(PORT, () => {
        console.log(`Listening to port ${PORT}`)
        console.log('DB Connected')
    })

})