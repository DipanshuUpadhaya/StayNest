const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require("./review.js");

const listingSchema=new Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    // image:{
        
    //     type:String,
    //     default:
    //         "https://unsplash.com/illustrations/sky-with-palm-trees-blue-yellow-sky-and-palm-leaf-background-vector-illustration-FsYlaw7epiQ",
    //     set:(v)=>v===""
    //     ? "https://unsplash.com/illustrations/sky-with-palm-trees-blue-yellow-sky-and-palm-leaf-background-vector-illustration-FsYlaw7epiQ"
    //     :v,
    // },

    image: {
    // filename: {
    //   type: String,
    //   default: "listingimage",
    // },
    // url: {
    //   type: String,
    //   default:
    //     "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=800&q=60",
    // },

    url:String,
    filename:String,

  },
    price:Number,
    location:String,
    country:String,

    reviews:[
      {
        type:Schema.Types.ObjectId,
        ref:"Review",
      },
    ],

    owner:{
      type:Schema.Types.ObjectId,
      ref:"User",
    },
    catagory:{
      type:String,
      enum:["mountains","arctic","farms","deserts"]
    },
    // for map
    geometry: {
  type: {
    type: String,
    enum: ["Point"],
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
  }
}

});

//mongoose middleware for delete all reviews when we delete listing
listingSchema.post("findOneAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
  }
});
const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;