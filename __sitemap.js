const {MongoClient} = require('mongodb')
const fs = require('fs')


async function readFromMongo () {
    // reads db and can return more than one document by filter

    // create an instance of MongoClient
    const client = new MongoClient(process.env.DB_URI)
    let res = false

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        res = await client.db('Blog').collection('Blog')
            .find({})
            .sort({artPublished: -1})
            .toArray()

    } catch(e) {    console.error(e)
    } finally {
        await client.close()
        return res
    }
}   // readFromMongo


async function getAllRoutes() {
    // returns a pairs of title-link route description for further rendering
    // should be added each new route

    // static routes
    let result = [
        {
            category: "General Public Routes"
        },
        {
            title: "Main/Home page",
            date: "2021-10-14",
            link: "/"
        },
        {
            title: "About New Sound Trucking School crew",
            date: "2021-09-23",
            link: "/about"
        },
        {
            title: "Contact Form, Student Wait-List",
            date: "2021-10-22",
            link: "/contact"
        },
        {
            title: "Frequently Asked Questions",
            date: "2021-10-23",
            link: "/faq"
        },
        {
            title: "Site Map - Road Map of Site Routes",
            date: "2021-10-05",
            link: "/sitemap"
        },
        {
            title: "NSTS Code of Conduct",
            date: "2021-10-19",
            link: "/cPolicy"
        },
        {
            title: "NSTS Attendance Policy",
            date: "2021-10-19",
            link: "/aPolicy"
        },
        {
            title: "Student online portal",
            date: "2021-10-04",
            link: "/account"
        },
        {
            title: "Commercila Learner Permit test/exam",
            date: "2021-09-30",
            link: "/clp"
        },
        {
            title: "Articles about driving and CDL Schools",
            date: "2021-09-27",
            link: "/blog"
        },
        {
            title: "NSTS TOP Ranked Article",
            date: "2021-10-06",
            link: "/top-rank-article"
        },
        {
            title: "NSTS Giveaway Page",
            date: "2021-10-12",
            link: "/giveaway"
        },

        {
            category: "TOP Demand Blog Articles"
        },
        {
            title: "10 Highest Truck Driver Salaries by State in 2020-2021",
            date: "2021-10-24",
            link: "/blog/10-highest-truck-driver-salaries-by-state-in-2020"
        },
        {
            title: "How Much Does a Class B CDL Cost?",
            date: "2021-10-24",
            link: "/blog/how-much-does-a-class-b-cdl-cost"
        },
        {
            title: "How to Pass the CDL Skills Test on Your First Try",
            date: "2021-10-24",
            link: "/blog/how-to-pass-the-cdl-skills-test-on-your-first-try"
        },
        {
            title: "Does A Truck Driving School Drug Test?",
            date: "2021-10-28",
            link: "/blog/does-a-truck-driving-school-drug-test"
        },
        {
            title: "Everything You Need to Know About CDL Endorsements",
            date: "2021-10-28",
            link: "/blog/2021-10-28_CDL-Endorsements"
        },
        {
            title: "Truck Driver Salary: Analysis Of COVID Pandemic Impact. Own Companies Experience",
            date: "2022-01-01",
            link: "/blog/2022-01-25_Truck-Driver-Salary-in-2021"
        }
    ]
    
      
    // dynamic routes
    result.push({ category: "NSTS CDL Enrollments" })
    
    // #1 Enrollments
    // sync way of file reading, async is not working here
    const data = fs.readFileSync('./items.json')
    const tuition = JSON.parse(data).tuition
    tuition.map((item, index) => {
        result.push({
            subid: index,
            title: `NSTS enrollments: ${item.name}`,
            date: "2021-10-01",
            link: `/shop?id=${item.id}`
        })
    })
    
    result.push({ category: "NSTS Blog Articles" })

    // #2 Articles
    let res = await readFromMongo()
    res.map((acticle, index) => {
        result.push({
            subid: index,
            title: acticle.artTitle,
            date: acticle.artPublished,
            link: `/article/${acticle._id}`
        })
    })
    
    
    
    
    
    return result
}


// !THIS module should also create a sitemap file!


module.exports = {
    getAllRoutes: getAllRoutes
}