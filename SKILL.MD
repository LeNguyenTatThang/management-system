# Coffee Shop Management System UI/UX Specification

## 1. Project Overview

Design and build a modern, simple, intuitive, responsive web application for managing a coffee shop / beverage shop.

The application is an internal management tool for shop owners and employees.

The UI should prioritize:

- Simple and clean layout
- Easy to understand at first glance
- Fast daily operation
- Minimal unnecessary decoration
- Clear data hierarchy
- Consistent spacing and typography
- Responsive design
- Professional cafe management software appearance

The visual design should take inspiration from the provided reference image.

The reference image represents the "Recipe Management / Recipe List" screen.

IMPORTANT:

The provided reference image is only a UI/visual reference.

Do NOT copy the exact UI pixel-by-pixel.

Use the same general design direction:

- Left sidebar navigation
- Warm cream background
- White content cards
- Burgundy / dark red primary color
- Rounded corners
- Simple statistics cards
- Compact tables
- Clear typography
- Soft borders and shadows
- Simple icons
- Clean management dashboard

The application should support TWO display modes for recipe/product management:

1. Card / Formula View
2. List / Table View

The user can switch between these modes using a toggle button.

---

# 2. Global Layout

Create a desktop-first admin dashboard.

Layout:

┌──────────────────────────────────────────────┐
│ Sidebar │ Header / Topbar                     │
│         ├──────────────────────────────────────┤
│         │                                      │
│         │ Main Content                         │
│         │                                      │
│         │                                      │
│         │                                      │
└─────────┴──────────────────────────────────────┘

## Sidebar

Fixed left sidebar.

Width approximately 230px - 250px.

The sidebar should contain:

### Brand

- Circular logo
- Brand name: "GAMMA LAB"
- Subtitle: "QUẢN LÝ QUÁN CAFE"

### Navigation

Group 1: NHẬP LIỆU

- Danh mục nguyên liệu
- Công thức / Định lượng
- Danh mục món
- Nhà cung cấp

Group 2: BÁN HÀNG

- Bán hàng / POS
- Đơn hàng
- Lịch sử giao dịch

Group 3: KHO

- Tồn kho
- Nhập kho
- Xuất kho
- Kiểm kê

Group 4: QUẢN LÝ

- Dashboard
- Nhân viên
- Ca làm việc
- Khách hàng

Group 5: BÁO CÁO

- Doanh thu
- Lợi nhuận
- Thống kê món
- Thống kê nguyên liệu

Bottom section:

- Cài đặt
- Trợ giúp
- User profile
- Logout

The active menu item should have a highlighted background.

Use icons consistently.

---

# 3. Topbar

Create a top navigation bar.

Left:

- Page title
- Breadcrumb

Right:

- Search
- Notification icon
- User avatar
- Username
- Role
- Dropdown

Example:

Dashboard / Công thức

User:

Nguyễn Văn A
Quản lý

---

# 4. Dashboard

Create a complete management dashboard.

Page title:

"Tổng quan"

Subtitle:

"Theo dõi tình hình hoạt động của quán"

## KPI Cards

Display 4-6 statistic cards.

Example:

### Doanh thu hôm nay

25.840.000đ

+12.5%

Compared with yesterday

### Đơn hàng hôm nay

186

+8.2%

Compared with yesterday

### Lợi nhuận

8.420.000đ

32.6%

Profit margin

### Món bán chạy

Cà phê sữa

128 ly

### Nguyên liệu sắp hết

8

Cần nhập thêm

### Đơn đang xử lý

12

Currently processing

Cards should include:

- Icon
- Main number
- Label
- Percentage change
- Small trend indicator

---

## Revenue Chart

Create a line/bar chart.

Title:

"Doanh thu"

Filter:

- Hôm nay
- 7 ngày
- 30 ngày
- 12 tháng

Chart should display:

- Revenue
- Orders

---

## Best Selling Products

Create a ranking table.

Columns:

- # 
- Món
- Số lượng bán
- Doanh thu
- Tỷ lệ

Example:

1. Cà phê sữa
2. Bạc xỉu
3. Trà đào
4. Matcha latte
5. Cà phê đen

