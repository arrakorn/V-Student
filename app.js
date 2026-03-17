// =========================================================
// ระบบเลือกตั้งสภานักเรียน — app.js
// เชื่อมต่อกับ Firebase Firestore
//
// โครงสร้างใน Firestore:
//   collection: "votes"
//     document: partyId  (เช่น "party-a")
//       field: count (number) — จำนวนคะแนนสะสม
//
//   collection: "voters"
//     document: studentId  (เช่น "12345")
//       field: partyId (string) — พรรคที่โหวต
//       field: votedAt (timestamp) — เวลาที่โหวต
// =========================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  onSnapshot,
  collection,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

/* ---------------------------------------------------------
   Firebase Configuration
--------------------------------------------------------- */
const firebaseConfig = {
  apiKey:            "AIzaSyB4k3-LHtyC6nikVKnDQWPHxy5Z-5t3POo",
  authDomain:        "v-student-4a4d6.firebaseapp.com",
  projectId:         "v-student-4a4d6",
  storageBucket:     "v-student-4a4d6.firebasestorage.app",
  messagingSenderId: "350774501594",
  appId:             "1:350774501594:web:9330b3b3e36f64c13b05e3",
  measurementId:     "G-4GLGPWDTPP"
};

// เริ่มต้น Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db          = getFirestore(firebaseApp);

/* ---------------------------------------------------------
   ข้อมูลพรรคและผู้สมัคร
--------------------------------------------------------- */
const CANDIDATES = [
  {
    id:        "party-a",
    partyName: "พรรคเอกภาพ",
    candidate: "นายอลงกรณ์ ริเวร่า",
    emoji:     "🌟",
    tag:       "เอกภาพ · ก้าวหน้า",
    slogan:    "สร้างโรงเรียนที่ <em>ทุกเสียงได้รับการรับฟัง</em> มุ่งเน้นสุขภาพจิต ชมรมที่ครอบคลุม และการบริหารที่โปร่งใส",
  },
  {
    id:        "party-b",
    partyName: "พรรคนวัตกรรม",
    candidate: "น.ส.จอร์แดน ลี",
    emoji:     "🚀",
    tag:       "เทคโนโลยี · นวัตกรรม",
    slogan:    "ปรับชีวิตในวิทยาเขตให้ทันสมัยด้วย <em>เครื่องมือดิจิทัล</em> พอร์ทัลนักเรียนใหม่ และพื้นที่ Maker Space",
  },
  {
    id:        "party-c",
    partyName: "พรรคพื้นฐานร่วม",
    candidate: "น.ส.ปริยา แนร์",
    emoji:     "🌿",
    tag:       "สิ่งแวดล้อม · ใส่ใจ",
    slogan:    "วิทยาเขตสีเขียวและเป็นมิตร ส่งเสริม <em>โครงการรักษ์โลก</em> อาหารราคาประหยัด และระบบพี่เลี้ยงนักเรียน",
  },
  {
    id:        "party-d",
    partyName: "พรรคอนาคตกล้า",
    candidate: "นายมาร์คัส เฉิน",
    emoji:     "⚡",
    tag:       "ลงมือทำ · ผลลัพธ์",
    slogan:    "พูดน้อย ทำมาก แผนรูปธรรมเพื่อ <em>สิ่งอำนวยความสะดวกที่ดีขึ้น</em> คิวอาหารที่สั้นลง และกิจการนักเรียน",
  },
  {
    id:        "party-e",
    partyName: "พรรคเสียงและความกล้า",
    candidate: "น.ส.โซเฟีย โอคอนวอ",
    emoji:     "🎙️",
    tag:       "วัฒนธรรม · ศิลปะ",
    slogan:    "ฉลองความหลากหลายผ่าน <em>ศิลปะ วัฒนธรรม และกีฬา</em> กิจกรรมมากขึ้น งบชมรมเพิ่มขึ้น เสียงนักเรียนดังขึ้น",
  },
];

/* ---------------------------------------------------------
   STATE
--------------------------------------------------------- */
let currentStudentId  = null; // รหัสนักเรียนที่ล็อกอินอยู่
let pendingPartyId    = null; // พรรคที่รอยืนยันการโหวต
let voteCounts        = {};   // แคชคะแนนโหวต { partyId: count }
let unsubscribeVotes  = null; // ฟังก์ชันยกเลิก real-time listener

