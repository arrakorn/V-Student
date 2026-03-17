// Import Firebase SDKs (V9 Modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Firebase Configuration จากข้อมูลของคุณ
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

// --- UI Elements ---
const authContainer = document.getElementById('auth-container');
const votingContainer = document.getElementById('voting-container');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const formLogin = document.getElementById('login-form');
const formRegister = document.getElementById('register-form');
const userNameDisplay = document.getElementById('user-display-name');
const voteStatus = document.getElementById('vote-status');
const voteButtons = document.querySelectorAll('.vote-btn');

// --- Helper: แปลงรหัสนักเรียนเป็น Email จำลองสำหรับ Auth ---
// เพราะ Firebase ต้องการ Email ในการสมัคร เราจึงใส่ @vstudent.school ต่อท้ายให้เนียนๆ
const formatStudentEmail = (studentId) => `${studentId}@vstudent.school`;

// --- UI Logic: สลับแท็บ Login / Register ---
tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.classList.add('active');
    formRegister.classList.remove('active');
});

tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formRegister.classList.add('active');
    formLogin.classList.remove('active');
});

// --- Authentication Logic ---

// สมัครสมาชิก
formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('reg-id').value;
    const name = document.getElementById('reg-name').value;
    const password = document.getElementById('reg-password').value;
    const email = formatStudentEmail(id);
    const errorMsg = document.getElementById('reg-error');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // บันทึกข้อมูลนักเรียนลง Firestore database
        await setDoc(doc(db, "students", user.uid), {
            studentId: id,
            fullName: name,
            hasVoted: false,
            votedFor: null
        });
        
        alert("สมัครสมาชิกสำเร็จ!");
        formRegister.reset();
        tabLogin.click(); // สลับกลับไปหน้าเข้าสู่ระบบ
    } catch (error) {
        errorMsg.textContent = "เกิดข้อผิดพลาด: " + error.message;
    }
});

// เข้าสู่ระบบ
formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('login-id').value;
    const password = document.getElementById('login-password').value;
    const email = formatStudentEmail(id);
    const errorMsg = document.getElementById('login-error');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // เช็คสถานะการล็อกอินจะทำงานผ่าน onAuthStateChanged อัตโนมัติ
    } catch (error) {
        errorMsg.textContent = "รหัสนักเรียนหรือรหัสผ่านไม่ถูกต้อง";
    }
});

// ออกจากระบบ
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth);
});

// --- ตรวจสอบสถานะการเข้าสู่ระบบ (Real-time) ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // ซ่อนหน้า Login แสดงหน้าโหวต
        authContainer.classList.add('hidden');
        votingContainer.classList.remove('hidden');
        
        // ดึงข้อมูลผู้ใช้จาก Firestore
        const docRef = doc(db, "students", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const studentData = docSnap.data();
            userNameDisplay.textContent = studentData.fullName + " (รหัส: " + studentData.studentId + ")";
            
            // ตรวจสอบว่าเคยโหวตหรือยัง
            if (studentData.hasVoted) {
                disableVoting("คุณได้ลงคะแนนให้เบอร์ " + studentData.votedFor + " ไปแล้ว");
            } else {
                enableVoting();
            }
        }
    } else {
        // หากไม่ได้ล็อกอิน
        authContainer.classList.remove('hidden');
        votingContainer.classList.add('hidden');
        formLogin.reset();
    }
});

// --- Voting Logic ---
voteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        const candidateNumber = e.target.getAttribute('data-candidate');
        const user = auth.currentUser;
        
        if (user && confirm(`ยืนยันการลงคะแนนให้เบอร์ ${candidateNumber} ใช่หรือไม่? (ไม่สามารถแก้ไขได้)`)) {
            try {
                const studentRef = doc(db, "students", user.uid);
                
                // อัปเดตข้อมูลใน Firestore ว่าโหวตแล้ว
                await updateDoc(studentRef, {
                    hasVoted: true,
                    votedFor: candidateNumber
                });
                
                // แจ้งเตือนและล็อกปุ่ม
                alert("บันทึกคะแนนโหวตของคุณเรียบร้อยแล้ว!");
                disableVoting("คุณได้ลงคะแนนให้เบอร์ " + candidateNumber + " ไปแล้ว");
                
            } catch (error) {
                alert("เกิดข้อผิดพลาดในการโหวต: " + error.message);
            }
        }
    });
});

// ฟังก์ชันล็อกปุ่มโหวต
function disableVoting(message) {
    voteButtons.forEach(btn => btn.disabled = true);
    voteStatus.textContent = message;
    voteStatus.style.color = "#e74c3c";
}

// ฟังก์ชันเปิดปุ่มโหวต
function enableVoting() {
    voteButtons.forEach(btn => btn.disabled = false);
    voteStatus.textContent = "";
}
