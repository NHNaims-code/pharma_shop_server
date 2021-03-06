const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const pdf = require("html-pdf");
// const pdfTemplate = require("./documents");


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
  const support = client.db("medi_shop_db").collection("support");
  const sales = client.db("medi_shop_db").collection("sales");
  const returnProduct = client.db("medi_shop_db").collection("return");
  const test = client.db("medi_shop_db").collection("test");
  
  console.log("Mongo connected");

  //test area 
  app.post("/testInsertMany", (req, res) => {
    console.log(req.body);
    test.insertMany(req.body).then(result => {
      if(result.insertedCount > 0){
        res.send(true);
        console.log(true);
      }else{
        res.send(false);
        console.log(false);
      }
    })
  })
  //test area 
//Importe Section

app.post("/importSupport",(req, res)=>{
  if(req.body.length){
    support.insertMany(req.body).then(result => {
      if(result.insertedCount > 0){
        res.send(true);
        console.log(true);
      }else{
        res.send(false);
        console.log(false);
      }
    })
  }else{
    res.send(false)
  }
})
app.post("/importProduct",(req, res)=>{
  if(req.body.length){
    collection.insertMany(req.body).then(result => {
      if(result.insertedCount > 0){
        res.send(true);
        console.log(true);
      }else{
        res.send(false);
        console.log(false);
      }
    })
  }else{
    res.send(false)
  }
})
app.post("/importSale",(req, res)=>{
  if(req.body.length){
    sales.insertMany(req.body).then(result => {
      if(result.insertedCount > 0){
        res.send(true);
        console.log(true);
      }else{
        res.send(false);
        console.log(false);
      }
    })
  }else{
    res.send(false)
  }
})
app.post("/importReturn",(req, res)=>{
  if(req.body.length){
    returnProduct.insertMany(req.body).then(result => {
      if(result.insertedCount > 0){
        res.send(true);
        console.log(true);
      }else{
        res.send(false);
        console.log(false);
      }
    })
  }else{
    res.send(false)
  }
})









//Importe Section
 //Collection----------------------1--------------------------------Collection--------------------------------------- 
 app.post("/addProduct", (req, res) => {
  const query = {product: req.body.product};
  const options = {
    upsert: true,
  };
  const replacement = req.body;
  collection.replaceOne(query, replacement, options).then(result => {
    if(result.upsertedCount===0 && result.modifiedCount === 0){
      res.send(false);
    }else{
      res.send(true)
    }
  })
});

app.post("/updateInventory", (req, res) => {
  const query = {_id: req.body._id};
  const options = {
    upsert: true,
  };
  const replacement = req.body;

  collection.replaceOne(query, replacement, options).then(result => {
    console.log(result);
  })
})

app.delete("/deleteItem/:id", (req, res) => {
  collection.deleteOne({ _id: ObjectId(req.params.id) }).then((result) => {
    if (result.deletedCount >= 1) {
      res.send(true);
    } else {
      res.send(false);
    }
  });
});

app.get("/products", (req, res) => {
  collection.find({}).toArray((err, documents) => {
    res.send(documents);
  });
});

app.get("/products/:from/:to", (req, res) => {
  collection.find({updatedDate: {$gt: req.params.from, $lt: req.params.to}}).toArray((err, documents) => {
   
    res.send(documents);
  })
});

app.patch("/updateStockProduct/", (req, res) => {

  let oldQuantity = 0;
  let newQuantity = 0;
  let totalUpdated = 0;
  
  const productArryLth = req.body.length;
  req.body.map(p => {

    console.log(p.productName, p.quantity);
    collection.find({ product: p.productName }).toArray((err, documents) => {
      if(documents.length != 0){
        oldQuantity = documents[0].quantity;
     
      newQuantity = parseInt(oldQuantity) + p.quantity;
      console.log(newQuantity);
      collection.updateOne(
        { product: p.productName },
        { $set: { quantity:  newQuantity} }
      )
      .then((result) => {
        console.log(result.modifiedCount);
        if (result.modifiedCount > 0) {
          totalUpdated += 1;
          console.log("resultll: ", totalUpdated, productArryLth);
          if(totalUpdated == productArryLth){
            res.send(true)
          }
        } else{
          res.send(false);
        }
      });
      }else{
        res.send(false);
      }
    })
  })
});

