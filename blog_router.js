const express = require("express")
const router = express.Router()
const path = require('path')

// STATIC articles for SEO
router.get('/10-highest-truck-driver-salaries-by-state-in-2020', (req, res) => {
    res.sendFile(path.join(__dirname+'/blog/2020-02-07_10-highest-truck-driver-salaries-by-state-in-2021.html'))
})
router.get('/how-much-does-a-class-b-cdl-cost', (req, res) => {
    res.sendFile(path.join(__dirname+'/blog/2020-02-11_how-much-does-a-class-b-cdl-cost.html'))
})
router.get('/how-to-pass-the-cdl-skills-test-on-your-first-try', (req, res) => {
    res.sendFile(path.join(__dirname+'/blog/2020-02-04_how-to-pass-the-cdl-skills-test-on-your-first-try.html'))
})
router.get('/does-a-truck-driving-school-drug-test', (req, res) => {
    res.sendFile(path.join(__dirname+'/blog/2020-09-11_does-a-truck-driving-school-drug-test.html'))
})
router.get('/2021-10-28_CDL-Endorsements', (req, res) => {
    res.sendFile(path.join(__dirname+'/blog/2021-10-28_CDL-Endorsements.html'))
})

router.get('/2022-01-25_Truck-Driver-Salary-in-2021', (req, res) => {
    res.sendFile(path.join(__dirname+'/blog/2022-01-25_Truck Driver Salary in 2021_Analysis Of COVID Pandemic Impact.html'))
})





module.exports = router