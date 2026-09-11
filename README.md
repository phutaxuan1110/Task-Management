# The Daily Task — Newsprint Task Desk

Ứng dụng quản lý công việc cá nhân (Parent Task + Subtasks) với 3 chế độ xem List / Board / Calendar,
dữ liệu lưu trên **Supabase**, cài được trên điện thoại dưới dạng **PWA**, deploy bằng **Vercel**.

Giao diện theo design system **Newsprint**: bo góc 0px, chữ serif khổ lớn, lưới kẻ viền lộ rõ,
đen trắng là chính và chỉ dùng đỏ `#CC0000` cho cảnh báo/nhấn mạnh.

---

## 1. Tech stack

| Lớp | Công nghệ |
| --- | --- |
| UI | React 18 + TypeScript + Vite |
| Style | Tailwind CSS 3 (token Newsprint trong `tailwind.config.ts`) |
| Component | Radix UI primitives (kiểu shadcn/ui, viết lại theo Newsprint) + `class-variance-authority` |
| Icon | lucide-react |
| Routing | React Router v6 (`createBrowserRouter`) |
| Server state | TanStack Query v5 (optimistic update + rollback) |
| Form | React Hook Form + Zod |
| Drag & drop | dnd-kit (subtask, Kanban, calendar) |
| Calendar | Component tự viết bằng date-fns (xem mục 9 – Quyết định kỹ thuật) |
| Backend | Supabase Auth + Postgres + Row Level Security |
| PWA | vite-plugin-pwa (Workbox) |
| Deploy | Vercel |

## 2. Yêu cầu môi trường

- Node.js **18.18+** (khuyến nghị 20 hoặc 22)
- npm 9+
- Một tài khoản Supabase (free tier là đủ)
- Một tài khoản GitHub + Vercel

## 3. Cài đặt nhanh

```bash
npm install
cp .env.example .env     # rồi điền 2 biến bên dưới
npm run dev              # http://localhost:5173
```

Biến môi trường (chỉ 2 biến, đều là public key phía client):

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

> Không bao giờ đưa `service_role key` vào frontend hoặc commit file `.env`.

## 4. Tạo Supabase project và chạy migration

1. Vào https://supabase.com → **New project**, chọn region gần bạn, đặt database password.
2. Lấy key: **Project Settings → API** → copy `Project URL` và `anon public` key vào `.env`.
3. Chạy migration — chọn **một trong hai cách**:

**Cách A — SQL Editor (nhanh nhất, không cần CLI)**

- Mở **SQL Editor → New query**
- Copy toàn bộ nội dung `supabase/migrations/20260101000000_init.sql`
- Nhấn **Run**

**Cách B — Supabase CLI**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

4. Kiểm tra: **Table Editor** phải có 4 bảng `profiles`, `categories`, `tasks`, `subtasks`,
   và mỗi bảng đều bật **RLS enabled**.

### Cấu hình Authentication URL

**Authentication → URL Configuration**:

- *Site URL*: `http://localhost:5173` (local) — sau khi deploy đổi/thêm domain Vercel.
- *Redirect URLs*: thêm cả 4 dòng
  ```
  http://localhost:5173/**
  http://localhost:5173/reset-password
  https://<your-app>.vercel.app/**
  https://<your-app>.vercel.app/reset-password
  ```

Trong lúc phát triển, có thể tắt **Confirm email** (Authentication → Providers → Email) để đăng ký xong vào thẳng Dashboard.

Khi user đăng ký, trigger `handle_new_user()` tự tạo `profile` và 4 category mặc định: **Work, Personal, Study, Health**.

## 5. Scripts

```bash
npm run dev        # dev server
npm run build      # tsc -b && vite build  -> dist/
npm run preview    # xem thử bản build
npm run lint       # eslint
npm run typecheck  # tsc -b
```

## 6. Cấu trúc thư mục

