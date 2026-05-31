export default function Experience({ data, locale }) {
    const experience = data?.experience || [];

    return (
        <section id="experience" className="section-padding scroll-section">
            <h2 className="section-title">
                {locale === "fa" ? "سفر حرفه‌ای من" : locale === "de" ? "Beruflicher Werdegang" : locale === "ms" ? "Perjalanan Profesional" : "Professional Journey"}
            </h2>
            {data?.sectionVisibility?.experienceTimeline !== false && (
                <div className="timeline">
                    {experience.length > 0 ? (
                        experience.map((exp, index) => {
                            const expTitle = typeof exp.title === "object" ? (exp.title[locale] || exp.title["en"] || "") : exp.title;
                            const expCompany = typeof exp.company === "object" ? (exp.company[locale] || exp.company["en"] || "") : exp.company;

                            return (
                                <div key={index} className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="glass-card timeline-content">
                                        <h3>{expTitle}</h3>
                                        <h4>{expCompany}</h4>
                                        <span className="timeline-date">{exp.date}</span>
                                        {exp.bullets && exp.bullets.length > 0 && (
                                            <ul
                                                style={{
                                                    fontFamily: data?.experienceFontFamily || "inherit",
                                                    textAlign: data?.experienceTextAlign || "left"
                                                }}
                                            >
                                                {exp.bullets.map((bullet, bIndex) => {
                                                    const activeBullet = typeof bullet === "object" ? (bullet[locale] || bullet["en"] || "") : bullet;
                                                    // Make bold text before colon if it exists
                                                    const parts = activeBullet.split(':');
                                                    if(parts.length > 1) {
                                                        return (
                                                            <li key={bIndex}>
                                                                <strong>{parts[0]}:</strong>{parts.slice(1).join(':')}
                                                            </li>
                                                        );
                                                    }
                                                    return <li key={bIndex}>{activeBullet}</li>;
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <p style={{ color: "white" }}>Loading experience...</p>
                    )}
                </div>
            )}
        </section>
    );
}
