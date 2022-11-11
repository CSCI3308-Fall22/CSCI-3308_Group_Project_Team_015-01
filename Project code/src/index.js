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
app.get('/', (req, res) => {
    res.redirect('/register'); //this will call the /anotherRoute route in the API
});

// Register submission
app.post('/register', async (req, res) => {
    //the logic goes here
    const query = `INSERT INTO users(username, password) values ($1, $2);`;
    db.any(query, [req.body.username, req.body.password])
        .then(async function (data){
            const hash = await bcrypt.hash(req.body.password, 10);
            res.status(200);
            res.redirect('/login');
        })
        .catch(function (err) {
            console.log(req.body.username) ;
            res.status(401);
            res.redirect('/register');
        })
});
  

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

app.post('/login', async (req, res) => {
  const query = 'select * from users where users.username = $1'

  db.any(query, [
    req.body.username,
  ])
  .then(async(user) => {
      const match = await bcrypt.compare(req.body.password, user[0]?.password || ""); //await is explained in #8
      if(match){
        req.session.user = {
          api_key : process.env.API_KEY,
        };
        req.session.save();
        console.log('Logged in successfully')
        return res.redirect('/discover');
      }
      else{
          console.log('Username or password is incorrect')
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