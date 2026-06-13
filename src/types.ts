/* ================================================================
   Types for the Sports Venue Booking Platform
   ================================================================ */

/** 场地类型 */
export type VenueType = 'basketball' | 'badminton' | 'pingpong' | 'tennis' | 'football';

/** 时段 */
export type TimeSlot = 'morning' | 'afternoon' | 'evening';

/** 预约状态 */
export type BookingStatus = 'pending' | 'completed' | 'cancelled';

/** 场地信息 */
export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  location: string;
  description: string;
  images: string[];
  facilities: string[];
  price: number;           // 元/时段
  capacity: number;        // 最大容纳人数
  rating: number;          // 平均评分
  reviewCount: number;
  openingHours: string;
  contactPhone: string;
}

/** 每日时段占用情况 */
export interface DaySlot {
  date: string;            // YYYY-MM-DD
  venueId: string;
  morning: SlotStatus;
  afternoon: SlotStatus;
  evening: SlotStatus;
}

/** 时段状态 */
export interface SlotStatus {
  available: boolean;
  bookingId?: string;
  maxCapacity: number;
  currentCount: number;
}

/** 预约记录 */
export interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  venueType: VenueType;
  date: string;            // YYYY-MM-DD
  timeSlot: TimeSlot;
  peopleCount: number;
  contactName: string;
  contactPhone: string;
  checkinCode: string;
  status: BookingStatus;
  createdAt: string;
  checkedInAt?: string;
  rating?: number;
  review?: string;
}

/** 用户信息 (简易) */
export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  isAdmin: boolean;
}

/** 评价 */
export interface Review {
  id: string;
  venueId: string;
  bookingId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

/** 存储键常量 */
export const STORAGE_KEYS = {
  VENUES: 'sports_venues',
  BOOKINGS: 'sports_bookings',
  DAY_SLOTS: 'sports_day_slots',
  REVIEWS: 'sports_reviews',
  USER: 'sports_user',
  INITIALIZED: 'sports_initialized',
} as const;

/** 时段中文映射 */
export const TIME_SLOT_LABELS: Record<TimeSlot, string> = {
  morning: '上午 (8:00-12:00)',
  afternoon: '下午 (13:00-17:00)',
  evening: '晚上 (18:00-22:00)',
};

/** 场地类型中文映射 */
export const VENUE_TYPE_LABELS: Record<VenueType, string> = {
  basketball: '篮球',
  badminton: '羽毛球',
  pingpong: '乒乓球',
  tennis: '网球',
  football: '足球',
};

/** 场地类型标签 CSS class */
export const VENUE_TYPE_TAG_CLASS: Record<VenueType, string> = {
  basketball: 'tag-basketball',
  badminton: 'tag-badminton',
  pingpong: 'tag-pingpong',
  tennis: 'tag-tennis',
  football: 'tag-football',
};

/** 时段列表 */
export const TIME_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening'];
