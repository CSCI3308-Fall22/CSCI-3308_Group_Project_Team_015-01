const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { Template } = require('ejs');

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
  //user is found
  const found = `select * from users where username = $1`;
  let user = await db.any(found, req.body.username);
  if (user.length != 0)
  {
    res.render("pages/register", {error : true, message: "Username Exist Try Another Username !"});
  } 
  const hash = await bcrypt.hash(req.body.password, 10);
  const query = `INSERT INTO users(username, password, img_url) values ($1, $2, $3);`;
  db.any(query, [req.body.username, hash, req.body.img_url])
      .then(function (data){
          res.status(200);
          res.render("pages/login", {message: "Account Successfully Created!"});
      })
      .catch(function (err) {
          res.render("pages/register.ejs", {message: `Username were Used by Another User Try different one` });
          // console.log(req.body.username) ;
          // res.status(401);
      })
});

app.post('/login', async (req, res) => {
  const query = 'select * from users where users.username = $1;'
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

app.get('/displayjokes', (req, res) => {
  res.render('pages/displayJokes', {img: req.session.user.img_url, username: req.session.user.username});
});

app.get('/profile', (req, res) => {
  res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username});
});

app.post('/displayjokes', async (req, res) => {
  console.log(req.body.jokefilter);
  if(req.body.jokefilter == "dadJokes")
  {
    type = "dadjokes";
    axios({
      url: `https://icanhazdadjoke.com/search`,
          method: 'GET',
          dataType:'json',
          headers: {
            'User-Agent': ' My Library (http:top-shelf.net)',
            'Accept':'application/json'
          },
          params: {
            'page': 1 + Math.floor(Math.random() * 13),
            'limit': req.body.quantity
          }
      })
      .then(results => {
          //console.log(results.data); // the results will be displayed on the terminal if the docker containers are running
          res.render('pages/displayJokes',{img: req.session.user.img_url, type, results, error: false});
          return;
      })
      .catch(results => {
      // Handle errors
          results = [];
          res.render('pages/displayJokes',{img: req.session.user.img_url, type, results, error: true, message: "No jokes found."});
          return;
      });
  } else if(req.body.jokefilter == "yoMama")
  {
    type = "yoMama"; 
    axios({
      url: `http://yomamma-api.herokuapp.com/jokes`,
          method: 'GET',
          dataType:'json',
          params: {
            'count': req.body.quantity
          }
      })
      .then(results => {
          //console.log(results.data); // the results will be displayed on the terminal if the docker containers are running
          res.render('pages/displayJokes',{img: req.session.user.img_url, type, results, error: false});
          return;
      })
      .catch(results => {
      // Handle errors
          results = [];
          res.render('pages/displayJokes',{img: req.session.user.img_url, type, results, error: true, message: "No jokes found."});
          return;
      });

  } else if(req.body.jokefilter == "french")
  {
    type = "french";
    let results = new Array();
    i = 0
    while(i < req.body.quantity)
    {
      await axios({
        url: `https://blague.xyz/api/joke/random`,
              method: 'GET',
              dataType:'json',
          })
        .then(response => {
          z = 0;
          found = 0;
          while(z < i)
          {
            if(results[z].data.joke == response.data.joke)
            {
              found = 1;
              break;
            }
            z += 1;
          }
          if(found == 0)
          {
            results.push(response);
            i += 1;
          }
        })
    }
    res.render('pages/displayJokes',{img: req.session.user.img_url, type, results, error: false});
  } else if(req.body.jokefilter == "geek")
  {
    type = "geek";
    let results = new Array();
    i = 0
    while(i < req.body.quantity)
    {
      await axios({
        url: `https://geek-jokes.sameerkumar.website/api?format=json`,
              method: 'GET',
              dataType:'json',
          })
        .then(response => {
            z = 0;
            found = 0;
            while(z < i)
            {
              if(results[z].data.joke == response.data.joke)
              {
                found = 1;
                break;
              }
              z += 1;
            }
            if(found == 0)
            {
              results.push(response);
              i += 1;
            }
        })
    }
    console.log(results[0].data);
    res.render('pages/displayJokes',{img: req.session.user.img_url, type, results, error: false});
  } else if(req.body.jokefilter == "bread")
  {
    type = "bread";
    let results = new Array();
    i = 0
    while(i < req.body.quantity)
    {
      await axios({
        url: `https://my-bao-server.herokuapp.com/api/breadpuns`,
              method: 'GET',
              dataType:'json',
          })
        .then(response => {
          z = 0;
          found = 0;
          while(z < i)
          {
            if(results[z].data == response.data)
            {
              found = 1;
              break;
            }
            z += 1;
          }
          if(found == 0)
          {
            results.push(response);
            i += 1;
          }
        })
    }
    console.log(results[0].data);
    res.render('pages/displayJokes',{img: req.session.user.img_url, type, results, error: false});
  }
});
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("pages/login", {message: "Logged out successfully"});
});


