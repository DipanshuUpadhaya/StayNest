const mongoose = require("mongoose");
const Listing = require("../models/listing");

main()
  .then(() => {
    console.log("DB connected");
    updateListings();
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

async function getCoords(location) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`,
      {
        headers: {
          "User-Agent": "wanderlust-app"
        }
      }
    );

    const data = await res.json();

    if (data.length > 0) {
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }

    return null;
  } catch (err) {
    console.log("Geocoding error:", err.message);
    return null;
  }
}

async function updateListings() {
  const listings = await Listing.find({});

  for (let listing of listings) {
    const fullLocation = `${listing.location}, ${listing.country}`;
    console.log("Updating:", fullLocation);

    const coords = await getCoords(fullLocation);

    if (coords) {
      listing.geometry = {
        type: "Point",
        coordinates: coords,
      };

      await listing.save();
      console.log(`Updated: ${listing.title} -> ${coords}`);
    } else {
      console.log(`Could not find coordinates for: ${listing.title}`);
    }
  }

  console.log("Done! All listings updated.");
  mongoose.connection.close();
}