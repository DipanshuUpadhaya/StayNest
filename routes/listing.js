const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Listing=require("../models/listing.js");
const {isLoggedIn,isOwner,validateListing}=require("../middleware.js");
const listingController=require("../controllers/listings.js");

const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});



// for index and create routes, we can chain them together since they share the same path;
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, 
        upload.single('listing[image]'), 
        validateListing,
        wrapAsync(listingController.createListing));
    

// new route
router.get("/new",isLoggedIn,listingController.renderNewForm);


// for show,update and delelte routes,we can also chain them together since they share the same path; 
router
    .route("/:id")
    .get( wrapAsync(listingController.showListing))
    .put(isLoggedIn,isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing))
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing));




// Edit ROute
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));


// update route
// app.put("/listings/:id",async(req,res)=>{
//     let {id}=req.params;
//     await Listing.findByIdAndUpdate(id,{...req.body.listing});
//     res.redirect(`/listings/${id}`);
// });


module.exports=router;