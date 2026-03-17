/* ============================================================
   app.js  ·  StudentVote — ระบบเลือกตั้งสภานักเรียน
   ภาษา: ไทย  |  Firebase Project: v-student-4a4d6
   ============================================================ */


/* ════════════════════════════════════════════════════════════
   ①  การตั้งค่า Firebase (เชื่อมต่อกับโปรเจกต์จริงแล้ว)
   ════════════════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyB4k3-LHtyC6nikVKnDQWPHxy5Z-5t3POo",
  authDomain: "v-student-4a4d6.firebaseapp.com",
  projectId: "v-student-4a4d6",
  storageBucket: "v-student-4a4d6.firebasestorage.app",
  messagingSenderId: "350774501594",
  appId: "1:350774501594:web:9330b3b3e36f64c13b05e3",
  measurementId: "G-4GLGPWDTPP"


/* ════════════════════════════════════════════════════════════
   ②  ข้อมูลผู้สมัคร — แก้ไขตรงนี้เพื่อเปลี่ยนรายชื่อผู้สมัคร
   ════════════════════════════════════════════════════════════
   แต่ละคนมีข้อมูล:
     id     : รหัสเฉพาะ (ตัวเล็ก ไม่มีเว้นวรรค) ใช้เป็น key ใน Firestore
     name   : ชื่อ-นามสกุล
     role   : ตำแหน่งที่สมัคร
     slogan : สโลแกน / นโยบายสั้น
     avatar : URL รูปภาพ (ใช้ placeholder ได้)
   ════════════════════════════════════════════════════════════ */
const CANDIDATES = [
  {
    id:     "somjai_k",
    name:   "สมใจ กล้าหาญ",
    role:   "ประธานสภานักเรียน",
    slogan: "\"พัฒนาโรงเรียนด้วยความโปร่งใส เพราะทุกเสียงของนักเรียนมีความหมาย\"",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=SomjaiK&backgroundColor=b6e3f4"
  },
  {
    id:     "naphat_s",
    name:   "ณภัทร สุขสบาย",
    role:   "ประธานสภานักเรียน",
    slogan: "\"สร้างพื้นที่ปลอดภัย เสริมสิทธิ์นักเรียน และทำให้โรงเรียนน่าอยู่มากขึ้น\"",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=NaphatS&backgroundColor=c0aede"
  },
  {
    id:     "pimchanok_t",
    name:   "พิมชนก ทองดี",
    role:   "รองประธานสภานักเรียน",
    slogan: "\"เชื่อมสะพานระหว่างนักเรียนกับครู สร้างการเปลี่ยนแปลงที่จับต้องได้\"",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=PimchanokT&backgroundColor=ffd5dc"
  },
  {
    id:     "thanakrit_p",
    name:   "ธนกฤต พุทธรักษา",
    role:   "รองประธานสภานักเรียน",
    slogan: "\"นวัตกรรมการศึกษา — ร่วมกันออกแบบประสบการณ์โรงเรียนที่ดีกว่าเดิม\"",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=ThanakritP&backgroundColor=d1f4e0"
  },
  {
    id:     "wanida_r",
    name:   "วนิดา รักเรียน",
    role:   "เลขานุการ",
    slogan: "\"รับฟังทุกปัญหา บันทึกทุกข้อเสนอ และส่งต่อเสียงของคุณสู่ผู้บริหาร\"",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=WanidaR&backgroundColor=ffe4b5"
  },
  {
    id:     "krit_w",
    name:   "กฤต วงศ์ศรี",
    role:   "เหรัญญิก",
    slogan: "\"บริหารงบให้คุ้มค่า ทำให้ทุกกิจกรรมเกิดขึ้นจริงเพื่อนักเรียนทุกคน\"",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=KritW&backgroundColor=c0d8f4"
  }
];


/* ════════════════════════════════════════════════════════════
   ③  เริ่มต้น Firebase
   ════════════════════════════════════════════════════════════ */
firebase.initializeApp(firebaseConfig);

// เปิดใช้งาน Analytics (ไม่บังคับ)
firebase.analytics();

const auth      = firebase.auth();
const db        = firebase.firestore();

