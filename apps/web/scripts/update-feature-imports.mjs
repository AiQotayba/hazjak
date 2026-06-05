import fs from "fs";
import path from "path";

const root = path.resolve("src");

const replacements = [
  ["@/store/auth", "@/features/auth/store/auth"],
  ["@/hooks/use-require-role", "@/features/auth/hooks/use-require-role"],
  ["@/lib/user-bookings", "@/features/user-bookings/lib/user-bookings"],
  ["@/components/landing/owners/", "@/features/landing/components/owners/"],
  ["@/components/landing/", "@/features/landing/components/"],
  ["@/components/marketing/", "@/features/marketing/components/"],
  ["@/components/stadium/", "@/features/stadium/components/"],
  [
    "@/components/owner/owner-booking-detail-dialog",
    "@/features/owner-bookings/components/owner-booking-detail-dialog",
  ],
  ["@/components/owner/stat-card", "@/features/owner-dashboard/components/stat-card"],
  ["@/components/user/user-profile-hero", "@/features/user-profile/components/user-profile-hero"],
  [
    "@/components/user/profile-booking-stats",
    "@/features/user-profile/components/profile-booking-stats",
  ],
  ["@/components/user/edit-profile-dialog", "@/features/user-profile/components/edit-profile-dialog"],
  ["@/components/user/bookings-filters", "@/features/user-bookings/components/bookings-filters"],
  [
    "@/components/user/bookings-calendar-strip",
    "@/features/user-bookings/components/bookings-calendar-strip",
  ],
  ["@/components/user/user-bookings-hero", "@/features/user-bookings/components/user-bookings-hero"],
  [
    "@/components/user/booking-detail-dialog",
    "@/features/user-bookings/components/booking-detail-dialog",
  ],
  ["@/components/user/booking-list-item", "@/features/user-bookings/components/booking-list-item"],
  ["@/components/user/user-mobile-shell", "@/features/user-shell/components/user-mobile-shell"],
];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (/\.(tsx?|jsx?)$/.test(ent.name)) {
      let s = fs.readFileSync(p, "utf8");
      let changed = false;
      for (const [from, to] of replacements) {
        if (s.includes(from)) {
          s = s.split(from).join(to);
          changed = true;
        }
      }
      if (changed) fs.writeFileSync(p, s, "utf8");
    }
  }
}

walk(root);

const faqPath = path.join(root, "features/landing/components/faq.tsx");
if (fs.existsSync(faqPath)) {
  let s = fs.readFileSync(faqPath, "utf8");
  s = s.replace('from "./faq-data"', 'from "../data/faq-data"');
  fs.writeFileSync(faqPath, s);
}

const jsonLd = path.join(root, "features/landing/seo/json-ld.tsx");
if (fs.existsSync(jsonLd)) {
  let s = fs.readFileSync(jsonLd, "utf8");
  s = s.replace('from "./faq-data"', 'from "../data/faq-data"');
  s = s.replace('from "./faq"', 'from "../data/faq-data"');
  fs.writeFileSync(jsonLd, s);
}

const userBookingsLib = path.join(root, "features/user-bookings/lib/user-bookings.ts");
if (fs.existsSync(userBookingsLib)) {
  let s = fs.readFileSync(userBookingsLib, "utf8");
  s = s.replace(
    '@/components/user/booking-list-item',
    '@/features/user-bookings/components/booking-list-item'
  );
  fs.writeFileSync(userBookingsLib, s);
}

const stadiumDetail = path.join(root, "features/stadium/components/stadium-detail-view.tsx");
if (fs.existsSync(stadiumDetail)) {
  let s = fs.readFileSync(stadiumDetail, "utf8");
  s = s.replace('@/components/stadium/booking-dialog', './booking-dialog');
  fs.writeFileSync(stadiumDetail, s);
}

console.log("imports updated");
