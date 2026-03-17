// ─────────────────────────────────────────────
//  🔥 REPLACE THIS BLOCK WITH YOUR FIREBASE CONFIG
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
// ─────────────────────────────────────────────

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ── UI helpers ──────────────────────────────
function show(id)   { document.getElementById(id).classList.remove('hidden'); }
function hide(id)   { document.getElementById(id).classList.add('hidden'); }
function setError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
}

// ── State ────────────────────────────────────
let currentStudentId = null;

// ── LOGIN ────────────────────────────────────
async function login() {
  const raw = document.getElementById('student-id').value.trim();
  setError('');

  if (!raw) {
    setError('กรุณากรอกรหัสนักเรียน');
    return;
  }

  // Basic format check – adjust the regex to match your school's ID format
  const idPattern = /^\d{5,10}$/;
  if (!idPattern.test(raw)) {
    setError('รหัสนักเรียนไม่ถูกต้อง (ตัวเลข 5–10 หลัก)');
    return;
  }

  try {
    // Check if this student has already voted
    const snap = await db.ref(`votes/${raw}`).get();
    if (snap.exists()) {
      setError('รหัสนักเรียนนี้ได้ลงคะแนนแล้ว');
      return;
    }

    // All good – proceed to vote screen
    currentStudentId = raw;
    hide('login-section');
    show('vote-section');

  } catch (err) {
    console.error(err);
    setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
  }
}

// Allow pressing Enter in the input to trigger login
document.getElementById('student-id').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') login();
});

// ── CAST VOTE ────────────────────────────────
async function castVote(partyNumber) {
  if (!currentStudentId) return;

  // Disable all vote buttons to prevent double-taps
  document.querySelectorAll('.btn-vote, .candidate-card').forEach(el => {
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.6';
  });

  try {
    // Record that this student voted (value = party number)
    await db.ref(`votes/${currentStudentId}`).set(partyNumber);

    // Increment the party's tally atomically
    const tallyRef = db.ref(`tally/party${partyNumber}`);
    await tallyRef.transaction((current) => (current || 0) + 1);

    hide('vote-section');
    show('success-section');

  } catch (err) {
    console.error(err);
    // Re-enable buttons on failure
    document.querySelectorAll('.btn-vote, .candidate-card').forEach(el => {
      el.style.pointerEvents = '';
      el.style.opacity = '';
    });
    alert('เกิดข้อผิดพลาดขณะบันทึกคะแนน กรุณาลองใหม่');
  }
}
