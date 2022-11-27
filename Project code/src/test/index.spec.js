var chai = require('chai');
let {expect,assert} = require('chai');

let server = require('../index');

let chaiHttp = require('chai-http'); 
chai.use(chaiHttp);

describe('Login/Logout/Register',() => {
    /** 
     * Test the Post Register route
     */
    describe("POST /register", function() {
        let res = chai.request(server);
        it('POST', async function() {
            chai.request(server)
                .post('/register')
                .send({"username":"","password":"","img_url":""})
                
                expect(res).to.have.status(console.error(true));
        })
    })

    /** 
     * Test the Post Login route
     */

    /** 
     * Test the Post Logout route
     */
});