const express = require('express')
const router = express.Router()

const path = require('path')

router.get ('/', (req, res) => {
    res.redirect('/')
})
router.get ('/:id', (req, res) => {
    res.redirect('/')
})

module.exports = router