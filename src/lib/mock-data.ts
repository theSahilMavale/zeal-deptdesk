export const DEPARTMENTS = [
  { id: "CO", name: "Computer Engineering", hod: "Dr. P. Kale", faculty: 18, students: 420 },
  { id: "IT", name: "Information Technology", hod: "Dr. R. Joshi", faculty: 14, students: 360 },
  { id: "ME", name: "Mechanical Engineering", hod: "Dr. S. Pawar", faculty: 16, students: 380 },
  { id: "EJ", name: "Electronics & Telecom", hod: "Dr. V. Mehta", faculty: 12, students: 290 },
  { id: "CE", name: "Civil Engineering", hod: "Dr. A. Naik", faculty: 11, students: 250 },
];

export const CLASSES = [
  { id: "CO5I", name: "CO5I", dept: "CO", year: "TY", students: 62, mentor: "Prof. S. Deshpande" },
  { id: "CO4I", name: "CO4I", dept: "CO", year: "SY", students: 70, mentor: "Prof. K. Rao" },
  { id: "IT5I", name: "IT5I", dept: "IT", year: "TY", students: 58, mentor: "Prof. M. Iyer" },
  { id: "ME3I", name: "ME3I", dept: "ME", year: "SY", students: 64, mentor: "Prof. D. Shah" },
  { id: "EJ5I", name: "EJ5I", dept: "EJ", year: "TY", students: 48, mentor: "Prof. P. Nair" },
  { id: "CE3I", name: "CE3I", dept: "CE", year: "SY", students: 52, mentor: "Prof. R. Verma" },
];

export const SUBJECTS = [
  { code: "22516", name: "Operating Systems", dept: "CO", sem: 5, credits: 4, type: "Theory + Practical" },
  { code: "22517", name: "Software Engineering", dept: "CO", sem: 5, credits: 3, type: "Theory" },
  { code: "22518", name: "Advanced Java Programming", dept: "CO", sem: 5, credits: 5, type: "Theory + Practical" },
  { code: "22519", name: "Mobile Application Development", dept: "IT", sem: 5, credits: 4, type: "Practical" },
  { code: "22301", name: "Thermal Engineering", dept: "ME", sem: 3, credits: 4, type: "Theory" },
  { code: "22411", name: "Digital Communication", dept: "EJ", sem: 4, credits: 3, type: "Theory + Practical" },
];

export const STUDENTS = Array.from({ length: 24 }).map((_, i) => {
  const first = ["Rohan","Aditi","Sahil","Priya","Karan","Sneha","Aniket","Mira","Devansh","Isha","Yash","Tanvi","Aryan","Riya","Om","Pooja","Vivek","Kiara","Nikhil","Sara","Atharva","Anushka","Soham","Neha"][i];
  const last = ["Patil","Sharma","Joshi","Kulkarni","Deshmukh","Iyer","Pawar","Naik","Shah","Verma","Rao","Mehta","Singh","Nair","Reddy","Kale","Gokhale","Bhosale","Chavan","Jadhav","More","Wagh","Salunkhe","Pande"][i];
  const cls = CLASSES[i % CLASSES.length];
  return {
    id: `Z21${(1000 + i).toString()}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@zealpoly.edu`,
    phone: `98${(20000000 + i * 12345).toString().slice(0, 8)}`,
    class: cls.name,
    dept: cls.dept,
    year: cls.year,
    cgpa: (6 + Math.random() * 3.5).toFixed(2),
    attendance: Math.round(70 + Math.random() * 28),
  };
});

export const FACULTY = [
  { id: "F101", name: "Prof. Sneha Deshpande", email: "sneha@zealpoly.edu", dept: "CO", designation: "Lecturer", subjects: ["OS","SE"], experience: 8 },
  { id: "F102", name: "Dr. P. Kale", email: "pkale@zealpoly.edu", dept: "CO", designation: "HOD", subjects: ["AJP"], experience: 18 },
  { id: "F103", name: "Prof. K. Rao", email: "krao@zealpoly.edu", dept: "CO", designation: "Sr. Lecturer", subjects: ["DSU","DBMS"], experience: 12 },
  { id: "F201", name: "Dr. R. Joshi", email: "rjoshi@zealpoly.edu", dept: "IT", designation: "HOD", subjects: ["MAD"], experience: 20 },
  { id: "F301", name: "Dr. S. Pawar", email: "spawar@zealpoly.edu", dept: "ME", designation: "HOD", subjects: ["TE"], experience: 22 },
  { id: "F401", name: "Dr. V. Mehta", email: "vmehta@zealpoly.edu", dept: "EJ", designation: "HOD", subjects: ["DC"], experience: 17 },
  { id: "F501", name: "Dr. A. Naik", email: "anaik@zealpoly.edu", dept: "CE", designation: "HOD", subjects: ["SOM"], experience: 15 },
];

export const USERS = [
  ...FACULTY.map((f) => ({ id: f.id, name: f.name, email: f.email, role: "Faculty", status: "Active" })),
  ...STUDENTS.slice(0, 10).map((s) => ({ id: s.id, name: s.name, email: s.email, role: "Student", status: "Active" })),
  { id: "A001", name: "Dr. Anil Kulkarni", email: "admin@zealpoly.edu", role: "Admin", status: "Active" },
  { id: "A002", name: "Mrs. P. Joshi", email: "registrar@zealpoly.edu", role: "Admin", status: "Active" },
];

