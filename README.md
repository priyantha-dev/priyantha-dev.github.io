# HT Priyantha — Multilingual Recruitment & Human Resources Portfolio

A static, mobile-first professional portfolio for Priyantha Harispaththuwa Tennege. Recruitment and talent acquisition remain the core professional identity, while AI-assisted vacancy content, recruitment video production, digital marketing, data, cybersecurity, communication and leadership are presented as supporting capabilities.

## Languages

The portfolio is available in three employer-facing languages:

- `index.html` — English
- `pl.html` — Polish
- `ru.html` — Russian

A language selector in the header allows visitors to switch between versions. Each version has its own `lang`, canonical URL, translated metadata and `hreflang` links.

## Professional documents

The `documents/` folder includes:

- English CV
- Polish CV
- English general cover letter
- Polish general cover letter
- 19 certificate records and verification files/links

Certificate cards intentionally do not display issue or validity dates. Official World Bank Group and The Open University logos are displayed on the relevant cards.

## Publish on GitHub Pages

1. Upload the **contents of this folder** to the root of the `priyantha-dev.github.io` repository.
2. Commit and push all files.
3. In GitHub, open **Settings → Pages** and publish from the main branch/root folder.
4. Refresh the live site once after publishing so the updated service-worker cache can activate.

No build process or external framework is required.

## Main update locations

- `index.html`, `pl.html`, `ru.html` — translated page content
- `assets/css/style.css` — responsive design and styling
- `assets/js/app.js` — credential records, language-aware labels, filters and interactions
- `documents/` — CVs, cover letters and certificate files
- `assets/js/config.js` — optional privacy-first analytics settings

Do not add private keys, passwords or confidential candidate information to the repository.
