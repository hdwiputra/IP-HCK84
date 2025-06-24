const bcrypt = require("bcryptjs");

const hashPass = (pass) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pass, salt);
};

const comparePass = (pass, hashPass) => {
  return bcrypt.compareSync(pass, hashPass);
};

module.exports = {
  hashPass,
  comparePass,
};