/* ---------------------------------------------------------
   DOM REFERENCES
--------------------------------------------------------- */
const loadingOverlay   = document.getElementById("loading-overlay");
const firebaseStatus   = document.getElementById("firebase-status");
const firebaseStatusTx = document.getElementById("firebase-status-text");

const views = {
  login:     document.getElementById("view-login"),
  dashboard: document.getElementById("view-dashboard"),
  success:   document.getElementById("view-success"),
};

const studentIdInput   = document.getElementById("student-id");
const idError          = document.getElementById("id-error");
const btnLogin         = document.getElementById("btn-login");
const btnLoginText     = document.getElementById("btn-login-text");
const btnLoginSpinner  = document.getElementById("btn-login-spinner");
const dashboardAvatar  = document.getElementById("dashboard-avatar");
const dashboardSID     = document.getElementById("dashboard-student-id");
const candidateGrid    = document.getElementById("candidate-grid");

const modal            = document.getElementById("modal");
const modalPartyName   = document.getElementById("modal-party-name");
const btnConfirmVote   = document.getElementById("btn-confirm-vote");
const btnConfirmText   = document.getElementById("btn-confirm-text");
const btnConfirmSpinner= document.getElementById("btn-confirm-spinner");
const btnCancelVote    = document.getElementById("btn-cancel-vote");

const successPartyName = document.getElementById("success-party-name");
const btnLogout        = document.getElementById("btn-logout");

const toast            = document.getElementById("toast");
const toastMsg         = document.getElementById("toast-msg");
const toastIcon        = document.getElementById("toast-icon");

/* ---------------------------------------------------------
   UTILITY: ซ่อน Loading Overlay
--------------------------------------------------------- */
function hideLoading() {
  loadingOverlay.classList.add("hidden");
  setTimeout(() => { loadingOverlay.style.display = "none"; }, 500);
}

/* ---------------------------------------------------------
   UTILITY: อัปเดต Firebase Status Badge
--------------------------------------------------------- */
function setFirebaseStatus(state) {
  // state: "connecting" | "connected" | "error"
  firebaseStatus.className = "firebase-status " + state;
  const labels = {
    connecting: "กำลังเชื่อมต่อ Firebase...",
    connected:  "เชื่อมต่อ Firebase แล้ว",
    error:      "ไม่สามารถเชื่อมต่อ Firebase ได้"
  };
  firebaseStatusTx.textContent = labels[state] || "";
}

