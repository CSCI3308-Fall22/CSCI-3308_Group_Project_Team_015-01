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

app.get('/register', (req, res) => {
    res.render('pages/register');
});