---

## Inventory Warning

Create a compact warning list.

Example:

- Sữa đặc — Còn 2 hộp — Sắp hết
- Cà phê Robusta — Còn 1.2kg — Sắp hết
- Syrup đào — Còn 300ml — Sắp hết

Button:

"Xem kho"

---

# 5. Product / Menu Management

Page title:

"Danh mục món"

This page manages all beverages sold by the cafe.

Top area:

- Search input
- Category filter
- Status filter
- Sort dropdown
- Add new product button
- View mode toggle

Categories:

- Tất cả
- Cà phê
- Trà
- Trà sữa
- Đá xay
- Nước ép
- Sinh tố
- Khác

Status:

- Đang bán
- Tạm ngưng
- Hết món

---

## View Mode Toggle

IMPORTANT:

The user can switch between:

### 1. Card View

Display products as cards.

Each card:

- Product image
- Product name
- Category
- Selling price
- Cost price
- Profit
- Status
- Edit button

Example:

Cà phê sữa

25.000đ

Giá vốn: 7.640đ

Lợi nhuận: 17.360đ

Status: Đang bán

---

### 2. List View

Display products in a table.

Columns:

- Mã món
- Tên món
- Danh mục
- Giá bán
- Giá vốn
- Lợi nhuận
- Trạng thái
- Cập nhật lần cuối
- Actions

Actions:

- View
- Edit
- Duplicate
- Disable
- Delete

The view toggle should be visually clear:

[ Card ] [ List ]

Remember the user's selected view mode.

---

# 6. Recipe / Formula Management

This page should closely follow the general visual style of the provided reference image.

Page title:

"Danh sách công thức"

Subtitle:

"Tìm kiếm, xem và quản lý công thức món"

Top statistics:

- Tổng món
- Giá vốn TB/phần
- % Giá vốn TB
- Món có food cost > 35%

Example:

TỔNG MÓN

24 món

GIÁ VỐN TB/PHẦN

8.370đ

% GIÁ VỐN TB

23.6%

MÓN FC > 35%

3 món

---

## Filters

Include:

- Search
- Category filter
- Cost percentage filter
- Sort by name
- Sort by cost
- View toggle

Example:

[ 🔍 Tìm món... ]

[ Tất cả danh mục ]

[ Tên A → Z ]

[ Card View ] [ List View ]

---

# 7. Recipe Card View

The default recipe view should resemble the structure shown in the reference image.

Each recipe card contains:

Header:

- Product image
- Product name
- Category
- Tags
- Selling price
- Cost price
- Food cost percentage

Example:

Cà phê sữa

[Cà phê]

360ml

Khẩu • Ông hút ngắn • Thìa ngắn

GIÁ BÁN

25.000đ

GIÁ VỐN

7.640đ

30.6%

Trung bình

---

## Recipe Details

Section:

"CÁCH LÀM"

1. Chiết xuất 35ml cà phê
2. Cho sữa đặc vào ly khuấy đều
3. Cho đá vào ly
4. Phục vụ kèm khuấy và trà đá

Section:

"NGUYÊN LIỆU"

Table:

| Nguyên liệu | Lượng | Đơn vị | Ghi chú |
|-------------|-------|--------|---------|
| Cà phê Robusta | 18 | Gram | |
| Sữa đặc | 20 | Ml | |

Footer actions:

- Xem chi tiết
- Chỉnh sửa
- Nhân bản
- Xóa

---

# 8. Recipe List View

When List View is selected, replace recipe cards with a table.

Columns:

- Mã món
- Tên món
- Danh mục
- Giá bán
- Giá vốn
- Food Cost %
- Số nguyên liệu
- Trạng thái
- Cập nhật
- Actions

Example:

CF001 | Cà phê sữa | Cà phê | 25.000đ | 7.640đ | 30.6% | 2 | Đang bán

Use colored status indicators:

- Green = Good
- Yellow = Warning
- Red = High Cost

The table should support:

- Search
- Filter
- Sort
- Pagination
- Row selection
- Bulk actions

---

