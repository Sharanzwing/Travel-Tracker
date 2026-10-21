import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "YOUR_PASSWORD",
  port: 5432,
});
await db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries JOIN users ON visited_countries.user_id = users.id WHERE users.id = $1", [currentUserId]);
  let countries = [];
  result.rows.forEach(row => {
    countries.push(row.country_code)
  });
  return countries;
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);
}

app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await checkVisited();
  const currentUser = await getCurrentUser();
  res.render("index.ejs", { total: countries.length, countries: countries, users: users, color: currentUser.color });
});

app.post("/add", async (req, res) => {
  //Write your code here.
    const countryName = req.body.country;
  try {
    const countryResult = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) = LOWER($1)", [countryName]);
    const countryCode = countryResult.rows[0].country_code;

    try {
      await db.query("INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)", [countryCode, currentUserId]);
      res.redirect("/");
    } catch (error) {
        const countries = await checkVisited();
        const currentUser = await getCurrentUser();
        res.render("index.ejs", { total: countries.length, countries: countries, users: users, color: currentUser.color, error: "Country has already been added, try again." });
        return;
        
    }
  } catch (error) {
      const countries = await checkVisited();
      const currentUser = await getCurrentUser();
      res.render("index.ejs", { total: countries.length, countries: countries, users: users, color: currentUser.color, error: "Country not found, please try again." });
      return;
  }
});

app.post("/user", async (req, res) => {
  if(req.body.add == "new") {
    res.render("new.ejs");
  } else {
    currentUserId = req.body["user"];
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  try {
    const result = await db.query(
      "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *;",
      [req.body.name, req.body.color]
    );
    const newUser = result.rows[0];
    users.push({ id: newUser.id, name: newUser.name, color: newUser.color });
    currentUserId = newUser.id;
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
