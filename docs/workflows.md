# Luồng E2E - Frontend → Backend → Database → Third‑party

Tài liệu này mô tả chi tiết cách dữ liệu và các thao tác di chuyển xuyên suốt hệ thống: từ giao diện (React) → services (axios) → API (Express controllers) → services nghiệp vụ → Sequelize models → MySQL. Đồng thời mô tả các tích hợp bên thứ ba (Cloudinary/local uploads), xác thực (JWT), và lưu token trên client.

---

**1. Tổng quan chuẩn giao tiếp**

- Response format (server): object chuẩn thường có các trường: `err` (0 = success), `msg`, `response` (payload), `token` (tuỳ trường hợp).
- Auth: `JWT` tạo bởi `jsonwebtoken` (secret = `process.env.SECRET_KEY`).
- Axios baseURL trên client: `process.env.REACT_APP_SERVER_URL` (xem `client/src/axiosConfig.js`).
- Token storage: `APP_TOKEN` trong `localStorage` (khi remember) hoặc `sessionStorage` (khi not remember). Key lưu thêm `APP_TOKEN_STORAGE` để biết chế độ.
- Axios interceptor: đọc token từ storage và đặt header `Authorization: Bearer <token>` cho request (xem `client/src/axiosConfig.js`).

---

**2. Các env/config quan trọng**

- `REACT_APP_SERVER_URL` — địa chỉ API server cho client.
- `SECRET_KEY` — secret dùng tạo/verify JWT.
- `REACT_APP_CLOUD_NAME`, `REACT_APP_UPLOAD_ASSETS_NAME` — nếu có, client sẽ upload trực tiếp lên Cloudinary.
- DB env (thường trong `config/config.json` hoặc env vars) — hostname, username, password, database.

---

**3. Luồng: Đăng nhập (Login / Register)**

Sequence (chi tiết):

1. UI: `Login` component thu dữ liệu → validate → gọi action `actions.login` / `actions.register` (`client/src/containers/Public/Login.js`).
2. Action: `client/src/store/actions/auth.js` gọi `apiLogin` / `apiRegister` (`client/src/services/auth.js`).
3. HTTP: `POST /api/v1/auth/login` or `/api/v1/auth/register` tới server.
4. Server route: `server/src/routes/auth.js` → controller `server/src/controllers/auth.js` → service `server/src/services/auth.js`.
   - Server validate dữ liệu, kiểm tra trùng (phone/email), hash password (`bcryptjs`) (register), hoặc so khớp (`bcrypt.compare`) (login).
   - Nếu thành công: trả `token` (JWT chứa `{ id, role }`).
5. Client nhận response: nếu `err === 0` thì `handleAuthSuccess` lưu token vào storage (`localStorage` / `sessionStorage`) và gọi `apiGetCurrent`.
6. `GET /api/v1/user/me` tới server, middleware `verifyToken` đọc token (header `Authorization`) → `loadCurrentUser` truy vấn Users table → trả `currentData`.
7. Frontend dispatch `GET_CURRENT` vào Redux store, UI cập nhật (role, profile).

---

**4. Luồng: Tạo bài đăng (Upload ảnh → Create post)**

A. Upload ảnh (2 phương án):

- Nếu có Cloudinary config (`REACT_APP_CLOUD_NAME` + `REACT_APP_UPLOAD_ASSETS_NAME`):
  1. Client gọi `apiUploadImages` → POST trực tiếp tới Cloudinary API endpoint. Cloudinary trả về `secure_url`.
  2. Client lấy `secure_url` và chèn vào payload create post.
- Nếu không có Cloudinary:
  1. Client gửi `multipart/form-data` tới server endpoint `POST /api/v1/user/posts/upload-image` (xem `client/src/services/post.js` và `server/src/routes/user.js`).
  2. Server middleware `multer` lưu file vào `uploads/posts/`, server trả `secure_url` trỏ đến `http(s)://<host>/uploads/posts/<filename>`.

B. Submit post:

1. UI form (`SystemPostForm` / `CreatePost` tại `client/src/containers/System/CreatePost.js`) validate form, gọi `apiCreateNewPost`.
2. `POST /api/v1/user/posts` (client) → server route `server/src/routes/user.js` (middleware: `verifyToken`, `loadCurrentUser`, `requireActiveUser`).
3. Controller `user.createMyPost` -> service `post.createNewPostService`:
   - Bắt đầu transaction Sequelize.
   - Tạo IDs: `postId`, `attributesId`, `imagesId`, `overviewId`.
   - Gọi `buildPostWritePayload` để chuẩn hóa ảnh, mã giá/diện tích, provinceCode.
   - Tạo `Post` record (status mặc định `pending`), `Attribute`, `Image`, `Overview` liên quan.
   - Commit transaction.
