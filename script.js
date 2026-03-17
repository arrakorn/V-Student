// Firebase Configuration (เชื่อมต่อตามที่คุณครูให้มา)
const firebaseConfig = {
    apiKey: "AIzaSyBALBRccsCoSgadd26glq8kjCVzYVjpRjQ",
    authDomain: "arakonapp.firebaseapp.com",
    projectId: "arakonapp",
    storageBucket: "arakonapp.firebasestorage.app",
    messagingSenderId: "377162906533",
    appId: "1:377162906533:web:dcc6197b28cf961431464c",
    measurementId: "G-WYRJZD0ZMG"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let loggedInUser = null;

// สลับหน้า Login / Signup
function switchTab(type) {
    document.getElementById('login-form').classList.toggle('hidden', type === 'signup');
    document.getElementById('signup-form').classList.toggle('hidden', type === 'login');
    document.getElementById('tab-login').classList.toggle('active', type === 'login');
    document.getElementById('tab-signup').classList.toggle('active', type === 'signup');
}

// 1. ระบบลงทะเบียน (Sign Up)
function handleSignUp() {
    const sid = document.getElementById('reg-sid').value;
    const name = document.getElementById('reg-name').value;
    const pass = document.getElementById('reg-pass').value;

    if(!sid || !name || !pass) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
    }

    // ตรวจสอบว่ามีรหัสนักเรียนนี้หรือยัง
    db.ref('users/' + sid).once('value', snapshot => {
        if (snapshot.exists()) {
            alert("รหัสนักเรียนนี้ถูกลงทะเบียนไปแล้ว");
        } else {
            db.ref('users/' + sid).set({
                fullName: name,
                password: pass,
                hasVoted: false
            }).then(() => {
                alert("ลงทะเบียนสำเร็จ! เข้าสู่ระบบได้เลย");
                switchTab('login');
            });
        }
    });
}

// 2. ระบบเข้าสู่ระบบ (Login)
function handleLogin() {
    const sid = document.getElementById('login-sid').value;
    const pass = document.getElementById('login-pass').value;

    db.ref('users/' + sid).once('value', snapshot => {
        const userData = snapshot.val();
        if (userData && userData.password === pass) {
            if (userData.hasVoted) {
                alert("คุณได้ใช้สิทธิ์ไปแล้ว ไม่สามารถโหวตซ้ำได้");
            } else {
                loggedInUser = { sid, ...userData };
                showVotePage();
            }
        } else {
            document.getElementById('auth-msg').innerText = "รหัสผ่านไม่ถูกต้อง หรือ ไม่พบชื่อผู้ใช้";
        }
    });
}

function showVotePage() {
    document.getElementById('auth-card').classList.add('hidden');
    document.getElementById('vote-card').classList.remove('hidden');
    document.getElementById('display-user').innerText = `👤 ${loggedInUser.fullName}`;
}

// 3. ระบบโหวต (Vote)
function selectCandidate(no, name) {
    if (confirm(`ยืนยันการโหวตให้ ${name} (เบอร์ ${no}) ?`)) {
        // อัปเดตสถานะผู้ใช้ว่าโหวตแล้ว
        db.ref('users/' + loggedInUser.sid).update({ hasVoted: true });
        
        // บันทึกคะแนนลง Summary
        db.ref('results/no' + no).transaction(current => (current || 0) + 1);
        
        // เก็บ Log การโหวต (เพื่อตรวจสอบ)
        db.ref('vote_logs').push({
            student_id: loggedInUser.sid,
            candidate_no: no,
            timestamp: ServerValue.TIMESTAMP
        });

        document.getElementById('vote-card').classList.add('hidden');
        document.getElementById('finish-card').classList.remove('hidden');
    }
}

const ServerValue = firebase.database.ServerValue;