app.post('/profilecu', async (req, res) => {
  const found = `select * from users where username = $1`;
  let user = await db.any(found, req.body.username);
  if (user.length != 0)
  {
    res.render("pages/register", {error : true, message: "Username Exist Try Another Username !"});
  } 
  const match = await bcrypt.compare(req.body.currentPasswordU, req.session.user.password);
  if(match){
    var newUsername = req.body.newUsername;
    var oldUsername = req.session.user.username;
    const query = 'UPDATE users SET username = $1 WHERE username = $2;';
    db.any(query, [
      newUsername,
      oldUsername,
    ])
    .then(function (data){
      console.log('Username Edit Successful');
      req.session.user.username = newUsername;
      res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username, message: 'Username Edit Successful'});
    })
    .catch(function (err){
      console.log("Username Edit Unsuccessful");
      res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username, message: 'Username Edit Unsuccessful'});
    });

  }else{
    console.log("Incorrect Password");
    res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username, message: 'Incorrect Password'});
  }
});


app.post('/profileca', async (req, res) => {

  const match = await bcrypt.compare(req.body.currentPasswordA, req.session.user.password);
  if(match){

    var newURL = req.body.newURL;
    var oldURL = req.session.user.img_url;
    const query = 'UPDATE users SET img_url = $1 WHERE img_url = $2;';

    db.any(query, [
      newURL,
      oldURL,
    ])
    .then(function (data){
      console.log('Avatar Edit Successful');
      req.session.user.img_url = newURL;
      res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username, message: 'Avatar Edit Successful'});
    })
    .catch(function (err){
      console.log("Avatar Edit Unsuccessful");
      res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username, message: 'Avatar Edit Unsuccessful'});
    });

  }else{
    console.log("Incorrect Password");
    res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username, message: 'Incorrect Password'});
  }
});


app.post('/profilecp', async (req, res) => {

  var oldPassword = req.session.user.password;
  const match = await bcrypt.compare(req.body.currentPasswordP, oldPassword);
  if(match){
    if(req.body.newPassword1 === req.body.newPassword2){

      const newPassword = await bcrypt.hash(req.body.newPassword1, 10);
      const query = 'UPDATE users SET password = $1 WHERE password = $2;';

      db.any(query, [
        newPassword,
        oldPassword,
      ])
      .then(function (data){
        console.log('Password Edit Successful');
        req.session.user.password = newPassword;
        res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username, message: 'Password Edit Successful'});
      })
      .catch(function (err){
        console.log("Password Edit Unsuccessful");
        res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username, message: 'Password Edit Unsuccessful'});
      });

    }else{
      console.log("New Password Fields Did Not Match");
      res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username, message: 'New Password Fields Did Not Match'});
    }

  }else{
    console.log("Incorrect Current Password");
    res.render('pages/profile', {img: req.session.user.img_url, username: req.session.user.username, message: 'Incorrect Current Password'});
  }
});