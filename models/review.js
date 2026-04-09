const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    trim: true,
  },author:{
    type:Schema.Types.ObjectId,
    ref:"User",
  },
}, { timestamps: true});

module.exports = mongoose.model("Review", reviewSchema);
