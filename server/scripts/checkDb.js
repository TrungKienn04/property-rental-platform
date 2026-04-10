const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function check() {
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

    const [tables] = await conn.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [database],
    );

    console.log("Found tables in", database);
    for (const row of tables) {
      const t = row.TABLE_NAME;
      try {
        const [res] = await conn.query(`SELECT COUNT(*) as c FROM \`${t}\``);
        console.log(`${t}:`, res[0].c);
      } catch (e) {
        console.warn(`${t}: count failed:`, e && e.message);
      }
    }

    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error("checkDb failed:", err && err.message);
    process.exit(1);
  }
}

check();
