export default function Footer({ data }) {
    return (
        <footer id="contact" className="footer section-padding scroll-section">
            <div className="glass-card footer-card">
                <h2>Let's Connect</h2>
                <p>I am always looking for the next opportunity to build, optimize, and grow.</p>
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
                </div>
                <p className="copyright">&copy; {new Date().getFullYear()} {data?.heroName || ""}.</p>
            </div>
        </footer>
    );
}
