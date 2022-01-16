const express = require('express')
const session = require('express-session')
const path = require('path')

const bcrypt = require('bcrypt')


// node-fetch from v3 is an ESM-only module - you are not able to import it with require().
// If you cannot switch to ESM, please use v2
// npm install node-fetch@2
const fetch = require('node-fetch')


// MONGO db via MONGOOSE
const Employer = require('./EmployerModel')
const mongoose = require('mongoose')
mongoose.connect(process.env.EMP_URI)


const SESS_DURATION = 1000 * 60 * 30    //  30 minutes

// extracting from process.env
const {
    // PORT = 5000,
    NODE_ENV = 'development',

    SESS_NAME = 'sid',
    SESS_SECRET = '!Lifeisawesome!',
    SESS_LIFETIME = SESS_DURATION
} = process.env

const IN_PROD = NODE_ENV === 'production'


const empRouter = express.Router()

// adding session configuration
empRouter.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))



// middleware
function redirectToLogin (req, res, next) {
    // if user is NOT logged in, then redirect user to Login page
    if (!req.session.userId) {
        res.redirect('/employer/login')
    } else { next() }
}
function redirectToHome (req, res, next) {
    // if user is logged in, then redirect user to Home page
    if (req.session.userId) {
        res.redirect('/employer/home')
    } else { next() }
}
empRouter.use(async (req, res, next) => {   // !!! general middleware - will be used before EACH ROUTE!!!
    if (req.session.userId) {   // if there is one, then tries to find it in users array and inject it to LOCALS - spec.obj. for sharing data between functions
        res.locals.user = await Employer.findOne({ email: req.session.userId })
    }
    next()
})




// routes for employers
empRouter.get('/', (req, res) => {
    // check whether user authenticated
    res.render(path.join(__dirname+'/welcome.ejs'), sess = req.session)
})

empRouter.get('/home', redirectToLogin, (req, res) => {
    res.render(path.join(__dirname+'/home.ejs'), user = res.locals.user)
})

empRouter.get('/login', redirectToHome, (req, res) => {
    res.render(path.join(__dirname+'/login.ejs'))
})

empRouter.get('/register', redirectToHome, (req, res) => {
    res.render(path.join(__dirname+'/register.ejs'))
})

empRouter.post('/login', redirectToHome, async (req, res) => {
    const { email, password } = req.body
    if (email && password) {
        const user = await Employer.findOneAndUpdate({ email }, { lastSESS: new Date }) // updating last session time
        if (!user) {    //  no user with such an email
            return res.status(400).redirect('/employer/login')  // can not find a user
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                req.session.userId = email
                return res.redirect('/employer/home')
            }
        } catch(e) { res.status(500).send() }
    } 
    res.status(400).redirect('/employer/login')  // wrong password
})

empRouter.post('/register', redirectToHome, async (req, res) => {
    const {name, email, password} = req.body
    if (name && email && password) {    //  TODO: validation 
        
        // check if exists already
        const exists = await Employer.findOne({ email })

        if (!exists) {
            
            try {
                // saving to db
                const employerModel = new Employer({
                        name, email, password: await bcrypt.hash(password, 10)   // hashing password, salt 10
                    }).save().then(emp => {
                        req.session.userId = emp.email
                        res.redirect('/employer/home')
                    })
                }
            catch(e) {
                console.log('Issue when hashing a password: ', e)
                res.status(500).send()
            }
            
        } else {
            console.log("already exists!")
            res.redirect('/employer/register')
        }
    } else {
        res.redirect('/employer/register') // TODO: querystring /register?error=error.auth.emailTooShort
                                        // or /register?error=error.auth.userExists
    }
})

empRouter.post('/logout', redirectToLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/employer/home')
        }
    })
    res.clearCookie(SESS_NAME)
    res.redirect('/employer/login')
})


empRouter.post('/password', redirectToLogin, async (req, res) => {
    // user is authorized, otherwise they will be redirected to LOGIN with middleware
    const { currentPassword, newPassword } = req.body
    const email = req.session.userId
    // checking if current password passed id valid
    if (currentPassword && newPassword && email) {
        const user = await Employer.findOne({ email })
        if (!user) {    //  no user with such an email
            return res.status(400).redirect('/employer/login')  // can not find a user
        }
        try {
            if (await bcrypt.compare(currentPassword, user.password)) {
                await Employer.findOneAndUpdate({ email }, { password: await bcrypt.hash(newPassword, 10) })
                req.session.userId = email
                return res.redirect('/employer/home')   //  successfuly updated
            }
        } catch(e) { res.status(500).send() }
    } 
    res.status(400).redirect('/employer/login')  // !(currentPassword && newPassword && email)
})



// @STUDENT LIST API. 2021-11(NOV)-18
// STUDENT LIST & ARCHIVE ENDPOINTS for Employers
// GET nstschool.com/employer/students
empRouter.get('/students', redirectToLogin, async (req, res) => {

    if ( !res.locals.user.auth.canSee ) { return res.redirect('/employer/home') }
    if ( req.query.type != "current" && req.query.type != "archive" ) { return res.redirect('/employer/home') }
    
    try {
        const QUERY = req.query.type === "current" ? "?source=StudentList" : "?source=Archive"
        const responseJSON = await fetch(process.env.EMPLOYER_SERVER_ID + QUERY)
        const response = await responseJSON.json()

        const data = response.studentList ? response.studentList : response.archive

        if (data) {
            // looking fo headers
            let headers = -1
            for (let i=0; i < data.length; i++) {
                for (let j=0; j < data[i].length; j++) {
                    if ( headers === -1 ) {
                        if (data[i][0] === "Full Name") { headers = i }
                    } else {
                        if (data[i][j] && i != headers) {
                            // OPTIONS to modify values before render
                            if (data[headers][j] === "Total Hours") {
                                const time1 = new Date(data[i][j])
                                const time2 = new Date("1899-12-30T08:00:00.000Z")
                                const hours_between_clocks = Math.abs(time2 - time1) / (3600000)
                                const h = Math.floor(hours_between_clocks)
                                const m = Math.round((hours_between_clocks - h)*60)

                                data[i][j] = `${h}h:${m}m`
                            }   
                            if (data[headers][j] === "Date of Birth") {
                                data[i][j] = new Date(data[i][j]).getFullYear()
                            }
                            if (data[headers][j] === "Tuition Start Date" || data[headers][j] === "Tuition End Date") {
                                data[i][j] = new Date(data[i][j]).toLocaleDateString('en-US', { timeZone: 'America/Los_Angeles' })
                            }
                        }   //  not in headers row and cell is not blank
                    }   // headers are identified
                }   //  for j
            }   //  for i

            return res.render(path.join(__dirname+'/students.ejs'), { data })

        }  // data
      
    } catch(e) { console.log(e) }
    
    res.redirect('/employer/home')
})



module.exports = empRouter