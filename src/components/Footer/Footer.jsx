import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <div className="footer-logo-icon">Q</div>
                        <span className="footer-logo-text">QBank</span>
                    </div>
                    <p className="footer-desc">
                        Your comprehensive repository for previous exam question papers.
                        Access study materials organized by department, semester, and exam type.
                    </p>
                </div>

                <div className="footer-links">
                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <a href="/">Home</a>
                        <a href="/browse">Browse Papers</a>
                        <a href="/login">Admin Login</a>
                    </div>
                    <div className="footer-col">
                        <h4>Exam Types</h4>
                        <span>Weekly Tests</span>
                        <span>CIA 1 & CIA 2</span>
                        <span>End Semester</span>
                    </div>
                    <div className="footer-col">
                        <h4>Semesters</h4>
                        <span>Semester 1–4</span>
                        <span>Semester 5–8</span>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} QBank. Built for students, by students.</p>
            </div>
        </footer>
    );
}
