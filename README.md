# hsptl

Hospital slot booking website — **demo only**.

Browse sample doctors, filter by department, pick a date and time slot for the next 7 days, and confirm a booking. Bookings are stored in the browser (localStorage) and can be cancelled from "My bookings". No backend, no database, no payments, and no data is sent anywhere.

> **Demo notice:** HSPTL is not a real hospital. Doctors, fees, and slots are fictional sample data. Do not use this site for real medical care. For a real emergency, contact your local emergency services.

## Features

- Search doctors by name, department, or symptom; filter by department; sort by fee or experience
- Date strip for the next 7 days with free-slot counts per doctor
- Time-slot grid with booked/passed slots disabled, selected state, and accessible labels
- Booking form with validation (name, 10-digit mobile, age) and a confirmation card with a booking reference
- My bookings list stored in localStorage, with two-tap cancellation that frees the slot again
- Responsive (mobile / tablet / desktop), keyboard-navigable, visible focus, reduced-motion support

## Design decisions

- **Stack (deliberately narrow):** React 18 + Vite + Tailwind CSS v4 only. No GSAP/Lenis/Three.js — a hospital booking flow needs calm, fast, and accessible motion, so animation is limited to a small CSS fade and smooth anchor scrolling, disabled under `prefers-reduced-motion`.
- **Original, clinical design:** light theme, teal clinical palette, serif display headings, clear hierarchy — distinct from the dark glassmorphism portfolio.
- **No invented business facts:** no real hospital name, address, phone number, ratings, or live availability is claimed. Everything sample is labelled "sample" or "demo".

## Commands

```bash
npm install
npm run dev      # local development
npm run build    # production build -> dist/
npm run preview  # preview the production build locally
```

## Environment variables

None required. See `.env.example` — there is no backend or API key.

## Deployment

Static Vite build. Deploy `dist/` on Vercel (Vite preset, no environment variables), Netlify, or any static host. Deployment status is not claimed here — see the live deployment record for this repo.

## Project structure

```
index.html            # title, meta description, Open Graph
src/main.jsx          # React entry
src/App.jsx           # header, hero, doctor search/filter, booking panel, my bookings
src/data.js           # sample doctors, departments, slot times (labelled sample data)
src/lib.js            # dates, seeded booked slots, localStorage, booking references
src/index.css         # Tailwind v4 theme, fonts, focus styles, reduced-motion rules
```
