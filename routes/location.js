// server/routes/location.js

const express = require("express");
const router = express.Router();

const LOCATIONIQ_KEY = process.env.LOCATIONIQ_KEY;

// ✅ Node 18+ already has fetch globally
// If using older Node version then uncomment below:
// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));

/*
====================================================
✅ HEALTH CHECK
====================================================
*/
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Location API Working",
  });
});

/*
====================================================
✅ REVERSE GEOCODE
Lat/Lng → Address
Example:
GET /api/location/rev_geocode?lat=22.7196&lng=75.8577
====================================================
*/
router.get("/rev_geocode", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // VALIDATION
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: "lat and lng are required",
      });
    }

    const url = `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_KEY}&lat=${lat}&lon=${lng}&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("LocationIQ request failed");
    }

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({
        success: false,
        error: data.error,
      });
    }

    return res.json({
      success: true,

      location: {
        city:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          "",

        state: data.address?.state || "",

        district: data.address?.county || "",

        postalCode:
          data.address?.postcode || "",

        country:
          data.address?.country || "",

        lat: data.lat,

        lng: data.lon,

        display_name:
          data.display_name || "",

        fullData: data,
      },
    });
  } catch (err) {
    console.error(
      "Reverse geocode error:",
      err.message
    );

    return res.status(500).json({
      success: false,
      error:
        "Failed to fetch reverse geocode",
    });
  }
});

/*
====================================================
✅ SEARCH LOCATION
Example:
GET /api/location/search?query=indore
====================================================
*/
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "query is required",
      });
    }

    const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(
      query
    )}&format=json&limit=10`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Search request failed");
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return res.json({
        success: true,
        results: [],
      });
    }

    const results = data.map((place) => ({
      city:
        place.address?.city ||
        place.address?.town ||
        place.address?.village ||
        "",

      state:
        place.address?.state || "",

      district:
        place.address?.county || "",

      country:
        place.address?.country || "",

      postalCode:
        place.address?.postcode || "",

      lat: place.lat,

      lng: place.lon,

      display_name:
        place.display_name || "",

      fullData: place,
    }));

    return res.json({
      success: true,
      results,
    });
  } catch (err) {
    console.error(
      "Search location error:",
      err.message
    );

    return res.status(500).json({
      success: false,
      error: "Failed to search location",
    });
  }
});

/*
====================================================
✅ AUTOCOMPLETE
Example:
GET /api/location/autocomplete?query=indo
====================================================
*/
router.get(
  "/autocomplete",
  async (req, res) => {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: "query is required",
        });
      }

      const url = `https://us1.locationiq.com/v1/autocomplete.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(
        query
      )}&limit=5&dedupe=1`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          "Autocomplete request failed"
        );
      }

      const data = await response.json();

      return res.json({
        success: true,
        results: data || [],
      });
    } catch (err) {
      console.error(
        "Autocomplete error:",
        err.message
      );

      return res.status(500).json({
        success: false,
        error:
          "Failed to get autocomplete",
      });
    }
  }
);

/*
====================================================
✅ DISTANCE MATRIX
Example:
GET /api/location/distance?origins=75.8577,22.7196&destinations=77.4126,23.2599
====================================================
*/
router.get("/distance", async (req, res) => {
  try {
    const { origins, destinations } =
      req.query;

    if (!origins || !destinations) {
      return res.status(400).json({
        success: false,
        error:
          "origins and destinations are required",
      });
    }

    const url = `https://us1.locationiq.com/v1/matrix/driving/${origins};${destinations}?key=${LOCATIONIQ_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Distance request failed"
      );
    }

    const data = await response.json();

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(
      "Distance error:",
      err.message
    );

    return res.status(500).json({
      success: false,
      error: "Failed to get distance",
    });
  }
});

/*
====================================================
✅ DIRECTIONS / ROUTING
Example:
GET /api/location/directions?start=75.8577,22.7196&end=77.4126,23.2599
====================================================
*/
router.get(
  "/directions",
  async (req, res) => {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({
          success: false,
          error:
            "start and end are required",
        });
      }

      const url = `https://us1.locationiq.com/v1/directions/driving/${start};${end}?key=${LOCATIONIQ_KEY}&overview=full&geometries=geojson`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          "Directions request failed"
        );
      }

      const data = await response.json();

      return res.json({
        success: true,
        data,
      });
    } catch (err) {
      console.error(
        "Directions error:",
        err.message
      );

      return res.status(500).json({
        success: false,
        error:
          "Failed to get directions",
      });
    }
  }
);

/*
====================================================
✅ STATIC MAP
Example:
GET /api/location/staticmap?lat=22.7196&lng=75.8577
====================================================
*/
router.get(
  "/staticmap",
  async (req, res) => {
    try {
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: "lat and lng are required",
        });
      }

      const mapUrl = `https://maps.locationiq.com/v3/staticmap?key=${LOCATIONIQ_KEY}&center=${lat},${lng}&zoom=13&size=800x500&markers=icon:large-red-cutout|${lat},${lng}`;

      return res.json({
        success: true,
        mapUrl,
      });
    } catch (err) {
      console.error(
        "Static map error:",
        err.message
      );

      return res.status(500).json({
        success: false,
        error:
          "Failed to get static map",
      });
    }
  }
);

module.exports = router;