# 9. Recipe Detail Page

Create a dedicated recipe detail page.

Header:

- Back button
- Product image
- Product name
- Category
- Status
- Edit button

Summary cards:

- Giá bán
- Giá vốn
- Lợi nhuận
- Food Cost %

Recipe section:

## Công thức

Show ingredient table.

Columns:

- Nguyên liệu
- Định lượng
- Đơn vị
- Giá vốn
- Thành tiền

At the bottom:

Tổng giá vốn

7.640đ

---

## Cách làm

Show preparation steps as numbered steps.

---

## Cost Breakdown

Create a simple chart showing cost distribution.

Example:

Cà phê: 35%

Sữa: 45%

Đá: 5%

Bao bì: 15%

---

# 10. Ingredient Management

Page:

"Danh mục nguyên liệu"

Statistics:

- Tổng nguyên liệu
- Tổng giá trị tồn kho
- Nguyên liệu sắp hết
- Nguyên liệu hết hàng

Table:

- Tên nguyên liệu
- Nhóm
- Đơn vị
- Tồn kho
- Tồn tối thiểu
- Giá nhập
- Giá trị tồn
- Trạng thái

Example:

Cà phê Robusta
Kg
12.5 kg
Min: 5 kg

Status:

- Đủ hàng
- Sắp hết
- Hết hàng

Actions:

- Nhập kho
- Chỉnh sửa
- Xem lịch sử

---

# 11. Inventory Management

Create an inventory dashboard.

Show:

- Current stock value
- Incoming stock
- Outgoing stock
- Low stock items

Create inventory transaction table.

Columns:

- Thời gian
- Nguyên liệu
- Loại giao dịch
- Số lượng
- Đơn vị
- Người thực hiện
- Ghi chú

Transaction types:

- Nhập kho
- Xuất kho
- Điều chỉnh
- Hủy hàng

Use badges to distinguish transaction types.

---

# 12. Supplier Management

Page:

"Nhà cung cấp"

Display suppliers as cards or table.

Fields:

- Tên nhà cung cấp
- Người liên hệ
- Số điện thoại
- Email
- Số nguyên liệu cung cấp
- Tổng giá trị nhập
- Trạng thái

Actions:

- View
- Edit
- Delete

---

# 13. POS / Sales

Create a simple cafe POS interface.

Layout:

Left:

Product categories

- Cà phê
- Trà
- Trà sữa
- Đá xay
- Nước ép

Middle:

Product grid.

Each product:

- Image
- Name
- Price
- Quick add button

Right:

Current order.

Show:

- Product
- Quantity
- Price
- Remove
- Increase/decrease quantity

Bottom:

Tạm tính

Giảm giá

Tổng cộng

Payment method:

- Tiền mặt
- Chuyển khoản
- Thẻ

Large button:

"Thanh toán"

The POS should prioritize speed and large clickable areas.

---

# 14. Order Management

Page:

"Đơn hàng"

Filters:

- Today
- Yesterday
- This week
- Custom date

Status:

- Đang xử lý
- Hoàn thành
- Đã hủy

Table:

- Mã đơn
- Thời gian
- Số món
- Tổng tiền
- Thanh toán
- Nhân viên
- Trạng thái
- Actions

---

# 15. Reports & Analytics

Create a comprehensive statistics section.

## Revenue Report

Metrics:

- Tổng doanh thu
- Tổng đơn
- Giá trị đơn TB
- Lợi nhuận

Charts:

- Revenue by day
- Revenue by month
- Revenue by category

---

## Product Performance

Show:

- Best selling products
- Lowest selling products
- Highest profit products
- Lowest profit products

---

## Food Cost Analysis

Show:

- Average food cost
- Products with high food cost
- Products with low margin

Create a table:

| Món | Giá bán | Giá vốn | Food Cost | Lợi nhuận |
|-----|---------|---------|-----------|-----------|

Highlight products where Food Cost > 35%.

---

# 16. Staff Management

Page:

"Nhân viên"

Statistics:

- Tổng nhân viên
- Đang làm việc
- Đang nghỉ
- Nhân viên đang online

