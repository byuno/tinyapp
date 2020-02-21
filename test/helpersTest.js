const { assert } = require('chai');

const { matchEmail } = require('../helpers.js');

const testUsers = {
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

describe('matchEmail', function() {
  it('should return true if the email in the request and in the db are the same', function() {
    const req = {body: {email: "user@example.com"}};
    const user = matchEmail(req, testUsers)
    const expectedOutput = true;
    // Write your assert statement here
    assert.equal(user, expectedOutput,'these should be the same');
  });

  it('should return true if the email in the request and in the db are different', function() {
    const req = {body: {email: "different@email.com"}};
    const user = matchEmail(req, testUsers)
    const expectedOutput = false;
    // Write your assert statement here
    assert.equal(user, expectedOutput,'these should be different');
  });
});