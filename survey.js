const express = require('express')
const srvRouter = express.Router()
const path = require('path')
const fetch = require('node-fetch')

const headers = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor']
const generalQuestions = ['Instructional Materials', 'Cost of Tuition', 'School Trucks and Trailers', 'Classroom appearance']
// managers
const managers = ['Ivan']
const managerQuestions = ['Friendliness', 'Proficiency', 'Responsibility']
// instructors
const instructors = ['Hardeep', 'Matthew', 'Luis', 'Dadie', 'Konstantin']
// recommendations
const recommendations = ['Definitely', 'Probably', 'Not Sure', 'Probably Not', 'Definitely Not']


srvRouter.get('/', (req, res) => {
    res.render(path.join(__dirname+'/survey.ejs'), {
        headers,
        generalQuestions,
        managers, managerQuestions,
        instructors,
        recommendations
    })
})

srvRouter.post('/', async (req, res) => {
    // How would you rate the following?
    // 1. Instructional Materials
    const s1q1 = req.body.s1q1 || 'no answer'
    // 2. Cost of Tuition
    const s1q2 = req.body.s1q2 || 'no answer'
    // 3. School Trucks and Trailers
    const s1q3 = req.body.s1q3 || 'no answer'
    // 4. Classroom appearance
    const s1q4 = req.body.s1q4 || 'no answer'

    // What overall rating would you give our office staff?
    // Ivan - 1. Friendliness
    const s2q1 = req.body.s2q1 || 'no answer'
    // Ivan - 2. Proficiency
    const s2q2 = req.body.s2q2 || 'no answer'
    // Ivan - 3. Responsibility
    const s2q3 = req.body.s2q3 || 'no answer'

    // What overall rating would you give each instructor?
    // 1. Hardeep
    const s3q1 = req.body.s3q1 || 'no answer'
    // 2. Matthew
    const s3q2 = req.body.s3q2 || 'no answer'
    // 3. Luis
    const s3q3 = req.body.s3q3 || 'no answer'
    // 4. Dadie
    const s3q4 = req.body.s3q4 || 'no answer'

    // Would you recommend this course to other students?
    const s4q1 = req.body.s4q1 || 'no answer'

    // How would you rate your overall school experience?
    const s5q1 = req.body.s5q1 || 'no answer'

    // comment
    const comments = req.body.sur1Comments

    const newRow = [new Date(), s1q1, s1q2, s1q3, s1q4, s2q1, s2q2, s2q3, s3q1, s3q2, s3q3, s3q4, s4q1, s5q1, comments]
    const surveyURL = 'https://script.google.com/macros/s/AKfycbx_5pvrqAF3OZt9HNURWsHc8nZQnmxhZTzCr8eOKqUnqzJB8zFZwjDa-_dZTyyGKbq22Q/exec'

    await fetch(surveyURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify({ newRow })
    })

    res.status(200).redirect('/account')
})


module.exports = srvRouter