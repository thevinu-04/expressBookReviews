const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');
const BASE_URL = 'http://localhost:5000';

public_users.get('/books-data', (req, res) => {
    return res.status(200).json(books);
});

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

// Get the book list available in the shop
public_users.get('/', (req, res) => {
    axios.get(`${BASE_URL}/books-data`)
        .then((response) => {
            return res.status(200).send(JSON.stringify(response.data, null, 4));
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error fetching books", error: error.message });
        });
});
    
// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    axios.get(`${BASE_URL}/books-data`)
        .then((response) => {
            const booksList = response.data;
            if (booksList[isbn]) {
                return res.status(200).send(JSON.stringify(booksList[isbn], null, 4));
            } else {
                return res.status(404).json({ message: "Book not found with this ISBN" });
            }
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
        });
});
  
// Get book details based on author 
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase();

    axios.get(`${BASE_URL}/books-data`)
        .then((response) => {
            const booksList = response.data;
            const matchedBooks = Object.keys(booksList)
                .filter(key => booksList[key].author.toLowerCase() === author)
                .map(key => ({ isbn: key, ...booksList[key] }));

            if (matchedBooks.length > 0) {
                return res.status(200).send(JSON.stringify(matchedBooks, null, 4));
            } else {
                return res.status(404).json({ message: "No books found for this author" });
            }
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error fetching books by author", error: error.message });
        });
});

// Get book details based on title 
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();

    axios.get(`${BASE_URL}/books-data`)
        .then((response) => {
            const booksList = response.data;
            const matchedBooks = Object.keys(booksList)
                .filter(key => booksList[key].title.toLowerCase() === title)
                .map(key => ({ isbn: key, ...booksList[key] }));

            if (matchedBooks.length > 0) {
                return res.status(200).send(JSON.stringify(matchedBooks, null, 4));
            } else {
                return res.status(404).json({ message: "No books found with this title" });
            }
        })
        .catch((error) => {
            return res.status(500).json({ message: "Error fetching books by title", error: error.message });
        });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn= req.params.isbn;
  if(books[isbn]){
    return res.send(JSON.stringify(books[isbn].reviews,null,4));
  }
  else{
    return res.json({message: "Book not found"});
  }
});

module.exports.general = public_users;
