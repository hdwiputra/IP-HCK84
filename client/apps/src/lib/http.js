import axios from "axios";

const http = axios.create({
  baseURL: "https://goat.gregx.site/",
});

export default http;
