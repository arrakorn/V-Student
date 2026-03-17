// นำเข้า Firebase Modular SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Configuration ตามที่คุณระบุมา
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

// ดึง Elements จาก HTML มาใช้งาน
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const errorMsg = document.getElementById('error-msg');

const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const userDisplayEmail = document.getElementById('user-display-email');
const logoutBtn = document.getElementById('logout-btn');

// ฟังก์ชันสลับหน้า UI (Login <-> Register)
showRegisterBtn.addEventListener('click', () => {
    loginForm.classList.remove('active');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    registerForm.classList.add('active');
    errorMsg.textContent = '';
});

showLoginBtn.addEventListener('click', () => {
    registerForm.classList.remove('active');
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    loginForm.classList.add('active');
    errorMsg.textContent = '';
});

// จัดการการสมัครสมาชิก (Register)
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // สมัครสำเร็จ ระบบจะล็อคอินให้อัตโนมัติ (onAuthStateChanged จะทำงาน)
            registerForm.reset();
        })
        .catch((error) => {
            showError(error.code);
        });
});

// จัดการการเข้าสู่ระบบ (Login)
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            loginForm.reset();
        })
        .catch((error) => {
            showError(error.code);
        });
});

// จัดการออกจากระบบ (Logout)
logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        // ออกจากระบบสำเร็จ
    }).catch((error) => {
        console.error(error);
    });
});

// สังเกตการณ์สถานะผู้ใช้ (เช็คว่าล็อคอินอยู่หรือไม่)
onAuthStateChanged(auth, (user) => {
    if (user) {
        // ถ้าล็อคอินอยู่ ให้ซ่อนหน้า Auth และโชว์หน้า Dashboard
        authContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        userDisplayEmail.textContent = user.email; // แสดงอีเมลผู้ใช้
    } else {
        // ถ้าไม่ได้ล็อคอิน ให้โชว์หน้า Auth และซ่อนหน้า Dashboard
        authContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
    }
});

// ฟังก์ชันแปล Error Code เป็นภาษาไทยให้อ่านง่าย
function showError(errorCode) {
    let msg = "เกิดข้อผิดพลาดบางอย่าง";
    if (errorCode === 'auth/email-already-in-use') msg = "อีเมลนี้ถูกใช้งานแล้ว!";
    if (errorCode === 'auth/weak-password') msg = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') msg = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
    if (errorCode === 'auth/invalid-email') msg = "รูปแบบอีเมลไม่ถูกต้อง";
    
    errorMsg.textContent = msg;
}
