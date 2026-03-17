// =============================================================
//  การเลือกตั้งสภานักเรียน 2568 — app.js  (v3 — Robust)
//  Firebase v9 Compat SDK via CDN
// =============================================================

(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  //  FIREBASE INIT
  // ─────────────────────────────────────────────────────────
  const firebaseConfig = {
    apiKey:            "AIzaSyB4k3-LHtyC6nikVKnDQWPHxy5Z-5t3POo",
    authDomain:        "v-student-4a4d6.firebaseapp.com",
    projectId:         "v-student-4a4d6",
    storageBucket:     "v-student-4a4d6.firebasestorage.app",
    messagingSenderId: "350774501594",
    appId:             "1:350774501594:web:0d4249981f805e563b05e3",
    measurementId:     "G-QNKHK7T7SF"
  };

  // guard ถ้า init ซ้ำ
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const db = firebase.firestore();

  // ─────────────────────────────────────────────────────────
  //  DATA
  // ─────────────────────────────────────────────────────────
  const ROLES = [
    { id:'president',      title:'ประธาน',     icon:'👑', description:'เลือกผู้สมัครที่คุณต้องการให้เป็นประธานสภานักเรียน' },
    { id:'vice_president', title:'รองประธาน',  icon:'🤝', description:'เลือกผู้สมัครที่คุณต้องการให้เป็นรองประธานสภานักเรียน' },
    { id:'secretary',      title:'เลขานุการ',  icon:'📝', description:'เลือกผู้สมัครที่คุณต้องการให้เป็นเลขานุการสภานักเรียน' },
    { id:'treasurer',      title:'เหรัญญิก',   icon:'💰', description:'เลือกผู้สมัครที่คุณต้องการให้เป็นเหรัญญิกสภานักเรียน' },
  ];

  const CANDIDATES = {
    president: [
      { id:'p1', name:'นายปิยะ วงศ์สวัสดิ์',    grade:'ม.5', tags:['ความเป็นผู้นำ','ชุมชน','กีฬา'],       motto:'"ร่วมกันเราก้าวไกล — ทุกเสียงสมควรได้รับการฟัง"',        color:'linear-gradient(135deg,#1d4ed8,#3b82f6)', initials:'ป.ว' },
      { id:'p2', name:'นางสาวกานต์ ศรีสุข',      grade:'ม.6', tags:['นวัตกรรม','เทคโนโลยี','ศิลปะ'],     motto:'"นวัตกรรม ความร่วมมือ และเฉลิมฉลองความแตกต่าง"',         color:'linear-gradient(135deg,#7c3aed,#a78bfa)', initials:'ก.ศ' },
      { id:'p3', name:'นายธนพล มีสุข',           grade:'ม.5', tags:['ความเท่าเทียม','STEM','โต้วาที'],    motto:'"โรงเรียนที่นักเรียนทุกคนเจริญเติบโตโดยไม่มีข้อยกเว้น"',  color:'linear-gradient(135deg,#0f766e,#2dd4bf)', initials:'ธ.ม' },
      { id:'p4', name:'นางสาวพิมพ์ชนก ดีใจ',    grade:'ม.6', tags:['สุขภาวะ','กิจกรรม','ดนตรี'],       motto:'"นักเรียนมีความสุข โรงเรียนก็มีความสุข — มาสร้างด้วยกัน"', color:'linear-gradient(135deg,#d97706,#fbbf24)', initials:'พ.ด' },
    ],
    vice_president: [
      { id:'v1', name:'นางสาวสุดา รักษ์โลก',    grade:'ม.5', tags:['สิ่งแวดล้อม','ชมรม'],               motto:'"ความยั่งยืนเริ่มต้นในห้องเรียนและทางเดินของเรา"',          color:'linear-gradient(135deg,#059669,#34d399)', initials:'ส.ร' },
      { id:'v2', name:'นายอิทธิพล บุญมา',        grade:'ม.4', tags:['ระดมทุน','จิตวิญญาณ'],             motto:'"นำพลังงาน เงินทุน และจิตวิญญาณโรงเรียนทุกวัน"',           color:'linear-gradient(135deg,#dc2626,#f87171)', initials:'อ.บ' },
      { id:'v3', name:'นางสาวอมรา ชื่นชม',       grade:'ม.5', tags:['ความหลากหลาย','สื่อ','ละคร'],      motto:'"เป็นตัวแทนทุกวัฒนธรรมที่ทำให้โรงเรียนเราสวยงาม"',          color:'linear-gradient(135deg,#9333ea,#c084fc)', initials:'อ.ช' },
    ],
    secretary: [
      { id:'s1', name:'นายวีระ จัดการดี',        grade:'ม.4', tags:['การจัดการ','บันทึก','เว็บไซต์'],    motto:'"ความแม่นยำ ความชัดเจน และความโปร่งใสในทุกสิ่ง"',          color:'linear-gradient(135deg,#1d4ed8,#60a5fa)', initials:'ว.จ' },
      { id:'s2', name:'นางสาวซาร่า อาหมัด',      grade:'ม.5', tags:['การสื่อสาร','จดหมายข่าว'],          motto:'"ทำให้สภาและโรงเรียนของเราได้รับข้อมูลอย่างครบถ้วน"',       color:'linear-gradient(135deg,#be185d,#f472b6)', initials:'ซ.อ' },
      { id:'s3', name:'นายฟินน์ แอนเดอร์สัน',   grade:'ม.4', tags:['รายงานการประชุม','เทค','ดีไซน์'],  motto:'"บันทึกดิจิทัล ความโปร่งใสจริง — ทุกการประชุม ทุกการโหวต"', color:'linear-gradient(135deg,#0369a1,#38bdf8)', initials:'ฟ.แ' },
    ],
    treasurer: [
      { id:'t1', name:'นางสาวอิสเบล โมโร',      grade:'ม.6', tags:['การเงิน','งบประมาณ','Excel'],       motto:'"ทุกบาทที่บริหารจัดการดีคือโครงการที่เป็นจริง"',            color:'linear-gradient(135deg,#f59e0b,#fcd34d)', initials:'อ.โ' },
      { id:'t2', name:'นายมาร์คัส เวบ',          grade:'ม.5', tags:['ตรวจสอบ','ระดมทุน'],               motto:'"รับผิดชอบ โปร่งใส และนักเรียนเป็นอันดับแรกเสมอ"',           color:'linear-gradient(135deg,#0f172a,#475569)', initials:'ม.ว' },
      { id:'t3', name:'นางสาวนาเดีย โควาลสกี้',  grade:'ม.6', tags:['ทุน','กิจกรรม','วางแผน'],          motto:'"ปลดล็อกทรัพยากรที่ทำให้ไอเดียดีๆ เป็นจริง"',              color:'linear-gradient(135deg,#7c3aed,#ddd6fe)', initials:'น.โ' },
    ],
  };

  // ─────────────────────────────────────────────────────────
  //  STATE
  // ─────────────────────────────────────────────────────────
  var state = {
    loggedIn: false, studentId: '', voterName: '',
    currentStep: 0,  selections: {}, voted: false, refNumber: ''
  };

  // ─────────────────────────────────────────────────────────
  //  UTILITIES
  // ─────────────────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }

  function showView(id) {
    document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
    $(id).classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showToast(msg, type) {
    var tc = $('toastContainer');
    var t  = document.createElement('div');
    t.className   = 'toast ' + (type || '');
    t.textContent = msg;
    tc.appendChild(t);
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 4000);
  }

  function setStatus(msg, cls) {
    var el = $('firebaseStatus');
    if (!el) return;
    el.textContent = msg;
    el.className   = cls || '';
  }

  function genRef() {
    return 'WB-' + Date.now().toString(36).toUpperCase().slice(-6) + '-' +
           Math.random().toString(36).toUpperCase().slice(2, 6);
  }

  function resetLoginBtn() {
    var btn = $('btnLogin');
    btn.disabled    = false;
    btn.textContent = 'เข้าสู่บัตรเลือกตั้ง →';
  }

  function showLoginError(field, msg) {
    var errEl  = $(field === 'sid' ? 'errStudentId' : 'errPin');
    var inpEl  = $(field === 'sid' ? 'inputStudentId' : 'inputPin');
    errEl.textContent = msg;
    errEl.classList.add('show');
    inpEl.classList.add('error');
  }

  function clearLoginErrors() {
    document.querySelectorAll('.error-msg').forEach(function(e) { e.classList.remove('show'); });
    document.querySelectorAll('#view-login input').forEach(function(i) { i.classList.remove('error'); });
  }

  // ─────────────────────────────────────────────────────────
  //  FIREBASE: CONNECTION CHECK
  // ─────────────────────────────────────────────────────────
  function checkFirestoreConnection() {
    setStatus('⏳ กำลังเชื่อมต่อ Firestore…', '');
    db.collection('students').limit(1).get()
      .then(function() {
        setStatus('✅ Firestore เชื่อมต่อสำเร็จ', 'ok-status');
      })
      .catch(function(err) {
        if (err.code === 'permission-denied') {
          setStatus('⚠️ Security Rules ปิดอยู่ — ดู README.md', 'warn-status');
        } else {
          setStatus('❌ Firestore: ' + err.code, 'err-status');
        }
        console.warn('[Firebase] Connection check:', err.code, err.message);
      });
  }

  // ─────────────────────────────────────────────────────────
  //  FIREBASE: LOGIN — อ่าน students/{studentId}
  //  Document structure: { name, pin, hasVoted, refNumber }
  // ─────────────────────────────────────────────────────────
  async function handleLogin() {
    var sid = $('inputStudentId').value.trim().toUpperCase();
    var pin = $('inputPin').value.trim();

    clearLoginErrors();

    if (!sid) {
      showLoginError('sid', 'กรุณากรอกรหัสนักเรียน');
      return;
    }
    if (!pin || pin.length < 4) {
      showLoginError('pin', 'กรุณากรอก PIN อย่างน้อย 4 หลัก');
      return;
    }

    var btn = $('btnLogin');
    btn.disabled   = true;
    btn.innerHTML  = '<span class="spinner"></span> กำลังตรวจสอบ…';

    try {
      // ── อ่าน document จาก Firestore ──
      var docRef = db.collection('students').doc(sid);
      var snap   = await docRef.get();

      // ── Document ไม่มีอยู่ ──
      if (!snap.exists) {
        resetLoginBtn();
        showLoginError('sid',
          '❌ ไม่พบรหัส "' + sid + '" ใน Firestore\n' +
          '→ ตรวจสอบว่า Document ID ใน collection students ตรงกับรหัสที่กรอก'
        );
        showToast('ไม่พบรหัสนักเรียน "' + sid + '" ใน Firestore', 'error');
        return;
      }

      var data = snap.data();
      console.log('[Firestore] student data:', data);

      // ── PIN ผิด ──
      if (String(data.pin).trim() !== String(pin).trim()) {
        resetLoginBtn();
        showLoginError('pin', '❌ รหัส PIN ไม่ถูกต้อง');
        showToast('รหัส PIN ไม่ถูกต้อง', 'error');
        return;
      }

      // ── โหวตไปแล้ว ──
      if (data.hasVoted === true) {
        resetLoginBtn();
        showLoginError('pin',
          '⚠️ ' + (data.name || sid) + ' ลงคะแนนไปแล้ว\n' +
          'เลขอ้างอิง: ' + (data.refNumber || 'ไม่มีข้อมูล')
        );
        showToast('⚠️ บัญชีนี้ลงคะแนนไปแล้ว', 'warning');
        return;
      }

      // ── SUCCESS ──
      state.studentId   = sid;
      state.voterName   = data.name || sid;
      state.loggedIn    = true;
      state.selections  = {};
      state.currentStep = 0;
      state.voted       = false;

      var nameParts = state.voterName.replace(/นาย|นางสาว|นาง/g, '').trim().split(' ');
      var initials  = nameParts.map(function(w) { return w[0] || ''; }).join('').substring(0, 2);

      $('voterInitials').textContent    = initials;
      $('voterName').textContent        = state.voterName;
      $('voterChip').style.display      = 'flex';
      $('pledgeVoterName').textContent  = state.voterName;

      buildVotingView();
      showView('view-voting');
      showToast('ยินดีต้อนรับ ' + state.voterName + '! 🎉', 'success');

    } catch (err) {
      resetLoginBtn();
      console.error('[Firestore] login error:', err);

      var userMsg = '';
      switch (err.code) {
        case 'permission-denied':
          userMsg = '❌ Firestore Rules ปฏิเสธ — ไปแก้ Rules ใน Firebase Console ก่อน (ดู README.md)';
          break;
        case 'unavailable':
        case 'deadline-exceeded':
          userMsg = '❌ ไม่มีการเชื่อมต่ออินเทอร์เน็ต หรือ Firestore offline';
          break;
        case 'not-found':
          userMsg = '❌ ไม่พบ Firestore project — ตรวจสอบ projectId';
          break;
        default:
          userMsg = '❌ Error [' + (err.code || 'unknown') + ']: ' + err.message;
      }

      showLoginError('pin', userMsg);
      showToast(userMsg, 'error');
    }
  }

  // ─────────────────────────────────────────────────────────
  //  FIREBASE: SUBMIT — เขียน votes + อัปเดต students
  // ─────────────────────────────────────────────────────────
  async function handleSubmit() {
    var btn   = $('btnSubmit');
    var label = $('submitLabel');
    btn.disabled  = true;
    label.innerHTML = '<span class="spinner"></span> กำลังบันทึกลง Firestore…';

    var refNumber = genRef();

    try {
      var batch = db.batch();

      // 1) สร้าง document ใหม่ใน votes/
      batch.set(db.collection('votes').doc(refNumber), {
        studentId:   state.studentId,
        voterName:   state.voterName,
        selections:  Object.assign({}, state.selections),
        refNumber:   refNumber,
        submittedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // 2) อัปเดต students/{id} → hasVoted = true
      batch.update(db.collection('students').doc(state.studentId), {
        hasVoted:  true,
        refNumber: refNumber,
        votedAt:   firebase.firestore.FieldValue.serverTimestamp()
      });

      await batch.commit();

      state.voted     = true;
      state.refNumber = refNumber;
      buildConfirmView(refNumber);
      showView('view-confirm');
      showToast('✅ บันทึกลง Firestore เรียบร้อยแล้ว!', 'success');

    } catch (err) {
      console.error('[Firestore] submit error:', err);
      btn.disabled    = false;
      label.innerHTML = '🗳️ ส่งบัตรเลือกตั้งอย่างเป็นทางการ';

      var msg = '';
      if (err.code === 'permission-denied') {
        msg = '❌ Firestore Rules ปฏิเสธการเขียน — ตรวจสอบ Rules ใน Firebase Console';
      } else {
        msg = '❌ บันทึกไม่สำเร็จ [' + (err.code || 'unknown') + ']: ' + err.message;
      }
      showToast(msg, 'error');
    }
  }

  // ─────────────────────────────────────────────────────────
  //  UI — Voting View
  // ─────────────────────────────────────────────────────────
  function buildVotingView() {
    buildStepper();
    buildRoleTabs();
    renderStep(state.currentStep);
  }

  function buildStepper() {
    var el = $('stepper');
    el.innerHTML = '';
    ROLES.forEach(function(role, i) {
      if (i > 0) {
        var line = document.createElement('div');
        line.className = 'step-line' + (i <= state.currentStep ? ' done' : '');
        el.appendChild(line);
      }
      var isDone   = (i < state.currentStep) || !!state.selections[role.id];
      var isActive = (i === state.currentStep);
      var step = document.createElement('div');
      step.className = 'step' + (isActive ? ' active' : '') + (isDone && !isActive ? ' done' : '');
      step.innerHTML =
        '<div class="step-dot">' + (isDone && !isActive ? '✓' : (i + 1)) + '</div>' +
        '<div class="step-label">' + role.title + '</div>';
      el.appendChild(step);
    });
  }

  function buildRoleTabs() {
    var el = $('roleTabs');
    el.innerHTML = '';
    ROLES.forEach(function(role, i) {
      var btn = document.createElement('button');
      btn.className = 'role-tab' + (i === state.currentStep ? ' active' : '');
      btn.innerHTML = '<span class="role-tab-icon">' + role.icon + '</span>' + role.title;
      btn.onclick   = function() { state.currentStep = i; renderStep(i); buildStepper(); buildRoleTabs(); };
      el.appendChild(btn);
    });
  }

  function renderStep(idx) {
    var role = ROLES[idx];
    $('instructionText').innerHTML = '<strong>' + role.icon + ' ' + role.title + ':</strong> ' + role.description;

    var grid     = $('candidatesGrid');
    grid.innerHTML = '';
    var selected = state.selections[role.id];

    CANDIDATES[role.id].forEach(function(c) {
      var card = document.createElement('div');
      card.className = 'candidate-card' + (selected === c.id ? ' selected' : '');
      card.innerHTML =
        '<div class="candidate-check"><span class="check-icon">✓</span></div>' +
        '<div class="candidate-photo" style="background:' + c.color + '">' + c.initials + '</div>' +
        '<div class="candidate-name">' + c.name + '</div>' +
        '<div class="candidate-grade">' + c.grade + '</div>' +
        '<div class="candidate-tags">' + c.tags.map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' +
        '<div class="candidate-motto">' + c.motto + '</div>';
      card.onclick = function() {
        state.selections[role.id] = c.id;
        renderStep(idx);
        updateNav();
        buildStepper();
      };
      grid.appendChild(card);
    });
    updateNav();
  }

  function updateNav() {
    var role    = ROLES[state.currentStep];
    var hasSel  = !!state.selections[role.id];
    var btnNext = $('btnNext');
    var btnBack = $('btnBack');
    var ind     = $('selIndicator');

    btnNext.disabled = !hasSel;
    btnBack.style.visibility = state.currentStep === 0 ? 'hidden' : 'visible';
    ind.innerHTML = hasSel
      ? 'เลือก: <strong>' + CANDIDATES[role.id].find(function(x) { return x.id === state.selections[role.id]; }).name + '</strong>'
      : 'เลือกผู้สมัครเพื่อดำเนินการต่อ';
    btnNext.textContent = (state.currentStep === ROLES.length - 1 && hasSel) ? 'ตรวจสอบบัตร →' : 'ถัดไป →';
  }

  // ─────────────────────────────────────────────────────────
  //  UI — Review View
  // ─────────────────────────────────────────────────────────
  function buildReviewView() {
    var rows = $('reviewRows');
    rows.innerHTML = '';

    ROLES.forEach(function(role, i) {
      var selId = state.selections[role.id];
      var cand  = CANDIDATES[role.id].find(function(c) { return c.id === selId; });
      if (!cand) return;

      var row = document.createElement('div');
      row.className = 'review-row';
      row.innerHTML =
        '<div class="review-role">' + role.icon + ' ' + role.title + '</div>' +
        '<div class="review-candidate">' +
          '<div class="review-avatar" style="background:' + cand.color + '">' + cand.initials + '</div>' +
          '<div><div class="review-name">' + cand.name + '</div>' +
          '<div class="review-grade">' + cand.grade + '</div></div>' +
        '</div>' +
        '<button class="review-edit" data-step="' + i + '">แก้ไข</button>';
      rows.appendChild(row);
    });

    rows.querySelectorAll('.review-edit').forEach(function(btn) {
      btn.onclick = function() {
        state.currentStep = parseInt(btn.dataset.step, 10);
        buildStepper(); buildRoleTabs(); renderStep(state.currentStep);
        showView('view-voting');
      };
    });

    $('pledgeCheck').checked = false;
    $('btnSubmit').disabled  = true;
  }

  // ─────────────────────────────────────────────────────────
  //  UI — Confirm View
  // ─────────────────────────────────────────────────────────
  function buildConfirmView(ref) {
    $('refNumber').textContent = ref || state.refNumber;
    var summary = $('confirmSummary');
    summary.innerHTML = '';
    ROLES.forEach(function(role) {
      var cand = CANDIDATES[role.id].find(function(c) { return c.id === state.selections[role.id]; });
      if (!cand) return;
      var row = document.createElement('div');
      row.className = 'cs-row';
      row.innerHTML = '<span class="cs-role">' + role.icon + ' ' + role.title + '</span>' +
                      '<span class="cs-name">' + cand.name + '</span>';
      summary.appendChild(row);
    });
  }

  // ─────────────────────────────────────────────────────────
  //  EVENT LISTENERS
  // ─────────────────────────────────────────────────────────
  $('btnLogin').addEventListener('click', handleLogin);
  $('inputPin').addEventListener('keydown', function(e) { if (e.key === 'Enter') handleLogin(); });
  $('inputStudentId').addEventListener('keydown', function(e) { if (e.key === 'Enter') $('inputPin').focus(); });

  $('btnNext').addEventListener('click', function() {
    if (state.currentStep < ROLES.length - 1) {
      state.currentStep++; buildStepper(); buildRoleTabs(); renderStep(state.currentStep);
    } else {
      buildReviewView(); showView('view-review');
    }
  });

  $('btnBack').addEventListener('click', function() {
    if (state.currentStep > 0) {
      state.currentStep--; buildStepper(); buildRoleTabs(); renderStep(state.currentStep);
    }
  });

  $('pledgeCheck').addEventListener('change', function() { $('btnSubmit').disabled = !this.checked; });
  $('btnBackToVoting').addEventListener('click', function() { showView('view-voting'); renderStep(state.currentStep); });
  $('btnSubmit').addEventListener('click', handleSubmit);

  $('btnLogout').addEventListener('click', function() {
    state = { loggedIn:false, studentId:'', voterName:'', currentStep:0, selections:{}, voted:false, refNumber:'' };
    $('voterChip').style.display = 'none';
    $('inputStudentId').value    = '';
    $('inputPin').value          = '';
    $('btnSubmit').disabled      = true;
    $('submitLabel').innerHTML   = '🗳️ ส่งบัตรเลือกตั้งอย่างเป็นทางการ';
    resetLoginBtn();
    showView('view-login');
    showToast('ออกจากระบบเรียบร้อยแล้ว', '');
  });

  // ─────────────────────────────────────────────────────────
  //  INIT
  // ─────────────────────────────────────────────────────────
  window.addEventListener('load', function() {
    setTimeout(function() {
      var ov = $('loadingOverlay');
      if (ov) ov.classList.add('hidden');
    }, 700);
    checkFirestoreConnection();
  });

})();
