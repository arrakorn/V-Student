// =============================================================
//  การเลือกตั้งสภานักเรียน 2568 — app.js
//  ใช้ Firebase v9 Compat SDK (ทำงานได้กับ <script> tag ปกติ)
//  ไม่ต้องใช้ bundler / local server / type="module"
// =============================================================

// ─────────────────────────────────────────────
//  1) Firebase Config & Init
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyB4k3-LHtyC6nikVKnDQWPHxy5Z-5t3POo",
  authDomain:        "v-student-4a4d6.firebaseapp.com",
  projectId:         "v-student-4a4d6",
  storageBucket:     "v-student-4a4d6.firebasestorage.app",
  messagingSenderId: "350774501594",
  appId:             "1:350774501594:web:0d4249981f805e563b05e3",
  measurementId:     "G-QNKHK7T7SF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// แจ้งสถานะ Firebase บนหน้า Login
window.addEventListener('load', () => {
  db.collection('students').limit(1).get()
    .then(() => {
      const el = document.getElementById('firebaseStatus');
      if (el) el.textContent = '✅ เชื่อมต่อ Firestore สำเร็จ';
    })
    .catch(err => {
      const el = document.getElementById('firebaseStatus');
      if (el) el.textContent = '❌ Firestore: ' + err.code;
      console.error('Firestore connection error:', err);
    });
  setTimeout(() => document.getElementById('loadingOverlay').classList.add('hidden'), 800);
});

// ─────────────────────────────────────────────
//  2) ข้อมูลตำแหน่งและผู้สมัคร
// ─────────────────────────────────────────────
const ROLES = [
  { id:'president',      title:'ประธาน',     icon:'👑', description:'เลือกผู้สมัครที่คุณต้องการให้เป็นประธานสภานักเรียน' },
  { id:'vice_president', title:'รองประธาน',  icon:'🤝', description:'เลือกผู้สมัครที่คุณต้องการให้เป็นรองประธานสภานักเรียน' },
  { id:'secretary',      title:'เลขานุการ', icon:'📝', description:'เลือกผู้สมัครที่คุณต้องการให้เป็นเลขานุการสภานักเรียน' },
  { id:'treasurer',      title:'เหรัญญิก',  icon:'💰', description:'เลือกผู้สมัครที่คุณต้องการให้เป็นเหรัญญิกสภานักเรียน' },
];

