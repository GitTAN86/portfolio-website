import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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

// === CMS LOGIC ===
const tabAnalytics = document.getElementById('tabAnalytics');
const tabContent = document.getElementById('tabContent');
const analyticsView = document.getElementById('analyticsView');
const contentView = document.getElementById('contentView');

if(tabAnalytics && tabContent) {
    tabAnalytics.addEventListener('click', () => {
        analyticsView.style.display = 'grid';
        contentView.style.display = 'none';
        tabAnalytics.style.background = 'var(--color-primary)';
        tabContent.style.background = 'rgba(255,255,255,0.1)';
    });
    tabContent.addEventListener('click', () => {
        analyticsView.style.display = 'none';
        contentView.style.display = 'block';
        tabContent.style.background = 'var(--color-primary)';
        tabAnalytics.style.background = 'rgba(255,255,255,0.1)';
        loadCMSData();
    });
}

// Add Button Listeners
const addSkillBtn = document.getElementById('addSkillBtn');
const addExpBtn = document.getElementById('addExpBtn');
if(addSkillBtn) addSkillBtn.addEventListener('click', () => addSkillRow());
if(addExpBtn) addExpBtn.addEventListener('click', () => addExpRow());

function renderSkills(skillsArray) {
    const container = document.getElementById('skillsContainer');
    if(!container) return;
    container.innerHTML = '';
    skillsArray.forEach(skill => addSkillRow(skill.title, skill.description, skill.icon));
}

