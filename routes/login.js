const express = require("express");
const router = express.Router();
const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const validationSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).max(1000).required()
});

router.post("/", async (req, res) => {


  const login = req.body

  const error = validationSchema.validate( login ).error;

  if(error) {
    res.send(400).send({"message": error.details[0].message});
  }

  const user = await User.findOne({"email": login.email});

  if(!user) {
    return res.send(422).send({"message": "invalid email or password"});
  }

  const success = await bcrypt.compare(login.password, user.password);

  if(!success) {
    return res.send(422).send({"message": "invalid email or password"});
  }
  
  /* informação a guardar sobre o utilizador */
  const payload = {
    "_id": user._id,
    "name": user.name,
    "email": user.email
  }

  /* gerar o token usando o payload + secret key */
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY)

  res.header({"X-Auth-Token": token}).send({"X-Auth-Token": token});

});

module.exports = router;