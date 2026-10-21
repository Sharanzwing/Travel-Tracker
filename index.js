import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = process.env.PORT || 3000;

const db = process.env.DATABASE_URL
  ? new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : new pg.Client({
      user: process.env.PG_USER || "postgres",
      host: process.env.PG_HOST || "localhost",
      database: process.env.PG_DATABASE || "world",
      password: process.env.PG_PASSWORD || "SistECE*181222134",
      port: Number(process.env.PG_PORT) || 5432,
    });
await db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 3;

let users = [
  { id: 3, name: "Sharan", color: "teal" },
  { id: 4, name: "PRIYA", color: "powderblue" },
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
  return users.find((user) => user.id == currentUserId) || users[0];
}

app.get("/", async (req, res) => {
  const countries = await checkVisited();
  const currentUser = await getCurrentUser();
  res.render("index.ejs", { 
    total: countries.length, 
    countries: countries, 
    users: users, 
    color: currentUser ? currentUser.color : "teal" 
  });
});

app.post("/add", async (req, res) => {
  const countryName = req.body.country ? req.body.country.trim() : "";
  const currentUser = await getCurrentUser();

  try {
    const countryResult = await db.query(
      `SELECT country_code FROM countries 
       WHERE LOWER(country_name) = $1 
          OR UPPER(country_code) = $2
          OR LOWER(country_name) LIKE '%' || $1 || '%'
       ORDER BY 
         CASE 
           WHEN UPPER(country_code) = $2 THEN 1
           WHEN LOWER(country_name) = $1 THEN 2 
           WHEN LOWER(country_name) LIKE $1 || '%' THEN 3 
           ELSE 4 
         END
       LIMIT 1;`,
      [countryName.toLowerCase(), countryName.toUpperCase()]
    );

    if (countryResult.rows.length === 0) {
      throw new Error("Country not found");
    }

    const countryCode = countryResult.rows[0].country_code;

    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (error) {
      const countries = await checkVisited();
      res.render("index.ejs", {
        total: countries.length,
        countries: countries,
        users: users,
        color: currentUser.color,
        error: "Country has already been added, try again.",
      });
      return;
    }
  } catch (error) {
    const countries = await checkVisited();
    res.render("index.ejs", {
      total: countries.length,
      countries: countries,
      users: users,
      color: currentUser.color,
      error: "Country not found, please try again.",
    });
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
