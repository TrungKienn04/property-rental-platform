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

    const codes = ["TPHCM"];
    // fetch provinces
    const [provs] = await conn.query(
      "SELECT * FROM provinces WHERE code IN (?)",
      [codes],
    );
    console.log("provinces:", provs);
    const names = provs.map((p) => p.value).filter(Boolean);
    const namesExpanded = new Set();
    names.forEach((n) => {
      namesExpanded.add(n);
      const parts = n.split(/\s+/).filter(Boolean);
      if (parts.length >= 3) namesExpanded.add(parts.slice(-3).join(" "));
      if (parts.length >= 2) namesExpanded.add(parts.slice(-2).join(" "));
    });
    console.log("namesExpanded:", Array.from(namesExpanded));

    // build SQL parts
    const parts = [];
    if (codes.length === 1) {
      parts.push("`provinceCode` = " + conn.escape(codes[0]));
    } else {
      parts.push(
        "`provinceCode` IN (" +
          codes.map((c) => conn.escape(c)).join(",") +
          ")",
      );
    }
    Array.from(namesExpanded).forEach((n) =>
      parts.push("address LIKE " + conn.escape("%" + n + "%")),
    );
    const sql =
      "SELECT id FROM posts WHERE (" + parts.join(" OR ") + ") LIMIT 20";
    console.log("SQL:", sql);
    const [rows] = await conn.query(sql);
    console.log("rows length", rows.length);
    console.log(rows.slice(0, 10));
    await conn.end();
    process.exit(0);
  } catch (e) {
    console.error(e && e.message);
    process.exit(1);
  }
})();