/* ── Collections ใน Firestore ──
   votes/{uid}          → บันทึกว่าแต่ละผู้ใช้โหวตใคร
   tallies/{candidateId} → นับจำนวนคะแนนแต่ละผู้สมัคร
────────────────────────────── */
const votesRef   = db.collection("votes");
const talliesRef = db.collection("tallies");


/* ════════════════════════════════════════════════════════════
   ④  อ้างอิง DOM Elements
   ════════════════════════════════════════════════════════════ */
const screenLogin      = document.getElementById("screen-login");
const screenDashboard  = document.getElementById("screen-dashboard");
const screenLoading    = document.getElementById("screen-loading");

const btnGoogleLogin   = document.getElementById("btn-google-login");
const btnLogout        = document.getElementById("btn-logout");

const userAvatar       = document.getElementById("user-avatar");
const userName         = document.getElementById("user-name");

const votedBanner      = document.getElementById("voted-banner");
const candidatesGrid   = document.getElementById("candidates-grid");
const resultsContainer = document.getElementById("results-container");
const totalVotesBadge  = document.getElementById("total-votes-badge");

const modalConfirm     = document.getElementById("modal-confirm");
const modalCandidateEl = document.getElementById("modal-candidate-name");
const modalCancel      = document.getElementById("modal-cancel");
const modalConfirmBtn  = document.getElementById("modal-confirm-btn");

const toast            = document.getElementById("toast");
const toastText        = document.getElementById("toast-text");


/* ════════════════════════════════════════════════════════════
   ⑤  สถานะแอปพลิเคชัน
   ════════════════════════════════════════════════════════════ */
let currentUser    = null;   // ข้อมูลผู้ใช้จาก Firebase
let pendingVoteId  = null;   // รหัสผู้สมัครที่รอการยืนยัน
let hasVoted       = false;  // ผู้ใช้โหวตแล้วหรือยัง
let votedForId     = null;   // รหัสผู้สมัครที่ผู้ใช้โหวตให้
let talliesUnsub   = null;   // ฟังก์ชันยกเลิก Firestore listener


/* ════════════════════════════════════════════════════════════
   ⑥  จัดการการแสดงหน้าจอ
   ════════════════════════════════════════════════════════════ */
function showScreen(name) {
  screenLogin.classList.add("hidden");
  screenDashboard.classList.add("hidden");
  screenLoading.classList.add("hidden");

  if (name === "login")     screenLogin.classList.remove("hidden");
  if (name === "dashboard") screenDashboard.classList.remove("hidden");
  if (name === "loading")   screenLoading.classList.remove("hidden");
}


/* ════════════════════════════════════════════════════════════
   ⑦  การยืนยันตัวตน (Authentication)
   ════════════════════════════════════════════════════════════ */

/* ── ปุ่มลงชื่อเข้าใช้ด้วย Google ──
   ใช้ signInWithRedirect แทน Popup เพื่อหลีกเลี่ยงปัญหา
   browser บล็อก popup และ unauthorized-domain
────────────────────────────────────── */
btnGoogleLogin.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  showScreen("loading");

  // Redirect: พาผู้ใช้ไปหน้า Google แล้วกลับมา
  auth.signInWithRedirect(provider).catch((err) => {
    console.error("เกิดข้อผิดพลาดในการล็อกอิน:", err);
    showScreen("login");

    // แสดง error message ที่เหมาะสม
    if (err.code === "auth/unauthorized-domain") {
      showToast("โดเมนนี้ยังไม่ได้รับอนุญาต — ดู console สำหรับรายละเอียด", true);
      console.error("💡 แก้ไข: ไปที่ Firebase Console → Authentication → Settings → Authorized domains → เพิ่ม domain นี้");
    } else {
      showToast("ล็อกอินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", true);
    }
  });
});

/* ── ปุ่มออกจากระบบ ── */
btnLogout.addEventListener("click", () => {
  if (talliesUnsub) { talliesUnsub(); talliesUnsub = null; }
  auth.signOut();
});

