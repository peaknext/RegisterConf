import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Zone data
const zones = [
  { code: "Z01", name: "เขตสุขภาพที่ 1" },
  { code: "Z02", name: "เขตสุขภาพที่ 2" },
  { code: "Z03", name: "เขตสุขภาพที่ 3" },
  { code: "Z04", name: "เขตสุขภาพที่ 4" },
  { code: "Z05", name: "เขตสุขภาพที่ 5" },
  { code: "Z06", name: "เขตสุขภาพที่ 6" },
  { code: "Z07", name: "เขตสุขภาพที่ 7" },
  { code: "Z08", name: "เขตสุขภาพที่ 8" },
  { code: "Z09", name: "เขตสุขภาพที่ 9" },
  { code: "Z10", name: "เขตสุขภาพที่ 10" },
  { code: "Z11", name: "เขตสุขภาพที่ 11" },
  { code: "Z12", name: "เขตสุขภาพที่ 12" },
  { code: "C01", name: "หน่วยงานส่วนกลาง" },
  { code: "C02", name: "ชมรม รพศ.รพท." },
];

// Airline data
const airlines = [
  { id: 1, name: "บางกอกแอร์เวย์", status: "n" },
  { id: 2, name: "นกแอร์", status: "y" },
  { id: 3, name: "ไทยแอร์เอเชีย", status: "y" },
  { id: 4, name: "ไทยไลอ้อนแอร์", status: "n" },
  { id: 5, name: "การบินไทย", status: "n" },
  { id: 6, name: "การบินไทยสมายล์", status: "n" },
  { id: 7, name: "ไทยเวียดเจ็ทแอร์", status: "n" },
];

// Level data
const levels = [
  { code: "L01", group: "กลุ่มบริหาร", name: "ระดับสูง", status: 1 },
  { code: "L02", group: "กลุ่มบริหาร", name: "ระดับต้น", status: 1 },
  { code: "L03", group: "กลุ่มอำนวยการ", name: "ระดับสูง", status: 1 },
  { code: "L04", group: "กลุ่มอำนวยการ", name: "ระดับต้น", status: 1 },
  { code: "L05", group: "กลุ่มวิชาการ", name: "ผู้ทรงคุณวุฒิ", status: 1 },
  { code: "L06", group: "กลุ่มวิชาการ", name: "เชี่ยวชาญ", status: 1 },
  { code: "L07", group: "กลุ่มวิชาการ", name: "ชำนาญการพิเศษ", status: 1 },
  { code: "L08", group: "กลุ่มวิชาการ", name: "ชำนาญการ", status: 1 },
  { code: "L09", group: "กลุ่มวิชาการ", name: "ปฏิบัติการ", status: 1 },
  { code: "L10", group: "กลุ่มทั่วไป", name: "ทักษะพิเศษ", status: 1 },
  { code: "L11", group: "กลุ่มทั่วไป", name: "อาวุโส", status: 1 },
  { code: "L12", group: "กลุ่มทั่วไป", name: "ชำนาญงาน", status: 1 },
  { code: "L13", group: "กลุ่มทั่วไป", name: "ปฏิบัติงาน", status: 1 },
  { code: "L14", group: "กลุ่มอื่นๆ", name: "ลูกจ้างประจำ", status: 1 },
  { code: "L15", group: "กลุ่มอื่นๆ", name: "พนักงานราชการ", status: 1 },
  { code: "L16", group: "กลุ่มอื่นๆ", name: "พนักงานกระทรวงสาธารณสุข", status: 1 },
  { code: "L17", group: "กลุ่มอื่นๆ", name: "ลูกจ้างชั่วคราว", status: 1 },
  { code: "L18", group: "กลุ่มอื่นๆ", name: "ลูกจ้างรายคาบ", status: 1 },
];

// RegType data
const regTypes = [
  { id: 1, name: "ผู้บริหารระดับ กระทรวง/เขต" },
  { id: 2, name: "ผู้อำนวยการ/ผู้บริหาร" },
  { id: 3, name: "วิทยากร/ผู้ทรงคุณวุฒิ" },
  { id: 4, name: "ผู้เกษียณ" },
  { id: 5, name: "ผู้เข้าร่วมประชุม" },
  { id: 6, name: "ผู้ติดตาม" },
];

