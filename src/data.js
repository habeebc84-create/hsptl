// SAMPLE DATA ONLY — fictional doctors, fees and slots for this demo.
// Nothing here is a real hospital, doctor, or appointment.

export const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Paediatrics',
  'Orthopaedics',
  'Dermatology',
  'Dentistry',
]

export const DOCTORS = [
  { id: 'ananya-rao', name: 'Dr Ananya Rao', department: 'General Medicine', qualification: 'MBBS, MD (General Medicine)', experience: 12, fee: 500, tags: ['fever', 'diabetes', 'thyroid', 'general checkup'] },
  { id: 'vikram-reddy', name: 'Dr Vikram Reddy', department: 'General Medicine', qualification: 'MBBS, MD (General Medicine)', experience: 8, fee: 400, tags: ['fever', 'cough', 'blood pressure', 'general checkup'] },
  { id: 'meera-nair', name: 'Dr Meera Nair', department: 'Cardiology', qualification: 'MBBS, MD, DM (Cardiology)', experience: 15, fee: 900, tags: ['heart', 'chest pain', 'bp', 'ecg'] },
  { id: 'arjun-patel', name: 'Dr Arjun Patel', department: 'Cardiology', qualification: 'MBBS, MD, DM (Cardiology)', experience: 10, fee: 800, tags: ['heart', 'cholesterol', 'ecg', 'palpitations'] },
  { id: 'sara-thomas', name: 'Dr Sara Thomas', department: 'Paediatrics', qualification: 'MBBS, MD (Paediatrics)', experience: 11, fee: 600, tags: ['child', 'baby', 'vaccination', 'fever'] },
  { id: 'nikhil-sharma', name: 'Dr Nikhil Sharma', department: 'Paediatrics', qualification: 'MBBS, DCH', experience: 7, fee: 500, tags: ['child', 'baby', 'growth', 'cough'] },
  { id: 'kavya-menon', name: 'Dr Kavya Menon', department: 'Orthopaedics', qualification: 'MBBS, MS (Orthopaedics)', experience: 13, fee: 700, tags: ['bone', 'joint', 'knee', 'back pain', 'fracture'] },
  { id: 'rohit-gupta', name: 'Dr Rohit Gupta', department: 'Orthopaedics', qualification: 'MBBS, MS (Orthopaedics)', experience: 9, fee: 600, tags: ['bone', 'shoulder', 'sports injury', 'back pain'] },
  { id: 'priya-iyer', name: 'Dr Priya Iyer', department: 'Dermatology', qualification: 'MBBS, MD (Dermatology)', experience: 10, fee: 600, tags: ['skin', 'acne', 'rash', 'hair'] },
  { id: 'aditya-khan', name: 'Dr Aditya Khan', department: 'Dermatology', qualification: 'MBBS, MD (Dermatology)', experience: 6, fee: 500, tags: ['skin', 'acne', 'allergy', 'hair'] },
  { id: 'neha-desai', name: 'Dr Neha Desai', department: 'Dentistry', qualification: 'BDS, MDS', experience: 9, fee: 400, tags: ['tooth', 'teeth', 'cavity', 'braces'] },
  { id: 'kiran-kumar', name: 'Dr Kiran Kumar', department: 'Dentistry', qualification: 'BDS', experience: 5, fee: 300, tags: ['tooth', 'teeth', 'cleaning', 'pain'] },
]

export const SLOT_TIMES = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '16:00', '16:30', '17:00', '17:30', '18:00',
]