const CANDIDATES = {
  president: [
    { id:'p1', name:'นายปิยะ วงศ์สวัสดิ์',   grade:'ม.5', tags:['ความเป็นผู้นำ','ชุมชน','กีฬา'],      motto:'"ร่วมกันเราก้าวไกล — ทุกเสียงสมควรได้รับการฟัง"',        color:'linear-gradient(135deg,#1d4ed8,#3b82f6)', initials:'ป.ว' },
    { id:'p2', name:'นางสาวกานต์ ศรีสุข',     grade:'ม.6', tags:['นวัตกรรม','เทคโนโลยี','ศิลปะ'],    motto:'"นวัตกรรม ความร่วมมือ และเฉลิมฉลองความแตกต่าง"',         color:'linear-gradient(135deg,#7c3aed,#a78bfa)', initials:'ก.ศ' },
    { id:'p3', name:'นายธนพล มีสุข',          grade:'ม.5', tags:['ความเท่าเทียม','STEM','โต้วาที'],   motto:'"โรงเรียนที่นักเรียนทุกคนเจริญเติบโตโดยไม่มีข้อยกเว้น"',  color:'linear-gradient(135deg,#0f766e,#2dd4bf)', initials:'ธ.ม' },
    { id:'p4', name:'นางสาวพิมพ์ชนก ดีใจ',   grade:'ม.6', tags:['สุขภาวะ','กิจกรรม','ดนตรี'],      motto:'"นักเรียนมีความสุข โรงเรียนก็มีความสุข — มาสร้างด้วยกัน"', color:'linear-gradient(135deg,#d97706,#fbbf24)', initials:'พ.ด' },
  ],
  vice_president: [
    { id:'v1', name:'นางสาวสุดา รักษ์โลก',   grade:'ม.5', tags:['สิ่งแวดล้อม','ชมรม'],              motto:'"ความยั่งยืนเริ่มต้นในห้องเรียนและทางเดินของเรา"',          color:'linear-gradient(135deg,#059669,#34d399)', initials:'ส.ร' },
    { id:'v2', name:'นายอิทธิพล บุญมา',       grade:'ม.4', tags:['ระดมทุน','จิตวิญญาณ'],            motto:'"นำพลังงาน เงินทุน และจิตวิญญาณโรงเรียนทุกวัน"',           color:'linear-gradient(135deg,#dc2626,#f87171)', initials:'อ.บ' },
    { id:'v3', name:'นางสาวอมรา ชื่นชม',      grade:'ม.5', tags:['ความหลากหลาย','สื่อ','ละคร'],     motto:'"เป็นตัวแทนทุกวัฒนธรรมที่ทำให้โรงเรียนเราสวยงาม"',          color:'linear-gradient(135deg,#9333ea,#c084fc)', initials:'อ.ช' },
  ],
  secretary: [
    { id:'s1', name:'นายวีระ จัดการดี',       grade:'ม.4', tags:['การจัดการ','บันทึก','เว็บไซต์'],  motto:'"ความแม่นยำ ความชัดเจน และความโปร่งใสในทุกสิ่ง"',          color:'linear-gradient(135deg,#1d4ed8,#60a5fa)', initials:'ว.จ' },
    { id:'s2', name:'นางสาวซาร่า อาหมัด',     grade:'ม.5', tags:['การสื่อสาร','จดหมายข่าว'],        motto:'"ทำให้สภาและโรงเรียนของเราได้รับข้อมูลอย่างครบถ้วน"',       color:'linear-gradient(135deg,#be185d,#f472b6)', initials:'ซ.อ' },
    { id:'s3', name:'นายฟินน์ แอนเดอร์สัน',  grade:'ม.4', tags:['รายงานการประชุม','เทค','ดีไซน์'], motto:'"บันทึกดิจิทัล ความโปร่งใสจริง — ทุกการประชุม ทุกการโหวต"', color:'linear-gradient(135deg,#0369a1,#38bdf8)', initials:'ฟ.แ' },
  ],
  treasurer: [
    { id:'t1', name:'นางสาวอิสเบล โมโร',     grade:'ม.6', tags:['การเงิน','งบประมาณ','Excel'],      motto:'"ทุกบาทที่บริหารจัดการดีคือโครงการที่เป็นจริง"',            color:'linear-gradient(135deg,#f59e0b,#fcd34d)', initials:'อ.โ' },
    { id:'t2', name:'นายมาร์คัส เวบ',         grade:'ม.5', tags:['ตรวจสอบ','ระดมทุน'],              motto:'"รับผิดชอบ โปร่งใส และนักเรียนเป็นอันดับแรกเสมอ"',           color:'linear-gradient(135deg,#0f172a,#475569)', initials:'ม.ว' },
    { id:'t3', name:'นางสาวนาเดีย โควาลสกี้', grade:'ม.6', tags:['ทุน','กิจกรรม','วางแผน'],         motto:'"ปลดล็อกทรัพยากรที่ทำให้ไอเดียดีๆ เป็นจริง"',              color:'linear-gradient(135deg,#7c3aed,#ddd6fe)', initials:'น.โ' },
  ],
};

// ─────────────────────────────────────────────
//  3) Application State
// ─────────────────────────────────────────────
let state = {
  loggedIn:    false,
  studentId:   '',
  voterName:   '',
  currentStep: 0,
  selections:  {},
  voted:       false,
  refNumber:   '',
};