/* ── ตรวจสอบผลลัพธ์หลังจาก Redirect กลับมา ──
   สำคัญมาก: ต้องเรียกก่อน onAuthStateChanged
   เพื่อรับ user ที่กลับมาจาก Google หน้า login
───────────────────────────────────────────── */
auth.getRedirectResult().then((result) => {
  // result.user จะมีค่าถ้าเพิ่งกลับมาจาก redirect
  // onAuthStateChanged จะจัดการต่อเองโดยอัตโนมัติ
  if (result && result.user) {
    console.log("✅ Redirect login สำเร็จ:", result.user.displayName);
  }
}).catch((err) => {
  console.error("Redirect result error:", err);
  if (err.code === "auth/unauthorized-domain") {
    showScreen("login");
    showToast("โดเมนนี้ยังไม่ได้รับอนุญาต กรุณาเพิ่มใน Firebase Console", true);
    console.error("💡 ไปที่: Firebase Console → Authentication → Settings → Authorized domains");
  }
});

/* ── ตรวจสอบสถานะการล็อกอินแบบเรียลไทม์ ── */
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // ผู้ใช้ล็อกอินแล้ว
    currentUser = user;
    showScreen("loading");
    await initDashboard(user);
    showScreen("dashboard");
  } else {
    // ผู้ใช้ออกจากระบบแล้ว — รีเซ็ตสถานะ
    currentUser   = null;
    hasVoted      = false;
    votedForId    = null;
    pendingVoteId = null;
    if (talliesUnsub) { talliesUnsub(); talliesUnsub = null; }
    showScreen("login");
  }
});


/* ════════════════════════════════════════════════════════════
   ⑧  เริ่มต้นแดชบอร์ด
   ════════════════════════════════════════════════════════════ */
async function initDashboard(user) {

  /* -- อัปเดตข้อมูลผู้ใช้ในแถบนำทาง -- */
  userAvatar.src = user.photoURL || "";
  userAvatar.classList.toggle("hidden", !user.photoURL);
  userName.textContent = user.displayName || user.email;

  /* -- ตรวจสอบว่าผู้ใช้เคยโหวตแล้วหรือยัง --
     โครงสร้าง: votes/{uid} → { candidateId, voterEmail, timestamp }
  ---------------------------------------------------------------- */
  try {
    const voteDoc = await votesRef.doc(user.uid).get();
    if (voteDoc.exists) {
      hasVoted   = true;
      votedForId = voteDoc.data().candidateId;
    } else {
      hasVoted   = false;
      votedForId = null;
    }
  } catch (err) {
    console.error("ไม่สามารถตรวจสอบสถานะการโหวต:", err);
  }

  /* -- สร้างการ์ดผู้สมัคร -- */
  renderCandidates();

  /* -- แสดง/ซ่อนแบนเนอร์ -- */
  votedBanner.classList.toggle("hidden", !hasVoted);

  /* -- เริ่ม listener ผลคะแนนแบบเรียลไทม์ -- */
  startTalliesListener();
}


/* ════════════════════════════════════════════════════════════
   ⑨  สร้างการ์ดผู้สมัคร
   ════════════════════════════════════════════════════════════ */
