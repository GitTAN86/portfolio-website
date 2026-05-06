export default function About({ data }) {
    return (
        <section id="about" className="about section-padding scroll-section">
            <h2 className="section-title">About Me</h2>
            <div className="about-grid">
                <div className="about-text glass-card">
                    {data?.aboutText ? (
                        <div dangerouslySetInnerHTML={{ __html: data.aboutText }} />
                    ) : (
                        <p>Loading...</p>
                    )}
                </div>
                <div className="gallery-container glass-card">
                    {data?.gallery && data.gallery.length > 0 ? (
                        data.gallery.map((url, index) => (
                            <div className="gallery-item" key={index}>
                                <img src={url} alt={`Gallery item ${index + 1}`} />
                            </div>
                        ))
                    ) : null}
                </div>
            </div>
        </section>
    );
}