// Position data (first 50 for brevity, will add more)
const positions = [
  { code: "1", name: "แพทย์" },
  { code: "2", name: "ทันตแพทย์" },
  { code: "3", name: "เภสัชกร" },
  { code: "4", name: "พยาบาลวิชาชีพ" },
  { code: "5", name: "นักกายภาพบำบัด" },
  { code: "6", name: "นักเทคนิคการแพทย์" },
  { code: "7", name: "นักรังสีการแพทย์" },
  { code: "8", name: "นักสังคมสงเคราะห์" },
  { code: "9", name: "นักวิชาการสาธารณสุข" },
  { code: "10", name: "นักจิตวิทยา" },
  { code: "11", name: "นักโภชนาการ" },
  { code: "12", name: "นักกิจกรรมบำบัด" },
  { code: "13", name: "นักจัดการงานทั่วไป" },
  { code: "14", name: "นักวิเคราะห์นโยบายและแผน" },
  { code: "15", name: "นักวิชาการเงินและบัญชี" },
  { code: "16", name: "นักวิชาการพัสดุ" },
  { code: "17", name: "นักทรัพยากรบุคคล" },
  { code: "18", name: "นิติกร" },
  { code: "19", name: "นักวิชาการคอมพิวเตอร์" },
  { code: "20", name: "นักวิชาการศึกษา" },
  { code: "21", name: "นักประชาสัมพันธ์" },
  { code: "22", name: "นักวิทยาศาสตร์การแพทย์" },
  { code: "23", name: "นักเวชศาสตร์การสื่อความหมาย" },
  { code: "24", name: "นักอาชีวบำบัด" },
  { code: "25", name: "นักฟิสิกส์การแพทย์" },
  { code: "26", name: "นักวิชาการตรวจสอบภายใน" },
  { code: "27", name: "นักเทคโนโลยีหัวใจและทรวงอก" },
  { code: "28", name: "นายแพทย์" },
  { code: "29", name: "เจ้าพนักงานธุรการ" },
  { code: "30", name: "เจ้าพนักงานการเงินและบัญชี" },
  { code: "31", name: "เจ้าพนักงานพัสดุ" },
  { code: "32", name: "เจ้าพนักงานเภสัชกรรม" },
  { code: "33", name: "เจ้าพนักงานทันตสาธารณสุข" },
  { code: "34", name: "เจ้าพนักงานสาธารณสุข" },
  { code: "35", name: "เจ้าพนักงานเวชสถิติ" },
  { code: "36", name: "เจ้าพนักงานวิทยาศาสตร์การแพทย์" },
  { code: "37", name: "เจ้าพนักงานรังสีการแพทย์" },
  { code: "38", name: "นายช่างเทคนิค" },
  { code: "39", name: "นายช่างไฟฟ้า" },
  { code: "40", name: "นายช่างโยธา" },
  { code: "41", name: "พนักงานช่วยเหลือคนไข้" },
  { code: "42", name: "พนักงานบริการ" },
  { code: "43", name: "พนักงานประกอบอาหาร" },
  { code: "44", name: "ผู้ช่วยพยาบาล" },
  { code: "45", name: "พนักงานเปล" },
  { code: "46", name: "ผู้อำนวยการ" },
  { code: "47", name: "รองผู้อำนวยการ" },
  { code: "48", name: "หัวหน้ากลุ่มงาน" },
  { code: "49", name: "หัวหน้างาน" },
  { code: "99", name: "อื่นๆ" },
];