function renderCandidates() {
  candidatesGrid.innerHTML = "";

  CANDIDATES.forEach((c) => {
    const isChosenOne = hasVoted && votedForId === c.id;

    const card = document.createElement("div");
    card.className = `candidate-card${isChosenOne ? " voted-for" : ""}`;
    card.dataset.id = c.id;

    card.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${c.avatar}" alt="${c.name}" class="candidate-avatar"/>
        <div>
          <span class="candidate-role">${c.role}</span>
          <p class="candidate-name">${c.name}</p>
        </div>
      </div>

      <p class="candidate-slogan">${c.slogan}</p>

      <button
        class="btn-vote"
        data-id="${c.id}"
        data-name="${c.name}"
        ${hasVoted ? "disabled" : ""}
        aria-label="ลงคะแนนให้ ${c.name}"
      >
        ${isChosenOne
          ? `<span style="display:flex;align-items:center;justify-content:center;gap:6px;">
               <svg style="width:16px;height:16px;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
               </svg>
               คะแนนของคุณ
             </span>`
          : "ลงคะแนน"}
      </button>
    `;

    candidatesGrid.appendChild(card);
  });

  /* -- ผูก event กับปุ่มลงคะแนน -- */
  candidatesGrid.querySelectorAll(".btn-vote").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (hasVoted) return;
      openConfirmModal(btn.dataset.id, btn.dataset.name);
    });
  });
}


/* ════════════════════════════════════════════════════════════
   ⑩  โมดัลยืนยันการลงคะแนน
   ════════════════════════════════════════════════════════════ */
function openConfirmModal(candidateId, candidateName) {
  pendingVoteId = candidateId;
  modalCandidateEl.textContent = candidateName;
  modalConfirm.classList.remove("hidden");
}

function closeConfirmModal() {
  pendingVoteId = null;
  modalConfirm.classList.add("hidden");
}

/* ปุ่มยกเลิก */
modalCancel.addEventListener("click", closeConfirmModal);

/* คลิก backdrop เพื่อปิดโมดัล */
modalConfirm.addEventListener("click", (e) => {
  if (e.target === modalConfirm || e.target.classList.contains("modal-backdrop")) {
    closeConfirmModal();
  }
});

/* ── ปุ่มยืนยันการลงคะแนน ── */
modalConfirmBtn.addEventListener("click", async () => {
  if (!pendingVoteId || !currentUser) return;

  const candidateId = pendingVoteId;
  closeConfirmModal();

  // ปิดปุ่มทันที (Optimistic UI) เพื่อป้องกันการกดซ้ำ
  hasVoted = true;
  disableAllVoteButtons();

  try {
    /* ══════════════════════════════════════════════════════════
       FIRESTORE TRANSACTION (การเขียนแบบ Atomic)
       ─────────────────────────────────────────────────────────
       ใช้ Transaction เพื่อความปลอดภัยสูงสุด:
         1. อ่าน votes/{uid} ก่อน
         2. ถ้ามีอยู่แล้ว → ยุติ (โหวตแล้ว)
         3. ถ้าไม่มี → บันทึกคะแนน + เพิ่มตัวนับ tallies

       โครงสร้าง Firestore:
         votes/{uid}           → { candidateId, voterEmail, timestamp }
         tallies/{candidateId} → { count: <จำนวน> }
    ═══════════════════════════════════════════════════════════ */
    await db.runTransaction(async (tx) => {
      const voteRef  = votesRef.doc(currentUser.uid);
      const tallyRef = talliesRef.doc(candidateId);

      const existingVote = await tx.get(voteRef);

      // ตรวจสอบซ้ำอีกครั้ง: ถ้าโหวตแล้วให้หยุด
      if (existingVote.exists) {
        throw new Error("ALREADY_VOTED");
      }

      // 1. บันทึกการโหวตของผู้ใช้คนนี้
      tx.set(voteRef, {
        candidateId:  candidateId,
        voterEmail:   currentUser.email,
        voterName:    currentUser.displayName || "",
        timestamp:    firebase.firestore.FieldValue.serverTimestamp()
      });

      // 2. เพิ่มคะแนนให้ผู้สมัคร (atomic increment)
      tx.set(tallyRef, {
        count: firebase.firestore.FieldValue.increment(1)
      }, { merge: true }); // merge: true สร้าง document ถ้ายังไม่มี
    });

    /* -- โหวตสำเร็จ -- */
    votedForId = candidateId;
    renderCandidates();   // วาดการ์ดใหม่ (แสดงป้าย "คะแนนของคุณ")
    votedBanner.classList.remove("hidden");
    showToast("🗳️  ลงคะแนนเสร็จสมบูรณ์แล้ว ขอบคุณ!");

  } catch (err) {
    if (err.message === "ALREADY_VOTED") {
      showToast("คุณได้ลงคะแนนไปแล้ว ไม่สามารถโหวตซ้ำได้", true);
      votedBanner.classList.remove("hidden");
    } else {
      console.error("เกิดข้อผิดพลาดขณะโหวต:", err);
      // คืนค่า — อนุญาตให้ลองใหม่
      hasVoted = false;
      renderCandidates();
      showToast("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง", true);
    }
  }
});


/* ════════════════════════════════════════════════════════════
   ⑪  ปิดปุ่มลงคะแนนทั้งหมด
   ════════════════════════════════════════════════════════════ */
function disableAllVoteButtons() {
  candidatesGrid.querySelectorAll(".btn-vote").forEach((btn) => {
    btn.disabled = true;
  });
}


/* ════════════════════════════════════════════════════════════
   ⑫  Listener ผลคะแนนแบบเรียลไทม์ (Firestore onSnapshot)
   ════════════════════════════════════════════════════════════ */
function startTalliesListener() {
  // ยกเลิก listener เก่าก่อน (ถ้ามี)
  if (talliesUnsub) talliesUnsub();

  /* -- สร้างแถบผลคะแนนเริ่มต้น -- */
  resultsContainer.innerHTML = "";

  CANDIDATES.forEach((c) => {
    const row = document.createElement("div");
    row.className = "result-row";
    row.id = `result-${c.id}`;
    row.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:4px;">
        <div style="display:flex;align-items:center;gap:10px;min-width:0;">
          <img src="${c.avatar}" alt="${c.name}"
            style="width:28px;height:28px;border-radius:8px;border:1px solid var(--line);object-fit:cover;flex-shrink:0;"/>
          <span style="color:var(--light);font-size:0.875rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.name}</span>
          <span style="font-size:0.7rem;color:var(--muted);flex-shrink:0;">${c.role}</span>
        </div>
        <span id="count-${c.id}"
          style="color:var(--accent);font-weight:700;font-size:0.875rem;font-variant-numeric:tabular-nums;flex-shrink:0;">
          0
        </span>
      </div>
      <div class="result-bar-track">
        <div id="bar-${c.id}" class="result-bar-fill" style="width:0%"></div>
      </div>
    `;
    resultsContainer.appendChild(row);
  });

  /* -- Subscribe รับอัปเดตแบบ live -- */
  talliesUnsub = talliesRef.onSnapshot((snapshot) => {
    const counts = {};

    // รวบรวมคะแนนจาก snapshot
    snapshot.forEach((doc) => {
      counts[doc.id] = doc.data().count || 0;
    });

    // คำนวณคะแนนรวม
    const total = Object.values(counts).reduce((sum, v) => sum + v, 0);

    // อัปเดต badge จำนวนคะแนนทั้งหมด
    totalVotesBadge.textContent = `${total.toLocaleString("th-TH")} คะแนนเสียง`;

    // อัปเดตแถบและตัวเลขของผู้สมัครแต่ละคน
    CANDIDATES.forEach((c) => {
      const count   = counts[c.id] || 0;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;

      const countEl = document.getElementById(`count-${c.id}`);
      const barEl   = document.getElementById(`bar-${c.id}`);

      if (countEl) countEl.textContent = count.toLocaleString("th-TH");
      if (barEl)   barEl.style.width   = `${percent}%`;
    });

  }, (err) => {
    console.error("Listener ผลคะแนนมีปัญหา:", err);
  });
}


/* ════════════════════════════════════════════════════════════
   ⑬  Toast แจ้งเตือน
   ════════════════════════════════════════════════════════════ */
let toastTimer = null;

function showToast(message, isError = false) {
  toastText.textContent = message;

  // เปลี่ยนสีตามประเภท (สำเร็จ = teal, ผิดพลาด = แดง)
  toast.style.color       = isError ? "#f87171" : "var(--teal)";
  toast.style.borderColor = isError ? "rgba(248,113,113,0.3)" : "rgba(56,229,192,0.3)";

  toast.classList.remove("toast-hide");
  toast.classList.add("toast-show");

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("toast-show");
    toast.classList.add("toast-hide");
  }, 4000);
}


/* ════════════════════════════════════════════════════════════
   ⑭  กด Escape เพื่อปิดโมดัล
   ════════════════════════════════════════════════════════════ */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalConfirm.classList.contains("hidden")) {
    closeConfirmModal();
  }
});


/* ════════════════════════════════════════════════════════════
   จบ app.js
   ════════════════════════════════════════════════════════════ */
