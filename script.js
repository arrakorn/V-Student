// นำเข้าฟังก์ชันที่จำเป็นจาก Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Config ที่คุณให้มา
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

// โดเมนจำลองสำหรับการล็อกอินด้วยรหัสนักเรียน
const SCHOOL_DOMAIN = "@student.cted.chandra.edu"; 

// ดึง Elements ต่างๆ จาก DOM
const authSection = document.getElementById('auth-section');
const votingSection = document.getElementById('voting-section');
const txtStudentId = document.getElementById('student-id');
const txtPassword = document.getElementById('password');
const btnLogin = document.getElementById('btnLogin');
const btnRegister = document.getElementById('btnRegister');
const btnLogout = document.getElementById('btnLogout');
const authMessage = document.getElementById('auth-message');
const voteButtons = document.querySelectorAll('.vote-btn');

// ฟังก์ชันสำหรับสลับหน้าจอ
function showSection(sectionToShow) {
    authSection.classList.remove('active-slide');
    votingSection.classList.remove('active-slide');
    
    setTimeout(() => {
        authSection.classList.add('hidden');
        votingSection.classList.add('hidden');
        
        sectionToShow.classList.remove('hidden');
        setTimeout(() => sectionToShow.classList.add('active-slide'), 50);
    }, 300); // รอให้แอนิเมชันเดิมเฟดออกก่อน
}

// ติดตามสถานะการล็อกอิน
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ล็อกอินแล้ว ให้ไปหน้าโหวต
        showSection(votingSection);
        checkIfVoted(user.uid);
    } else {
        // ยังไม่ล็อกอิน ให้อยู่หน้า auth
        showSection(authSection);
    }
});

// ฟังก์ชันสมัครสมาชิก
btnRegister.addEventListener('click', () => {
    const studentId = txtStudentId.value.trim();
    const password = txtPassword.value;

    if(!studentId || !password) {
        authMessage.innerText = "กรุณากรอกรหัสนักเรียนและรหัสผ่านให้ครบถ้วน";
        return;
    }

    const email = studentId + SCHOOL_DOMAIN;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            authMessage.style.color = "green";
            authMessage.innerText = "สมัครสมาชิกสำเร็จ! กำลังเข้าสู่ระบบ...";
            // บันทึกข้อมูลเบื้องต้นลง Firestore
            setDoc(doc(db, "users", userCredential.user.uid), {
                studentId: studentId,
                hasVoted: false,
                votedFor: null
            });
        })
        .catch((error) => {
            authMessage.style.color = "red";
            if(error.code === 'auth/email-already-in-use') {
                authMessage.innerText = "รหัสนักเรียนนี้ถูกลงทะเบียนไปแล้ว";
            } else if (error.code === 'auth/weak-password') {
                authMessage.innerText = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
            } else {
                authMessage.innerText = "เกิดข้อผิดพลาด: " + error.message;
            }
        });
});

// ฟังก์ชันเข้าสู่ระบบ
btnLogin.addEventListener('click', () => {
    const studentId = txtStudentId.value.trim();
    const password = txtPassword.value;
    const email = studentId + SCHOOL_DOMAIN;

    signInWithEmailAndPassword(auth, email, password)
        .catch((error) => {
            authMessage.style.color = "red";
            authMessage.innerText = "รหัสนักเรียน หรือ รหัสผ่านไม่ถูกต้อง";
        });
});

// ฟังก์ชันออกจากระบบ
btnLogout.addEventListener('click', () => {
    signOut(auth).then(() => {
        txtStudentId.value = '';
        txtPassword.value = '';
        authMessage.innerText = '';
    });
});

// ตรวจสอบว่าเคยโหวตแล้วหรือยัง
async function checkIfVoted(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists() && docSnap.data().hasVoted) {
        disableVoting("คุณได้ทำการลงคะแนนไปแล้ว ขอบคุณครับ!");
    }
}

// ฟังก์ชันบันทึกการโหวต
voteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        const candidateNo = e.target.getAttribute('data-candidate');
        const user = auth.currentUser;

        if (user) {
            const confirmVote = confirm(`คุณแน่ใจหรือไม่ที่จะโหวตให้เบอร์ ${candidateNo}?`);
            if(confirmVote) {
                try {
                    // อัปเดตสถานะใน Firestore ว่าโหวตแล้ว
                    await setDoc(doc(db, "users", user.uid), {
                        hasVoted: true,
                        votedFor: candidateNo
                    }, { merge: true });
                    
                    alert("บันทึกคะแนนโหวตสำเร็จ!");
                    disableVoting("คุณได้ทำการลงคะแนนไปแล้ว ขอบคุณครับ!");
                } catch (error) {
                    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล: " + error.message);
                }
            }
        }
    });
});

function disableVoting(message) {
    voteButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.backgroundColor = "#ccc";
        btn.style.cursor = "not-allowed";
        btn.innerText = "โหวตแล้ว";
    });
    const headerP = document.querySelector('#voting-section .header p');
    headerP.innerText = message;
    headerP.style.color = "var(--primary-color)";
    headerP.style.fontWeight = "bold";
}