Table:

- Avatar
- Tên
- Số điện thoại
- Vai trò
- Ca làm
- Trạng thái
- Last active

Roles:

- Chủ quán
- Quản lý
- Thu ngân
- Nhân viên

---

# 17. Shift Management

Create a simple shift management page.

Show:

- Ca sáng
- Ca chiều
- Ca tối

Each shift:

- Employee
- Start time
- End time
- Total hours
- Status

Allow manager to:

- Create shift
- Edit shift
- Assign employee
- Close shift

---

# 18. Notifications

Create notification dropdown.

Notification examples:

- Nguyên liệu sắp hết
- Có đơn hàng mới
- Công thức vừa được cập nhật
- Food Cost vượt mức cho phép
- Ca làm sắp bắt đầu

Use notification badges.

---

# 19. Settings

Create settings page.

Sections:

## Shop Information

- Tên quán
- Logo
- Địa chỉ
- Số điện thoại
- Email

## Business Settings

- Đơn vị tiền tệ
- VAT
- Food Cost warning threshold
- Low stock threshold

## User Settings

- Profile
- Password
- Notifications

---

# 20. Design System

Use a consistent design system.

Primary color:

Dark Burgundy / Red

Secondary:

Warm Cream

Background:

Light warm cream / off-white

Cards:

White

Text:

Dark gray / near black

Use:

- Rounded corners
- Soft shadows
- Thin borders
- Compact spacing
- Clear hierarchy

Avoid:

- Excessive gradients
- Excessive animations
- Glassmorphism
- Very dark dashboards
- Overly complex charts
- Too many colors
- Excessive decorative elements

The UI should feel like:

"Modern cafe management software"

Not like:

"Consumer social media app"

---

# 21. Responsive Design

Desktop:

- Fixed sidebar
- Full dashboard

Tablet:

- Collapsible sidebar

Mobile:

- Sidebar becomes bottom navigation or drawer
- Tables become horizontally scrollable cards
- Dashboard cards stack vertically
- POS becomes optimized for touch

The application must remain usable on 1024px, 768px and mobile widths.

---

# 22. UX Requirements

All major pages should have:

- Loading state
- Empty state
- Error state
- Confirmation dialog
- Toast notification
- Skeleton loading

Delete actions must require confirmation.

Example:

"Bạn có chắc muốn xóa công thức Cà phê sữa?"

Buttons:

[Hủy] [Xóa]

---

# 23. Important Interaction

The Recipe Management page is one of the most important pages.

The user MUST be able to switch between:

Card View:

[ 🗂 Card ]

and

List View:

[ ☷ List ]

The selected view should persist while navigating.

The same View Toggle pattern should be reusable for:

- Recipes
- Products
- Ingredients
- Suppliers

---

# 24. Recommended Navigation Structure

Dashboard
│
├── Bán hàng
│   ├── POS
│   ├── Đơn hàng
│   └── Lịch sử giao dịch
│
├── Thực đơn
│   ├── Danh mục món
│   └── Công thức / Định lượng
│
├── Kho
│   ├── Nguyên liệu
│   ├── Tồn kho
│   ├── Nhập kho
│   └── Kiểm kê
│
├── Nhà cung cấp
│
├── Nhân sự
│   ├── Nhân viên
│   └── Ca làm việc
│
├── Báo cáo
│   ├── Doanh thu
│   ├── Lợi nhuận
│   ├── Món bán chạy
│   └── Food Cost
│
└── Cài đặt

---

# 25. Final UI Goal

The final application should feel like a complete, production-ready cafe management system.

Prioritize these 5 core workflows:

1. View dashboard and understand business performance quickly.
2. Manage menu products.
3. Manage recipes and calculate food cost.
4. Manage ingredients and inventory.
5. Process orders and view sales reports.

The provided reference image should primarily inspire the Recipe Management page.

The overall application should expand the same visual language into a complete cafe management product.

Use realistic Vietnamese sample data.

Do not use lorem ipsum.

All labels should be in Vietnamese.

Keep the UI clean, compact, intuitive, and easy for a cafe owner or employee to operate.