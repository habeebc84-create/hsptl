import { useEffect, useMemo, useRef, useState } from 'react'
import { DEPARTMENTS, DOCTORS, SLOT_TIMES } from './data.js'
import {
  dayKey, formatDay, formatDayLong, formatTime12, freeSlotCount,
  inr, isSlotBooked, loadBookings, makeReference, nextDays, saveBookings,
} from './lib.js'

const DAYS = nextDays(7)

function initials(name) {
  return name.replace('Dr ', '').split(' ').map((p) => p[0]).slice(0, 2).join('')
}

function isPastSlot(date, time) {
  const todayKey = dayKey(new Date())
  if (dayKey(date) !== todayKey) return false
  const [h, m] = time.split(':').map(Number)
  const slot = new Date()
  slot.setHours(h, m, 0, 0)
  return slot <= new Date()
}

export default function App() {
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('All')
  const [sort, setSort] = useState('recommended')
  const [onlyFreeToday, setOnlyFreeToday] = useState(false)
  const [bookings, setBookings] = useState(() => loadBookings())
  const [selectedDoctorId, setSelectedDoctorId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(dayKey(DAYS[0]))
  const [selectedTime, setSelectedTime] = useState(null)
  const [patientName, setPatientName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState({})
  const [confirmed, setConfirmed] = useState(null)
  const [confirmCancelId, setConfirmCancelId] = useState(null)
  const [notice, setNotice] = useState('')
  const confirmRef = useRef(null)

  useEffect(() => { saveBookings(bookings) }, [bookings])
  useEffect(() => {
    if (confirmed && confirmRef.current) confirmRef.current.focus()
  }, [confirmed])

  const selectedDoctor = DOCTORS.find((d) => d.id === selectedDoctorId) || null
  const todayKey = dayKey(DAYS[0])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = DOCTORS.filter((d) => {
      if (dept !== 'All' && d.department !== dept) return false
      if (q && !`${d.name} ${d.department} ${d.tags.join(' ')}`.toLowerCase().includes(q)) return false
      if (onlyFreeToday && freeSlotCount(d.id, todayKey, bookings) === 0) return false
      return true
    })
    if (sort === 'fee') list = [...list].sort((a, b) => a.fee - b.fee)
    if (sort === 'experience') list = [...list].sort((a, b) => b.experience - a.experience)
    return list
  }, [query, dept, sort, onlyFreeToday, bookings, todayKey])

  function chooseDoctor(doctor) {
    setSelectedDoctorId(doctor.id)
    setSelectedTime(null)
    setConfirmed(null)
    setErrors({})
    setNotice('')
    document.getElementById('booking-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function validate() {
    const next = {}
    if (patientName.trim().length < 2) next.patientName = 'Enter the patient’s full name.'
    if (!/^[6-9]\d{9}$/.test(phone.trim())) next.phone = 'Enter a valid 10-digit mobile number starting with 6–9.'
    const ageNum = Number(age)
    if (age === '' || !Number.isInteger(ageNum) || ageNum < 0 || ageNum > 120) next.age = 'Enter an age between 0 and 120.'
    if (!selectedTime) next.slot = 'Choose a time slot first.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function confirmBooking(event) {
    event.preventDefault()
    if (!selectedDoctor) return
    if (!validate()) {
      setNotice('Please fix the highlighted fields below.')
      return
    }
    const booking = {
      id: makeReference(),
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      department: selectedDoctor.department,
      date: selectedDate,
      time: selectedTime,
      patientName: patientName.trim(),
      phone: phone.trim(),
      age: Number(age),
      reason: reason.trim(),
      fee: selectedDoctor.fee,
      createdAt: new Date().toISOString(),
    }
    setBookings((prev) => [...prev, booking])
    setConfirmed(booking)
    setSelectedTime(null)
    setPatientName('')
    setPhone('')
    setAge('')
    setReason('')
    setNotice('')
  }

  function cancelBooking(id) {
    if (confirmCancelId !== id) {
      setConfirmCancelId(id)
      return
    }
    setBookings((prev) => prev.filter((b) => b.id !== id))
    setConfirmCancelId(null)
    setNotice('Booking cancelled. That slot is free again in this demo.')
  }

  const sortedBookings = [...bookings].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))

  return (
    <div className="min-h-screen">
      <a href="#doctors" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold">
        Skip to doctors
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-teal-900/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-clinic-700 text-lg font-extrabold text-white">+</span>
            <span className="text-xl font-extrabold tracking-tight text-clinic-900">HSPTL</span>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">DEMO</span>
          </a>
          <nav aria-label="Main" className="ml-auto flex flex-wrap items-center gap-4 text-sm font-semibold sm:gap-6">
            <a className="text-slate-700 hover:text-clinic-700" href="#doctors">Find a doctor</a>
            <a className="text-slate-700 hover:text-clinic-700" href="#how-it-works">How it works</a>
            <a className="text-slate-700 hover:text-clinic-700" href="#bookings">My bookings ({bookings.length})</a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Demo banner */}
        <div className="bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-900 sm:px-6" role="note">
          Demo website — sample doctors and slots only. Bookings are saved in this browser and no real appointment is made.
          For a real emergency, contact your local emergency services.
        </div>

        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-widest text-clinic-700">Hospital slot booking</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Book a doctor’s appointment in minutes.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Choose a department, pick a doctor, select a date and time that suits you, and confirm.
              No account, no payment, and no waiting on the phone — in this demo.
            </p>
            <form
              className="mt-7 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => { e.preventDefault(); document.getElementById('doctors')?.scrollIntoView({ behavior: 'smooth' }) }}
              role="search"
            >
              <label className="sr-only" htmlFor="hero-search">Search doctors, departments, or symptoms</label>
              <input
                id="hero-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try “skin”, “heart”, or a doctor’s name…"
                className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-base shadow-sm placeholder:text-slate-400"
              />
              <button type="submit" className="min-h-12 rounded-xl bg-clinic-700 px-6 text-base font-bold text-white transition hover:bg-clinic-800">
                Find a doctor
              </button>
            </form>
            <p className="mt-4 text-sm text-slate-500">
              {DOCTORS.length} sample doctors · {DEPARTMENTS.length} departments · Slots for the next 7 days · Fees shown are sample fees.
            </p>
          </div>
        </section>

        {/* Doctors */}
        <section id="doctors" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-12 sm:px-6" aria-labelledby="doctors-heading">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="doctors-heading" className="font-display text-3xl font-bold text-slate-900">Find a doctor</h2>
              <p className="mt-1 text-slate-600">All doctors and slots below are sample data for this demo.</p>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm font-semibold text-slate-700">Sort</label>
              <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)} className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium">
                <option value="recommended">Recommended</option>
                <option value="fee">Lowest fee</option>
                <option value="experience">Most experience</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by department">
            {['All', ...DEPARTMENTS].map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={dept === d}
                onClick={() => setDept(d)}
                className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${dept === d ? 'bg-clinic-700 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-clinic-600'}`}
              >
                {d}
              </button>
            ))}
          </div>

          <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={onlyFreeToday} onChange={(e) => setOnlyFreeToday(e.target.checked)} className="h-5 w-5 accent-[#0b6557]" />
            Only show doctors with a free slot today
          </label>

          {filtered.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">No doctors match your search</h3>
              <p className="mt-1 text-slate-600">Try a different name, symptom, or department.</p>
              <button type="button" onClick={() => { setQuery(''); setDept('All'); setOnlyFreeToday(false) }} className="mt-4 min-h-11 rounded-xl bg-clinic-700 px-5 font-bold text-white hover:bg-clinic-800">
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((doctor) => {
                const freeToday = freeSlotCount(doctor.id, todayKey, bookings)
                const isSelected = selectedDoctorId === doctor.id
                return (
                  <li key={doctor.id} className={`fade-up flex flex-col rounded-2xl bg-white p-5 ring-1 transition ${isSelected ? 'ring-2 ring-clinic-600' : 'ring-slate-200'}`}>
                    <div className="flex items-start gap-3">
                      <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-clinic-100 text-base font-extrabold text-clinic-800">
                        {initials(doctor.name)}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold leading-snug text-slate-900">{doctor.name}</h3>
                        <p className="text-sm font-semibold text-clinic-700">{doctor.department}</p>
                        <p className="mt-0.5 text-sm text-slate-500">{doctor.qualification}</p>
                      </div>
                    </div>
                    <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                      <div><dt className="sr-only">Experience</dt><dd><span className="font-bold text-slate-900">{doctor.experience} yrs</span> experience</dd></div>
                      <div><dt className="sr-only">Consultation fee</dt><dd>Fee <span className="font-bold text-slate-900">{inr(doctor.fee)}</span> <span className="text-slate-400">(sample)</span></dd></div>
                    </dl>
                    <p className="mt-3 text-sm text-slate-600">
                      {freeToday > 0 ? <><span className="font-bold text-clinic-700">{freeToday} free slot{freeToday === 1 ? '' : 's'}</span> today</> : 'No free slots left today in this demo'}
                    </p>
                    <button
                      type="button"
                      onClick={() => chooseDoctor(doctor)}
                      aria-expanded={isSelected}
                      className={`mt-4 min-h-11 w-full rounded-xl font-bold transition ${isSelected ? 'bg-clinic-900 text-white' : 'bg-clinic-700 text-white hover:bg-clinic-800'}`}
                    >
                      {isSelected ? 'Selected — choose a slot below' : 'Book a slot'}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Booking panel */}
        {selectedDoctor && (
          <section id="booking-panel" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-12 sm:px-6" aria-labelledby="booking-heading">
            <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200 sm:p-7">
              <h2 id="booking-heading" className="font-display text-2xl font-bold text-slate-900">
                Book with {selectedDoctor.name}
              </h2>
              <p className="mt-1 text-slate-600">
                {selectedDoctor.department} · {selectedDoctor.qualification} · Fee {inr(selectedDoctor.fee)} (sample, pay at the hospital in a real visit — no payment is taken here).
              </p>

              <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-700">1. Choose a date</h3>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Choose a date">
                {DAYS.map((day) => {
                  const key = dayKey(day)
                  const free = freeSlotCount(selectedDoctor.id, key, bookings)
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={selectedDate === key}
                      onClick={() => { setSelectedDate(key); setSelectedTime(null); setConfirmed(null) }}
                      className={`min-h-14 min-w-20 shrink-0 rounded-xl px-3 py-2 text-center font-semibold transition ${selectedDate === key ? 'bg-clinic-700 text-white' : 'bg-clinic-50 text-clinic-900 ring-1 ring-clinic-100 hover:ring-clinic-600'}`}
                    >
                      <span className="block text-sm">{formatDay(day)}</span>
                      <span className={`block text-xs ${selectedDate === key ? 'text-white/80' : 'text-slate-500'}`}>{free} free</span>
                    </button>
                  )
                })}
              </div>

              <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-slate-700">2. Choose a time</h3>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6" role="group" aria-label="Choose a time slot">
                {SLOT_TIMES.map((time) => {
                  const booked = isSlotBooked(selectedDoctor.id, selectedDate, time, bookings)
                  const past = isPastSlot(DAYS.find((d) => dayKey(d) === selectedDate) || DAYS[0], time)
                  const disabled = booked || past
                  const selected = selectedTime === time
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={disabled}
                      aria-pressed={selected}
                      aria-label={`${formatTime12(time)}${booked ? ', booked' : past ? ', time has passed' : ', available'}`}
                      onClick={() => setSelectedTime(time)}
                      className={`min-h-11 rounded-xl px-2 text-sm font-bold transition ${selected ? 'bg-clinic-700 text-white' : disabled ? 'cursor-not-allowed bg-slate-100 text-slate-400 line-through' : 'bg-white text-slate-800 ring-1 ring-slate-300 hover:ring-clinic-600'}`}
                    >
                      {formatTime12(time)}
                    </button>
                  )
                })}
              </div>
              <p className="mt-3 text-sm text-slate-500">
                <span className="font-semibold text-slate-700">Selected:</span>{' '}
                {selectedTime ? `${formatDayLong(DAYS.find((d) => dayKey(d) === selectedDate) || DAYS[0])} at ${formatTime12(selectedTime)}` : 'No slot selected yet.'}
                {' '}Greyed-out slots are already booked in this demo or have passed today.
              </p>
              {errors.slot && <p className="mt-1 text-sm font-semibold text-red-700" role="alert">{errors.slot}</p>}

              <h3 className="mt-7 text-sm font-bold uppercase tracking-wide text-slate-700">3. Patient details</h3>
              <form onSubmit={confirmBooking} noValidate className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="patient-name" className="block text-sm font-semibold text-slate-700">Patient full name *</label>
                  <input id="patient-name" value={patientName} onChange={(e) => setPatientName(e.target.value)} autoComplete="name" aria-invalid={!!errors.patientName} aria-describedby={errors.patientName ? 'patient-name-error' : undefined} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4" placeholder="e.g. Priya Sharma" />
                  {errors.patientName && <p id="patient-name-error" className="mt-1 text-sm font-semibold text-red-700" role="alert">{errors.patientName}</p>}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-slate-700">Mobile number *</label>
                  <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} inputMode="numeric" autoComplete="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4" placeholder="10-digit mobile number" />
                  {errors.phone && <p id="phone-error" className="mt-1 text-sm font-semibold text-red-700" role="alert">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-slate-700">Age *</label>
                  <input id="age" type="number" min="0" max="120" value={age} onChange={(e) => setAge(e.target.value)} aria-invalid={!!errors.age} aria-describedby={errors.age ? 'age-error' : undefined} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4" placeholder="e.g. 32" />
                  {errors.age && <p id="age-error" className="mt-1 text-sm font-semibold text-red-700" role="alert">{errors.age}</p>}
                </div>
                <div>
                  <label htmlFor="reason" className="block text-sm font-semibold text-slate-700">Reason for visit <span className="font-normal text-slate-500">(optional)</span></label>
                  <input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4" placeholder="e.g. Fever for 3 days" />
                </div>
                <p className="text-sm text-slate-500 sm:col-span-2">
                  Demo privacy note: details you enter are stored only in this browser (localStorage). Do not enter sensitive medical records or ID numbers.
                </p>
                {notice && <p className="font-semibold text-red-700 sm:col-span-2" role="alert">{notice}</p>}
                <div className="sm:col-span-2">
                  <button type="submit" className="min-h-12 rounded-xl bg-clinic-700 px-7 text-base font-bold text-white transition hover:bg-clinic-800">
                    Confirm booking
                  </button>
                </div>
              </form>

              {confirmed && (
                <div className="fade-up mt-7 rounded-2xl bg-clinic-50 p-5 ring-1 ring-clinic-100" aria-live="polite">
                  <h3 ref={confirmRef} tabIndex={-1} className="text-xl font-bold text-clinic-900">Booking confirmed (demo)</h3>
                  <p className="mt-1 text-slate-700">Show this reference if this were a real visit. In this demo it is only saved in your browser.</p>
                  <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <div><dt className="font-semibold text-slate-500">Booking reference</dt><dd className="text-base font-extrabold text-slate-900">{confirmed.id}</dd></div>
                    <div><dt className="font-semibold text-slate-500">Doctor</dt><dd className="font-semibold text-slate-900">{confirmed.doctorName} · {confirmed.department}</dd></div>
                    <div><dt className="font-semibold text-slate-500">Date &amp; time</dt><dd className="font-semibold text-slate-900">{formatDayLong(DAYS.find((d) => dayKey(d) === confirmed.date) || new Date(confirmed.date + 'T00:00:00'))} at {formatTime12(confirmed.time)}</dd></div>
                    <div><dt className="font-semibold text-slate-500">Patient</dt><dd className="font-semibold text-slate-900">{confirmed.patientName}, age {confirmed.age}</dd></div>
                    <div><dt className="font-semibold text-slate-500">Fee (sample)</dt><dd className="font-semibold text-slate-900">{inr(confirmed.fee)}</dd></div>
                    {confirmed.reason && <div><dt className="font-semibold text-slate-500">Reason</dt><dd className="font-semibold text-slate-900">{confirmed.reason}</dd></div>}
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a href="#bookings" className="min-h-11 rounded-xl bg-clinic-700 px-5 py-2.5 font-bold text-white hover:bg-clinic-800">View my bookings</a>
                    <button type="button" onClick={() => setConfirmed(null)} className="min-h-11 rounded-xl bg-white px-5 font-bold text-clinic-800 ring-1 ring-clinic-600 hover:bg-clinic-50">Book another slot</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-12 sm:px-6" aria-labelledby="how-heading">
          <h2 id="how-heading" className="font-display text-3xl font-bold text-slate-900">How it works</h2>
          <ol className="mt-6 grid gap-5 sm:grid-cols-3">
            {[
              { title: '1. Find your doctor', text: 'Search by name, department, or symptom, then compare experience and the sample fee.' },
              { title: '2. Pick a slot', text: 'Choose one of the next 7 days and an available time. Booked slots are greyed out and cannot be selected.' },
              { title: '3. Confirm & manage', text: 'Enter patient details to confirm. Your bookings stay in My bookings, where you can cancel and free the slot again.' },
            ].map((step) => (
              <li key={step.title} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1 leading-relaxed text-slate-600">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* My bookings */}
        <section id="bookings" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-14 sm:px-6" aria-labelledby="bookings-heading">
          <h2 id="bookings-heading" className="font-display text-3xl font-bold text-slate-900">My bookings</h2>
          <p className="mt-1 text-slate-600">Saved only in this browser. Clearing browser data removes them.</p>
          {notice && !confirmed && <p className="mt-3 font-semibold text-clinic-800" role="status">{notice}</p>}
          {sortedBookings.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200">
              <h3 className="text-lg font-bold text-slate-900">No bookings yet</h3>
              <p className="mt-1 text-slate-600">Choose a doctor above and pick a slot to make your first demo booking.</p>
              <a href="#doctors" className="mt-4 inline-block min-h-11 rounded-xl bg-clinic-700 px-5 py-2.5 font-bold text-white hover:bg-clinic-800">Find a doctor</a>
            </div>
          ) : (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {sortedBookings.map((b) => (
                <li key={b.id} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{b.doctorName}</h3>
                    <span className="rounded-full bg-clinic-100 px-2.5 py-1 text-xs font-bold text-clinic-800">{b.id}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{b.department} · {formatDayLong(new Date(b.date + 'T00:00:00'))} at {formatTime12(b.time)}</p>
                  <p className="mt-1 text-sm text-slate-600">{b.patientName}, age {b.age} · Fee {inr(b.fee)} (sample)</p>
                  {b.reason && <p className="mt-1 text-sm text-slate-600">Reason: {b.reason}</p>}
                  <button
                    type="button"
                    onClick={() => cancelBooking(b.id)}
                    className={`mt-4 min-h-11 rounded-xl px-5 font-bold transition ${confirmCancelId === b.id ? 'bg-red-700 text-white' : 'bg-white text-red-700 ring-1 ring-red-300 hover:bg-red-50'}`}
                  >
                    {confirmCancelId === b.id ? 'Tap again to confirm cancellation' : 'Cancel booking'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl text-sm leading-relaxed text-slate-600">
          <p className="font-bold text-slate-900">HSPTL — demo hospital slot booking</p>
          <p className="mt-1">
            Sample doctors, fees, and slots only. No real hospital, no real appointments, no payments, and no data sent anywhere.
            Built with React, Vite, and Tailwind CSS. Bookings are stored in this browser only.
          </p>
          <p className="mt-2">For a real medical emergency, contact your local emergency services.</p>
        </div>
      </footer>
    </div>
  )
}
