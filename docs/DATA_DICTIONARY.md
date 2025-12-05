# Data Dictionary - ระบบลงทะเบียนงานประชุมวิชาการ

> เอกสารนี้อธิบายโครงสร้างฐานข้อมูลทั้งหมดของระบบ Conference Registration System
> ปรับปรุงล่าสุด: ธันวาคม 2025

---

## สารบัญ

1. [Master Tables (ตารางข้อมูลหลัก)](#master-tables-ตารางข้อมูลหลัก)
   - [zones](#zones---เขตสุขภาพ)
   - [hospitals](#hospitals---โรงพยาบาล)
   - [levels](#levels---ระดับตำแหน่ง)
   - [positions](#positions---วิชาชีพ)
   - [reg_types](#reg_types---ประเภทผู้ลงทะเบียน)
   - [airlines](#airlines---สายการบิน)
   - [hotels](#hotels---โรงแรม)
2. [User & Auth (ผู้ใช้งาน)](#user--auth-ผู้ใช้งาน)
   - [members](#members---สมาชิกผู้ใช้งานระบบ)
3. [Registration (การลงทะเบียน)](#registration-การลงทะเบียน)
   - [attendees](#attendees---ผู้ลงทะเบียน)
   - [carnivals](#carnivals---ผู้ลงทะเบียนงานเลี้ยง)
4. [Finance (การเงิน)](#finance-การเงิน)
   - [finances](#finances---การแจ้งชำระเงิน)
5. [Settings (การตั้งค่า)](#settings-การตั้งค่า)
   - [settings](#settings---การตั้งค่าระบบ)
6. [Landing Page Content (เนื้อหาหน้าแรก)](#landing-page-content-เนื้อหาหน้าแรก)
   - [slideshows](#slideshows---สไลด์โชว์)
   - [news](#news---ข่าวสาร)
   - [schedules](#schedules---กำหนดการ)
   - [footer_info](#footer_info---ข้อมูล-footer)
   - [site_config](#site_config---การตั้งค่าเว็บไซต์)
   - [attractions](#attractions---สถานที่ท่องเที่ยว)
7. [Status Codes Reference](#status-codes-reference)
8. [Entity Relationship Diagram](#entity-relationship-diagram)

---

## Master Tables (ตารางข้อมูลหลัก)

### zones - เขตสุขภาพ

**คำอธิบาย:** จัดกลุ่มโรงพยาบาลตามเขตสุขภาพ (เขต 1-13 + กรุงเทพมหานคร)

**ใช้ใน:** AttendeeSearch, ReportsClient สำหรับ cascade filter เขตสุขภาพ → จังหวัด → โรงพยาบาล

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | String (CUID) | No | Primary Key | `clx1abc123...` |
| code | String | No | รหัสเขต (Unique) | `"Z01"`, `"Z02"`, `"ZBK"` |
| name | String | No | ชื่อเขตสุขภาพ | `"เขตสุขภาพที่ 1"`, `"กรุงเทพมหานคร"` |

**Relations:** `hospitals` (1:N)

---

### hospitals - โรงพยาบาล

**คำอธิบาย:** ข้อมูลหลักของหน่วยงาน/สถานที่ปฏิบัติงานที่ผู้ลงทะเบียนสังกัด

**ใช้ใน:** ลงทะเบียน, ค้นหา, รายงาน, สถิติ, cascade filter

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | String (CUID) | No | Primary Key | `clx1abc123...` |
| code | String | No | รหัสโรงพยาบาล (Unique) | `"H001"`, `"H002"` |
| hospital_type | String | Yes | ประเภท รพ. | `"A"` = รพศ., `"B"` = รพท., `"C"` = รพช. |
| name | String | No | ชื่อโรงพยาบาล | `"โรงพยาบาลน่าน"` |
| province | String | Yes | จังหวัดที่ตั้ง | `"น่าน"`, `"เชียงใหม่"` |
| zone_code | String | Yes | FK → zones.code | `"Z01"` |

**Relations:**
- `zone` → zones (N:1)
- `members` (1:N)
- `attendees` (1:N)
- `carnivals` (1:N)

---

### levels - ระดับตำแหน่ง

**คำอธิบาย:** ระดับตำแหน่งของบุคลากร (เชี่ยวชาญ, ชำนาญการพิเศษ, ชำนาญการ ฯลฯ)

**ใช้ใน:** ฟอร์มลงทะเบียน, รายงานประเภทตำแหน่ง, Excel export

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | String (CUID) | No | Primary Key | `clx1abc123...` |
| code | String | No | รหัสระดับ (Unique) | `"L01"`, `"L02"` |
| group | String | Yes | กลุ่มตำแหน่ง (ใช้ใน cascade filter) | `"กลุ่มบริหาร"`, `"กลุ่มวิชาการ"` |
| name | String | No | ชื่อระดับ | `"ระดับสูง"`, `"ระดับเชี่ยวชาญ"` |
| status | Int | No | สถานะ | `1` = ใช้งาน, `0` = ไม่ใช้งาน |

**Relations:** `attendees` (1:N)

---

### positions - วิชาชีพ

**คำอธิบาย:** ประเภทวิชาชีพของผู้ลงทะเบียน

**ใช้ใน:** ฟอร์มลงทะเบียน, รายงาน, สถิติ

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | String (CUID) | No | Primary Key | `clx1abc123...` |
| code | String | No | รหัสวิชาชีพ (Unique) | `"1"`, `"2"`, `"3"` |
| name | String | No | ชื่อวิชาชีพ | `"แพทย์"`, `"พยาบาล"`, `"เภสัชกร"` |

**Relations:** `attendees` (1:N)

---

### reg_types - ประเภทผู้ลงทะเบียน

**คำอธิบาย:** จำแนกประเภทผู้เข้าร่วมประชุม

**ใช้ใน:** คำนวณค่าลงทะเบียน, รายงาน, สถิติ Pie Chart

**หมายเหตุ:** `id = 6` (ผู้ติดตาม) มีค่าลงทะเบียนต่างจากประเภทอื่น ใช้ `meetPriceFollow` แทน `meetPrice`

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | Int | No | Primary Key (Auto-increment) | `1`, `2`, `6` |
| name | String | No | ชื่อประเภท | `"ผู้บริหารระดับกระทรวง/เขต"`, `"ผู้ติดตาม"` |

**Relations:** `attendees` (1:N)

---

### airlines - สายการบิน

**คำอธิบาย:** รายชื่อสายการบินสำหรับ dropdown ในฟอร์มลงทะเบียน

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | Int | No | Primary Key (Auto-increment) | `1`, `2` |
| name | String | No | ชื่อสายการบิน | `"Thai Airways"`, `"Nok Air"` |
| status | String | No | สถานะการแสดง | `"y"` = แสดง, `"n"` = ซ่อน |

---

### hotels - โรงแรม

**คำอธิบาย:** รายชื่อโรงแรมที่พักสำหรับผู้เข้าร่วมประชุม

**ใช้ใน:** ฟอร์มลงทะเบียน (เลือกโรงแรม), รายงานประเภทโรงแรม

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | Int | No | Primary Key (Auto-increment) | `1`, `2` |
| name | String | No | ชื่อโรงแรม | `"โรงแรมเทวราช"` |
| phone | String | Yes | เบอร์โทรติดต่อ | `"054-123456"` |
| website | String | Yes | เว็บไซต์โรงแรม | `"https://..."` |
| map_url | String | Yes | ลิงก์ Google Maps | `"https://maps.google.com/..."` |
| bus_flag | String | No | มีรถรับส่งหรือไม่ | `"Y"` = มี, `"N"` = ไม่มี |
| status | String | No | สถานะการแสดง | `"y"` = แสดง, `"n"` = ซ่อน |

**Relations:** `attendees` (1:N)

---

## User & Auth (ผู้ใช้งาน)

### members - สมาชิก/ผู้ใช้งานระบบ

**คำอธิบาย:** ตัวแทนโรงพยาบาลหรือ Admin ที่ล็อกอินเข้าระบบ

**ใช้ใน:** NextAuth authentication, ตรวจสอบสิทธิ์การเข้าถึง

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | Int | No | Primary Key (Auto-increment) | `1`, `2` |
| email | String | No | อีเมลสำหรับล็อกอิน (Unique) | `"user@hospital.go.th"` |
| password | String | No | รหัสผ่าน (hashed) | `"$2b$10$..."` |
| hospital_code | String | Yes | FK → hospitals.code | `"H001"` (null สำหรับ admin) |
| member_type | Int | No | ประเภทสมาชิก | `99` = Admin, `1` = ตัวแทน รพ. |
| created_at | DateTime | No | วันที่สร้าง | `2025-01-15T10:30:00Z` |
| updated_at | DateTime | No | วันที่แก้ไขล่าสุด | `2025-01-15T10:30:00Z` |

**Relations:**
- `hospital` → hospitals (N:1)
- `attendees` (1:N) - ผู้ลงทะเบียนที่สร้าง
- `finances` (1:N) - รายการแจ้งชำระเงิน

**Access Control:**
- `member_type = 99`: Admin - เห็นข้อมูลทุกโรงพยาบาล, เข้าถึงหน้า payment-status, reports, stats
- `member_type = 1`: ตัวแทนโรงพยาบาล - เห็นเฉพาะข้อมูลของโรงพยาบาลตัวเอง

---

## Registration (การลงทะเบียน)

### attendees - ผู้ลงทะเบียน

**คำอธิบาย:** ตารางหลักของระบบ เก็บข้อมูลผู้ลงทะเบียนเข้าร่วมประชุมทั้งหมด

**ใช้ใน:** ทุกหน้าของ Portal - ลงทะเบียน, ตรวจสอบ, ชำระเงิน, รายงาน, สถิติ

#### ข้อมูลหลัก

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | Int | No | Primary Key (Auto-increment) | `1`, `2` |
| hospital_code | String | Yes | FK → hospitals.code | `"H001"` |
| reg_type_id | Int | Yes | FK → reg_types.id | `1`, `6` (ผู้ติดตาม) |

#### ข้อมูลส่วนบุคคล

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| prefix | String | Yes | คำนำหน้า | `"นาย"`, `"นาง"`, `"นพ."` |
| first_name | String | Yes | ชื่อจริง | `"สมชาย"` |
| last_name | String | Yes | นามสกุล | `"ใจดี"` |
| position_code | String | Yes | FK → positions.code | `"1"` |
| position_other | String | Yes | วิชาชีพอื่นๆ | `"นักวิเคราะห์ระบบ"` |
| gp_code | String | Yes | รหัสกลุ่มงาน | (ไม่ได้ใช้งาน) |
| gp_other | String | Yes | กลุ่มงานอื่นๆ | |
| level_code | String | Yes | FK → levels.code | `"L01"` |

#### ข้อมูลติดต่อ

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| phone | String | Yes | เบอร์โทรศัพท์ | `"0891234567"` |
| email | String | Yes | อีเมล | `"somchai@hospital.go.th"` |
| line | String | Yes | Line ID | `"somchai_line"` |

#### ความต้องการพิเศษ

| Column | Type | Nullable | Description | Values |
|--------|------|----------|-------------|--------|
| food_type | Int | Yes | ประเภทอาหาร | `1`=ทั่วไป, `2`=อิสลาม, `3`=มังสวิรัติ, `4`=เจ |
| vehicle_type | Int | Yes | การเดินทาง | `1`=เครื่องบิน, `2`=รถโดยสาร, `3`=รถส่วนตัว, `4`=รถไฟ |

#### การเดินทางโดยเครื่องบิน

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| air_date_1 | DateTime | Yes | วันที่เดินทางมา |
| airline1 | String | Yes | สายการบินขาไป |
| flight_no_1 | String | Yes | เลขที่เที่ยวบินขาไป |
| air_time_1 | DateTime | Yes | เวลาถึง |
| air_date_2 | DateTime | Yes | วันที่เดินทางกลับ |
| airline2 | String | Yes | สายการบินขากลับ |
| flight_no_2 | String | Yes | เลขที่เที่ยวบินขากลับ |
| air_time_2 | DateTime | Yes | เวลาออก |
| air_shuttle | Int | Yes | รถรับ-ส่งสนามบิน: `1`=ต้องการ, `2`=ไม่ต้องการ |

#### การเดินทางโดยรถโดยสาร

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| bus_date_1 | DateTime | Yes | วันที่เดินทางมา |
| bus_line_1 | String | Yes | เส้นทาง/เที่ยวรถขาไป |
| bus_time_1 | DateTime | Yes | เวลาถึง |
| bus_date_2 | DateTime | Yes | วันที่เดินทางกลับ |
| bus_line_2 | String | Yes | เส้นทาง/เที่ยวรถขากลับ |
| bus_time_2 | DateTime | Yes | เวลาออก |
| bus_shuttle | Int | Yes | รถรับ-ส่งสถานี (ไม่ได้ใช้งาน) |

#### การเดินทางโดยรถไฟ

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| train_date_1 | DateTime | Yes | วันที่เดินทางมา |
| train_line_1 | String | Yes | ขบวนรถไฟขาไป |
| train_time_1 | DateTime | Yes | เวลาถึง |
| train_date_2 | DateTime | Yes | วันที่เดินทางกลับ |
| train_line_2 | String | Yes | ขบวนรถไฟขากลับ |
| train_time_2 | DateTime | Yes | เวลาออก |
| train_shuttle | Int | Yes | รถรับ-ส่งสถานี (ไม่ได้ใช้งาน) |

#### ที่พัก

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| hotel_id | Int | Yes | FK → hotels.id |
| hotel_other | String | Yes | โรงแรมอื่นๆ (กรณีไม่เลือกจากรายการ) |
| bus_to_meet | Int | Yes | รถรับ-ส่งไปสถานที่ประชุม: `1`=ต้องการ, `2`=ไม่ต้องการ |

#### สถานะและการตรวจสอบ

| Column | Type | Nullable | Description | Values |
|--------|------|----------|-------------|--------|
| status | Int | No | สถานะการชำระเงิน | `1`=ค้างชำระ, `2`=รอตรวจสอบ, `3`=ยกเลิก, `9`=ชำระแล้ว |
| created_by | Int | Yes | FK → members.id (ผู้สร้าง) | |
| created_at | DateTime | No | วันที่สร้าง | |
| updated_at | DateTime | Yes | วันที่แก้ไขล่าสุด | |
| cancelled_by | Int | Yes | FK → members.id (ผู้ยกเลิก) | |

**Relations:**
- `hospital` → hospitals (N:1)
- `regType` → reg_types (N:1)
- `position` → positions (N:1)
- `level` → levels (N:1)
- `hotel` → hotels (N:1)
- `createdByMember` → members (N:1)

---

### carnivals - ผู้ลงทะเบียนงานเลี้ยง

**คำอธิบาย:** ตารางแยกสำหรับงานเลี้ยง (Carnival/Gala Dinner) - ถ้ามีการจัดงาน

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | Int | No | Primary Key |
| hospital_code | String | Yes | FK → hospitals.code |
| prefix | String | Yes | คำนำหน้า |
| first_name | String | Yes | ชื่อจริง |
| last_name | String | Yes | นามสกุล |
| phone | String | Yes | เบอร์โทร |
| email | String | Yes | อีเมล |
| line | String | Yes | Line ID |
| bus_to_meet | Int | Yes | ต้องการรถรับ-ส่ง |
| hotel1-7 | String | Yes | โรงแรมแต่ละวัน |
| created_by | Int | Yes | FK → members.id |
| created_at | DateTime | No | วันที่สร้าง |
| updated_by | Int | Yes | FK → members.id |
| updated_at | DateTime | Yes | วันที่แก้ไข |

---

## Finance (การเงิน)

### finances - การแจ้งชำระเงิน

**คำอธิบาย:** บันทึกการอัปโหลดหลักฐานการโอนเงิน

**ใช้ใน:**
- `/portal/payment` - ตัวแทน รพ. แจ้งชำระเงิน
- `/portal/payment-status` - Admin ตรวจสอบหลักฐาน

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | Int | No | Primary Key | `1`, `2` |
| member_id | Int | Yes | FK → members.id (ผู้แจ้งชำระ) | `5` |
| attendee_ids | String | Yes | รายการ attendee IDs (comma-separated) | `"1,2,3"` |
| file_name | String | Yes | path ไฟล์หลักฐานการโอน | `"/uploads/slip_xxx.jpg"` |
| status | Int | No | สถานะการตรวจสอบ | `1`=รอตรวจสอบ, `2`=ผ่าน, `9`=ไม่ผ่าน |
| created_at | DateTime | No | วันที่แจ้งชำระ | |
| confirmed_by | Int | Yes | FK → members.id (Admin ตรวจสอบ) | `1` |
| confirmed_at | DateTime | Yes | วันเวลาที่ตรวจสอบ | |
| paid_date | DateTime | Yes | วันที่โอนเงินจริง | |

**Relations:** `member` → members (N:1)

**Workflow:**
1. ตัวแทน รพ. เลือก attendees ที่ต้องการชำระ
2. อัปโหลดหลักฐานการโอนเงิน → สร้าง finance record (status=1)
3. อัปเดต attendees.status = 2 (รอตรวจสอบ)
4. Admin ตรวจสอบหลักฐาน
5. ถ้าอนุมัติ: finance.status = 2, attendees.status = 9 (ชำระแล้ว)
6. ถ้าปฏิเสธ: finance.status = 9, attendees.status = 1 (ค้างชำระ)

---

## Settings (การตั้งค่า)

### settings - การตั้งค่าระบบ

**คำอธิบาย:** ค่าคงที่ต่างๆ ของงานประชุม

**ใช้ใน:** คำนวณค่าลงทะเบียน, แสดงข้อมูลบัญชีธนาคาร

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | Int | No | Primary Key | `1` |
| name | String | Yes | ชื่องานประชุม | `"ประชุมวิชาการ 2025"` |
| airline_station | String | Yes | สนามบินที่ใช้ | (ไม่ได้ใช้งาน) |
| account_name | String | Yes | ชื่อบัญชีรับโอนเงิน | `"มูลนิธิ นพ.บุญยงค์"` |
| account_bank | String | Yes | ธนาคาร | `"กรุงไทย"` |
| account_no | String | Yes | เลขที่บัญชี | `"507-3-44659-3"` |
| meet_price | Decimal(10,2) | Yes | ค่าลงทะเบียนปกติ (บาท) | `2000.00` |
| condition1 | Text | Yes | เงื่อนไขการชำระเงิน (HTML) | |
| condition2 | Text | Yes | เงื่อนไขเพิ่มเติม | |
| account_follow_name | String | Yes | ชื่อบัญชีสำหรับผู้ติดตาม | |
| account_follow_bank | String | Yes | ธนาคารสำหรับผู้ติดตาม | |
| account_follow_no | String | Yes | เลขที่บัญชีสำหรับผู้ติดตาม | |
| meet_price_follow | Decimal(10,2) | Yes | ค่าลงทะเบียนผู้ติดตาม | `1000.00` |

**การใช้งาน:**
- `meetPrice` ใช้คำนวณค่าลงทะเบียนสำหรับ `regTypeId != 6`
- `meetPriceFollow` ใช้คำนวณค่าลงทะเบียนสำหรับ `regTypeId = 6` (ผู้ติดตาม)

---

## Landing Page Content (เนื้อหาหน้าแรก)

### slideshows - สไลด์โชว์

**ใช้ใน:** Landing Page - Hero Section

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | Int | No | Primary Key |
| title | String | Yes | หัวข้อ/คำอธิบายรูป |
| image_url | String | No | URL รูปภาพ |
| link_url | String | Yes | ลิงก์เมื่อคลิก |
| sort_order | Int | No | ลำดับการแสดง (น้อย→มาก) |
| is_active | Boolean | No | แสดง/ซ่อน |
| created_at | DateTime | No | วันที่สร้าง |
| updated_at | DateTime | No | วันที่แก้ไข |

---

### news - ข่าวสาร

**ใช้ใน:** Landing Page - News Section

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | Int | No | Primary Key |
| title | String | No | หัวข้อข่าว |
| content | Text | No | เนื้อหาข่าว (HTML) |
| image_url | String | Yes | รูปประกอบข่าว |
| is_published | Boolean | No | เผยแพร่หรือไม่ |
| published_at | DateTime | No | วันที่เผยแพร่ |
| created_at | DateTime | No | วันที่สร้าง |
| updated_at | DateTime | No | วันที่แก้ไข |

---

### schedules - กำหนดการ

**ใช้ใน:** Landing Page - Schedule Section (Timeline)

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | Int | No | Primary Key | |
| day_number | Int | No | วันที่ (ใช้จัดกลุ่มเป็น tab) | `1`, `2`, `3` |
| date | DateTime | No | วันที่จริง | `2025-02-15` |
| start_time | String | No | เวลาเริ่ม | `"08:00"` |
| end_time | String | No | เวลาสิ้นสุด | `"09:00"` |
| title | String | No | หัวข้อกิจกรรม | |
| description | Text | Yes | รายละเอียด (HTML) | |
| location | String | Yes | สถานที่ | |
| speaker | String | Yes | วิทยากร | |
| sort_order | Int | No | ลำดับการแสดง | |
| created_at | DateTime | No | วันที่สร้าง | |
| updated_at | DateTime | No | วันที่แก้ไข | |

---

### footer_info - ข้อมูล Footer

**ใช้ใน:** Landing Page - Footer Section

| Column | Type | Nullable | Description | Example Keys |
|--------|------|----------|-------------|--------------|
| id | Int | No | Primary Key | |
| key | String | No | key สำหรับเรียกใช้ (Unique) | `"organizer_name"`, `"address"`, `"phone"`, `"email"` |
| value | Text | No | ค่าที่ต้องการแสดง | |
| created_at | DateTime | No | วันที่สร้าง | |
| updated_at | DateTime | No | วันที่แก้ไข | |

---

### site_config - การตั้งค่าเว็บไซต์

**ใช้ใน:** Navbar, Footer, ลิงก์ดาวน์โหลดเอกสาร

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | Int | No | Primary Key |
| logo_url | String | Yes | URL โลโก้งาน |
| google_drive_url | String | Yes | ลิงก์ Google Drive |
| created_at | DateTime | No | วันที่สร้าง |
| updated_at | DateTime | No | วันที่แก้ไข |

---

### attractions - สถานที่ท่องเที่ยว

**ใช้ใน:** Landing Page - Attractions Section

| Column | Type | Nullable | Description | Example |
|--------|------|----------|-------------|---------|
| id | Int | No | Primary Key | |
| name | String | No | ชื่อสถานที่ | `"วัดพระธาตุแช่แห้ง"` |
| description | Text | Yes | รายละเอียด | |
| image_url | String | Yes | รูปภาพ | |
| category | String | Yes | หมวดหมู่ | `"temple"`, `"nature"`, `"cultural"`, `"landmark"` |
| map_url | String | Yes | ลิงก์ Google Maps | |
| distance | String | Yes | ระยะทางจากสถานที่จัดงาน | `"2.5 กม."` |
| highlight | String | Yes | จุดเด่น | |
| sort_order | Int | No | ลำดับการแสดง | |
| is_active | Boolean | No | แสดง/ซ่อน | |
| created_at | DateTime | No | วันที่สร้าง | |
| updated_at | DateTime | No | วันที่แก้ไข | |

---

## Status Codes Reference

### Attendee Status (attendees.status)

| Code | Label | Description |
|------|-------|-------------|
| 1 | ค้างชำระ | ยังไม่ได้แจ้งชำระเงิน |
| 2 | รอตรวจสอบ | แจ้งชำระแล้ว รอ Admin ตรวจสอบ |
| 3 | ยกเลิก | ยกเลิกการลงทะเบียน |
| 9 | ชำระแล้ว | Admin ยืนยันการชำระเงินแล้ว |

### Finance Status (finances.status)

| Code | Label | Description |
|------|-------|-------------|
| 1 | รอตรวจสอบ | รอ Admin ตรวจสอบหลักฐาน |
| 2 | ผ่าน | Admin อนุมัติแล้ว |
| 9 | ไม่ผ่าน | Admin ปฏิเสธหลักฐาน |

### Food Type (attendees.food_type)

| Code | Label |
|------|-------|
| 1 | อาหารทั่วไป |
| 2 | อาหารอิสลาม |
| 3 | อาหารมังสวิรัติ |
| 4 | อาหารเจ |

### Vehicle Type (attendees.vehicle_type)

| Code | Label |
|------|-------|
| 1 | เครื่องบิน |
| 2 | รถโดยสาร |
| 3 | รถยนต์ส่วนตัว/ราชการ |
| 4 | รถไฟ |

### Shuttle (air_shuttle, bus_to_meet)

| Code | Label |
|------|-------|
| 1 | ต้องการ |
| 2 | ไม่ต้องการ |

### Member Type (members.member_type)

| Code | Label | Access |
|------|-------|--------|
| 1 | ตัวแทนโรงพยาบาล | เห็นเฉพาะข้อมูลของ รพ. ตัวเอง |
| 99 | Admin | เห็นข้อมูลทั้งหมด + หน้า admin |

---

## Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   zones     │────<│  hospitals  │────<│   members   │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          │                    │
                    ┌─────┴─────┐              │
                    ▼           ▼              ▼
              ┌──────────┐ ┌──────────┐  ┌──────────┐
              │attendees │ │ carnivals│  │ finances │
              └──────────┘ └──────────┘  └──────────┘
                    │
       ┌────────────┼────────────┐
       ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│positions │  │  levels  │  │ reg_types│
└──────────┘  └──────────┘  └──────────┘
                    │
                    ▼
              ┌──────────┐
              │  hotels  │
              └──────────┘
```

**Legend:**
- `────<` = One to Many (1:N)
- `▼` = Foreign Key Reference

---

## Notes for Developers

### การเพิ่ม Filter ใหม่
1. เพิ่ม column ใน `attendees` table
2. อัปเดต Prisma schema
3. Run `npm run db:migrate`
4. เพิ่ม filter ใน `AttendeeSearch.tsx` หรือ `ReportsClient.tsx`
5. อัปเดต server-side query ใน page.tsx

### การเพิ่มประเภทผู้ลงทะเบียนใหม่
1. เพิ่มข้อมูลใน `reg_types` table
2. ถ้ามีค่าลงทะเบียนต่างกัน ต้องอัปเดตโค้ดคำนวณเงิน

### Cascade Filter Logic
- Zone → Province → Hospital
- Position Group → Level
- เมื่อเปลี่ยน parent filter ต้อง reset child filters

### Important Constants
```typescript
// ค่าลงทะเบียน
meetPrice: number     // สำหรับประเภททั่วไป
meetPriceFollow: number  // สำหรับ regTypeId = 6 (ผู้ติดตาม)

// Admin check
const isAdmin = session.user.memberType === 99;
```
