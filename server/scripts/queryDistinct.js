const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function run() {
  try {
    const configPath = path.resolve(
      __dirname,
      "..",
      "src",
      "config",
      "config.json",
    );
    const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const env = cfg.development;
    const { username, password, database, host } = env;

    const conn = await mysql.createConnection({
      host: host || "127.0.0.1",
      user: username || "root",
      password: password || "",
      database,
    });

    const cols = [
      "provinceCode",
      "areaCode",
      "priceCode",
      "labelCode",
      "categoryCode",
    ];
    for (const c of cols) {
      try {
        const sql =
          "SELECT `" +
          c +
          "` as col, COUNT(*) as cnt FROM `posts` GROUP BY `" +
          c +
          "` ORDER BY cnt DESC LIMIT 50;";
        const [rows] = await conn.query(sql);
        console.log("Distinct for", c);
        console.table(rows);
      } catch (e) {
        console.warn("Query failed for", c, e && e.message);
      }
    }

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error("queryDistinct failed:", err && err.message);
    process.exit(1);
  }
}

run();
