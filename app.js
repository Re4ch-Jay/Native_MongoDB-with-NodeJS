const express = require('express')
const { getDb, connectToDb } = require('./db')
const { ObjectId } = require('mongodb')

// init app & middleware
const app = express()
app.use(express.json())
// db connection
let db

connectToDb((err) => {
  if(!err){
    app.listen('3000', () => {
      console.log('app listening on port 3000')
    })
    db = getDb()
  }
})

// routes
app.get('/books', (req, res) => {
    const page = req.query.page || 0
    const booksPerPage = 3

  let books = []
  db.collection('books')
    .find()
    .sort({author: 1})
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach(book => books.push(book))
    .then(() => {
      res.status(200).json(books)
    })
    .catch(() => {
      res.status(500).json({error: 'Could not fetch the documents'})
    })
})

app.get('/books/:id', (req, res) => {

  if (ObjectId.isValid(req.params.id)) {

    db.collection('books')
      .findOne({_id: ObjectId(req.params.id)})
      .then(doc => {
        res.status(200).json(doc)
      })
      .catch(err => {
        res.status(500).json({error: 'Could not fetch the document'})
      })
      
  } else {
    res.status(500).json({error: 'Could not fetch the document'})
  }

})

app.post('/books', (req, res) => {
    const book = req.body
    db.collection('books')
        .insertOne(book)
        .then(result => res.status(201).json(result))
        .catch(error => {
            res.status(500).json({error: 'Could not create the new document'})
        })
})

app.delete('/books/:id', (req, res) => {

    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
          .deleteOne({_id: ObjectId(req.params.id)})
          .then(doc => {
            res.status(200).json(doc)
          })
          .catch(err => {
            res.status(500).json({error: 'Could not delete the document'})
          })
          
      } else {
        res.status(500).json({error: 'Could not fetch the document'})
      }
})

app.patch('/books/:id', (req, res) => {
    const update = req.body
    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
          .updateOne({_id: ObjectId(req.params.id)}, {$set: update})
          .then(doc => {
            res.status(200).json(doc)
          })
          .catch(err => {
            res.status(500).json({error: 'Could not update the document'})
          })
          
      } else {
        res.status(500).json({error: 'Could not fetch the document'})
      }
})