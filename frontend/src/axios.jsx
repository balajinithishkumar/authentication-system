import axios from "axios";

const instance = axios.create({
  baseURL: "https://jwt-auth-app-770d.onrender.com/api",
});

export default instance;