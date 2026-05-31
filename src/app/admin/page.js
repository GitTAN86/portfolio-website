"use client";
import React, { useState, useEffect, useRef } from "react";
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
    addDoc,
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

// Comprehensive list of all countries supported by the WorldMapSVG component
const SUPPORTED_COUNTRIES = [
    { code: "af", name: "Afghanistan" },
    { code: "al", name: "Albania" },
    { code: "dz", name: "Algeria" },
    { code: "ao", name: "Angola" },
    { code: "ar", name: "Argentina" },
    { code: "am", name: "Armenia" },
    { code: "au", name: "Australia" },
    { code: "at", name: "Austria" },
    { code: "az", name: "Azerbaijan" },
    { code: "bs", name: "Bahamas" },
    { code: "bd", name: "Bangladesh" },
    { code: "by", name: "Belarus" },
    { code: "be", name: "Belgium" },
    { code: "bz", name: "Belize" },
    { code: "bj", name: "Benin" },
    { code: "bt", name: "Bhutan" },
    { code: "bo", name: "Bolivia" },
    { code: "ba", name: "Bosnia and Herzegovina" },
    { code: "bw", name: "Botswana" },
    { code: "br", name: "Brazil" },
    { code: "bn", name: "Brunei" },
    { code: "bg", name: "Bulgaria" },
    { code: "bf", name: "Burkina Faso" },
    { code: "bi", name: "Burundi" },
    { code: "kh", name: "Cambodia" },
    { code: "cm", name: "Cameroon" },
    { code: "ca", name: "Canada" },
    { code: "cv", name: "Cape Verde" },
    { code: "cf", name: "Central African Republic" },
    { code: "td", name: "Chad" },
    { code: "cl", name: "Chile" },
    { code: "cn", name: "China" },
    { code: "co", name: "Colombia" },
    { code: "km", name: "Comoros" },
    { code: "cr", name: "Costa Rica" },
    { code: "hr", name: "Croatia" },
    { code: "cu", name: "Cuba" },
    { code: "cy", name: "Cyprus" },
    { code: "cz", name: "Czech Republic" },
    { code: "cd", name: "Democratic Republic of the Congo" },
    { code: "dk", name: "Denmark" },
    { code: "dj", name: "Djibouti" },
    { code: "dm", name: "Dominica" },
    { code: "do", name: "Dominican Republic" },
    { code: "ec", name: "Ecuador" },
    { code: "eg", name: "Egypt" },
    { code: "sv", name: "El Salvador" },
    { code: "gq", name: "Equatorial Guinea" },
    { code: "er", name: "Eritrea" },
    { code: "ee", name: "Estonia" },
    { code: "sz", name: "Eswatini" },
    { code: "et", name: "Ethiopia" },
    { code: "fk", name: "Falkland Islands" },
    { code: "fi", name: "Finland" },
    { code: "fr", name: "France" },
    { code: "ga", name: "Gabon" },
    { code: "gm", name: "Gambia" },
    { code: "ge", name: "Georgia" },
    { code: "de", name: "Germany" },
    { code: "gh", name: "Ghana" },
    { code: "gr", name: "Greece" },
    { code: "gl", name: "Greenland" },
    { code: "gt", name: "Guatemala" },
    { code: "gn", name: "Guinea" },
    { code: "gw", name: "Guinea-Bissau" },
    { code: "gy", name: "Guyana" },
    { code: "ht", name: "Haiti" },
    { code: "hn", name: "Honduras" },
    { code: "hu", name: "Hungary" },
    { code: "is", name: "Iceland" },
    { code: "in", name: "India" },
    { code: "id", name: "Indonesia" },
    { code: "ir", name: "Iran" },
    { code: "iq", name: "Iraq" },
    { code: "ie", name: "Ireland" },
    { code: "il", name: "Israel" },
    { code: "it", name: "Italy" },
    { code: "ci", name: "Ivory Coast" },
    { code: "jm", name: "Jamaica" },
    { code: "jp", name: "Japan" },
    { code: "jo", name: "Jordan" },
    { code: "kz", name: "Kazakhstan" },
    { code: "ke", name: "Kenya" },
    { code: "kw", name: "Kuwait" },
    { code: "kg", name: "Kyrgyzstan" },
    { code: "la", name: "Laos" },
    { code: "lv", name: "Latvia" },
    { code: "lb", name: "Lebanon" },
    { code: "ls", name: "Lesotho" },
    { code: "lr", name: "Liberia" },
    { code: "ly", name: "Libya" },
    { code: "lt", name: "Lithuania" },
    { code: "lu", name: "Luxembourg" },
    { code: "mg", name: "Madagascar" },
    { code: "mw", name: "Malawi" },
    { code: "my", name: "Malaysia" },
    { code: "mv", name: "Maldives" },
    { code: "ml", name: "Mali" },
    { code: "mt", name: "Malta" },
    { code: "mr", name: "Mauritania" },
    { code: "mu", name: "Mauritius" },
    { code: "mx", name: "Mexico" },
    { code: "md", name: "Moldova" },
    { code: "mn", name: "Mongolia" },
    { code: "me", name: "Montenegro" },
    { code: "ma", name: "Morocco" },
    { code: "mz", name: "Mozambique" },
    { code: "mm", name: "Myanmar" },
    { code: "na", name: "Namibia" },
    { code: "np", name: "Nepal" },
    { code: "nl", name: "Netherlands" },
    { code: "nc", name: "New Caledonia" },
    { code: "nz", name: "New Zealand" },
    { code: "ni", name: "Nicaragua" },
    { code: "ne", name: "Niger" },
    { code: "ng", name: "Nigeria" },
    { code: "kp", name: "North Korea" },
    { code: "mk", name: "North Macedonia" },
    { code: "no", name: "Norway" },
    { code: "om", name: "Oman" },
    { code: "pk", name: "Pakistan" },
    { code: "pa", name: "Panama" },
    { code: "pg", name: "Papua New Guinea" },
    { code: "py", name: "Paraguay" },
    { code: "pe", name: "Peru" },
    { code: "ph", name: "Philippines" },
    { code: "pl", name: "Poland" },
    { code: "pt", name: "Portugal" },
    { code: "pr", name: "Puerto Rico" },
    { code: "qa", name: "Qatar" },
    { code: "cg", name: "Republic of the Congo" },
    { code: "ro", name: "Romania" },
    { code: "ru", name: "Russia" },
    { code: "rw", name: "Rwanda" },
    { code: "lc", name: "Saint Lucia" },
    { code: "vc", name: "Saint Vincent and the Grenadines" },
    { code: "st", name: "São Tomé and Príncipe" },
    { code: "sa", name: "Saudi Arabia" },
    { code: "sn", name: "Senegal" },
    { code: "rs", name: "Serbia" },
    { code: "sc", name: "Seychelles" },
    { code: "sl", name: "Sierra Leone" },
    { code: "sg", name: "Singapore" },
    { code: "sk", name: "Slovakia" },
    { code: "si", name: "Slovenia" },
    { code: "sb", name: "Solomon Islands" },
    { code: "so", name: "Somalia" },
    { code: "_somaliland", name: "Somaliland" },
    { code: "za", name: "South Africa" },
    { code: "kr", name: "South Korea" },
    { code: "ss", name: "South Sudan" },
    { code: "es", name: "Spain" },
    { code: "lk", name: "Sri Lanka" },
    { code: "sd", name: "Sudan" },
    { code: "sr", name: "Suriname" },
    { code: "se", name: "Sweden" },
    { code: "ch", name: "Switzerland" },
    { code: "sy", name: "Syria" },
    { code: "tw", name: "Taiwan" },
    { code: "tj", name: "Tajikistan" },
    { code: "tz", name: "Tanzania" },
    { code: "th", name: "Thailand" },
    { code: "tg", name: "Togo" },
    { code: "tt", name: "Trinidad and Tobago" },
    { code: "tn", name: "Tunisia" },
    { code: "tr", name: "Turkey" },
    { code: "tm", name: "Turkmenistan" },
    { code: "ua", name: "Ukraine" },
    { code: "ae", name: "United Arab Emirates" },
    { code: "gb", name: "United Kingdom" },
    { code: "us", name: "United States" },
    { code: "uy", name: "Uruguay" },
    { code: "uz", name: "Uzbekistan" },
    { code: "vu", name: "Vanuatu" },
    { code: "ve", name: "Venezuela" },
    { code: "vn", name: "Vietnam" },
    { code: "ye", name: "Yemen" },
    { code: "zm", name: "Zambia" },
    { code: "zw", name: "Zimbabwe" }
];

