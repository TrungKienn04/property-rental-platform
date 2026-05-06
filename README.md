# Tro Xin — Full-Stack Rental Platform & Property Management System

## Overview and Introduction

Tro Xin is a modern, full-stack web platform built to connect individuals seeking rental housing with property owners and landlords. The system provides a reliable digital marketplace that streamlines searching, filtering, posting, and managing rental properties. Designed with a robust separation of concerns, the platform features a responsive React-based client interface, an Express.js backend API server, and a structured MySQL database managed via Sequelize ORM.

To ensure full transparency and maintainability, the project includes an exhaustive technical documentation suite located in the `docs/` directory:

- `docs/01-project-scope.md`: Executive summary, feature boundaries, tech stack, and role definitions.
- `docs/02-roles-and-permissions.md`: RBAC matrix, user states, and Express middleware security pipeline.
- `docs/03-workflow-and-sla.md`: End-to-End sequence workflows (Auth, Listing Creation, Moderation, Saved Posts).
- `docs/04-data-model.md`: MySQL ERD schema design, table definitions, and status transition logic.
- `docs/05-api-specification.md`: Comprehensive RESTful API endpoint specification mapped to router implementations.

---

## Technical Stack and Architecture

The application follows a decoupled Client-Server architecture communicating via RESTful JSON APIs.

### Frontend (Client Application)

- Core Library: ReactJS (v18) with React Router DOM (v6) for client-side routing.
- State Management: Redux combined with Redux Persist for local session persistence.
- HTTP Client: Axios configured with request interceptors to automatically inject JWT Bearer tokens.
- Styling & UI: Tailwind CSS utility-first framework, React Icons, SweetAlert2 dialogs, and React Loader Spinner.

### Backend (Server Application)

- Runtime & Framework: Node.js with Express.js web framework.
- Database & ORM: MySQL relational database managed via Sequelize ORM (supporting atomic transactions).
- Security & Authentication: Stateless JSON Web Tokens (JWT) and Bcrypt.js password hashing.
- File Uploads: Multer middleware for handling local multipart file uploads, with optional integration for cloud storage (Cloudinary CDN).

---

## Complete Project Directory Structure

```text
Ma_nguon_chuong_trinh/
├── client/                      # Frontend React application
│   ├── public/                  # Static public assets
│   ├── src/
│   │   ├── components/          # Reusable UI components (buttons, modals, cards)
│   │   ├── containers/          # Page-level components (Public pages & System dashboards)
│   │   ├── services/            # Axios API service wrappers
│   │   ├── store/               # Redux store configuration, actions, and reducers
│   │   ├── utils/               # Helper constants and formatting utilities
│   │   ├── App.js               # Root application component and routing
│   │   └── index.js             # React application entry point
│   ├── tailwind.config.js       # Tailwind CSS styling configuration
│   └── package.json             # Frontend dependencies and scripts
├── docs/                        # Complete technical documentation suite
│   ├── 01-project-scope.md
│   ├── 02-roles-and-permissions.md
│   ├── 03-workflow-and-sla.md
│   ├── 04-data-model.md
│   └── 05-api-specification.md
├── server/                      # Backend Express application
│   ├── src/
│   │   ├── config/              # Database connection and environment setups
│   │   ├── controllers/         # Request handlers for business logic
│   │   ├── middlewares/         # JWT verification, active user, and role enforcement
│   │   ├── migrations/          # Sequelize database schema migrations
│   │   ├── models/              # Sequelize data models (User, Post, Attribute, Image, Overview)
│   │   ├── routes/              # Express API route declarations
│   │   ├── services/            # Core business and ORM database logic
│   │   └── utils/               # Encryption, token, and string normalization helpers
│   ├── uploads/                 # Local directory for uploaded property images
│   ├── .env.example             # Template for server environment variables
│   ├── package.json             # Backend dependencies and scripts
│   └── server.js                # Express application entry point
└── README.md                    # System master overview (This file)

```

---

## Step-by-Step Installation and Setup Guide

Follow these sequential steps to set up and run the application on your local machine.

### Step 1: System Prerequisites

Ensure you have the following software installed on your system:

1. Node.js (Version 16.x or higher) and npm.
2. XAMPP (or a standalone MySQL Server instance) running on default port `3306`.
3. Git version control.

### Step 2: Clone Repository and Install Dependencies

1. Clone the project repository:

```bash
git clone <your-repository-url>
cd Ma_nguon_chuong_trinh

```

2. Install Backend dependencies:

```bash
cd server
npm install
cd ..

```

3. Install Frontend dependencies:

```bash
cd client
npm install
cd ..

```

### Step 3: Create and Populate the Database

1. Open your MySQL client (such as phpMyAdmin, MySQL Command Line Client, or MySQL Workbench) and create the target database:

```sql
CREATE DATABASE IF NOT EXISTS phongtro123 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

```

2. Import the provided sample database backup (`server/phongtro123.sql`) into the newly created database. You can do this via phpMyAdmin import tab or using the MySQL command line:

```bash
mysql -u root -p phongtro123 < server/phongtro123.sql

```

### Step 4: Configure Environment Variables

1. Navigate to the `server/` directory.
2. Duplicate `.env.example` and rename it to `.env`:

```bash
cp server/.env.example server/.env

```

3. Update the values in `server/.env` to match your local setup:

```env
PORT=5000
DB_NAME=phongtro123
DB_USERNAME=root
DB_PASSWORD=
DB_HOST=localhost
DB_DIALECT=mysql
SECRET_KEY=your_jwt_secret_key_here
CLIENT_URL=http://localhost:3000

```

### Step 5: Launch the Application

1. Start the Backend Server (from the `server/` directory):

```bash
cd server
npm start

```

The server will start listening on `http://localhost:5000`.

2. Start the Frontend Client (from the `client/` directory in a separate terminal window):

```bash
cd client
npm start

```

The client application will automatically open in your browser at `http://localhost:3000`.

---

## User Accounts and Security Guidelines

To maintain system security and data integrity during evaluation:

1. **User Registration:** You can register a new standard user account directly through the registration form at `http://localhost:3000/register`.
2. **Role Provisioning:** New accounts default to standard user access (`role = 'user'`). To test administrative capabilities (such as post moderation and user management), update the `role` field for your specific account record in the MySQL `Users` table to `'admin'`.
3. **Database Backup Note:** Before performing administrative moderation or bulk testing operations, ensure a copy of `server/phongtro123.sql` is preserved to restore original test state if necessary.