// Hotel data
const hotels = [
  { id: 1, name: "โรงแรมเครสโค บุรีรัมย์", phone: "044 634 901", website: "https://www.crescoburiram.com/", mapUrl: "", busFlag: "Y", status: "y" },
  { id: 2, name: "โรงแรมอัลวาเรซ", phone: "044 611 555", website: "https://www.facebook.com/BuriramAlvarez", mapUrl: "", busFlag: "Y", status: "y" },
  { id: 3, name: "โรงแรมเทพนคร", phone: "044 613 400", website: "https://www.facebook.com/BuriramThepnakornHotel", mapUrl: "", busFlag: "Y", status: "y" },
  { id: 4, name: "โรงแรมอมารี บุรีรัมย์ ยูไนเต็ด", phone: "044 111 444", website: "https://www.amari.com/buriram-united", mapUrl: "", busFlag: "Y", status: "y" },
  { id: 5, name: "โรงแรมโมเดน่า", phone: "044 118 188", website: "https://www.facebook.com/ModenaByFraserBuriram", mapUrl: "", busFlag: "Y", status: "y" },
  { id: 6, name: "โรงแรมเดอะ คริสตัล โฮเทล บุรีรัมย์", phone: "044 634 678", website: "https://www.facebook.com/crystal.buriram", mapUrl: "https://maps.app.goo.gl/4f7yC4op1xSuSoxS9", busFlag: "Y", status: "y" },
  { id: 7, name: "โรงแรมมาเมซอง โฮเทล", phone: "091-8989164", website: "", mapUrl: "", busFlag: "Y", status: "y" },
  { id: 8, name: "โรงแรมกรีนแอทบุรีรัมย์", phone: "044-666086", website: "", mapUrl: "https://maps.app.goo.gl/BGW2ivF3Wifbe1s38", busFlag: "Y", status: "y" },
  { id: 9, name: "โรงแรมเดอ ศิตาปริ้นเซส", phone: "053 793 333", website: "", mapUrl: "https://maps.app.goo.gl/FGoWsNZE6ZoJgS8y8", busFlag: "Y", status: "y" },
  { id: 10, name: "โรงแรมบุรีเทล บุรีรัมย์", phone: "093-5451946", website: "", mapUrl: "https://maps.app.goo.gl/Z46EkWWhD47coWdZ7", busFlag: "Y", status: "y" },
  { id: 11, name: "โรงแรมอาร์ทู สลิปปิ้ง", phone: "053 912 333", website: "", mapUrl: "https://maps.app.goo.gl/WpeWDJX96rW58FiJ8", busFlag: "Y", status: "y" },
  { id: 12, name: "เรือนธารารีสอร์ท & วิลล่า", phone: "094-2657919", website: "", mapUrl: "https://maps.app.goo.gl/VJmMjW8pocCJhvgD9", busFlag: "Y", status: "y" },
  { id: 13, name: "โรงแรมแอกเนส", phone: "092-5949666", website: "https://www.facebook.com/hotelagnes", mapUrl: null, busFlag: "Y", status: "y" },
  { id: 14, name: "โรงแรมเรย์ โฮเทล บุรีรัมย์", phone: "044 110 767", website: null, mapUrl: null, busFlag: "Y", status: "y" },
  { id: 15, name: "โรงแรมเบส เวสเทิร์น รอยัล บุรีรัมย์", phone: "044 666 600", website: null, mapUrl: null, busFlag: "Y", status: "y" },
  { id: 16, name: "โรงแรมพาโนรามา บุรีรัมย์", phone: "093-5451946", website: null, mapUrl: null, busFlag: "Y", status: "y" },
  { id: 17, name: "โรงแรมคลิม โฮเทล", phone: null, website: null, mapUrl: null, busFlag: "Y", status: "y" },
  { id: 18, name: "โรงแรม เดอะเซอร์เคิล", phone: null, website: null, mapUrl: null, busFlag: "Y", status: "y" },
  { id: 19, name: "โรงแรมบีทู บุรีรัมย์ บูทิก แอนด์ บัดเจ็ต", phone: null, website: null, mapUrl: null, busFlag: "Y", status: "y" },
  { id: 20, name: "โรงแรมสยามบูทีค", phone: null, website: null, mapUrl: null, busFlag: "Y", status: "y" },
  { id: 21, name: "โรงแรม เดอะ เอส จี โฮเทล", phone: null, website: null, mapUrl: null, busFlag: "Y", status: "y" },
  { id: 22, name: "ร.ร. อื่นๆ", phone: null, website: null, mapUrl: null, busFlag: "Y", status: "y" },
];