function addSkillRow(title = '', desc = '', icon = 'fa-solid fa-star') {
    const container = document.getElementById('skillsContainer');
    const row = document.createElement('div');
    row.className = 'skill-row';
    row.style = 'display: flex; gap: 10px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 5px; align-items: flex-start;';
    
    row.innerHTML = `
        <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 8px;">
            <input type="text" placeholder="Skill Title" class="skill-title" value="${title}" style="padding: 8px; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;">
            <input type="text" placeholder="FontAwesome Icon (e.g. fa-solid fa-robot)" class="skill-icon" value="${icon}" style="padding: 8px; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;">
            <textarea placeholder="Skill Description" class="skill-desc" rows="2" style="padding: 8px; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;">${desc}</textarea>
        </div>
        <button type="button" class="remove-btn submit-btn" style="background: #EA4335; width: auto; padding: 5px 10px;">X</button>
    `;
    
    row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

function renderExperience(expArray) {
    const container = document.getElementById('expContainer');
    if(!container) return;
    container.innerHTML = '';
    expArray.forEach(exp => addExpRow(exp.title, exp.company, exp.date, exp.bullets ? exp.bullets.join('\n') : ''));
}

function addExpRow(title = '', company = '', date = '', bullets = '') {
    const container = document.getElementById('expContainer');
    const row = document.createElement('div');
    row.className = 'exp-row';
    row.style = 'display: flex; gap: 10px; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 5px; align-items: flex-start;';
    
    row.innerHTML = `
        <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 8px;">
            <input type="text" placeholder="Job Title" class="exp-title" value="${title}" style="padding: 8px; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;">
            <input type="text" placeholder="Company" class="exp-company" value="${company}" style="padding: 8px; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;">
            <input type="text" placeholder="Date Range (e.g. 2020 - Present)" class="exp-date" value="${date}" style="padding: 8px; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;">
            <textarea placeholder="Job Responsibilities (Enter one bullet point per line)" class="exp-bullets" rows="4" style="padding: 8px; background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;">${bullets}</textarea>
        </div>
        <button type="button" class="remove-btn submit-btn" style="background: #EA4335; width: auto; padding: 5px 10px;">X</button>
    `;
    
    row.querySelector('.remove-btn').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

async function loadCMSData() {
    try {
        const docSnap = await getDoc(doc(db, "content", "main"));
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('cmsName').value = data.heroName || '';
            document.getElementById('cmsTagline').value = data.heroTagline || '';
            document.getElementById('cmsHeadline').value = data.heroHeadline || '';
            document.getElementById('cmsAbout').value = data.aboutText || '';
            
            renderSkills(data.skills || []);
            renderExperience(data.experience || []);
        } else {
            console.log("No CMS content yet. Pre-loading default data from your resume...");
            
            const defaultSkills = [
                { title: "Operations Management", icon: "fa-solid fa-chart-line", description: "Cross-functional Leadership, KPI/SLA Attainment, MBR/QBR Reporting." },
                { title: "Digital Transformation", icon: "fa-solid fa-robot", description: "Process Automation, Workflow Optimization, Quality Auditing." },
                { title: "Client Relations", icon: "fa-solid fa-handshake", description: "Global Stakeholder Management, B2B Account Support, Service Delivery Excellence." },
                { title: "Technical Proficiency", icon: "fa-solid fa-microchip", description: "SAP S/4HANA, SAP ERP, SAP Build, SAP BTP, Power BI, SAP SAC, Adobe AEM, HTML, CSS, JS, Node.js, Java." }
            ];
            
            const defaultExperience = [
                { 
                    title: "Associate Manager (SAP Project)", 
                    company: "Concentrix Malaysia", 
                    date: "2022 – Present", 
                    bullets: [
                        "Cross-Functional Leadership: Direct and mentor 4 specialized teams comprising 40+ agents across APJ and EMEA regions.",
                        "Process Automation: Spearheaded the development of 20 custom automation workflows using SAP iRPA and Power Automate; reduced repetitive task efforts by 50%.",
                        "Service Quality: Enhanced process accuracy by eliminating human error through automation, leading to an average 20% increase in CSAT scores.",
                        "Team Incubation: Launched the Digital Automation and Digital Design teams from inception.",
                        "Operational Excellence: Maintained an unblemished 100% KPI achievement rate across all 4 teams for 4+ consecutive years.",
                        "Stakeholder Engagement: Prepare and present sophisticated MBR/QBR to Concentrix executive management and global SAP clients.",
                        "Strategic Migration: Successfully integrated the Web Operations team into the core SAP business unit."
                    ]
                },
                { 
                    title: "Team Lead (SAP Store, APJ)", 
                    company: "Concentrix Malaysia", 
                    date: "2020 – 2022", 
                    bullets: [
                        "Performance Management: Directed daily operations for the APJ Store Support team.",
                        "KPI Attainment: Led the team to achieve 100% of all quarterly KPIs for 8 consecutive quarters (2 years) without a single missed target.",
                        "Talent Development: Conducted regular coaching and feedback sessions, identifying operational weaknesses and implementing targeted improvement plans."
                    ]
                },
                { 
                    title: "Senior E-commerce Specialist (SAP Store)", 
                    company: "Concentrix Malaysia", 
                    date: "2016 – 2020", 
                    bullets: [
                        "B2B Client Support: Managed complex pre- and post-order inquiries for SAP Store customers, resolving up to 30 cases daily with high accuracy.",
                        "AI & Chatbot Innovation: Played a critical role in developing and implementing the first-ever Chatbot for the SAP Store in 2018.",
                        "Award & Recognition: Recognized as 'Most Valuable Agent of the Year' globally in 2018 for exceptional performance and innovation."
                    ]
                }
            ];

            document.getElementById('cmsName').value = 'Bahman Noushabadi';
            document.getElementById('cmsTagline').value = 'Tech Leader & Developer';
            document.getElementById('cmsHeadline').value = 'Bridging the Gap Between Operational Excellence and Technical Innovation.';
            document.getElementById('cmsAbout').value = "Originally from Iran and currently based in Kuala Lumpur, I am a tech leader and developer with a deep passion for solving complex enterprise challenges. With a Bachelor's in Computer Science and a Master's in Software Engineering, my career has been built at the intersection of hands-on software development and strategic B2B SaaS operations.\\n\\n<strong>Building for the Web</strong>\\nBeyond managing global customer success teams, I am a builder at heart. I specialize in web development and content management, utilizing a robust technical stack that includes HTML, CSS, JavaScript, Node.js, and Java.\\n\\n<strong>Scaling Enterprise Solutions</strong>\\nOver the last decade, I have led cross-functional teams and driven digital transformation within the global SAP ecosystem. By leveraging process automation tools like SAP iRPA and Power Automate, I have a proven track record of eliminating manual workflows, accelerating SLA resolutions, and boosting customer satisfaction.";
            
            renderSkills(defaultSkills);
            renderExperience(defaultExperience);
        }
    } catch(err) {
        console.error("Error loading CMS data:", err);
    }
}

const cmsForm = document.getElementById('cmsForm');
if(cmsForm) {
    cmsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const status = document.getElementById('cmsStatus');
        status.style.color = 'white';
        status.textContent = 'Publishing...';
        
        try {
            // Read all dynamic Skill rows
            const skillsParsed = Array.from(document.querySelectorAll('.skill-row')).map(row => ({
                title: row.querySelector('.skill-title').value,
                icon: row.querySelector('.skill-icon').value,
                description: row.querySelector('.skill-desc').value
            }));
            
            // Read all dynamic Experience rows
            const experienceParsed = Array.from(document.querySelectorAll('.exp-row')).map(row => ({
                title: row.querySelector('.exp-title').value,
                company: row.querySelector('.exp-company').value,
                date: row.querySelector('.exp-date').value,
                // Split bullets by newline and remove empty lines
                bullets: row.querySelector('.exp-bullets').value.split('\\n').filter(b => b.trim() !== '')
            }));
            
            const dataToSave = {
                heroName: document.getElementById('cmsName').value,
                heroTagline: document.getElementById('cmsTagline').value,
                heroHeadline: document.getElementById('cmsHeadline').value,
                aboutText: document.getElementById('cmsAbout').value,
                skills: skillsParsed,
                experience: experienceParsed
            };
            
            await setDoc(doc(db, "content", "main"), dataToSave);
            status.style.color = '#00ff88';
            status.textContent = 'Published successfully! Visit your website to see the changes.';
        } catch(err) {
            console.error(err);
            status.style.color = '#EA4335';
            status.textContent = 'Error saving: ' + err.message;
        }
    });
}
