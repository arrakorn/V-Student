// =============================================================
//  firebase-seed.js
//  สคริปต์สำหรับเพิ่มข้อมูลนักเรียนตัวอย่างเข้า Firestore
//  วิธีใช้: รันใน Firebase Console → Functions หรือ Node.js
//  หรือ copy วางใน Browser Console หลัง import Firebase SDK
// =============================================================

/*
  โครงสร้าง Firestore ที่แอปนี้ใช้:

  ┌─────────────────────────────────────────────────┐
  │  Collection: students                            │
  │  Document ID: รหัสนักเรียน (เช่น STU2025)       │
  │  Fields:                                         │
  │    name      : string  — ชื่อ-นามสกุล           │
  │    pin       : string  — PIN 4-6 หลัก            │
  │    hasVoted  : boolean — เริ่มต้น false          │
  │    refNumber : string  — (ว่าง ก่อนโหวต)        │
  ├─────────────────────────────────────────────────┤
  │  Collection: votes                               │
  │  Document ID: refNumber (เช่น WB-ABC123-DEF4)   │
  │  Fields:                                         │
  │    studentId   : string                          │
  │    voterName   : string                          │
  │    selections  : map                             │
  │      president       : candidateId              │
  │      vice_president  : candidateId              │
  │      secretary       : candidateId              │
  │      treasurer       : candidateId              │
  │    refNumber   : string                          │
  │    submittedAt : timestamp                       │
  └─────────────────────────────────────────────────┘

  Firestore Security Rules (วางใน Firestore Rules):
  ─────────────────────────────────────────────────
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {

      // อ่านได้เฉพาะ document ของตัวเอง ห้ามเขียนจาก client โดยตรง (ยกเว้น hasVoted)
      match /students/{studentId} {
        allow read: if true;
        allow write: if false; // ให้ app.js ใช้ Admin SDK เท่านั้น
      }

      // บันทึกได้ครั้งเดียว ห้ามแก้ไข
      match /votes/{voteId} {
        allow create: if true;
        allow read, update, delete: if false;
      }
    }
  }
*/

// ─────────────────────────────────────────────
//  ข้อมูลนักเรียนตัวอย่าง (สำหรับ seed)
//  วิธีใช้: วางใน Firebase Console > Firestore > เพิ่ม Document
// ─────────────────────────────────────────────
const SAMPLE_STUDENTS = [
  { id: 'STU2025', name: 'นายสมชาย ใจดี',         pin: '1234', hasVoted: false, refNumber: '' },
  { id: 'STU2026', name: 'นางสาวนภา สุขสม',        pin: '5678', hasVoted: false, refNumber: '' },
  { id: 'STU2027', name: 'นายวิชัย มั่นคง',         pin: '9012', hasVoted: false, refNumber: '' },
  { id: 'STU2028', name: 'นางสาวปาลิตา ชื่นใจ',    pin: '3456', hasVoted: false, refNumber: '' },
  { id: 'STU2029', name: 'นายธีระพงศ์ รักดี',       pin: '7890', hasVoted: false, refNumber: '' },
  { id: 'STU2030', name: 'นางสาวกัลยาณี วงศ์ทอง',  pin: '2468', hasVoted: false, refNumber: '' },
];

/*
  วิธี seed ด้วย Firebase Admin SDK (Node.js):
  ─────────────────────────────────────────────
  const admin = require('firebase-admin');
  const serviceAccount = require('./serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();

  async function seedStudents() {
    for (const student of SAMPLE_STUDENTS) {
      const { id, ...data } = student;
      await db.collection('students').doc(id).set(data);
      console.log(`✅ เพิ่ม ${id} — ${data.name}`);
    }
    console.log('🎉 Seed เสร็จสิ้น!');
  }

  seedStudents();
*/

console.log('📋 ข้อมูลนักเรียนตัวอย่าง:');
console.table(SAMPLE_STUDENTS.map(s => ({
  'รหัสนักเรียน': s.id,
  'ชื่อ':         s.name,
  'PIN':           s.pin,
})));