4. Server trả `{ err: 0, msg: 'OK' }` (hoặc message lỗi nếu fail).
5. Client nhận, gọi lại actions để refresh danh sách bài: `getPosts`, `getNewPosts`, `getPostsLimit`.

DB tables ảnh hưởng: `Posts`, `Attributes`, `Images`, `Overview`, có các foreign keys (ids lưu trong Post).

---

**5. Luồng: Chỉnh sửa / Xóa của user**

- Update:
  1. UI (`ManagePosts` / edit form) gửi `PUT /api/v1/user/posts/:id` (apiUpdatePost).
  2. Middleware: `verifyToken`, `loadCurrentUser`, `requireActiveUser`, `loadPost`, `requirePostOwner` đảm bảo chỉ owner mới edit.
  3. Controller `user.updateMyPost` -> service `post.updatePostService` dùng transaction -> update Post + Attribute + Image + Overview (ensureRelatedRecord).
- Delete (soft or hard):
  - User delete route (`DELETE /api/v1/user/posts/:id`) gọi `deletePostService` (loại bỏ bản ghi và related records trong transaction). Admin có thể force-delete qua admin endpoint khi status = deleted.

---

**6. Luồng: Admin moderation (Duyệt bài)**

1. Admin UI (ManagePosts with admin role) chọn action (approve/reject/hide/unhide/restore/delete).
2. Client gọi `PATCH /api/v1/admin/posts/:id/status` (apiUpdateAdminPostStatus).
3. Server route `server/src/routes/admin.js` đã dùng middleware `verifyToken` + `loadCurrentUser` + `requireRole('admin')`.
4. Controller `admin.updatePostStatus` -> service `post.updatePostStatusService` áp dụng workflow rules (`canTransitionPostStatus`), cập nhật `status`, `deletedFromStatus`, `moderatedBy`, `moderatedAt`, `moderationReason`.
5. Client refresh danh sách và hiển thị thông báo kết quả.

---

**7. Luồng: Lưu / Bỏ lưu bài (SavedPosts)**

- Client gọi `POST /api/v1/user/saved-posts/:postId` (`apiToggleSavedPost`).
- Server `user.toggleSavedPost` -> `savedPost` service thao tác bảng `SavedPosts` (unique index `userId, postId`) để toggle insert/delete.

---

**8. Luồng: Cập nhật hồ sơ & đổi mật khẩu**

- UI: `EditProfile` (đã tách hai handler):
  - `handleSaveContact` gửi partial payload `{ name, phone, zalo, email }` tới `PUT /api/v1/user/me`.
  - `handleChangePassword` gửi `{ currentPassword, newPassword }` tới `PUT /api/v1/user/me`.
- Server `user.updateCurrent` -> service `updateCurrentUser` kiểm tra:
  - Validate name/phone/email.
  - Nếu `newPassword` có giá trị: kiểm tra `currentPassword` và so sánh bằng `bcrypt.compareSync`, sau đó hash mật khẩu mới.
  - Cập nhật các trường và trả `token` mới (để đồng bộ role/claims nếu có) + `response` user object.
- Client: nếu server trả token mới, persist (overwrite storage) qua `persistRefreshedToken` và cập nhật Redux state.

---

**9. Middleware chain (đi từ request đến handler)**

- Public read endpoints (ví dụ `GET /api/v1/post/all`): `post.getPosts` (không cần token).
- Protected user writes (ví dụ `POST /api/v1/user/posts`): `verifyToken` → `loadCurrentUser` → `requireActiveUser` → controller.
- Owner check (edit/delete own post): `loadPost` → `requirePostOwner`.
- Admin-only endpoints: `verifyToken` → `loadCurrentUser` → `requireRole('admin')`.

Các file tham chiếu (quan trọng):

