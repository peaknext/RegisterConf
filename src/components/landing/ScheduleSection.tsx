/**
 * Conference Schedule Section Component.
 *
 * Displays a multi-day conference schedule with room-based parallel sessions.
 * Supports day tabs, time slot grouping, and various session types.
 *
 * @module ScheduleSection
 *
 * ## Features
 * - **Multi-day Tabs**: Switch between conference days
 * - **Time Slot Grouping**: Sessions grouped by start/end time
 * - **Room Assignment**: Main hall + 2 breakout rooms with color coding
 * - **Session Types**: Session, break, meal, event with icons
 * - **Responsive Design**: Mobile-optimized layout
 *
 * ## Room Configuration
 * - main: ห้องประชุมใหญ่ (blue)
 * - room1: ห้องย่อย 1 (cyan)
 * - room2: ห้องย่อย 2 (gold)
 * - all: Spans all columns (e.g., meals, breaks)
 *
 * @see {@link ../../app/(public)/page.tsx} for landing page integration
 */
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Clock, User, Calendar, Coffee, Utensils } from "lucide-react";

/**
 * Schedule item data structure from database.
 *
 * @property dayNumber - Day number (1, 2, 3...) for tab grouping
 * @property date - Actual date of the session
 * @property startTime - Start time (HH:mm format)
 * @property endTime - End time (HH:mm format)
 * @property room - Room assignment: "main", "room1", "room2", or "all" for full-width
 * @property type - Session type: "session", "break", "meal", or "event"
 */
interface ScheduleItem {
  id: number;
  dayNumber: number;
  date: Date;
  startTime: string;
  endTime: string;
  title: string;
  description?: string | null;
  location?: string | null;
  speaker?: string | null;
  room?: "main" | "room1" | "room2" | "all" | null;
  type?: "session" | "break" | "meal" | "event" | null;
}

/**
 * Props for ScheduleSection component.
 *
 * @property schedules - Array of schedule items from database. Falls back to mock data if empty.
 */
interface ScheduleSectionProps {
  schedules?: ScheduleItem[];
}

