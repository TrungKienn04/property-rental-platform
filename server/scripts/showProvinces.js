const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

(async function () {
  try {
    const cfg = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, "..", "src", "config", "config.json"),
        "utf8",
      ),
    );
    const env = cfg.development;
    const conn = await mysql.createConnection({
      host: env.host,
      user: env.username,
      password: env.password || "",
      database: env.database,
    });
    const [rows] = await conn.query("SELECT * FROM provinces");
    console.table(rows.slice(0, 20));
    await conn.end();
  } catch (e) {
    console.error(e && e.message);
    process.exit(1);
  }
})();
