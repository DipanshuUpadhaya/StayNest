const Review=require("../models/review.js");
const Listing=require("../models/listing.js");

module.exports.createReview=async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }
  const reviewPayload = req.body.review || {};
  const newReview = new Review({
    ...reviewPayload,
    rating: Number(reviewPayload.rating),
  });
  newReview.author=req.user._id;
  console.log(newReview);
  await newReview.save();
  listing.reviews.push(newReview._id);
  await listing.save();
  req.flash("success","New Review Created!");
  res.redirect(`/listings/${listing._id}`);
};


module.exports.destroyReview=async(req,res)=>{
     let {id,reviewId}=req.params;
     id=id.trim();
     reviewId=reviewId.trim();
     await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
     await Review.findByIdAndDelete(reviewId);
     req.flash("success","Review Deleted!");
     res.redirect(`/listings/${id}`);
};