// Default mock schedule data with room assignments
const defaultSchedules: ScheduleItem[] = [
  // Day 1 - 25 มิถุนายน 2569
  { id: 1, dayNumber: 1, date: new Date("2026-06-25"), startTime: "08:00", endTime: "09:00", title: "ลงทะเบียนและรับเอกสาร", room: "all", type: "event" },
  { id: 2, dayNumber: 1, date: new Date("2026-06-25"), startTime: "09:00", endTime: "09:30", title: "พิธีเปิดการประชุม", speaker: "ปลัดกระทรวงสาธารณสุข", room: "main", type: "session" },
  { id: 3, dayNumber: 1, date: new Date("2026-06-25"), startTime: "09:30", endTime: "10:30", title: "ปาฐกถาพิเศษ: ทิศทางการพัฒนาระบบสุขภาพไทย", speaker: "รมว.สาธารณสุข", room: "main", type: "session" },
  { id: 4, dayNumber: 1, date: new Date("2026-06-25"), startTime: "10:30", endTime: "10:45", title: "พักรับประทานอาหารว่าง", room: "all", type: "break" },
  { id: 5, dayNumber: 1, date: new Date("2026-06-25"), startTime: "10:45", endTime: "12:00", title: "เสวนา: การบริหารโรงพยาบาลยุคใหม่", speaker: "ผอ.รพศ. 5 แห่ง", room: "main", type: "session" },
  { id: 6, dayNumber: 1, date: new Date("2026-06-25"), startTime: "12:00", endTime: "13:00", title: "รับประทานอาหารกลางวัน", room: "all", type: "meal" },
  // Afternoon - parallel sessions
  { id: 7, dayNumber: 1, date: new Date("2026-06-25"), startTime: "13:00", endTime: "14:30", title: "Digital Transformation in Healthcare", speaker: "ดร.สมชาย วิทยากร", room: "main", type: "session" },
  { id: 8, dayNumber: 1, date: new Date("2026-06-25"), startTime: "13:00", endTime: "14:30", title: "การบริหารความเสี่ยงในโรงพยาบาล", speaker: "นพ.วิชัย ปลอดภัย", room: "room1", type: "session" },
  { id: 9, dayNumber: 1, date: new Date("2026-06-25"), startTime: "13:00", endTime: "14:30", title: "Lean Management สำหรับ รพ.", speaker: "ภก.สุรศักดิ์ คุณภาพ", room: "room2", type: "session" },
  { id: 10, dayNumber: 1, date: new Date("2026-06-25"), startTime: "14:30", endTime: "14:45", title: "พักรับประทานอาหารว่าง", room: "all", type: "break" },
  { id: 11, dayNumber: 1, date: new Date("2026-06-25"), startTime: "14:45", endTime: "16:00", title: "AI & Big Data ในการแพทย์", speaker: "ดร.นวัตกรรม ดิจิทัล", room: "main", type: "session" },
  { id: 12, dayNumber: 1, date: new Date("2026-06-25"), startTime: "14:45", endTime: "16:00", title: "การพัฒนาคุณภาพบริการ", speaker: "พว.มาตรฐาน สูงส่ง", room: "room1", type: "session" },
  { id: 13, dayNumber: 1, date: new Date("2026-06-25"), startTime: "14:45", endTime: "16:00", title: "Green Hospital", speaker: "นพ.สิ่งแวดล้อม รักษ์โลก", room: "room2", type: "session" },
  { id: 14, dayNumber: 1, date: new Date("2026-06-25"), startTime: "18:00", endTime: "21:00", title: "งานเลี้ยงต้อนรับ", room: "all", type: "event" },

  // Day 2 - 26 มิถุนายน 2569
  { id: 15, dayNumber: 2, date: new Date("2026-06-26"), startTime: "08:30", endTime: "09:00", title: "ลงทะเบียน", room: "all", type: "event" },
  { id: 16, dayNumber: 2, date: new Date("2026-06-26"), startTime: "09:00", endTime: "10:30", title: "การบริหารงบประมาณและการเงิน รพ.", speaker: "ผู้เชี่ยวชาญด้านการเงิน", room: "main", type: "session" },
  { id: 17, dayNumber: 2, date: new Date("2026-06-26"), startTime: "10:30", endTime: "10:45", title: "พักรับประทานอาหารว่าง", room: "all", type: "break" },
  { id: 18, dayNumber: 2, date: new Date("2026-06-26"), startTime: "10:45", endTime: "12:00", title: "นำเสนอผลงานวิชาการ (Oral)", room: "main", type: "session" },
  { id: 19, dayNumber: 2, date: new Date("2026-06-26"), startTime: "12:00", endTime: "13:00", title: "รับประทานอาหารกลางวัน", room: "all", type: "meal" },
  // Afternoon - parallel sessions
  { id: 20, dayNumber: 2, date: new Date("2026-06-26"), startTime: "13:00", endTime: "14:30", title: "การพัฒนาบุคลากรทางการแพทย์", speaker: "ผู้เชี่ยวชาญ HR", room: "main", type: "session" },
  { id: 21, dayNumber: 2, date: new Date("2026-06-26"), startTime: "13:00", endTime: "14:30", title: "Telemedicine & Digital Health", speaker: "นพ.เทเลเมด ออนไลน์", room: "room1", type: "session" },
  { id: 22, dayNumber: 2, date: new Date("2026-06-26"), startTime: "13:00", endTime: "14:30", title: "Patient Safety Goals", speaker: "พว.ปลอดภัย ไร้อันตราย", room: "room2", type: "session" },
  { id: 23, dayNumber: 2, date: new Date("2026-06-26"), startTime: "14:30", endTime: "16:00", title: "ชมนิทรรศการ Poster Presentation", room: "all", type: "event" },
  { id: 24, dayNumber: 2, date: new Date("2026-06-26"), startTime: "18:00", endTime: "22:00", title: "งานราตรีสโมสร & มอบรางวัล", room: "all", type: "event" },

  // Day 3 - 27 มิถุนายน 2569
  { id: 25, dayNumber: 3, date: new Date("2026-06-27"), startTime: "08:30", endTime: "09:00", title: "ลงทะเบียน", room: "all", type: "event" },
  { id: 26, dayNumber: 3, date: new Date("2026-06-27"), startTime: "09:00", endTime: "10:30", title: "ความท้าทายและโอกาสของระบบสุขภาพไทย", speaker: "ศ.นพ.วิชัย เอกพลากร", room: "main", type: "session" },
  { id: 27, dayNumber: 3, date: new Date("2026-06-27"), startTime: "10:30", endTime: "10:45", title: "พักรับประทานอาหารว่าง", room: "all", type: "break" },
  { id: 28, dayNumber: 3, date: new Date("2026-06-27"), startTime: "10:45", endTime: "12:00", title: "ประชุมใหญ่สามัญประจำปี ชมรม รพศ./รพท.", speaker: "ประธานชมรม", room: "main", type: "session" },
  { id: 29, dayNumber: 3, date: new Date("2026-06-27"), startTime: "12:00", endTime: "13:00", title: "รับประทานอาหารกลางวัน", room: "all", type: "meal" },
  { id: 30, dayNumber: 3, date: new Date("2026-06-27"), startTime: "13:00", endTime: "14:00", title: "สรุปผลการประชุมและข้อเสนอแนะ", speaker: "คณะกรรมการจัดงาน", room: "main", type: "session" },
  { id: 31, dayNumber: 3, date: new Date("2026-06-27"), startTime: "14:00", endTime: "14:30", title: "พิธีปิดการประชุม & ส่งมอบธง", speaker: "ประธานชมรม", room: "main", type: "session" },
];

