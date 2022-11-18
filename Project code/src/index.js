const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');

// database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  };

const db = pgp(dbConfig);
  
  // test your database
db.connect()
    .then(obj => {
      console.log('Database connection successful'); // you can view this message in the docker compose logs
      obj.done(); // success, release the connection;
    })
    .catch(error => {
      console.log('ERROR:', error.message || error);
    });

app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  );


app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
app.listen(3000);
console.log('Server is listening on port 3000');


app.get('/login', (req, res) => {
  res.render('pages/login');
}); 

app.get('/', (req, res) => {
  res.redirect('/login'); //this will call the /anotherRoute route in the API
});

// Register submission
app.post('/register', async (req, res) => {
  //the logic goes here
  console.log(req.body.password);
  const hash = await bcrypt.hash(req.body.password, 10);
  const query = `INSERT INTO users(username, password, img_url) values ($1, $2, $3);`;
  db.any(query, [req.body.username, hash, req.body.img_url])
      .then(function (data){
          res.status(200);
          res.redirect('/login');
      })
      .catch(function (err) {
          console.log(req.body.username) ;
          res.status(401);
          res.redirect('/register');
      })
});

app.post('/login', async (req, res) => {
  const query = 'select * from users where users.username = $1'
  db.any(query, [
    req.body.username,
  ])
  .then(async(user) => {
      const match = await bcrypt.compare(req.body.password, user[0]?.password || ""); //await is explained in #8
      if(match){
        console.log('Logged in successfully');
        db.one(query, [req.body.username])
        .then((data) => {
            req.session.user = {
              api_key : process.env.API_KEY,
            };
          console.log(data.img_url);
          req.session.user.img_url = data.img_url;
          req.session.user.username = data.username;
          req.session.user.password = data.password;
          req.session.save();
          res.redirect('/jokes');
        });
      }
      else{
        res.render("pages/login", {error: true, message: "Username or password incorrect"});
        return;
      }
  })
  .catch((err) => {
    res.redirect('/register')
    console.log('Login failed')
  });
});
app.get('/register', (req, res) => {
    res.render('pages/register');
});
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to register page.
    return res.redirect('/login');
  }
  next();
};
app.use(auth);
app.get('/jokes', (req, res) => {
  res.render('pages/Jokegenerate', {img: req.session.user.img_url, username: req.session.user.username});
});
app.get('/profile', (req, res) => {
  res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username});
});

app.get('/button', (req, res) => {
  res.render('pages/button');
});
app.get('/discover', async (req, res) => {
  console.log("HERE");
  // axios
    // .get("https://icanhazdadjoke.com")
    // .then(data => console.log(data.data))
    // .catch(error => console.log(error));
  // const response = await fetch("https://icanhazdadjoke.com");
  // console.log(response);
  axios({
      url: `https://icanhazdadjoke.com/search`,
          method: 'GET',
          dataType:'json',
          headers: {
            'User-Agent': ' My Library (http:top-shelf.net)',
            'Accept':'application/json'
          },
          params: {
            'limit': 2
          }
      })
      .then(results => {
          console.log("HERE2");
          console.log(results.data); // the results will be displayed on the terminal if the docker containers are running
       // Send some parameters
          res.render('pages/discover',{results, error: false});
      })
      .catch(results => {
      // Handle errors
          results = [];
          res.render('pages/discover',{results, error: true, message: "No jokes found."});
      });
});
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login", {message: "Logged out successfully"});
});