// Hospital data (partial list - first 50)
const hospitals = [
  { code: "H001", hospitalType: "A", name: "รพ.นครพิงค์", zoneCode: "Z01", province: "เชียงใหม่" },
  { code: "H002", hospitalType: "A", name: "รพ.ลำปาง", zoneCode: "Z01", province: "ลำปาง" },
  { code: "H003", hospitalType: "A", name: "รพ.เชียงรายประชานุเคราะห์", zoneCode: "Z01", province: "เชียงราย" },
  { code: "H004", hospitalType: "A", name: "รพ.อุตรดิตถ์", zoneCode: "Z02", province: "อุตรดิตถ์" },
  { code: "H005", hospitalType: "A", name: "รพ.พุทธชินราช พิษณุโลก", zoneCode: "Z02", province: "พิษณุโลก" },
  { code: "H006", hospitalType: "A", name: "รพศ.สวรรค์ประชารักษ์", zoneCode: "Z03", province: "นครสวรรค์" },
  { code: "H007", hospitalType: "A", name: "รพ.พระนั่งเกล้า", zoneCode: "Z04", province: "นนทบุรี" },
  { code: "H008", hospitalType: "A", name: "รพ.พระนครศรีอยุธยา", zoneCode: "Z04", province: "พระนครศรีอยุธยา" },
  { code: "H009", hospitalType: "A", name: "รพ.ราชบุรี", zoneCode: "Z05", province: "ราชบุรี" },
  { code: "H010", hospitalType: "A", name: "รพ.เจ้าพระยายมราช", zoneCode: "Z05", province: "สุพรรณบุรี" },
  { code: "H011", hospitalType: "A", name: "รพ.นครปฐม", zoneCode: "Z05", province: "นครปฐม" },
  { code: "H012", hospitalType: "A", name: "รพ.สมุทรสาคร", zoneCode: "Z05", province: "สมุทรสาคร" },
  { code: "H013", hospitalType: "A", name: "รพ.สมุทรปราการ", zoneCode: "Z06", province: "สมุทรปราการ" },
  { code: "H014", hospitalType: "A", name: "รพ.ชลบุรี", zoneCode: "Z06", province: "ชลบุรี" },
  { code: "H015", hospitalType: "A", name: "รพ.ระยอง", zoneCode: "Z06", province: "ระยอง" },
  { code: "H016", hospitalType: "A", name: "รพ.พระปกเกล้า", zoneCode: "Z06", province: "จันทบุรี" },
  { code: "H017", hospitalType: "A", name: "รพ.พุทธโสธร", zoneCode: "Z06", province: "ฉะเชิงเทรา" },
  { code: "H018", hospitalType: "A", name: "รพ.เจ้าพระยาอภัยภูเบศร", zoneCode: "Z06", province: "ปราจีนบุรี" },
  { code: "H019", hospitalType: "A", name: "รพ.ขอนแก่น", zoneCode: "Z07", province: "ขอนแก่น" },
  { code: "H020", hospitalType: "A", name: "รพ.ร้อยเอ็ด", zoneCode: "Z07", province: "ร้อยเอ็ด" },
  { code: "H021", hospitalType: "A", name: "รพ.อุดรธานี", zoneCode: "Z08", province: "อุดรธานี" },
  { code: "H022", hospitalType: "A", name: "รพ.สกลนคร", zoneCode: "Z08", province: "สกลนคร" },
  { code: "H023", hospitalType: "A", name: "รพ.มหาราชนครราชสีมา", zoneCode: "Z09", province: "นครราชสีมา" },
  { code: "H024", hospitalType: "A", name: "รพ.บุรีรัมย์", zoneCode: "Z09", province: "บุรีรัมย์" },
  { code: "H025", hospitalType: "A", name: "รพ.สุรินทร์", zoneCode: "Z09", province: "สุรินทร์" },
  { code: "H026", hospitalType: "A", name: "รพ.ศรีสะเกษ", zoneCode: "Z10", province: "ศรีสะเกษ" },
  { code: "H027", hospitalType: "A", name: "รพ.สรรพสิทธิประสงค์", zoneCode: "Z10", province: "อุบลราชธานี" },
  { code: "H028", hospitalType: "A", name: "รพ.มหาราชนครศรีธรรมราช", zoneCode: "Z11", province: "นครศรีธรรมราช" },
  { code: "H029", hospitalType: "A", name: "รพ.วชิระภูเก็ต", zoneCode: "Z11", province: "ภูเก็ต" },
  { code: "H030", hospitalType: "A", name: "รพ.สุราษฎร์ธานี", zoneCode: "Z11", province: "สุราษฎร์ธานี" },
  { code: "H031", hospitalType: "A", name: "รพ.หาดใหญ่", zoneCode: "Z12", province: "สงขลา" },
  { code: "H032", hospitalType: "A", name: "รพ.ตรัง", zoneCode: "Z12", province: "ตรัง" },
  { code: "H033", hospitalType: "A", name: "รพ.ยะลา", zoneCode: "Z12", province: "ยะลา" },
  { code: "H034", hospitalType: "S", name: "รพ.ลำพูน", zoneCode: "Z01", province: "ลำพูน" },
  { code: "H035", hospitalType: "S", name: "รพ.แพร่", zoneCode: "Z01", province: "แพร่" },
  { code: "H036", hospitalType: "S", name: "รพ.น่าน", zoneCode: "Z01", province: "น่าน" },
  { code: "H037", hospitalType: "S", name: "รพ.พะเยา", zoneCode: "Z01", province: "พะเยา" },
  { code: "H038", hospitalType: "S", name: "รพ.ศรีสังวาลย์", zoneCode: "Z01", province: "แม่ฮ่องสอน" },
  { code: "H039", hospitalType: "S", name: "รพ.สมเด็จพระเจ้าตากสินมหาราช", zoneCode: "Z02", province: "ตาก" },
  { code: "H040", hospitalType: "S", name: "รพ.แม่สอด", zoneCode: "Z02", province: "ตาก" },
  { code: "H041", hospitalType: "S", name: "รพ.สุโขทัย", zoneCode: "Z02", province: "สุโขทัย" },
  { code: "H042", hospitalType: "S", name: "รพ.เพชรบูรณ์", zoneCode: "Z02", province: "เพชรบูรณ์" },
  { code: "H043", hospitalType: "S", name: "รพ.ชัยนาทนเรนทร", zoneCode: "Z03", province: "ชัยนาท" },
  { code: "H044", hospitalType: "S", name: "รพ.อุทัยธานี", zoneCode: "Z03", province: "อุทัยธานี" },
  { code: "H045", hospitalType: "S", name: "รพ.กำแพงเพชร", zoneCode: "Z03", province: "กำแพงเพชร" },
  { code: "H046", hospitalType: "S", name: "รพ.พิจิตร", zoneCode: "Z03", province: "พิจิตร" },
  { code: "H047", hospitalType: "S", name: "รพ.ปทุมธานี", zoneCode: "Z04", province: "ปทุมธานี" },
  { code: "H048", hospitalType: "S", name: "รพ.อ่างทอง", zoneCode: "Z04", province: "อ่างทอง" },
  { code: "H049", hospitalType: "S", name: "รพ.พระนารายณ์มหาราช", zoneCode: "Z04", province: "ลพบุรี" },
  { code: "H050", hospitalType: "S", name: "รพ.นครนายก", zoneCode: "Z04", province: "นครนายก" },
];

