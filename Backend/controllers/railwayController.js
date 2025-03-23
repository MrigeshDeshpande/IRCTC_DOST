const axios = require("axios");

const getPNRStatus = async (req, res) => {
  const { pnr } = req.params;

  try {
    const response = await axios.get("https://irctc1.p.rapidapi.com/api/v3/getPNRStatus", {
      params: { pnrNumber: pnr },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": process.env.RAPIDAPI_HOST
      }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getPNRStatus };
