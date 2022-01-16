const {MongoClient, ObjectId} = require('mongodb')

async function mongoReadListings (filter, qty) {
    // reads db and can return more than one document by filter

    // create an instance of MongoClient
    const client = new MongoClient(process.env.DB_URI)
    let res = false

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        res = await client.db('Blog').collection('Blog')
            .find(filter).limit(qty).sort({artPublished: -1})
            .toArray()

    } catch(e) {    console.error(e)
    } finally {
        await client.close()
        return res
    }
}   // mongoReadListings


async function mongoReadOne (criteria) {
    // reads db and can return more than one document by filter

    // create an instance of MongoClient
    const client = new MongoClient(process.env.DB_URI)
    let res = false

    try {
        // Connect to the MongoDB cluster
        await client.connect()

        res = await client.db('Blog').collection('Blog')
            .findOne(criteria)

    } catch(e) {    console.error(e)
    } finally {
        await client.close()
        return res
    }
}   // mongoReadOne



module.exports = {
    mongoReadListings: mongoReadListings,
    mongoReadOne: mongoReadOne
}

