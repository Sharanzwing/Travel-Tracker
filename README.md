# ✈️ Family Travel Tracker

An interactive, multi-user world map travel tracker web application built with **Node.js**, **Express**, **EJS**, and **PostgreSQL**. Track and showcase countries visited by different family members, complete with personalized color themes, smart fuzzy search, interactive tooltips, and real-time statistics.

---

## 🌟 Features

- 🗺️ **Interactive SVG World Map:** Real-time vector map where visited countries light up with each user's unique accent color.
- 👥 **Multi-User Family Profiles:** Switch between family members seamlessly. Each member gets their own customized color palette and visited country list.
- 🎨 **Modern Glassmorphic Dark UI:** Floating navigation bar, ambient dark glow background, and micro-interactions for a premium feel.
- 🔍 **Smart Country Search:**
  - Type full names (e.g. `Russia`, `United States`)
  - Type 2-letter ISO country codes (e.g. `IN`, `US`, `RU`, `FR`)
  - Fuzzy and substring matching with priority ranking
  - Click any country directly on the map to pre-fill the search bar!
- ℹ️ **Hover Tooltip Inspector:** Hover over any country on the globe to reveal its official name and visited status.
- 🛡️ **Robust Validation:** Duplicate entry protection and instant error notifications.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Backend Framework:** Express.js
- **Database:** PostgreSQL (with `pg` client)
- **Templating Engine:** EJS (Embedded JavaScript)
- **Styling:** Vanilla CSS3 (Glassmorphism, CSS Custom Properties, Flexbox)
- **Vector Graphics:** High-precision SVG World Map

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [PostgreSQL](https://www.postgresql.org/) installed and running locally

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/Travel-Tracker.git
cd Travel-Tracker
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup

Open **pgAdmin** or your `psql` terminal and create the `world` database:

```sql
CREATE DATABASE world;
```

Run the following queries to create the necessary tables and constraints:

```sql
-- 1. Create Countries Reference Table
CREATE TABLE countries (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL
);

-- (Import countries.csv into this table using pgAdmin Import tool or \copy)

-- 2. Create Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(20) NOT NULL
);

-- Seed initial users
INSERT INTO users (name, color) 
VALUES ('Angela', 'teal'), ('Jack', 'powderblue');

-- 3. Create Visited Countries Table with Composite Unique Constraint
CREATE TABLE visited_countries (
  id SERIAL PRIMARY KEY,
  country_code VARCHAR(2) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_country UNIQUE (country_code, user_id)
);
```

### 5. Configure Environment & Run
Start the application:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploying to Render

### Configuration on Render:
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Choose **Node** as the environment.
4. Set the following settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` (or `node index.js`)
5. In the **Environment Variables** section, add your PostgreSQL connection string:
   - `DATABASE_URL`: `postgres://user:password@host/database`
   *(Render automatically provides this if you create a Render PostgreSQL database)*

---

## 📂 Project Structure

```text
Travel-Tracker/
├── public/
│   └── styles/
│       ├── main.css      # Core glassmorphic theme & responsive styles
│       └── new.css       # Add member modal styles
├── views/
│   ├── index.ejs         # Main dashboard & interactive world map
│   └── new.ejs           # Family member registration page
├── countries.csv         # ISO 3166-1 country dataset
├── index.js              # Express server, database queries & routes
├── package.json          # Dependencies and scripts
└── README.md
```

---

## 📄 License
This project is open-source under the [ISC License](LICENSE).
