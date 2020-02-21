//Return true if there is matching emails.
function matchEmail(req, users) {
  for (const user in users) {
    if (users[user]['email'] === req.body.email) {
      return true;
    }
  }
  return false;
}

module.exports = {matchEmail}
