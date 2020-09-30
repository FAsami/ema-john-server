const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
var cors = require('cors');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xpm2l.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const productCollection = client
    .db(process.env.DB_NAME)
    .collection(process.env.COLLECTION_NAME);
  const orderCollection = client.db(process.env.DB_NAME).collection('orders');

  app.get('/products', (req, res) => {
    productCollection.find({}).toArray((err, docs) => res.send(docs));
  });

  app.get('/product/:key', (req, res) => {
    productCollection
      .find({ key: req.params.key })
      .toArray((err, docs) => res.send(docs[0]));
  });

  app.post('/productByKeys', (req, res) => {
    const productKeys = req.body;
    productCollection
      .find({ key: { $in: productKeys } })
      .toArray((err, docs) => {
        res.send(docs);
      });
  });

  //Send all data to the database
  app.post('/addProduct', (req, res) => {
    const products = req.body;
    productCollection.insertMany(products).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(`${result.insertedCount} items inserted to the Database`);
    });
  });

  app.post('/addOrder', (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(`${result.insertedCount} items inserted to the Database`);
    });
  });
});

const port = 5000;
app.listen(process.env.PORT || port);
