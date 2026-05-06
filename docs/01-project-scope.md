# 01 — Project Scope & Overview

> **Scope:** This document defines the primary objectives, business context, feature scope, user roles, overall technical architecture, and documentation layout for the **Rent Management and Search Platform (Tro Xin)**. It serves as an entry-level technical overview for prospective employers, technical recruiters, project evaluation boards, and onboarding developers.

---

## 1. Executive Summary

In a fragmented real estate rental market, connecting **prospective tenants** (students, young professionals) with **property owners/landlords** often encounters issues regarding information transparency, inaccurate price/area filtering, and inefficient post management.

**Tro Xin** was developed to address these core challenges via a modern Full-stack Web Application that provides:

- **Prospective Tenants:** Real-time search and filter capabilities by geographic region (provinces), price ranges, and unit areas, along with a personal bookmarking system for favorite listings.

- **Property Owners / Landlords:** An intuitive interface to create, update, hide, or delete rental listings throughout their operational lifecycle.

- **System Administrators (Admins):** Content moderation pipelines, user management capabilities, and system-wide policy enforcement tools.

---

## 2. System Boundaries (In-Scope vs. Out-of-Scope)

### 2.1. In-Scope

- **Authentication & Authorization:** Secure registration and login workflows using bcrypt password hashing and JSON Web Tokens (JWT), enforced by role-based access control.

- **Post Lifecycle Management:** Full CRUD operations for listings, supporting image uploads via Cloudinary or local multipart handling via Multer.

- **Intelligent Search & Filtering:** Filtering across categories (`Categories`), price ranges (`Prices`), area bounds (`Areas`), and administrative provinces (`Provinces`) supported by numerical normalization (`priceNumber`, `areaNumber`).

- **User Engagement:** Saved posts mechanism (`SavedPosts`), user profile management, and secure password updating workflows.

- **Administrative Moderation:** Multi-state approval workflows (`pending` $\rightarrow$ `published` / `rejected`), content suppression, account blocking (`blocked`), and post restoration.

### 2.2. Out-of-Scope (Future Enhancements)

- Integration with third-party payment gateways (e.g., VNPAY, MoMo) for VIP listing promotions.
- Real-time direct messaging (via WebSockets/Socket.io) between landlords and tenants.
- Digital lease agreement signatures and post-occupancy rating/review systems.

---

## 3. Core Capabilities by Subsystem

| Subsystem             | Key Feature              | Technical Description                                                                                                       |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **1. Public / Guest** | Browse & Search Listings | Displays public rental listings (`status = published`) with pagination, keyword search, and fast multi-parameter filtering. |

|
| | View Listing Details | Renders detailed property metadata, structured image galleries (parsed JSON array), contact channels (Zalo, Phone, Facebook), and location information.

|
| **2. Authenticated User** | Auth Workflows | Secure user authentication with state persistence via `localStorage`/`sessionStorage`.

|
| | Listing Management | Create new posts, edit metadata, soft-delete, or temporarily hide owned listings.

|
| | Account Management | Update user profile details (Name, Phone, Zalo) and perform secure password changes.

|
| | Saved Listings | Bookmark or unbookmark favorite posts into a personalized collection (`SavedPosts`).

|
| **3. Administrator** | Content Moderation | Review pending posts (`pending`), approve (`published`), or reject (`rejected`) with audit reasons.

|
| | User & System Control | Ban or unban user accounts (`active` / `blocked`) on policy violations.

|

---

## 4. User Roles & Security Model

The system enforces granular access control through dedicated server-side Express middleware pipelines (`verifyToken`, `loadCurrentUser`, `requireRole`, `requirePostOwner`):

1. **Guest (Unauthenticated User):** Granted read-only access to public endpoints (browsing listings, viewing property details, fetching lookup categories).
2. **Standard User (Tenant / Landlord):** Authenticated account capable of posting listings, managing owned properties, saving favorite posts, and updating profile settings.

3. **Administrator (Admin):** Privileged authority over content moderation, status transition workflows, and user account enforcement.

---

## 5. Technology Stack Overview

The application follows a decoupled **Client-Server Architecture (RESTful API)** utilizing standard industry frameworks:

- **Frontend (Client):**
- Built on **ReactJS (v18)** with **React Router DOM** for client-side routing.

- Global application state managed via **Redux** and persisted with **Redux Persist**.

- Responsive, utility-first styling implemented using **Tailwind CSS**.

- HTTP communication handled via **Axios** featuring interceptors for automatic JWT injection.

- **Backend (Server):**
- Built on **Node.js** utilizing the **Express.js** web framework.

- Relational Database Management handled via **Sequelize ORM** with transaction support for atomic operations.

- Stateless security using **JSON Web Tokens (JWT)** and **Bcrypt.js** password hashing.

- **Database & Môi trường:**
- **MySQL** database running on a local XAMPP environment.

- Managed via phpMyAdmin / DBeaver database tools.

---

## 6. Technical Documentation Structure (`docs/`)

To ensure architectural transparency and seamless knowledge transfer, the system documentation suite is organized into **05 standalone documents**, each addressing a distinct technical aspect:

-text
docs/
├── 01-project-scope.md # (This file) Executive summary, scope, features, tech stack, and role definitions.
├── 02-roles-and-permissions.md # Role-based access control matrix and middleware security layer specification.
├── 03-workflow-and-sla.md # End-to-End sequence workflows (Auth, Listing Creation, Moderation, Saved Posts).
├── 04-data-model.md # Database ERD schema design, logical associations, numerical mappings, and integrity constraints.
└── 05-api-specification.md # Comprehensive RESTful API endpoint specification (Auth, Posts, Users, Saved-Posts, Location).