export const ATTENDANCE_RECENT = STUDENTS.slice(0, 10).map((s) => ({
  ...s,
  status: Math.random() > 0.15 ? "Present" : "Absent",
  date: "2026-06-25",
  subject: "Operating Systems",
}));

export const ATTENDANCE_TREND = [
  { week: "W1", present: 92 }, { week: "W2", present: 88 }, { week: "W3", present: 94 },
  { week: "W4", present: 90 }, { week: "W5", present: 86 }, { week: "W6", present: 91 },
  { week: "W7", present: 95 }, { week: "W8", present: 89 },
];

export const DEPT_ENROLLMENT = DEPARTMENTS.map((d) => ({ name: d.id, students: d.students }));

export const RESULTS = STUDENTS.slice(0, 12).map((s) => ({
  id: s.id,
  name: s.name,
  class: s.class,
  os: Math.round(50 + Math.random() * 45),
  se: Math.round(55 + Math.random() * 40),
  ajp: Math.round(45 + Math.random() * 50),
  total: 0,
  grade: "",
})).map((r) => {
  const total = r.os + r.se + r.ajp;
  const pct = total / 3;
  const grade = pct >= 90 ? "O" : pct >= 80 ? "A+" : pct >= 70 ? "A" : pct >= 60 ? "B+" : pct >= 50 ? "B" : "C";
  return { ...r, total, grade };
});

export const PRACTICALS = [
  { id: "P01", subject: "Operating Systems", title: "Process Scheduling using FCFS & SJF", dept: "CO", sem: 5, status: "Published" },
  { id: "P02", subject: "Operating Systems", title: "Memory Management Simulation", dept: "CO", sem: 5, status: "Published" },
  { id: "P03", subject: "Advanced Java", title: "Build a Servlet-based Login System", dept: "CO", sem: 5, status: "Draft" },
  { id: "P04", subject: "Mobile App Dev", title: "Android UI with Jetpack Compose", dept: "IT", sem: 5, status: "Published" },
  { id: "P05", subject: "Digital Communication", title: "AM & FM Modulation in MATLAB", dept: "EJ", sem: 4, status: "Published" },
  { id: "P06", subject: "Thermal Engineering", title: "Performance Analysis of IC Engine", dept: "ME", sem: 3, status: "Review" },
];

export const PROJECTS = STUDENTS.slice(0, 10).map((s, i) => ({
  id: `PRJ${100 + i}`,
  team: s.name + (i % 3 === 0 ? " + 2 others" : ""),
  title: [
    "Smart Attendance System using Face Recognition",
    "Campus Navigation App",
    "AI-based Crop Disease Detector",
    "Library Book Recommender",
    "IoT Energy Monitor",
    "Online Examination Portal",
    "EV Charging Locator",
    "Voice-based Student Assistant",
    "Mental Wellness Tracker",
    "Blockchain Mark Sheet Verifier",
  ][i],
  guide: FACULTY[i % FACULTY.length].name,
  internal: Math.round(60 + Math.random() * 35),
  external: Math.round(55 + Math.random() * 40),
  status: ["Submitted","Evaluated","In Progress","Evaluated","Submitted"][i % 5],
}));

export const TIMETABLE = [
  { time: "09:00 - 10:00", mon: "OS",  tue: "SE",  wed: "AJP", thu: "OS",  fri: "DBMS", sat: "Sport" },
  { time: "10:00 - 11:00", mon: "AJP", tue: "OS",  wed: "SE",  thu: "AJP", fri: "OS",   sat: "Library" },
  { time: "11:15 - 12:15", mon: "SE",  tue: "DBMS",wed: "OS",  thu: "SE",  fri: "AJP",  sat: "Project" },
  { time: "12:15 - 01:15", mon: "DBMS",tue: "AJP", wed: "DBMS",thu: "DBMS",fri: "SE",   sat: "Project" },
  { time: "02:00 - 04:00", mon: "OS Lab",  tue: "AJP Lab", wed: "MAD Lab", thu: "DBMS Lab", fri: "SE Lab", sat: "—" },
];

export const NOTICES = [
  { id: "N01", title: "Mid-semester Exam Schedule Released", category: "Exam", date: "2026-06-24", author: "Exam Cell", pinned: true },
  { id: "N02", title: "Industrial Visit to TCS Pune — Register by Friday", category: "Event", date: "2026-06-22", author: "T&P Cell", pinned: true },
  { id: "N03", title: "Library will remain closed on 28 June", category: "General", date: "2026-06-20", author: "Library", pinned: false },
  { id: "N04", title: "Hackathon 2026 — Team registration open", category: "Event", date: "2026-06-18", author: "CO Dept", pinned: false },
  { id: "N05", title: "Fee Payment Deadline: 30 June 2026", category: "Accounts", date: "2026-06-15", author: "Accounts", pinned: false },
  { id: "N06", title: "Guest Lecture on Generative AI — 1 July", category: "Academic", date: "2026-06-12", author: "IT Dept", pinned: false },
];
