if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const path = require('path')

const {ObjectId} = require('mongodb')
const {mongoReadListings, mongoReadOne} = require('./__mongo_tools')    // adding my module for MONGO
const {getAllRoutes} = require('./__sitemap')    //  for sitemap, gethering all routs


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs')


//  *** Global Vars ***
let qtyPosts = 5    //  blog starting Articles qty to show

app.set('view engine', 'ejs')

app.use(express.static(__dirname+'/'))
app.use(express.urlencoded({ extended: true}))

// Blog router
const router = require('./blog_router')
app.use('/blog', router)

// Old site router
const old_router = require('./server_old_routes')
app.use('/cdl-training-tacoma-wa', old_router)


if (process.env.NODE_ENV === 'production') {
    // *** to redirect each request http:// to https://
    app.enable('trust proxy')
    app.use((req, res, next) => {
        req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
    })
}



// ROUTES

app.get('/',(req, res) => {
    fs.readFile('items.json', (err, data) => {
        if (err) {
            res.status(500).end()   // if error when file reading, then END response
        } else {
            res.render(path.join(__dirname+'/index.ejs'), { items: JSON.parse(data) })
        }
    })
})

app.get('/about',(req, res) => {
    fs.readFile('about_emp.json', (err, data) => {
        if (err) {
            res.status(500).end()   // if error when file reading, then END response
        } else {
            res.render(path.join(__dirname+'/aboutUs.ejs'), { emps: JSON.parse(data) })
        }
    })
})

app.get('/cPolicy',(req, res) => {
    res.sendFile(path.join(__dirname+'/_policy_code.html'))
})

app.get('/aPolicy',(req, res) => {
    res.sendFile(path.join(__dirname+'/_policy_attendance.html'))
})

app.get('/account',(req, res) => {
    res.render(path.join(__dirname+'/signIn.ejs'))
})

app.get('/inst',(req, res) => {
    res.sendFile(path.join(__dirname+'/instructors.html'))
})


// BLOG TOOLS

app.get('/blog',async (req, res) => {
    const result = await mongoReadListings({}, qtyPosts).catch(console.error)
    if (result != false) {
        if (result.length < qtyPosts) {
            qtyPosts = result.length
        }
        res.render(path.join(__dirname+'/blog.ejs'), {articles: result, qty: qtyPosts})
    } else { res.redirect('/')}
})

// old blog articles names converter
app.get('/blog/:id', (req, res) => {
    res.redirect('/sitemap')
})

app.get('/showMore',async (req, res) => {
    qtyPosts += 5
    res.redirect("/blog")
})
app.post('/article',async (req, res) => {
    // rendering acticle from blog
    res.render(path.join(__dirname+'/blogArticle.ejs'), article = req.body)
})
app.get('/article/:id',async (req, res) => {
    // rendering article by it's id from MONGO directly
    const result = await mongoReadOne({"_id": ObjectId(String(req.params.id))}).catch(console.error)
    if (result != false && result != undefined) {
        res.render(path.join(__dirname+'/blogArticle.ejs'), article = {
            artTitle: result.artTitle,
            artAuthor: result.artAuth,
            artPublished: result.artPublished,
            artHTML: result.htmlResult.replace(/blog_img/g, '/blog_img')
        })
    } else { res.redirect('/blog')}
})


// SHOP TOOLS

app.post('/shop',async (req, res) => {

    fs.readFile('items.json', (err, data) => {
        if (err) {
            res.status(500).end()   // if error when file reading, then END response
        } else {
            let items = JSON.parse(data)
            items.tuition.forEach( (item) => {
                item.html = item.html.join("")
            })

            res.render(path.join(__dirname+'/views/shop.ejs'), {
                items: items,
                aItem: items.tuition[req.query.id]
            })
        }
    })

})


//  GET request copy of above for SEO
app.get('/shop',async (req, res) => {

    fs.readFile('items.json', (err, data) => {
        if (err) {
            res.status(500).end()   // if error when file reading, then END response
        } else {
            let items = JSON.parse(data)
            items.tuition.forEach( (item) => {
                item.html = item.html.join("")
            })

            res.render(path.join(__dirname+'/views/shop.ejs'), {
                items: items,
                aItem: items.tuition[req.query.id]
            })
        }
    })

})