/**
 * Room configuration with color coding.
 */
const rooms = [
  { id: "main", name: "ห้องประชุมใหญ่", color: "bg-kram-600" },
  { id: "room1", name: "ห้องย่อย 1", color: "bg-cyan-600" },
  { id: "room2", name: "ห้องย่อย 2", color: "bg-gold-600" },
];

/**
 * Multi-day conference schedule display with room-based layout.
 *
 * @component
 *
 * @example
 * // With database schedules
 * <ScheduleSection schedules={schedules} />
 *
 * @example
 * // Falls back to mock data if no schedules provided
 * <ScheduleSection />
 */
export function ScheduleSection({ schedules }: ScheduleSectionProps) {
  // Use provided schedules or fall back to mock data
  const activeSchedules = schedules && schedules.length > 0 ? schedules : defaultSchedules;

  /**
   * Group schedules by day number for tab navigation.
   */
  const schedulesByDay = activeSchedules.reduce((acc, schedule) => {
    const day = schedule.dayNumber;
    if (!acc[day]) acc[day] = [];
    acc[day].push(schedule);
    return acc;
  }, {} as Record<number, ScheduleItem[]>);

  const days = Object.keys(schedulesByDay).map(Number).sort((a, b) => a - b);
  const [activeDay, setActiveDay] = useState(days[0] || 1);

  /**
   * Format date to Thai short format (e.g., "25 มิ.ย.")
   */
  const formatShortDate = (date: Date) => {
    return new Date(date).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  };

  const currentSchedules = schedulesByDay[activeDay] || [];

  /**
   * Group schedules by time slot for parallel session display.
   * Sessions at same time appear in the same row.
   */
  const timeSlots = currentSchedules.reduce((acc, schedule) => {
    const key = `${schedule.startTime}-${schedule.endTime}`;
    if (!acc[key]) acc[key] = { startTime: schedule.startTime, endTime: schedule.endTime, items: [] };
    acc[key].items.push(schedule);
    return acc;
  }, {} as Record<string, { startTime: string; endTime: string; items: ScheduleItem[] }>);

  const sortedTimeSlots = Object.values(timeSlots).sort((a, b) => a.startTime.localeCompare(b.startTime));

  /**
   * Get icon for session type (break=coffee, meal=utensils).
   */
  const getTypeIcon = (type: string | null | undefined) => {
    switch (type) {
      case "break": return <Coffee className="w-3.5 h-3.5" />;
      case "meal": return <Utensils className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  /**
   * Get styling classes for session type.
   */
  const getTypeStyle = (type: string | null | undefined) => {
    switch (type) {
      case "break": return "bg-gray-50 border-gray-200 text-gray-500";
      case "meal": return "bg-gray-50 border-gray-200 text-gray-500";
      case "event": return "bg-kram-50 border-kram-200 text-kram-600";
      default: return "";
    }
  };

  /**
   * Get background color class for room indicator.
   */
  const getRoomColor = (room: string | null | undefined) => {
    switch (room) {
      case "main": return "bg-kram-600";
      case "room1": return "bg-cyan-600";
      case "room2": return "bg-gold-500";
      default: return "bg-gray-400";
    }
  };

  return (
    <section id="schedule" className="py-16 md:py-24 bg-gradient-to-b from-kram-50 to-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        {/* Section Header - Compact */}
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-700 text-xs font-semibold rounded-full mb-3">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            ตารางงาน
          </span>
          <h2 className="text-2xl md:text-4xl font-bold text-kram-900 premium-underline">กำหนดการ</h2>
        </div>

        {days.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-kram-300 mx-auto mb-3" />
            <p className="text-kram-400">ยังไม่มีกำหนดการ</p>
          </div>
        ) : (
          <>
            {/* Day Tabs - Compact */}
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="inline-flex bg-white rounded-xl p-1.5 shadow-md border border-kram-100">
                {days.map((day) => {
                  const daySchedule = schedulesByDay[day][0];
                  return (
                    <button
                      key={day}
                      onClick={() => setActiveDay(day)}
                      className={cn(
                        "px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-all duration-200 min-w-[80px] md:min-w-[100px]",
                        activeDay === day
                          ? "bg-kram-700 text-white shadow-md"
                          : "text-kram-600 hover:bg-kram-50"
                      )}
                    >
                      <span className="block text-xs opacity-70">วันที่</span>
                      <span className="block text-base md:text-lg">{day}</span>
                      {daySchedule && (
                        <span className={cn("block text-[10px] md:text-xs", activeDay === day ? "text-kram-200" : "text-kram-400")}>
                          {formatShortDate(daySchedule.date)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Room Legend - Desktop */}
            <div className="hidden md:flex justify-center gap-6 mb-6">
              {rooms.map((room) => (
                <div key={room.id} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", room.color)} />
                  <span className="text-sm text-kram-600">{room.name}</span>
                </div>
              ))}
            </div>

            {/* Schedule Table */}
            <div className="max-w-6xl mx-auto">
              {/* Desktop View - 3 Columns */}
              <div className="hidden md:block">
                {/* Header */}
                <div className="grid grid-cols-[100px_1fr_1fr_1fr] gap-2 mb-3">
                  <div className="text-center text-sm font-semibold text-kram-500">เวลา</div>
                  {rooms.map((room) => (
                    <div key={room.id} className={cn("text-center text-sm font-semibold text-white py-2 rounded-lg", room.color)}>
                      {room.name}
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <div className="space-y-2">
                  {sortedTimeSlots.map((slot) => {
                    const isFullWidth = slot.items.some(item => item.room === "all" || item.room === "main" && slot.items.length === 1);
                    const mainItem = slot.items.find(item => item.room === "all") || (slot.items.length === 1 && slot.items[0].room === "main" ? slot.items[0] : null);

                    if (mainItem && (mainItem.room === "all" || slot.items.length === 1)) {
                      // Full width row
                      return (
                        <div key={`${slot.startTime}-${slot.endTime}`} className="grid grid-cols-[100px_1fr] gap-2">
                          <div className="flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-sm font-bold text-kram-700">{slot.startTime}</div>
                              <div className="text-xs text-kram-400">{slot.endTime}</div>
                            </div>
                          </div>
                          <div className={cn(
                            "p-3 rounded-lg border transition-all",
                            mainItem.type !== "session" ? getTypeStyle(mainItem.type) : "bg-white border-kram-100 hover:shadow-md"
                          )}>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(mainItem.type)}
                              <span className="font-medium text-sm">{mainItem.title}</span>
                              {mainItem.speaker && (
                                <span className="text-xs text-kram-500 ml-auto flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {mainItem.speaker}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Multi-column row
                    const mainSession = slot.items.find(item => item.room === "main");
                    const room1Session = slot.items.find(item => item.room === "room1");
                    const room2Session = slot.items.find(item => item.room === "room2");

                    return (
                      <div key={`${slot.startTime}-${slot.endTime}`} className="grid grid-cols-[100px_1fr_1fr_1fr] gap-2">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-sm font-bold text-kram-700">{slot.startTime}</div>
                            <div className="text-xs text-kram-400">{slot.endTime}</div>
                          </div>
                        </div>
                        {[mainSession, room1Session, room2Session].map((session, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "p-3 rounded-lg border transition-all min-h-[80px]",
                              session ? "bg-white border-kram-100 hover:shadow-md" : "bg-gray-50 border-gray-100"
                            )}
                          >
                            {session ? (
                              <div>
                                <div className="font-medium text-sm text-kram-800 mb-1 line-clamp-2">{session.title}</div>
                                {session.speaker && (
                                  <div className="text-xs text-kram-500 flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {session.speaker}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400 text-center">-</div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile View - Compact List */}
              <div className="md:hidden space-y-2">
                {sortedTimeSlots.map((slot) => {
                  const mainItem = slot.items.find(item => item.room === "all") || slot.items[0];
                  const hasMultiple = slot.items.length > 1 && !slot.items.some(item => item.room === "all");

                  return (
                    <div key={`${slot.startTime}-${slot.endTime}`} className={cn(
                      "rounded-lg border overflow-hidden",
                      mainItem.type !== "session" ? getTypeStyle(mainItem.type) : "bg-white border-kram-100"
                    )}>
                      {/* Time Header */}
                      <div className={cn(
                        "flex items-center gap-2 px-3 py-2 text-xs font-semibold",
                        mainItem.type !== "session" ? "" : "bg-kram-50 text-kram-700"
                      )}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                        {hasMultiple && (
                          <span className="ml-auto text-[10px] bg-kram-100 text-kram-600 px-2 py-0.5 rounded-full">
                            {slot.items.length} sessions
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="px-3 py-2">
                        {slot.items.some(item => item.room === "all") || !hasMultiple ? (
                          // Single session
                          <div className="flex items-start gap-2">
                            {getTypeIcon(mainItem.type)}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm">{mainItem.title}</div>
                              {mainItem.speaker && (
                                <div className="text-xs text-kram-500 mt-0.5 flex items-center gap-1">
                                  <User className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{mainItem.speaker}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Multiple parallel sessions
                          <div className="space-y-2">
                            {slot.items.map((item) => (
                              <div key={item.id} className="flex items-start gap-2">
                                <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", getRoomColor(item.room))} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-xs">{item.title}</div>
                                  {item.speaker && (
                                    <div className="text-[10px] text-kram-500 truncate">{item.speaker}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Mobile Room Legend */}
                <div className="flex justify-center gap-4 pt-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="flex items-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", room.color)} />
                      <span className="text-[10px] text-kram-500">{room.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
