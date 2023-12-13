import axios from "axios";

const instance = axios.create({
  baseURL: "https://jwtauthentication-app-296648c5f35c.herokuapp.com/",
});

export default instance;
