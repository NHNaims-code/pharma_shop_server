const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const password = "MXv5ztE-s297SNy";


const uri = "mongodb+srv://naim:MXv5ztE-s297SNy@cluster0.uw7zf.mongodb.net/medi_shop?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/video.mp4')
})




client.connect(err => {
  const collection = client.db("medi_shop_db").collection("products");
  console.log("Mongo connected")

  app.post("/addProduct", (req, res) => {
      
      const product = req.body;

      collection.insertOne(product)
      .then(result => {

        console.log(result);
        res.send(result)
        // console.log(result.insertedCount);
        // res.send(result.insertedCount);
        //   console.log(result);
        //   if(result.insertedCount == 1){
        //       res.send("success")
        //   }else{
        //       res.send("failed")
        //   }
      })
  })

  app.get("/products", (req, res) => {
      collection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
  })

//   client.close();
});


app.listen(5000);