// for map 
console.log("map.js loaded");
console.log("Coordinates received:", coordinates);

if (coordinates && coordinates.length === 2) {
  const latitude = coordinates[1];
  const longitude = coordinates[0];

  console.log("Latitude:", latitude);
  console.log("Longitude:", longitude);

  const map = L.map("map").setView([latitude, longitude], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(`<b>${listingLocation}</b><br>Exact location will be provided after booking.`)
    .openPopup();
} else {
  console.log("Coordinates not found properly");
}