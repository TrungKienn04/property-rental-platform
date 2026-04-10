const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function importSql() {
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

    const sqlFile = path.resolve(__dirname, "..", "phongtro123.sql");
    if (!fs.existsSync(sqlFile)) {
      console.error("SQL file not found:", sqlFile);
      process.exit(1);
    }

    console.log("Reading SQL file:", sqlFile);
    const sql = fs.readFileSync(sqlFile, "utf8");

    const conn = await mysql.createConnection({
      host: host || "127.0.0.1",
      user: username || "root",
      password: password || "",
      multipleStatements: true,
      // increase packet size for big dumps
      // packetSize is client side; leave default
      charset: "utf8mb4_general_ci",
    });

    console.log("Connected to MySQL, ensuring database exists:", database);
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
    await conn.query(`USE \`${database}\`;`);

    console.log("Executing SQL (this may take a while)...");
    // split into individual statements to allow continuing on non-fatal errors
    const statements = sql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await conn.query(stmt);
      } catch (e) {
        // log and continue for statements that fail (e.g., table exists)
        console.warn(
          `Statement ${i + 1}/${statements.length} failed:`,
          (e && e.message) || e,
        );
      }
    }

    console.log("Import finished successfully.");
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error("Import failed:", err && (err.message || err));
    process.exit(1);
  }
}

importSql();
