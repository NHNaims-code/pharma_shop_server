const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const password = "MXv5ztE-s297SNy";


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uw7zf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
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

        if(result.insertedCount >= 1){
          res.send(result);
        }else{
          res.send(false);
        }
  
      })
  })

  app.delete("/deleteItem/:id", (req, res) => {
    console.log(req.params.id);

    collection.deleteOne({_id:ObjectId(req.params.id)})
    .then((result) => {
      console.log(result.deletedCount);
      if(result.deletedCount >= 1){
        res.send(true)
      }else{
        res.send(false)
      }
      // res.send(result.deletedCount)
    })
    
  })

  app.get("/products", (req, res) => {
      collection.find({})
        .toArray((err, documents) => {
            res.send(documents);
            
        })
  })

  app.patch('/updateProduct/:id', (req, res) => {

    collection.updateOne({_id:ObjectId(req.params.id)}, {
      $set: {
        company: req.body.company,
        product: req.body.product,
        quantity: req.body.quantity,
        price_per_pic: req.body.price_per_pic,
        exp: req.body.exp,
        updatedDate: req.body.updatedDate
      }
    })
    .then(result => {
      console.log(result);
      if(result.modifiedCount >= 1){
        res.send(true);
      }else{
        res.send(false);
      }
    })
  })



  // client.close();
});


app.listen(process.env.PORT || 5000);