app.patch("/updateProduct/:id", (req, res) => {
  collection
    .updateOne(
      { _id: ObjectId(req.params.id) },
      {
        $set: {
          company: req.body.company,
          product: req.body.product,
          type: req.body.type,
          quantity: req.body.quantity,
          entryBy: req.body.entryBy,
          entryBy: req.body.entryBy,
          rate: req.body.rate,
          exp: req.body.exp,
          updatedDate: req.body.updatedDate,
        },
      }
    )
    .then((result) => {
      
      if (result.modifiedCount >= 1) {
        res.send(true);
      } else {
        res.send(false);
      }
    });
});

 //staff---------------------------2--------------------------------staff--------------------------------------- 
 app.get("/staff/:email", (req, res) => {
  staff.find({email: req.params.email}).toArray((err, documents) => {
    
    if(!documents[0]){
      res.send({status: "error"})
    }else{
      res.send(documents[0]);
    }
  });
});

app.get("/staff", (req, res) => {
  staff.find({}).toArray((err, documents) => {
    res.send(documents);
  })
})

app.patch("/updateStaff", (req, res) => {

  staff.updateOne(
    { _id: ObjectId(req.body._id) },
  { $set: { name:  req.body.name, phone: req.body.phone, email: req.body.email, password: req.body.password, username: req.body.username, position: req.body.position} }).then(result =>{
    if(result.modifiedCount > 0){
      res.send(true)
    }else{
      res.send(false)
    }


  })
})

app.post("/addStaff", (req, res) => {
  staff.insertOne(req.body).then(result =>{
    if(result.insertedCount > 0){
      res.send(true);
    }else{
      res.send(false);
    }
  })
})

app.delete("/deleteStaff/:id", (req, res) =>{

  staff.deleteOne({_id: ObjectId(req.params.id) })
  .then(result => {
    if(result.deletedCount > 0){
      res.send(true);
    }else{
      res.send(false);
    }

  })
})
 //shops---------------------------3--------------------------------shops--------------------------------------- 
 app.get("/shops", (req, res) => {
  shops.find({}).toArray((err, documents) => {
    res.send(documents);
  });
});

app.post("/addShop", (req, res) => {
  shops.insertOne(req.body).then(result => {
    if(result.insertedCount > 0){
      res.send(true);
    }else{
      res.send(false);
    }
  })
})

 //support-------------------------4--------------------------------support--------------------------------------- 
 app.get("/support/:from/:to", (req, res) => {
  support.find({supportTime: {$gt: req.params.from, $lt: req.params.to}}).toArray((err, documents) => {
   
    res.send(documents);
  })
});

app.get("/support/", (req, res) => {
  support.find({}).toArray((err, documents) => {
    res.send(documents);
  })
})

app.delete("/deleteSupport/:id", (req, res) => {
  console.log(req.params.id);
  support.deleteOne({_id: ObjectId(req.params.id)}).then(result => {

    if(result.deletedCount > 0){
      res.send(true);
    }else{
      res.send(false);
    }
  })
})

app.delete("/deleteManySupport/:shopName", (req, res) => {
  support.deleteMany({shopName: req.params.shopName}).then(result => {
    if(result.deletedCount > 0){
      res.send(true);
    }else{
      res.send(false);
    }
  })
})

app.patch("/updateToSupport", (req, res) => {
  console.log(req.body);
  const waitingUpdate = req.body.length;
  let completeUpdate = 0;
  req.body.map(p => {
    support.find({shopName: p.shopName, productName: p.productName}).toArray((err, documents) => {
        if(documents){
          const oldDocument = documents[0];
          const newQuantity = parseInt(oldDocument.quantity) + p.quantity;
          console.log(newQuantity);
          support.updateOne({shopName: p.shopName, productName: p.productName}, {$set: {quantity: newQuantity}}).then(result => {
            if(result.modifiedCount > 0){
              completeUpdate += 1;
              if(completeUpdate === waitingUpdate){
                res.send(true);
              }
            }
          })
      
        }else{
          res.send(false)
        }
      })
    })
  })

