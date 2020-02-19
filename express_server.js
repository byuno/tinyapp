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
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]/* What goes here? */ };
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

//Assign the entered username to cookie "name"...
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username)
res.redirect("/urls");
});

//Delete the username cooke and log the user out (ie redirect to /urls)...
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

function generateRandomString() {
  let randomString = Math.random().toString(36).substring(7);
  return randomString;
};