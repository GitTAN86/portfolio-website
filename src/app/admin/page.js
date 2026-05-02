"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs, where, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Link from "next/link";
import Chart from "chart.js/auto";
import * as XLSX from "xlsx";

export default function AdminPage() {
    const [user, setUser] = useState(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("content");

    // CMS State
    const [heroName, setHeroName] = useState("");
    const [heroTagline, setHeroTagline] = useState("");
    const [heroHeadline, setHeroHeadline] = useState("");
    const [aboutText, setAboutText] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [emailLink, setEmailLink] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [gallery, setGallery] = useState([]);
    
    const [skills, setSkills] = useState([]);
    const [experience, setExperience] = useState([]);
    
    const [cmsStatus, setCmsStatus] = useState("");

    // Analytics State
    const [feedbacks, setFeedbacks] = useState([]);
    const [visitsData, setVisitsData] = useState(null);
    const [rawVisits, setRawVisits] = useState([]);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // Reporting State
    const [reportRange, setReportRange] = useState("monthly"); // daily, weekly, monthly, yearly
    const [isExporting, setIsExporting] = useState(false);

    // Media State
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        document.body.className = 'theme-4'; // Force dark theme for admin readability
        
        if(!auth) return;
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            if (currentUser) {
                loadCMSData();
                loadAnalyticsData();
            }
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setLoginError("");
        } catch (err) {
            setLoginError("Invalid credentials.");
        }
    };

    const handleLogout = () => {
        signOut(auth);
    };

    const loadCMSData = async () => {
        if(!db) return;
        try {
            const docSnap = await getDoc(doc(db, "content", "main"));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setHeroName(data.heroName || "");
                setHeroTagline(data.heroTagline || "");
                setHeroHeadline(data.heroHeadline || "");
                setAboutText(data.aboutText || "");
                setLinkedin(data.linkedin || "");
                setEmailLink(data.email || "");
                setWhatsapp(data.whatsapp || "");
                setSkills(data.skills || []);
                setExperience(data.experience || []);
                setProfileImage(data.profileImage || "");
                setGallery(data.gallery || []);
            }
        } catch (err) {
            console.error("Error loading CMS data", err);
        }
    };

    const loadAnalyticsData = async () => {
        if(!db) return;
        try {
            // Fetch Feedbacks
            const feedbackSnap = await getDocs(query(collection(db, "feedback"), orderBy("timestamp", "desc"), limit(50)));
            const fbs = [];
            feedbackSnap.forEach(doc => {
                const d = doc.data();
                fbs.push({ ...d, id: doc.id, date: d.timestamp ? d.timestamp.toDate().toLocaleString() : 'Just now' });
            });
            setFeedbacks(fbs);

            // Fetch Visits
            const visitsSnap = await getDocs(query(collection(db, "visits"), orderBy("timestamp", "desc"), limit(500)));
            const visits = [];
            let visitsByDate = {};
            
            visitsSnap.forEach(doc => {
                const d = doc.data();
                const visitDate = d.timestamp ? d.timestamp.toDate() : new Error();
                const dateString = visitDate instanceof Date ? visitDate.toLocaleDateString() : 'Unknown';
                
                visits.push({
                    ...d,
                    id: doc.id,
                    formattedDate: visitDate instanceof Date ? visitDate.toLocaleString() : 'Unknown',
                    timestampObj: visitDate
                });

                if(dateString !== 'Unknown') {
                    visitsByDate[dateString] = (visitsByDate[dateString] || 0) + 1;
                }
            });

            setRawVisits(visits);
            setVisitsData(visitsByDate);

        } catch (err) {
            console.error("Error loading analytics", err);
        }
    };

    // --- Reporting Functions ---
    const exportReport = (type, format) => {
        setIsExporting(true);
        try {
            const now = new Date();
            let startDate = new Date();
            if (reportRange === 'daily') startDate.setDate(now.getDate() - 1);
            else if (reportRange === 'weekly') startDate.setDate(now.getDate() - 7);
            else if (reportRange === 'monthly') startDate.setMonth(now.getMonth() - 1);
            else if (reportRange === 'yearly') startDate.setFullYear(now.getFullYear() - 1);

            let dataToExport = [];
            let fileName = "";

            if (type === 'traffic') {
                dataToExport = rawVisits.filter(v => v.timestampObj >= startDate).map(v => ({
                    Date: v.formattedDate,
                    IP: v.ip || 'Unknown',
                    City: v.city || 'Unknown',
                    Region: v.region || 'Unknown',
                    Country: v.country || 'Unknown',
                    UserAgent: v.userAgent,
                    Language: v.language,
                    ScreenWidth: v.screenWidth
                }));
                fileName = `Visitor_Traffic_${reportRange}_${now.toISOString().split('T')[0]}`;
            } else {
                // Feedback Report
                dataToExport = feedbacks.map(f => ({
                    Date: f.date,
                    Name: f.name,
                    Email: f.email,
                    Message: f.message
                }));
                fileName = `Visitor_Feedback_All_Time_${now.toISOString().split('T')[0]}`;
            }

            if (dataToExport.length === 0) {
                alert("No data found for this range.");
                setIsExporting(false);
                return;
            }

            if (format === 'xlsx') {
                const worksheet = XLSX.utils.json_to_sheet(dataToExport);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, type === 'traffic' ? "Traffic" : "Feedback");
                XLSX.writeFile(workbook, `${fileName}.xlsx`);
            } else {
                // CSV
                const headers = Object.keys(dataToExport[0] || {}).join(",");
                const rows = dataToExport.map(obj => Object.values(obj).map(v => `"${v}"`).join(","));
                const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", `${fileName}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (e) {
            console.error("Export failed", e);
            alert("Export failed. See console for details.");
        }
        setIsExporting(false);
    };

    // --- Media Functions ---
    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setUploading(true);
        try {
            const fileRef = ref(storage, `media/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            
            if (type === 'profile') {
                setProfileImage(url);
            } else {
                setGallery([...gallery, url]);
            }
            setCmsStatus("Image uploaded! Save to publish changes.");
        } catch (e) {
            console.error("Upload failed", e);
            alert("Upload failed.");
        }
        setUploading(false);
    };

    const removeFromGallery = (index) => {
        const newGallery = gallery.filter((_, i) => i !== index);
        setGallery(newGallery);
    };

    const handleSaveCMS = async (e) => {
        e.preventDefault();
        setCmsStatus("Publishing...");
        try {
            await setDoc(doc(db, "content", "main"), {
                heroName, heroTagline, heroHeadline, aboutText,
                linkedin, email: emailLink, whatsapp,
                skills, experience,
                profileImage, gallery
            });
            setCmsStatus("Published successfully!");
        } catch (err) {
            console.error(err);
            setCmsStatus("Error saving.");
        }
    };

    useEffect(() => {
        if (activeTab === 'analytics' && visitsData && chartRef.current) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            chartInstanceRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Object.keys(visitsData).reverse(),
                    datasets: [{
                        label: 'Page Visits',
                        data: Object.values(visitsData).reverse(),
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
        }
    }, [activeTab, visitsData]);

    const updateSkill = (index, field, value) => {
        const newSkills = [...skills];
        newSkills[index][field] = value;
        setSkills(newSkills);
    };

    const updateExperience = (index, field, value) => {
        const newExp = [...experience];
        if (field === 'bullets') {
            newExp[index][field] = value.split('\\n');
        } else {
            newExp[index][field] = value;
        }
        setExperience(newExp);
    };

    if (loading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading Admin...</div>;

    if (!user) {
        return (
            <div id="loginScreen" className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
                <div className="login-box glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                    <h2 style={{ marginBottom: '20px', color: 'white' }}>Admin Portal</h2>
                    <form id="adminLoginForm" onSubmit={handleLogin}>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px' }} />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', color: 'white', marginBottom: '5px' }}>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '5px' }} />
                        </div>
                        <button type="submit" className="submit-btn" style={{ width: '100%' }}>Login Securely</button>
                    </form>
                    {loginError && <p style={{ color: '#EA4335', marginTop: '15px' }}>{loginError}</p>}
                    <Link href="/" style={{ display: 'block', marginTop: '20px', color: '#B0BEC5', textAlign: 'center' }}>&larr; Back to Public Site</Link>
                </div>
            </div>
        );
    }

    return (
        <div id="dashboardScreen" className="dashboard-container" style={{ minHeight: '100vh', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div>
                    <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '5px' }}>Admin Dashboard</h2>
                    <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>Manage your portfolio content and track performance</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <Link href="/" className="submit-btn" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}>View Site</Link>
                    <button onClick={handleLogout} className="submit-btn" style={{ background: '#EA4335', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}>Logout</button>
                </div>
            </header>

            <nav className="dashboard-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                {[
                    { id: 'content', icon: 'fa-pen-to-square', label: 'Content' },
                    { id: 'media', icon: 'fa-image', label: 'Media' },
                    { id: 'analytics', icon: 'fa-chart-line', label: 'Traffic' },
                    { id: 'reports', icon: 'fa-file-export', label: 'Reports' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className="submit-btn" 
                        style={{ 
                            flex: 1, 
                            minWidth: '120px',
                            padding: '12px', 
                            borderRadius: '12px', 
                            background: activeTab === tab.id ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', 
                            border: '1px solid rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                    </button>
                ))}
            </nav>

            {activeTab === 'content' && (
                <div id="contentView" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <form onSubmit={handleSaveCMS} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Hero Section Card */}
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ color: 'var(--color-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-rocket"></i> Hero Section
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Full Name</label>
                                    <input type="text" value={heroName} onChange={e => setHeroName(e.target.value)} placeholder="e.g. Bahman Noushabadi" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Profile Picture URL (Use Media tab to upload)</label>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input type="text" value={profileImage} readOnly style={{ flexGrow: 1, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.05)', color: '#888' }} />
                                        {profileImage && <img src={profileImage} style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' }} />}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Tagline</label>
                                    <input type="text" value={heroTagline} onChange={e => setHeroTagline(e.target.value)} placeholder="e.g. Tech Leader" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Headline</label>
                                    <input type="text" value={heroHeadline} onChange={e => setHeroHeadline(e.target.value)} placeholder="e.g. Bridging the Gap..." style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                            </div>
                        </div>

                        {/* About Section Card */}
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ color: 'var(--color-tertiary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-user"></i> About Section
                            </h3>
                            <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>About Biography (HTML Support)</label>
                            <textarea value={aboutText} onChange={e => setAboutText(e.target.value)} rows="8" placeholder="Tell your story..." style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit' }} />
                        </div>

                        {/* Contact & Socials Card */}
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ color: '#34A853', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-address-book"></i> Contact & Socials
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                <div>
                                    <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>LinkedIn URL</label>
                                    <input type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/..." style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Email Address</label>
                                    <input type="text" value={emailLink} onChange={e => setEmailLink(e.target.value)} placeholder="hello@example.com" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>WhatsApp Number</label>
                                    <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+60123456789" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                </div>
                            </div>
                        </div>

                        {/* Skills Manager Card */}
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: '#4285F4', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-list-check"></i> Skills Manager
                                </h3>
                                <button type="button" onClick={() => setSkills([...skills, { title: "", icon: "fa-solid fa-star", description: "" }])} className="submit-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>+ Add New Skill</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {skills.map((skill, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <input type="text" value={skill.title} onChange={e => updateSkill(index, 'title', e.target.value)} placeholder="Skill Title" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                            <input type="text" value={skill.icon} onChange={e => updateSkill(index, 'icon', e.target.value)} placeholder="Icon (e.g. fa-solid fa-code)" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                            <textarea value={skill.description} onChange={e => updateSkill(index, 'description', e.target.value)} placeholder="Description..." rows="2" style={{ gridColumn: 'span 2', width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                        </div>
                                        <button type="button" onClick={() => setSkills(skills.filter((_, i) => i !== index))} style={{ alignSelf: 'flex-start', background: 'rgba(234, 67, 53, 0.1)', color: '#EA4335', border: '1px solid rgba(234, 67, 53, 0.2)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Experience Manager Card */}
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: '#FBBC05', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-briefcase"></i> Experience Journey
                                </h3>
                                <button type="button" onClick={() => setExperience([...experience, { title: "", company: "", date: "", bullets: [] }])} className="submit-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>+ Add Job</button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {experience.map((exp, index) => (
                                    <div key={index} style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                        <button type="button" onClick={() => setExperience(experience.filter((_, i) => i !== index))} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(234, 67, 53, 0.1)', color: '#EA4335', border: '1px solid rgba(234, 67, 53, 0.2)', padding: '8px', borderRadius: '6px' }}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Job Title</label>
                                                <input type="text" value={exp.title} onChange={e => updateExperience(index, 'title', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                            </div>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Company</label>
                                                <input type="text" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Date Range</label>
                                                <input type="text" value={exp.date} onChange={e => updateExperience(index, 'date', e.target.value)} placeholder="e.g. 2022 - Present" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Key Responsibilities (One per line)</label>
                                                <textarea value={exp.bullets ? exp.bullets.join('\\n') : ''} onChange={e => updateExperience(index, 'bullets', e.target.value)} rows="5" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ position: 'sticky', bottom: '30px', zIndex: 10 }}>
                            <button type="submit" className="submit-btn" style={{ width: '100%', padding: '20px', fontSize: '1.2rem', borderRadius: '16px', boxShadow: '0 10px 30px rgba(66, 133, 244, 0.4)' }}>
                                <i className="fa-solid fa-cloud-arrow-up" style={{ marginRight: '10px' }}></i> Publish All Changes Live
                            </button>
                            {cmsStatus && (
                                <div style={{ 
                                    marginTop: '15px', 
                                    padding: '12px', 
                                    borderRadius: '10px', 
                                    background: cmsStatus.includes('Error') ? 'rgba(234,67,53,0.1)' : 'rgba(0,255,136,0.1)',
                                    color: cmsStatus.includes('Error') ? '#EA4335' : '#00ff88',
                                    border: `1px solid ${cmsStatus.includes('Error') ? 'rgba(234,67,53,0.2)' : 'rgba(0,255,136,0.2)'}`,
                                    textAlign: 'center' 
                                }}>
                                    {cmsStatus}
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'analytics' && (
                <div id="analyticsView" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '30px' }}>
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <h3 style={{ color: 'white', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-chart-area" style={{ color: 'var(--color-primary)' }}></i> Traffic Overview
                        </h3>
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <canvas id="visitsChart" ref={chartRef}></canvas>
                        </div>
                    </div>
                    
                    <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ color: 'white', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <i className="fa-solid fa-comments" style={{ color: 'var(--color-tertiary)' }}></i> Visitor Feedback
                        </h3>
                        <div id="feedbackList" style={{ flexGrow: 1, maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
                            {feedbacks.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '50px', color: '#a0a0a0' }}>
                                    <i className="fa-solid fa-inbox" style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.3 }}></i>
                                    <p>No feedback messages yet.</p>
                                </div>
                            ) : feedbacks.map((fb, i) => (
                                <div key={i} style={{ 
                                    background: 'rgba(255,255,255,0.03)', 
                                    padding: '20px', 
                                    borderRadius: '12px', 
                                    border: '1px solid rgba(255,255,255,0.05)', 
                                    marginBottom: '15px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{fb.name}</strong>
                                            <div style={{ fontSize: '0.85rem', color: '#4285F4', marginTop: '2px' }}>{fb.email}</div>
                                        </div>
                                        <span style={{ fontSize: '0.75rem', color: '#a0a0a0', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '20px' }}>{fb.date}</span>
                                    </div>
                                    <p style={{ marginTop: '15px', color: '#e0e0e0', lineHeight: '1.6', fontSize: '0.95rem' }}>{fb.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {activeTab === 'media' && (
                <div id="mediaView" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <h3 style={{ color: 'var(--color-primary)', marginBottom: '20px' }}><i className="fa-solid fa-image"></i> Media Management</h3>
                        <p style={{ color: '#a0a0a0', marginBottom: '20px' }}>Upload and manage images for your profile and gallery. Remember to click "Publish" in the Content tab after changes.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                            {/* Profile Photo Upload */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: 'white', marginBottom: '15px' }}>Profile Photo</h4>
                                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                    <img src={profileImage || '/images/pic1.jpg'} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)', marginBottom: '15px' }} />
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    id="profileUpload"
                                    onChange={(e) => handleFileUpload(e, 'profile')}
                                    style={{ display: 'none' }}
                                />
                                <label 
                                    htmlFor="profileUpload" 
                                    className="submit-btn" 
                                    style={{ display: 'block', textAlign: 'center', cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}
                                >
                                    {uploading ? 'Uploading...' : 'Change Profile Photo'}
                                </label>
                            </div>

                            {/* Gallery Management */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: 'white', marginBottom: '15px' }}>Gallery Images</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginBottom: '20px', minHeight: '150px' }}>
                                    {gallery.map((url, i) => (
                                        <div key={i} style={{ position: 'relative', aspectRatio: '1/1' }}>
                                            <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                            <button 
                                                onClick={() => removeFromGallery(i)}
                                                style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(234,67,53,0.8)', border: 'none', borderRadius: '50%', color: 'white', width: '24px', height: '24px', cursor: 'pointer' }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    <label 
                                        htmlFor="galleryUpload"
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            border: '2px dashed rgba(255,255,255,0.1)', 
                                            borderRadius: '8px', 
                                            cursor: 'pointer',
                                            color: '#a0a0a0'
                                        }}
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                    </label>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        id="galleryUpload"
                                        onChange={(e) => handleFileUpload(e, 'gallery')}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div id="reportsView" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Traffic Report Card */}
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h3 style={{ color: 'var(--color-primary)', margin: 0 }}><i className="fa-solid fa-chart-line"></i> Traffic Reports</h3>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <select 
                                    value={reportRange} 
                                    onChange={(e) => setReportRange(e.target.value)}
                                    style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                <button onClick={() => exportReport('traffic', 'csv')} disabled={isExporting} className="submit-btn" style={{ background: 'rgba(255,255,255,0.1)' }}>CSV</button>
                                <button onClick={() => exportReport('traffic', 'xlsx')} disabled={isExporting} className="submit-btn">XLSX</button>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '15px' }}>Date</th>
                                        <th style={{ padding: '15px' }}>Location</th>
                                        <th style={{ padding: '15px' }}>IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawVisits.slice(0, 10).map((v, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '12px 15px', fontSize: '0.85rem' }}>{v.formattedDate}</td>
                                            <td style={{ padding: '12px 15px' }}>{v.city || 'Unknown'}, {v.country || ''}</td>
                                            <td style={{ padding: '12px 15px', fontFamily: 'monospace', color: '#4285F4' }}>{v.ip || '---'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Feedback Report Card */}
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ color: 'var(--color-tertiary)', margin: 0 }}><i className="fa-solid fa-comments"></i> Feedback Export</h3>
                                <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginTop: '5px' }}>Download all visitor messages and contact details.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => exportReport('feedback', 'csv')} disabled={isExporting} className="submit-btn" style={{ background: 'rgba(255,255,255,0.1)' }}>Export CSV</button>
                                <button onClick={() => exportReport('feedback', 'xlsx')} disabled={isExporting} className="submit-btn">Export XLSX</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
