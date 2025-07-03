// Import required modules
const express = require('express'); // Express framework for building the server
const { ObjectId } = require('mongodb'); // MongoDB's ObjectId for working with document IDs
const { connectToDb, getDb } = require('./db'); // Custom database connection functions

// Initialize Express application and middleware
const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// Database connection setup
let db; // Variable to hold the database connection

// Connect to the database
connectToDb((error) => {
  if (!error) {
    // If connection is successful, start the server
    app.listen(3000, () => {
      console.log('Server is running on port 3000');
    });
    // Get the database instance
    db = getDb();
  }
  // Note: Should probably handle the error case here
});

// ROUTES //

// GET all books (with pagination)
app.get('/books', (req, res) => {
  let books = []; // Array to store fetched books

  // Pagination setup
  const page = req.query.p || 0; // Get page number from query parameter, default to 0
  const booksPerPage = 3; // Number of books to show per page

  // Fetch books from MongoDB
  db.collection('books')
    .find() // Find all documents in the 'books' collection
    .sort({ author: 1 }) // Sort by author name in ascending order
    .skip(page * booksPerPage) // Skip documents for previous pages
    .limit(booksPerPage) // Limit to booksPerPage documents
    .forEach(book => books.push(book)) // Add each book to the array (cursor operation)
    .then(() => {
      // Success: return the books array
      res.status(200).json(books);
    })
    .catch((error) => {
      // Error: return 500 status with error message
      res.status(500).json({ error: 'Could not fetch books' });
    });
});

// GET a single book by ID
app.get('/books/:id', (req, res) => {
  // First check if the ID is a valid MongoDB ObjectId
  if (ObjectId.isValid(req.params.id)) {
    db.collection('books')
      .findOne({ _id: new ObjectId(req.params.id) }) // Find one document by ID
      .then(doc => {
        res.status(200).json(doc); // Return the found document
      })
      .catch((error) => {
        res.status(500).json({ error: 'Could not fetch book' });
      });
  } else {
    // If ID is invalid, return error
    res.status(500).json({ error: "not a valid id" });
  }
});

// POST (create) a new book
app.post('/books', (req, res) => {
  const book = req.body; // Get book data from request body

  db.collection('books')
    .insertOne(book) // Insert the new book document
    .then(result => {
      res.status(200).json(result); // Return the insertion result
    })
    .catch((error) => {
      res.status(500).json({ error: "Could not create new document" });
    });
});

// DELETE a book by ID
app.delete('/books/:id', (req, res) => {
  // Validate the ID first
  if (ObjectId.isValid(req.params.id)) {
    db.collection('books')
      .deleteOne({ _id: new ObjectId(req.params.id) }) // Delete the document
      .then(result => {
        res.status(200).json(result); // Return the deletion result
      })
      .catch((error) => {
        res.status(500).json({ error: 'Could not delete document' });
      });
  } else {
    res.status(500).json({ error: "not a valid id" });
  }
});

// PATCH (update) a book by ID
app.patch('/books/:id', (req, res) => {
  const updates = req.body; // Get updates from request body
  
  // Validate the ID first
  if (ObjectId.isValid(req.params.id)) {
    db.collection('books')
      .updateOne(
        { _id: new ObjectId(req.params.id) }, // Find the document to update
        { $set: updates } // Apply the updates using $set operator
      )
      .then(result => {
        res.status(200).json(result); // Return the update result
      })
      .catch((error) => {
        res.status(500).json({ error: 'Could not update document' });
      });
  } else {
    res.status(500).json({ error: "not a valid id" });
  }
});