/* ---------------------------------------------------------
   UTILITY: สลับหน้า
--------------------------------------------------------- */
function showView(name) {
  Object.values(views).forEach(v => v.classList.remove("active"));
  views[name].classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------------------------------------------------
   UTILITY: Toast แจ้งเตือน
--------------------------------------------------------- */
let toastTimer = null;
function showToast(message, type = "error") {
  toastMsg.textContent = message;
  toastIcon.textContent = type === "error" ? "⚠️" : "✓";
  toast.className = "toast show " + (type === "error" ? "error" : "success-toast");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

/* ---------------------------------------------------------
   UTILITY: เปิด/ปิด loading state บนปุ่ม
--------------------------------------------------------- */
function setBtnLoading(textEl, spinnerEl, btnEl, isLoading) {
  btnEl.disabled = isLoading;
  spinnerEl.style.display = isLoading ? "block" : "none";
  textEl.style.opacity = isLoading ? "0.5" : "1";
}

/* ---------------------------------------------------------
   FIREBASE: ตรวจสอบว่านักเรียนคนนี้โหวตแล้วหรือยัง
--------------------------------------------------------- */
async function hasVotedFirebase(studentId) {
  const ref  = doc(db, "voters", String(studentId));
  const snap = await getDoc(ref);
  return snap.exists();
}

/* ---------------------------------------------------------
   FIREBASE: บันทึกการโหวต (Atomic)
   - เพิ่ม 1 คะแนนให้พรรค (increment)
   - บันทึก voter record
--------------------------------------------------------- */
async function recordVoteFirebase(studentId, partyId) {
  const partyRef = doc(db, "votes", partyId);
  const voterRef = doc(db, "voters", String(studentId));

  // เพิ่มคะแนนพรรค (ถ้ายังไม่มี doc ให้สร้างใหม่)
  await setDoc(partyRef, { count: increment(1) }, { merge: true });

  // บันทึกว่านักเรียนคนนี้โหวตแล้ว
  await setDoc(voterRef, {
    partyId,
    votedAt: serverTimestamp()
  });

  console.log(`✅ บันทึกคะแนนสำเร็จ: นักเรียน ${studentId} → ${partyId}`);
}

/* ---------------------------------------------------------
   FIREBASE: Subscribe real-time vote counts
   อัปเดต vote bar ทุกครั้งที่มีการโหวตใหม่
--------------------------------------------------------- */
function subscribeVoteCounts() {
  const votesCol = collection(db, "votes");
  unsubscribeVotes = onSnapshot(votesCol, (snapshot) => {
    snapshot.forEach(docSnap => {
      voteCounts[docSnap.id] = docSnap.data().count || 0;
    });
    updateVoteBars();
    console.log("📊 คะแนน real-time:", voteCounts);
  });
}

/* ---------------------------------------------------------
   UI: อัปเดต Vote Bar บนการ์ดทุกใบ
--------------------------------------------------------- */
function updateVoteBars() {
  const total = Object.values(voteCounts).reduce((s, v) => s + v, 0);
  CANDIDATES.forEach(c => {
    const fillEl  = document.getElementById(`bar-fill-${c.id}`);
    const countEl = document.getElementById(`bar-count-${c.id}`);
    if (!fillEl || !countEl) return;
    const count   = voteCounts[c.id] || 0;
    const pct     = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    fillEl.style.width  = pct + "%";
    countEl.textContent = `${count} เสียง (${pct}%)`;
  });
}

/* ---------------------------------------------------------
   UI: สร้างการ์ดผู้สมัคร
--------------------------------------------------------- */
function buildCandidateGrid() {
  candidateGrid.innerHTML = "";
  CANDIDATES.forEach(c => {
    const card = document.createElement("div");
    card.className = `candidate-card ${c.id}`;
    card.innerHTML = `
      <div class="card-banner">
        <div class="candidate-avatar">${c.emoji}</div>
      </div>
      <div class="card-body">
        <span class="party-tag">${c.tag}</span>
        <h3 class="party-name">${c.partyName}</h3>
        <p class="candidate-name">ผู้สมัคร: ${c.candidate}</p>
        <p class="card-slogan">${c.slogan}</p>

        <!-- Vote bar แสดงคะแนน real-time -->
        <div class="vote-bar-wrap">
          <div class="vote-bar-label">
            <span>คะแนนสะสม</span>
            <span id="bar-count-${c.id}">0 เสียง (0%)</span>
          </div>
          <div class="vote-bar-track">
            <div class="vote-bar-fill" id="bar-fill-${c.id}"></div>
          </div>
        </div>

        <button class="btn-vote" data-party-id="${c.id}" data-party-name="${c.partyName}">
          <span>เลือก${c.partyName}</span>
        </button>
      </div>
    `;
    candidateGrid.appendChild(card);
  });

  // ผูก event กับปุ่มโหวต
  candidateGrid.querySelectorAll(".btn-vote").forEach(btn => {
    btn.addEventListener("click", handleVoteClick);
  });

  // อัปเดต bar ทันทีด้วยข้อมูลที่แคชไว้
  updateVoteBars();
}

/* ---------------------------------------------------------
   EVENT: เข้าสู่ระบบ
--------------------------------------------------------- */
btnLogin.addEventListener("click", async () => {
  const sid = studentIdInput.value.trim();

  // validation
  if (!sid) {
    showFieldError("กรุณากรอกรหัสนักเรียน");
    return;
  }
  if (!/^\d{5,12}$/.test(sid)) {
    showFieldError("รหัสนักเรียนต้องเป็นตัวเลขอย่างน้อย 5 หลัก");
    return;
  }
  clearFieldError();

  // loading state
  setBtnLoading(btnLoginText, btnLoginSpinner, btnLogin, true);

  try {
    // ตรวจสอบจาก Firestore ว่าโหวตแล้วหรือยัง
    const alreadyVoted = await hasVotedFirebase(sid);
    if (alreadyVoted) {
      showToast("รหัสนักเรียนนี้เคยลงคะแนนแล้ว", "error");
      setBtnLoading(btnLoginText, btnLoginSpinner, btnLogin, false);
      return;
    }

    // ผ่านการตรวจสอบ → ไปหน้า dashboard
    currentStudentId = sid;
    dashboardSID.textContent = sid;
    dashboardAvatar.textContent = sid.charAt(0);

    buildCandidateGrid();
    showView("dashboard");

  } catch (err) {
    console.error("Login error:", err);
    showToast("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", "error");
  } finally {
    setBtnLoading(btnLoginText, btnLoginSpinner, btnLogin, false);
  }
});

// กด Enter เพื่อ Login
studentIdInput.addEventListener("keydown", e => {
  if (e.key === "Enter") btnLogin.click();
});

/* ---------------------------------------------------------
   EVENT: คลิกปุ่มโหวต → เปิด Modal
--------------------------------------------------------- */
function handleVoteClick(e) {
  pendingPartyId = e.currentTarget.dataset.partyId;
  modalPartyName.textContent = e.currentTarget.dataset.partyName;
  modal.classList.add("open");
}

/* ---------------------------------------------------------
   EVENT: Modal — ยืนยันการโหวต
--------------------------------------------------------- */
btnConfirmVote.addEventListener("click", async () => {
  if (!pendingPartyId || !currentStudentId) return;

  const party = CANDIDATES.find(c => c.id === pendingPartyId);
  setBtnLoading(btnConfirmText, btnConfirmSpinner, btnConfirmVote, true);
  btnCancelVote.disabled = true;

  try {
    await recordVoteFirebase(currentStudentId, pendingPartyId);

    successPartyName.textContent = `คุณเลือก${party.partyName}`;
    modal.classList.remove("open");
    showView("success");
    resetCheckmark();
    showToast("บันทึกเสียงสำเร็จ!", "success");

  } catch (err) {
    console.error("Vote error:", err);
    // อาจเกิดจาก race condition (2 คนโหวตพร้อมกัน) ให้ตรวจซ้ำ
    try {
      const alreadyVoted = await hasVotedFirebase(currentStudentId);
      if (alreadyVoted) {
        showToast("รหัสนักเรียนนี้เคยลงคะแนนแล้ว", "error");
        modal.classList.remove("open");
        showView("login");
      } else {
        showToast("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", "error");
      }
    } catch {
      showToast("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", "error");
    }
  } finally {
    setBtnLoading(btnConfirmText, btnConfirmSpinner, btnConfirmVote, false);
    btnCancelVote.disabled = false;
  }
});

/* ---------------------------------------------------------
   EVENT: Modal — ยกเลิก
--------------------------------------------------------- */
btnCancelVote.addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
function closeModal() {
  modal.classList.remove("open");
  pendingPartyId = null;
}

/* ---------------------------------------------------------
   EVENT: ออกจากระบบ
--------------------------------------------------------- */
btnLogout.addEventListener("click", () => {
  currentStudentId = null;
  pendingPartyId   = null;
  studentIdInput.value = "";
  clearFieldError();
  showView("login");
});

/* ---------------------------------------------------------
   UTILITY: Field Error
--------------------------------------------------------- */
function showFieldError(msg) {
  idError.textContent = msg;
  idError.classList.add("show");
  studentIdInput.style.borderColor = "var(--red)";
}
function clearFieldError() {
  idError.classList.remove("show");
  studentIdInput.style.borderColor = "";
}

/* ---------------------------------------------------------
   UTILITY: Reset Checkmark Animation
--------------------------------------------------------- */
function resetCheckmark() {
  const ring  = document.querySelector(".checkmark-circle");
  const check = document.querySelector(".checkmark-check");
  [ring, check].forEach(el => {
    el.style.animation = "none";
    void el.offsetHeight;
    el.style.animation = "";
  });
}

/* ---------------------------------------------------------
   INIT: เริ่มต้นระบบ
--------------------------------------------------------- */
async function init() {
  setFirebaseStatus("connecting");
  try {
    // ทดสอบการเชื่อมต่อโดยดึงข้อมูลจาก Firestore
    await getDoc(doc(db, "votes", "party-a"));
    setFirebaseStatus("connected");

    // เริ่ม subscribe real-time vote counts
    subscribeVoteCounts();

    console.log("🔥 Firebase เชื่อมต่อสำเร็จ");
  } catch (err) {
    console.error("Firebase connection error:", err);
    setFirebaseStatus("error");
    showToast("ไม่สามารถเชื่อมต่อ Firebase ได้ ลองรีโหลดหน้า", "error");
  } finally {
    hideLoading();
  }
}

// เริ่มต้นแอป
init();

// ยกเลิก listener เมื่อปิดหน้า
window.addEventListener("beforeunload", () => {
  if (unsubscribeVotes) unsubscribeVotes();
});