```
src/
  components/
    ui/          Button, Input, Field, Dialog (mobile = full-screen sheet), Select,
                 Checkbox, Progress, Skeleton, EmptyState, ErrorState, ConfirmDialog, Toaster
    layout/      AppShell, Sidebar, BottomNav, Masthead, Ticker, PageHeader,
                 ViewSwitcher, OfflineBanner, SetupNotice
    tasks/       TaskForm, TaskFormDialog, TaskDetailDialog, TaskListItem, TaskCard,
                 BoardView, SubtaskEditor, SubtaskList, TaskFilterBar, QuickAdd, badges
    calendar/    CalendarView (month / week / day + agenda + drag-to-reschedule)
  features/
    auth/        AuthProvider (session, sign in/up/out, reset password)
    tasks/       api.ts, hooks.ts, mapper.ts, TaskDialogProvider
    subtasks/    api.ts, hooks.ts
    categories/  api.ts, hooks.ts
    profile/     api.ts, hooks.ts
  hooks/         useMediaQuery, useOnlineStatus
  lib/           supabase.ts, queryClient.ts, constants.ts, errors.ts, env.ts, utils.ts
  pages/         Dashboard, Tasks, Board, Calendar, Categories, Archived, Settings, 404, auth/*
  routes/        router, ProtectedRoute, PublicOnlyRoute, SessionSplash
  schemas/       auth.ts, task.ts, category.ts, profile.ts   (Zod)
  types/         database.ts (mirror schema Supabase), index.ts
  utils/         date.ts, task.ts (progress, filter, sort)
supabase/migrations/20260101000000_init.sql
public/icons/…   icon PWA 192 / 512 / maskable / apple-touch
```

## 7. Database migration

File: `supabase/migrations/20260101000000_init.sql`

- Enum `task_urgency` (`critical | high | medium | low`) và `task_status` (`todo | in_progress | completed | archived`)
- Bảng `profiles`, `categories`, `tasks`, `subtasks` + foreign key
  - `subtasks.task_id → tasks.id ON DELETE CASCADE` (xóa task là xóa toàn bộ subtask)
  - `tasks.category_id → categories.id ON DELETE SET NULL` (xóa category **không** xóa task)
- Check constraint `due_date >= start_date`
- Index: `user_id`, `(user_id, status)`, `(user_id, due_date)`, `(user_id, urgency)`, `(task_id, position)`
- Trigger `set_updated_at()` cho cả 4 bảng
- Trigger `on_auth_user_created` → tạo profile + 4 category mặc định
- RLS bật cho cả 4 bảng, mọi policy đều theo `auth.uid() = user_id`

## 8. Tính năng theo yêu cầu

- **Auth**: Sign up / Sign in / Forgot password / Reset password / Sign out, route protection,
  splash trong lúc kiểm tra session nên **không nháy** giữa trang login và dashboard.
- **Parent Task**: title, description, urgency (4 mức), status (4 trạng thái), start/due date, start/due time,
  category, color, progress, completed_at.
- **Subtasks**: thêm nhanh bằng Enter, tick hoàn thành, sửa tên inline, xóa, kéo thả sắp xếp.
- **Progress** = số subtask hoàn thành / tổng × 100. Task không có subtask vẫn tick hoàn thành thủ công được.
  Khi mọi subtask xong, app **gợi ý** hoàn thành parent task chứ không tự động. Nếu hoàn thành khi còn subtask dở,
  app hiển thị cảnh báo.
- **List View**: search, filter (urgency, status, category, khoảng due date, ẩn/hiện completed),
  sort (urgency / due date / newest / progress), group (urgency hoặc status), menu Edit · Duplicate · Archive · Delete.
- **Kanban**: 3 cột To do / In progress / Completed, kéo thả đổi status, optimistic update + rollback khi lỗi,
  task archived không hiển thị.
- **Calendar**: month / week / day, Today, Prev/Next, task hiển thị theo due date (hoặc khoảng start→due),
  click task mở detail, click ngày trống để tạo task với due date điền sẵn, kéo task sang ngày khác để đổi due date
  (giữ nguyên độ dài date range), đánh dấu quá hạn, mobile hiển thị lưới tối giản + agenda cho ngày được chọn.
- **Dashboard**: lời chào, số task hôm nay / quá hạn / critical + high / tỉ lệ hoàn thành, danh sách Today và Upcoming,
  Quick Add, nút chuyển List / Board / Calendar, empty state có CTA.
- **Trạng thái UI**: loading, skeleton, empty, error, offline banner, disabled, saving, toast, confirm dialog,
  "no search results".
- **Accessibility**: semantic HTML, label cho mọi input, `aria-label` cho icon button, focus ring nhìn thấy rõ,
  focus trap trong dialog (Radix), Esc để đóng, urgency **không chỉ dựa vào màu** (có số thứ hạng 01–04 + chữ),
  tương phản đen `#111` trên nền `#F9F9F7` đạt AAA.
