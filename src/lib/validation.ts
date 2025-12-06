import { z } from "zod";

// ===== Common Validation Schemas =====

export const emailSchema = z
  .string()
  .email("รูปแบบอีเมลไม่ถูกต้อง")
  .max(254, "อีเมลยาวเกินไป");

export const phoneSchema = z
  .string()
  .min(9, "เบอร์โทรศัพท์สั้นเกินไป")
  .max(20, "เบอร์โทรศัพท์ยาวเกินไป")
  .regex(/^[\d+\-() ]+$/, "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง");

export const passwordSchema = z
  .string()
  .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
  .max(128, "รหัสผ่านยาวเกินไป");

export const hospitalCodeSchema = z
  .string()
  .min(1, "กรุณาระบุรหัสโรงพยาบาล")
  .max(50, "รหัสโรงพยาบาลยาวเกินไป")
  .regex(/^[A-Z0-9]+$/i, "รหัสโรงพยาบาลไม่ถูกต้อง");

export const idSchema = z.coerce
  .number()
  .int("ID ต้องเป็นจำนวนเต็ม")
  .positive("ID ต้องเป็นจำนวนบวก");

// ===== Attendee Schemas =====

export const attendeeCreateSchema = z.object({
  prefix: z.string().min(1, "กรุณาเลือกคำนำหน้า").max(50),
  firstName: z.string().min(1, "กรุณากรอกชื่อ").max(100),
  lastName: z.string().min(1, "กรุณากรอกนามสกุล").max(100),
  regTypeId: z.coerce.number().int().positive("กรุณาเลือกประเภทการลงทะเบียน"),
  positionCode: z.string().max(50).nullable().optional(),
  positionOther: z.string().max(200).nullable().optional(),
  levelCode: z.string().max(50).nullable().optional(),
  phone: phoneSchema,
  email: emailSchema.nullable().optional(),
  line: z.string().max(100).nullable().optional(),
  foodType: z.coerce.number().int().min(1).max(4).default(1),
  vehicleType: z.coerce.number().int().min(1).max(4).nullable().optional(),

  // Air travel
  airDate1: z.string().nullable().optional(),
  airline1: z.string().max(100).nullable().optional(),
  flightNo1: z.string().max(20).nullable().optional(),
  airTime1: z.string().nullable().optional(),
  airDate2: z.string().nullable().optional(),
  airline2: z.string().max(100).nullable().optional(),
  flightNo2: z.string().max(20).nullable().optional(),
  airTime2: z.string().nullable().optional(),
  airShuttle: z.coerce.number().int().min(1).max(2).nullable().optional(),

  // Bus travel
  busDate1: z.string().nullable().optional(),
  busLine1: z.string().max(100).nullable().optional(),
  busTime1: z.string().nullable().optional(),
  busDate2: z.string().nullable().optional(),
  busLine2: z.string().max(100).nullable().optional(),
  busTime2: z.string().nullable().optional(),
  busShuttle: z.coerce.number().int().min(1).max(2).nullable().optional(),

  // Train travel
  trainDate1: z.string().nullable().optional(),
  trainLine1: z.string().max(100).nullable().optional(),
  trainTime1: z.string().nullable().optional(),
  trainDate2: z.string().nullable().optional(),
  trainLine2: z.string().max(100).nullable().optional(),
  trainTime2: z.string().nullable().optional(),
  trainShuttle: z.coerce.number().int().min(1).max(2).nullable().optional(),

  // Accommodation
  hotelId: z.coerce.number().int().positive().nullable().optional(),
  hotelOther: z.string().max(200).nullable().optional(),
  busToMeet: z.coerce.number().int().min(1).max(2).nullable().optional(),

  // Admin only
  hospitalCode: z.string().max(50).nullable().optional(),
});

export type AttendeeCreateInput = z.infer<typeof attendeeCreateSchema>;

// ===== Member Schemas =====

export const memberCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  hospitalCode: z.string().max(50).nullable().optional(),
  memberType: z.coerce.number().int().refine(
    (val) => [1, 99].includes(val),
    { message: "Member type ต้องเป็น 1 หรือ 99" }
  ).default(1),
});

export type MemberCreateInput = z.infer<typeof memberCreateSchema>;

export const memberPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export const memberBulkPasswordSchema = z.object({
  memberIds: z.array(z.coerce.number().int().positive()).min(1, "กรุณาเลือกสมาชิก"),
  newPassword: passwordSchema,
});

// ===== Payment Schema =====

export const paymentSchema = z.object({
  attendeeIds: z.string().min(1, "กรุณาเลือกผู้ลงทะเบียน"),
  memberId: z.string().min(1, "กรุณาระบุ Member ID"),
  paidDate: z.string().nullable().optional(),
});

// ===== Validation Helper =====

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
  message?: string;
}

/**
 * Validate data against a Zod schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
    };
  }

  return {
    success: false,
    errors: result.error,
    message: result.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง",
  };
}

/**
 * Format Zod errors for API response
 */
export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!formatted[path]) {
      formatted[path] = issue.message;
    }
  }

  return formatted;
}
