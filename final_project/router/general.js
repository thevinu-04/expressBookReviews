const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


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
public_users.get('/',function (req, res) {
    const getBooks = new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject({ message: "Books not found" });
        }
      });
    
      getBooks
        .then((bookList) => {
          return res.status(200).send(JSON.stringify(bookList, null, 4));
        })
        .catch((error) => {
          return res.status(500).json({ message: error.message });
        });
    });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: "Book not found with this ISBN" });
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((error) => {
      return res.status(error.status || 500).json({ message: error.message });
    });
});
  
// Get book details based on author
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author.toLowerCase();
  
    const getBooksByAuthor = new Promise((resolve, reject) => {
      const matchbooks = [];
      
      // FIX: Define the keys variable here!
      const keys = Object.keys(books);
      
      keys.forEach(key => {
        if (books[key].author.toLowerCase() === author) {
          // Optional good practice: include the ISBN in the array objects
          matchbooks.push({ isbn: key, ...books[key] }); 
        }
      });
  
      if (matchbooks.length > 0) {
        resolve(matchbooks);
      } else {
        reject({ status: 404, message: "No books found for this author" });
      }
    });
  
    getBooksByAuthor
      .then((bookList) => {
        return res.status(200).send(JSON.stringify(bookList, null, 4));
      })
      .catch((error) => {
        return res.status(error.status || 500).json({ message: error.message });
      });
  });

// Get all books based on title
// Get book details based on title using Promises
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title.toLowerCase();
  
    const getBooksByTitle = new Promise((resolve, reject) => {
      const matchbooks = [];
      const keys = Object.keys(books);
  
      keys.forEach(key => {
        if (books[key].title.toLowerCase() === title) {
          matchbooks.push({ isbn: key, ...books[key] });
        }
      });
  
      if (matchbooks.length > 0) {
        resolve(matchbooks);
      } else {
        reject({ status: 404, message: "No books found with this title" });
      }
    });
  
    getBooksByTitle
      .then((bookList) => {
        return res.status(200).send(JSON.stringify(bookList, null, 4));
      })
      .catch((error) => {
        return res.status(error.status || 500).json({ message: error.message });
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
