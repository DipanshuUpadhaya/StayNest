// Debug logs
console.log("map.js loaded");

// Wait until DOM is ready
document.addEventListener("DOMContentLoaded", () => {

  const mapDiv = document.getElementById("map");

  // Prevent errors if map not present
  if (!mapDiv) {
    console.log("No map div found");
    return;
  }

  // Check coordinates safely
  if (typeof coordinates === "undefined" || !coordinates || coordinates.length !== 2) {
    console.log("Coordinates not found properly");
    return;
  }

  console.log("Coordinates received:", coordinates);

  const latitude = coordinates[1];
  const longitude = coordinates[0];

  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);

  // Initialize map
  const map = L.map("map").setView([latitude, longitude], 13);

  // Tile layer
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // Marker
  L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(
      `<b>${listingLocation || "Location"}</b><br>Exact location will be provided after booking.`
    )
    .openPopup();

});