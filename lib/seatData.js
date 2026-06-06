// Definisi kategori kursi dan harganya (default layout)
export const defaultSeatCategories = {
  KATEGORI_1: {
    name: "Kategori 1",
    price: 200000,
    order: 1,
    layout: { seatsPerRow: 24, rows: 6, sections: 1 },
    total: 144,
  },
  KATEGORI_2: {
    name: "Kategori 2",
    price: 100000,
    order: 2,
    layout: { seatsPerRow: 24, rows: 5, sections: 1 },
    total: 120,
  },
  KATEGORI_3: {
    name: "Kategori 3",
    price: 50000,
    order: 3,
    layout: { seatsPerRow: 24, rows: 5, sections: 1 },
    total: 120,
  },
  TRIBUN_1: {
    name: "Tribun 1",
    price: 100000,
    order: 4,
    layout: { seatsPerRow: 10, rows: 1, sections: 1 },
    total: 10,
  },
  TRIBUN_2: {
    name: "Tribun 2",
    price: 50000,
    order: 5,
    layout: { seatsPerRow: 16, rows: 3, sections: 1 },
    total: 48,
  },
};

export const seatCategories = defaultSeatCategories;

export const CATEGORY_ORDER = [
  "KATEGORI_1",
  "KATEGORI_2",
  "KATEGORI_3",
  "TRIBUN_1",
  "TRIBUN_2",
];

export function buildSeatId(categoryKey, section, row, seat) {
  return `${categoryKey}-S${section}-R${row}-B${seat}`;
}

export function parseSeatId(seatId) {
  const match = seatId.match(/^(.+)-S(\d+)-R(\d+)-B(\d+)$/);
  if (!match) return null;
  return {
    categoryKey: match[1],
    section: parseInt(match[2], 10),
    row: parseInt(match[3], 10),
    seat: parseInt(match[4], 10),
  };
}

export function generateSeatsForCategory(categoryKey, category) {
  const { seatsPerRow, rows, sections } = category.layout;
  const seats = [];
  for (let s = 1; s <= sections; s++) {
    for (let r = 1; r <= rows; r++) {
      for (let b = 1; b <= seatsPerRow; b++) {
        seats.push({
          seatId: buildSeatId(categoryKey, s, r, b),
          categoryKey,
          categoryName: category.name,
          price: category.price,
          section: s,
          row: r,
          seat: b,
          label: `${category.name} · Blok ${s} · Baris ${r} · Kursi ${b}`,
        });
      }
    }
  }
  return seats;
}

export function generateAllSeats(categories = seatCategories) {
  const allSeats = [];
  for (const key of CATEGORY_ORDER) {
    const cat = categories[key];
    if (cat) {
      allSeats.push(...generateSeatsForCategory(key, cat));
    }
  }
  return allSeats;
}

export function getTotalSeatCount(categories = seatCategories) {
  return generateAllSeats(categories).length;
}

export function getSeatCategoryLabel(category) {
  return defaultSeatCategories[category]?.name || category;
}

export function formatPrice(price) {
  if (price === undefined || price === null || isNaN(price)) return "Rp 0,00";
  const parts = Number(price).toFixed(2).split(".");
  const numberPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const decimalPart = parts[1];
  return `Rp ${numberPart},${decimalPart}`;
}

export function mergeCategoriesWithOverrides(overrides) {
  if (!overrides || typeof overrides !== "object") {
    return { ...defaultSeatCategories };
  }
  const merged = {};
  for (const key of CATEGORY_ORDER) {
    const base = defaultSeatCategories[key];
    if (!base) continue;
    const override = overrides[key] || {};
    const layout = { ...base.layout, ...(override.layout || {}) };
    merged[key] = {
      ...base,
      ...override,
      layout,
      total:
        layout.seatsPerRow * layout.rows * layout.sections,
    };
  }
  return merged;
}
