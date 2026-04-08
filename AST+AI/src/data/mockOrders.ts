export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  region: string;
  status: OrderStatus;
  quantity: number;
  unitPrice: number;
  createdAt: string;
  priority: number;
  discountRate: number;
}

const CUSTOMERS = [
  'Acme Retail',
  'Northwind Supply',
  'Harbor Logistics',
  'Blue Finch Labs',
  'Valley Wholesale',
  'Skyline Stores',
  'Solstice Market',
  'Evergreen Goods',
  'Trailhead Group',
  'Pioneer Commerce',
];

const REGIONS = ['North', 'South', 'East', 'West', 'Central'];
const STATUSES: OrderStatus[] = ['pending', 'processing', 'shipped', 'cancelled'];

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return function next() {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function generateMockOrders(count = 600, seed = 20260408): Order[] {
  const random = createSeededRandom(seed);
  const startTimestamp = new Date('2026-01-01T00:00:00.000Z').getTime();
  const maxDays = 110;

  return Array.from({ length: count }).map((_, index) => {
    const customer = CUSTOMERS[Math.floor(random() * CUSTOMERS.length)];
    const region = REGIONS[Math.floor(random() * REGIONS.length)];
    const status = STATUSES[Math.floor(random() * STATUSES.length)];
    const quantity = Math.floor(random() * 24) + 1;
    const unitPrice = Math.round((random() * 980 + 20) * 100) / 100;
    const priority = Math.floor(random() * 5) + 1;
    const discountRate = Math.round((random() * 0.22 + 0.02) * 100) / 100;
    const offsetDays = Math.floor(random() * maxDays);
    const createdAt = new Date(startTimestamp + offsetDays * 24 * 60 * 60 * 1000).toISOString();

    return {
      id: `ORD-${String(index + 1).padStart(4, '0')}`,
      customerName: customer,
      region,
      status,
      quantity,
      unitPrice,
      createdAt,
      priority,
      discountRate,
    };
  });
}
