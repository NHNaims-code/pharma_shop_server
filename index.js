const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const pdf = require("html-pdf");
const pdfTemplate = require("./documents");
const password = "MXv5ztE-s297SNy";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uw7zf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/result.pdf");
});

client.connect((err) => {
  const collection = client.db("medi_shop_db").collection("products");
  const staff = client.db("medi_shop_db").collection("staff");
  const shops = client.db("medi_shop_db").collection("shops");
  const sales = client.db("medi_shop_db").collection("sales");
  console.log("Mongo connected");

  app.post("/addProduct", (req, res) => {
    const product = req.body;

    collection.insertOne(product).then((result) => {
      if (result.insertedCount >= 1) {
        res.send(true);
      } else {
        res.send(false);
      }
    });
  });

  //sales area
  app.post("/AddToSales", (req, res) =>{
    const product = req.body;
    sales.insertOne(product)
    .then((result) => {
      if (result.insertedCount >= 1) {
        res.send(true);
      } else {
        res.send(false);
      }
    })
  })

   //sales area
  app.get("/sales", (req, res) => {
    sales.find({}).toArray((err, documents) => {
      res.send(documents);
    })
  })

   //sales area
  app.delete("/deleteItem/:id", (req, res) => {
    console.log(req.params.id);

    collection.deleteOne({ _id: ObjectId(req.params.id) }).then((result) => {
      console.log(result.deletedCount);
      if (result.deletedCount >= 1) {
        res.send(true);
      } else {
        res.send(false);
      }
    });
  });

   //sales area
  app.get("/products", (req, res) => {
    collection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

   //sales area
  app.get("/products/:from/:to", (req, res) => {
    collection.find({updatedDate: {$gt: req.params.from, $lt: req.params.to}}).toArray((err, documents) => {
      console.log(documents);
      res.send(documents);
    })
 
  });

  //update product after sale
  app.patch("/updateSaleProduct/", (req, res) => {

    let oldQuantity = 0;
    let newQuantity = 0;
    
    collection.find({ _id: ObjectId(req.body.id) }).toArray((err, documents) => {
      oldQuantity = documents[0].quantity;
      console.log(oldQuantity, "send: " ,  req.body.quantity);
      
      newQuantity = oldQuantity - req.body.quantity;
      console.log(newQuantity);
      collection.updateOne(
        { _id: ObjectId(req.body.id) },
        { $set: { quantity:  newQuantity} }
      )
      .then((result) => {
        console.log(result.modifiedCount);
        if (result.modifiedCount >= 1) {
          res.send({ status: "updated" });
        } else {
          res.send({ status: "error" });
          console.log(result);
        }
      });
    })
  });

//shop area
  app.get("/shops", (req, res) => {
    shops.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //shop area
  app.post("/addShop", (req, res) => {
    shops.insertOne(req.body).then(result => {
      if(result.insertedCount > 0){
        res.send(true);
      }else{
        res.send(false);
      }
    })
  })

  //shop area
  app.patch("/updateShop/", (req, res) => {
    console.log(req.body);
    let oldProducts = [];
    shops.find({name: req.body.name}).toArray((err, documents) => {
      oldProducts = documents[0].product;
      newProducts = [...oldProducts, ...(req.body.product)]
      shops.updateOne({name: req.body.name},
        {
          $set: { product: newProducts }
        }).then(result => {
          if(result.modifiedCount > 0){
            res.send(true);
          }else{
            res.send(false);
          }
        })
    })
   
  })


//staff area
  app.get("/staff/:email", (req, res) => {
    staff.find({email: req.params.email}).toArray((err, documents) => {
      
      if(!documents[0]){
        res.send({status: "error"})
      }else{
        res.send(documents[0]);
      }
    });
  });

  //staff area
  app.get("/staff", (req, res) => {
    staff.find({}).toArray((err, documents) => {
      res.send(documents);
    })
  })


  //staff area
  app.patch("/updateStaff", (req, res) => {
    console.log(req.body);
    staff.updateOne(
      { _id: ObjectId(req.body._id) },
    { $set: { name:  req.body.name, phone: req.body.phone, email: req.body.email, password: req.body.password, username: req.body.username, position: req.body.position} }).then(result =>{
      if(result.modifiedCount > 0){
        res.send(true)
      }else{
        res.send(false)
      }

      console.log(result);
    })
  })

  //staff area
  app.post("/addStaff", (req, res) => {
    staff.insertOne(req.body).then(result =>{
      if(result.insertedCount > 0){
        res.send(true);
      }else{
        res.send(false);
      }
    })
  })

  //staff area
  app.delete("/deleteStaff/:id", (req, res) =>{
    console.log(req.params.id);
    staff.deleteOne({_id: ObjectId(req.params.id) })
    .then(result => {
      if(result.deletedCount > 0){
        res.send(true);
      }else{
        res.send(false);
      }
      console.log(result);
    })
  })

  

  app.patch("/updateProduct/:id", (req, res) => {
    collection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            company: req.body.company,
            product: req.body.product,
            quantity: req.body.quantity,
            price_per_pic: req.body.price_per_pic,
            exp: req.body.exp,
            updatedDate: req.body.updatedDate,
          },
        }
      )
      .then((result) => {
        console.log(result);
        if (result.modifiedCount >= 1) {
          res.send(true);
        } else {
          res.send(false);
        }
      });
  });

  app.post("/buy", (req, res) => {

    console.log("knock me");
    res.sendFile(`${__dirname}/result.pdf`);
    // })
  });

  //Analysis Part 
  app.get("/findByDateSale/:from/:to", (req, res)=>{
    console.log(req.body.from, " == ", req.body.to);
    sales.find({saleDate: {$gt: req.params.from, $lt: req.params.to}}).toArray((err, documents) => {
      console.log(documents);
      res.send(documents);
    })
  })

  // client.close();
});

app.listen(process.env.PORT || 5000);
