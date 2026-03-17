// นำเข้า Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase Configuration ของคุณ
const firebaseConfig = {
  apiKey: "AIzaSyB4k3-LHtyC6nikVKnDQWPHxy5Z-5t3POo",
  authDomain: "v-student-4a4d6.firebaseapp.com",
  projectId: "v-student-4a4d6",
  storageBucket: "v-student-4a4d6.firebasestorage.app",
  messagingSenderId: "350774501594",
  appId: "1:350774501594:web:0d4249981f805e563b05e3",
  measurementId: "G-QNKHK7T7SF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ตัวแปร UI
let isLoginMode = true;
const authSection = document.getElementById('auth-section');
const voteSection = document.getElementById('vote-section');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authBtn = document.getElementById('auth-btn');
const toggleAuthBtn = document.getElementById('toggle-auth');
const toggleHint = document.getElementById('toggle-hint');
const errorMsg = document.getElementById('auth-error');
const userDisplay = document.getElementById('user-display');
const logoutBtn = document.getElementById('logout-btn');
const voteButtons = document.querySelectorAll('.btn-vote');
const voteStatus = document.getElementById('vote-status');

// 1. สลับโหมด เข้าสู่ระบบ / สมัครสมาชิก
toggleAuthBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    errorMsg.innerText = '';
    
    if (isLoginMode) {
        authTitle.innerText = 'เข้าสู่ระบบ';
        authBtn.innerText = 'เข้าสู่ระบบ';
        toggleHint.innerText = 'ยังไม่มีบัญชีใช่ไหม?';
        toggleAuthBtn.innerText = 'สมัครสมาชิกเลย';
    } else {
        authTitle.innerText = 'สมัครสมาชิก';
        authBtn.innerText = 'ลงทะเบียน';
        toggleHint.innerText = 'มีบัญชีอยู่แล้ว?';
        toggleAuthBtn.innerText = 'เข้าสู่ระบบเลย';
    }
});

// 2. จัดการฟอร์ม (Submit)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        authBtn.disabled = true;
        authBtn.innerText = "กำลังประมวลผล...";
        
        if (isLoginMode) {
            // ล็อคอิน
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            // สมัครสมาชิก
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // สร้างข้อมูลลง Database ให้รู้ว่ายังไม่ได้โหวต
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email: email,
                hasVoted: false
            });
        }
    } catch (error) {
        errorMsg.innerText = "เกิดข้อผิดพลาด: " + error.message;
        authBtn.disabled = false;
        authBtn.innerText = isLoginMode ? 'เข้าสู่ระบบ' : 'ลงทะเบียน';
    }
});

// 3. จัดการ State ของ User (เช็คว่าเข้าระบบอยู่ไหม)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // เข้าสู่ระบบสำเร็จ
        authSection.classList.add('hidden');
        voteSection.classList.remove('hidden');
        userDisplay.innerText = `ผู้ใช้: ${user.email}`;
        
        // เช็คว่าเคยโหวตหรือยัง
        checkVoteStatus(user.uid);
    } else {
        // ออกจากระบบ
        authSection.classList.remove('hidden');
        voteSection.classList.add('hidden');
        authForm.reset();
        authBtn.disabled = false;
        authBtn.innerText = 'เข้าสู่ระบบ';
    }
});

// 4. ออกจากระบบ
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// 5. ระบบเช็คสถานะการโหวต
async function checkVoteStatus(uid) {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists() && docSnap.data().hasVoted) {
        disableVoting("คุณได้ทำการโหวตเรียบร้อยแล้ว ขอบคุณที่ใช้สิทธิครับ 🎉");
    } else {
        enableVoting();
    }
}

// 6. ระบบโหวต
voteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        const partyId = e.target.getAttribute('data-id');
        const user = auth.currentUser;
        
        if (!user) return;

        if(confirm("ยืนยันการโหวตเบอร์นี้ใช่ไหม? (โหวตได้ครั้งเดียวเท่านั้น)")){
            try {
                // อัปเดตข้อมูลผู้ใช้ว่าโหวตแล้ว
                const userDocRef = doc(db, "users", user.uid);
                await updateDoc(userDocRef, {
                    hasVoted: true,
                    votedFor: partyId,
                    voteTime: new Date()
                });

                // เพิ่มคะแนนให้พรรคการเมืองใน Firestore (สร้าง collection 'candidates' ไว้เก็บคะแนน)
                const candidateRef = doc(db, "candidates", partyId);
                // ถ้ายังไม่มี Document นี้ จะใช้ setDoc แบบ merge (ถ้าใช้ใน production ควรสร้าง doc รอไว้ก่อน)
                await setDoc(candidateRef, { votes: increment(1) }, { merge: true });

                disableVoting("บันทึกผลโหวตสำเร็จ! ขอบคุณที่เป็นส่วนหนึ่งของสภานักเรียนครับ 🎊");
            } catch (error) {
                console.error("Error voting: ", error);
                alert("เกิดข้อผิดพลาดในการบันทึกคะแนน กรุณาลองใหม่");
            }
        }
    });
});

function disableVoting(message) {
    voteButtons.forEach(btn => btn.disabled = true);
    voteStatus.innerText = message;
    voteStatus.classList.remove('hidden');
}

function enableVoting() {
    voteButtons.forEach(btn => btn.disabled = false);
    voteStatus.classList.add('hidden');
}
