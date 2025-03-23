const express = require("express");
const { getPNRStatus } = require("../controllers/railwayController");

const router = express.Router();

router.get("/pnr/:pnr", getPNRStatus);

module.exports = router;
