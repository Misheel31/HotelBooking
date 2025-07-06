const bcrypt = require("bcrypt");

const comparePassword = (password, hashed) => {
  return bcrypt.compare(password, hashed);
};

module.exports = {
  // hashPassword,
  comparePassword,
};
