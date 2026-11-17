// One definition per collection: which fields it has, what type each one is, and which table it lives in.
// Field names are the frontend's (camelCase, as in src/data/*.json and src/admin/schemas.js); the column is the
// snake_case form. Adding a field means: a migration, one line here, and one line in src/admin/schemas.js.

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

const text = { type: 'text' };
const int = { type: 'int' };
const real = { type: 'real' };
const date = { type: 'date' };
const month = { type: 'month' };
const bool = { type: 'bool' };
const list = { type: 'list' };
const ref = (collection) => ({ type: 'ref', collection });

export const collections = {
  dogs: {
    idPrefix: 'dog',
    fields: {
      name: text,
      callName: text,
      role: text,
      sex: text,
      color: text,
      born: date,
      weightLbs: real,
      registry: text,
      health: list,
      temperament: text,
      photos: list,
    },
  },
  litters: {
    idPrefix: 'litter',
    fields: {
      name: text,
      status: text,
      damId: ref('dogs'),
      sireId: ref('dogs'),
      born: date,
      readyDate: date,
      expected: month,
      summary: text,
      photo: text,
    },
  },
  puppies: {
    idPrefix: 'pup',
    fields: {
      name: text,
      litterId: ref('litters'),
      collar: text,
      sex: text,
      color: text,
      coat: text,
      price: int,
      status: text,
      newHome: text,
      personality: text,
      photos: list,
    },
  },
  families: {
    idPrefix: 'fam',
    fields: {
      puppyName: text,
      family: text,
      town: text,
      year: int,
      note: text,
      photos: list,
      sample: bool,
    },
  },
};

// Insert order that satisfies the foreign keys (litters point at dogs, puppies at litters).
export const COLLECTION_NAMES = ['dogs', 'litters', 'puppies', 'families'];

export const toColumn = (field) => field.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

/** Converts one incoming value to what the column stores. Empty values become null (or [] for lists). */
function toColumnValue(field, spec, value) {
  if (spec.type === 'list') {
    if (value == null || value === '') return [];
    if (!Array.isArray(value)) throw new ValidationError(`${field} must be a list`);
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (value == null || value === '') return null;
  switch (spec.type) {
    case 'int': {
      const n = Number(value);
      if (!Number.isInteger(n)) throw new ValidationError(`${field} must be a whole number`);
      return n;
    }
    case 'real': {
      const n = Number(value);
      if (!Number.isFinite(n)) throw new ValidationError(`${field} must be a number`);
      return n;
    }
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new ValidationError(`${field} must be a date like 2026-03-01`);
      return value;
    case 'month':
      if (!/^\d{4}-\d{2}$/.test(value)) throw new ValidationError(`${field} must be a month like 2027-03`);
      return value;
    case 'bool':
      return Boolean(value);
    default:
      return String(value).trim() || null;
  }
}

/** Frontend item -> { column: value } for every field. Fields the item doesn't have are stored empty. */
export function toRow(collectionName, item) {
  const { fields } = collections[collectionName];
  const row = {};
  for (const [field, spec] of Object.entries(fields)) row[toColumn(field)] = toColumnValue(field, spec, item[field]);
  return row;
}

/** Database row -> frontend item, in the same shape as the JSON files. Empty values are left out. */
export function fromRow(collectionName, row) {
  const { fields } = collections[collectionName];
  const item = { id: row.id };
  for (const field of Object.keys(fields)) {
    const value = row[toColumn(field)];
    if (value != null) item[field] = value;
  }
  return item;
}

/** Keys on an item that aren't fields of the collection (and would be dropped on save). */
export function unknownKeys(collectionName, item) {
  const { fields } = collections[collectionName];
  return Object.keys(item).filter((k) => k !== 'id' && !(k in fields));
}
