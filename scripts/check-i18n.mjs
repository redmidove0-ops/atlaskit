import fs from "node:fs";
import path from "node:path";

const files = ["src/messages/ar.json", "src/messages/fr.json", "src/messages/en.json"];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else {
      out[key] = v;
    }
  }
  return out;
}

// heuristic: detect Arabic characters inside fr/en files
const ARABIC_RE = /[\u0600-\u06FF]/;

const data = files.map((f) => {
  const full = readJson(f);
  return { f, flat: flatten(full) };
});

const allKeys = new Set(data.flatMap((d) => Object.keys(d.flat)));

for (const d of data) {
  const missing = [...allKeys].filter((k) => !(k in d.flat));
  if (missing.length) {
    console.log(`\n❌ Missing in ${d.f}:`);
    missing.forEach((k) => console.log("  -", k));
  } else {
    console.log(`\n✅ No missing keys in ${d.f}`);
  }

  const mixed = Object.entries(d.flat).filter(([_, v]) => typeof v === "string" && ARABIC_RE.test(v));
  if ((d.f.includes("/fr") || d.f.includes("/en")) && mixed.length) {
    console.log(`\n⚠️ Arabic chars found in ${d.f}:`);
    mixed.forEach(([k, v]) => console.log(`  - ${k}: ${v}`));
  }
}

console.log("\nDone.");
