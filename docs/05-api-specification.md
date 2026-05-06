# 05 — RESTful API Specification

> **Scope:** This document specifies all active RESTful API endpoints configured within the `server/src/routes/` directory of the **Tro Xin** platform. It serves as a reference for frontend integration, system testing, and project hand-off.

---

## 1. General Conventions & Communication

- **Base URL:** `http://localhost:5000/api/v1` (depending on the server's root router setup).
- **Standard Response Structure:**
- Success: `{ "err": 0, "msg": "...", "response": <data>, "token": "<JWT>" (if applicable) }`
- Failure: `{ "err": <non-zero>, "msg": "Detailed error description" }`

- **Authentication Standard:** Protected endpoints require the following header:
  `Authorization: Bearer <token>` (where `<token>` is the JWT issued upon login).

---

## 2. Authentication Endpoints (`/auth`)

| Method | Endpoint         | Description                                                                       | Auth Required |
| ------ | ---------------- | --------------------------------------------------------------------------------- | ------------- |
| `POST` | `/auth/register` | Register a new user account, perform duplicate validation, and hash the password. | No            |
| `POST` | `/auth/login`    | Authenticate system access and return a JWT token.                                | No            |

---

## 3. Posts & Public Discovery Endpoints (`/post` or `/posts`)

| Method   | Endpoint             | Description                                                                                                                          | Auth Required                          |
| -------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `GET`    | `/post/all`          | Fetch a list of all public rental listings.                                                                                          | No                                     |
| `GET`    | `/post/limit`        | Fetch paginated listings with query parameter filters (price, area, province, category).                                             | No                                     |
| `GET`    | `/post/new-post`     | Fetch the latest rental listings.                                                                                                    | No                                     |
| `GET`    | `/post/:id`          | Fetch detailed information for a specific listing (supports `attachUserIfPresent` to capture viewer context if a token is provided). | No (Optional)                          |
| `GET`    | `/post/manage/all`   | Fetch listings created by the current user (Legacy route).                                                                           | Yes (`verifyToken`, `loadCurrentUser`) |
| `POST`   | `/post/upload-image` | Upload a single listing image (Legacy route).                                                                                        | Yes (`active user`)                    |
| `POST`   | `/post/create-new`   | Create a new listing (Legacy route).                                                                                                 | Yes (`active user`)                    |
| `PUT`    | `/post/:id`          | Update an existing listing (Legacy route; verifies ownership via `loadPost` + `requirePostOwner`).                                   | Yes (`owner`)                          |
| `DELETE` | `/post/:id`          | Delete a listing (Legacy route; verifies ownership).                                                                                 | Yes (`owner`)                          |

---

## 4. User & Profile Management Endpoints (`/user`)

_Note: All endpoints within this group automatically enforce `verifyToken` and `loadCurrentUser` middleware at the router level._

| Method   | Endpoint                          | Description                                                         | Auth Required       |
| -------- | --------------------------------- | ------------------------------------------------------------------- | ------------------- |
| `GET`    | `/user/get-current` or `/user/me` | Fetch the current user's profile details (`currentData`).           | Yes                 |
| `PUT`    | `/user/profile` or `/user/me`     | Update personal profile details or change credentials.              | Yes                 |
| `GET`    | `/user/posts`                     | Fetch listings created by the currently authenticated user.         | Yes (`active user`) |
| `GET`    | `/user/saved-posts/ids`           | Fetch an array of IDs corresponding to the user's bookmarked posts. | Yes (`active user`) |
| `GET`    | `/user/saved-posts`               | Fetch detailed records of the user's bookmarked posts.              | Yes (`active user`) |
| `POST`   | `/user/saved-posts/:postId`       | Toggle bookmark status (save/unsave) for a specific listing.        | Yes (`active user`) |
| `POST`   | `/user/posts`                     | Create a new listing (Canonical write route).                       | Yes (`active user`) |
| `POST`   | `/user/posts/upload-image`        | Upload an image for the user's listing.                             | Yes (`active user`) |
| `GET`    | `/user/posts/:id`                 | Fetch a personal listing by ID (verifies ownership).                | Yes (`owner`)       |
| `PUT`    | `/user/posts/:id`                 | Update a personal listing (verifies ownership).                     | Yes (`owner`)       |
| `DELETE` | `/user/posts/:id`                 | Delete a personal listing (verifies ownership).                     | Yes (`owner`)       |

---

## 5. Categories & Location Lookups (Categories, Prices, Areas, Provinces, Insert)

| Method | Endpoint    | Description                                                   | Auth Required |
| ------ | ----------- | ------------------------------------------------------------- | ------------- |
| `GET`  | `/category` | Fetch all rental category types.                              | No            |
| `GET`  | `/price`    | Fetch predefined price filter ranges.                         | No            |
| `GET`  | `/area`     | Fetch predefined area filter ranges.                          | No            |
| `GET`  | `/province` | Fetch administrative provinces/cities for filtering.          | No            |
| `POST` | `/insert`   | Run initial database seeding scripts for mock data injection. | No            |

---

## 6. Administrative Moderation Endpoints (`/admin`)

_Required access privilege: `verifyToken` $\rightarrow$ `loadCurrentUser` $\rightarrow$ `requireRole('admin')`._

| Method   | Endpoint                  | Description                                                                                                                | Auth Required |
| -------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `PATCH`  | `/admin/posts/:id/status` | Approve or update a listing's moderation status (`published`, `rejected`, `hidden`, `deleted`) along with an audit reason. | Yes (`admin`) |
| `PATCH`  | `/admin/users/:id/status` | Ban or unban a user account (`active` / `blocked`).                                                                        | Yes (`admin`) |
| `DELETE` | `/admin/posts/:id/purge`  | Permanently purge a listing from the system (cleans up database records and local asset files).                            | Yes (`admin`) |
