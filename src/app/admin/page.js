"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import Link from "next/link";
import Chart from "chart.js/auto";

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
    
    const [skills, setSkills] = useState([]);
    const [experience, setExperience] = useState([]);
    
    const [cmsStatus, setCmsStatus] = useState("");

    // Analytics State
    const [feedbacks, setFeedbacks] = useState([]);
    const [visitsData, setVisitsData] = useState(null);
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

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
                fbs.push({ ...d, date: d.timestamp ? d.timestamp.toDate().toLocaleString() : 'Just now' });
            });
            setFeedbacks(fbs);

            // Fetch Visits & Build Chart
            const visitsSnap = await getDocs(query(collection(db, "visits"), orderBy("timestamp", "desc"), limit(100)));
            let visitsByDate = {};
            visitsSnap.forEach(doc => {
                const data = doc.data();
                if(data.timestamp) {
                    const date = data.timestamp.toDate().toLocaleDateString();
                    visitsByDate[date] = (visitsByDate[date] || 0) + 1;
                }
            });
            setVisitsData(visitsByDate);

        } catch (err) {
            console.error("Error loading analytics", err);
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

    const handleSaveCMS = async (e) => {
        e.preventDefault();
        setCmsStatus("Publishing...");
        try {
            await setDoc(doc(db, "content", "main"), {
                heroName, heroTagline, heroHeadline, aboutText,
                linkedin, email: emailLink, whatsapp,
                skills, experience
            });
            setCmsStatus("Published successfully!");
        } catch (err) {
            console.error(err);
            setCmsStatus("Error saving.");
        }
    };

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

            <nav className="dashboard-tabs" style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <button 
                    onClick={() => setActiveTab('content')} 
                    className="submit-btn" 
                    style={{ flex: 1, padding: '15px', borderRadius: '12px', background: activeTab === 'content' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <i className="fa-solid fa-pen-to-square" style={{ marginRight: '10px' }}></i> Content Manager
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')} 
                    className="submit-btn" 
                    style={{ flex: 1, padding: '15px', borderRadius: '12px', background: activeTab === 'analytics' ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                    <i className="fa-solid fa-chart-line" style={{ marginRight: '10px' }}></i> Traffic & Feedback
                </button>
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
        </div>
    );
}
