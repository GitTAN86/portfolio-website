"use client";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FeedbackModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [status, setStatus] = useState("");
    const [statusColor, setStatusColor] = useState("var(--color-primary)");
    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("Sending...");
        setStatusColor("var(--color-primary)");

        try {
            // Send via EmailJS
            await emailjs.send(
                "service_portfolio_bahman", 
                "template_27ket2s", 
                {
                    from_name: name,
                    from_email: email,
                    message: message
                },
                "ic3wP678PlaFs5XEg"
            );

            // Save to Firebase
            if (db) {
                await addDoc(collection(db, "feedback"), {
                    name,
                    email,
                    message,
                    timestamp: serverTimestamp()
                });
            }

            setStatus("Feedback sent! Thank you.");
            setStatusColor("#00ff88");
            setName("");
            setEmail("");
            setMessage("");

            setTimeout(() => {
                setIsOpen(false);
                setStatus("");
            }, 3000);

        } catch (err) {
            console.error(err);
            setStatus("Oops! Something went wrong.");
            setStatusColor("#EA4335");
        }
    };

    return (
        <>
            <button className="floating-btn" onClick={() => setIsOpen(true)}>
                <i className="fa-solid fa-comment-dots"></i> Feedback
            </button>
            
            {isOpen && (
                <div className="modal active" onClick={(e) => {
                    if(e.target.className === "modal active") setIsOpen(false);
                }}>
                    <div className="modal-content glass-card">
                        <span className="close-btn" onClick={() => setIsOpen(false)}>&times;</span>
                        <h2>Leave Feedback</h2>
                        <form onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                placeholder="Your Name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required 
                            />
                            <input 
                                type="email" 
                                placeholder="Your Email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                            <textarea 
                                placeholder="Your thoughts..." 
                                rows="4" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required 
                            />
                            <button type="submit" className="submit-btn">Send to Bahman</button>
                        </form>
                        {status && (
                            <p style={{ display: "block", marginTop: "10px", color: statusColor }}>
                                {status}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
