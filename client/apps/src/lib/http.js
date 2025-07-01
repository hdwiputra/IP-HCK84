import axios from "axios";

const http = axios.create({
  baseURL: "http://3.1.100.140/",
});

export default http;