- Frontend auth flow: [client/src/containers/Public/Login.js](client/src/containers/Public/Login.js#L1-L400)
- Axios config + interceptor: [client/src/axiosConfig.js](client/src/axiosConfig.js#L1-L200)
- Post services: [client/src/services/post.js](client/src/services/post.js#L1-L400)
- User services: [client/src/services/user.js](client/src/services/user.js#L1-L200)
- Server routes: [server/src/routes/auth.js](server/src/routes/auth.js#L1-L100), [server/src/routes/user.js](server/src/routes/user.js#L1-L200), [server/src/routes/admin.js](server/src/routes/admin.js#L1-L200), [server/src/routes/post.js](server/src/routes/post.js#L1-L200)
- Core services: [server/src/services/auth.js](server/src/services/auth.js#L1-L400), [server/src/services/post.js](server/src/services/post.js#L1-L1200), [server/src/services/user.js](server/src/services/user.js#L1-L400)
- Middlewares: [server/src/middlewares/verifyToken.js](server/src/middlewares/verifyToken.js#L1-L200), [server/src/middlewares/authAccess.js](server/src/middlewares/authAccess.js#L1-L200)

---

**10. Ví dụ request/response (mẫu)**

- Login (client → server):

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "identifier": "0912345678", "password": "secret123" }
```

Response successful:

```json
{ "err": 0, "msg": "Dang nhap thanh cong.", "token": "<JWT>" }
```

- Create post (client → server) — payload tóm tắt:

```json
{
  "title": "Cho thue phong tro...",'categoryCode': 'pt',
  'address': '...',
  'images': ['https://.../img.jpg'],
  'priceNumber': 2500000,
  'areaNumber': 20,
  ...
}
```

Response:

```json
{ "err": 0, "msg": "OK" }
```

---

**11. Lưu file ảnh & phục hồi (hosting / CDN)**

- Server hiện lưu local: `uploads/posts/` và expose static route `app.use('/uploads', express.static(...))` (xem `server/server.js`).
- Khi scale: đề xuất upload vào S3/Cloud Storage hoặc Cloudinary + serve qua CDN để giảm tải I/O, tăng tốc tải ảnh và bảo mật quyền truy cập.

---

**12. Ghi chú về transaction & consistency**

- Các thao tác viết phức tạp (create post, update post, delete post) đều dùng Sequelize transaction để đảm bảo atomicity giữa `Posts`, `Attributes`, `Images`, `Overview`.
- File assets cục bộ: nếu force-delete cần xóa file vật lý (`removeLocalPostAssets`) sau commit.

---

**13. Khả năng mở rộng & tích hợp bên thứ ba (đề xuất)**

- Ảnh: Cloudinary / AWS S3 + CloudFront
- Search: Elasticsearch hoặc Postgres full-text cho search nâng cao
- Cache: Redis cho popular lists và rate limiting
- Email/OTP: SendGrid / Mailgun hoặc Twilio (SMS/OTP)
- Observability: Sentry (error), Prometheus + Grafana (metrics), ELK stack (logs)
- Auth: Xác thực cookie httpOnly + refresh token để giảm rủi ro XSS

---

**14. Các vấn đề bảo mật cần nêu trong đồ án**

- Token lưu `localStorage` → dễ bị XSS; nên dùng httpOnly cookie.
- Thiếu rate-limiting / captcha trên đăng nhập/đăng ký → dễ bị brute-force.
- Validate upload loại + kích thước file (hiện phụ thuộc multer) cần chặt chẽ.
- Chứng thực TLS (HTTPS) cho tất cả endpoints và CDN.
- Environment secrets hiện cần đưa vào vault / platform env (không commit vào repo).

---

**15. Deployment & migration (tóm tắt)**

- Thực hiện migration + seed (server tự seed Price/Area/Province trong `server.js` nếu rỗng). Có thể dùng `sequelize-cli`.
- Thiết lập `process.env.CLIENT_URL`, `SECRET_KEY`, DB*URL/DB creds, và `REACT_APP*\*` cho client.
- Riêng `uploads/` nếu dùng local: cần backup và mount persistent storage trên production. Nếu dùng S3/Cloudinary thì chỉnh lại upload endpoints.

---

**16. Tài liệu tham khảo mã (mapping nhanh)**

- Login UI → `client/src/containers/Public/Login.js` → `client/src/store/actions/auth.js` → `client/src/services/auth.js` → `POST /api/v1/auth/login` → `server/src/controllers/auth.js` → `server/src/services/auth.js` → `Users` model (`server/src/models/user.js`).
- Create Post UI → `client/src/containers/System/CreatePost.js` → `client/src/services/post.js` (`apiUploadImages` + `apiCreateNewPost`) → server `POST /api/v1/user/posts` → `server/src/controllers/post.js` → `server/src/services/post.js` → tables: `Posts`, `Images`, `Attributes`, `Overview`.

---