// More hospitals (continuing)
const hospitalsMore = [
  { code: "H051", hospitalType: "S", name: "รพ.บ้านโป่ง", zoneCode: "Z05", province: "ราชบุรี" },
  { code: "H052", hospitalType: "S", name: "รพ.พหลพลพยุหเสนา", zoneCode: "Z05", province: "กาญจนบุรี" },
  { code: "H053", hospitalType: "S", name: "รพ.สมเด็จพระพุทธเลิศหล้า", zoneCode: "Z05", province: "สมุทรสงคราม" },
  { code: "H054", hospitalType: "S", name: "รพ.พระจอมเกล้า", zoneCode: "Z05", province: "เพชรบุรี" },
  { code: "H055", hospitalType: "S", name: "รพ.ประจวบคีรีขันธ์", zoneCode: "Z05", province: "ประจวบคีรีขันธ์" },
  { code: "H056", hospitalType: "S", name: "รพ.หัวหิน", zoneCode: "Z05", province: "ประจวบคีรีขันธ์" },
  { code: "H057", hospitalType: "S", name: "รพ.ตราด", zoneCode: "Z06", province: "ตราด" },
  { code: "H058", hospitalType: "S", name: "รพ.สมเด็จพระยุพราชสระแก้ว", zoneCode: "Z06", province: "สระแก้ว" },
  { code: "H059", hospitalType: "S", name: "รพ.มหาสารคาม", zoneCode: "Z07", province: "มหาสารคาม" },
  { code: "H060", hospitalType: "S", name: "รพ.กาฬสินธุ์", zoneCode: "Z07", province: "กาฬสินธุ์" },
  { code: "H061", hospitalType: "S", name: "รพ.บึงกาฬ", zoneCode: "Z08", province: "บึงกาฬ" },
  { code: "H062", hospitalType: "S", name: "รพ.หนองบัวลำภู", zoneCode: "Z08", province: "หนองบัวลำภู" },
  { code: "H063", hospitalType: "S", name: "รพ.เลย", zoneCode: "Z08", province: "เลย" },
  { code: "H064", hospitalType: "S", name: "รพ.หนองคาย", zoneCode: "Z08", province: "หนองคาย" },
  { code: "H065", hospitalType: "S", name: "รพ.นครพนม", zoneCode: "Z08", province: "นครพนม" },
  { code: "H066", hospitalType: "S", name: "รพ.ปากช่องนานา", zoneCode: "Z09", province: "นครราชสีมา" },
  { code: "H067", hospitalType: "S", name: "รพ.นางรอง", zoneCode: "Z09", province: "บุรีรัมย์" },
  { code: "H068", hospitalType: "A", name: "รพ.ชัยภูมิ", zoneCode: "Z09", province: "ชัยภูมิ" },
  { code: "H069", hospitalType: "S", name: "รพ.สมเด็จพระยุพราชเดชอุดม", zoneCode: "Z10", province: "อุบลราชธานี" },
  { code: "H070", hospitalType: "S", name: "รพ.๕๐ พรรษา มหาวชิราลงกรณ", zoneCode: "Z10", province: "อุบลราชธานี" },
  { code: "H071", hospitalType: "S", name: "รพ.ยโสธร", zoneCode: "Z10", province: "ยโสธร" },
  { code: "H072", hospitalType: "S", name: "รพ.อำนาจเจริญ", zoneCode: "Z10", province: "อำนาจเจริญ" },
  { code: "H073", hospitalType: "S", name: "รพ.มุกดาหาร", zoneCode: "Z10", province: "มุกดาหาร" },
  { code: "H074", hospitalType: "S", name: "รพ.ทุ่งสง", zoneCode: "Z11", province: "นครศรีธรรมราช" },
  { code: "H075", hospitalType: "S", name: "รพ.กระบี่", zoneCode: "Z11", province: "กระบี่" },
  { code: "H076", hospitalType: "S", name: "รพ.พังงา", zoneCode: "Z11", province: "พังงา" },
  { code: "H077", hospitalType: "S", name: "รพ.ระนอง", zoneCode: "Z11", province: "ระนอง" },
  { code: "H078", hospitalType: "S", name: "รพ.ชุมพรเขตรอุดมศักดิ์", zoneCode: "Z11", province: "ชุมพร" },
  { code: "H079", hospitalType: "S", name: "รพ.สงขลา", zoneCode: "Z12", province: "สงขลา" },
  { code: "H080", hospitalType: "S", name: "รพ.สตูล", zoneCode: "Z12", province: "สตูล" },
  { code: "H081", hospitalType: "S", name: "รพ.พัทลุง", zoneCode: "Z12", province: "พัทลุง" },
  { code: "H082", hospitalType: "S", name: "รพ.ปัตตานี", zoneCode: "Z12", province: "ปัตตานี" },
  { code: "H083", hospitalType: "S", name: "รพ.นราธิวาสราชนครินทร์", zoneCode: "Z12", province: "นราธิวาส" },
  { code: "H124", hospitalType: "A", name: "รพ.สระบุรี", zoneCode: "Z04", province: "สระบุรี" },
  { code: "H126", hospitalType: "S", name: "รพ.สิงห์บุรี", zoneCode: "Z04", province: "สิงห์บุรี" },
  { code: "H152", hospitalType: null, name: "หน่วยงานอื่น ๆ ... โปรดระบุ", zoneCode: null, province: "อื่นๆ" },
  { code: "H154", hospitalType: null, name: "ชมรมโรงพยาบาลศูนย์/โรงพยาบาลทั่วไป", zoneCode: "C01", province: "ส่วนกลาง" },
];

