import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// === FIREBASE CONFIGURATION ===
// TODO: Paste your identical Firebase config object here!
const firebaseConfig = {

    apiKey: "AIzaSyAXSgYhpWa3KilyMDRp36d5Y_FLEce56CI",
    authDomain: "portfolio-6c69f.firebaseapp.com",
    projectId: "portfolio-6c69f",
    storageBucket: "portfolio-6c69f.firebasestorage.app",
    messagingSenderId: "159490695084",
    appId: "1:159490695084:web:8624416d556e26d5ca2409",
    measurementId: "G-310GTV1KR3"
};

let app, auth, db;
try {
    if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    }
} catch (e) {
    console.error("Firebase init error:", e);
}

// UI Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('adminLoginForm');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

if(auth) {
    // Auth State Observer
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loginScreen.style.display = 'none';
            dashboardScreen.style.display = 'block';
            loadDashboardData();
        } else {
            loginScreen.style.display = 'flex';
            dashboardScreen.style.display = 'none';
        }
    });

    // Login Logic
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const pass = document.getElementById('adminPassword').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch(err) {
            loginError.style.display = 'block';
            loginError.textContent = "Invalid credentials. Have you created a user in Firebase Auth?";
        }
    });

    // Logout Logic
    logoutBtn.addEventListener('click', () => signOut(auth));
} else {
    loginError.style.display = 'block';
    loginError.textContent = "Firebase API Keys missing. Open admin.js to paste them.";
}

// Data Fetching & Chart Rendering
async function loadDashboardData() {
    try {
        // 1. Fetch Visits & Render Chart
        const visitsSnapshot = await getDocs(query(collection(db, "visits"), orderBy("timestamp", "desc"), limit(100)));
        let visitsByDate = {};
        
        visitsSnapshot.forEach(doc => {
            const data = doc.data();
            if(data.timestamp) {
                const date = data.timestamp.toDate().toLocaleDateString();
                visitsByDate[date] = (visitsByDate[date] || 0) + 1;
            }
        });

        const ctx = document.getElementById('visitsChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(visitsByDate).reverse(),
                datasets: [{
                    label: 'Page Visits',
                    data: Object.values(visitsByDate).reverse(),
                    borderColor: '#4285F4',
                    backgroundColor: 'rgba(66, 133, 244, 0.2)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: { 
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0'} },
                    x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0'} }
                },
                plugins: { legend: { labels: { color: 'white' } } }
            }
        });

        // 2. Fetch Feedback
        const feedbackSnapshot = await getDocs(query(collection(db, "feedback"), orderBy("timestamp", "desc"), limit(50)));
        const feedbackList = document.getElementById('feedbackList');
        
        if (feedbackSnapshot.empty) {
            feedbackList.innerHTML = '<p style="color: #a0a0a0;">No feedback received yet.</p>';
        } else {
            feedbackList.innerHTML = '';
            feedbackSnapshot.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp ? data.timestamp.toDate().toLocaleString() : 'Just now';
                feedbackList.innerHTML += `
                    <div style="border-bottom: 1px solid rgba(255,255,255,0.1); padding: 15px 0;">
                        <strong style="color: #fff;">${data.name}</strong> (<a href="mailto:${data.email}" style="color: #4285F4; text-decoration: none;">${data.email}</a>)<br>
                        <span style="font-size: 0.8rem; color: #8ba2bd;">${date}</span>
                        <p style="margin-top: 10px; color: #e0e0e0; line-height: 1.5;">${data.message}</p>
                    </div>
                `;
            });
        }
        
    } catch(err) {
        console.error("Error loading data:", err);
    }
}
