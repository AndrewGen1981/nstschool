const mongoose = require('mongoose')

const employer = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, lowercase: true, required: true },
    password: { type: String, required: true },
    created: { type: Date, default: new Date },
    lastSESS: { type: Date, default: new Date },
    auth: {
        canSee: { type: Boolean, default: false },
        whoGaveAccess: { type: String, default: 'created' },
        whenAccessChanged: {type: Date, default: new Date },
        notes: { type: String, default: "no notes" }
    },
    payments: [
        {
            amount: Number,
            date: { type: Date, default: new Date },
            note: String
        }
    ]
}, {
    collection: 'employer'
})

module.exports = mongoose.model('employer', employer)