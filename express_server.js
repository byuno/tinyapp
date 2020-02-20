const express = require("express");
const cookieParser = require("cookie-parser");

//Added cookeiParser
const app = express();
app.use(cookieParser())

const PORT = 8080; // default port 8080




app.set("view engine", "ejs")


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);

});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  let templateVars = { id: getUser(req), urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { id: getUser(req) };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  console.log('req', req )
  let templateVars = { id: getUser(req), shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]/* What goes here? */ };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL'];
  console.log(urlDatabase)
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

// Delete a URL and then redirect to /urls...
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

//Navigate to the URL edit page from landing page (Edit button functionaliy)...
app.get("/urls", (req, res) => {
  let shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

//Update the long URL to match with an existing short URL...
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls")
})

//Assign the entered id to cookie "name"...
app.post("/login", (req, res) => {
  console.log("req.body", req.body);
  //should match email and pw from request to the correct user on our database
  for (const key in users) {
    // console.log(users[key], "postlogin for loop");
    if (users[key]['email'] === req.body['email'] && users[key]['password'] === req.body['password']) {
      console.log("postlogin loop, 'if' is hit", req.body['email'])
      res.cookie("user_id", users[key]["id"]);
      res.redirect("/urls");
    }
  }

  res.status(403).send("Status 403: Incorrect Email or Password.");

  //console.log("res in post login", res);

  //res.cookie("id222", getUser(req))
});

//Delete the id cooke and log the user out (ie redirect to /urls)...
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

//Generates random string 6 char long...
function generateRandomString() {
  let randomString = Math.random().toString(36).substring(7);
  return randomString;

};

//Render the register page...
app.get("/register", (req, res) => {
  let templateVars = { id: '', email: '', password: '' };
  res.render("urls_register", templateVars);
})

//Handle registration page info...
app.post("/register", (req, res) => {
  let randomUserID = generateRandomString();
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400).send("Status 400: Please fill out both forms.");
  }

  if (matchEmail(req) === true){
    return res.status(400).send("Status 400: matching email");
  };

  users[randomUserID] = { id: randomUserID, email: req.body.email, password: req.body.password };
  res.cookie("user_id", randomUserID);
  res.redirect("/urls");

//console.log(getUser(req));
});

//Return true if there is matching emails.
function matchEmail(req) {
  for (const user in users) {
    if (users[user]['email'] === req.body.email) {
      return true
    }
  }
  return false;
}


//To keep things DRY. Gets user name (replace req.cookies["id"] )...
function getUser(req) {
  // let user = users[req.cookies["id"]];


  let user = users[req.cookies["user_id"]];
  console.log("user in getUser", user);
   return user;
}

//Render the login page...
app.get("/login", (req, res) => {
  let templateVars = { id: '', email: '', password: '' };
  res.render("urls_login", templateVars);
})