// Dynamic Themes Defaults
const DEFAULT_THEMES = {
    theme1: { bg: "#F9F9FB", text: "#202124", textMuted: "#5f6368", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" },
    theme2: { bg: "#D4DFEB", text: "#202124", textMuted: "#5f6368", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" },
    theme3: { bg: "#2C3E50", text: "#F9F9FB", textMuted: "#B0BEC5", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" },
    theme4: { bg: "#05050A", text: "#ffffff", textMuted: "#a0a0a0", primary: "#4285F4", secondary: "#EA4335", tertiary: "#b100ff" }
};

// Default permissions granted to new Content Manager accounts
const DEFAULT_CM_PERMISSIONS = {
    // Tabs
    tabContent: true,
    tabMedia: true,
    tabSettings: true,
    // Content sub-sections
    contentHero: true,
    contentAbout: true,
    contentAboutSlides: true,
    contentContact: true,
    contentSkills: true,
    contentExperience: true,
    // Media sub-sections
    mediaProfile: true,
    mediaCV: true,
    mediaGallery: true,
    // Settings sub-sections
    settingVisibility: true,
    settingThemes: true,
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
    const [heroTagline, setHeroTagline] = useState({ en: "", fa: "", de: "", ms: "" });
    const [heroHeadline, setHeroHeadline] = useState({ en: "", fa: "", de: "", ms: "" });
    const [aboutText, setAboutText] = useState({ en: "", fa: "", de: "", ms: "" });
    const [linkedin, setLinkedin] = useState("");
    const [emailLink, setEmailLink] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [gallery, setGallery] = useState([]);
    const [cvUrl, setCvUrl] = useState("");

    const [skills, setSkills] = useState([]);
    const [experience, setExperience] = useState([]);
    const [aboutSlides, setAboutSlides] = useState([]);
    const [nationality, setNationality] = useState("ir");

    // Multilingual & AI State
    const [adminLocale, setAdminLocale] = useState("en");
    const [geminiApiKey, setGeminiApiKey] = useState("");
    const [translatingField, setTranslatingField] = useState(null);
    const [copilotOpen, setCopilotOpen] = useState(false);
    const [copilotField, setCopilotField] = useState(null);
    const [copilotPrompt, setCopilotPrompt] = useState("");
    const [copilotLoading, setCopilotLoading] = useState(false);
    const [copilotResult, setCopilotResult] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            setGeminiApiKey(localStorage.getItem("gemini_api_key") || "");
        }
    }, []);

    // Helper functions for localized map validation and backwards compatibility
    const parseLocalized = (field, defaultObj) => {
        if (!field) return defaultObj;
        if (typeof field === "string") {
            return {
                en: field,
                fa: field,
                de: field,
                ms: field
            };
        }
        return {
            en: field.en || defaultObj.en || "",
            fa: field.fa || field.en || defaultObj.fa || "",
            de: field.de || field.en || defaultObj.de || "",
            ms: field.ms || field.en || defaultObj.ms || ""
        };
    };

    const parseSkills = (arr, defaultSkills = []) => {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.map((item, idx) => {
            const defItem = defaultSkills[idx] || {};
            return {
                title: parseLocalized(item.title, defItem.title || { en: "" }),
                description: parseLocalized(item.description, defItem.description || { en: "" }),
                icon: item.icon || defItem.icon || "fa-solid fa-star"
            };
        });
    };

    const parseExperience = (arr, defaultExp = []) => {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.map((item, idx) => {
            const defItem = defaultExp[idx] || {};
            return {
                title: parseLocalized(item.title, defItem.title || { en: "" }),
                company: parseLocalized(item.company, defItem.company || { en: "" }),
                date: item.date || defItem.date || "",
                bullets: Array.isArray(item.bullets)
                    ? item.bullets.map(b => parseLocalized(b, { en: "" }))
                    : (defItem.bullets || [])
            };
        });
    };

    const parseAboutSlides = (arr) => {
        if (!arr || !Array.isArray(arr)) return [];
        return arr.map(slide => ({
            image: slide.image || "",
            title: parseLocalized(slide.title, { en: "" }),
            text: parseLocalized(slide.text, { en: "" })
        }));
    };

    // Client-side Gemini content generation engine
    const callGemini = async (prompt) => {
        const apiKey = geminiApiKey || (typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") : null);
        if (!apiKey) {
            showToast("Gemini API Key is missing. Please add it under the Settings tab first!", "error");
            throw new Error("Missing Gemini API Key");
        }
        
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Gemini API error data:", errorData);
                throw new Error(errorData.error?.message || "Failed to contact Gemini API");
            }
            
            const data = await response.json();
            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!replyText) {
                throw new Error("No response content generated from Gemini model.");
            }
            return replyText;
        } catch (error) {
            console.error("Gemini call error:", error);
            showToast("Gemini error: " + error.message, "error");
            throw error;
        }
    };

    const handleAutoTranslate = async (fieldName, englishText, setFieldState) => {
        if (!englishText || englishText.trim() === "") {
            showToast("Please enter the English version of the text first!", "error");
            return;
        }
        setTranslatingField(fieldName);
        try {
            const prompt = `You are an expert translator. Translate the following English portfolio text into three languages: Farsi (Persian), German, and Bahasa Melayu (Malay).
If the text contains HTML tags (like <p>, <strong>, etc.), preserve them exactly in all translations.
Provide your output ONLY as a valid JSON object matching the format below, with NO markdown formatting, NO backticks, and NO additional text.

Format:
{
  "fa": "translated text in Farsi",
  "de": "translated text in German",
  "ms": "translated text in Bahasa Melayu"
}

English text to translate:
${englishText}`;

            const responseText = await callGemini(prompt);
            const cleanJsonText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
            const translations = JSON.parse(cleanJsonText);
            
            if (translations.fa && translations.de && translations.ms) {
                setFieldState(prev => {
                    const currentObj = typeof prev === 'object' ? prev : { en: prev };
                    return {
                        ...currentObj,
                        en: englishText,
                        fa: translations.fa,
                        de: translations.de,
                        ms: translations.ms
                    };
                });
                showToast("✨ Translated successfully to all languages!", "success");
            } else {
                throw new Error("Translation payload did not return all language keys.");
            }
        } catch (error) {
            console.error("Auto translation error:", error);
            showToast("Translation failed. Make sure your API key is valid and prompt text is clean.", "error");
        } finally {
            setTranslatingField(null);
        }
    };

    const handleRunCopilot = async (presetType) => {
        setCopilotLoading(true);
        setCopilotResult("");
        try {
            let promptInstruction = "";
            let baseText = "";
            
            if (copilotField === 'heroTagline') {
                baseText = heroTagline[adminLocale] || "";
            } else if (copilotField === 'heroHeadline') {
                baseText = heroHeadline[adminLocale] || "";
            } else if (copilotField === 'aboutText') {
                baseText = aboutText[adminLocale] || "";
            } else if (copilotField && copilotField.type === 'skill') {
                const s = skills[copilotField.index];
                if (s) {
                    baseText = typeof s[copilotField.field] === 'object' ? (s[copilotField.field][adminLocale] || "") : (s[copilotField.field] || "");
                }
            } else if (copilotField && copilotField.type === 'experience') {
                const exp = experience[copilotField.index];
                if (exp) {
                    if (copilotField.field === 'bullets') {
                        const bList = exp.bullets || [];
                        baseText = bList.map(b => typeof b === 'object' ? (b[adminLocale] || "") : b).join('\n');
                    } else {
                        baseText = typeof exp[copilotField.field] === 'object' ? (exp[copilotField.field][adminLocale] || "") : (exp[copilotField.field] || "");
                    }
                }
            } else if (copilotField && copilotField.type === 'aboutSlide') {
                const sl = aboutSlides[copilotField.index];
                if (sl) {
                    baseText = typeof sl[copilotField.field] === 'object' ? (sl[copilotField.field][adminLocale] || "") : (sl[copilotField.field] || "");
                }
            }
            
            if (presetType === 'professional') {
                promptInstruction = `Rewrite the following text to sound highly professional, elegant, and executive. Enhance the readability, correct any grammatical errors, and make it sound like a premium world-class tech leader profile description. Return ONLY the rewritten text with no introductions or conversational replies.
Original text:
${baseText}`;
            } else if (presetType === 'agile') {
                promptInstruction = `Rewrite the following text to strongly emphasize Agile management, engineering leadership, scalability, high metrics, team empowerment, and cross-functional operational excellence. Keep it action-oriented and results-driven. Return ONLY the rewritten text with no introductions or conversational replies.
Original text:
${baseText}`;
            } else if (presetType === 'shorten') {
                promptInstruction = `Condense and shorten the following text by about 50%. Keep only the high-impact statements and make it extremely concise for quick executive scanning. Return ONLY the rewritten text with no introductions or conversational replies.
Original text:
${baseText}`;
            } else {
                promptInstruction = `Context Text to edit:
${baseText}

Instructions for the edit:
${copilotPrompt}

Please edit the context text according to the instructions. Ensure you keep the output tone premium, polished, and natural. Return ONLY the revised result text with no introductory phrases or chat explanations.`;
            }
            
            const result = await callGemini(promptInstruction);
            setCopilotResult(result.trim());
        } catch (error) {
            console.error("Copilot error:", error);
        } finally {
            setCopilotLoading(false);
        }
    };

    const handleApplyCopilotResult = () => {
        if (!copilotResult) return;
        
        if (copilotField === 'heroTagline') {
            setHeroTagline(prev => ({ ...prev, [adminLocale]: copilotResult }));
        } else if (copilotField === 'heroHeadline') {
            setHeroHeadline(prev => ({ ...prev, [adminLocale]: copilotResult }));
        } else if (copilotField === 'aboutText') {
            setAboutText(prev => ({ ...prev, [adminLocale]: copilotResult }));
        } else if (copilotField && copilotField.type === 'skill') {
            updateSkill(copilotField.index, copilotField.field, copilotResult);
        } else if (copilotField && copilotField.type === 'experience') {
            if (copilotField.field === 'bullets') {
                const escapedBullets = copilotResult.split('\n').join('\\n');
                updateExperience(copilotField.index, 'bullets', escapedBullets);
            } else {
                updateExperience(copilotField.index, copilotField.field, copilotResult);
            }
        } else if (copilotField && copilotField.type === 'aboutSlide') {
            updateAboutSlide(copilotField.index, copilotField.field, copilotResult);
        }
        
        showToast("✨ Applied AI revisions successfully!", "success");
        setCopilotOpen(false);
    };

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

    // Per-user permissions
    const [userPermissions, setUserPermissions] = useState(DEFAULT_CM_PERMISSIONS);
    const [newUserPermissions, setNewUserPermissions] = useState({ ...DEFAULT_CM_PERMISSIONS });

    // Inline permissions editor state (in RBAC table)
    const [editingPermissionsId, setEditingPermissionsId] = useState("");
    const [editingPermissions, setEditingPermissions] = useState({ ...DEFAULT_CM_PERMISSIONS });

    // Collapsible sections — key: sectionId, value: true = collapsed
    const [collapsedSections, setCollapsedSections] = useState({});
    const toggleSection = (key) => setCollapsedSections(p => ({ ...p, [key]: !p[key] }));

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

    // Biography Typography state
    const [aboutFontFamily, setAboutFontFamily] = useState("'Space Grotesk', sans-serif");
    const [aboutTextAlign, setAboutTextAlign] = useState("justify");

    // Hero Typography state
    const [heroFontFamily, setHeroFontFamily] = useState("'Space Grotesk', sans-serif");
    const [heroTextAlign, setHeroTextAlign] = useState("center");

    // Skills Typography state
    const [skillsFontFamily, setSkillsFontFamily] = useState("'Outfit', sans-serif");
    const [skillsTextAlign, setSkillsTextAlign] = useState("justify");

    // Experience Typography state
    const [experienceFontFamily, setExperienceFontFamily] = useState("'Outfit', sans-serif");
    const [experienceTextAlign, setExperienceTextAlign] = useState("justify");

    // Dynamic Themes state
    const [themes, setThemes] = useState(DEFAULT_THEMES);
    const [overrideTheme, setOverrideTheme] = useState("dynamic");

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

    // Change Log State
    const [changelog, setChangelog] = useState([]);
    const [changelogLoading, setChangelogLoading] = useState(false);
    const [undoingId, setUndoingId] = useState(null);

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
                setUserPermissions({ ...DEFAULT_CM_PERMISSIONS, ...(sessionData.permissions || {}) });
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
                setUserPermissions({ ...DEFAULT_CM_PERMISSIONS, ...(userData.permissions || {}) });
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
                    permissions: newUserPermissions,
                    createdAt: new Date().toISOString()
                });
                setNewUserStatus("✓ Content Manager account created successfully!");
                showToast("New Content Manager created!", "success");
                setNewUserFullName(""); setNewUserUsername(""); setNewUserPassword("");
                setNewUserPermissions({ ...DEFAULT_CM_PERMISSIONS }); // reset permissions picker
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

    // --- Super Admin: Save edited permissions for a Content Manager ---
    const handleSavePermissions = async (targetId) => {
        if (!db) return;
        try {
            await setDoc(doc(db, "users", targetId), { permissions: editingPermissions }, { merge: true });
            showToast("Permissions updated!", "success");
            setEditingPermissionsId("");
            loadUsersDirectory();
        } catch (err) {
            console.error("Save permissions error", err);
            showToast("Failed to update permissions.", "error");
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
                setHeroTagline(parseLocalized(data.heroTagline, { en: "", fa: "", de: "", ms: "" }));
                setHeroHeadline(parseLocalized(data.heroHeadline, { en: "", fa: "", de: "", ms: "" }));
                setAboutText(parseLocalized(data.aboutText, { en: "", fa: "", de: "", ms: "" }));
                setLinkedin(data.linkedin || "");
                setEmailLink(data.email || "");
                setWhatsapp(data.whatsapp || "");
                setSkills(parseSkills(data.skills));
                setExperience(parseExperience(data.experience));
                setAboutSlides(parseAboutSlides(data.aboutSlides));
                setProfileImage(data.profileImage || "");
                setGallery(data.gallery || []);
                setCvUrl(data.cvUrl || "");
                setNationality(data.nationality || "ir");
                setOverrideTheme(data.overrideTheme || "dynamic");
                setAboutFontFamily(data.aboutFontFamily || "'Space Grotesk', sans-serif");
                setAboutTextAlign(data.aboutTextAlign || "justify");
                setHeroFontFamily(data.heroFontFamily || "'Space Grotesk', sans-serif");
                setHeroTextAlign(data.heroTextAlign || "center");
                setSkillsFontFamily(data.skillsFontFamily || "'Outfit', sans-serif");
                setSkillsTextAlign(data.skillsTextAlign || "left");
                setExperienceFontFamily(data.experienceFontFamily || "'Outfit', sans-serif");
                setExperienceTextAlign(data.experienceTextAlign || "left");

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

    const recordChange = async (action, newPayload) => {
        if (!db) return;
        try {
            // 1. Get the current live snapshot to compute the diff
            let oldData = null;
            const mainRef = doc(db, "content", "main");
            const mainSnap = await getDoc(mainRef);
            if (mainSnap.exists()) {
                oldData = mainSnap.data();
            }

            // 2. Compute diff
            const changes = [];
            if (!oldData) {
                changes.push("Initial creation");
            } else {
                const keys = new Set([...Object.keys(oldData), ...Object.keys(newPayload)]);
                for (const key of keys) {
                    if (key === "timestamp") continue;
                    if (JSON.stringify(oldData[key]) !== JSON.stringify(newPayload[key])) {
                        changes.push(key);
                    }
                }
            }

            if (changes.length === 0) {
                changes.push("No metadata fields changed");
            }

            // 3. Write to changelog collection
            const userIdentifier = currentUserDoc ? (currentUserDoc.email || currentUserDoc.username || user?.email || "Unknown User") : (user?.email || "Unknown User");
            const userName = currentUserDoc ? (currentUserDoc.name || currentUserDoc.fullName || "Admin") : "Admin";

            await addDoc(collection(db, "changelog"), {
                action,
                performedBy: {
                    uid: user?.uid || "unknown",
                    name: userName,
                    email: userIdentifier
                },
                timestamp: Timestamp.now(),
                changes,
                snapshot: newPayload
            });

            // Reload the changelog if we are on the reports tab
            if (activeTab === "reports") {
                loadChangelog();
            }
        } catch (e) {
            console.error("Failed to record change log:", e);
        }
    };

    const loadChangelog = async () => {
        if (!db) return;
        setChangelogLoading(true);
        try {
            const q = query(
                collection(db, "changelog"),
                orderBy("timestamp", "desc"),
                limit(50)
            );
            const querySnapshot = await getDocs(q);
            const logs = [];
            querySnapshot.forEach((doc) => {
                logs.push({ id: doc.id, ...doc.data() });
            });
            setChangelog(logs);
        } catch (e) {
            console.error("Error loading changelog:", e);
            showToast("Failed to load change log history.", "error");
        } finally {
            setChangelogLoading(false);
        }
    };

    const handleUndo = async (entry) => {
        if (!db) return;
        if (userRole !== "super_admin") {
            alert("Permission Denied: Only Super Admins can undo changes.");
            return;
        }
        if (!entry.snapshot) {
            alert("Cannot undo: Snapshot data is missing in this log entry.");
            return;
        }

        const confirmUndo = window.confirm(
            `Are you sure you want to undo changes from ${new Date(entry.timestamp.seconds * 1000).toLocaleString()} by ${entry.performedBy.name}? This will restore all content to that point in time.`
        );
        if (!confirmUndo) return;

        setUndoingId(entry.id);
        setCmsStatus("Undoing changes...");
        try {
            const snapshot = entry.snapshot;

            // 1. Write the snapshot to 'main' and 'main_draft'
            await setDoc(doc(db, "content", "main"), snapshot);
            await setDoc(doc(db, "content", "main_draft"), snapshot);

            // 2. Load the restored data into local React state
            setHeroName(snapshot.heroName || "");
            setHeroTagline(parseLocalized(snapshot.heroTagline, { en: "", fa: "", de: "", ms: "" }));
            setHeroHeadline(parseLocalized(snapshot.heroHeadline, { en: "", fa: "", de: "", ms: "" }));
            setAboutText(parseLocalized(snapshot.aboutText, { en: "", fa: "", de: "", ms: "" }));
            setLinkedin(snapshot.linkedin || "");
            setEmailLink(snapshot.email || "");
            setWhatsapp(snapshot.whatsapp || "");
            setSkills(parseSkills(snapshot.skills));
            setExperience(parseExperience(snapshot.experience));
            setAboutSlides(parseAboutSlides(snapshot.aboutSlides));
            setProfileImage(snapshot.profileImage || "");
            setGallery(snapshot.gallery || []);
            setCvUrl(snapshot.cvUrl || "");
            setNationality(snapshot.nationality || "ir");
            setOverrideTheme(snapshot.overrideTheme || "dynamic");
            setAboutFontFamily(snapshot.aboutFontFamily || "'Space Grotesk', sans-serif");
            setAboutTextAlign(snapshot.aboutTextAlign || "justify");
            setHeroFontFamily(snapshot.heroFontFamily || "'Space Grotesk', sans-serif");
            setHeroTextAlign(snapshot.heroTextAlign || "center");
            setSkillsFontFamily(snapshot.skillsFontFamily || "'Outfit', sans-serif");
            setSkillsTextAlign(snapshot.skillsTextAlign || "left");
            setExperienceFontFamily(snapshot.experienceFontFamily || "'Outfit', sans-serif");
            setExperienceTextAlign(snapshot.experienceTextAlign || "left");

            if (snapshot.sectionVisibility) {
                setSectionVisibility({
                    hero: snapshot.sectionVisibility.hero !== false,
                    heroWordCloud: snapshot.sectionVisibility.heroWordCloud !== false,
                    heroMap: snapshot.sectionVisibility.heroMap !== false,
                    about: snapshot.sectionVisibility.about !== false,
                    aboutCarousel: snapshot.sectionVisibility.aboutCarousel !== false,
                    aboutTextPanel: snapshot.sectionVisibility.aboutTextPanel !== false,
                    skills: snapshot.sectionVisibility.skills !== false,
                    skillsGrid: snapshot.sectionVisibility.skillsGrid !== false,
                    experience: snapshot.sectionVisibility.experience !== false,
                    experienceTimeline: snapshot.sectionVisibility.experienceTimeline !== false,
                });
            }

            if (snapshot.securitySettings) {
                setCaptchaEnabled(snapshot.securitySettings.captchaEnabled !== false);
            }

            if (snapshot.themes) {
                setThemes({
                    theme1: { ...DEFAULT_THEMES.theme1, ...snapshot.themes.theme1 },
                    theme2: { ...DEFAULT_THEMES.theme2, ...snapshot.themes.theme2 },
                    theme3: { ...DEFAULT_THEMES.theme3, ...snapshot.themes.theme3 },
                    theme4: { ...DEFAULT_THEMES.theme4, ...snapshot.themes.theme4 },
                });
            }

            // 3. Record the undo action in the changelog
            const userIdentifier = currentUserDoc ? (currentUserDoc.email || currentUserDoc.username || user?.email || "Unknown User") : (user?.email || "Unknown User");
            const userName = currentUserDoc ? (currentUserDoc.name || currentUserDoc.fullName || "Admin") : "Admin";

            await addDoc(collection(db, "changelog"), {
                action: "undo",
                performedBy: {
                    uid: user?.uid || "unknown",
                    name: userName,
                    email: userIdentifier
                },
                timestamp: Timestamp.now(),
                changes: [`Restored to snapshot from ${new Date(entry.timestamp.seconds * 1000).toLocaleString()}`],
                snapshot: snapshot
            });

            setCmsStatus("Successfully restored changes!");
            showToast("Successfully restored changes!", "success");

            // Reload the changelog to show the new 'undo' entry
            await loadChangelog();
        } catch (err) {
            console.error("Undo failed:", err);
            setCmsStatus("Error undoing changes.");
            showToast("Failed to undo changes.", "error");
        } finally {
            setUndoingId(null);
        }
    };

    const handleSaveDraft = async (e) => {
        if (e) e.preventDefault();
        setCmsStatus("Saving Draft...");
        try {
            const dataPayload = {
                heroName, heroTagline, heroHeadline, aboutText,
                linkedin, email: emailLink, whatsapp,
                skills, experience, aboutSlides,
                profileImage, gallery, cvUrl,
                nationality,
                sectionVisibility,
                securitySettings: { captchaEnabled },
                themes,
                overrideTheme,
                aboutFontFamily,
                aboutTextAlign,
                heroFontFamily,
                heroTextAlign,
                skillsFontFamily,
                skillsTextAlign,
                experienceFontFamily,
                experienceTextAlign
            };
            await setDoc(doc(db, "content", "main_draft"), dataPayload);
            setCmsStatus("Draft saved successfully! (Not yet live)");
            showToast("Draft saved successfully! (Not yet live)", "success");
            await recordChange("draft_saved", dataPayload);
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
                nationality,
                sectionVisibility,
                securitySettings: { captchaEnabled },
                themes,
                overrideTheme,
                aboutFontFamily,
                aboutTextAlign,
                heroFontFamily,
                heroTextAlign,
                skillsFontFamily,
                skillsTextAlign,
                experienceFontFamily,
                experienceTextAlign
            };
            // Save to active live document
            await setDoc(doc(db, "content", "main"), dataPayload);
            // Sync with draft document as well
            await setDoc(doc(db, "content", "main_draft"), dataPayload);
            setCmsStatus("Published successfully! Changes are now live.");
            showToast("Published successfully! Changes are now live.", "success");
            await recordChange("published", dataPayload);
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

    useEffect(() => {
        if (activeTab === "reports") {
            loadChangelog();
        }
    }, [activeTab]);

    const updateSkill = (index, field, value) => {
        const newSkills = [...skills];
        if (field === 'title' || field === 'description') {
            const currentLocalized = newSkills[index][field] || { en: "", fa: "", de: "", ms: "" };
            newSkills[index][field] = {
                ...currentLocalized,
                [adminLocale]: value
            };
        } else {
            newSkills[index][field] = value;
        }
        setSkills(newSkills);
    };

    const updateExperience = (index, field, value) => {
        const newExp = [...experience];
        if (field === 'title' || field === 'company') {
            const currentLocalized = newExp[index][field] || { en: "", fa: "", de: "", ms: "" };
            newExp[index][field] = {
                ...currentLocalized,
                [adminLocale]: value
            };
        } else if (field === 'bullets') {
            const lines = value.split('\\n');
            const currentBullets = newExp[index].bullets || [];
            const newBullets = lines.map((line, lIdx) => {
                const currentBulletLocalized = parseLocalized(currentBullets[lIdx], { en: "", fa: "", de: "", ms: "" });
                return {
                    ...currentBulletLocalized,
                    [adminLocale]: line
                };
            });
            newExp[index].bullets = newBullets;
        } else {
            newExp[index][field] = value;
        }
        setExperience(newExp);
    };

    const updateAboutSlide = (index, field, value) => {
        const newSlides = [...aboutSlides];
        if (field === 'title' || field === 'text') {
            const currentLocalized = newSlides[index][field] || { en: "", fa: "", de: "", ms: "" };
            newSlides[index][field] = {
                ...currentLocalized,
                [adminLocale]: value
            };
        } else {
            newSlides[index][field] = value;
        }
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
        { id: 'content', icon: 'fa-pen-to-square', label: 'Content', permKey: 'tabContent' },
        { id: 'media', icon: 'fa-image', label: 'Media', permKey: 'tabMedia' },
        { id: 'analytics', icon: 'fa-chart-line', label: 'Traffic', superAdminOnly: true },
        { id: 'reports', icon: 'fa-file-export', label: 'Reports', superAdminOnly: true },
        { id: 'settings', icon: 'fa-gears', label: 'Settings', permKey: 'tabSettings' }
    ];
    const visibleTabs = allTabs.filter(t => {
        if (t.superAdminOnly) return userRole === 'super_admin';
        if (userRole === 'super_admin') return true;
        // For Content Managers, check their per-user permissions
        return t.permKey ? userPermissions[t.permKey] !== false : true;
    });

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

                        {/* Language Selection Bar for Admin Editor */}
                        <div style={{
                            display: 'flex',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '16px',
                            padding: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            backdropFilter: 'blur(10px)',
                            gap: '8px',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                            marginBottom: '10px'
                        }}>
                            {[
                                { code: "en", label: "English", flag: "🇬🇧" },
                                { code: "fa", label: "Farsi / فارسی", flag: "🇮🇷" },
                                { code: "de", label: "German", flag: "🇩🇪" },
                                { code: "ms", label: "Malay / Melayu", flag: "🇲🇾" }
                            ].map((lang) => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => setAdminLocale(lang.code)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 16px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        background: adminLocale === lang.code ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                        color: adminLocale === lang.code ? 'white' : '#a0a0a0',
                                        boxShadow: adminLocale === lang.code ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
                                        border: adminLocale === lang.code ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                                    <span>{lang.label}</span>
                                </button>
                            ))}
                        </div>
                        {/* Hero Section Card */}
                        {(userRole === 'super_admin' || userPermissions.contentHero !== false) && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('heroCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.heroCard ? 0 : '20px' }}>
                                    <h3 style={{ color: 'var(--color-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-rocket"></i> Hero Section
                                    </h3>
                                    <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.heroCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                </div>
                                {!collapsedSections.heroCard && (
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.85rem', margin: 0 }}>Tagline</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="button" onClick={() => handleAutoTranslate('heroTagline', heroTagline.en, setHeroTagline)} disabled={translatingField === 'heroTagline'} className="submit-btn" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px', background: 'rgba(0, 255, 136, 0.12)', border: '1px solid rgba(0, 255, 136, 0.25)', color: '#00ff88' }}>
                                                        {translatingField === 'heroTagline' ? 'Translating...' : '✨ Translate to All'}
                                                    </button>
                                                    <button type="button" onClick={() => { setCopilotField('heroTagline'); setCopilotOpen(true); }} className="submit-btn" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px', background: 'rgba(66, 133, 244, 0.12)', border: '1px solid rgba(66, 133, 244, 0.25)', color: '#4285F4' }}>
                                                        ✨ AI Copilot
                                                    </button>
                                                </div>
                                            </div>
                                            <input type="text" value={heroTagline[adminLocale] || ""} onChange={e => setHeroTagline({ ...heroTagline, [adminLocale]: e.target.value })} placeholder="e.g. Tech Leader" style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.85rem', margin: 0 }}>Headline</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="button" onClick={() => handleAutoTranslate('heroHeadline', heroHeadline.en, setHeroHeadline)} disabled={translatingField === 'heroHeadline'} className="submit-btn" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px', background: 'rgba(0, 255, 136, 0.12)', border: '1px solid rgba(0, 255, 136, 0.25)', color: '#00ff88' }}>
                                                        {translatingField === 'heroHeadline' ? 'Translating...' : '✨ Translate to All'}
                                                    </button>
                                                    <button type="button" onClick={() => { setCopilotField('heroHeadline'); setCopilotOpen(true); }} className="submit-btn" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px', background: 'rgba(66, 133, 244, 0.12)', border: '1px solid rgba(66, 133, 244, 0.25)', color: '#4285F4' }}>
                                                        ✨ AI Copilot
                                                    </button>
                                                </div>
                                            </div>
                                            <input type="text" value={heroHeadline[adminLocale] || ""} onChange={e => setHeroHeadline({ ...heroHeadline, [adminLocale]: e.target.value })} placeholder="e.g. Bridging the Gap..." style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Hero Font Family</label>
                                                <select
                                                    value={heroFontFamily}
                                                    onChange={e => setHeroFontFamily(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="'Space Grotesk', sans-serif" style={{ background: '#111', color: 'white' }}>Space Grotesk (Modern Geometric)</option>
                                                    <option value="'Outfit', sans-serif" style={{ background: '#111', color: 'white' }}>Outfit (Elegant & Clean)</option>
                                                    <option value="'Playfair Display', serif" style={{ background: '#111', color: 'white' }}>Playfair Display (Premium Serif)</option>
                                                    <option value="'Inter', sans-serif" style={{ background: '#111', color: 'white' }}>Inter (Clean Neo-grotesque)</option>
                                                    <option value="'Fira Code', monospace" style={{ background: '#111', color: 'white' }}>Fira Code (Monospace/Tech)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Hero Text Alignment</label>
                                                <select
                                                    value={heroTextAlign}
                                                    onChange={e => setHeroTextAlign(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="center" style={{ background: '#111', color: 'white' }}>Center</option>
                                                    <option value="left" style={{ background: '#111', color: 'white' }}>Left</option>
                                                    <option value="right" style={{ background: '#111', color: 'white' }}>Right</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* About Section Card */}
                        {(userRole === 'super_admin' || userPermissions.contentAbout !== false) && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('aboutCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.aboutCard ? 0 : '20px' }}>
                                    <h3 style={{ color: 'var(--color-tertiary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-user"></i> About Section
                                    </h3>
                                    <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.aboutCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                </div>
                                {!collapsedSections.aboutCard && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                            <label style={{ color: '#a0a0a0', fontSize: '0.85rem', margin: 0 }}>About Biography (HTML Support)</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button type="button" onClick={() => handleAutoTranslate('aboutText', aboutText.en, setAboutText)} disabled={translatingField === 'aboutText'} className="submit-btn" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px', background: 'rgba(0, 255, 136, 0.12)', border: '1px solid rgba(0, 255, 136, 0.25)', color: '#00ff88' }}>
                                                    {translatingField === 'aboutText' ? 'Translating...' : '✨ Translate to All'}
                                                </button>
                                                <button type="button" onClick={() => { setCopilotField('aboutText'); setCopilotOpen(true); }} className="submit-btn" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px', background: 'rgba(66, 133, 244, 0.12)', border: '1px solid rgba(66, 133, 244, 0.25)', color: '#4285F4' }}>
                                                    ✨ AI Copilot
                                                </button>
                                            </div>
                                        </div>
                                        <textarea value={aboutText[adminLocale] || ""} onChange={e => setAboutText({ ...aboutText, [adminLocale]: e.target.value })} rows="8" placeholder="Tell your story..." style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit', marginBottom: '20px' }} />
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Biography Font Family</label>
                                                <select
                                                    value={aboutFontFamily}
                                                    onChange={e => setAboutFontFamily(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="'Space Grotesk', sans-serif" style={{ background: '#111', color: 'white' }}>Space Grotesk (Modern Geometric)</option>
                                                    <option value="'Outfit', sans-serif" style={{ background: '#111', color: 'white' }}>Outfit (Elegant & Clean)</option>
                                                    <option value="'Playfair Display', serif" style={{ background: '#111', color: 'white' }}>Playfair Display (Premium Serif)</option>
                                                    <option value="'Inter', sans-serif" style={{ background: '#111', color: 'white' }}>Inter (Clean Neo-grotesque)</option>
                                                    <option value="'Fira Code', monospace" style={{ background: '#111', color: 'white' }}>Fira Code (Monospace/Tech)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Biography Text Alignment</label>
                                                <select
                                                    value={aboutTextAlign}
                                                    onChange={e => setAboutTextAlign(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="justify" style={{ background: '#111', color: 'white' }}>Justify</option>
                                                    <option value="left" style={{ background: '#111', color: 'white' }}>Left</option>
                                                    <option value="center" style={{ background: '#111', color: 'white' }}>Center</option>
                                                    <option value="right" style={{ background: '#111', color: 'white' }}>Right</option>
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* About Slides Manager Card (Coverflow) */}
                        {(userRole === 'super_admin' || userPermissions.contentAboutSlides !== false) && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('slidesCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.slidesCard ? 0 : '20px' }}>
                                    <h3 style={{ color: 'var(--color-tertiary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-images"></i> About Slides Manager (3D Coverflow)
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {!collapsedSections.slidesCard && (
                                            <button type="button" onClick={e => { e.stopPropagation(); setAboutSlides([...aboutSlides, { title: "New Slide", image: "", text: "<p>New Slide Description...</p>" }]); }} className="submit-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>+ Add New Slide</button>
                                        )}
                                        <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.slidesCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                    </div>
                                </div>
                                {!collapsedSections.slidesCard && (
                                    <>
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
                                                            <input type="text" value={typeof slide.title === 'object' ? (slide.title[adminLocale] || "") : (slide.title || "")} onChange={e => updateAboutSlide(index, 'title', e.target.value)} placeholder="Slide Title (e.g. Technology Leadership)" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
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
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                                <label style={{ color: '#a0a0a0', fontSize: '0.8rem', margin: 0 }}>Slide Description (HTML supported)</label>
                                                                <button type="button" onClick={() => { setCopilotField({ type: 'aboutSlide', index, field: 'text' }); setCopilotOpen(true); }} className="submit-btn" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px', background: 'rgba(66, 133, 244, 0.12)', border: '1px solid rgba(66, 133, 244, 0.25)', color: '#4285F4' }}>
                                                                    ✨ AI Copilot
                                                                </button>
                                                            </div>
                                                            <textarea value={typeof slide.text === 'object' ? (slide.text[adminLocale] || "") : (slide.text || "")} onChange={e => updateAboutSlide(index, 'text', e.target.value)} placeholder="HTML content here (e.g. <p>Description...</p>)" rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Contact & Socials Card */}
                        {(userRole === 'super_admin' || userPermissions.contentContact !== false) && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('contactCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.contactCard ? 0 : '20px' }}>
                                    <h3 style={{ color: '#34A853', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-address-book"></i> Contact & Socials
                                    </h3>
                                    <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.contactCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                </div>
                                {!collapsedSections.contactCard && (
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
                                )}
                            </div>
                        )}

                        {/* Skills Manager Card */}
                        {(userRole === 'super_admin' || userPermissions.contentSkills !== false) && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('skillsCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.skillsCard ? 0 : '20px' }}>
                                    <h3 style={{ color: '#4285F4', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-list-check"></i> Skills Manager
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {!collapsedSections.skillsCard && (
                                            <button type="button" onClick={e => { e.stopPropagation(); setSkills([...skills, { title: "", icon: "fa-solid fa-star", description: "" }]); }} className="submit-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>+ Add New Skill</button>
                                        )}
                                        <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.skillsCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                    </div>
                                </div>
                                {!collapsedSections.skillsCard && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Skills Font Family</label>
                                                <select
                                                    value={skillsFontFamily}
                                                    onChange={e => setSkillsFontFamily(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="'Space Grotesk', sans-serif" style={{ background: '#111', color: 'white' }}>Space Grotesk (Modern Geometric)</option>
                                                    <option value="'Outfit', sans-serif" style={{ background: '#111', color: 'white' }}>Outfit (Elegant & Clean)</option>
                                                    <option value="'Playfair Display', serif" style={{ background: '#111', color: 'white' }}>Playfair Display (Premium Serif)</option>
                                                    <option value="'Inter', sans-serif" style={{ background: '#111', color: 'white' }}>Inter (Clean Neo-grotesque)</option>
                                                    <option value="'Fira Code', monospace" style={{ background: '#111', color: 'white' }}>Fira Code (Monospace/Tech)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Skills Text Alignment</label>
                                                <select
                                                    value={skillsTextAlign}
                                                    onChange={e => setSkillsTextAlign(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="left" style={{ background: '#111', color: 'white' }}>Left</option>
                                                    <option value="center" style={{ background: '#111', color: 'white' }}>Center</option>
                                                    <option value="right" style={{ background: '#111', color: 'white' }}>Right</option>
                                                    <option value="justify" style={{ background: '#111', color: 'white' }}>Justify</option>
                                                </select>
                                            </div>
                                        </div>
                                        {skills.map((skill, index) => (
                                            <div key={index} style={{ display: 'flex', gap: '15px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ flexGrow: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                    <div>
                                                        <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Skill Title</label>
                                                        <input type="text" value={typeof skill.title === 'object' ? (skill.title[adminLocale] || "") : (skill.title || "")} onChange={e => updateSkill(index, 'title', e.target.value)} placeholder="Skill Title" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Icon CSS Class</label>
                                                        <input type="text" value={skill.icon || ""} onChange={e => updateSkill(index, 'icon', e.target.value)} placeholder="Icon (e.g. fa-solid fa-code)" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                                    </div>
                                                    <div style={{ gridColumn: 'span 2' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                            <label style={{ color: '#a0a0a0', fontSize: '0.8rem', margin: 0 }}>Description</label>
                                                            <button type="button" onClick={() => { setCopilotField({ type: 'skill', index, field: 'description' }); setCopilotOpen(true); }} className="submit-btn" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px', background: 'rgba(66, 133, 244, 0.12)', border: '1px solid rgba(66, 133, 244, 0.25)', color: '#4285F4' }}>
                                                                ✨ AI Copilot
                                                            </button>
                                                        </div>
                                                        <textarea value={typeof skill.description === 'object' ? (skill.description[adminLocale] || "") : (skill.description || "")} onChange={e => updateSkill(index, 'description', e.target.value)} placeholder="Description..." rows="2" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => setSkills(skills.filter((_, i) => i !== index))} style={{ alignSelf: 'flex-start', background: 'rgba(234, 67, 53, 0.1)', color: '#EA4335', border: '1px solid rgba(234, 67, 53, 0.2)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Experience Manager Card */}
                        {(userRole === 'super_admin' || userPermissions.contentExperience !== false) && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('experienceCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.experienceCard ? 0 : '20px' }}>
                                    <h3 style={{ color: '#FBBC05', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-briefcase"></i> Experience Journey
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {!collapsedSections.experienceCard && (
                                            <button type="button" onClick={e => { e.stopPropagation(); setExperience([...experience, { title: "", company: "", date: "", bullets: [] }]); }} className="submit-btn" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>+ Add Job</button>
                                        )}
                                        <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.experienceCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                    </div>
                                </div>
                                {!collapsedSections.experienceCard && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Experience Font Family</label>
                                                <select
                                                    value={experienceFontFamily}
                                                    onChange={e => setExperienceFontFamily(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="'Space Grotesk', sans-serif" style={{ background: '#111', color: 'white' }}>Space Grotesk (Modern Geometric)</option>
                                                    <option value="'Outfit', sans-serif" style={{ background: '#111', color: 'white' }}>Outfit (Elegant & Clean)</option>
                                                    <option value="'Playfair Display', serif" style={{ background: '#111', color: 'white' }}>Playfair Display (Premium Serif)</option>
                                                    <option value="'Inter', sans-serif" style={{ background: '#111', color: 'white' }}>Inter (Clean Neo-grotesque)</option>
                                                    <option value="'Fira Code', monospace" style={{ background: '#111', color: 'white' }}>Fira Code (Monospace/Tech)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ color: '#a0a0a0', fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>Experience Text Alignment</label>
                                                <select
                                                    value={experienceTextAlign}
                                                    onChange={e => setExperienceTextAlign(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px',
                                                        borderRadius: '8px',
                                                        background: 'rgba(0,0,0,0.3)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: 'white',
                                                        fontSize: '0.9rem',
                                                        outline: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="left" style={{ background: '#111', color: 'white' }}>Left</option>
                                                    <option value="center" style={{ background: '#111', color: 'white' }}>Center</option>
                                                    <option value="right" style={{ background: '#111', color: 'white' }}>Right</option>
                                                    <option value="justify" style={{ background: '#111', color: 'white' }}>Justify</option>
                                                </select>
                                            </div>
                                        </div>
                                        {experience.map((exp, index) => (
                                            <div key={index} style={{ background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative' }}>
                                                <button type="button" onClick={() => setExperience(experience.filter((_, i) => i !== index))} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(234, 67, 53, 0.1)', color: '#EA4335', border: '1px solid rgba(234, 67, 53, 0.2)', padding: '8px', borderRadius: '6px' }}>
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                                    <div>
                                                        <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Job Title</label>
                                                        <input type="text" value={typeof exp.title === 'object' ? (exp.title[adminLocale] || "") : (exp.title || "")} onChange={e => updateExperience(index, 'title', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Company</label>
                                                        <input type="text" value={typeof exp.company === 'object' ? (exp.company[adminLocale] || "") : (exp.company || "")} onChange={e => updateExperience(index, 'company', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                                    </div>
                                                    <div style={{ gridColumn: 'span 2' }}>
                                                        <label style={{ color: '#a0a0a0', fontSize: '0.8rem', marginBottom: '5px', display: 'block' }}>Date Range</label>
                                                        <input type="text" value={exp.date || ""} onChange={e => updateExperience(index, 'date', e.target.value)} placeholder="e.g. 2022 - Present" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                                                    </div>
                                                    <div style={{ gridColumn: 'span 2' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                                                            <label style={{ color: '#a0a0a0', fontSize: '0.8rem', margin: 0 }}>Key Responsibilities (One per line)</label>
                                                            <button type="button" onClick={() => { setCopilotField({ type: 'experience', index, field: 'bullets' }); setCopilotOpen(true); }} className="submit-btn" style={{ padding: '2px 8px', fontSize: '0.72rem', borderRadius: '4px', background: 'rgba(66, 133, 244, 0.12)', border: '1px solid rgba(66, 133, 244, 0.25)', color: '#4285F4' }}>
                                                                ✨ AI Copilot
                                                            </button>
                                                        </div>
                                                        <textarea value={exp.bullets ? exp.bullets.map(b => (typeof b === 'object' ? (b[adminLocale] || "") : (b || ""))).join('\\n') : ''} onChange={e => updateExperience(index, 'bullets', e.target.value)} rows="5" style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'inherit' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

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
                            {(userRole === 'super_admin' || userPermissions.mediaProfile !== false) && (
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
                            )}

                            {/* CV PDF Upload */}
                            {(userRole === 'super_admin' || userPermissions.mediaCV !== false) && (
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
                            )}
                        </div>

                        {/* Portfolio Photo Gallery Upload */}
                        {(userRole === 'super_admin' || userPermissions.mediaGallery !== false) && (
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
                        )}


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

                    {/* Change Log Card */}
                    <div className="glass-card" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ color: 'var(--color-secondary, #FBBC05)', margin: 0 }}>
                                    <i className="fa-solid fa-clock-rotate-left" style={{ marginRight: '10px' }}></i> Change Log History
                                </h3>
                                <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginTop: '5px' }}>
                                    Record of content changes, published versions, and drafts. Super Admins can undo changes to revert the website state.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={loadChangelog}
                                disabled={changelogLoading}
                                className="submit-btn"
                                style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                                {changelogLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-arrows-rotate"></i>} Refresh
                            </button>
                        </div>

                        {changelogLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '150px', color: '#a0a0a0', gap: '10px' }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--color-secondary, #FBBC05)' }}></i>
                                <span>Loading change log history...</span>
                            </div>
                        ) : changelog.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#a0a0a0', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                <i className="fa-solid fa-history" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block', color: '#666' }}></i>
                                No changes have been recorded in the change log yet.
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ padding: '15px' }}>Timestamp</th>
                                            <th style={{ padding: '15px' }}>Action</th>
                                            <th style={{ padding: '15px' }}>Performed By</th>
                                            <th style={{ padding: '15px' }}>Fields Changed</th>
                                            <th style={{ padding: '15px', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {changelog.map((log) => {
                                            const isUndo = log.action === 'undo';
                                            const isPublish = log.action === 'published';
                                            const isDraft = log.action === 'draft_saved';

                                            let badgeBg = 'rgba(251, 188, 5, 0.15)';
                                            let badgeColor = '#FBBC05';
                                            let badgeText = log.action;

                                            if (isPublish) {
                                                badgeBg = 'rgba(52, 168, 83, 0.15)';
                                                badgeColor = '#34A853';
                                                badgeText = 'PUBLISHED';
                                            } else if (isDraft) {
                                                badgeBg = 'rgba(66, 133, 244, 0.15)';
                                                badgeColor = '#4285F4';
                                                badgeText = 'DRAFT';
                                            } else if (isUndo) {
                                                badgeBg = 'rgba(234, 67, 53, 0.15)';
                                                badgeColor = '#EA4335';
                                                badgeText = 'UNDO';
                                            }

                                            return (
                                                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                    <td style={{ padding: '12px 15px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                                        {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                                                    </td>
                                                    <td style={{ padding: '12px 15px' }}>
                                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', background: badgeBg, color: badgeColor }}>
                                                            {badgeText}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 15px', fontSize: '0.85rem' }}>
                                                        <div style={{ fontWeight: '500' }}>{log.performedBy?.name || 'Unknown'}</div>
                                                        <div style={{ color: '#a0a0a0', fontSize: '0.75rem' }}>{log.performedBy?.email || ''}</div>
                                                    </td>
                                                    <td style={{ padding: '12px 15px', fontSize: '0.85rem', maxWidth: '300px' }}>
                                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.changes ? log.changes.join(', ') : ''}>
                                                            {log.changes ? log.changes.join(', ') : 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 15px', textAlign: 'right' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUndo(log)}
                                                            disabled={undoingId !== null}
                                                            className="submit-btn"
                                                            style={{
                                                                background: isUndo ? 'rgba(255,255,255,0.05)' : 'rgba(234, 67, 53, 0.1)',
                                                                color: isUndo ? '#666' : '#EA4335',
                                                                border: isUndo ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(234, 67, 53, 0.2)',
                                                                padding: '6px 12px',
                                                                fontSize: '0.8rem',
                                                                borderRadius: '6px'
                                                            }}
                                                        >
                                                            {undoingId === log.id ? (
                                                                <span><i className="fa-solid fa-spinner fa-spin"></i> Undoing...</span>
                                                            ) : (
                                                                <span><i className="fa-solid fa-rotate-left"></i> Undo</span>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
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

                        {/* Profile Settings Card - Nationality Highlight */}
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <div onClick={() => toggleSection('profileSettingsCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.profileSettingsCard ? 0 : '20px' }}>
                                <h3 style={{ color: 'var(--color-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-earth-americas"></i> Map Highlight Preferences
                                </h3>
                                <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.profileSettingsCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                            </div>
                            {!collapsedSections.profileSettingsCard && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <p style={{ color: '#a0a0a0', fontSize: '0.85rem', margin: 0 }}>
                                        Choose your nationality to dynamically highlight and glow that specific country on the interactive world map overlay in the Hero section.
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '380px' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#c0c0c0', fontWeight: '500' }}>Select Nationality Country Highlight:</label>
                                        <select
                                            value={nationality}
                                            onChange={(e) => setNationality(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                background: 'rgba(0,0,0,0.3)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'white',
                                                fontSize: '0.9rem',
                                                outline: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {SUPPORTED_COUNTRIES.map((c) => (
                                                <option key={c.code} value={c.code}>
                                                    {c.name} ({c.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* AI Configuration Card */}
                        <div className="glass-card" style={{ padding: '30px' }}>
                            <div onClick={() => toggleSection('aiConfigCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.aiConfigCard ? 0 : '20px' }}>
                                <h3 style={{ color: 'var(--color-primary, #4285F4)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fa-solid fa-wand-magic-sparkles"></i> AI Writing Assistant & Translation Config
                                </h3>
                                <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.aiConfigCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                            </div>
                            {!collapsedSections.aiConfigCard && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <p style={{ color: '#a0a0a0', fontSize: '0.85rem', margin: 0 }}>
                                        To enable the client-side Gemini AI features (such as ✨ Auto-Translate and the ✨ AI Copilot writing helper), paste your personal **Gemini Developer API Key** below. This key is saved 100% securely inside your local browser's storage and never sent to any third-party server.
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <input
                                            type="password"
                                            value={geminiApiKey}
                                            onChange={e => {
                                                setGeminiApiKey(e.target.value);
                                                localStorage.setItem("gemini_api_key", e.target.value);
                                            }}
                                            placeholder="AIzaSy..."
                                            style={{ flexGrow: 1, padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontFamily: 'monospace' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setGeminiApiKey("");
                                                localStorage.removeItem("gemini_api_key");
                                                showToast("API Key removed.", "success");
                                            }}
                                            className="submit-btn"
                                            style={{ background: '#EA4335', padding: '12px', borderRadius: '8px' }}
                                        >
                                            Clear Key
                                        </button>
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#888' }}>
                                        Get a free Gemini API Key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>Google AI Studio</a>.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section Visibility toggles - permission guarded */}
                        {(userRole === 'super_admin' || userPermissions.settingVisibility !== false) && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('visibilityCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.visibilityCard ? 0 : '10px' }}>
                                    <h3 style={{ color: 'var(--color-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-eye"></i> Section & Component Visibility Switches
                                    </h3>
                                    <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.visibilityCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                </div>
                                {!collapsedSections.visibilityCard && (
                                    <>
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
                                    </>
                                )}
                            </div>
                        )}

                        {/* Security Controls - Super Admin Only */}
                        {userRole === 'super_admin' && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('securityCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.securityCard ? 0 : '20px' }}>
                                    <h3 style={{ color: 'var(--color-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-shield-halved"></i> Login Security Settings
                                    </h3>
                                    <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.securityCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                </div>
                                {!collapsedSections.securityCard && (
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
                                )}
                            </div>
                        )}

                        {/* Theme Customizer Swatches - permission guarded */}
                        {(userRole === 'super_admin' || userPermissions.settingThemes !== false) && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('themesCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.themesCard ? 0 : '20px', flexWrap: 'wrap', gap: '15px' }}>
                                    <h3 style={{ color: 'var(--color-tertiary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-palette"></i> Dynamic Theme Colors
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        {!collapsedSections.themesCard && (
                                            <button
                                                type="button"
                                                onClick={e => { e.stopPropagation(); setThemes({ theme1: { ...DEFAULT_THEMES.theme1 }, theme2: { ...DEFAULT_THEMES.theme2 }, theme3: { ...DEFAULT_THEMES.theme3 }, theme4: { ...DEFAULT_THEMES.theme4 } }); setCmsStatus("All theme colors reset to defaults! Save or publish to apply."); showToast("All theme colors reset to defaults!", "success"); }}
                                                className="submit-btn"
                                                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: '6px' }}
                                            >
                                                <i className="fa-solid fa-arrow-rotate-left"></i> Reset All Themes
                                            </button>
                                        )}
                                        <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.themesCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                    </div>
                                </div>
                                {!collapsedSections.themesCard && (
                                    <>
                                        <div style={{ background: 'rgba(251, 188, 5, 0.05)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(251, 188, 5, 0.15)', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '0.9rem', color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <i className="fa-solid fa-wand-magic-sparkles" style={{ color: '#FBBC05' }}></i> Global Theme Override
                                            </label>
                                            <p style={{ color: '#a0a0a0', fontSize: '0.82rem', margin: 0 }}>
                                                By default, the website dynamically transitions themes as the user scrolls. You can override this behaviour to force a single uniform theme across the entire webpage.
                                            </p>
                                            <select
                                                value={overrideTheme}
                                                onChange={(e) => setOverrideTheme(e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '300px',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(0,0,0,0.3)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    marginTop: '5px',
                                                    outline: 'none'
                                                }}
                                            >
                                                <option value="dynamic">✨ Dynamic Scrolling Themes (Default)</option>
                                                <option value="theme1">🌸 Theme 1 (Hero Light Background)</option>
                                                <option value="theme2">💎 Theme 2 (About Steel Blue Background)</option>
                                                <option value="theme3">🌌 Theme 3 (Skills Slate Grey Background)</option>
                                                <option value="theme4">🖤 Theme 4 (Experience Dark Theme)</option>
                                            </select>
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
                                    </>
                                )}
                            </div>
                        )}

                        {/* Password Changer - Super Admin Only */}
                        {userRole === 'super_admin' && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('passwordCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.passwordCard ? 0 : '20px' }}>
                                    <h3 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-key"></i> Update Master Password
                                    </h3>
                                    <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.passwordCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                </div>
                                {!collapsedSections.passwordCard && (
                                    <>
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
                                    </>
                                )}
                            </div>
                        )}

                        {/* User Roles directory manager - Super Admin Only */}
                        {userRole === 'super_admin' && (
                            <div className="glass-card" style={{ padding: '30px' }}>
                                <div onClick={() => toggleSection('rbacCard')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: collapsedSections.rbacCard ? 0 : '20px' }}>
                                    <h3 style={{ color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <i className="fa-solid fa-users-gear"></i> User Directory &amp; Access Levels (RBAC)
                                    </h3>
                                    <i className="fa-solid fa-chevron-down" style={{ color: '#888', fontSize: '0.85rem', transition: 'transform 0.25s ease', transform: collapsedSections.rbacCard ? 'rotate(-90deg)' : 'rotate(0deg)' }}></i>
                                </div>
                                {!collapsedSections.rbacCard && (
                                    <>
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

                                                {/* Permissions picker — Content Managers only */}
                                                {newUserRole === 'content_manager' && (
                                                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
                                                        <p style={{ color: '#c0c0c0', fontSize: '0.82rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <i className="fa-solid fa-sliders" style={{ color: '#4285F4' }}></i> Access Permissions
                                                        </p>

                                                        {/* — TABS — */}
                                                        <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Tabs</p>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                                            {[{ key: 'tabContent', label: 'Content', icon: 'fa-pen-to-square' }, { key: 'tabMedia', label: 'Media', icon: 'fa-image' }, { key: 'tabSettings', label: 'Settings', icon: 'fa-gears' }].map(t => (
                                                                <label key={t.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', background: newUserPermissions[t.key] ? 'rgba(66,133,244,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newUserPermissions[t.key] ? 'rgba(66,133,244,0.3)' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.82rem', color: newUserPermissions[t.key] ? '#4285F4' : '#888', transition: 'all 0.2s' }}>
                                                                    <input type="checkbox" checked={!!newUserPermissions[t.key]} onChange={e => setNewUserPermissions(p => ({ ...p, [t.key]: e.target.checked, ...(t.key === 'tabContent' && !e.target.checked ? { contentHero: false, contentAbout: false, contentAboutSlides: false, contentContact: false, contentSkills: false, contentExperience: false } : {}), ...(t.key === 'tabMedia' && !e.target.checked ? { mediaProfile: false, mediaCV: false, mediaGallery: false } : {}), ...(t.key === 'tabSettings' && !e.target.checked ? { settingVisibility: false, settingThemes: false } : {}) }))} style={{ accentColor: '#4285F4' }} />
                                                                    <i className={`fa-solid ${t.icon}`}></i> {t.label}
                                                                </label>
                                                            ))}
                                                        </div>

                                                        {/* — CONTENT SUB-SECTIONS — */}
                                                        {newUserPermissions.tabContent && (
                                                            <>
                                                                <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Content Sub-sections</p>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                                                    {[{ key: 'contentHero', label: 'Hero', icon: 'fa-rocket' }, { key: 'contentAbout', label: 'About Bio', icon: 'fa-user' }, { key: 'contentAboutSlides', label: 'About Slides', icon: 'fa-images' }, { key: 'contentContact', label: 'Contact & Socials', icon: 'fa-address-book' }, { key: 'contentSkills', label: 'Skills', icon: 'fa-list-check' }, { key: 'contentExperience', label: 'Experience', icon: 'fa-briefcase' }].map(s => (
                                                                        <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', background: newUserPermissions[s.key] ? 'rgba(66,133,244,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newUserPermissions[s.key] ? 'rgba(66,133,244,0.25)' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.82rem', color: newUserPermissions[s.key] ? '#88aaff' : '#888', transition: 'all 0.2s' }}>
                                                                            <input type="checkbox" checked={!!newUserPermissions[s.key]} onChange={e => setNewUserPermissions(p => ({ ...p, [s.key]: e.target.checked }))} style={{ accentColor: '#4285F4' }} />
                                                                            <i className={`fa-solid ${s.icon}`}></i> {s.label}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}

                                                        {/* — MEDIA SUB-SECTIONS — */}
                                                        {newUserPermissions.tabMedia && (
                                                            <>
                                                                <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Media Sub-sections</p>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                                                    {[{ key: 'mediaProfile', label: 'Profile Photo', icon: 'fa-circle-user' }, { key: 'mediaCV', label: 'CV / PDF', icon: 'fa-file-pdf' }, { key: 'mediaGallery', label: 'Photo Gallery', icon: 'fa-images' }].map(s => (
                                                                        <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', background: newUserPermissions[s.key] ? 'rgba(251,188,5,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newUserPermissions[s.key] ? 'rgba(251,188,5,0.25)' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.82rem', color: newUserPermissions[s.key] ? '#FBBC05' : '#888', transition: 'all 0.2s' }}>
                                                                            <input type="checkbox" checked={!!newUserPermissions[s.key]} onChange={e => setNewUserPermissions(p => ({ ...p, [s.key]: e.target.checked }))} style={{ accentColor: '#FBBC05' }} />
                                                                            <i className={`fa-solid ${s.icon}`}></i> {s.label}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}

                                                        {/* — SETTINGS SUB-SECTIONS — */}
                                                        {newUserPermissions.tabSettings && (
                                                            <>
                                                                <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Settings Sub-sections</p>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                    {[{ key: 'settingVisibility', label: 'Section Visibility', icon: 'fa-eye' }, { key: 'settingThemes', label: 'Theme Colors', icon: 'fa-palette' }].map(s => (
                                                                        <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', background: newUserPermissions[s.key] ? 'rgba(0,201,127,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newUserPermissions[s.key] ? 'rgba(0,201,127,0.3)' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.82rem', color: newUserPermissions[s.key] ? '#00c97f' : '#888', transition: 'all 0.2s' }}>
                                                                            <input type="checkbox" checked={!!newUserPermissions[s.key]} onChange={e => setNewUserPermissions(p => ({ ...p, [s.key]: e.target.checked }))} style={{ accentColor: '#00c97f' }} />
                                                                            <i className={`fa-solid ${s.icon}`}></i> {s.label}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
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
                                                        <React.Fragment key={usr.id}>
                                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
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
                                                                    {/* Only show actions for local (username/password) content managers */}
                                                                    {usr.type === 'local' && usr.role === 'content_manager' && (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                                            {/* Reset Password inline */}
                                                                            {resetTargetId === usr.id ? (
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
                                                                                <button onClick={() => { setResetTargetId(usr.id); setResetPasswordStatus(''); setEditingPermissionsId(''); }} className="submit-btn" style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '6px', background: 'rgba(255,165,0,0.15)', border: '1px solid rgba(255,165,0,0.3)', color: '#f0a500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                                    <i className="fa-solid fa-key"></i> Reset Password
                                                                                </button>
                                                                            )}
                                                                            {/* Edit Permissions button */}
                                                                            {editingPermissionsId !== usr.id && (
                                                                                <button onClick={() => { setEditingPermissionsId(usr.id); setEditingPermissions({ ...DEFAULT_CM_PERMISSIONS, ...(usr.permissions || {}) }); setResetTargetId(''); }} className="submit-btn" style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '6px', background: 'rgba(66,133,244,0.15)', border: '1px solid rgba(66,133,244,0.3)', color: '#4285F4', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                                    <i className="fa-solid fa-sliders"></i> Edit Permissions
                                                                                </button>
                                                                            )}
                                                                            {editingPermissionsId === usr.id && (
                                                                                <button onClick={() => setEditingPermissionsId('')} className="submit-btn" style={{ padding: '5px 12px', fontSize: '0.78rem', borderRadius: '6px', background: 'rgba(66,133,244,0.25)', border: '1px solid rgba(66,133,244,0.4)', color: '#4285F4', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                                                    <i className="fa-solid fa-chevron-up"></i> Close Permissions
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                    {(usr.type !== 'local') && <span style={{ color: '#666', fontSize: '0.78rem' }}>Firebase Auth</span>}
                                                                </td>
                                                            </tr>
                                                            {/* Inline permissions editor row */}
                                                            {editingPermissionsId === usr.id && usr.type === 'local' && (
                                                                <tr>
                                                                    <td colSpan="4" style={{ padding: '0 15px 16px' }}>
                                                                        <div style={{ background: 'rgba(66,133,244,0.05)', border: '1px solid rgba(66,133,244,0.15)', borderRadius: '10px', padding: '16px' }}>
                                                                            <p style={{ color: '#c0c0c0', fontSize: '0.82rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                <i className="fa-solid fa-sliders" style={{ color: '#4285F4' }}></i> Edit Access Permissions for <strong style={{ color: 'white' }}>{usr.fullName || usr.username}</strong>
                                                                            </p>
                                                                            {/* — TABS — */}
                                                                            <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Tabs</p>
                                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                                                                {[{ key: 'tabContent', label: 'Content', icon: 'fa-pen-to-square' }, { key: 'tabMedia', label: 'Media', icon: 'fa-image' }, { key: 'tabSettings', label: 'Settings', icon: 'fa-gears' }].map(t => (
                                                                                    <label key={t.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', background: editingPermissions[t.key] ? 'rgba(66,133,244,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${editingPermissions[t.key] ? 'rgba(66,133,244,0.3)' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.82rem', color: editingPermissions[t.key] ? '#4285F4' : '#888', transition: 'all 0.2s' }}>
                                                                                        <input type="checkbox" checked={!!editingPermissions[t.key]} onChange={e => setEditingPermissions(p => ({ ...p, [t.key]: e.target.checked, ...(t.key === 'tabContent' && !e.target.checked ? { contentHero: false, contentAbout: false, contentAboutSlides: false, contentContact: false, contentSkills: false, contentExperience: false } : {}), ...(t.key === 'tabMedia' && !e.target.checked ? { mediaProfile: false, mediaCV: false, mediaGallery: false } : {}), ...(t.key === 'tabSettings' && !e.target.checked ? { settingVisibility: false, settingThemes: false } : {}) }))} style={{ accentColor: '#4285F4' }} />
                                                                                        <i className={`fa-solid ${t.icon}`}></i> {t.label}
                                                                                    </label>
                                                                                ))}
                                                                            </div>
                                                                            {/* — CONTENT SUB-SECTIONS — */}
                                                                            {editingPermissions.tabContent && (
                                                                                <>
                                                                                    <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Content Sub-sections</p>
                                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                                                                        {[{ key: 'contentHero', label: 'Hero', icon: 'fa-rocket' }, { key: 'contentAbout', label: 'About Bio', icon: 'fa-user' }, { key: 'contentAboutSlides', label: 'About Slides', icon: 'fa-images' }, { key: 'contentContact', label: 'Contact & Socials', icon: 'fa-address-book' }, { key: 'contentSkills', label: 'Skills', icon: 'fa-list-check' }, { key: 'contentExperience', label: 'Experience', icon: 'fa-briefcase' }].map(s => (
                                                                                            <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', background: editingPermissions[s.key] ? 'rgba(66,133,244,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${editingPermissions[s.key] ? 'rgba(66,133,244,0.25)' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.82rem', color: editingPermissions[s.key] ? '#88aaff' : '#888', transition: 'all 0.2s' }}>
                                                                                                <input type="checkbox" checked={!!editingPermissions[s.key]} onChange={e => setEditingPermissions(p => ({ ...p, [s.key]: e.target.checked }))} style={{ accentColor: '#4285F4' }} />
                                                                                                <i className={`fa-solid ${s.icon}`}></i> {s.label}
                                                                                            </label>
                                                                                        ))}
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                            {/* — MEDIA SUB-SECTIONS — */}
                                                                            {editingPermissions.tabMedia && (
                                                                                <>
                                                                                    <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Media Sub-sections</p>
                                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                                                                        {[{ key: 'mediaProfile', label: 'Profile Photo', icon: 'fa-circle-user' }, { key: 'mediaCV', label: 'CV / PDF', icon: 'fa-file-pdf' }, { key: 'mediaGallery', label: 'Photo Gallery', icon: 'fa-images' }].map(s => (
                                                                                            <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', background: editingPermissions[s.key] ? 'rgba(251,188,5,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${editingPermissions[s.key] ? 'rgba(251,188,5,0.25)' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.82rem', color: editingPermissions[s.key] ? '#FBBC05' : '#888', transition: 'all 0.2s' }}>
                                                                                                <input type="checkbox" checked={!!editingPermissions[s.key]} onChange={e => setEditingPermissions(p => ({ ...p, [s.key]: e.target.checked }))} style={{ accentColor: '#FBBC05' }} />
                                                                                                <i className={`fa-solid ${s.icon}`}></i> {s.label}
                                                                                            </label>
                                                                                        ))}
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                            {/* — SETTINGS SUB-SECTIONS — */}
                                                                            {editingPermissions.tabSettings && (
                                                                                <>
                                                                                    <p style={{ color: '#888', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Settings Sub-sections</p>
                                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                                                                                        {[{ key: 'settingVisibility', label: 'Section Visibility', icon: 'fa-eye' }, { key: 'settingThemes', label: 'Theme Colors', icon: 'fa-palette' }].map(s => (
                                                                                            <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', padding: '5px 10px', borderRadius: '6px', background: editingPermissions[s.key] ? 'rgba(0,201,127,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${editingPermissions[s.key] ? 'rgba(0,201,127,0.3)' : 'rgba(255,255,255,0.08)'}`, fontSize: '0.82rem', color: editingPermissions[s.key] ? '#00c97f' : '#888', transition: 'all 0.2s' }}>
                                                                                                <input type="checkbox" checked={!!editingPermissions[s.key]} onChange={e => setEditingPermissions(p => ({ ...p, [s.key]: e.target.checked }))} style={{ accentColor: '#00c97f' }} />
                                                                                                <i className={`fa-solid ${s.icon}`}></i> {s.label}
                                                                                            </label>
                                                                                        ))}
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                                                                <button onClick={() => handleSavePermissions(usr.id)} className="submit-btn" style={{ padding: '7px 18px', borderRadius: '8px', background: '#4285F4', fontSize: '0.85rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                    <i className="fa-solid fa-floppy-disk"></i> Save Permissions
                                                                                </button>
                                                                                <button onClick={() => setEditingPermissionsId('')} className="submit-btn" style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', fontSize: '0.85rem' }}>Cancel</button>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                )}
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

            {/* Slide-in Premium AI Copilot Drawer */}
            {copilotOpen && (
                <div 
                    onClick={() => setCopilotOpen(false)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        background: "rgba(0, 0, 0, 0.4)",
                        backdropFilter: "blur(4px)",
                        zIndex: 99999,
                        opacity: 1,
                        transition: "all 0.3s ease"
                    }}
                />
            )}
            <div
                style={{
                    position: "fixed",
                    top: 0,
                    right: 0,
                    width: "100%",
                    maxWidth: "460px",
                    height: "100vh",
                    background: "rgba(10, 10, 18, 0.95)",
                    backdropFilter: "blur(20px)",
                    borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
                    zIndex: 100000,
                    boxShadow: "-10px 0 40px rgba(0,0,0,0.8)",
                    transform: copilotOpen ? "translateX(0)" : "translateX(100%)",
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    display: "flex",
                    flexDirection: "column",
                    padding: "30px",
                    color: "white"
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "15px" }}>
                    <h3 style={{ margin: 0, fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "10px", color: "var(--color-primary)" }}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i> AI Writing Copilot
                    </h3>
                    <button 
                        type="button"
                        onClick={() => setCopilotOpen(false)}
                        style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "#a0a0a0", cursor: "pointer", padding: "8px", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center" }}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Body Content */}
                <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px", paddingRight: "5px" }}>
                    <div>
                        <span style={{ fontSize: "0.8rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Target Locale</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", fontSize: "0.9rem", fontWeight: "600" }}>
                            {adminLocale === "en" && "🇬🇧 English (EN)"}
                            {adminLocale === "fa" && "🇮🇷 Farsi / فارسی (FA)"}
                            {adminLocale === "de" && "🇩🇪 German (DE)"}
                            {adminLocale === "ms" && "🇲🇾 Malay / Melayu (MS)"}
                        </div>
                    </div>

                    {/* Presets Cards */}
                    <div>
                        <span style={{ fontSize: "0.8rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "10px" }}>Quick Rephrase Presets</span>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <button
                                type="button"
                                onClick={() => handleRunCopilot("professional")}
                                disabled={copilotLoading}
                                className="submit-btn"
                                style={{ padding: "12px", borderRadius: "10px", fontSize: "0.8rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
                            >
                                <i className="fa-solid fa-briefcase" style={{ color: "#4285F4", fontSize: "1.1rem" }}></i>
                                <span>Executive Corporate</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRunCopilot("agile")}
                                disabled={copilotLoading}
                                className="submit-btn"
                                style={{ padding: "12px", borderRadius: "10px", fontSize: "0.8rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
                            >
                                <i className="fa-solid fa-people-group" style={{ color: "#FBBC05", fontSize: "1.1rem" }}></i>
                                <span>Agile Tech Leader</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRunCopilot("shorten")}
                                disabled={copilotLoading}
                                className="submit-btn"
                                style={{ padding: "12px", borderRadius: "10px", fontSize: "0.8rem", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", gridColumn: "span 2" }}
                            >
                                <i className="fa-solid fa-compress" style={{ color: "#EA4335", fontSize: "1.1rem" }}></i>
                                <span>Condense & Shorten (50% Length Reduction)</span>
                            </button>
                        </div>
                    </div>

                    {/* Custom Prompt Text Area */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <span style={{ fontSize: "0.8rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Custom AI Prompt Instruction</span>
                        <textarea
                            value={copilotPrompt}
                            onChange={e => setCopilotPrompt(e.target.value)}
                            placeholder="e.g. Expand this description to mention 5 years of scaling high-availability microservices in Kubernetes and Golang..."
                            rows="3"
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem", fontFamily: "inherit" }}
                        />
                        <button
                            type="button"
                            onClick={() => handleRunCopilot("custom")}
                            disabled={copilotLoading || !copilotPrompt.trim()}
                            className="submit-btn"
                            style={{ background: "var(--color-primary)", padding: "10px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600" }}
                        >
                            {copilotLoading ? "Generating AI magic..." : "Run Prompt"}
                        </button>
                    </div>

                    {/* Generation Results View */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexGrow: 1 }}>
                        <span style={{ fontSize: "0.8rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>AI Generated Output</span>
                        <div 
                            style={{ 
                                flexGrow: 1, 
                                background: "rgba(0,0,0,0.4)", 
                                border: "1px solid rgba(255,255,255,0.06)", 
                                borderRadius: "8px", 
                                padding: "15px", 
                                fontSize: "0.9rem", 
                                lineHeight: "1.6",
                                overflowY: "auto",
                                minHeight: "150px",
                                color: copilotResult ? "#fff" : "#666",
                                display: "flex",
                                alignItems: copilotLoading ? "center" : "flex-start",
                                justifyContent: copilotLoading ? "center" : "flex-start"
                            }}
                        >
                            {copilotLoading ? (
                                <div style={{ textAlign: "center" }}>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "1.8rem", color: "var(--color-primary)", marginBottom: "10px" }}></i>
                                    <div style={{ color: "#a0a0a0", fontSize: "0.8rem" }}>AI Copilot is streaming responses...</div>
                                </div>
                            ) : (
                                copilotResult || "Output will stream here once prompt completes..."
                            )}
                        </div>
                    </div>
                </div>

                {/* Apply / Cancel footer actions */}
                <div style={{ display: "flex", gap: "10px", marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "20px" }}>
                    <button
                        type="button"
                        onClick={handleApplyCopilotResult}
                        disabled={!copilotResult || copilotLoading}
                        className="submit-btn"
                        style={{ flex: 1, background: "#00c97f", color: "white", padding: "12px", borderRadius: "8px", fontWeight: "600", fontSize: "0.9rem", display: "flex", justifyItems: "center", justifyContent: "center", alignItems: "center", gap: "6px" }}
                    >
                        <i className="fa-solid fa-check"></i> Apply to Active Editor
                    </button>
                    <button
                        type="button"
                        onClick={() => setCopilotOpen(false)}
                        className="submit-btn"
                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "12px 18px", borderRadius: "8px", fontSize: "0.9rem" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>

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