// ─────────────────────────────────────────────
//  4) Utility
// ─────────────────────────────────────────────
function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(msg, type) {
  const tc = document.getElementById('toastContainer');
  const t  = document.createElement('div');
  t.className = 'toast ' + (type || '');
  t.textContent = msg;
  tc.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function genRefNumber() {
  return 'WB-' + Date.now().toString(36).toUpperCase().slice(-5) + '-' +
         Math.random().toString(36).toUpperCase().slice(2, 6);
}

// ─────────────────────────────────────────────
//  5) Firebase: ตรวจสอบนักเรียน
//     Firestore: students/{studentId}
//     { name, pin, hasVoted, refNumber }
// ─────────────────────────────────────────────
async function verifyStudent(sid, pin) {
  const snap = await db.collection('students').doc(sid).get();

  if (!snap.exists) {
    return { ok: false, reason: 'not_found' };
  }

  const data = snap.data();

  if (String(data.pin) !== String(pin)) {
    return { ok: false, reason: 'wrong_pin' };
  }

  if (data.hasVoted === true) {
    return { ok: false, reason: 'already_voted', name: data.name };
  }

  return { ok: true, name: data.name };
}

// ─────────────────────────────────────────────
//  6) Firebase: บันทึกบัตรเลือกตั้ง
//     votes/{refNumber}  +  students/{sid}.hasVoted = true
// ─────────────────────────────────────────────
async function submitVoteToFirebase(refNumber, selections) {
  const batch = db.batch();

  // เขียน document ใหม่ใน votes
  const voteRef = db.collection('votes').doc(refNumber);
  batch.set(voteRef, {
    studentId:   state.studentId,
    voterName:   state.voterName,
    selections:  selections,
    refNumber:   refNumber,
    submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  // อัปเดตสถานะนักเรียน → ห้ามโหวตซ้ำ
  const stuRef = db.collection('students').doc(state.studentId);
  batch.update(stuRef, {
    hasVoted:  true,
    refNumber: refNumber,
    votedAt:   firebase.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
}

// ─────────────────────────────────────────────
//  7) Login
// ─────────────────────────────────────────────
async function handleLogin() {
  const sid = document.getElementById('inputStudentId').value.trim().toUpperCase();
  const pin = document.getElementById('inputPin').value.trim();

  // Reset errors
  document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('#view-login input').forEach(i => i.classList.remove('error'));

  if (!sid) {
    document.getElementById('errStudentId').textContent = 'กรุณากรอกรหัสนักเรียน';
    document.getElementById('errStudentId').classList.add('show');
    document.getElementById('inputStudentId').classList.add('error');
    return;
  }
  if (!pin || pin.length < 4) {
    document.getElementById('errPin').textContent = 'กรุณากรอก PIN อย่างน้อย 4 หลัก';
    document.getElementById('errPin').classList.add('show');
    document.getElementById('inputPin').classList.add('error');
    return;
  }

  const btn = document.getElementById('btnLogin');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> กำลังตรวจสอบ…';

  try {
    const result = await verifyStudent(sid, pin);

    if (!result.ok) {
      btn.disabled  = false;
      btn.textContent = 'เข้าสู่บัตรเลือกตั้ง →';

      if (result.reason === 'not_found') {
        document.getElementById('errStudentId').textContent = '❌ ไม่พบรหัสนักเรียนนี้ใน Firestore';
        document.getElementById('errStudentId').classList.add('show');
        document.getElementById('inputStudentId').classList.add('error');
      } else if (result.reason === 'wrong_pin') {
        document.getElementById('errPin').textContent = '❌ รหัส PIN ไม่ถูกต้อง';
        document.getElementById('errPin').classList.add('show');
        document.getElementById('inputPin').classList.add('error');
      } else if (result.reason === 'already_voted') {
        document.getElementById('errPin').textContent =
          '⚠️ ' + result.name + ' ลงคะแนนไปแล้ว ไม่สามารถโหวตซ้ำได้';
        document.getElementById('errPin').classList.add('show');
        showToast('⚠️ บัญชีนี้ลงคะแนนไปแล้ว', 'warning');
      }
      return;
    }

    // ✅ เข้าสู่ระบบสำเร็จ
    state.studentId   = sid;
    state.voterName   = result.name;
    state.loggedIn    = true;
    state.selections  = {};
    state.currentStep = 0;
    state.voted       = false;

    const parts   = result.name.replace(/นาย|นางสาว|นาง/g,'').trim().split(' ');
    const initials = parts.map(w => w[0] || '').join('').substring(0, 2);
    document.getElementById('voterInitials').textContent   = initials;
    document.getElementById('voterName').textContent       = result.name;
    document.getElementById('voterChip').style.display     = 'flex';
    document.getElementById('pledgeVoterName').textContent = result.name;

    buildVotingView();
    showView('view-voting');
    showToast('ยินดีต้อนรับ ' + result.name + '! 🎉', 'success');

  } catch (err) {
    console.error('Login Firestore error:', err);
    btn.disabled    = false;
    btn.textContent = 'เข้าสู่บัตรเลือกตั้ง →';

    let msg = '❌ เกิดข้อผิดพลาด: ' + (err.code || err.message);
    if (err.code === 'permission-denied') {
      msg = '❌ Firestore Rules ปฏิเสธการเข้าถึง — ตรวจสอบ Security Rules';
    } else if (err.code === 'unavailable') {
      msg = '❌ ไม่มีการเชื่อมต่ออินเทอร์เน็ต';
    }
    showToast(msg, 'error');
    document.getElementById('errPin').textContent = msg;
    document.getElementById('errPin').classList.add('show');
  }
}

// ─────────────────────────────────────────────
//  8) Voting UI
// ─────────────────────────────────────────────
function buildVotingView() {
  buildStepper();
  buildRoleTabs();
  renderStep(state.currentStep);
}

function buildStepper() {
  const el = document.getElementById('stepper');
  el.innerHTML = '';
  ROLES.forEach((role, i) => {
    if (i > 0) {
      const line = document.createElement('div');
      line.className = 'step-line' + (i <= state.currentStep ? ' done' : '');
      el.appendChild(line);
    }
    const isDone   = (i < state.currentStep) || !!state.selections[role.id];
    const isActive = (i === state.currentStep);
    const step = document.createElement('div');
    step.className = 'step' + (isActive ? ' active' : '') + (isDone && !isActive ? ' done' : '');
    step.innerHTML = '<div class="step-dot">' + (isDone && !isActive ? '✓' : (i+1)) + '</div>' +
                     '<div class="step-label">' + role.title + '</div>';
    el.appendChild(step);
  });
}

function buildRoleTabs() {
  const el = document.getElementById('roleTabs');
  el.innerHTML = '';
  ROLES.forEach((role, i) => {
    const btn = document.createElement('button');
    btn.className = 'role-tab' + (i === state.currentStep ? ' active' : '');
    btn.innerHTML = '<span class="role-tab-icon">' + role.icon + '</span>' + role.title;
    btn.onclick = function() {
      state.currentStep = i;
      renderStep(i);
      buildStepper();
      buildRoleTabs();
    };
    el.appendChild(btn);
  });
}

function renderStep(stepIdx) {
  const role = ROLES[stepIdx];
  document.getElementById('instructionText').innerHTML =
    '<strong>' + role.icon + ' ' + role.title + ':</strong> ' + role.description;

  const grid     = document.getElementById('candidatesGrid');
  grid.innerHTML = '';
  const selected = state.selections[role.id];

  CANDIDATES[role.id].forEach(function(c) {
    const card = document.createElement('div');
    card.className = 'candidate-card' + (selected === c.id ? ' selected' : '');
    card.innerHTML =
      '<div class="candidate-check"><span class="check-icon">✓</span></div>' +
      '<div class="candidate-photo" style="background:' + c.color + '">' + c.initials + '</div>' +
      '<div class="candidate-name">' + c.name + '</div>' +
      '<div class="candidate-grade">' + c.grade + '</div>' +
      '<div class="candidate-tags">' + c.tags.map(function(t){ return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' +
      '<div class="candidate-motto">' + c.motto + '</div>';

    card.onclick = function() {
      state.selections[role.id] = c.id;
      renderStep(stepIdx);
      updateNav();
      buildStepper();
    };
    grid.appendChild(card);
  });

  updateNav();
}

function updateNav() {
  const role    = ROLES[state.currentStep];
  const hasSel  = !!state.selections[role.id];
  const btnNext = document.getElementById('btnNext');
  const btnBack = document.getElementById('btnBack');
  const ind     = document.getElementById('selIndicator');

  btnNext.disabled = !hasSel;
  btnBack.style.visibility = state.currentStep === 0 ? 'hidden' : 'visible';

  if (!hasSel) {
    ind.innerHTML = 'เลือกผู้สมัครเพื่อดำเนินการต่อ';
  } else {
    const c = CANDIDATES[role.id].find(function(x){ return x.id === state.selections[role.id]; });
    ind.innerHTML = 'เลือก: <strong>' + c.name + '</strong>';
  }

  btnNext.textContent = (state.currentStep === ROLES.length - 1 && hasSel) ? 'ตรวจสอบบัตร →' : 'ถัดไป →';
}

// ─────────────────────────────────────────────
//  9) Review View
// ─────────────────────────────────────────────
function buildReviewView() {
  const rows = document.getElementById('reviewRows');
  rows.innerHTML = '';

  ROLES.forEach(function(role, i) {
    const selId = state.selections[role.id];
    const cand  = CANDIDATES[role.id].find(function(c){ return c.id === selId; });
    if (!cand) return;

    const row = document.createElement('div');
    row.className = 'review-row';
    row.innerHTML =
      '<div class="review-role">' + role.icon + ' ' + role.title + '</div>' +
      '<div class="review-candidate">' +
        '<div class="review-avatar" style="background:' + cand.color + '">' + cand.initials + '</div>' +
        '<div><div class="review-name">' + cand.name + '</div><div class="review-grade">' + cand.grade + '</div></div>' +
      '</div>' +
      '<button class="review-edit" data-step="' + i + '">แก้ไข</button>';
    rows.appendChild(row);
  });

  rows.querySelectorAll('.review-edit').forEach(function(btn) {
    btn.onclick = function() {
      state.currentStep = parseInt(btn.dataset.step);
      buildStepper();
      buildRoleTabs();
      renderStep(state.currentStep);
      showView('view-voting');
    };
  });

  document.getElementById('pledgeCheck').checked = false;
  document.getElementById('btnSubmit').disabled  = true;
}

// ─────────────────────────────────────────────
//  10) Submit → Firestore
// ─────────────────────────────────────────────
async function handleSubmit() {
  const btn   = document.getElementById('btnSubmit');
  const label = document.getElementById('submitLabel');
  btn.disabled = true;
  label.innerHTML = '<span class="spinner"></span> กำลังบันทึกลง Firestore…';

  const refNumber = genRefNumber();

  try {
    await submitVoteToFirebase(refNumber, Object.assign({}, state.selections));

    state.voted     = true;
    state.refNumber = refNumber;
    buildConfirmView(refNumber);
    showView('view-confirm');
    showToast('✅ ลงคะแนนและบันทึกลง Firestore เรียบร้อย!', 'success');

  } catch (err) {
    console.error('Submit error:', err);
    btn.disabled    = false;
    label.innerHTML = '🗳️ ส่งบัตรเลือกตั้งอย่างเป็นทางการ';

    let msg = '❌ บันทึกไม่สำเร็จ: ' + (err.code || err.message);
    if (err.code === 'permission-denied') {
      msg = '❌ Firestore Rules ปฏิเสธ — ตรวจสอบ Security Rules ใน Firebase Console';
    }
    showToast(msg, 'error');
  }
}

// ─────────────────────────────────────────────
//  11) Confirm View
// ─────────────────────────────────────────────
function buildConfirmView(refNumber) {
  document.getElementById('refNumber').textContent = refNumber || state.refNumber;

  const summary = document.getElementById('confirmSummary');
  summary.innerHTML = '';
  ROLES.forEach(function(role) {
    const selId = state.selections[role.id];
    const cand  = CANDIDATES[role.id].find(function(c){ return c.id === selId; });
    if (!cand) return;
    const row = document.createElement('div');
    row.className = 'cs-row';
    row.innerHTML = '<span class="cs-role">' + role.icon + ' ' + role.title + '</span>' +
                    '<span class="cs-name">' + cand.name + '</span>';
    summary.appendChild(row);
  });
}

// ─────────────────────────────────────────────
//  12) Event Listeners
// ─────────────────────────────────────────────
document.getElementById('btnLogin').addEventListener('click', handleLogin);

document.getElementById('inputPin').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') handleLogin();
});
document.getElementById('inputStudentId').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') document.getElementById('inputPin').focus();
});

document.getElementById('btnNext').addEventListener('click', function() {
  if (state.currentStep < ROLES.length - 1) {
    state.currentStep++;
    buildStepper(); buildRoleTabs(); renderStep(state.currentStep);
  } else {
    buildReviewView(); showView('view-review');
  }
});

document.getElementById('btnBack').addEventListener('click', function() {
  if (state.currentStep > 0) {
    state.currentStep--;
    buildStepper(); buildRoleTabs(); renderStep(state.currentStep);
  }
});

document.getElementById('pledgeCheck').addEventListener('change', function() {
  document.getElementById('btnSubmit').disabled = !this.checked;
});

document.getElementById('btnBackToVoting').addEventListener('click', function() {
  showView('view-voting'); renderStep(state.currentStep);
});

document.getElementById('btnSubmit').addEventListener('click', handleSubmit);

document.getElementById('btnLogout').addEventListener('click', function() {
  state = { loggedIn:false, studentId:'', voterName:'', currentStep:0, selections:{}, voted:false, refNumber:'' };
  document.getElementById('voterChip').style.display  = 'none';
  document.getElementById('inputStudentId').value     = '';
  document.getElementById('inputPin').value           = '';
  document.getElementById('btnLogin').disabled        = false;
  document.getElementById('btnLogin').textContent     = 'เข้าสู่บัตรเลือกตั้ง →';
  document.getElementById('btnSubmit').disabled       = true;
  document.getElementById('submitLabel').innerHTML    = '🗳️ ส่งบัตรเลือกตั้งอย่างเป็นทางการ';
  showView('view-login');
  showToast('ออกจากระบบเรียบร้อยแล้ว', '');
});
