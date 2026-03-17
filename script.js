// Firebase Configuration
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
const database = firebase.database();

let currentStudentId = "";

// ฟังก์ชัน Login แบบง่าย (ตรวจสอบว่ากรอกข้อมูลมาไหม)
function login() {
    const studentId = document.getElementById('student-id').value;
    if (studentId.trim().length < 5) {
        document.getElementById('login-error').innerText = "กรุณากรอกรหัสนักเรียนให้ถูกต้อง";
        return;
    }

    // ตรวจสอบว่าเคยโหวตหรือยังใน Firebase
    database.ref('votes/' + studentId).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            document.getElementById('login-error').innerText = "คุณได้ใช้สิทธิ์โหวตไปแล้ว";
        } else {
            currentStudentId = studentId;
            showSection('vote-section');
        }
    });
}

// ฟังก์ชันการโหวต
function castVote(candidateNumber) {
    if (confirm(`คุณต้องการยืนยันการโหวตให้ เบอร์ ${candidateNumber} ใช่หรือไม่?`)) {
        database.ref('votes/' + currentStudentId).set({
            candidate: candidateNumber,
            timestamp: Date.now()
        }).then(() => {
            // เพิ่มคะแนนรวม (Optional: สำหรับทำหน้า Dashboard สรุปผล)
            database.ref('summary/candidate' + candidateNumber).transaction((currentVotes) => {
                return (currentVotes || 0) + 1;
            });
            showSection('success-section');
        }).catch((error) => {
            alert("เกิดข้อผิดพลาด: " + error.message);
        });
    }
}

function showSection(sectionId) {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('vote-section').classList.add('hidden');
    document.getElementById('success-section').classList.add('hidden');
    document.getElementById(sectionId).classList.remove('hidden');
}
