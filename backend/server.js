// imports
import express from "express";
import "dotenv/config";
import cors from "cors";
import usermodel from "./useModel.js";
import bcrypt from "bcrypt";
import databaseconnect from "./connect.js";
import cookieParser from "cookie-parser";
import { finduser } from "./database.js";
import { createToken } from "./createToken.js";
import { verifyToken } from "./verifyToken.js";
import path from "path";
import { unsubscribe } from "diagnostics_channel";

// modules inilitization
const app = express();
const PORT = process.env.PORT || 3000;

// middleware;
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Database config
const async_function = async () => {
  try {
    await databaseconnect(process.env.MONGO_URL);
    // app.use(express.static(path.join(__dirname, "/frontend/build")));
    // app.get("*", (req, res) => {
    //   res.sendFile(path.join(__dirname, "frontend/build", "index.html"));
    // });

    app.listen(PORT, () => {
      console.log(`Server listening at port number${PORT}`);
    });
  } catch (e) {
    console.log(e.message);
  }
};
async_function();
//API requests
// var token = res.user.accessToken;
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    bcrypt.hash(password, 10).then(async (result) => {
      const user = await usermodel
        .create({
          name: name,
          email: email,
          password: result,
        })
        .then((result) => {
          const accessToken = createToken(result);
          res.status(200).send({ accessToken });
        })
        .catch((err) => {
          res.status(400).send({ Error: err.message });
        });
    });
  } catch (err) {
    res.status(400).send({ Error: err });
  }
});
app.post("/api/test", (req, res) => {
  res.send("ok");
});
app.get("/api/test", async (req, res) => {
  const user = await usermodel.findOne({ email: "ok@gmail.com" });
  res.send(String(user));
  console.log(user);
});
app.post("/api/login", async (req, res) => {
  var { email, password } = req.body;
  const user = await usermodel.findOne({ email: email });
  if (!user) return res.send({ Error: "Invalid user" });
  const dbpassword = user.password;
  try {
    bcrypt.compare(password, dbpassword).then((check) => {
      if (!check) {
        res.send({ Error: "Password error" });
        return;
      }
      const accessToken = createToken(user);
      res.cookie("access-token", accessToken, {
        maxAge: 60 * 60 * 24 * 30 * 1000,
      });
      return res.status(200).send({ accessToken });
    });
  } catch (error) {
    res.status(400).send({ Errror: { error } });
  }
});

app.post("/api/logout", async (req, res) => {
  const result = await verifyToken(req.body.Token);
  console.log(result);
  if (result.verified_token) {
    return res.status(200).send(result.verified_token);
  }
  return res.status(403).send(result.Error);
});

app.post("/api/forgotpassword", (req, res) => {
  const { newPassword, email } = req.body;
  try {
    bcrypt.hash(newPassword, 10).then(async (result) => {
      await usermodel
        .updateOne({ email: email }, { $set: { password: result } })
        .then((result) => {
          if (result.matchedCount == 0) {
            return res.status(200).send({
              result:
                "we can't seem to find the right email address you resend the email that you have registered!",
            });
          }
          res.status(200).send({ result: "Successfully updated!" });
        })
        .catch((err) => {
          res.send({ result: err.message });
        });
    });
  } catch (err) {
    res.send({ Error: err });
  }
});
