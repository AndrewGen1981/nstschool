const express = require('express')
const session = require('express-session')
const path = require('path')


// MONGO db via MONGOOSE
const Employer = require('../employer/EmployerModel')
const mongoose = require('mongoose')
mongoose.connect(process.env.EMP_URI)


const ADM_SESS_DURATION = 1000 * 60 * 60    //  60 minutes

// extracting from process.env
const {
    NODE_ENV = 'development',

    SESS_NAME = 'ADMSID',
    SESS_SECRET = '!GODMODE_FORADMINS',
    SESS_LIFETIME = ADM_SESS_DURATION
} = process.env

const IN_PROD = NODE_ENV === 'production'

// ./employer/admin
const admRouter = express.Router()

// adding session configuration
admRouter.use(session({
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


// Array of admins
const admins = [
    { id: "BigG0001", name: "BigG", email: "alphafleetacc@gmail.com", password: process.env.BIGG0001_PASS },
    { id: "Mike0001", name: "Mike Slobodchikov", email: "newsoundcdl@gmail.com", password: process.env.MIKE0001_PASS },
    { id: "Ivan0001", name: "Ivan Tobilko", email: "newsoundcdl@gmail.com", password: process.env.IVAN0001_PASS },
    { id: "SelenaG0001", name: "Selena Valencia", email: "newsoundcdl@gmail.com", password: process.env.SELENA0001_PASS }
]

// Variants of issues
const issues = {
    wrongIDPASS: "Wrong admin's ID or PASSWORD provided"
}


// middleware
function redirectToLogin (req, res, next) {
    // if user is NOT logged in, then redirect user to Login page
    if (!req.session.userId) {
        res.redirect('/admin')
    } else { next() }
}
function redirectToHome (req, res, next) {
    // if user is logged in, then redirect user to Home page
    if (req.session.userId) {
        res.redirect('/admin/home')
    } else { next() }
}
admRouter.use((req, res, next) => {   // !!! general middleware - will be used before EACH ROUTE!!!
    if (req.session.userId) {   // if there is one, then tries to find it in users array and inject it to LOCALS - spec.obj. for sharing data between functions
        res.locals.user = admins.find(admin => admin.id.toUpperCase() === req.session.userId.toUpperCase())
    }
    next()
})




// routes for admins
admRouter.get('/', (req, res) => {
    res.render(path.join(__dirname+'/admWelcome.ejs'), {
        id: req.session.userId,
        issue: issues[req.query.logIssue]
    })
})

admRouter.get('/home', redirectToLogin, (req, res) => {
    res.render(path.join(__dirname+'/admProfile.ejs'), user = res.locals.user)
})

admRouter.get('/employers', redirectToLogin, async (req, res) => {
    res.render(path.join(__dirname+'/admEmployers.ejs'), {
        employers: await Employer.find({}),
        admin: res.locals.user,
        queryID: req.query.id,
        queryEmail: req.query.email,
        queryResult: req.query.success
    })
})



admRouter.post('/login', redirectToHome, (req, res) => {
    const { id, password } = req.body
    if (id && password) {
        const user = admins.find(admin => admin.id.toUpperCase() === id.toUpperCase())
        if (!user) { return res.status(400).redirect('/admin?logIssue=wrongIDPASS') } // can not find a user
        if (user.password != password) { return res.status(400).redirect('/admin?logIssue=wrongIDPASS') } // wrong password
        
        req.session.userId = id
        return res.redirect('/admin/home')
    } 
    res.status(400).redirect('/admin')  // wrong password or ID
})

admRouter.post('/logout', redirectToLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/admin/home')
        }
    })
    res.clearCookie(SESS_NAME)
    res.redirect('/admin')
})

admRouter.post('/addPayment', redirectToLogin, async (req, res) => {
    const { id, amount, date, note } = req.body
    try {
        const employer = await Employer.findById(id)
        if (employer) {
            employer.payments.push({ amount, date, note })
            await Employer.updateOne({ email: employer.email }, { payments: employer.payments })
            res.redirect(`/admin/employers?id=${id}&success=true`)
        }
    } catch(e) { res.redirect(`/admin/employers?id=${id}&success=false`) }
})

admRouter.post('/changeAuth', redirectToLogin, async (req, res) => {
    const { id } = req.body
    const newAuth = {
        canSee: req.body.auth,
        whoGaveAccess: req.body.adminName,
        whenAccessChanged: new Date(),
        notes: req.body.authNote
    }
        
    try {
        const employer = await Employer.findById(id)
        if (employer && employer.auth.canSee != newAuth.canSee) {
            await Employer.updateOne({ email: employer.email }, { auth: newAuth })
        }
    } catch(e) { console.log(e) }
    res.redirect('/admin/employers')
})


// TEST SECTION "admin/create-customer-portal-session"
// admRouter.get('/stripe', async (req, res) => {
//     const stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');

//     const session = await stripe.billingPortal.sessions.create({
//         // customer: 'cus_Kc6FSrcZLa5Bch',
//         return_url: 'https://example.com/account',
//     });
// })


module.exports = admRouter