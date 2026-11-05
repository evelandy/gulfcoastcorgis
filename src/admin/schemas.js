// Field definitions for the admin forms. Add a field here and it shows up in the form and gets saved with the item. Keep names in sync with backend columns.
import { COLLARS } from '../lib/format';

const STATUS = [
  { value: 'available', label: 'Available' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'home', label: 'Gone home (moves to Families)' },
];

export const schemas = {
  puppies: {
    label: 'Puppies',
    singular: 'puppy',
    title: (p) => p.name,
    subtitle: (p) => `${p.sex === 'female' ? 'Girl' : 'Boy'}, ${p.color || ''}, ${p.status}`,
    defaults: {
      sex: 'female',
      color: 'Red & white',
      coat: 'Standard',
      status: 'available',
      collar: 'teal',
      photos: [],
    },
    fields: [
      {
        name: 'name',
        label: 'Name or collar name',
        type: 'text',
        required: true,
        hint: 'e.g. "Teal collar boy" until they have a name',
      },
      { name: 'litterId', label: 'Litter', type: 'litter' },
      {
        name: 'collar',
        label: 'Collar color',
        type: 'select',
        options: Object.keys(COLLARS).map((c) => ({ value: c, label: c })),
      },
      {
        name: 'sex',
        label: 'Sex',
        type: 'select',
        options: [
          { value: 'female', label: 'Girl' },
          { value: 'male', label: 'Boy' },
        ],
      },
      { name: 'color', label: 'Coat color', type: 'text' },
      { name: 'coat', label: 'Coat type', type: 'text', hint: 'Standard or fluffy' },
      { name: 'price', label: 'Price ($)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: STATUS },
      { name: 'newHome', label: 'New home town (shown once gone home)', type: 'text' },
      { name: 'personality', label: 'Personality', type: 'textarea' },
      { name: 'photos', label: 'Photos (first one is the cover)', type: 'photos' },
    ],
  },
  dogs: {
    label: 'Our dogs',
    singular: 'dog',
    title: (d) => d.name,
    subtitle: (d) => `${d.role === 'dam' ? 'Mom' : 'Dad'}, ${d.color || ''}`,
    defaults: { role: 'dam', sex: 'female', registry: 'AKC', health: [], photos: [] },
    fields: [
      { name: 'name', label: 'Registered or full name', type: 'text', required: true },
      { name: 'callName', label: 'Call name', type: 'text' },
      {
        name: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { value: 'dam', label: 'Mom (dam)' },
          { value: 'sire', label: 'Dad (sire)' },
        ],
      },
      { name: 'color', label: 'Coat color', type: 'text' },
      { name: 'born', label: 'Birthday', type: 'date' },
      { name: 'weightLbs', label: 'Weight (lbs)', type: 'number' },
      { name: 'registry', label: 'Registry', type: 'text' },
      { name: 'health', label: 'Health testing (one per line)', type: 'lines' },
      { name: 'temperament', label: 'About this dog', type: 'textarea' },
      { name: 'photos', label: 'Photos (first one is the cover)', type: 'photos' },
    ],
  },
  litters: {
    label: 'Litters',
    singular: 'litter',
    title: (l) => l.name,
    subtitle: (l) => l.status,
    defaults: { status: 'upcoming' },
    fields: [
      { name: 'name', label: 'Litter name', type: 'text', required: true, hint: 'e.g. "Spring 2027 litter"' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'current', label: 'Current (puppies on the site now)' },
          { value: 'upcoming', label: 'Upcoming (waitlist)' },
          { value: 'past', label: 'Past' },
        ],
      },
      { name: 'damId', label: 'Mom', type: 'dog', role: 'dam' },
      { name: 'sireId', label: 'Dad', type: 'dog', role: 'sire' },
      { name: 'born', label: 'Born', type: 'date' },
      { name: 'readyDate', label: 'Ready to go home', type: 'date' },
      { name: 'expected', label: 'Expected (upcoming only)', type: 'month' },
      { name: 'summary', label: 'Short description', type: 'textarea' },
      {
        name: 'photo',
        label: 'Hero photo URL (optional)',
        type: 'text',
        hint: 'Leave blank to use the first puppy photo',
      },
    ],
  },
  families: {
    label: 'Families',
    singular: 'family photo',
    title: (f) => f.puppyName,
    subtitle: (f) => [f.town, f.year].filter(Boolean).join(', '),
    defaults: { photos: [], year: new Date().getFullYear() },
    fields: [
      { name: 'puppyName', label: 'Puppy name', type: 'text', required: true },
      { name: 'family', label: 'Family name (optional)', type: 'text' },
      { name: 'town', label: 'Town', type: 'text' },
      { name: 'year', label: 'Year went home', type: 'number' },
      {
        name: 'note',
        label: 'Note from the family',
        type: 'textarea',
        hint: 'Only post what the family has said and agreed to share',
      },
      { name: 'photos', label: 'Photos', type: 'photos' },
    ],
  },
};
