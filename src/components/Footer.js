export default function Footer({ data, locale = "en" }) {
    const FOOTER_TRANSLATIONS = {
        en: {
            connect: "Let's Connect",
            subtext: "I am always looking for the next opportunity to build, optimize, and grow.",
            cv: "CV"
        },
        fa: {
            connect: "بیایید با هم ارتباط برقرار کنیم",
            subtext: "من همیشه به دنبال فرصت بعدی برای ساختن، بهینه‌سازی و رشد هستم.",
            cv: "رزومه"
        },
        de: {
            connect: "Lass uns in Kontakt treten",
            subtext: "Ich bin immer auf der Suche nach der nächsten Gelegenheit zum Aufbauen, Optimieren und Wachsen.",
            cv: "CV"
        },
        ms: {
            connect: "Mari Berhubung",
            subtext: "Saya sentiasa mencari peluang seterusnya untuk membina, mengoptimumkan, dan berkembang.",
            cv: "CV"
        }
    };

    const t = FOOTER_TRANSLATIONS[locale] || FOOTER_TRANSLATIONS.en;
    const name = typeof data?.heroName === 'object' ? (data.heroName[locale] || data.heroName.en || "") : (data?.heroName || "");

    return (
        <footer id="contact" className="footer section-padding scroll-section">
            <div className="glass-card footer-card">
                <h2>{t.connect}</h2>
                <p>{t.subtext}</p>
                <div className="social-links">
                    <a href={data?.linkedin || "#"} target="_blank" rel="noopener noreferrer" className="social-icon">
                        <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                    <a href={data?.email ? `mailto:${data.email}` : "#"} className="social-icon">
                        <i className="fa-solid fa-envelope"></i>
                    </a>
                    <a href={data?.whatsapp ? `https://wa.me/${data.whatsapp}` : "#"} target="_blank" rel="noopener noreferrer" className="social-icon">
                        <i className="fa-brands fa-whatsapp"></i>
                    </a>
                    {data?.cvUrl && (
                        <a href={data.cvUrl} target="_blank" rel="noopener noreferrer" className="social-icon" title="Download CV" style={{ width: 'auto', padding: '0 20px', borderRadius: '30px', gap: '10px' }}>
                            <i className="fa-solid fa-file-pdf"></i> <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>{t.cv}</span>
                        </a>
                    )}
                </div>
                <p className="copyright">&copy; {new Date().getFullYear()} {name}.</p>
            </div>
        </footer>
    );
}