app.post("/addToSupport/", (req, res) => {
   
  const product = req.body;
  support.insertMany(product, { ordered: true })
  .then((result) => {
    if (result.insertedCount > 0) {
      res.send(true);
    } else {
      res.send(false);
    }
  })
  
})


 //sales---------------------------5--------------------------------sales--------------------------------------- 

 app.post("/AddToSales", (req, res) =>{
  const product = req.body;
  sales.insertMany(product, { ordered: true })
  .then((result) => {
    if (result.insertedCount > 0) {
      res.send(true);
    } else {
      res.send(false);
    }
  })
})

app.get("/sales", (req, res) => {
  sales.find({}).toArray((err, documents) => {
    res.send(documents);
  })
})

app.delete("/deleteCustomar/:customar", (req, res) => {
  console.log(req.params.customar);
  sales.deleteMany({customar: req.params.customar}).then(result => {
    console.log(result);
    if(result.deletedCount > 0){
      res.send(true);
    }else{
      res.send(false);
    }
  })
})

app.delete("/deleteFromSales/:id", (req, res) => {
  console.log(req.params.id);
sales.deleteOne({_id: ObjectId(req.params.id)})
.then(result => {
  console.log(result);
  if(result.deletedCount > 0){
    res.send(true);
  }else{
    res.send(false);
  }
})
})


app.patch("/updateSalesProduct", (req, res) => {
  let newQuantity = 0;
  let oldQuantity = 0;
  let oldPaid = 0;
  let newPaid = 0;
  let oldAmount = 0;
  let newAmount = 0;
  sales.find({_id: ObjectId(req.body.id)}).toArray((err, documents) => {
    oldQuantity = documents[0].productQuantity;
    oldAmount = documents[0].amount;
    oldPaid = documents[0].paid;
    const rate = parseFloat(documents[0].rate);
    newQuantity = parseInt(oldQuantity) + req.body.quantity;
    newPaid = parseFloat(oldPaid) - (parseFloat(newAmount) - parseFloat(oldAmount));
    newAmount = (newQuantity * rate).toFixed(2);
    sales.updateOne({_id: ObjectId(req.body.id)},{
      $set: {productQuantity: newQuantity, amount: newAmount, paid: newPaid}
    }).then(result => {

      if(result.modifiedCount > 0){
        res.send(true)
   
      }else{
        res.send(false)
      }
    })
  })
  
})

app.patch("/editSale/:id", (req, res) => {
  sales
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
      if (result.modifiedCount >= 1) {
        res.send(true);
      } else {
        res.send(false);
      }
    });
});

app.post("/buy", (req, res) => {
  res.sendFile(`${__dirname}/result.pdf`);
});

app.get("/findByDateSale/:from/:to", (req, res)=>{

  sales.find({saleDate: {$gt: req.params.from, $lt: req.params.to}}).toArray((err, documents) => {

    res.send(documents);
  })
})



 //returnProduct-------------------6--------------------------------returnProduct--------------------------------------- 
 app.get("/return/:from/:to", (req, res) => {
  returnProduct.find({returnTime: {$gt: req.params.from, $lt: req.params.to}}).toArray((err, documents) => {
   
    res.send(documents);
  })
});

app.delete("/deleteFromReturn/:productName", (req, res)=>{
  returnProduct.deleteMany({productName: req.params.productName}).then(result =>{
    if(result.deletedCount > 0){
      res.send(true);
    }else{
      res.send(false);
    }
  })
})

app.post("/addToReturn", (req, res) => {
 returnProduct.insertOne(req.body).then(result =>{
   if(result.insertedCount > 0){
     res.send(true);
   }else{
     res.send(false);
   }
 })
})

app.get("/returnProducts", (req, res) => {
 returnProduct.find({}).toArray((err, documents)=>{
   res.send(documents);
 });
})

  // client.close();
});

app.listen(process.env.PORT || 5000);
