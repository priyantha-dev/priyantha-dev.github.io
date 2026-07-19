(() => {
  'use strict';

  // GitHub Pages stability cleanup: remove legacy PWA workers/caches from older releases.
  // The portfolio is intentionally served as a normal static website.
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      }).catch(() => {});
    }
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).catch(() => {});
    }
  } catch (_) {}

  const config = window.PORTFOLIO_CONFIG || {};
  const root = document.documentElement;
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const safeStorage = {
    get(key) { try { return window.localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { window.localStorage.setItem(key, value); return true; } catch { return false; } }
  };

  const lang = ['pl','ru'].includes(root.lang) ? root.lang : 'en';
  const uiByLang = {
    en:{credentialId:'Credential ID',courseCode:'Course code',linkedInId:'LinkedIn Credential ID',certificateCode:'Certificate code',completionId:'Completion ID',additionalId:'Additional ID',learningArea:'Learning area',details:'Course details',openCertificate:'Open certificate ↗',verifyCredential:'Verify credential ↗',fileUnavailable:'Certificate file not added',themeLight:'Switch to Light Theme',themeDark:'Switch to Dark Theme',guardRight:'Right-click is disabled on this portfolio.',guardSelect:'Text selection is disabled on this portfolio.',guardCopy:'Copying portfolio content is disabled.',guardCut:'Cutting portfolio content is disabled.',guardDrag:'Dragging portfolio content is disabled.',guardAction:'This action is disabled on the portfolio.',guardScreen:'Screenshots cannot be fully blocked. Visible portfolio watermarking remains active.',guardPrint:'Printing is disabled for this portfolio.'},
    pl:{credentialId:'Identyfikator certyfikatu',courseCode:'Kod kursu',linkedInId:'Identyfikator LinkedIn',certificateCode:'Kod certyfikatu',completionId:'Identyfikator ukończenia',additionalId:'Dodatkowy identyfikator',learningArea:'Zakres wiedzy',details:'Szczegóły kursu',openCertificate:'Otwórz certyfikat ↗',verifyCredential:'Zweryfikuj certyfikat ↗',fileUnavailable:'Plik certyfikatu nie został dodany',themeLight:'Włącz jasny motyw',themeDark:'Włącz ciemny motyw',guardRight:'Kliknięcie prawym przyciskiem jest wyłączone w tym portfolio.',guardSelect:'Zaznaczanie tekstu jest wyłączone w tym portfolio.',guardCopy:'Kopiowanie treści portfolio jest wyłączone.',guardCut:'Wycinanie treści portfolio jest wyłączone.',guardDrag:'Przeciąganie treści portfolio jest wyłączone.',guardAction:'Ta czynność jest wyłączona w portfolio.',guardScreen:'Nie można całkowicie zablokować zrzutów ekranu. Widoczny znak wodny pozostaje aktywny.',guardPrint:'Drukowanie portfolio jest wyłączone.'},
    ru:{credentialId:'Идентификатор сертификата',courseCode:'Код курса',linkedInId:'Идентификатор LinkedIn',certificateCode:'Код сертификата',completionId:'Идентификатор завершения',additionalId:'Дополнительный идентификатор',learningArea:'Область обучения',details:'Данные курса',openCertificate:'Открыть сертификат ↗',verifyCredential:'Проверить сертификат ↗',fileUnavailable:'Файл сертификата не добавлен',themeLight:'Включить светлую тему',themeDark:'Включить тёмную тему',guardRight:'Контекстное меню отключено в этом портфолио.',guardSelect:'Выделение текста отключено в этом портфолио.',guardCopy:'Копирование содержимого портфолио отключено.',guardCut:'Вырезание содержимого портфолио отключено.',guardDrag:'Перетаскивание содержимого портфолио отключено.',guardAction:'Это действие отключено в портфолио.',guardScreen:'Полностью заблокировать снимки экрана невозможно. Видимый водяной знак остаётся активным.',guardPrint:'Печать портфолио отключена.'}
  };
  const ui = uiByLang[lang];
  const tr = value => typeof value === 'object' ? (value[lang] || value.en || '') : value;
  const credentialCount = count => {
    if (lang === 'pl') return `${count} ${count === 1 ? 'certyfikat' : (count >= 2 && count <= 4 ? 'certyfikaty' : 'certyfikatów')}`;
    if (lang === 'ru') {
      const mod10=count%10, mod100=count%100;
      const noun=mod10===1 && mod100!==11 ? 'сертификат' : (mod10>=2 && mod10<=4 && !(mod100>=12 && mod100<=14) ? 'сертификата' : 'сертификатов');
      return `${count} ${noun}`;
    }
    return `${count} credential${count === 1 ? '' : 's'}`;
  };

  const credentials = [
    {title:'Human Resources: Recruitment and Selection',issuer:'The Open University — OpenLearn',id:'B615_1',idLabel:'courseCode',skills:{en:'Job descriptions, person-job fit, fair recruitment, candidate assessment and selection',pl:'Opisy stanowisk, dopasowanie kandydata do roli, uczciwa rekrutacja, ocena i selekcja kandydatów',ru:'Описание должностей, соответствие кандидата роли, справедливый рекрутинг, оценка и отбор кандидатов'},href:'documents/Open-University-Human-Resources-Recruitment-and-Selection.pdf',group:'openuniversity',focus:'recruitment'},
    {title:'Human Resource for Health (Self-Paced)',issuer:'World Bank Group — Open Learning Campus',id:'0000116837-0000499027',skills:{en:'Human resources for health and workforce development',pl:'Zasoby ludzkie w ochronie zdrowia i rozwój kadr',ru:'Кадровые ресурсы здравоохранения и развитие персонала'},href:'documents/World-Bank-Human-Resource-for-Health-Certificate.pdf',group:'worldbank',focus:'recruitment'},
    {title:'SOE Leadership Program',issuer:'World Bank Group — Open Learning Campus',id:'0000113771-0000499027',skills:{en:'Leadership development and organizational effectiveness',pl:'Rozwój przywództwa i efektywność organizacyjna',ru:'Развитие лидерства и организационная эффективность'},href:'documents/World-Bank-SOE-Leadership-Program-Certificate.pdf',group:'worldbank',focus:'recruitment'},
    {title:'English as a Second Language in Healthcare',issuer:'Saylor University',id:'6511649294HP',details:{en:'10 hours • Grade 100%',pl:'10 godzin • Wynik 100%',ru:'10 часов • Результат 100%'},skills:{en:'Professional English communication in healthcare contexts',pl:'Profesjonalna komunikacja w języku angielskim w kontekście ochrony zdrowia',ru:'Профессиональная коммуникация на английском языке в сфере здравоохранения'},href:'documents/English-as-Second-Language-Certificate.pdf',group:'saylor',focus:'recruitment'},
    {title:'Email Marketing Certified',issuer:'HubSpot Academy',id:'yp9wg5x6',idLabel:'linkedInId',secondaryId:'bf4f82807ebd44658c59692a0ed3c182',secondaryIdLabel:'certificateCode',skills:{en:'Email strategy, segmentation, design, deliverability, testing and optimization',pl:'Strategia e-mail, segmentacja, projektowanie, dostarczalność, testowanie i optymalizacja',ru:'Стратегия e-mail, сегментация, дизайн, доставляемость, тестирование и оптимизация'},href:'documents/HubSpot-Email-Marketing-Certificate.png',group:'hubspot',focus:'marketing'},
    {title:'Social Media Marketing II Certified',issuer:'HubSpot Academy',id:'ddp0sxg9',idLabel:'linkedInId',secondaryId:'dcb8ed0a71544d3396e2b2ae458ad9e6',secondaryIdLabel:'certificateCode',skills:{en:'Inbound social strategy, storytelling, community-led growth, social commerce and short-form video',pl:'Strategia inbound w social media, storytelling, rozwój społeczności, social commerce i krótkie formaty wideo',ru:'Inbound-стратегия в соцсетях, сторителлинг, развитие сообществ, social commerce и короткие видео'},href:'documents/HubSpot-Social-Media-Marketing-II-Certificate.png',group:'hubspot',focus:'marketing'},
    {title:'Inbound Certified',issuer:'HubSpot Academy',id:'vy5trss6',idLabel:'linkedInId',secondaryId:'8ab5f9aa84394c24a58abc98172d6e6d',secondaryIdLabel:'certificateCode',skills:{en:'Inbound methodology, flywheel business models, prospect engagement and customer experience',pl:'Metodyka inbound, model flywheel, zaangażowanie odbiorców i doświadczenie klienta',ru:'Методология inbound, модель flywheel, вовлечение потенциальных клиентов и клиентский опыт'},href:'documents/HubSpot-Inbound-Certificate.png',group:'hubspot',focus:'marketing'},
    {title:'Foundations of Digital Marketing and E-commerce',issuer:'Google — Coursera',id:'2OWLM1DZLMA5',skills:{en:'Digital marketing, e-commerce and customer journey foundations',pl:'Podstawy marketingu cyfrowego, e-commerce i ścieżki klienta',ru:'Основы цифрового маркетинга, электронной коммерции и пути клиента'},href:'documents/Google-Foundations-of-Digital-Marketing-and-Ecommerce-Certificate.pdf',group:'google',focus:'marketing'},
    {title:'Google Ads Search Professional Certification',issuer:'Google Digital Academy — Skillshop',id:'187370677',skills:{en:'Google Search campaigns, strategy, Smart Bidding and performance optimization',pl:'Kampanie w wyszukiwarce Google, strategia, Smart Bidding i optymalizacja wyników',ru:'Поисковые кампании Google, стратегия, Smart Bidding и оптимизация эффективности'},href:'documents/Google-Ads-Search-Professional-Certification-2026.pdf',group:'google',focus:'marketing'},
    {title:'Google Ads Video Certification',issuer:'Google Digital Academy — Skillshop',id:'187267064',skills:{en:'YouTube and Google Video advertising for awareness, consideration and action goals',pl:'Reklama wideo w YouTube i Google dla celów świadomości, rozważania i działania',ru:'Видеореклама YouTube и Google для узнаваемости, рассмотрения и целевых действий'},href:'documents/Google-Ads-Video-Certification.pdf',group:'google',focus:'marketing'},
    {title:'Hotelier Certification',issuer:'Google',id:'470081231',idLabel:'completionId',details:{en:'Score 92',pl:'Wynik 92',ru:'Результат 92'},skills:{en:'Google Hotelier learning',pl:'Wiedza z programu Google Hotelier',ru:'Обучение по программе Google Hotelier'},href:'documents/Google-Hotelier-Certification.pdf',group:'google',focus:'marketing'},
    {title:'Ask Questions to Make Data-Driven Decisions',issuer:'Google — Coursera',id:'DX4DNM5X4O1V',skills:{en:'Analytical thinking, structured questions and data-driven decision foundations',pl:'Myślenie analityczne, formułowanie pytań i podstawy decyzji opartych na danych',ru:'Аналитическое мышление, структурирование вопросов и основы решений на данных'},href:'documents/Google-Ask-Questions-to-Make-Data-Driven-Decisions-Certificate.pdf',group:'google',focus:'data-tech'},
    {title:'Prepare Data for Exploration',issuer:'Google — Coursera',id:'5EE0AZRBVQDX',skills:{en:'Data preparation, data organization, data quality and exploration',pl:'Przygotowanie, organizacja, jakość i eksploracja danych',ru:'Подготовка, организация, качество и исследование данных'},href:'documents/Google-Prepare-Data-for-Exploration-Certificate.pdf',group:'google',focus:'data-tech'},
    {title:'Process Data from Dirty to Clean',issuer:'Google — Coursera',id:'9EVFEC8EH1XN',skills:{en:'Data cleaning, SQL, validation, quality and transformation',pl:'Czyszczenie danych, SQL, walidacja, jakość i transformacja',ru:'Очистка данных, SQL, проверка, качество и преобразование'},href:'documents/Google-Process-Data-from-Dirty-to-Clean-Certificate.pdf',group:'google',focus:'data-tech'},
    {title:'Google Analytics Certification',issuer:'Google Digital Academy — Skillshop',id:'187368156',skills:{en:'Analytics configuration, reporting, measurement and actionable insights',pl:'Konfiguracja analityki, raportowanie, pomiar i praktyczne wnioski',ru:'Настройка аналитики, отчётность, измерение и практические выводы'},href:'documents/Google-Analytics-Certification-2026.pdf',group:'google',focus:'data-tech'},
    {title:'Analyze Data to Answer Questions',issuer:'Google — Coursera',id:'2KITAMJOEK3K',details:{en:'Approximately 25 hours',pl:'Około 25 godzin',ru:'Около 25 часов'},skills:{en:'Data analysis, spreadsheets, SQL, transformation, quality and recruitment reporting support',pl:'Analiza danych, arkusze kalkulacyjne, SQL, transformacja, jakość i wsparcie raportowania rekrutacyjnego',ru:'Анализ данных, таблицы, SQL, преобразование, качество и поддержка рекрутинговой отчётности'},href:'https://coursera.org/verify/2KITAMJOEK3K',linkLabel:'verifyCredential',group:'google',focus:'data-tech'},
    {title:'Foundations of Cybersecurity',issuer:'Google — Coursera',id:'BDTORMPOH9GK',details:{en:'Approximately 10 hours',pl:'Około 10 godzin',ru:'Около 10 часов'},skills:{en:'Cybersecurity foundations, security ethics, risk awareness and responsible handling of candidate information',pl:'Podstawy cyberbezpieczeństwa, etyka bezpieczeństwa, świadomość ryzyka i odpowiedzialne przetwarzanie danych kandydatów',ru:'Основы кибербезопасности, этика безопасности, понимание рисков и ответственная работа с данными кандидатов'},href:'https://coursera.org/verify/BDTORMPOH9GK',linkLabel:'verifyCredential',group:'google',focus:'data-tech'},
    {title:'Management Information Systems',issuer:'Saylor University',id:'8195031520HP',details:{en:'57 hours • Grade 76%',pl:'57 godzin • Wynik 76%',ru:'57 часов • Результат 76%'},skills:{en:'Management information systems and business technology foundations',pl:'Systemy informacji zarządczej i podstawy technologii biznesowych',ru:'Управленческие информационные системы и основы бизнес-технологий'},href:'documents/Management-Information-Systems-Certificate.pdf',group:'saylor',focus:'data-tech'},
    {title:'Introduction to Computer Science II',issuer:'Saylor University',id:'2301818618HP',details:{en:'51 hours • Grade 75%',pl:'51 godzin • Wynik 75%',ru:'51 час • Результат 75%'},skills:{en:'Computer science foundations and structured technical learning',pl:'Podstawy informatyki i uporządkowane kształcenie techniczne',ru:'Основы компьютерных наук и системное техническое обучение'},href:'documents/Computer-Science-II-Certificate.pdf',group:'saylor',focus:'data-tech'}
  ];

  const googleMark = `<span class="issuer-mark" aria-hidden="true"><svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.2-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.2 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.3 5.3C40.9 35.4 44 30.4 44 24c0-1.3-.2-2.7-.4-4z"/></svg></span>`;
  const saylorMark = `<span class="issuer-mark saylor" aria-hidden="true"><img src="assets/icons/portfolio/saylor-academic.svg" alt=""/></span>`;
  const issuerMark = group => group === 'google'
    ? googleMark
    : group === 'saylor'
      ? saylorMark
      : group === 'worldbank'
        ? `<span class="issuer-mark issuer-logo issuer-logo-worldbank" aria-hidden="true"><img src="assets/icons/brands/world-bank-group.png" alt=""/></span>`
        : group === 'openuniversity'
          ? `<span class="issuer-mark issuer-logo issuer-logo-openuniversity" aria-hidden="true"><img src="assets/icons/brands/open-university.png" alt=""/></span>`
          : `<span class="issuer-mark hubspot" aria-hidden="true">H</span>`;

  const grid = qs('#credentialsGrid');
  if (grid) {
    grid.innerHTML = credentials.map(item => `
      <article class="credential-card reveal" data-group="${item.group}" data-focus="${item.focus}">
        <div class="credential-head">${issuerMark(item.group)}<span>${item.issuer}</span></div>
        <h3>${item.title}</h3>
        <div class="credential-meta">
          <span><b>${ui[item.idLabel || 'credentialId']}:</b> ${item.id}</span>
          ${item.secondaryId ? `<span><b>${ui[item.secondaryIdLabel || 'additionalId']}:</b> ${item.secondaryId}</span>` : ''}
          ${item.details ? `<span><b>${ui.details}:</b> ${tr(item.details)}</span>` : ''}
          <span><b>${ui.learningArea}:</b> ${tr(item.skills)}</span>
        </div>
        ${item.href
          ? `<a class="credential-link" href="${item.href}" target="_blank" rel="noopener" data-track="certificate-${item.id}">${item.linkLabel ? ui[item.linkLabel] : ui.openCertificate}</a>`
          : `<span class="credential-unavailable">${ui.fileUnavailable}</span>`}
      </article>`).join('');
  }

  const themeButton = qs('#themeButton');
  const savedTheme = safeStorage.get('ht-theme');
  if (savedTheme) root.dataset.theme = savedTheme;
  const updateThemeButton = () => {
    if (!themeButton) return;
    const isDark = root.dataset.theme === 'dark';
    themeButton.textContent = isDark ? '☀' : '☾';
    themeButton.setAttribute('aria-label', isDark ? ui.themeLight : ui.themeDark);
    themeButton.setAttribute('title', isDark ? ui.themeLight : ui.themeDark);
  };
  updateThemeButton();
  themeButton?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    safeStorage.set('ht-theme', next);
    updateThemeButton();
  });

  const languageSelect = qs('#languageSelect');
  languageSelect?.addEventListener('change', () => {
    const target = languageSelect.value;
    safeStorage.set('ht-language', target);
    window.location.href = target;
  });

  const menuButton = qs('#menuButton');
  const nav = qs('#siteNav');
  menuButton?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });
  qsa('#siteNav a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));
  document.addEventListener('click', event => {
    if (!nav?.classList.contains('open')) return;
    if (nav.contains(event.target) || menuButton?.contains(event.target)) return;
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !nav?.classList.contains('open')) return;
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.focus();
  });

  const navLinks = qsa('#siteNav a[href^="#"]');
  const navSections = navLinks
    .map(link => ({link, section: qs(link.getAttribute('href'))}))
    .filter(item => item.section);
  const setActiveNav = activeLink => {
    navLinks.forEach(link => {
      const active = link === activeLink;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const match = navSections.find(item => item.section === visible.target);
      if (match) setActiveNav(match.link);
    }, {rootMargin:'-25% 0px -62% 0px', threshold:[0,.1,.25,.5]});
    navSections.forEach(item => navObserver.observe(item.section));
  }

  const filterButtons = qsa('.filter');
  const updateCredentialFilter = button => {
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    const value = button.dataset.filter;
    let visible = 0;
    qsa('.credential-card').forEach(card => {
      const matches = value === 'all' || card.dataset.group === value || card.dataset.focus === value;
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    const summary = qs('.credential-summary strong');
    if (summary) summary.textContent = credentialCount(visible);
  };
  filterButtons.forEach(button => button.addEventListener('click', () => updateCredentialFilter(button)));
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:.11});
  qsa('.reveal').forEach(el => observer.observe(el));

  let toast = qs('#guardToast');
  let toastTimer;
  const showGuard = message => {
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'guardToast';
      toast.className = 'guard-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  };

  if (config.contentProtection) {
    root.classList.add('content-protected');
    document.body.style.webkitTouchCallout = 'none';

    const isEditable = target => Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'));
    const stopProtectedAction = (event, message) => {
      if (isEditable(event.target)) return;
      event.preventDefault();
      showGuard(message);
    };

    document.addEventListener('contextmenu', event => stopProtectedAction(event, ui.guardRight));
    document.addEventListener('selectstart', event => stopProtectedAction(event, ui.guardSelect));
    document.addEventListener('copy', event => stopProtectedAction(event, ui.guardCopy));
    document.addEventListener('cut', event => stopProtectedAction(event, ui.guardCut));
    document.addEventListener('dragstart', event => stopProtectedAction(event, ui.guardDrag));

    document.addEventListener('keydown', event => {
      if (isEditable(event.target)) return;
      const key = event.key.toLowerCase();
      const primary = event.ctrlKey || event.metaKey;
      const commonBlocked = primary && ['c','u','s','p','a'].includes(key);
      const windowsDevtools = event.ctrlKey && event.shiftKey && ['i','j','c'].includes(key);
      const macDevtools = event.metaKey && event.altKey && ['i','j','c','u'].includes(key);
      const directDevtools = event.key === 'F12';
      const contextKey = event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10');

      if (commonBlocked || windowsDevtools || macDevtools || directDevtools || contextKey) {
        event.preventDefault();
        event.stopPropagation();
        showGuard(ui.guardAction);
      }
      if (event.key === 'PrintScreen') {
        showGuard(ui.guardScreen);
      }
    }, true);

    window.addEventListener('beforeprint', () => showGuard(ui.guardPrint));
  }

  const consentKey = 'ht-analytics-consent';
  const analyticsConfigured = Boolean(config.googleAnalyticsId || config.cloudflareBeaconToken);
  let analyticsLoaded = false;

  function deleteAnalyticsCookies() {
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name.startsWith('_ga') || name === '_gid' || name === '_gat') {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname}; SameSite=Lax`;
      }
    });
  }

  function loadAnalytics() {
    if (analyticsLoaded || !analyticsConfigured) return;
    analyticsLoaded = true;
    if (config.googleAnalyticsId) {
      window[`ga-disable-${config.googleAnalyticsId}`] = false;
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.googleAnalyticsId)}`;
      document.head.appendChild(script);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function(){dataLayer.push(arguments)};
      gtag('js', new Date());
      gtag('config', config.googleAnalyticsId, {
        anonymize_ip:true,
        allow_google_signals:false,
        allow_ad_personalization_signals:false
      });
    }
    if (config.cloudflareBeaconToken) {
      const script = document.createElement('script');
      script.defer = true;
      script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
      script.dataset.cfBeacon = JSON.stringify({token:config.cloudflareBeaconToken});
      document.body.appendChild(script);
    }
  }

  function disableAnalytics() {
    if (config.googleAnalyticsId) window[`ga-disable-${config.googleAnalyticsId}`] = true;
    deleteAnalyticsCookies();
  }

  const consentBanner = qs('#consentBanner');
  const privacyModal = qs('#privacyModal');
  const consentToggle = qs('#analyticsConsentToggle');
  let lastFocusedElement = null;

  function openPrivacyModal() {
    if (!privacyModal) return;
    lastFocusedElement = document.activeElement;
    const choice = safeStorage.get(consentKey);
    if (consentToggle) consentToggle.checked = choice === 'accepted';
    privacyModal.hidden = false;
    document.body.style.overflow = 'hidden';
    qs('#closePrivacyModal')?.focus();
  }

  function closePrivacyModal() {
    if (!privacyModal) return;
    privacyModal.hidden = true;
    document.body.style.overflow = '';
    lastFocusedElement?.focus?.();
  }

  function saveConsent(choice, reloadIfNeeded = false) {
    const previous = safeStorage.get(consentKey);
    safeStorage.set(consentKey, choice);
    if (consentBanner) consentBanner.hidden = true;
    closePrivacyModal();
    if (choice === 'accepted') loadAnalytics();
    else disableAnalytics();
    if (reloadIfNeeded && previous && previous !== choice && analyticsLoaded) location.reload();
  }

  if (analyticsConfigured) {
    const savedConsent = safeStorage.get(consentKey);
    if (savedConsent === 'accepted') loadAnalytics();
    else if (savedConsent === 'rejected') disableAnalytics();
    else if (consentBanner) consentBanner.hidden = false;
  } else if (consentBanner) {
    consentBanner.hidden = true;
  }

  qs('#acceptAnalytics')?.addEventListener('click', () => saveConsent('accepted'));
  qs('#rejectAnalytics')?.addEventListener('click', () => saveConsent('rejected'));
  qs('#managePrivacy')?.addEventListener('click', openPrivacyModal);
  qs('#privacySettingsButton')?.addEventListener('click', openPrivacyModal);
  qs('#closePrivacyModal')?.addEventListener('click', closePrivacyModal);
  qs('#rejectAllModal')?.addEventListener('click', () => saveConsent('rejected', true));
  qs('#savePrivacyChoices')?.addEventListener('click', () => saveConsent(consentToggle?.checked ? 'accepted' : 'rejected', true));
  privacyModal?.addEventListener('click', event => { if (event.target === privacyModal) closePrivacyModal(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && privacyModal && !privacyModal.hidden) closePrivacyModal(); });

  qsa('[data-track]').forEach(link => link.addEventListener('click', () => {
    if (typeof window.gtag === 'function') gtag('event', 'portfolio_click', {target:link.dataset.track});
  }));

  let installPrompt;
  const installButton = qs('#installButton');
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); installPrompt = event;
    if (installButton) installButton.hidden = false;
  });
  installButton?.addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
  });

  if (config.enableServiceWorker && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./service-worker.js').catch(() => {}));
  }


  const goHome = event => {
    event?.preventDefault?.();
    nav?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    const htmlStyle = document.documentElement.style;
    const previousScrollBehavior = htmlStyle.scrollBehavior;
    htmlStyle.scrollBehavior = 'auto';
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo({top:0, left:0, behavior:'auto'});
    requestAnimationFrame(() => { htmlStyle.scrollBehavior = previousScrollBehavior; });
    try {
      if (history.replaceState && location.protocol !== 'about:') {
        history.replaceState(null, '', location.pathname + location.search);
      }
    } catch {}
  };
  qsa('[data-home], a[href="#home"], a[href="#top"]').forEach(link => {
    link.addEventListener('click', goHome);
  });

  const floatingHome = qs('#floatingHome');
  const updateFloatingHome = () => {
    if (!floatingHome) return;
    floatingHome.classList.toggle('visible', window.scrollY > 560);
  };
  window.addEventListener('scroll', updateFloatingHome, {passive:true});
  updateFloatingHome();

  const year = qs('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
