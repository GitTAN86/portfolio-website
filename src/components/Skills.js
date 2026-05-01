export default function Skills({ data }) {
    const skills = data?.skills || [];

    return (
        <section id="skills" className="section-padding scroll-section">
            <h2 className="section-title">Core Competencies</h2>
            <div className="skills-grid">
                {skills.length > 0 ? (
                    skills.map((skill, index) => (
                        <div key={index} className="glass-card skill-card">
                            <i className={`${skill.icon || 'fa-solid fa-star'} skill-icon`}></i>
                            <h3>{skill.title}</h3>
                            <p>{skill.description}</p>
                        </div>
                    ))
                ) : (
                    <p style={{ color: "white" }}>Loading skills...</p>
                )}
            </div>
        </section>
    );
}
