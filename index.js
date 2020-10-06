const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cors = require('cors');



app.use(bodyParser.json());
app.use(cors());
require('dotenv').config();

const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const assert = require('assert');

//Connecting Database starts here
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wyeds.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const volunteerCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION}`);
    const eventCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.EVENTS_DB_COLLECTION}`);

    app.post("/newRegistration", (req, res) => {
        const newRegistration = req.body;
        volunteerCollection.insertOne(newRegistration)
        .then(result => result.insertedCount > 0 && res.send({success: true}))
    })

    app.post("/addEvent", (req, res) => {
        const newEvent = req.body;
        eventCollection.insertOne(newEvent)
        .then(result => result.insertedCount > 0 && res.send({success: true}))
    })

    app.get("/allEvents", (req, res)=>{
        eventCollection.find({})
        .toArray((error, documents) => res.send(documents))
    })

    app.get("/event", (req, res) => {
        const email = req.query.email;
        volunteerCollection.find({email: email})
        .toArray((error, documents) => res.send(documents))
    })

    app.get("/allRegistrations", (req, res) => {
        volunteerCollection.find({})
        .toArray((error, documents) =>{
            res.send(documents);
        })
    })

    app.get('/getImage', (req, res) => {
        eventCollection.find({title: req.query.event})
        .toArray((error, documents) => {
            console.log(documents[0]);
            res.send(documents[0]);
        })
    })

    app.delete('/cancel/:id', (req, res) => {
        volunteerCollection.deleteOne({_id: ObjectId(req.params.id)})
        .then(result => result.deletedCount > 0 && res.send({deleted: true}))
    })

    console.log("Database is Connected successfully....");
});
//Connecting Database ends here......

app.get("/", (req, res) => {
    res.send("Express is setup successfully...!!!")
})

app.listen(process.env.PORT || port);