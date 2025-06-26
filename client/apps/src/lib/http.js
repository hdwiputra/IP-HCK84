import axios from "axios";

const http = axios.create({
  baseURL: "localhost:3000/",
});

export default http;
