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

async function checkVisited() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach(row => {
    countries.push(row.country_code)
  });
  return countries;
}

app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await checkVisited();
  res.render("index.ejs", { total: countries.length, countries: countries });
});

app.post("/add", async (req, res) => {
  //Write your code here.
    const countryName = req.body.country;
  try {
    const countryResult = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) = LOWER($1)", [countryName]);
    const countryCode = countryResult.rows[0].country_code;

    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode]);
      res.redirect("/");
    } catch (error) {
        const countries = await checkVisited();
        res.render("index.ejs", { total: countries.length, countries: countries, error: "Country has already been added, try again." });
        return;
        
    }
  } catch (error) {
      const countries = await checkVisited();
      res.render("index.ejs", { total: countries.length, countries: countries, error: "Country not found, please try again." });
      return;
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
