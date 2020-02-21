const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const {matchEmail} = require("./helpers");

//Added cookeiParser
const app = express();
app.use(cookieParser());

const PORT = 8080; // default port 8080

app.use(cookieSession({
  name: 'session',
  keys: ["hello"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": { dblongURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { dblongURL: "http://www.google.com", userID: "aJ48lW" }
};

//Creating user object...
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//Generates random string 6 char long...
function generateRandomString() {
  let randomString = Math.random().toString(36).substring(7);
  return randomString;
}

//To keep things DRY. Gets user name (replace req.cookies["id"] )...
function getUser(req) 
 {
  let user = users[req.session.user_id];
  console.log("user in getUser", user);
  return user;
}

//gets the current user (id = cookie)
function urlsForUser(id)
 {
  let results = {};
  for (const key in urlDatabase) {
    if (id === urlDatabase[key]['userID']) {
      results[key] = urlDatabase[key];
    }
  }
  //console.log("inside the function")
  return results;
}

app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
  
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]['dblongURL']); // the longurl
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Render the login page...
app.get("/login", (req, res) => {
  let templateVars = { id: '', email: '', password: '' };
  res.render("urls_login", templateVars);
});

//Render the register page...
app.get("/register", (req, res) => {
  let templateVars = { id: '', email: '', password: '' };
  res.render("urls_register", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    id: getUser(req),
    urls: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

//Navigate to the URL edit page from landing page (Edit button functionaliy)...
app.get("/urls", (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { id: getUser(req) };
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  //console.log('req', req )
  let templateVars = {
    id: getUser(req),
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['dblongURL'],
    urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});

//Assign the entered id to cookie "name"...
app.post("/login", (req, res) => {
  for (const key in users) {
    console.log("postlogin for loop", req.body.password, "===", users[key]['password']);
    if (users[key]['email'] === req.body['email'] && bcrypt.compareSync(req.body.password, users[key]['password'])) {
      //console.log("postlogin loop, 'if' is hit", req.body['email'])
      // res.cookie("user_id", users[key]["id"]);
      req.session.user_id = users[key]["id"];
      res.redirect("/urls");
    }
  }
  res.status(403).send("Status 403: Incorrect Email or Password.");
});

//Delete the id cooke and log the user out (ie redirect to /urls)...
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//Handle registration page info...
app.post("/register", (req, res) => {
  let randomUserID = generateRandomString();
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send("Status 400: Please fill out both forms.");
  }

  if (matchEmail(req, users) === true) {
    return res.status(400).send("Status 400: matching email");
  }
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[randomUserID] = {
    id: randomUserID,
    email: req.body.email,
    password: hashedPassword
  };

  req.session.user_id = randomUserID;

  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    dblongURL: req.body['longURL'],
    userID: req.session.user_id//"test"
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//Update the long URL to match with an existing short URL...
app.post("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    let shortURL = req.params.shortURL;
    let longURL = req.body.longURL;
    urlDatabase[shortURL]['dblongURL'] = longURL;
    res.redirect("/urls");
  } else {
    res.send("You are not allowed to perform this action");
  }
});

// Delete a URL and then redirect to /urls...
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL]['userID']) {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
} else {
    res.send("You are not allowed to perform this action");
  }
});


