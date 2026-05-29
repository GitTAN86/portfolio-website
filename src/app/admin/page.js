"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db, storage } from "@/lib/firebase";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    updatePassword
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    where,
    Timestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Link from "next/link";
import Chart from "chart.js/auto";
import * as XLSX from "xlsx";

// Dynamic Themes Defaults
const DEFAULT_THEMES = {
    theme1: { bg: "#F9F9FB", text: "#202124", textMuted: "#5f6368", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" },
    theme2: { bg: "#D4DFEB", text: "#202124", textMuted: "#5f6368", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" },
    theme3: { bg: "#2C3E50", text: "#F9F9FB", textMuted: "#B0BEC5", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" },
    theme4: { bg: "#05050A", text: "#ffffff", textMuted: "#a0a0a0", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" }
};

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
    const [cvUrl, setCvUrl] = useState("");

    const [skills, setSkills] = useState([]);
    const [experience, setExperience] = useState([]);
    const [aboutSlides, setAboutSlides] = useState([]);

    const [cmsStatus, setCmsStatus] = useState("");

    // RBAC & Settings State
    const [userRole, setUserRole] = useState(null); // 'super_admin' or 'content_manager'
    const [currentUserDoc, setCurrentUserDoc] = useState(null);
    const [usersList, setUsersList] = useState([]);
    const [headerExpanded, setHeaderExpanded] = useState(false);

    // Captcha & Password state
    const [captchaEnabled, setCaptchaEnabled] = useState(true);
    const [captchaText, setCaptchaText] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordStatus, setPasswordStatus] = useState("");

    // Login mode toggle (Super Admin = email, Content Manager = username)
    const [loginMode, setLoginMode] = useState("super_admin"); // 'super_admin' | 'content_manager'
    const [loginUsername, setLoginUsername] = useState("");

    // New user creation form state
    const [newUserFullName, setNewUserFullName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserUsername, setNewUserUsername] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserRole, setNewUserRole] = useState("content_manager");
    const [newUserStatus, setNewUserStatus] = useState("");

    // Reset password (Super Admin action for content managers)
    const [resetTargetId, setResetTargetId] = useState("");
    const [resetPasswordValue, setResetPasswordValue] = useState("");
    const [resetPasswordStatus, setResetPasswordStatus] = useState("");

    // Section visibility state
    const [sectionVisibility, setSectionVisibility] = useState({
        hero: true,
        heroWordCloud: true,
        heroMap: true,
        about: true,
        aboutCarousel: true,
        aboutTextPanel: true,
        skills: true,
        skillsGrid: true,
        experience: true,
        experienceTimeline: true
    });

    // Dynamic Themes state
    const [themes, setThemes] = useState(DEFAULT_THEMES);

    // Toast notification state
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
    };

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast(prev => ({ ...prev, show: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

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

    // Captcha visual alphanumeric distortion generator
    const generateCaptcha = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let text = "";
        for (let i = 0; i < 6; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptchaText(text);
        setCaptchaInput("");

        setTimeout(() => {
            const canvas = document.getElementById("captchaCanvas");
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw noise background lines
            ctx.fillStyle = "#1e1e2e";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Random grid lines
            for (let i = 0; i < 5; i++) {
                ctx.strokeStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, 255, 0.2)`;
                ctx.beginPath();
                ctx.moveTo(Math.random() * canvas.width, 0);
                ctx.lineTo(Math.random() * canvas.width, canvas.height);
                ctx.stroke();
            }

            // Random distorted text drawing
            ctx.font = "bold 26px 'Space Grotesk', sans-serif";
            for (let i = 0; i < text.length; i++) {
                ctx.fillStyle = `hsl(${Math.random() * 360}, 80%, 70%)`;
                ctx.save();
                const x = 20 + i * 22;
                const y = 30 + Math.random() * 10;
                ctx.translate(x, y);
                ctx.rotate((Math.random() - 0.5) * 0.4);
                ctx.fillText(text[i], 0, 0);
                ctx.restore();
            }

            // Noise circles
            for (let i = 0; i < 15; i++) {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.15})`;
                ctx.beginPath();
                ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }, 100);
    };

    // Pre-auth fetch of captcha setting
    useEffect(() => {
        const checkCaptchaSetting = async () => {
            if (!db) return;
            try {
                const docSnap = await getDoc(doc(db, "content", "main"));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.securitySettings) {
                        setCaptchaEnabled(data.securitySettings.captchaEnabled !== false);
                    }
                }
            } catch (e) {
                console.warn("Could not load pre-auth Captcha setting:", e);
            }
        };
        checkCaptchaSetting();
    }, []);

    // Trigger initial Captcha if login screen is active and enabled
    useEffect(() => {
        if (!user && captchaEnabled) {
            generateCaptcha();
        }
    }, [user, captchaEnabled]);

    // Load CMS data whenever a CM session becomes active (login or page-refresh restore)
    useEffect(() => {
        if (user?.isCMSession && userRole === "content_manager") {
            loadCMSData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, userRole]);

    // Active auth session state listener with RBAC provisioning
    useEffect(() => {
        document.body.className = 'theme-4'; // Force dark theme for admin readability

        // Restore Content Manager local session if present
        const cmSession = typeof window !== "undefined" ? localStorage.getItem("cm_session") : null;
        if (cmSession) {
            try {
                const sessionData = JSON.parse(cmSession);
                setCurrentUserDoc(sessionData);
                setUserRole(sessionData.role || "content_manager");
                setUser({ uid: sessionData.id, isCMSession: true });
                setLoading(false);
                // Load CMS data for content manager session
                setTimeout(() => { loadCMSData(); }, 0);
                return;
            } catch (e) {
                localStorage.removeItem("cm_session");
            }
        }

        if (!auth) { setLoading(false); return; }
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                try {
                    const userRef = doc(db, "users", currentUser.uid);
                    const userSnap = await getDoc(userRef);
                    let activeRole = "content_manager";
                    let activeUserData = null;

                    if (userSnap.exists()) {
                        activeUserData = userSnap.data();
                        activeRole = activeUserData.role || "content_manager";
                    } else {
                        // Bootstrapping initial user as super_admin to prevent lockout
                        const usersSnap = await getDocs(collection(db, "users"));
                        const isFirst = usersSnap.size === 0;
                        const initialRole = isFirst ? "super_admin" : "content_manager";

                        activeUserData = {
                            email: currentUser.email,
                            role: initialRole,
                            name: currentUser.displayName || currentUser.email.split("@")[0]
                        };
                        await setDoc(userRef, activeUserData);
                        activeRole = initialRole;
                    }

                    setUserRole(activeRole);
                    setCurrentUserDoc(activeUserData);

                    // Load CMS Copy & Media
                    loadCMSData();
                    loadAnalyticsData();

                    // Provision registered user directory for super_admins
                    if (activeRole === "super_admin") {
                        loadUsersDirectory();
                    }
                } catch (e) {
                    console.error("Error loading user profile:", e);
                }
            } else {
                setUserRole(null);
                setCurrentUserDoc(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- Utility: SHA-256 hash a string using Web Crypto API ---
    const hashPassword = async (plaintext) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        // Enforce Captcha matching check
        if (captchaEnabled && captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
            setLoginError("Incorrect Captcha string. Please try again.");
            generateCaptcha();
            return;
        }

        if (loginMode === "super_admin") {
            // Standard Firebase Auth email login
            try {
                await signInWithEmailAndPassword(auth, email, password);
                setLoginError("");
            } catch (err) {
                setLoginError("Invalid credentials.");
                if (captchaEnabled) generateCaptcha();
            }
        } else {
            // Content Manager: username + password against Firestore
            try {
                if (!db) { setLoginError("Database not available."); return; }
                const hashed = await hashPassword(password);
                const q = query(collection(db, "users"),
                    where("username", "==", loginUsername.trim()),
                    where("passwordHash", "==", hashed)
                );
                const snap = await getDocs(q);
                if (snap.empty) {
                    setLoginError("Invalid username or password.");
                    if (captchaEnabled) generateCaptcha();
                    return;
                }
                const userDoc = snap.docs[0];
                const userData = userDoc.data();

                // Simulate authenticated session via localStorage (no Firebase Auth)
                localStorage.setItem("cm_session", JSON.stringify({ id: userDoc.id, ...userData }));

                // Trigger state without touching Firebase Auth
                setCurrentUserDoc({ id: userDoc.id, ...userData });
                setUserRole(userData.role || "content_manager");
                setUser({ uid: userDoc.id, isCMSession: true });
                setLoginError("");

                // Load the live CMS data immediately on login
                loadCMSData();
            } catch (err) {
                console.error("CM login error", err);
                setLoginError("Login failed. Please try again.");
                if (captchaEnabled) generateCaptcha();
            }
        }
    };

    // --- Create new user (Content Manager OR Super Admin via Firebase Auth invite) ---
    const handleCreateUser = async (e) => {
        e.preventDefault();
        setNewUserStatus("");
        if (!db) return;

        if (newUserRole === "content_manager") {
            // Content Manager: store username + hashed password in Firestore
            if (!newUserUsername.trim() || !newUserPassword.trim() || !newUserFullName.trim()) {
                setNewUserStatus("Error: Full name, username, and password are required.");
                return;
            }
            try {
                // Check if username already taken
                const existQ = query(collection(db, "users"), where("username", "==", newUserUsername.trim()));
                const existSnap = await getDocs(existQ);
                if (!existSnap.empty) {
                    setNewUserStatus("Error: Username already exists. Choose a different one.");
                    return;
                }
                const hashed = await hashPassword(newUserPassword);
                const newDocRef = doc(collection(db, "users"));
                await setDoc(newDocRef, {
                    fullName: newUserFullName.trim(),
                    username: newUserUsername.trim(),
                    passwordHash: hashed,
                    role: "content_manager",
                    type: "local",
                    createdAt: new Date().toISOString()
                });
                setNewUserStatus("✓ Content Manager account created successfully!");
                showToast("New Content Manager created!", "success");
                setNewUserFullName(""); setNewUserUsername(""); setNewUserPassword("");
                loadUsersDirectory();
            } catch (err) {
                console.error("Create CM user error", err);
                setNewUserStatus("Error: " + err.message);
            }
        } else {
            // Super Admin: require email, send Firebase invite (password reset email)
            if (!newUserEmail.trim() || !newUserFullName.trim()) {
                setNewUserStatus("Error: Full name and email are required for Super Admin accounts.");
                return;
            }
            try {
                await sendPasswordResetEmail(auth, newUserEmail.trim());
                // Pre-create Firestore doc so they are recognized when they first log in
                const tempId = `pending_${Date.now()}`;
                await setDoc(doc(db, "users", tempId), {
                    name: newUserFullName.trim(),
                    email: newUserEmail.trim(),
                    role: "super_admin",
                    type: "email",
                    pending: true,
                    createdAt: new Date().toISOString()
                });
                setNewUserStatus("✓ Invite email sent! They must sign up with Firebase Auth first.");
                showToast("Super Admin invite sent!", "success");
                setNewUserFullName(""); setNewUserEmail("");
                loadUsersDirectory();
            } catch (err) {
                console.error("Create super admin error", err);
                setNewUserStatus("Error: " + err.message);
            }
        }
    };

    // --- Super Admin: Reset a Content Manager's password ---
    const handleAdminResetPassword = async (targetId) => {
        if (!resetPasswordValue.trim() || resetPasswordValue.length < 6) {
            setResetPasswordStatus("Error: New password must be at least 6 characters.");
            return;
        }
        try {
            const hashed = await hashPassword(resetPasswordValue);
            await setDoc(doc(db, "users", targetId), { passwordHash: hashed }, { merge: true });
            setResetPasswordStatus("✓ Password reset successfully!");
            showToast("Password reset successfully!", "success");
            setResetTargetId("");
            setResetPasswordValue("");
        } catch (err) {
            console.error("Admin reset password error", err);
            setResetPasswordStatus("Error: " + err.message);
        }
    };

    const handleLogout = () => {
        if (currentUserDoc?.type === "local") {
            // Content Manager local session
            localStorage.removeItem("cm_session");
            setUser(null);
            setUserRole(null);
            setCurrentUserDoc(null);
        } else {
            signOut(auth);
        }
    };

    const loadCMSData = async () => {
        if (!db) return;
        try {
            let docSnap = await getDoc(doc(db, "content", "main_draft"));
            if (!docSnap.exists()) {
                docSnap = await getDoc(doc(db, "content", "main"));
            }
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
                setAboutSlides(data.aboutSlides || []);
                setProfileImage(data.profileImage || "");
                setGallery(data.gallery || []);
                setCvUrl(data.cvUrl || "");

                // Fetch new visibility states
                if (data.sectionVisibility) {
                    setSectionVisibility({
                        hero: data.sectionVisibility.hero !== false,
                        heroWordCloud: data.sectionVisibility.heroWordCloud !== false,
                        heroMap: data.sectionVisibility.heroMap !== false,
                        about: data.sectionVisibility.about !== false,
                        aboutCarousel: data.sectionVisibility.aboutCarousel !== false,
                        aboutTextPanel: data.sectionVisibility.aboutTextPanel !== false,
                        skills: data.sectionVisibility.skills !== false,
                        skillsGrid: data.sectionVisibility.skillsGrid !== false,
                        experience: data.sectionVisibility.experience !== false,
                        experienceTimeline: data.sectionVisibility.experienceTimeline !== false,
                    });
                }

                // Fetch security configs
                if (data.securitySettings) {
                    setCaptchaEnabled(data.securitySettings.captchaEnabled !== false);
                }

                // Fetch dynamically customized theme colors
                if (data.themes) {
                    setThemes({
                        theme1: { ...DEFAULT_THEMES.theme1, ...data.themes.theme1 },
                        theme2: { ...DEFAULT_THEMES.theme2, ...data.themes.theme2 },
                        theme3: { ...DEFAULT_THEMES.theme3, ...data.themes.theme3 },
                        theme4: { ...DEFAULT_THEMES.theme4, ...data.themes.theme4 },
                    });
                }
            }
        } catch (err) {
            console.error("Error loading CMS data", err);
        }
    };

    // Load registered user directory accounts
    const loadUsersDirectory = async () => {
        if (!db) return;
        try {
            const usersSnap = await getDocs(collection(db, "users"));
            const users = [];
            usersSnap.forEach(d => {
                users.push({ id: d.id, ...d.data() });
            });
            setUsersList(users);
        } catch (e) {
            console.error("Error loading users directory", e);
        }
    };

    // Update user role and save
    const updateUserRole = async (targetUid, newRole) => {
        if (!db) return;
        if (targetUid === auth.currentUser?.uid) {
            alert("Safety Lock: You cannot change your own super_admin account role.");
            return;
        }
        try {
            await setDoc(doc(db, "users", targetUid), { role: newRole }, { merge: true });
            setCmsStatus(`Role updated successfully to ${newRole}!`);
            showToast(`Role updated successfully to ${newRole}!`, "success");
            loadUsersDirectory();
        } catch (e) {
            console.error("Error updating user role", e);
            showToast("Failed to update user role.", "error");
            alert("Failed to update user role.");
        }
    };

    // Secure password retrieval trigger
    const handleForgotPassword = async () => {
        if (!email) {
            setLoginError("Please enter your email address first.");
            return;
        }
        try {
            await sendPasswordResetEmail(auth, email);
            setLoginError("Password reset email sent successfully! Check your inbox.");
        } catch (e) {
            console.error("Password reset error", e);
            setLoginError("Error sending reset email: " + e.message);
        }
    };

    // Logged-in session password updating
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordStatus("");
        if (newPassword !== confirmPassword) {
            setPasswordStatus("Error: Passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordStatus("Error: Password must be at least 6 characters.");
            return;
        }
        try {
            await updatePassword(auth.currentUser, newPassword);
            setPasswordStatus("Password changed successfully!");
            showToast("Password changed successfully!", "success");
            setNewPassword("");
            setConfirmPassword("");
        } catch (e) {
            console.error("Error updating password", e);
            setPasswordStatus("Error: " + e.message);
            showToast(e.message.includes("credential") ? "Re-authentication required." : "Failed to change password.", "error");
        }
    };

    const loadAnalyticsData = async () => {
        if (!db) return;
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

                if (dateString !== 'Unknown') {
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
            } else if (type === 'cv') {
                setCvUrl(url);
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

    const handleSaveDraft = async (e) => {
        if (e) e.preventDefault();
        setCmsStatus("Saving Draft...");
        try {
            await setDoc(doc(db, "content", "main_draft"), {
                heroName, heroTagline, heroHeadline, aboutText,
                linkedin, email: emailLink, whatsapp,
                skills, experience, aboutSlides,
                profileImage, gallery, cvUrl,
                sectionVisibility,
                securitySettings: { captchaEnabled },
                themes
            });
            setCmsStatus("Draft saved successfully! (Not yet live)");
            showToast("Draft saved successfully! (Not yet live)", "success");
        } catch (err) {
            console.error("Draft save failed", err);
            setCmsStatus("Error saving draft.");
            showToast("Failed to save draft.", "error");
        }
    };

    const handlePublishLive = async (e) => {
        if (e) e.preventDefault();
        setCmsStatus("Publishing Live...");
        try {
            const dataPayload = {
                heroName, heroTagline, heroHeadline, aboutText,
                linkedin, email: emailLink, whatsapp,
                skills, experience, aboutSlides,
                profileImage, gallery, cvUrl,
                sectionVisibility,
                securitySettings: { captchaEnabled },
                themes
            };
            // Save to active live document
            await setDoc(doc(db, "content", "main"), dataPayload);
            // Sync with draft document as well
            await setDoc(doc(db, "content", "main_draft"), dataPayload);
            setCmsStatus("Published successfully! Changes are now live.");
            showToast("Published successfully! Changes are now live.", "success");
        } catch (err) {
            console.error("Publish failed", err);
            setCmsStatus("Error publishing changes.");
            showToast("Failed to publish changes.", "error");
        }
    };

    const resetSectionToDefault = (sectionName) => {
        if (sectionName === 'hero') {
            setSectionVisibility(prev => ({
                ...prev,
                hero: true,
                heroWordCloud: true,
                heroMap: true
            }));
            setThemes(prev => ({
                ...prev,
                theme1: { ...DEFAULT_THEMES.theme1 }
            }));
            setCmsStatus("Hero section reset to original design! Save or publish to apply.");
            showToast("Hero section reset to original design!", "success");
        } else if (sectionName === 'about') {
            setSectionVisibility(prev => ({
                ...prev,
                about: true,
                aboutCarousel: true,
                aboutTextPanel: true
            }));
            setThemes(prev => ({
                ...prev,
                theme2: { ...DEFAULT_THEMES.theme2 }
            }));
            setCmsStatus("About section reset to original design! Save or publish to apply.");
            showToast("About section reset to original design!", "success");
        } else if (sectionName === 'skills') {
            setSectionVisibility(prev => ({
                ...prev,
                skills: true,
                skillsGrid: true
            }));
            setThemes(prev => ({
                ...prev,
                theme3: { ...DEFAULT_THEMES.theme3 }
            }));
            setCmsStatus("Skills section reset to original design! Save or publish to apply.");
            showToast("Skills section reset to original design!", "success");
        } else if (sectionName === 'experience') {
            setSectionVisibility(prev => ({
                ...prev,
                experience: true,
                experienceTimeline: true
            }));
            setThemes(prev => ({
                ...prev,
                theme4: { ...DEFAULT_THEMES.theme4 }
            }));
            setCmsStatus("Experience section reset to original design! Save or publish to apply.");
            showToast("Experience section reset to original design!", "success");
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
                        y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0' } },
                        x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#a0a0a0' } }
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

    const updateAboutSlide = (index, field, value) => {
        const newSlides = [...aboutSlides];
        newSlides[index][field] = value;
        setAboutSlides(newSlides);
    };

    const handleSlideImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fileRef = ref(storage, `media/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            updateAboutSlide(index, 'image', url);
            setCmsStatus("Slide image uploaded! Save to publish changes.");
        } catch (err) {
            console.error("Upload failed", err);
            alert("Upload failed.");
        }
        setUploading(false);
    };

    if (loading) return <div style={{ color: 'white', padding: '50px', textAlign: 'center' }}>Loading Admin...</div>;

    if (!user) {
        return (
            <div id="loginScreen" className="admin-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
                <div className="login-box glass-card" style={{ width: '100%', maxWidth: '420px' }}>
                    <h2 style={{ marginBottom: '8px', color: 'white', textAlign: 'center' }}>Admin Portal</h2>

                    {/* Login Mode Toggle */}
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', marginBottom: '24px', gap: '4px' }}>
                        <button
                            type="button"
                            onClick={() => { setLoginMode("super_admin"); setLoginError(""); }}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s',
                                background: loginMode === 'super_admin' ? 'var(--color-primary, #4285F4)' : 'transparent',
                                color: loginMode === 'super_admin' ? 'white' : '#a0a0a0'
                            }}
                        >
                            <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px' }}></i>Super Admin
                        </button>
                        <button
                            type="button"
                            onClick={() => { setLoginMode("content_manager"); setLoginError(""); }}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600', transition: 'all 0.2s',
                                background: loginMode === 'content_manager' ? '#00c97f' : 'transparent',
                                color: loginMode === 'content_manager' ? 'white' : '#a0a0a0'
                            }}
                        >
                            <i className="fa-solid fa-user-pen" style={{ marginRight: '6px' }}></i>Content Manager
                        </button>
                    </div>

                    <form id="adminLoginForm" onSubmit={handleLogin}>
                        {loginMode === 'super_admin' ? (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', color: 'white', marginBottom: '5px', fontSize: '0.9rem' }}>Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                            </div>
                        ) : (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', color: 'white', marginBottom: '5px', fontSize: '0.9rem' }}>Username</label>
                                <input type="text" value={loginUsername} onChange={e => setLoginUsername(e.target.value)} required autoComplete="username" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                            </div>
                        )}

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', color: 'white', marginBottom: '5px', fontSize: '0.9rem' }}>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                        </div>

                        {/* Interactive Canvas Captcha */}
                        {captchaEnabled && (
                            <div style={{ marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <label style={{ display: 'block', color: 'white', marginBottom: '8px', fontSize: '0.85rem' }}>Security Verification</label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                    <canvas id="captchaCanvas" width="160" height="42" style={{ borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}></canvas>
                                    <button type="button" onClick={generateCaptcha} className="submit-btn" style={{ padding: '10px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Refresh Captcha">
                                        <i className="fa-solid fa-arrows-rotate"></i>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={captchaInput}
                                    onChange={e => setCaptchaInput(e.target.value)}
                                    placeholder="Enter Captcha above"
                                    required
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textTransform: 'uppercase', letterSpacing: '2px', textAlign: 'center' }}
                                />
                            </div>
                        )}

                        <button type="submit" className="submit-btn" style={{ width: '100%', padding: '12px', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' }}>Login Securely</button>
                    </form>
                    {loginError && <p style={{ color: loginError.includes('sent') ? '#00ff88' : '#EA4335', marginTop: '15px', textAlign: 'center', fontSize: '0.9rem' }}>{loginError}</p>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '0.85rem' }}>
                        {loginMode === 'super_admin' ? (
                            <button type="button" onClick={handleForgotPassword} style={{ background: 'none', border: 'none', color: '#4285F4', cursor: 'pointer' }}>Forgot Password?</button>
                        ) : (
                            <span style={{ color: '#888', fontSize: '0.8rem' }}>Contact your Super Admin to reset your password.</span>
                        )}
                        <Link href="/" style={{ color: '#B0BEC5', textDecoration: 'none' }}>&larr; Back to Public Site</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Role-based visible tab configs
    const allTabs = [
        { id: 'content', icon: 'fa-pen-to-square', label: 'Content' },
        { id: 'media', icon: 'fa-image', label: 'Media' },
        { id: 'analytics', icon: 'fa-chart-line', label: 'Traffic', superAdminOnly: true },
        { id: 'reports', icon: 'fa-file-export', label: 'Reports', superAdminOnly: true },
        { id: 'settings', icon: 'fa-gears', label: 'Settings' }
    ];
    const visibleTabs = allTabs.filter(t => !t.superAdminOnly || userRole === 'super_admin');

    return (
        <div id="dashboardScreen" className="dashboard-container" style={{ minHeight: '100vh', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Top Hamburger Toggle Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: 'rgba(255,255,255,0.02)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}>
                <button
                    onClick={() => setHeaderExpanded(!headerExpanded)}
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                    title="Toggle Dashboard Header"
                >
                    <i className={headerExpanded ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
                    <span style={{ fontSize: '1rem', fontWeight: '500', color: '#c0c0c0' }}>Admin Menu</span>
                </button>
                <div style={{ fontSize: '0.85rem', color: '#888' }}>
                    Role: <strong style={{ color: 'var(--color-primary)' }}>{userRole === 'super_admin' ? 'Super Admin' : 'Content Manager'}</strong>
                </div>
            </div>

            {/* Collapsible Admin Dashboard Header Ribbon */}
            {headerExpanded && (
                <header className="dashboard-header" style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s ease' }}>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '5px' }}>Admin Dashboard</h2>
                        <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>
                            Manage portfolio content and systems.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Link href="/" className="submit-btn" style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}>View Site</Link>
                        <button onClick={handleLogout} className="submit-btn" style={{ background: '#EA4335', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}>Logout</button>
                    </div>
                </header>
            )}

            <nav className="dashboard-tabs" style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
                {visibleTabs.map(tab => (
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
                    <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Section Header with Save & Publish buttons */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--color-primary)' }}></i> Content Editor
                            </h3>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={handleSaveDraft} className="submit-btn" style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-floppy-disk"></i> Save Draft
                                </button>
                                <button type="button" onClick={handlePublishLive} className="submit-btn" style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px', background: 'var(--color-primary, #4285F4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-cloud-arrow-up"></i> Publish Live
                                </button>
                            </div>
                        </div>
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

                        {/* About Slides Manager Card (Coverflow) */}
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: 'var(--color-tertiary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-images"></i> About Slides Manager (3D Coverflow)
                                </h3>
                                <button type="button" onClick={() => setAboutSlides([...aboutSlides, { title: "New Slide", image: "", text: "<p>New Slide Description...</p>" }])} className="submit-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>+ Add New Slide</button>
                            </div>
                            <p style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '20px' }}>Manage the 3D coverflow images, titles, and synced text layout on your About Me page.</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {aboutSlides.map((slide, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                        <button type="button" onClick={() => setAboutSlides(aboutSlides.filter((_, i) => i !== index))} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(234, 67, 53, 0.1)', color: '#EA4335', border: '1px solid rgba(234, 67, 53, 0.2)', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                        <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Slide Title</label>
                                                <input type="text" value={slide.title || ""} onChange={e => updateAboutSlide(index, 'title', e.target.value)} placeholder="Slide Title (e.g. Technology Leadership)" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                            </div>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Slide Image</label>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <input type="text" value={slide.image || ""} onChange={e => updateAboutSlide(index, 'image', e.target.value)} placeholder="Image URL (or select file ->)" style={{ flexGrow: 1, padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                                    <label className="submit-btn" style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-block' }}>
                                                        Upload
                                                        <input type="file" accept="image/*" onChange={(e) => handleSlideImageUpload(e, index)} style={{ display: 'none' }} />
                                                    </label>
                                                    {slide.image && <img src={slide.image} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />}
                                                </div>
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Slide Description (HTML supported)</label>
                                                <textarea value={slide.text || ""} onChange={e => updateAboutSlide(index, 'text', e.target.value)} placeholder="HTML content here (e.g. <p>Description...</p>)" rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                    </form>
                </div>
            )}

            {activeTab === 'analytics' && userRole === 'super_admin' && (
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
                                    marginRight: '5px',
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                            <h3 style={{ color: 'var(--color-primary)', margin: 0 }}><i className="fa-solid fa-image"></i> Media Management</h3>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={handleSaveDraft} className="submit-btn" style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-floppy-disk"></i> Save Draft
                                </button>
                                <button type="button" onClick={handlePublishLive} className="submit-btn" style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px', background: 'var(--color-primary, #4285F4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-cloud-arrow-up"></i> Publish Live
                                </button>
                            </div>
                        </div>
                        <p style={{ color: '#a0a0a0', marginBottom: '20px' }}>Upload and manage images for your profile and gallery. Remember to click "Publish" in the Content tab after changes.</p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
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

                            {/* CV PDF Upload */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ color: 'white', marginBottom: '15px' }}>Downloadable CV (PDF)</h4>
                                <div style={{ marginBottom: '15px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', wordBreak: 'break-all' }}>
                                    {cvUrl ? (
                                        <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                                            <i className="fa-solid fa-file-pdf" style={{ marginRight: '8px', fontSize: '1.2rem' }}></i> Current CV Attached
                                        </a>
                                    ) : (
                                        <span style={{ color: '#a0a0a0' }}>No CV attached yet.</span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    id="cvUpload"
                                    onChange={(e) => handleFileUpload(e, 'cv')}
                                    style={{ display: 'none' }}
                                />
                                <label
                                    htmlFor="cvUpload"
                                    className="submit-btn"
                                    style={{ display: 'block', textAlign: 'center', cursor: 'pointer', opacity: uploading ? 0.5 : 1 }}
                                >
                                    {uploading ? 'Uploading...' : 'Upload New CV (PDF)'}
                                </label>
                            </div>
                        </div>

                        {/* Portfolio Photo Gallery Upload */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginTop: '30px' }}>
                            <h4 style={{ color: 'white', marginBottom: '15px' }}>Photo Gallery Slider Images</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                {gallery.map((img, i) => (
                                    <div key={i} style={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={img} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeFromGallery(i)}
                                            style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(234,67,53,0.9)', color: 'white', border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <i className="fa-solid fa-xmark"></i>
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
                                        color: '#a0a0a0',
                                        minHeight: '120px'
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
                </div>
            )}

            {activeTab === 'reports' && userRole === 'super_admin' && (
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

            {activeTab === 'settings' && (
                <div id="settingsView" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Settings Header with Save & Publish buttons */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginBottom: '10px' }}>
                            <h3 style={{ color: 'white', margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-gears" style={{ color: 'var(--color-primary)' }}></i> Settings & Security
                            </h3>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={handleSaveDraft} className="submit-btn" style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-floppy-disk"></i> Save Draft
                                </button>
                                <button type="button" onClick={handlePublishLive} className="submit-btn" style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px', background: 'var(--color-primary, #4285F4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <i className="fa-solid fa-cloud-arrow-up"></i> Publish Live
                                </button>
                            </div>
                        </div>
                        {/* Section Visibility toggles */}
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ color: 'var(--color-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-eye"></i> Section & Component Visibility Switches
                            </h3>
                            <p style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '25px' }}>
                                Control which sections and components are visible on the public page. Turn off entire sections or disable individual components to customize the layout.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                {/* Hero section group */}
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <h4 style={{ color: 'white', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Hero Section</span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={sectionVisibility.hero !== false}
                                                onChange={(e) => setSectionVisibility({ ...sectionVisibility, hero: e.target.checked })}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: sectionVisibility.hero !== false ? 1 : 0.5, transition: 'opacity 0.2s ease' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#c0c0c0', fontSize: '0.85rem' }}>Language Word Cloud</span>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    disabled={sectionVisibility.hero === false}
                                                    checked={sectionVisibility.heroWordCloud !== false}
                                                    onChange={(e) => setSectionVisibility({ ...sectionVisibility, heroWordCloud: e.target.checked })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#c0c0c0', fontSize: '0.85rem' }}>World Map Background</span>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    disabled={sectionVisibility.hero === false}
                                                    checked={sectionVisibility.heroMap !== false}
                                                    onChange={(e) => setSectionVisibility({ ...sectionVisibility, heroMap: e.target.checked })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => resetSectionToDefault('hero')}
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '6px',
                                            color: '#B0BEC5',
                                            padding: '6px 10px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            alignSelf: 'flex-start',
                                            marginTop: 'auto',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: '5px' }}></i> Reset to Original
                                    </button>
                                </div>

                                {/* About section group */}
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <h4 style={{ color: 'white', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>About Section</span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={sectionVisibility.about !== false}
                                                onChange={(e) => setSectionVisibility({ ...sectionVisibility, about: e.target.checked })}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: sectionVisibility.about !== false ? 1 : 0.5, transition: 'opacity 0.2s ease' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#c0c0c0', fontSize: '0.85rem' }}>3D Coverflow Carousel</span>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    disabled={sectionVisibility.about === false}
                                                    checked={sectionVisibility.aboutCarousel !== false}
                                                    onChange={(e) => setSectionVisibility({ ...sectionVisibility, aboutCarousel: e.target.checked })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#c0c0c0', fontSize: '0.85rem' }}>Synced Text Panel</span>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    disabled={sectionVisibility.about === false}
                                                    checked={sectionVisibility.aboutTextPanel !== false}
                                                    onChange={(e) => setSectionVisibility({ ...sectionVisibility, aboutTextPanel: e.target.checked })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => resetSectionToDefault('about')}
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '6px',
                                            color: '#B0BEC5',
                                            padding: '6px 10px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            alignSelf: 'flex-start',
                                            marginTop: 'auto',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: '5px' }}></i> Reset to Original
                                    </button>
                                </div>

                                {/* Skills section group */}
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <h4 style={{ color: 'white', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Skills Section</span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={sectionVisibility.skills !== false}
                                                onChange={(e) => setSectionVisibility({ ...sectionVisibility, skills: e.target.checked })}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: sectionVisibility.skills !== false ? 1 : 0.5, transition: 'opacity 0.2s ease' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#c0c0c0', fontSize: '0.85rem' }}>Skills Card Grid</span>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    disabled={sectionVisibility.skills === false}
                                                    checked={sectionVisibility.skillsGrid !== false}
                                                    onChange={(e) => setSectionVisibility({ ...sectionVisibility, skillsGrid: e.target.checked })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => resetSectionToDefault('skills')}
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '6px',
                                            color: '#B0BEC5',
                                            padding: '6px 10px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            alignSelf: 'flex-start',
                                            marginTop: 'auto',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: '5px' }}></i> Reset to Original
                                    </button>
                                </div>

                                {/* Experience section group */}
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <h4 style={{ color: 'white', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Experience Section</span>
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={sectionVisibility.experience !== false}
                                                onChange={(e) => setSectionVisibility({ ...sectionVisibility, experience: e.target.checked })}
                                            />
                                            <span className="slider"></span>
                                        </label>
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: sectionVisibility.experience !== false ? 1 : 0.5, transition: 'opacity 0.2s ease' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#c0c0c0', fontSize: '0.85rem' }}>Journey Timeline</span>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    disabled={sectionVisibility.experience === false}
                                                    checked={sectionVisibility.experienceTimeline !== false}
                                                    onChange={(e) => setSectionVisibility({ ...sectionVisibility, experienceTimeline: e.target.checked })}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => resetSectionToDefault('experience')}
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            borderRadius: '6px',
                                            color: '#B0BEC5',
                                            padding: '6px 10px',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer',
                                            alignSelf: 'flex-start',
                                            marginTop: 'auto',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <i className="fa-solid fa-arrow-rotate-left" style={{ marginRight: '5px' }}></i> Reset to Original
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security Controls - Super Admin Only */}
                        {userRole === 'super_admin' && (
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ color: 'var(--color-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-shield-halved"></i> Login Security Settings
                            </h3>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '0.95rem', color: 'white' }}>Enforce Login Captcha Verification</span>
                                    <span style={{ fontSize: '0.78rem', color: '#a0a0a0' }}>Protects your administrator dashboard by enforcing visual alphanumeric checks against simple bot crawls.</span>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={captchaEnabled}
                                        onChange={(e) => setCaptchaEnabled(e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        )}

                        {/* Theme Customizer Swatches */}
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                                <h3 style={{ color: 'var(--color-tertiary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-palette"></i> Dynamic Theme Colors
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setThemes({
                                            theme1: { ...DEFAULT_THEMES.theme1 },
                                            theme2: { ...DEFAULT_THEMES.theme2 },
                                            theme3: { ...DEFAULT_THEMES.theme3 },
                                            theme4: { ...DEFAULT_THEMES.theme4 }
                                        });
                                        setCmsStatus("All theme colors reset to defaults! Save or publish to apply.");
                                        showToast("All theme colors reset to defaults!", "success");
                                    }}
                                    className="submit-btn"
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        fontSize: '0.8rem',
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <i className="fa-solid fa-arrow-rotate-left"></i> Reset All Themes
                                </button>
                            </div>
                            <p style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '20px' }}>Amend custom color presets for each of the four smooth scroll transitions.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                                {[
                                    { key: 'theme1', label: 'Theme 1 (Hero / Initial)' },
                                    { key: 'theme2', label: 'Theme 2 (About Me Section)' },
                                    { key: 'theme3', label: 'Theme 3 (Skills Core Grid)' },
                                    { key: 'theme4', label: 'Theme 4 (Experience & Footer)' }
                                ].map(th => (
                                    <div key={th.key} style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                            <h4 style={{ color: 'white', margin: 0, fontSize: '1rem' }}>{th.label}</h4>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setThemes(prev => ({
                                                        ...prev,
                                                        [th.key]: { ...DEFAULT_THEMES[th.key] }
                                                    }));
                                                    setCmsStatus(`${th.label} reset to defaults! Save or publish to apply.`);
                                                    showToast(`${th.label} reset to defaults!`, "success");
                                                }}
                                                style={{
                                                    background: 'rgba(255,255,255,0.04)',
                                                    border: '1px solid rgba(255,255,255,0.08)',
                                                    borderRadius: '6px',
                                                    color: '#B0BEC5',
                                                    padding: '4px 8px',
                                                    fontSize: '0.72rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <i className="fa-solid fa-arrow-rotate-left"></i> Reset
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {[
                                                { field: 'bg', label: 'Background Color' },
                                                { field: 'text', label: 'Text Color' },
                                                { field: 'textMuted', label: 'Muted Text' },
                                                { field: 'primary', label: 'Primary Accent' },
                                                { field: 'secondary', label: 'Secondary Accent' },
                                                { field: 'tertiary', label: 'Tertiary Accent' }
                                            ].map(col => (
                                                <div key={col.field} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                                    <span style={{ color: '#c0c0c0', fontSize: '0.85rem', alignSelf: 'center' }}>{col.label}</span>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <input
                                                            type="color"
                                                            value={themes[th.key]?.[col.field] || DEFAULT_THEMES[th.key][col.field]}
                                                            onChange={(e) => setThemes({
                                                                ...themes,
                                                                [th.key]: {
                                                                    ...themes[th.key],
                                                                    [col.field]: e.target.value
                                                                }
                                                            })}
                                                            style={{ border: 'none', background: 'none', width: '28px', height: '28px', cursor: 'pointer', borderRadius: '4px' }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={themes[th.key]?.[col.field] || DEFAULT_THEMES[th.key][col.field]}
                                                            onChange={(e) => setThemes({
                                                                ...themes,
                                                                [th.key]: {
                                                                    ...themes[th.key],
                                                                    [col.field]: e.target.value
                                                                }
                                                            })}
                                                            style={{ width: '80px', padding: '4px', fontSize: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', textAlign: 'center', borderRadius: '4px' }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Password Changer - Super Admin Only */}
                        {userRole === 'super_admin' && (
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-key"></i> Update Master Password
                            </h3>
                            <p style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '20px' }}>Change your administrative credentials. Must be at least 6 characters.</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                <div>
                                    <label style={{ color: '#a0a0a0', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="••••••"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ color: '#a0a0a0', fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="••••••"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    />
                                </div>
                            </div>
                            <button type="button" onClick={handlePasswordChange} className="submit-btn" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem' }}>Update Password</button>
                            {passwordStatus && (
                                <p style={{
                                    marginTop: '15px',
                                    color: passwordStatus.includes('Error') ? '#EA4335' : '#00ff88',
                                    fontSize: '0.9rem'
                                }}>
                                    {passwordStatus}
                                </p>
                            )}
                        </div>
                        )}

                        {/* User Roles directory manager - Super Admin Only */}
                        {userRole === 'super_admin' && (
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <h3 style={{ color: 'white', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="fa-solid fa-users-gear"></i> User Directory &amp; Access Levels (RBAC)
                            </h3>
                            <p style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '20px' }}>
                                Manage user profiles and roles. Role demotions of your active account are locked to prevent accidental lockout.
                            </p>

                            {/* Add New User Form */}
                            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px', marginBottom: '30px' }}>
                                <h4 style={{ color: '#c0c0c0', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                                    <i className="fa-solid fa-user-plus" style={{ color: '#00c97f' }}></i> Add New User Account
                                </h4>

                                {/* Role selector */}
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setNewUserRole("content_manager")}
                                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${newUserRole === 'content_manager' ? '#00c97f' : 'rgba(255,255,255,0.1)'}`, background: newUserRole === 'content_manager' ? 'rgba(0,201,127,0.12)' : 'transparent', color: newUserRole === 'content_manager' ? '#00c97f' : '#a0a0a0', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                                    >
                                        <i className="fa-solid fa-user-pen" style={{ marginRight: '6px' }}></i>Content Manager
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNewUserRole("super_admin")}
                                        style={{ flex: 1, padding: '8px', borderRadius: '8px', border: `1px solid ${newUserRole === 'super_admin' ? '#4285F4' : 'rgba(255,255,255,0.1)'}`, background: newUserRole === 'super_admin' ? 'rgba(66,133,244,0.12)' : 'transparent', color: newUserRole === 'super_admin' ? '#4285F4' : '#a0a0a0', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                                    >
                                        <i className="fa-solid fa-shield-halved" style={{ marginRight: '6px' }}></i>Super Admin
                                    </button>
                                </div>

                                <form onSubmit={handleCreateUser}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px' }}>Full Name *</label>
                                            <input
                                                type="text"
                                                value={newUserFullName}
                                                onChange={e => setNewUserFullName(e.target.value)}
                                                placeholder="e.g. Jane Smith"
                                                required
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                        {newUserRole === 'content_manager' ? (
                                            <div>
                                                <label style={{ display: 'block', color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px' }}>Username *</label>
                                                <input
                                                    type="text"
                                                    value={newUserUsername}
                                                    onChange={e => setNewUserUsername(e.target.value)}
                                                    placeholder="e.g. jane_editor"
                                                    required
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <label style={{ display: 'block', color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px' }}>Email Address *</label>
                                                <input
                                                    type="email"
                                                    value={newUserEmail}
                                                    onChange={e => setNewUserEmail(e.target.value)}
                                                    placeholder="e.g. admin@example.com"
                                                    required
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {newUserRole === 'content_manager' && (
                                        <div style={{ marginBottom: '12px' }}>
                                            <label style={{ display: 'block', color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px' }}>Password *</label>
                                            <input
                                                type="password"
                                                value={newUserPassword}
                                                onChange={e => setNewUserPassword(e.target.value)}
                                                placeholder="Minimum 6 characters"
                                                minLength={6}
                                                required
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                                            />
                                        </div>
                                    )}

                                    {newUserRole === 'super_admin' && (
                                        <p style={{ color: '#f0a500', fontSize: '0.8rem', marginBottom: '12px', padding: '8px 12px', background: 'rgba(240,165,0,0.08)', borderRadius: '6px', border: '1px solid rgba(240,165,0,0.15)' }}>
                                            <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                                            A password-reset invitation email will be sent to this address. They must sign in via Firebase Auth.
                                        </p>
                                    )}

                                    <button type="submit" className="submit-btn" style={{ padding: '10px 20px', borderRadius: '8px', background: newUserRole === 'content_manager' ? '#00c97f' : 'var(--color-primary, #4285F4)', fontWeight: '600', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                        <i className="fa-solid fa-user-plus"></i>
                                        {newUserRole === 'content_manager' ? 'Create Content Manager' : 'Send Admin Invite'}
                                    </button>
                                </form>

                                {newUserStatus && (
                                    <p style={{ marginTop: '12px', color: newUserStatus.startsWith('Error') ? '#EA4335' : '#00c97f', fontSize: '0.875rem', padding: '8px 12px', background: newUserStatus.startsWith('Error') ? 'rgba(234,67,53,0.08)' : 'rgba(0,201,127,0.08)', borderRadius: '6px', border: `1px solid ${newUserStatus.startsWith('Error') ? 'rgba(234,67,53,0.2)' : 'rgba(0,201,127,0.2)'}` }}>
                                        {newUserStatus}
                                    </p>
                                )}
                            </div>

                            {/* Existing Users Table */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#c0c0c0' }}>
                                            <th style={{ padding: '15px' }}>Name</th>
                                            <th style={{ padding: '15px' }}>Identifier</th>
                                            <th style={{ padding: '15px' }}>Role Profile</th>
                                            <th style={{ padding: '15px' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersList.map((usr) => (
                                            <tr key={usr.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                <td style={{ padding: '12px 15px', fontWeight: '500' }}>{usr.fullName || usr.name || '—'}</td>
                                                <td style={{ padding: '12px 15px', color: usr.username ? '#00c97f' : '#4285F4', fontSize: '0.875rem' }}>
                                                    {usr.username ? <><i className="fa-solid fa-user" style={{ marginRight: '5px', fontSize: '0.75rem' }}></i>{usr.username}</> : <><i className="fa-solid fa-envelope" style={{ marginRight: '5px', fontSize: '0.75rem' }}></i>{usr.email}</>}
                                                </td>
                                                <td style={{ padding: '12px 15px' }}>
                                                    <select
                                                        value={usr.role || 'content_manager'}
                                                        onChange={(e) => updateUserRole(usr.id, e.target.value)}
                                                        disabled={usr.id === auth.currentUser?.uid}
                                                        style={{
                                                            padding: '6px 10px',
                                                            borderRadius: '6px',
                                                            background: usr.id === auth.currentUser?.uid ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                                                            color: usr.id === auth.currentUser?.uid ? '#888' : 'white',
                                                            border: '1px solid rgba(255,255,255,0.15)',
                                                            cursor: usr.id === auth.currentUser?.uid ? 'not-allowed' : 'pointer'
                                                        }}
                                                    >
                                                        <option value="super_admin">Super Admin</option>
                                                        <option value="content_manager">Content Manager</option>
                                                    </select>
                                                    {usr.id === auth.currentUser?.uid && <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#a0a0a0' }}>(Active Session Lock)</span>}
                                                </td>
                                                <td style={{ padding: '12px 15px' }}>
                                                    {/* Only show reset for local (username/password) content managers */}
                                                    {usr.type === 'local' && usr.role === 'content_manager' && (
                                                        resetTargetId === usr.id ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                <input
                                                                    type="password"
                                                                    value={resetPasswordValue}
                                                                    onChange={e => setResetPasswordValue(e.target.value)}
                                                                    placeholder="New password (min 6)"
                                                                    style={{ padding: '6px 10px', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: '0.8rem' }}
                                                                />
                                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                                    <button onClick={() => handleAdminResetPassword(usr.id)} className="submit-btn" style={{ flex: 1, padding: '5px 8px', fontSize: '0.78rem', borderRadius: '6px', background: '#00c97f' }}>Save</button>
                                                                    <button onClick={() => { setResetTargetId(''); setResetPasswordValue(''); setResetPasswordStatus(''); }} className="submit-btn" style={{ flex: 1, padding: '5px 8px', fontSize: '0.78rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                                                                </div>
                                                                {resetPasswordStatus && <span style={{ fontSize: '0.75rem', color: resetPasswordStatus.startsWith('Error') ? '#EA4335' : '#00c97f' }}>{resetPasswordStatus}</span>}
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => { setResetTargetId(usr.id); setResetPasswordStatus(''); }} className="submit-btn" style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '6px', background: 'rgba(255,165,0,0.15)', border: '1px solid rgba(255,165,0,0.3)', color: '#f0a500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                <i className="fa-solid fa-key"></i> Reset Password
                                                            </button>
                                                        )
                                                    )}
                                                    {(usr.type !== 'local') && <span style={{ color: '#666', fontSize: '0.78rem' }}>Firebase Auth</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        )}

                        {/* Settings save block */}

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
                </div>
            )}

            {/* Slide-in Premium Toast Notification */}
            <div
                style={{
                    position: "fixed",
                    top: "30px",
                    right: "30px",
                    zIndex: 9999,
                    background: toast.type === "error" ? "rgba(234, 67, 53, 0.15)" : "rgba(0, 255, 136, 0.15)",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${toast.type === "error" ? "rgba(234, 67, 53, 0.3)" : "rgba(0, 255, 136, 0.3)"}`,
                    color: toast.type === "error" ? "#EA4335" : "#00ff88",
                    padding: "16px 24px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    transform: toast.show ? "translateX(0)" : "translateX(120%)",
                    opacity: toast.show ? 1 : 0,
                    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    pointerEvents: toast.show ? "auto" : "none"
                }}
            >
                <i className={`fa-solid ${toast.type === "error" ? "fa-circle-exclamation" : "fa-circle-check"}`} style={{ fontSize: "1.2rem" }}></i>
                <span style={{ fontWeight: "500", fontSize: "0.95rem" }}>{toast.message}</span>
            </div>
        </div>
    );
}
