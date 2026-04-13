import express from "express";
require("dotenv").config();
import cors from "cors";
import path from "path";
import initRoutes from "./src/routes";
import connectDatabase from "./src/config/connectDatabase";
import db from "./src/models";
import { dataPrice, dataArea } from "./src/ultis/data";

const { DEFAULT_PROVINCES } = require("./src/ultis/provinceCode");

const app = express();
const rawAllowed = (process.env.CLIENT_URL || "").toString();
const allowedOrigins = rawAllowed
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0) return callback(null, true);
      if (allowedOrigins.includes("*")) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

initRoutes(app);

connectDatabase().then(async () => {
  try {
    const priceCount = await db.Price.count();
    const areaCount = await db.Area.count();

    if (!priceCount) {
      await db.Price.bulkCreate(
        dataPrice.map((item, index) => ({
          code: item.code,
          value: item.value,
          order: index + 1,
        })),
      );
      console.log("Seeded Price table");
    }

    if (!areaCount) {
      await db.Area.bulkCreate(
        dataArea.map((item, index) => ({
          code: item.code,
          value: item.value,
          order: index + 1,
        })),
      );
      console.log("Seeded Area table");
    }

    const provinceCount = await db.Province.count();
    if (!provinceCount) {
      await db.Province.bulkCreate(DEFAULT_PROVINCES);
      console.log("Seeded default provinces");
    }

    try {
      const queryInterface = db.sequelize.getQueryInterface();
      const userDesc = await queryInterface.describeTable("Users");

      if (!userDesc.fbUrl) {
        await queryInterface.addColumn("Users", "fbUrl", {
          type: db.Sequelize.STRING,
          allowNull: true,
        });
        console.log("Added Users.fbUrl column");
      }

      if (!userDesc.avatar) {
        await queryInterface.addColumn("Users", "avatar", db.Sequelize.BLOB("long"));
        console.log("Added Users.avatar column");
      }

      if (!userDesc.email) {
        await queryInterface.addColumn("Users", "email", {
          type: db.Sequelize.STRING,
          allowNull: true,
        });
        console.log("Added Users.email column");
      }

      if (!userDesc.role) {
        await queryInterface.addColumn("Users", "role", {
          type: db.Sequelize.STRING,
          allowNull: false,
          defaultValue: "user",
        });
        console.log("Added Users.role column");
      }

      await db.sequelize.query(`
        UPDATE Users
        SET role = 'user'
        WHERE role IS NULL OR role = ''
      `);

      const userIndexes = await queryInterface.showIndex("Users");
      const hasEmailUniqueIndex = userIndexes.some(
        (index) =>
          index.unique
          && Array.isArray(index.fields)
          && index.fields.length === 1
          && index.fields[0]?.attribute === "email",
      );

      if (!hasEmailUniqueIndex) {
        await queryInterface.addIndex("Users", ["email"], {
          unique: true,
          name: "users_email_unique",
        });
        console.log("Added Users.email unique index");
      }
    } catch (error) {
      console.error(
        "Ensure Users columns failed (safe to ignore if table missing):",
        error && error.message ? error.message : error,
      );
    }
  } catch (error) {
    console.error("Seeding prices/areas failed:", error);
  }
});

const port = process.env.PORT || 8888;
const listener = app.listen(port, () => {
  console.log(`Server is running on the port ${listener.address().port}`);
});
