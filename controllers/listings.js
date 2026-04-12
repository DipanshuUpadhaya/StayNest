const Listing=require("../models/listing.js");
// const fetch = require("node-fetch");

module.exports.index=async(req,res)=>{
    const { q } = req.query;
    let allListings;
    if (q && q.trim()) {
        const searchRegex = new RegExp(q.trim(), 'i');
        allListings = await Listing.find({
            $or: [
                { title: searchRegex },
                { description: searchRegex },
                { location: searchRegex },
                { country: searchRegex }
            ]
        });
    } else {
        allListings = await Listing.find({});
    }
    res.render("listings/index",{allListings, q});
};


module.exports.renderNewForm=(req,res)=>{
    res.render("listings/new");
};


// module.exports.showListing=async (req, res) => {
//   const { id } = req.params;
//   const listing = await Listing.findById(id).populate({
//     path: "reviews",
//     populate:{
//         path:"author",
//     },
    
//     options: { sort: { createdAt: -1 } },
//   }).populate("owner");
//   if (!listing) {
//     // throw new ExpressError(404, "Listing not found");
//     req.flash("error","Listing you requested for does not exist!");
//     return res.redirect("/listings");
//   }
//   res.render("listings/show.ejs", { listing });
// };


module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
      options: { sort: { createdAt: -1 } },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  // Agar old listing me geometry nahi hai to default coordinates de do
  if (
    !listing.geometry ||
    !listing.geometry.coordinates ||
    listing.geometry.coordinates.length !== 2
  ) {
    listing.geometry = {
      type: "Point",
      coordinates: [78.0322, 30.3165], // [longitude, latitude]
    };
  }

  res.render("listings/show.ejs", { listing });
};


module.exports.createListing=async(req,res,next)=>{
    try{
        let url=req.file.path;
        let filename=req.file.filename;
        const newListing=new Listing(req.body.listing);
        newListing.owner=req.user._id;
        newListing.image={url,filename};

        // Convert location + country to coordinates
    const fullLocation = `${req.body.listing.location}, ${req.body.listing.country}`;

    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullLocation)}`,
      {
        headers: {
          "User-Agent": "wanderlust-app"
        }
      }
    );

    // const data = await geoRes.json();
    let data;

try {
  const text = await geoRes.text();   // read as text first

  try {
    data = JSON.parse(text);          // try parsing JSON
  } catch (e) {
    console.log("Geo API returned NON-JSON:", text);
    data = [];
  }

} catch (err) {
  console.log("Fetch error:", err);
  data = [];
}
    
    if (data.length > 0) {
      newListing.geometry = {
        type: "Point",
        coordinates: [
          parseFloat(data[0].lon),
          parseFloat(data[0].lat),
        ],
      };
    } else {
      // fallback if location not found
      newListing.geometry = {
        type: "Point",
        coordinates: [78.0322, 30.3165], // default Dehradun
      };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.log("Create listing error:", err.message);
    next(err);
  }
};


module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if (!listing) {
        // throw new ExpressError(404, "Listing not found");
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};


module.exports.updateListing = async (req, res, next) => {
  try {
    let { id } = req.params;

    let listing = await Listing.findByIdAndUpdate(
      id,
      req.body.listing,
      { new: true, runValidators: true }
    );

    // Agar new image upload hui hai
    if (typeof req.file !== "undefined") {
      let url = req.file.path;
      let filename = req.file.filename;
      listing.image = { url, filename };
    }

    //  Location update hone par geometry bhi update karo
    const fullLocation = `${req.body.listing.location}, ${req.body.listing.country}`;

    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullLocation)}`,
      {
        headers: {
          "User-Agent": "wanderlust-app"
        }
      }
    );

    const data = await geoRes.json();

    if (data.length > 0) {
      listing.geometry = {
        type: "Point",
        coordinates: [
          parseFloat(data[0].lon),
          parseFloat(data[0].lat),
        ],
      };
    } else {
      listing.geometry = {
        type: "Point",
        coordinates: [78.0322, 30.3165], // fallback
      };
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.log("Update listing error:", err.message);
    next(err);
  }
};


module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};