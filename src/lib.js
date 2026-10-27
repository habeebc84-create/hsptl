import { SLOT_TIMES } from './data.js'

const STORAGE_KEY = 'hsptl-bookings-v1'

export function dayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function nextDays(count = 7) {
  const days = []
  const today = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d)
  }
  return days
}

export function formatDay(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(date)
}

export function formatDayLong(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export function formatTime12(time24) {
  const [h, m] = time24.split(':').map(Number)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`
}

// Deterministic sample "already booked" slots so the demo looks realistic
// and stays the same on every visit. User bookings in localStorage win over this.
function seededBooked(doctorId, dateStr, time) {
  const seed = `${doctorId}|${dateStr}|${time}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return hash % 4 === 0
}

export function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
  } catch {
    // Storage unavailable (private mode etc.) — bookings still work for this session only.
  }
}

export function isSlotBooked(doctorId, dateStr, time, bookings) {
  if (bookings.some((b) => b.doctorId === doctorId && b.date === dateStr && b.time === time)) return true
  return seededBooked(doctorId, dateStr, time)
}

export function freeSlotCount(doctorId, dateStr, bookings) {
  return SLOT_TIMES.filter((t) => !isSlotBooked(doctorId, dateStr, t, bookings)).length
}

export function makeReference() {
  return 'HSPTL-' + Math.random().toString(36).slice(2, 8).toUpperCase()
}

export function inr(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}
