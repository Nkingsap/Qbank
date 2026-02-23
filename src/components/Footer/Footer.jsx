import './Footer.css';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    // Predefined messages
    const whatsappMessage = encodeURIComponent(
        "Hi! I came across your Question Bank project and would like to know more."
    );

    const emailSubject = encodeURIComponent("Inquiry about your Question Bank project");
    const emailBody = encodeURIComponent(
        "Hello Nking Sap,\n\nI found your Question Bank project and wanted to ask a few questions or share some suggestions.\n\nLooking forward to your reply!\n"
    );

    // Instagram DM deep link (mobile-friendly)
    const instagramMessage = encodeURIComponent(
        "Hi! I saw your Question Bank project and wanted to know more."
    );
    const instagramLink = `https://www.instagram.com/direct/new/?text=${instagramMessage}`;

    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <span
                            className="footer-logo-text"
                            style={{ fontSize: '1.25rem' }}
                        >
                            Contact Me
                        </span>
                    </div>
                    <p className="footer-desc">
                        Have a question or want to contribute to the Question Bank
                        project? Feel free to reach out through any of the options below.
                    </p>
                </div>

                <div className="footer-links">
                    <div className="footer-col" style={{ alignItems: 'flex-start' }}>
                        <h4>Connect</h4>
                        <div className="footer-socials">

                            {/* Instagram with pre-typed DM */}
                            <a href={instagramLink} target="_blank" rel="noopener noreferrer">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                                Instagram
                            </a>

                            {/* WhatsApp with pre-typed message */}
                            <a
                                href={`https://wa.me/919863330216?text=${whatsappMessage}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 
                                    8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                                WhatsApp
                            </a>

                            {/* Email with pre-filled subject and body */}
                            <a
                                href={`mailto:nkingsap@gmail.com?subject=${emailSubject}&body=${emailBody}`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6
                                    c0-1.1.9-2 2-2z" />
                                    <polyline points="22,6 12,13 2,6" />
                                </svg>
                                Email
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {currentYear}. Built for students, by students.</p>
            </div>
        </footer>
    );
}