// Sample members (admins only for now)
const members = [
  { id: 1, email: "admin@gmail.com", password: "bea7d61cdd768c758ec84381a62d19fe", hospitalCode: "H024", memberType: 99, createdAt: new Date("2024-06-08 12:25:07") },
  { id: 146, email: "brh70th@gmail.com", password: "2f4721bcf9e8fcf67a0f067547ec216d", hospitalCode: "H024", memberType: 99, createdAt: new Date("2025-05-21") },
  { id: 147, email: "loveangel.bk@gmail.com", password: "e4a1565d6aca3eb9003e5219cae6cf27", hospitalCode: "H024", memberType: 99, createdAt: new Date("2025-05-26") },
];

async function main() {
  console.log("Starting seed...");

  // Clear existing data
  console.log("Clearing existing data...");
  await prisma.attendee.deleteMany();
  await prisma.finance.deleteMany();
  await prisma.member.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.level.deleteMany();
  await prisma.position.deleteMany();
  await prisma.regType.deleteMany();
  await prisma.airline.deleteMany();
  await prisma.hotel.deleteMany();

  // Seed Zones
  console.log("Seeding zones...");
  for (const zone of zones) {
    await prisma.zone.create({ data: zone });
  }
  console.log(`Created ${zones.length} zones`);

  // Seed Airlines
  console.log("Seeding airlines...");
  for (const airline of airlines) {
    await prisma.airline.create({ data: airline });
  }
  console.log(`Created ${airlines.length} airlines`);

  // Seed Levels
  console.log("Seeding levels...");
  for (const level of levels) {
    await prisma.level.create({ data: level });
  }
  console.log(`Created ${levels.length} levels`);

  // Seed RegTypes
  console.log("Seeding reg types...");
  for (const regType of regTypes) {
    await prisma.regType.create({ data: regType });
  }
  console.log(`Created ${regTypes.length} reg types`);

  // Seed Positions
  console.log("Seeding positions...");
  for (const position of positions) {
    await prisma.position.create({ data: position });
  }
  console.log(`Created ${positions.length} positions`);

  // Seed Hotels
  console.log("Seeding hotels...");
  for (const hotel of hotels) {
    await prisma.hotel.create({ data: hotel });
  }
  console.log(`Created ${hotels.length} hotels`);

  // Seed Hospitals
  console.log("Seeding hospitals...");
  const allHospitals = [...hospitals, ...hospitalsMore];
  for (const hospital of allHospitals) {
    await prisma.hospital.create({ data: hospital });
  }
  console.log(`Created ${allHospitals.length} hospitals`);

  // Seed Members (admins)
  console.log("Seeding members...");
  for (const member of members) {
    await prisma.member.create({ data: member });
  }
  console.log(`Created ${members.length} members`);

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
