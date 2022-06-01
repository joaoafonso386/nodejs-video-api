const jwt = require("jsonwebtoken");

function auth(req, res, next) {

  /* o next é um callback que vai invocar a proxima função na cadeia de middlewares do Express */


  if(!req.header("X-Auth-Token")) {
    return res.status(401).send({"message": "401 Unauthorized"});
  }

  const token = req.header("X-Auth-Token");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userPayload = payload;
  } catch(e) {
    return res.status(400).send({"message": "Token in the wrong format"})
  }
  
  next();

}

module.exports = auth;