app.post('/create-checkout-session', async (req, res) => {
    

    fs.readFile('items.json', async (err, data) => {
        if (err) {
            res.status(500).end()   // if error when file reading, then END response
        } else {
            const items = JSON.parse(data)
            const item = items.tuition[req.query.id]
            const subItem = item.subCourse[req.query.sub]
            const productName = subItem.subTitle !="" ? item.name+": "+subItem.subTitle : item.name

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                  {
                    name: productName,
                    amount: subItem.subPrice,
                    currency: item.currency,
                    quantity: 1,
                  },
                ],
                mode: 'payment',
                success_url: req.headers.origin+'/views/success.html',
                cancel_url: req.headers.origin+'/views/cancel.html',
            });
            res.redirect(303, session.url)
        }
    })

})


// *** QR handling
let url_param = ""
let key_param = ""

app.get('/qr', (req, res) => {

    // to get QR handling, request should contains hashed key

    if (req.query.key != undefined) {

        url_param = `${process.env.STUDENT_SERVER_ID}?qr=${req.query.key}`
        key_param = req.query.key

        res.redirect('/qrwork')

    }  else { res.status(500).end() }     // if (req.query.key != undefined)

})

app.get('/qrwork', (req, res) => {

    if (url_param != "" && key_param != "") {

        let obj = {
            url: url_param,
            key: key_param
        }

        url_param = ""
        key_param = ""

        res.render(path.join(__dirname+'/qr.ejs'), obj)

    }  else { res.status(500).end() }     // if (req.query.key != undefined)

})



// Working with teachArea
app.get('/teach', (req, res) => {

    fs.readFile(path.join(__dirname+'/teachable/teachable.json'), async (err, data) => {
        if(err) {
            res.status(500).end()   // if error when file reading, then END response
        } else {
            res.render(path.join(__dirname+'/teachable/teachable.ejs'), {
                videoDataObj: JSON.parse(data),
                teachAreaURL: process.env.STUDENT_SERVER_ID
            })

        }       //  else - no error
    })      //  fs.readFile
})      //  --/teach



// CLP test
let email_saved = ""    //  saves email to send results to

app.get('/clp', (req, res) => {
    // main FORM with test's parameters
    res.sendFile(path.join(__dirname+'/CLP/CLP_main.html'))
})
app.get('/clp_test', (req, res) => {
    // route '/clp_test' should be requested with POST method, not with GET, redirecting to FORM
    res.redirect('/clp')
})
app.post('/clp_test', (req, res) => {
    // check if topic and language have been specified
    if (req.body.topics_group != undefined && req.body.langs_group != undefined) {
        const file_name = `${req.body.topics_group}_${req.body.langs_group}.json`   // extracting file name from the req.body

        fs.readFile(path.join(__dirname+`/CLP/${file_name}`), async (err, data) => {
            if(err) {
                res.send(`Cannot find file: ${file_name}. Please go back and try some esle topic or language...`)
                res.status(500).end()   // if error when file reading, then END response
            } else {
                email_saved = req.body.email_input  //  saving email for further results send
                res.render(path.join(__dirname+'/CLP/CLP_tests.ejs'), {
                    testDataObj: JSON.parse(data),
                    topic: req.body.topics_group,
                    lang: req.body.langs_group,
                    email: req.body.email_input,
                    URI: process.env.NSTS_SERVER_ID,
                    CLP: process.env.CLP_SERVER_ID
                })
    
            }       //  else - no error
        })      //  fs.readFile
    } else { 
        res.send("Test topic and language have to be specified before launching")
        res.status(500).end()
    }
})


// SITE MAP Tools
app.get('/sitemap', async (req, res) => {
    // renders __sitemap.js and transters returned object to ejs page
    res.render(path.join(__dirname+'/sitemap.ejs'), {
        routes: await getAllRoutes()
    })
})



// TOP RANKED Article
app.get('/top-rank-article', (req, res) => {
    res.sendFile(path.join(__dirname+'/top_rank_article/TRA.html'))
})


// Give Away
app.get('/giveaway', (req, res) => {
    res.sendFile(path.join(__dirname+'/giveaway/giveaway.html'))
})

// Contact Me
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname+'/contact/contactme.html'))
})

// FAQ
app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname+'/FAQ/FAQ.html'))
})


// Employer Route
const empRouter = require('./employer/employer.js')
app.use('/employer', empRouter)

// Admin Route
const admRouter = require('./admin/admin.js')
app.use('/admin', admRouter)


// *** Enter point ***

let port = process.env.PORT
if (port == null || port == "") {
    port = 5000
}
app.listen(port)