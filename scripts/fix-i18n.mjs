import fs from 'node:fs';
import path from 'node:path';
import {jsonrepair} from 'jsonrepair';

const ROOT = process.cwd();
const MESSAGES_DIR = path.join(ROOT, 'messages');

const files = ['en.json', 'fr.json', 'ar.json'];

function readFixedJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const repaired = jsonrepair(raw);
  return JSON.parse(repaired);
}

function writeJson(filePath, obj) {
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function isObject(x) {
  return x && typeof x === 'object' && !Array.isArray(x);
}

function deepMerge(base, override) {
  // override wins
  const out = {...base};
  for (const k of Object.keys(override || {})) {
    const bv = base?.[k];
    const ov = override?.[k];
    out[k] = isObject(bv) && isObject(ov) ? deepMerge(bv, ov) : ov;
  }
  return out;
}

function deepFillMissing(target, reference) {
  // add any missing keys from reference -> target
  const out = Array.isArray(target) ? [...target] : {...target};
  for (const k of Object.keys(reference || {})) {
    const rv = reference[k];
    const tv = out[k];

    if (tv === undefined) {
      out[k] = rv;
      continue;
    }
    if (isObject(tv) && isObject(rv)) {
      out[k] = deepFillMissing(tv, rv);
    }
  }
  return out;
}

// ✅ Canonical minimal keys to guarantee no warnings in your current screens
const CANON = {
  landing: {
    title: 'AtlasKit',
    subtitle: 'Create professional quotes (Devis) in minutes.',
    ctaPrimary: 'Create a document',
    ctaSecondary: 'Login',
    f1: 'Fast Devis builder with live preview',
    f2: 'Clients book + product/service catalog',
    f3: 'A4 print-ready PDF templates',
    f4: 'Arabic / French / English support',
    f5: 'Built for small businesses (simple, fast, and reliable)'
  },
  auth: {
    loading: 'Loading…',
    login: 'Login',
    createAccount: 'Create account',
    switchToSignup: 'Create a new account',
    switchToLogin: 'I already have an account',
    email: 'Email',
    password: 'Password'
  }
};

function run() {
  const parsed = {};
  for (const f of files) {
    const p = path.join(MESSAGES_DIR, f);
    parsed[f] = readFixedJson(p);
  }

  // 1) Ensure en has canonical keys
  const en = deepMerge(CANON, parsed['en.json']);
  // 2) Ensure fr/ar have all keys that exist in en
  const fr = deepFillMissing(parsed['fr.json'], en);
  const ar = deepFillMissing(parsed['ar.json'], en);

  // 3) Write prettified JSON (also fixes commas/brackets via jsonrepair)
  writeJson(path.join(MESSAGES_DIR, 'en.json'), en);
  writeJson(path.join(MESSAGES_DIR, 'fr.json'), fr);
  writeJson(path.join(MESSAGES_DIR, 'ar.json'), ar);

  console.log('✅ i18n fixed: JSON repaired + missing keys filled from en.json');
}

run();
