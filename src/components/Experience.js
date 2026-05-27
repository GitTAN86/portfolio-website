export default function Experience({ data }) {
    const experience = data?.experience || [];

    return (
        <section id="experience" className="section-padding scroll-section">
            <h2 className="section-title">Professional Journey</h2>
            {data?.sectionVisibility?.experienceTimeline !== false && (
                <div className="timeline">
                    {experience.length > 0 ? (
                        experience.map((exp, index) => (
                            <div key={index} className="timeline-item">
                                <div className="timeline-dot"></div>
                                <div className="glass-card timeline-content">
                                    <h3>{exp.title}</h3>
                                    <h4>{exp.company}</h4>
                                    <span className="timeline-date">{exp.date}</span>
                                    {exp.bullets && exp.bullets.length > 0 && (
                                        <ul>
                                            {exp.bullets.map((bullet, bIndex) => {
                                                // Make bold text before colon if it exists
                                                const parts = bullet.split(':');
                                                if(parts.length > 1) {
                                                    return (
                                                        <li key={bIndex}>
                                                            <strong>{parts[0]}:</strong>{parts.slice(1).join(':')}
                                                        </li>
                                                    );
                                                }
                                                return <li key={bIndex}>{bullet}</li>;
                                            })}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: "white" }}>Loading experience...</p>
                    )}
                </div>
            )}
        </section>
    );
}
