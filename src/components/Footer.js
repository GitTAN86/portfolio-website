export default function Footer({ data }) {
    return (
        <footer id="contact" className="footer section-padding scroll-section">
            <div className="glass-card footer-card">
                <h2>Let's Connect</h2>
                <p>I am always looking for the next opportunity to build, optimize, and grow.</p>
                <div className="social-links">
                    <a href={data?.linkedin || "https://linkedin.com/in/bahman-noushabadi"} target="_blank" rel="noopener noreferrer" className="social-icon">
                        <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                    <a href={`mailto:${data?.email || "bahman.noushabadii@gmail.com"}`} className="social-icon">
                        <i className="fa-solid fa-envelope"></i>
                    </a>
                    <a href={`https://wa.me/${data?.whatsapp || "60194909004"}`} target="_blank" rel="noopener noreferrer" className="social-icon">
                        <i className="fa-brands fa-whatsapp"></i>
                    </a>
                </div>
                <p className="copyright">&copy; {new Date().getFullYear()} Bahman Noushabadi.</p>
            </div>
        </footer>
    );
}
