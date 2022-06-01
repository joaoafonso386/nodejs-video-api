const joi = require("joi");
const express = require("express");
const bcrypt = require("bcrypt");

const auth = require("../middleware/auth")

const User = require("../models/User");

const router = express.Router();
const validationSchema = joi.object({
  name: joi.string().min(3).max(60).required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).max(1000).required(),
});


router.get("/", async (req, res) => {
  res.send( await User.find().lean().select("name") );
});

router.get("/:id", auth, async (req, res) => {

  if(req.userPayload._id !== req.params.id){
    return res.status(403).send({"message":"403 Forbidden"})
  }
  
  try{

    const user = await User
      .findById(req.params.id)
      .lean()
      .select("_id name email __v");
  
    if(!user) {
      return res.send(404).send({"message": "Not found"})
    }
  
    res.send(user);

  }catch(e){

  }

});

router.post("/", async (req, res) => {

  const newUser = req.body;
  const error = validationSchema.validate( newUser ).error;

  if(error) {
    return res.status(400).send({ "message": error.details[0].message })
  }

  try {

    /*gerar o salt para ser usado para criar o hash da password */
    const salt = await bcrypt.genSalt(10);

    /* passo seguinte, criar a password encriptada */
    newUser.password = await bcrypt.hash(newUser.password, salt);

    const user = new User( newUser );

    await user.save();
  
    res.status(202).send( newUser );
  } catch(e) {
    res.status(400).send({"message": "Invalid Data"});
    console.log(e);
  }

});

router.put("/:id", auth, async (req, res) => {

  if(req.userPayload._id !== req.params.id){
    return res.status(403).send({"message":"403 Forbidden"})
  }

  const updatedUser = req.body;

  const error = validationSchema.validate(updatedUser).error;

  if(error) {
    return res.status(400).send({ "message": error.details[0].message });
  }

  try {

    const salt = await bcrypt.genSalt(10);
    updatedUser.password = await bcrypt.hash(updatedUser.password, salt);

    const result = await User.findByIdAndUpdate(req.params.id, updatedUser, {new: true}); //{new: true} para retornar o utilizador atualizado, se não, manda o user anterior
  
    if(!result) {
      return res.status(404).send({"message":"Not found"});
    }
  
    res.status(202).send( updatedUser );
  } catch(e) {
    res.status(400).send({"message": e})
  }

});

router.delete("/:id", auth, async (req, res) => {

  if(req.userPayload._id !== req.params.id){
    return res.status(403).send({"message":"403 Forbidden"})
  }

  try {
    const result = await User.findByIdAndRemove(req.params.id);
  
    if(!result) {
      return res.status(404).send({"message": "Not found"});
    }
  
    res.status(202).send({"message": "deleted id" + req.params.id})

  } catch(e) {
    res.status(400).send({"message": "Invalid ID"})
  }

})

module.exports = router;