- **Mobile**: bottom navigation 4 mục + nút “+” nổi, safe-area cho iPhone, touch target ≥ 44px,
  form là full-screen sheet có sticky footer, chạy tốt từ chiều rộng 320px.

## 9. Quyết định kỹ thuật đáng chú ý

- **Calendar tự viết thay vì FullCalendar**: FullCalendar mang theo CSS riêng (bo góc, màu, cấu trúc) rất khó ép về
  Newsprint, và nặng thêm ~150 kB. Component `CalendarView` dùng `date-fns` + `dnd-kit` nên đồng bộ tuyệt đối với
  design system, nhẹ hơn, và vẫn có drag-to-reschedule. Nếu bạn vẫn muốn FullCalendar, chỉ cần thay component này.
- **Màu urgency**: design system Newsprint chỉ cho phép một màu nhấn (đỏ). Vì vậy urgency được mã hóa bằng
  *thứ hạng + độ đậm* (Critical = nền đỏ, High = nền đen, Medium = viền đen, Low = viền xám) thay cho
  đỏ/cam/vàng/xanh. Cách này vẫn phân biệt được khi in đen trắng và thỏa WCAG 1.4.1.
- **shadcn/ui**: dự án dùng đúng nền tảng của shadcn (Radix + CVA + tailwind-merge) nhưng component được viết lại
  cho Newsprint (bo góc 0, input chỉ có border dưới, hover đảo màu). Bạn vẫn có thể `npx shadcn add` thêm component.
- **Bo góc 0**: ép ở tầng CSS (`* { border-radius: 0 !important }`) + `borderRadius` trong Tailwind config,
  nên mọi component mới thêm vào cũng tự động sắc cạnh.

## 10. Push lên GitHub

```bash
git init
git add .
git commit -m "feat: newsprint task desk (tasks, subtasks, board, calendar, supabase, pwa)"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

`.gitignore` đã loại trừ `.env`, `node_modules`, `dist`, `dev-dist`, `.vercel`.

## 11. Deploy lên Vercel

1. https://vercel.com → **Add New… → Project** → import repository vừa push.
2. Vercel tự nhận Vite: Framework **Vite**, Build `npm run build`, Output `dist`. Không cần sửa gì.
3. **Environment Variables** → thêm cho cả Production, Preview và Development:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploy**.
5. Quay lại Supabase → **Authentication → URL Configuration** → thêm domain production vào *Site URL* và
   *Redirect URLs* (`https://<app>.vercel.app/**` và `.../reset-password`).

**Lỗi 404 khi refresh route con** (ví dụ mở thẳng `/tasks/board`) đã được xử lý sẵn bằng `vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Vì biến `VITE_*` được nhúng lúc build, sau khi đổi giá trị phải **Redeploy** mới có hiệu lực.

### Checklist sau khi deploy

- [ ] Đăng ký tài khoản mới → vào thẳng Dashboard, có sẵn 4 category mặc định
- [ ] Tạo task có subtask → progress hiển thị đúng
- [ ] Kéo task trên Kanban → status đổi và giữ nguyên sau khi refresh
- [ ] Kéo task trên Calendar → due date đổi đúng ngày
- [ ] Mở thẳng `https://<app>.vercel.app/calendar` → không 404
- [ ] Mở bằng Chrome/Safari trên điện thoại → có thể "Add to Home Screen", mở ra chạy fullscreen
- [ ] Đăng nhập bằng tài khoản thứ hai → không thấy dữ liệu của tài khoản thứ nhất (RLS)

## 12. PWA

`vite-plugin-pwa` sinh `manifest.webmanifest` + service worker khi build. Icon nằm ở `public/icons/`.
Cài đặt: mở bản deploy → menu trình duyệt → *Install app* / *Add to Home Screen*.
Service worker chỉ hoạt động trên bản build (`npm run build && npm run preview`) hoặc HTTPS, không hoạt động ở `npm run dev`.

## 13. Kiểm thử đã chạy

```
npx tsc -b     → không lỗi
npm run lint   → 0 error (4 warning react-refresh, không ảnh hưởng build)
npm run build  → thành công, dist/ ~922 kB (270 kB gzip)
```

Những hạng mục cần credentials Supabase thật để xác nhận (chưa chạy được trong môi trường build):
đăng ký/đăng nhập thật, hiệu lực RLS giữa 2 tài khoản, CRUD ghi xuống database, và quá trình cài PWA trên thiết bị thật.
