const express = require("express");
const router = express.Router();
const joi = require("joi");
const auth = require("../middleware/auth");

const Video = require("../models/Video");

const validationSchema = joi.object({
  title: joi.string().min(5).max(120).required(),
  url: joi.string().uri().min(30).max(120).required(),
  category: joi.string().min(1).max(40).required()
})

router.get("/", async (req, res) => {

  const videos = await Video.find().lean().sort({ createdAt: "desc" });

  res.send( videos );

});

router.get("/:id", async (req, res) => {

  try {
    const video = await Video.findById( req.params.id ).lean();
  
    if(!video) {
      return res.status(404).send({"message": "Not found"});
    }
  
    res.send( video );

  }catch(e) {
    res.status(400).send({"message": "Invalid ID"});
  }

});

router.post("/", auth, async (req, res) => {

  const newVid = req.body;

  const error = validationSchema.validate( newVid ).error;

  if(error) {
    return res.status(400).send( {"message": error.details[0].message} );
  }

  newVid.user_id = req.userPayload._id;

  try {
    const video = new Video( newVid );
    await video.save();

  } catch (e) {
    res.status(400).send({"message": "Invalid Data"});

  }

  res.status(202).send( newVid )

});

router.put("/:id", auth, async (req, res) => {

  const updatedVid = req.body;

  const error = validationSchema.validate( updatedVid ).error;

  if(error) {
    return res.status(400).send( {"message": error.details[0].message} );
  }
  try {
    const existingVid = await Video.findById( req.params.id ).lean();
  
    if( !existingVid ) {
      return res.status(404).send({"message": "Not Found"});
    }

    if(existingVid.user_id.toString() !== req.userPayload._id) {
      return res.status(403).send({"message": "You do not have permissions to do this"});
    }

    updatedVid.user_id = req.userPayload.user_id;

    const result = await Video.findByIdAndUpdate(req.params.id, updatedVid, {new: true} ).lean();
  
    res.status(202).send( result );

  } catch(e) {
    return res.status(400).send( {"message": "Invalid Request"} );

  }

});

router.delete("/:id", auth, async (req, res) => {
 
  try {
    const result = await Video.findById( req.params.id ).lean();
  
    if( !result ) {
      return res.status(404).send({"message": "Not Found"});
    }

    if(result.user_id.toString() !== req.userPayload._id) {
      return res.status(403).send({"message": "You do not have permissions to do this"});
    }

    const remove = await Video.findByIdAndDelete( req.params.id );
  
    res.status(202).send( {"message": "Deleted"} );

  } catch(e) {
    return res.status(404).send( {"message": "Not found"} );

  }
})

module.exports = router;