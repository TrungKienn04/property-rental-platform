# 🏠 Web Quản Lý Phòng Trọ 123

Một nền tảng web hiện đại cho phép quản lý, đăng ký, tìm kiếm và quản lý thông tin phòng trọ. Ứng dụng được xây dựng với công nghệ stack hiện đại (React, Redux, Express, MySQL) giúp người dùng dễ dàng kết nối những ai muốn cho thuê và những ai cần tìm phòng trọ.

---

## 📋 Mục Lục

- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
- [Cấu Hình Môi Trường](#cấu-hình-môi-trường)
- [Chạy Dự Án](#chạy-dự-án)
- [Các Script Hữu Ích](#các-script-hữu-ích)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [API Documentation](#api-documentation)
- [Hướng Dẫn Phát Triển](#hướng-dẫn-phát-triển)
- [Xử Lý Sự Cố](#xử-lý-sự-cố)
- [Đóng Góp](#đóng-góp)

---

## 🔧 Yêu Cầu Hệ Thống

Để chạy dự án này, bạn cần cài đặt các phần mềm sau:

| Công Nghệ   | Phiên Bản Tối Thiểu | Mục Đích               |
| ----------- | ------------------- | ---------------------- |
| **Node.js** | 14.0 trở lên        | Runtime JavaScript     |
| **npm**     | 6.0 trở lên         | Quản lý package        |
| **MySQL**   | 5.7 trở lên         | Cơ sở dữ liệu          |
| **Git**     | Tùy chọn            | Quản lý phiên bản code |

### 📥 Tải và Cài Đặt

#### 1. **Cài Đặt Node.js**

- Truy cập: [https://nodejs.org/](https://nodejs.org/)
- Tải phiên bản LTS (Long Term Support)
- Chạy installer và làm theo hướng dẫn

#### 2. **Xác Minh Cài Đặt**

Mở Command Prompt/Terminal và chạy:

```bash
node --version
npm --version
```

#### 3. **Cài Đặt MySQL**

- Truy cập: [https://www.mysql.com/downloads/](https://www.mysql.com/downloads/)
- Tải MySQL Community Server
- Trong quá trình cài đặt, nhớ ghi nhớ:
  - **Port**: 3306 (mặc định)
  - **Username**: root
  - **Password**: (tùy chọn, để trống hoặc đặt mật khẩu)

#### 4. **Xác Minh MySQL**

Sau khi cài đặt, truy cập MySQL Command Line:

```bash
mysql -u root -p
```

Nhập mật khẩu nếu có, nếu không có thì nhấn Enter.

---

## 📁 Cấu Trúc Dự Án

```
fullstack-phong-tro/
│
├── 📂 client/                    # Frontend React
│   ├── 📂 public/                # Static files
│   ├── 📂 src/
│   │   ├── 📂 components/        # Reusable React components
│   │   ├── 📂 containers/        # Page containers
│   │   ├── 📂 services/          # API calls (axios)
│   │   ├── 📂 store/             # Redux store, actions, reducers
│   │   ├── 📂 assets/            # Images, fonts, etc.
│   │   ├── 📂 ultils/            # Helper functions & constants
│   │   ├── App.js                # Main App component
│   │   ├── index.js              # Entry point
│   │   └── index.css             # Global styles
│   ├── 📂 build/                 # Production build output
│   ├── package.json              # Frontend dependencies
│   ├── tailwind.config.js        # Tailwind CSS config
│   └── postcss.config.js         # PostCSS config
│
├── 📂 server/                    # Backend Express
│   ├── 📂 src/
│   │   ├── 📂 config/            # Database config
│   │   ├── 📂 controllers/       # Request handlers
│   │   ├── 📂 routes/            # API routes
│   │   ├── 📂 models/            # Sequelize models
│   │   ├── 📂 middlewares/       # Express middlewares
│   │   ├── 📂 services/          # Business logic
│   │   ├── 📂 migrations/        # Database migrations
│   │   └── 📂 ultis/             # Helper utilities
│   ├── 📂 scripts/               # Database scripts
│   ├── 📂 test/                  # Test files
│   ├── 📂 uploads/               # Uploaded files storage
│   ├── server.js                 # Server entry point
│   ├── package.json              # Backend dependencies
│   └── phongtro123.sql           # Database backup
│
├── 📄 README.md                  # File này - Hướng dẫn toàn bộ dự án
├── 📄 package-lock.json          # Dependency lock file
└── 📄 run-tests.cjs              # Test runner script

```

---

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Clone hoặc Tải Dự Án

#### Sử dụng Git (Khuyên dùng):

```bash
git clone https://github.com/TrungKiennn04/Web_PhongTro.git
cd fullstack-phong-tro-123
```

#### Hoặc Tải ZIP:

1. Truy cập: [GitHub Repository](https://github.com/TrungKiennn04/Web_PhongTro)
2. Nhấn nút **Code** → **Download ZIP**
3. Giải nén tệp đã tải
4. Mở Command Prompt/Terminal tại thư mục được giải nén

### Bước 2: Cài Đặt Dependencies cho Client

```bash
cd client
npm install
```

**Thời gian chờ**: 2-5 phút tùy tốc độ mạng

**Kết quả kỳ vọng**:

```
added XXX packages, and audited XXX packages in Xm Xs
```

### Bước 3: Cài Đặt Dependencies cho Server

```bash
cd ../server
npm install
```

### Bước 4: Tạo Database

1. Mở **MySQL Command Line** hoặc **MySQL Workbench**

2. **Tạo Database mới**:

```sql
CREATE DATABASE phongtro123 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Khẩn MySQL**:

```sql
EXIT
```

### Bước 5: Import Database (Tùy Chọn)

Nếu bạn muốn tải dữ liệu mẫu:

```bash
mysql -u root -p phongtro123 < phongtro123.sql
```

Nhập mật khẩu MySQL nếu có.

---

## ⚙️ Cấu Hình Môi Trường

### Cấu Hình Server

1. Tại thư mục `server/`, kiểm tra file `src/config/config.json`:

```json
{
  "development": {
    "username": "root",
    "password": "",
    "database": "phongtro123",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "logging": false
  }
}
```

**Giải thích cấu hình**:

- `username`: Tên user MySQL (mặc định: root)
- `password`: Mật khẩu MySQL (để trống nếu không có)
- `database`: Tên database
- `host`: Địa chỉ server MySQL (127.0.0.1 = localhost)
- `dialect`: Loại database (mysql)

### Cấu Hình Client (Nếu cần)

1. Kiểm tra file `client/src/axiosConfig.js` để đảm bảo URL API đúng:

```javascript
const API_BASE_URL = "http://localhost:5000/api"; // Địa chỉ backend
```

**Lưu ý**: Port mặc định backend là `5000`. Nếu server chạy trên port khác, cập nhật giá trị này.

---

## ▶️ Chạy Dự Án

### Cách 1: Chạy Backend & Frontend Trên Hai Terminal Riêng (Khuyên dùng cho Development)

#### Terminal 1 - Chạy Backend (Express Server):

```bash
cd server
npm start
```

**Kết quả kỳ vọng**:

```
Server is running on http://localhost:5000
```

#### Terminal 2 - Chạy Frontend (React App):

```bash
cd client
npm start
```

**Kết quả kỳ vọng**:
Trình duyệt sẽ tự động mở: `http://localhost:3000`

### Cách 2: Chạy Cùng Lúc Với Script Tùy Chỉnh (Windows Batch)

Tạo file `start.bat` tại thư mục root:

```batch
@echo off
echo Starting Server...
start cmd /k "cd server && npm start"

timeout /t 3 /nobreak

echo Starting Client...
start cmd /k "cd client && npm start"

echo Both processes started!
```

Sau đó chạy `start.bat` từ File Explorer hoặc Terminal.

### Cách 3: Chạy Cùng Lúc Với Script Tùy Chỉnh (macOS/Linux Bash)

Tạo file `start.sh` tại thư mục root:

```bash
#!/bin/bash

echo "Starting Server..."
cd server && npm start &
SERVER_PID=$!

sleep 3

echo "Starting Client..."
cd ../client && npm start &
CLIENT_PID=$!

echo "Server PID: $SERVER_PID"
echo "Client PID: $CLIENT_PID"
echo "Both processes started!"

# Ngăn script kết thúc
wait
```

Cấp quyền thực thi:

```bash
chmod +x start.sh
```

Chạy script:

```bash
./start.sh
```

---

## 📝 Các Script Hữu Ích

### Client Scripts

```bash
# Chạy development server (mở browser tự động)
npm start

# Build production (tạo thư mục build/)
npm run build

# Chạy unit tests
npm run test

# Chạy custom unit tests
npm run test:unit
```

### Server Scripts

```bash
# Chạy server (với auto-reload khi file thay đổi)
npm start

# Backfill dữ liệu mã tỉnh (province codes)
npm run backfill:province

# Backfill dữ liệu giá/diện tích (price/area codes)
npm run backfill:price-area

# Sửa chữa dữ liệu hình ảnh
npm run repair:images

# Kiểm tra các bộ lọc (smoke test)
npm run smoke:filters

# Chạy unit tests
npm run test
```

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend (Client)

| Công Nghệ                | Phiên Bản | Mục Đích                   |
| ------------------------ | --------- | -------------------------- |
| **React**                | 18.2.0    | Library UI                 |
| **React Router DOM**     | 6.3.0     | Định tuyến (routing)       |
| **Redux**                | 4.2.0     | State management           |
| **Redux Persist**        | 6.0.0     | Lưu state vào localStorage |
| **Axios**                | 0.27.2    | HTTP client                |
| **Tailwind CSS**         | Latest    | Styling utility-first      |
| **React Icons**          | 4.4.0     | Icon library               |
| **Moment.js**            | 2.29.4    | Xử lý thời gian            |
| **SweetAlert2**          | 11.4.29   | Dialog boxes đẹp           |
| **React Loader Spinner** | 5.3.4     | Loading indicators         |

### Backend (Server)

| Công Nghệ     | Phiên Bản | Mục Đích              |
| ------------- | --------- | --------------------- |
| **Express**   | 4.18.1    | Web framework         |
| **Sequelize** | 6.21.3    | ORM cho MySQL         |
| **MySQL2**    | 2.3.3     | MySQL driver          |
| **JWT**       | 8.5.1     | Authentication tokens |
| **Bcryptjs**  | 2.4.3     | Password hashing      |
| **Multer**    | 2.1.1     | File upload handler   |
| **CORS**      | 2.8.5     | Cross-origin requests |
| **Dotenv**    | 16.0.1    | Environment variables |
| **UUID**      | 8.3.2     | Unique ID generation  |
| **Nodemon**   | 2.0.19    | Auto-restart server   |
| **Babel**     | 7.18.10   | JavaScript transpiler |

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Các Endpoint Chính

#### 🔐 Authentication (Xác Thực)

```
POST   /auth/register          - Đăng ký tài khoản mới
POST   /auth/login             - Đăng nhập
POST   /auth/logout            - Đăng xuất
POST   /auth/refresh-token     - Làm mới token
GET    /auth/verify            - Xác minh token hiện tại
```

#### 🏠 Posts (Bài Đăng)

```
GET    /posts                  - Lấy danh sách bài đăng
GET    /posts/:id              - Lấy chi tiết bài đăng
POST   /posts                  - Tạo bài đăng mới (yêu cầu login)
PUT    /posts/:id              - Cập nhật bài đăng (yêu cầu login)
DELETE /posts/:id              - Xóa bài đăng (yêu cầu login)
GET    /posts/category/:code   - Lấy bài đăng theo danh mục
```

#### 👤 Users (Người Dùng)

```
GET    /users/:id              - Lấy thông tin người dùng
PUT    /users/:id              - Cập nhật thông tin người dùng
GET    /users/:id/posts        - Lấy bài đăng của người dùng
PUT    /users/:id/avatar       - Cập nhật avatar
```

#### 💾 Saved Posts (Bài Đăng Yêu Thích)

```
GET    /saved-posts            - Lấy danh sách bài đăng yêu thích
POST   /saved-posts/:postId    - Thêm bài đăng vào yêu thích
DELETE /saved-posts/:postId    - Xóa bài đăng khỏi yêu thích
```

#### 🗺️ Location (Địa Điểm)

```
GET    /locations/provinces    - Lấy danh sách tỉnh/thành phố
GET    /locations/districts    - Lấy danh sách quận/huyện
GET    /locations/wards        - Lấy danh sách phường/xã
```

#### 📂 Categories (Danh Mục)

```
GET    /categories             - Lấy danh sách danh mục
GET    /categories/:code       - Lấy chi tiết danh mục
```

**Lưu ý**: API tầm này yêu cầu header `Authorization: Bearer <token>` nếu có xác thực.

---

## 👨‍💻 Hướng Dẫn Phát Triển

### Cấu Trúc Thư Mục Chi Tiết

#### Frontend Structure

```
src/
├── components/           # Các component tái sử dụng
│   ├── Button.js        # Nút bấm chung
│   ├── Modal.js         # Modal dialog
│   ├── Item.js          # Item bài đăng
│   ├── ItemSidebar.js   # Sidebar item
│   ├── Loading.js       # Loading spinner
│   └── ...
├── containers/          # Page-level components
│   ├── Public/          # Public pages
│   │   ├── Home.js
│   │   ├── List.js
│   │   └── Detail.js
│   └── System/          # Admin pages
│       ├── Dashboard.js
│       ├── ManagePost.js
│       └── ManageUser.js
├── services/            # API calls
│   ├── post.js         # Post API calls
│   ├── auth.js         # Auth API calls
│   ├── user.js         # User API calls
│   └── ...
├── store/              # Redux store
│   ├── actions/        # Action creators
│   ├── reducers/       # Reducers
│   └── index.js        # Store config
├── ultils/             # Utilities
│   ├── constant.js     # Constants & configs
│   ├── dataContact.js  # Contact data
│   ├── menuManage.js   # Menu config
│   └── Common/         # Common helpers
├── assets/             # Static files
│   ├── images/
│   └── fonts/
└── App.js              # Main App component
```

#### Backend Structure

```
src/
├── config/
│   ├── config.json          # Database config
│   └── connectDatabase.js   # DB connection
├── controllers/              # Request handlers
│   ├── post.js
│   ├── user.js
│   ├── auth.js
│   └── ...
├── routes/                   # API routes
│   ├── post.js
│   ├── user.js
│   ├── auth.js
│   └── ...
├── models/                   # Sequelize models
│   ├── Post.js
│   ├── User.js
│   └── ...
├── middlewares/              # Express middlewares
│   ├── authAccess.js
│   └── ...
├── services/                 # Business logic
│   ├── postService.js
│   ├── userService.js
│   └── ...
├── migrations/               # Database migrations
├── ultis/                    # Helper utilities
│   └── constant.js
└── scripts/                  # Database scripts
```

### Git Workflow (Khuyên dùng)

```bash
# Tạo nhánh mới cho feature
git checkout -b feature/feature-name

# Sau khi hoàn thành, commit code
git add .
git commit -m "feat: mô tả thay đổi"

# Push lên GitHub
git push origin feature/feature-name

# Tạo Pull Request trên GitHub
```

### Các Chuẩn Code

- **Naming Convention**: camelCase cho variables & functions, PascalCase cho components
- **Indentation**: 2 spaces
- **Comments**: Tiếng Anh hoặc Tiếng Việt rõ ràng
- **Console logs**: Xóa trước khi push lên production

---

## 🔧 Xử Lý Sự Cố

### ❌ Lỗi: "npm command not found"

**Nguyên nhân**: Node.js không được cài đặt hoặc thêm vào PATH

**Giải pháp**:

1. Tải lại Node.js từ [nodejs.org](https://nodejs.org/)
2. Trong installer, chọn "Add to PATH"
3. Khởi động lại Command Prompt
4. Kiểm tra: `node --version`

---

### ❌ Lỗi: "Cannot find module 'react'"

**Nguyên nhân**: Dependencies chưa được cài đặt

**Giải pháp**:

```bash
cd client
npm install
```

---

### ❌ Lỗi: "Error: connect ECONNREFUSED 127.0.0.1:3306"

**Nguyên nhân**: MySQL server không chạy hoặc port không đúng

**Giải pháp**:

1. **Bắt đầu MySQL**:
   - **Windows**: Mở Services (services.msc) → Tìm MySQL → Start
   - **macOS**: `brew services start mysql@5.7`
   - **Linux**: `sudo systemctl start mysql`

2. Kiểm tra port: `mysql -u root -p`

3. Nếu port khác 3306, cập nhật trong `server/src/config/config.json`

---

### ❌ Lỗi: "Port 3000 is already in use"

**Nguyên nhân**: Cổng 3000 đang bị một ứng dụng khác sử dụng

**Giải pháp**:

#### Windows:

```bash
# Tìm process sử dụng port 3000
netstat -ano | findstr :3000

# Kết thúc process (thay PID bằng ID tìm được)
taskkill /PID <PID> /F
```

#### macOS/Linux:

```bash
# Tìm process sử dụng port 3000
lsof -i :3000

# Kết thúc process (thay PID bằng ID tìm được)
kill -9 <PID>
```

Hoặc chỉ cần chạy server trên port khác:

```bash
PORT=3001 npm start
```

---

### ❌ Lỗi: "Port 5000 is already in use"

**Giải pháp tương tự**: Thay cổng 5000 bằng cổng khác, cập nhật `client/src/axiosConfig.js`

---

### ❌ Lỗi: "Error: Invalid token in config.json"

**Nguyên nhân**: File config.json có lỗi cú pháp JSON

**Giải pháp**:

1. Mở `server/src/config/config.json`
2. Kiểm tra cú pháp JSON (dấu ngoặc, dấu phẩy)
3. Sử dụng [JSONLint](https://jsonlint.com/) để kiểm tra

---

### ✅ Kiểm Tra Sở Cứu Cấu Hình

```bash
# 1. Kiểm tra Node.js
node --version          # Nên >= 14.0.0
npm --version           # Nên >= 6.0.0

# 2. Kiểm tra MySQL
mysql -u root -p -e "SELECT VERSION();"

# 3. Kiểm tra database tồn tại
mysql -u root -p -e "SHOW DATABASES;" | grep phongtro123

# 4. Kiểm tra port
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :3000
lsof -i :5000
```

---

## 📖 Tài Liệu Liên Quan

- **React Documentation**: [react.dev](https://react.dev)
- **Redux Documentation**: [redux.js.org](https://redux.js.org)
- **Express.js Documentation**: [expressjs.com](https://expressjs.com)
- **Sequelize Documentation**: [sequelize.org](https://sequelize.org)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com)
- **MySQL Documentation**: [dev.mysql.com](https://dev.mysql.com)

---

## 👥 Đóng Góp

Chúng tôi chào đón các đóng góp! Để đóng góp:

1. Fork repository
2. Tạo branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. **Kiểm tra**: Xem phần "[Xử Lý Sự Cố](#xử-lý-sự-cố)"
2. **Issues**: Mở issue trên [GitHub](https://github.com/TrungKiennn04/Web_PhongTro/issues)
3. **Email**: Liên hệ qua email (nếu được cung cấp)

---

## 📄 License

Dự án này được cấp phép dưới [ISC License](LICENSE)

---

## 🎉 Lưu Ý Quan Trọng

- **Bảo Mật**: Không commit file `.env` hoặc `config.json` có thông tin nhạy cảm
- **Database**: Luôn backup database trước khi migration
- **Production**: Trước khi deploy, đặt `NODE_ENV=production` và build React
- **API Keys**: Sử dụng environment variables cho các keys nhạy cảm

---

**Cập nhật lần cuối**: Tháng 5, 2026  
**Phiên bản**: 1.0.0

Cảm ơn bạn đã sử dụng Web Quản Lý Phòng Trọ 123! 🚀
