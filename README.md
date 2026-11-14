# Phạm Thanh Lâm — Portfolio

Personal portfolio for an **IT Support** professional (UIT, Computer Networks & Data Communications) building toward **Systems Administration**.

Live: https://thanhlam-neteng.github.io/Portfolio/

## Overview

Static, responsive single-page site built with HTML, CSS and vanilla JavaScript — no build step. It highlights hands-on IT Support experience first (gbc engineers, Maersk, FSI), then skills, certifications and side projects/labs.

## Features

- Experience-first layout: helpdesk, identity & access (Active Directory, Microsoft 365, MFA), endpoints
- English / Vietnamese switcher (remembers your choice, no flash on reload)
- Dark / light theme (follows the OS until you pick one)
- Certification filter tabs with live count
- Contact form via Formspree
- SEO / social: canonical URL, Open Graph image, JSON-LD `Person` schema

## Project Structure

```text
.
├── index.html                 # Page content — English is the single source of truth
├── assets/
│   ├── css/style.css
│   ├── js/
│   │   ├── translations.js    # Vietnamese strings only, keyed by data-i18n
│   │   └── app.js             # i18n, theme, nav, filters, form
│   └── images/
└── README.md
```

## Editing content

1. Edit the English text directly in `index.html`.
2. If the element has a `data-i18n="some.key"` attribute, update the same key in `assets/js/translations.js` (Vietnamese).
3. Any key missing from `translations.js` simply shows the English text.

## Run locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000

## Contact

- GitHub: [ThanhLam-NetEng](https://github.com/ThanhLam-NetEng)
- LinkedIn: [thanhlam-uit](https://www.linkedin.com/in/thanhlam-uit)
