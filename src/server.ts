import express from "express";
import "express-async-errors";
import router from "./routes";
import path from "path";
import session from "express-session";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  })
);

const viewsDir = path.join(__dirname, "views");
app.set("views", viewsDir);

const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../src/views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.listen(process.env.PORT);
export default app;
