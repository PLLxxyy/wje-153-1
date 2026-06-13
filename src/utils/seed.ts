/* ================================================================
   Seed data — runs once on first visit
   ================================================================ */

import type { Venue, DaySlot, Booking, Review, SlotStatus } from '../types';
import { saveVenues, saveDaySlots, saveBookings, saveReviews, markInitialized, isInitialized } from './storage';

/* ---------- helpers ---------- */

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function makeSlot(available: boolean, current: number = 0): SlotStatus {
  return { available, maxCapacity: 30, currentCount: current };
}

/* ---------- Venue images via picsum ---------- */

function venueImages(seed: string, count: number = 3): string[] {
  const imgs: string[] = [];
  for (let i = 0; i < count; i++) {
    imgs.push(`https://picsum.photos/seed/${seed}${i}/800/400`);
  }
  return imgs;
}

/* ---------- Main seed function ---------- */

export function seedData(): void {
  if (isInitialized()) return;

  /* ---- Venues ---- */
  const venues: Venue[] = [
    {
      id: 'v1',
      name: '奥体中心篮球馆',
      type: 'basketball',
      location: '朝阳区安定路1号',
      description: '国际标准室内篮球场，枫木地板，配备专业灯光和电子记分牌。适合团体比赛、训练和业余爱好者打球。场馆设有休息区和更衣室。',
      images: venueImages('basket1', 4),
      facilities: ['空调', '更衣室', '淋浴', '停车', '饮水机', '电子记分牌'],
      price: 120,
      capacity: 30,
      rating: 4.7,
      reviewCount: 23,
      openingHours: '08:00 - 22:00',
      contactPhone: '010-88881001',
    },
    {
      id: 'v2',
      name: '阳光羽毛球俱乐部',
      type: 'badminton',
      location: '海淀区中关村南大街18号',
      description: '拥有12片标准羽毛球场，专业级PVC地胶，LED无影灯光系统。定期举办业余联赛，适合各水平爱好者。',
      images: venueImages('badminton1', 4),
      facilities: ['空调', '更衣室', '器材租赁', '教练指导', '休息区'],
      price: 80,
      capacity: 48,
      rating: 4.5,
      reviewCount: 45,
      openingHours: '07:00 - 22:00',
      contactPhone: '010-88881002',
    },
    {
      id: 'v3',
      name: '银球乒乓球训练基地',
      type: 'pingpong',
      location: '西城区德胜门外大街5号',
      description: '专业乒乓球训练场馆，配备红双喜比赛级球台20张。提供陪练和培训课程，承接各类业余和专业赛事。',
      images: venueImages('pingpong1', 3),
      facilities: ['空调', '器材租赁', '教练指导', '淋浴', '储物柜'],
      price: 50,
      capacity: 40,
      rating: 4.8,
      reviewCount: 67,
      openingHours: '08:00 - 21:30',
      contactPhone: '010-88881003',
    },
    {
      id: 'v4',
      name: '红土网球中心',
      type: 'tennis',
      location: '丰台区南四环西路116号',
      description: '6片室外标准网球场（红土+硬地），夜间照明完善。配有发球练习墙、穿线服务和网球用品店。',
      images: venueImages('tennis1', 4),
      facilities: ['夜间照明', '器材租赁', '穿线服务', '停车', '淋浴'],
      price: 150,
      capacity: 24,
      rating: 4.3,
      reviewCount: 18,
      openingHours: '06:00 - 22:00',
      contactPhone: '010-88881004',
    },
    {
      id: 'v5',
      name: '绿茵足球公园',
      type: 'football',
      location: '通州区梨园镇临河里路',
      description: '五人制和七人制人工草足球场各2片，FIFA认证草丝，弹性减震垫层。周末常有业余联赛，适合团建和友谊赛。',
      images: venueImages('football1', 4),
      facilities: ['夜间照明', '更衣室', '淋浴', '停车', '饮水机'],
      price: 200,
      capacity: 30,
      rating: 4.6,
      reviewCount: 32,
      openingHours: '08:00 - 22:00',
      contactPhone: '010-88881005',
    },
    {
      id: 'v6',
      name: '星耀综合体育中心',
      type: 'basketball',
      location: '东城区体育馆路甲2号',
      description: '多功能综合体育场馆，可切换篮球、排球、羽毛球等多种场地模式。场馆空间宽敞，适合大型赛事和团建活动。',
      images: venueImages('multi1', 4),
      facilities: ['空调', '更衣室', '淋浴', '停车', '餐饮', 'VIP包厢'],
      price: 180,
      capacity: 50,
      rating: 4.4,
      reviewCount: 15,
      openingHours: '08:00 - 22:00',
      contactPhone: '010-88881006',
    },
    {
      id: 'v7',
      name: '飞羽羽毛球馆',
      type: 'badminton',
      location: '朝阳区望京西路8号',
      description: '8片标准羽毛球场，专业运动地胶，恒温空调系统。工作日白天有优惠时段，适合自由练习和双打对抗。',
      images: venueImages('badminton2', 3),
      facilities: ['空调', '更衣室', '器材租赁', '停车'],
      price: 70,
      capacity: 32,
      rating: 4.2,
      reviewCount: 28,
      openingHours: '07:00 - 23:00',
      contactPhone: '010-88881007',
    },
    {
      id: 'v8',
      name: '金沙乒乓球俱乐部',
      type: 'pingpong',
      location: '海淀区知春路甲48号',
      description: '休闲与竞技兼顾的乒乓球馆，10张球台，环境舒适。定期举办会员赛，提供积分排名系统。',
      images: venueImages('pingpong2', 3),
      facilities: ['空调', '休息区', '饮水机', '器材租赁'],
      price: 45,
      capacity: 20,
      rating: 4.1,
      reviewCount: 19,
      openingHours: '09:00 - 21:00',
      contactPhone: '010-88881008',
    },
  ];
  saveVenues(venues);

  /* ---- Day Slots (today + next 13 days, some booked) ---- */
  const daySlots: DaySlot[] = [];
  const today = new Date();
  for (let d = 0; d < 14; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const ds = dateStr(date);
    for (const v of venues) {
      const morningAvail = Math.random() > 0.2;
      const afternoonAvail = Math.random() > 0.25;
      const eveningAvail = Math.random() > 0.3;
      daySlots.push({
        date: ds,
        venueId: v.id,
        morning: makeSlot(morningAvail, morningAvail ? 0 : v.capacity),
        afternoon: makeSlot(afternoonAvail, afternoonAvail ? Math.floor(Math.random() * v.capacity * 0.5) : v.capacity),
        evening: makeSlot(eveningAvail, eveningAvail ? Math.floor(Math.random() * v.capacity * 0.3) : v.capacity),
      });
    }
  }
  saveDaySlots(daySlots);

  /* ---- Sample Bookings ---- */
  const bookings: Booking[] = [];
  const names = ['张三', '李四', '王五', '赵六', '陈七'];
  const phones = ['13800001111', '13900002222', '13700003333', '13600004444', '13500005555'];

  // A few past bookings (completed)
  for (let i = 0; i < 3; i++) {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - (i + 1));
    const venue = venues[i % venues.length];
    const booking: Booking = {
      id: uid(),
      venueId: venue.id,
      venueName: venue.name,
      venueType: venue.type,
      date: dateStr(pastDate),
      timeSlot: (['morning', 'afternoon', 'evening'] as const)[i % 3],
      peopleCount: 4 + i,
      contactName: names[i],
      contactPhone: phones[i],
      checkinCode: `${100000 + Math.floor(Math.random() * 900000)}`,
      status: 'completed',
      createdAt: pastDate.toISOString(),
      checkedInAt: pastDate.toISOString(),
    };
    bookings.push(booking);
  }

  // A future booking (pending)
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 2);
  const futureBooking: Booking = {
    id: uid(),
    venueId: 'v1',
    venueName: '奥体中心篮球馆',
    venueType: 'basketball',
    date: dateStr(futureDate),
    timeSlot: 'afternoon',
    peopleCount: 10,
    contactName: '用户',
    contactPhone: '13000000000',
    checkinCode: `${100000 + Math.floor(Math.random() * 900000)}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  bookings.push(futureBooking);
  saveBookings(bookings);

  /* ---- Sample Reviews ---- */
  const reviews: Review[] = [
    {
      id: uid(),
      venueId: 'v1',
      bookingId: bookings[0]?.id ?? '',
      userId: 'user_2',
      userName: '篮球爱好者',
      rating: 5,
      comment: '场地很棒！枫木地板质量很好，灯光也够亮。周末人多需要提前预约。更衣室干净，推荐！',
      createdAt: new Date(today.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: uid(),
      venueId: 'v1',
      bookingId: '',
      userId: 'user_3',
      userName: '运动达人',
      rating: 4,
      comment: '整体不错，就是停车不太方便，建议坐地铁来。场地质量一流。',
      createdAt: new Date(today.getTime() - 5 * 86400000).toISOString(),
    },
    {
      id: uid(),
      venueId: 'v2',
      bookingId: '',
      userId: 'user_4',
      userName: '羽毛球小王子',
      rating: 5,
      comment: '地胶弹性很好，灯光不会刺眼。教练很专业，教了我很多技巧。',
      createdAt: new Date(today.getTime() - 2 * 86400000).toISOString(),
    },
    {
      id: uid(),
      venueId: 'v3',
      bookingId: '',
      userId: 'user_5',
      userName: '国球迷',
      rating: 5,
      comment: '球台质量没话说，红双喜的比赛台打起来就是不一样。环境也很好，有空调不会太热。',
      createdAt: new Date(today.getTime() - 4 * 86400000).toISOString(),
    },
    {
      id: uid(),
      venueId: 'v5',
      bookingId: '',
      userId: 'user_6',
      userName: '足球队长',
      rating: 4,
      comment: '草皮质量很好，弹性足够。灯光到了晚上也够亮。就是位置有点远，但值得跑一趟。',
      createdAt: new Date(today.getTime() - 1 * 86400000).toISOString(),
    },
  ];
  saveReviews(reviews);

  markInitialized();
}
