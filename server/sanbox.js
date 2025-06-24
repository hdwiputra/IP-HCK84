// import axios from "axios";
const axios = require("axios");

const test = async () => {
  try {
    const response = await axios({
      method: "get",
      url: "https://api.jikan.moe/v4/top/anime?limit=3",
      family: 4, // Use IPv4
    });
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

test();
