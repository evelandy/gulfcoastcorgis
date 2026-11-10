// One place for business details. Change these and the whole site updates.
const env = import.meta.env;

export const site = {
  name: 'Gulf Coast Corgis',
  tagline: 'Pembroke Welsh Corgis raised on the Texas Gulf Coast',
  // Falls back to the current origin. Need to set VITE_SITE_URL in .env once domain is chosen and live.
  url: env.VITE_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : ''),
  region: 'Texas Gulf Coast',
  // TODO: EMAIL needs to be set once a domain is chosen and live. Currently using GrDev info email.
  contact: {
    // email: 'hello@gulf-coast-corgis.com',
    // email: 'hello@gulfcoast-corgis.com',
    email: 'info@grdev-us.com',
    GrDevEmail: 'info@grdev-us.com',    // This needs to be removed and use above email once email for this domain is fully set up
    phone: '(409) 424-9319 (Courtney)   ||   (832) 557-4731 (Will)',
    phoneHref: 'tel:+14094249319',
    textHref: 'sms:+14094249319',
    area: 'Dickinson, TX area · visits by appointment',
  },
  social: {
    facebook: 'https://www.facebook.com/GulfCoastCorgis',
    instagram: '',
    tiktok: '',
  },
  // Deposit and policy copy shown in "How it works" and the puppy detail panel.
  policy: {
    deposit: 450,
    goHomeWeeks: 8,
  },
  showAdminLink: env.VITE_SHOW_ADMIN_LINK !== 'false',
};

export const api = {
  baseUrl: (env.VITE_API_URL || '').replace(/\/$/, ''),
  web3formsKey: env.VITE_WEB3FORMS_KEY || '',
  inquiryEndpoint: env.VITE_INQUIRY_ENDPOINT || '',
};
