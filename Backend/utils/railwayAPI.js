const https = require("https");
require("dotenv").config();

const fetchPNRStatus = async (pnrNumber) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: "GET",
      hostname: process.env.RAPIDAPI_HOST,
      port: null,
      path: `/api/v3/getPNRStatusDetail?pnrNumber=${pnrNumber}`,
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString());
          resolve(body);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => reject(error));
    req.end();
  });
};

module.exports = { fetchPNRStatus };

