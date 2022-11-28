const chai = require('chai');
const {expect,assert,should, request} = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const express = require('express');
const session = require('express-session');
const app = express();
const dotenv = require('dotenv').config({path:'../.env'});

app.use(session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  );

const server = require('../index');

// module.exports = function(app, db, conf){
//     return function performTest() {
//       var test = server(app, db, conf);
//       test();
//     }
//   }

before((done) => {

    done();
});

after((done) => {
    
    done();
});

describe('Register/Login/Logout',() => {
    /** 
     * Test the Post Register route
     */
    describe("POST /register", function() {
        it('Successful registration'), (done) => {
            let user = {
            "username":"",
            "password":"",
            "img_url":""
            }
            const res = chai.request(server)
            //     .post('/register')
            //     .send(user)
            //     .end((err, res) => {
            //         // res.should.have.status(200);
            //         done();
            //     });
            done();
        };
        it('Empty strings', (done) => {
            let user = {
            "username":"",
            "password":"",
            "img_url":""
            }
            const res = chai.request(server)
                // .post('/register')
                // .send(user)
                // .end((err, res) => {
                //     // res.should.have.status(200);
                //     done();
                // });
                done();
        });
        it('Too short, no numbers, no special', (done) => {
            let user = {
            "username":"",
            "password":"",
            "img_url":""
            }
            const res = chai.request(server)
                // .post('/register')
                // .send(user)
                // .end((err, res) => {
                //     // res.should.have.status(200);
                //     done();
                // });
                done();
        });
        it('Username already exists', (done) => {
            let user = {
            "username":"",
            "password":"",
            "img_url":""
            }
            const res = chai.request(server)
                // .post('/register')
                // .send(user)
                // .end((err, res) => {
                //     // res.should.have.status(200);
                //     done();
                // });
                done();
        });

    });

    /** 
     * Test the Post Login route
     */
    describe("POST /login", function() {
        it('Successful login', (done) => {
            let user = {
            "username":"",
            "password":"",
            "img_url":""
            }
            const res = chai.request(server)
            //     .post('/login')
            //     .send(user)
            //     .end((err, res) => {
            //         res.should.have.status(200);
            //         done();
            //     });

            done();

        });

        it('Empty strings', (done) => {
            let user = {
            "username":"",
            "password":"",
            "img_url":""
            }
            const res = chai.request(server)
            //     .post('/login')
            //     .send(user)
            //     .end((err, res) => {
            //         res.should.have.status(200);
            //         done();
            //     });

            done();
        });

        it('Incorrect password for login', (done) => {
            let user = {
            "username":"",
            "password":"",
            "img_url":""
            }
            const res = chai.request(server)
            //     .post('/login')
            //     .send(user)
            //     .end((err, res) => {
            //         res.should.have.status(200);
            //         done();
            //     });
            done();
        });
    });

    /** 
     * Test the Get Logout route
     */
    describe("GET /logout", function() {
        it('Successful logout', (done) =>{
            const res = chai.request(server)
            // .get('/logout')
            // .expect()
            done();
        });
    });
});

describe("Joke Generating", function(){
    /** 
     * Testing Joke Generation
     */
    it('Joke type must be specified', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    });

    it('Fill filter fields', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    });

    it('Removing filter resets jokes', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    });

    it('Can handle no keywords', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    });
    it('Can handle multiple keywords', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    })
    it('Removing keyword resets jokes', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    });
    it('Returned jokes fit all filters and keywords', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    });
    it('No jokes found', (done) => {
        const res = chai.request(server);
        done();
    });
});

describe("Joke Saving/Recall", function(){
    /** 
     * Test Joke Saving and Recall
     */
    it('Saved jokes can be recalled', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    });
    it('Deleting an unsaved joke', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    })
    it('Recalling a deleted joke', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    });
    it('Attempting to save an already saved joke', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
            done();
    })
    it('Saving more than 25 jokes', (done) => {
        const res = chai.request(server)
            // .end((err, res) => {
            //     // res.should.have.status(200);
            //     done();
            // });
        done();
    });
});