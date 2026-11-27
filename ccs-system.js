(() => {
  const primaryModules = [
    { id: 'dashboard', label: 'Home', icon: '⌂' },
    { id: 'about', label: 'About CCS', icon: 'ⓘ' },
    { id: 'programs', label: 'Programs & Students', icon: '▤' },
    { id: 'faculty', label: 'Faculty and Staff', icon: '♧' },
    { id: 'events', label: 'Academic Calendar', icon: '▦' },
    { id: 'resources', label: 'Resources', icon: '▧' },
    { id: 'gallery', label: 'Gallery', icon: '▣' },
    { id: 'downloads', label: 'Downloads', icon: '⇩' },
    { id: 'links', label: 'Links', icon: '↗' },
    { id: 'contact', label: 'Contact Us', icon: '✉' }
  ];
  const quickLinkItems = [['students', 'Student Portal (LMS)', '♙'], ['register', 'Online Enrollment', '＋'], ['resources', 'Course Schedules', '▦'], ['programs', 'Course Offerings', '▤'], ['resources', 'Forms and Requirements', '▧'], ['faculty', 'CCS Organization', '♧']];
  const modules = primaryModules;
  const schemas = {
    students: { title: 'Students', desc: 'Register students and manage student records.', singular: 'student', fields: [['name', 'Full name'], ['middleName', 'Middle name'], ['gender', 'Gender'], ['contactNumber', 'Contact number'], ['id', 'Student ID'], ['program', 'Course'], ['year', 'Year level'], ['email', 'Email'], ['birthDate', 'Date of birth', 'date'], ['address', 'Address']] },
    faculty: { title: 'Faculty and Staff', desc: 'Manage faculty and staff directory records.', singular: 'faculty member', fields: [['name', 'Full name'], ['role', 'Position'], ['department', 'Department'], ['email', 'Email']] },
    programs: { title: 'Programs Offered', desc: 'Explore the programs offered by the College of Computer Studies.', singular: 'program', fields: [['name', 'Program name'], ['code', 'Program code'], ['level', 'Degree level'], ['description', 'Description']] },
    events: { title: 'Academic Calendar', desc: 'Browse upcoming and past College of Computer Studies events.', singular: 'event', fields: [['name', 'Event name'], ['date', 'Date', 'date'], ['location', 'Location'], ['status', 'Status']] },
    announcements: { title: 'Announcements', desc: 'Publish updates for the CCS community.', singular: 'announcement', fields: [['title', 'Title'], ['date', 'Publish date', 'date'], ['category', 'Category'], ['body', 'Announcement details']] }
  };
  const seed = {
    students: [], faculty: [
      { name: 'Dether John J. Olaguir', role: 'Faculty and Staff', photo: 'images/Dether.jpg' },
      { name: 'Ronalyn L. Goyo', role: 'Faculty and Staff', photo: 'images/goyo_ronalyn.jpg' },
      { name: 'Glogerlie L. Jumandos', role: 'Faculty and Staff', photo: 'images/jumandos_glogerlie.jpg' },
      { name: 'Lawrence Alvert Libar', role: 'Faculty and Staff', photo: 'images/libar_lawrence_alvert.jpg' },
      { name: 'Raymon C. Peruda', role: 'Faculty and Staff', photo: 'images/peruda_raymon.jpg' }
    ],
    programs: [
      { name: 'Bachelor of Science in Information Technology', code: 'BSIT', level: 'Bachelor of Science', description: 'Program listed on the CCS website screenshot.' },
      { name: 'Bachelor of Science in Computer Science', code: 'BSCS', level: 'Bachelor of Science', description: 'Program listed on the CCS website screenshot.' }
    ],
    events: [
      { name: 'CCS General Assembly', date: '2026-09-01', location: '', status: 'Past' },
      { name: 'CCS Orientation', date: '2026-09-09', location: '', status: 'Past' },
      { name: 'CCS Career Talk', date: '2026-09-09', location: '', status: 'Past' },
      { name: 'CCS Community Activity', date: '2026-10-01', location: '', status: 'Past' },
      { name: 'CCS Department Year-End Party', date: '2026-12-14', location: '', status: 'Upcoming' }
    ],
    announcements: [
      { title: 'Enrollment for 1st Semester', date: '', category: 'Enrollment', body: 'AY 2026–2027 is now open!' },
      { title: 'CCS Orientation Schedule', date: '', category: 'Schedule', body: '' },
      { title: 'Capstone Title Hearing Schedule', date: '', category: 'Schedule', body: '' },
      { title: 'Updated Class Schedules', date: '', category: 'Schedule', body: '' },
      { title: 'Scholarship Opportunities', date: '', category: 'Opportunity', body: '' },
      { title: 'CCS Events and Activities', date: '', category: 'Events', body: '' },
      { title: 'Guidelines and Forms', date: '', category: 'Information', body: '' }
    ]
  };
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  document.body.classList.toggle('dark-mode', localStorage.getItem('ccsTheme') === 'dark');
  const menuHoverTrigger = document.createElement('button');
  menuHoverTrigger.type = 'button';
  menuHoverTrigger.id = 'menuHoverTrigger';
  menuHoverTrigger.className = 'menu-hover-trigger';
  menuHoverTrigger.setAttribute('aria-label', 'Open main menu');
  menuHoverTrigger.setAttribute('aria-controls', 'sidebar');
  menuHoverTrigger.setAttribute('aria-expanded', 'false');
  menuHoverTrigger.textContent = '☰';
  document.querySelector('.app').prepend(menuHoverTrigger);
  function readData() {
    try { return JSON.parse(localStorage.getItem('ccsSystemData')) || structuredClone(seed); }
    catch { return structuredClone(seed); }
  }
  let data = readData();
  let active = 'dashboard';
  let pageHistory = [];
  let isAuthenticated = true;
  let isAdmin = true;
  let currentUser = { name: 'CCS Administrator', role: 'admin' };
  let globalSearchQuery = '';
  let hoverMenuTimer;
  let undoRecord = null;
  let registration = null;
  let replaceIndex = null;
  let calendarMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let selectedCalendarDate = dateKey(new Date());
  for (const key of Object.keys(seed)) if (!Array.isArray(data[key])) data[key] = [];
  // Add screenshot-derived reference records once, without overwriting user records.
  if (!localStorage.getItem('ccsScreenshotSeeded')) {
    for (const [key, identity] of [['programs', 'code'], ['events', 'name'], ['announcements', 'title']]) {
      for (const record of seed[key]) if (!data[key].some(existing => existing[identity] === record[identity])) data[key].push(record);
    }
    localStorage.setItem('ccsScreenshotSeeded', 'true');
    save();
  }
  if (!localStorage.getItem('ccsYearEndPartySeeded')) {
    const party = seed.events.find(event => event.name === 'CCS Department Year-End Party');
    if (!data.events.some(event => event.name === party.name && event.date === party.date)) data.events.push(party);
    localStorage.setItem('ccsYearEndPartySeeded', 'true');
    save();
  }
  if (!localStorage.getItem('ccsFacultyPhotosSeeded')) {
    for (const person of seed.faculty) if (!data.faculty.some(existing => existing.photo === person.photo)) data.faculty.push(person);
    localStorage.setItem('ccsFacultyPhotosSeeded', 'true');
    save();
  }
  const peruda = data.faculty.find(person => person.photo === 'images/peruda_raymon.jpg');
  if (peruda?.name === 'Raymon Peruda') { peruda.name = 'Raymon C. Peruda'; save(); }
  const jumandos = data.faculty.find(person => person.photo === 'images/jumandos_glogerlie.jpg');
  if (jumandos?.name === 'Glogerlie Jumandos') { jumandos.name = 'Glogerlie L. Jumandos'; save(); }
  const goyo = data.faculty.find(person => person.photo === 'images/goyo_ronalyn.jpg');
  if (goyo?.name === 'Ronalyn Goyo') { goyo.name = 'Ronalyn L. Goyo'; save(); }
  const olaguir = data.faculty.find(person => person.photo === 'images/Dether.jpg');
  if (olaguir?.name === 'Dether') { olaguir.name = 'Dether John J. Olaguir'; save(); }
  function save() { localStorage.setItem('ccsSystemData', JSON.stringify(data)); }
  function notify(message, offerUndo = false) {
    $('modalRoot').innerHTML = `<div class="modal-backdrop action-backdrop"><section class="modal action-dialog" role="alertdialog" aria-modal="true" aria-labelledby="actionDialogTitle" aria-describedby="actionDialogMessage"><span class="action-dialog-icon" aria-hidden="true">✓</span><div class="modal-head"><h2 id="actionDialogTitle">Action confirmation</h2><button type="button" class="modal-x" id="closeActionDialog" aria-label="Close action message">×</button></div><p id="actionDialogMessage">${esc(message)}</p><div class="modal-actions">${offerUndo ? '<button type="button" class="secondary" id="undoAction">Undo</button>' : ''}<button type="button" class="primary" id="acknowledgeAction">OK</button></div></section></div>`;
    $('closeActionDialog').onclick = closeModal;
    $('acknowledgeAction').onclick = closeModal;
    if (offerUndo) $('undoAction').onclick = undoDelete;
    $('acknowledgeAction').focus();
  }
  function closeModal() { $('modalRoot').innerHTML = ''; }
  function enableTypingSuggestions(root) {
    root.querySelectorAll('select').forEach((select, index) => {
      const options = Array.from(select.options);
      const placeholder = options.find(option => !option.value)?.textContent.trim();
      const datalist = document.createElement('datalist');
      datalist.id = `choiceSuggestions-${index}-${select.name || 'field'}`;
      const input = document.createElement('input');
      input.type = 'text';
      input.name = select.name;
      input.id = select.id;
      input.className = select.className;
      input.value = select.value;
      input.required = select.required;
      input.disabled = select.disabled;
      input.autocomplete = 'off';
      input.placeholder = placeholder ? `${placeholder} or type to search` : 'Type or choose an option';
      for (const attribute of ['aria-label', 'aria-labelledby', 'aria-describedby']) {
        if (select.hasAttribute(attribute)) input.setAttribute(attribute, select.getAttribute(attribute));
      }
      input.setAttribute('list', datalist.id);
      options.filter(option => option.value).forEach(option => {
        const suggestion = document.createElement('option');
        suggestion.value = option.value;
        if (option.textContent.trim() !== option.value) suggestion.label = option.textContent.trim();
        datalist.append(suggestion);
      });
      select.replaceWith(input);
      input.after(datalist);
    });
  }
  function closeMenu() {
    clearTimeout(hoverMenuTimer);
    $('sidebar').classList.remove('open', 'hover-open');
    $('appView').classList.remove('menu-open');
    $('scrim').classList.remove('show');
    menuHoverTrigger.classList.remove('is-open');
    menuHoverTrigger.textContent = '☰';
    menuHoverTrigger.setAttribute('aria-label', 'Open main menu');
    menuHoverTrigger.setAttribute('aria-expanded', 'false');
    $('menuButton').setAttribute('aria-expanded', 'false');
  }
  function openHoverMenu() {
    if (!window.matchMedia('(hover: hover) and (min-width: 681px)').matches) return;
    clearTimeout(hoverMenuTimer);
    $('sidebar').classList.add('hover-open');
    $('appView').classList.add('menu-open');
    menuHoverTrigger.classList.add('is-open');
    menuHoverTrigger.textContent = '×';
    menuHoverTrigger.setAttribute('aria-label', 'Close main menu');
    menuHoverTrigger.setAttribute('aria-expanded', 'true');
  }
  function scheduleHoverMenuClose() {
    if (!window.matchMedia('(hover: hover) and (min-width: 681px)').matches) return;
    clearTimeout(hoverMenuTimer);
    hoverMenuTimer = setTimeout(() => {
      if ($('sidebar').matches(':hover') || menuHoverTrigger.matches(':hover') ||
        $('sidebar').contains(document.activeElement) || document.activeElement === menuHoverTrigger) return;
      closeMenu();
    }, 220);
  }
  function navigateTo(page, preserveSearch = false) {
    if (!isAuthenticated) return;
    if (page === 'students') page = 'programs';
    if (page === 'dashboard') pageHistory = [];
    else if (active !== page) {
      pageHistory.push(active);
      if (pageHistory.length > 40) pageHistory.shift();
    }
    active = page;
    if (!preserveSearch) {
      globalSearchQuery = '';
      $('systemSearch').value = '';
      $('systemSuggestions').innerHTML = '';
      $('systemSearch').setAttribute('aria-expanded', 'false');
    }
    closeMenu();
    render();
  }
  function goBack() {
    active = pageHistory.pop() || 'dashboard';
    if (active === 'dashboard') pageHistory = [];
    globalSearchQuery = '';
    $('systemSearch').value = '';
    $('systemSuggestions').innerHTML = '';
    $('systemSearch').setAttribute('aria-expanded', 'false');
    closeMenu();
    render();
  }
  function updateSuggestions() {
    const input = $('systemSearch');
    const list = $('systemSuggestions');
    const query = input.value.trim().toLowerCase();
    if (!query) {
      list.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      globalSearchQuery = '';
      if (active === 'resources' && $('search-announcements')) {
        $('search-announcements').value = '';
        updateAnnouncementRows('');
        renderAnnouncementSuggestions('');
      }
      if (schemas[active]) { const tableSearch = $('search-' + active); if (tableSearch) tableSearch.value = ''; render(); }
      return;
    }
    const found = Object.entries(schemas)
      .filter(([key]) => isAdmin || key !== 'students')
      .flatMap(([key, schema]) => (data[key] || [])
        .filter(record => schema.fields.some(field => String(record[field[0]] || '').toLowerCase().includes(query)))
        .map(record => ({ key, record, schema })))
      .slice(0, 8);
    list.innerHTML = found.length ? found.map(({ key, record, schema }, i) => {
      const title = record.name || record.title || record.code || 'Record';
      const detail = record.code || record.id || record.role || record.date || schema.title;
      return `<button type="button" class="suggestion-item" role="option" data-suggestion="${i}"><span class="suggestion-icon">${modules.find(m => m.id === key)?.icon || (key === 'announcements' ? '◉' : key === 'students' ? '♙' : '•')}</span><span><b>${esc(title)}</b><small>${esc(detail)}</small></span><span class="suggestion-type">${esc(schema.title)}</span></button>`;
    }).join('') : '<div class="suggestion-empty">No matching records found.</div>';
    input.setAttribute('aria-expanded', 'true');
    list.querySelectorAll('[data-suggestion]').forEach((button, i) => button.onclick = () => {
      const item = found[i];
      globalSearchQuery = item.record.name || item.record.title || item.record.code || '';
      input.value = globalSearchQuery;
      list.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      navigateTo(item.key === 'announcements' ? 'resources' : item.key, true);
    });
  }
  $('systemSearch').oninput = updateSuggestions;
  $('systemSearch').onkeydown = e => {
    if (e.key === 'Escape') { $('systemSuggestions').innerHTML = ''; $('systemSearch').setAttribute('aria-expanded', 'false'); }
    if (e.key === 'Enter') { e.preventDefault(); $('systemSuggestions').querySelector('[data-suggestion]')?.click(); }
  };
  document.addEventListener('click', e => {
    if (!e.target.closest('.system-search-wrap')) { $('systemSuggestions').innerHTML = ''; $('systemSearch').setAttribute('aria-expanded', 'false'); }
  });
  document.querySelector('.topbar').insertBefore(document.querySelector('.system-search-wrap'), document.querySelector('.top-actions'));
  $('menuButton').onclick = () => {
    $('sidebar').classList.add('open');
    $('scrim').classList.add('show');
    $('menuButton').setAttribute('aria-expanded', 'true');
  };
  menuHoverTrigger.addEventListener('mouseenter', openHoverMenu);
  menuHoverTrigger.addEventListener('mouseleave', scheduleHoverMenuClose);
  menuHoverTrigger.addEventListener('focus', () => {
    openHoverMenu();
    $('closeMenu').focus();
  });
  menuHoverTrigger.addEventListener('blur', scheduleHoverMenuClose);
  menuHoverTrigger.onclick = () => {
    if ($('sidebar').classList.contains('hover-open')) closeMenu();
    else openHoverMenu();
  };
  $('sidebar').addEventListener('mouseenter', openHoverMenu);
  $('sidebar').addEventListener('mouseleave', scheduleHoverMenuClose);
  $('closeMenu').onclick = closeMenu; $('scrim').onclick = closeMenu;
  function updateThemeToggle() {
    const isDark = document.body.classList.contains('dark-mode');
    $('themeToggle').setAttribute('aria-pressed', String(isDark));
    $('themeToggle').setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    $('themeToggle').title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    $('themeIcon').textContent = isDark ? '☀' : '☾';
    document.querySelector('meta[name="theme-color"]').content = isDark ? '#111a14' : '#126344';
  }
  $('themeToggle').onclick = () => {
    const isDark = !document.body.classList.contains('dark-mode');
    localStorage.setItem('ccsTheme', isDark ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', isDark);
    updateThemeToggle();
  };
  updateThemeToggle();
  const chatbotPanel = $('chatbotPanel');
  const chatbotToggle = $('chatbotToggle');
  function setChatbotOpen(open) {
    chatbotPanel.classList.toggle('open', open);
    chatbotPanel.setAttribute('aria-hidden', String(!open));
    chatbotToggle.setAttribute('aria-expanded', String(open));
    chatbotToggle.setAttribute('aria-label', open ? 'Close CCS Assistant' : 'Open CCS Assistant');
    if (open) $('chatbotInput').focus();
    else chatbotToggle.focus();
  }
  function chatbotAnswer(question) {
    const query = question.toLowerCase();
    if (/hello|hi\b|hey/.test(query)) return 'Hello! I can help with CCS programs, student registration, faculty, events, resources, and contact information.';
    if (/register|enroll|enrollment|student/.test(query)) return 'To register a student, open Programs & Students from the menu and choose Register student. You can review the available courses before submitting.';
    if (/program|course|degree|bsit|bscs/.test(query)) {
      const programs = data.programs.map(program => `${program.name} (${program.code})`).join('; ');
      return programs ? `CCS currently lists: ${programs}. Open Programs & Students for more details.` : 'There are no programs listed yet. Open Programs & Students to check for updates.';
    }
    if (/faculty|staff|teacher|instructor/.test(query)) {
      const people = data.faculty.map(person => person.name).filter(Boolean).join(', ');
      return people ? `The CCS faculty and staff directory includes: ${people}. Open Faculty and Staff to view the directory.` : 'No faculty or staff entries are listed yet. Open Faculty and Staff to check for updates.';
    }
    if (/event|calendar|schedule|upcoming/.test(query)) {
      const events = data.events.filter(event => event.status !== 'Past').slice(0, 5)
        .map(event => `${event.name}${event.date ? ` (${event.date})` : ''}`).join('; ');
      return events ? `Upcoming CCS events: ${events}. Open Academic Calendar for the full calendar.` : 'No upcoming events are listed. Open Academic Calendar to check for updates.';
    }
    if (/contact|email|address|location|phone/.test(query)) return 'You can contact the College of Computer Studies at pseudocode.comsociety@gmail.com or open Contact Us for the college address and other contact options.';
    if (/resource|announcement|form|requirement/.test(query)) return 'Open Resources from the menu to browse announcements, forms, and other CCS information.';
    if (/about|college|ccs|mission|vision/.test(query)) return 'The College of Computer Studies is part of De La Salle John Bosco College. Its guiding line is “Technology for People. Innovation for a Better Society.” Open About CCS to learn more.';
    return 'I can help with CCS programs, student registration, faculty, events, resources, and contact information. Try asking about one of these topics.';
  }
  function sendChatMessage(question) {
    const text = question.trim();
    if (!text) return;
    const messages = $('chatbotMessages');
    const userMessage = document.createElement('p');
    userMessage.className = 'chat-message user';
    userMessage.textContent = text;
    messages.append(userMessage);
    const assistantMessage = document.createElement('p');
    assistantMessage.className = 'chat-message assistant';
    assistantMessage.textContent = chatbotAnswer(text);
    messages.append(assistantMessage);
    messages.scrollTop = messages.scrollHeight;
    $('chatbotInput').value = '';
    $('chatbotInput').focus();
  }
  chatbotToggle.onclick = () => setChatbotOpen(!chatbotPanel.classList.contains('open'));
  $('chatbotClose').onclick = () => setChatbotOpen(false);
  $('chatbotForm').onsubmit = event => {
    event.preventDefault();
    sendChatMessage($('chatbotInput').value);
  };
  document.querySelectorAll('[data-chat-prompt]').forEach(button => {
    button.onclick = () => sendChatMessage(button.dataset.chatPrompt);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && chatbotPanel.classList.contains('open')) setChatbotOpen(false);
  });
  function renderNav() {
    const navButton = m => `<button class="nav-link ${active === m.id ? 'active' : ''}" data-nav="${m.id}"><span class="nav-icon">${m.icon}</span>${m.label}</button>`;
    $('navigation').innerHTML = primaryModules.map(navButton).join('');
    document.querySelectorAll('[data-nav]').forEach(el => el.onclick = () => navigateTo(el.dataset.nav));
  }
  function setHeading(title, description, action = '') {
    const heading = document.querySelector('.page-heading');
    let headingMain = heading.querySelector('.page-heading-main');
    if (!headingMain) {
      const titleBlock = $('pageTitle').parentElement;
      headingMain = document.createElement('div');
      headingMain.className = 'page-heading-main';
      const backButton = document.createElement('button');
      backButton.type = 'button';
      backButton.className = 'page-back-button';
      backButton.textContent = '← Back';
      backButton.setAttribute('aria-label', 'Go to the previous page');
      backButton.onclick = goBack;
      heading.insertBefore(headingMain, titleBlock);
      headingMain.append(backButton, titleBlock);
    }
    const backButton = headingMain.querySelector('.page-back-button');
    backButton.classList.toggle('hidden', active === 'dashboard');
    backButton.disabled = pageHistory.length === 0;
    $('crumbTitle').textContent = title; $('pageTitle').textContent = title; $('pageDescription').textContent = description; $('headingActions').innerHTML = action;
  }
  function dateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  function render() {
    if (!isAuthenticated) return;
    if (active === 'announcements') active = 'resources';
    if (active === 'students') active = 'programs';
    $('appView').classList.toggle('home-view', active === 'dashboard');
    renderNav();
    $('userLabel').textContent = currentUser.name;
    $('roleLabel').textContent = isAdmin ? 'Administrator access' : 'Read-only access';
    $('logoutButton').classList.add('hidden');
    $('topAvatar').textContent = isAdmin ? 'AD' : 'US';
    if (active === 'dashboard') return dashboard();
    if (active === 'programs') return programsStudentsPage();
    if (schemas[active] && active !== 'announcements') return tablePage(active);
    if (active === 'about') return aboutPage();
    if (active === 'resources') return resourcesPage();
    if (active === 'gallery') return galleryPage();
    if (active === 'downloads') return downloadsPage();
    if (active === 'links') return linksPage();
    if (active === 'contact') return contactPage();
  }
  function dashboard() {
    setHeading('Home', 'College snapshot and information management workspace.', '<div class="heading-quote">Forming lives. Building a better place tomorrow</div>');
    const upcoming = data.events.filter(x => x.date && new Date(x.date) >= new Date(new Date().toDateString())).length;
    const cards = [['Student records', data.students.length, '♙', 'Records entered in this workspace'], ['Faculty and staff records', data.faculty.length, '♧', 'Directory records entered'], ['Available Programs', data.programs.length, '▤', 'BSIT and BSCS'], ['Upcoming Events', upcoming, '▦', 'Based on scheduled dates'], ['Announcements', data.announcements.length, '◉', 'Updates in the resource center']];
    const stats = cards.map(c => `<div class="stat-card"><div class="stat-top"><span>${c[0]}</span><i class="stat-icon">${c[2]}</i></div><strong>${c[1]}</strong><small>${c[3]}</small></div>`).join('');
    const notices = data.announcements.slice(0, 4);
    $('content').innerHTML = `<div class="dashboard-meta"><span class="local-label">Local preview · saved in this browser</span></div><div class="cards">${stats}</div><div class="two-col"><section class="panel"><div class="panel-heading"><div><h2>Programs offered</h2><p>Programs named in the CCS source image</p></div><button class="text-button" data-jump="programs">Manage</button></div>${data.programs.map(p => `<div class="activity"><i class="activity-icon">▤</i><div><b>${esc(p.name)}</b><small>${esc(p.code)}</small></div></div>`).join('')}<div class="panel-heading" style="margin-top:18px"><div><h2>Upcoming events</h2><p>Events listed on the source site</p></div><button class="text-button" data-jump="events">Calendar</button></div>${data.events.filter(x => x.status !== 'Past').map(e => `<div class="activity"><i class="activity-icon">▦</i><div><b>${esc(e.name)}</b><small>${esc(e.date)}</small></div></div>`).join('') || '<div class="empty">Events listed in the source image were September 1, September 9, and October 1, 2026.</div>'}</section><div><section class="panel"><div class="panel-heading"><div><h2>Announcements</h2><p>Items listed on the CCS source site</p></div><button class="text-button" data-jump="resources">View all</button></div>${notices.map(n => `<div class="notice"><span class="tag">${esc(n.category || 'Announcement')}</span><h3>${esc(n.title)}</h3><p>${esc(n.body || 'Details were not visible in the supplied screenshot.')}</p></div>`).join('')}</section><section class="panel quick-links-panel"><div class="panel-heading"><div><h2>Quick Links</h2><p>Frequently used CCS resources</p></div></div><div class="quick-link-list">${quickLinkItems.map(([target, label, icon]) => `<button type="button" class="quick-link" data-shortcut="${target}"><span>${icon}</span><b>${label}</b><i>↗</i></button>`).join('')}</div></section></div></div>`;
    const eventHeading = [...document.querySelectorAll('.panel-heading h2')].find(heading => heading.textContent === 'Upcoming events');
    const eventGallery = document.createElement('div');
    eventGallery.className = 'event-gallery';
    eventGallery.innerHTML = [
      ['images/900427085_1614017133860100_1497004823045171799_n.jpg', 'Thematic Culminating Activity'],
      ['images/902622825_1892139535002387_283458150286983513_n (1).jpg', 'Honors Convocation'],
      ['images/904300491_1812082236731387_1787381669309662893_n.jpg', 'CCS Community Activity']
    ].map(([image, title]) => `<article class="event-card"><img src="${image}" alt="${title}"><b>${title}</b><small>College of Computer Studies</small></article>`).join('');
    eventHeading?.closest('.panel-heading').insertAdjacentElement('afterend', eventGallery);
    eventHeading?.closest('.panel')?.querySelector('.empty')?.remove();
    document.querySelectorAll('[data-jump]').forEach(x => x.onclick = () => navigateTo(x.dataset.jump));
    bindShortcuts();
  }
  function programsStudentsPage() {
    setHeading('Programs & Students', 'Explore CCS programs and manage student registration and records in one place.');
    const term = globalSearchQuery;
    const programRows = data.programs || [];
    const programMatches = programRows.map((record, index) => ({ r: record, i: index }))
      .filter(({ r }) => schemas.programs.fields.some(field => String(r[field[0]] || '').toLowerCase().includes(term.toLowerCase())));
    const programHeaders = schemas.programs.fields.map(field => `<th>${esc(field[1])}</th>`).join('');
    const programPanel = `<section class="panel"><div class="panel-heading"><div><h2>Programs offered</h2><p>${programRows.length} ${programRows.length === 1 ? 'program' : 'programs'} · ${isAdmin ? 'Admin access' : 'Read-only access'}</p></div>${isAdmin ? '<button class="primary" id="addRecord" data-record-key="programs">＋ Add program</button>' : ''}</div><div class="table-tools"><div class="search-box"><input id="search-programs" placeholder="Search programs..." value="${esc(term)}" aria-label="Search programs"></div><span class="local-pill">${programRows.length} programs</span></div><div class="table-wrap"><table><thead><tr>${programHeaders}</tr></thead><tbody>${renderTableRows('programs', programMatches, term)}</tbody></table></div></section>`;
    let studentSection;
    if (isAdmin) {
      const studentRows = data.students || [];
      const studentMatches = studentRows.map((record, index) => ({ r: record, i: index }))
        .filter(({ r }) => schemas.students.fields.some(field => String(r[field[0]] || '').toLowerCase().includes(term.toLowerCase())));
      const studentHeaders = schemas.students.fields.map(field => `<th>${esc(field[1])}</th>`).join('');
      studentSection = `<section class="panel"><div class="panel-heading"><div><h2>Student records</h2><p>${studentRows.length} ${studentRows.length === 1 ? 'record' : 'records'} · Admin access</p></div><button class="secondary" id="registerStudent">＋ Register student</button></div><div class="table-tools"><div class="search-box"><input id="search-students" placeholder="Search students..." value="${esc(term)}" aria-label="Search students"></div><span class="local-pill">${studentRows.length} records</span></div><div class="table-wrap"><table><thead><tr>${studentHeaders}</tr></thead><tbody>${renderTableRows('students', studentMatches, term)}</tbody></table></div></section>`;
    } else {
      const availableCourses = registrationCourses();
      studentSection = `<section class="panel"><div class="panel-heading"><div><h2>Student registration</h2><p>Choose an available program above, then enter and review your details.</p></div><button class="primary" id="registerStudent">＋ Start registration</button></div><section class="course-notice" aria-labelledby="availableCoursesTitle"><div class="course-notice-heading"><span class="course-notice-icon" aria-hidden="true">▤</span><div><h3 id="availableCoursesTitle">Available courses</h3><p>These CCS programs are available for registration.</p></div><span class="course-count">${availableCourses.length} ${availableCourses.length === 1 ? 'program' : 'programs'}</span></div><div class="course-options" role="list">${availableCourses.map(program => `<article class="course-option" role="listitem"><div class="course-option-top"><span class="course-code">${esc(program.code)}</span><span class="course-available">Available</span></div><b>${esc(program.name)}</b></article>`).join('') || '<p class="course-empty">No courses are currently listed.</p>'}</div></section></section>`;
    }
    $('content').innerHTML = `${programPanel}${studentSection}`;
    $('registerStudent').onclick = startRegistration;
    $('search-programs').oninput = () => {
      globalSearchQuery = $('search-programs').value;
      $('systemSearch').value = globalSearchQuery;
      programsStudentsPage();
    };
    if ($('search-students')) $('search-students').oninput = () => {
      globalSearchQuery = $('search-students').value;
      $('systemSearch').value = globalSearchQuery;
      programsStudentsPage();
    };
    bindRecordActions('programs');
    if (isAdmin) bindRecordActions('students');
  }
  function bindShortcuts() {
    document.querySelectorAll('[data-shortcut]').forEach(button => button.onclick = () => {
      if (button.dataset.shortcut === 'register') startRegistration();
      else navigateTo(button.dataset.shortcut);
    });
  }
  function renderInformationPage(title, description, content) {
    setHeading(title, description);
    $('content').innerHTML = content;
    document.querySelectorAll('[data-page-link]').forEach(button => button.onclick = () => navigateTo(button.dataset.pageLink));
  }
  function pageLink(id, title, description, icon) {
    return `<button type="button" class="page-link-card" data-page-link="${id}"><span class="page-link-icon" aria-hidden="true">${icon}</span><span><b>${title}</b><small>${description}</small></span><i aria-hidden="true">›</i></button>`;
  }
  function aboutPage() {
    renderInformationPage('About CCS', 'Learn about the College of Computer Studies at De La Salle John Bosco College.', `<div class="info-grid"><section class="panel info-feature"><span class="info-eyebrow">COLLEGE OF COMPUTER STUDIES</span><h2>Technology for People. Innovation for a Better Society.</h2><p>The College of Computer Studies offers programs in Information Technology and Computer Science.</p></section><section class="panel info-panel"><div class="panel-heading"><h2>About the college</h2></div><p>CCS is part of De La Salle John Bosco College. This information system brings together the college's programs, faculty directory, student registration, academic calendar, and resources.</p></section><section class="panel info-panel info-programs"><div class="panel-heading"><h2>Programs offered</h2></div>${data.programs.map(program => `<article class="info-program"><span>${esc(program.code)}</span><b>${esc(program.name)}</b></article>`).join('')}</section><section class="panel info-panel"><div class="panel-heading"><h2>Explore CCS</h2></div><div class="page-link-list">${pageLink('programs', 'Programs & Students', 'View programs, student registration, and records.', '▤')}${pageLink('faculty', 'Faculty and Staff', 'Meet the CCS team.', '♧')}${pageLink('events', 'Academic Calendar', 'Browse scheduled events.', '▦')}</div></section></div>`);
  }
  function resourcesPage() {
    const resourceLinks = [
      ['programs', 'Programs & Students', 'Review available programs and manage student registration or records.', '▤'],
      ['events', 'Academic Calendar', 'Check scheduled college events.', '▦'],
      ['downloads', 'Downloads', 'Check for available forms and files.', '⇩']
    ];
    renderInformationPage('Resources', 'Find useful program, calendar, and college information.', `<div class="info-grid"><section class="panel info-panel"><div class="panel-heading"><h2>Browse resources</h2></div><div class="page-link-list">${resourceLinks.map(([id, title, desc, icon]) => pageLink(id, title, desc, icon)).join('')}</div></section><section class="panel info-panel"><div class="panel-heading"><div><h2>Announcements and updates</h2><p>${data.announcements.length} updates for the CCS community.</p></div>${isAdmin ? '<button class="primary" id="addRecord">＋ Add announcement</button>' : ''}</div><div class="resource-announcement-search"><input id="search-announcements" type="search" value="${esc(globalSearchQuery)}" placeholder="Search announcements..." aria-label="Search announcements" autocomplete="off"></div><div id="resourceAnnouncements" class="resource-announcements"></div></section></div>`);
    setupAnnouncementSearch();
    $('search-announcements').oninput = () => {
      globalSearchQuery = $('search-announcements').value;
      $('systemSearch').value = globalSearchQuery;
      updateAnnouncementRows(globalSearchQuery);
      renderAnnouncementSuggestions(globalSearchQuery);
    };
    updateAnnouncementRows(globalSearchQuery);
    bindRecordActions('announcements');
  }
  function galleryPage() {
    const galleryImages = [
      ['images/897130334_1669887268105821_3900373953577191344_n.jpg', 'CCS faculty and staff celebration'],
      ['images/900427085_1614017133860100_1497004823045171799_n.jpg', 'Thematic Culminating Activity'],
      ['images/901257541_2227492497860728_1486772556114530553_n.jpg', 'CCS Enrollment Schedule'],
      ['images/902622794_1481548387437613_5230150613049433895_n.jpg', 'Honors Convocation'],
      ['images/902622825_1892139535002387_283458150286983513_n (1).jpg', 'CCS Community Activity'],
      ['images/904300491_1812082236731387_1787381669309662893_n.jpg', 'National Heroes Day'],
      ['images/905070337_1789424555507014_6287940133898649503_n.jpg', 'Midterm Exam Announcement'],
      ['images/Background.jpg', 'College of Computer Studies campus'],
      ['images/logo.jpg', 'College of Computer Studies logo'],
      ...seed.faculty.map(person => {
        const current = data.faculty.find(item => item.photo === person.photo);
        return [person.photo, current?.name || person.name];
      })
    ];
    const includedPhotos = new Set(galleryImages.map(([src]) => src));
    const additionalPhotos = data.faculty.filter(person => person.photo && !includedPhotos.has(person.photo)).map(person => [person.photo, person.name]);
    const images = [...galleryImages, ...additionalPhotos].map(([src, title]) => `<figure class="gallery-card"><img src="${esc(src)}" alt="${esc(title)}" loading="lazy"><figcaption>${esc(title)}</figcaption></figure>`);
    renderInformationPage('Gallery', 'Photos, posters, portraits, and college graphics from the CCS image folder.', `<section class="panel gallery-panel"><div class="gallery-grid">${images.join('')}</div></section>`);
  }
  function downloadsPage() {
    renderInformationPage('Downloads', 'Forms and files shared by the College of Computer Studies.', `<section class="panel downloads-empty"><span class="downloads-icon" aria-hidden="true">⇩</span><h2>No downloads available yet</h2><p>Downloadable forms and files have not been added to this local preview.</p></section>`);
  }
  function linksPage() {
    renderInformationPage('Links', 'Quick links to frequently used CCS resources.', `<section class="panel quick-links-panel"><div class="panel-heading"><div><h2>Quick Links</h2><p>Frequently used CCS resources, also available from Home.</p></div></div><div class="quick-link-list">${quickLinkItems.map(([target, title, icon]) => `<button type="button" class="quick-link" data-shortcut="${target}"><span>${icon}</span><b>${title}</b><i>↗</i></button>`).join('')}</div></section>`);
    bindShortcuts();
  }
  function contactPage() {
    const contactContent = `<div class="contact-layout"><div class="info-grid"><section class="panel info-feature"><span class="info-eyebrow">DE LA SALLE JOHN BOSCO COLLEGE</span><h2>College of Computer Studies</h2><p>Technology for People. Innovation for a Better Society.</p></section><section class="panel info-panel contact-details"><div class="panel-heading"><h2>Contact information</h2></div><article class="contact-item"><span class="contact-item-icon" aria-hidden="true">⌖</span><div><h3>Location</h3><address>De La Salle John Bosco College (DLSJBC) is located at La Salle Drive, John Bosco District, Barangay Mangagoy, City of Bislig, 8311 Surigao del Sur, Philippines.</address></div></article><article class="contact-item"><span class="contact-item-icon" aria-hidden="true">✉</span><div><h3>Email</h3><a href="mailto:pseudocode.comsociety@gmail.com">pseudocode.comsociety@gmail.com</a></div></article><article class="contact-item"><span class="contact-item-icon" aria-hidden="true">▤</span><div><h3>Message</h3><p>DLSJBC-College of Computer Studies</p></div></article><article class="contact-item"><span class="contact-item-icon" aria-hidden="true">f</span><div><h3>Facebook</h3><a href="https://web.facebook.com/dlsjbc.ccs" target="_blank" rel="noopener noreferrer">Visit DLSJBC College of Computer Studies ↗</a></div></article></section></div><section class="panel contact-form-panel"><div class="panel-heading"><div><h2>Send an inquiry or concern</h2><p>Share your message with the College of Computer Studies.</p></div></div><form id="contactMessageForm" class="contact-form"><div class="contact-form-grid"><label for="contactName">Your name<input id="contactName" name="name" type="text" autocomplete="name" maxlength="80" required></label><label for="contactEmail">Email address<input id="contactEmail" name="email" type="email" autocomplete="email" maxlength="254" required></label><label for="contactTopic">Message type<select id="contactTopic" name="topic" required><option value="" selected disabled>Choose a type</option><option>Inquiry</option><option>Concern</option><option>Other</option></select></label><label for="contactSubject">Subject<input id="contactSubject" name="subject" type="text" maxlength="120" placeholder="Briefly describe your message" required></label></div><label for="contactMessage">Your message<textarea id="contactMessage" name="message" rows="6" maxlength="2000" placeholder="Type your question or concern here..." required></textarea><span class="contact-message-meta"><span>Avoid including passwords or sensitive information.</span><span id="contactMessageCount" aria-live="polite">0 / 2000</span></span></label><button class="primary" type="submit">Continue to email</button><p class="contact-form-note">This local preview does not send messages directly. Your email app will open with the message ready; review it and press Send.</p></form></section></div>`;
    renderInformationPage('Contact Us', 'Get in touch with the College of Computer Studies.', contactContent);
    enableTypingSuggestions($('contactMessageForm'));
    $('contactMessage').oninput = () => {
      $('contactMessageCount').textContent = `${$('contactMessage').value.length} / 2000`;
    };
    $('contactMessageForm').onsubmit = event => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      const name = String(fields.get('name') || '').trim();
      const email = String(fields.get('email') || '').trim();
      const topic = String(fields.get('topic') || '').trim();
      const messageSubject = String(fields.get('subject') || '').trim();
      const message = String(fields.get('message') || '').trim();
      if (!name || !email || !topic || !messageSubject || !message) {
        notify('Please complete all fields before continuing.');
        return;
      }
      const subject = `CCS ${topic}: ${messageSubject}`;
      const body = `Name: ${name}\r\nEmail: ${email}\r\nMessage type: ${topic}\r\nSubject: ${messageSubject}\r\n\r\n${message}`;
      const emailUrl = `mailto:pseudocode.comsociety@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      confirmAction('Continue to your email app?', 'Your message is ready to send to pseudocode.comsociety@gmail.com. Review it in your email app, then choose Send.', () => { window.location.href = emailUrl; });
    };
  }
  function tablePage(key) {
    const s = schemas[key], rows = data[key] || [];
    if (key === 'students' && !isAdmin) {
      const availableCourses = registrationCourses();
      setHeading(s.title, 'Start a student registration. Existing student credentials are only visible to an administrator.');
      $('content').innerHTML = `<section class="panel"><div class="panel-heading"><div><h2>Student registration</h2><p>Enter your details, choose a course, then review your information before registering.</p></div></div><section class="course-notice" aria-labelledby="availableCoursesTitle"><div class="course-notice-heading"><span class="course-notice-icon" aria-hidden="true">▤</span><div><h3 id="availableCoursesTitle">Available courses</h3><p>Choose one of these programs during registration.</p></div><span class="course-count">${availableCourses.length} ${availableCourses.length === 1 ? 'program' : 'programs'}</span></div><div class="course-options" role="list">${availableCourses.map(p => `<article class="course-option" role="listitem"><div class="course-option-top"><span class="course-code">${esc(p.code)}</span><span class="course-available">Available</span></div><b>${esc(p.name)}</b></article>`).join('') || '<p class="course-empty">No courses are currently listed.</p>'}</div></section><button class="primary" id="registerStudentAlt">Start registration</button></section>`;
      $('registerStudentAlt').onclick = startRegistration; return;
    }
    const action = isAdmin && key !== 'students' ? `<button class="primary" id="addRecord">＋ Add ${s.singular}</button>` : '';
    setHeading(s.title, s.desc, key === 'students' ? `<button class="secondary" id="registerStudent">＋ Register student</button> ${action}` : action);
    const term = globalSearchQuery || $('search-' + key)?.value || '';
    const filtered = rows.map((r, i) => ({ r, i })).filter(({ r }) => s.fields.some(f => String(r[f[0]] || '').toLowerCase().includes(term.toLowerCase())));
    const heads = s.fields.map(f => `<th>${esc(f[1])}</th>`).join('');
    const body = renderTableRows(key, filtered, term);
    const facultyCards = key === 'faculty' ? `<section class="panel faculty-directory"><div class="panel-heading"><div><h2>Faculty portraits</h2><p>College of Computer Studies</p></div></div><div class="faculty-grid">${filtered.map(({ r }) => r).filter(person => person.photo).map(person => `<article class="faculty-card"><img src="${esc(person.photo)}" alt="Portrait of ${esc(person.name)}"><div><h2>${esc(person.name)}</h2><p>${esc(person.role || 'Faculty and Staff')}</p></div></article>`).join('') || '<div class="empty">No faculty portraits match your search.</div>'}</div></section>` : '';
    $('content').innerHTML = `${facultyCards}${key === 'events' ? eventsCalendar() : ''}<section class="panel"><div class="panel-heading"><div><h2>${s.title} records</h2><p>${rows.length} ${rows.length === 1 ? 'record' : 'records'} · Admin access</p></div></div><div class="table-tools"><div class="search-box"><input id="search-${key}" placeholder="Search ${s.title.toLowerCase()}..." value="${esc(term)}" aria-label="Search ${s.title}"></div><span class="local-pill">${rows.length} records</span></div><div class="table-wrap"><table><thead><tr>${heads}</tr></thead><tbody>${body}</tbody></table></div></section>`;
    if (key === 'students') $('registerStudent').onclick = startRegistration;
    $('search-' + key).oninput = () => {
      globalSearchQuery = $('search-' + key).value;
      $('systemSearch').value = globalSearchQuery;
      tablePage(key);
    };
    if (key === 'events') bindEventsCalendar();
    bindRecordActions(key);
  }
  function renderTableRows(key, filtered, term) {
    const s = schemas[key], rows = data[key] || [];
    const body = filtered.map(({ r }) => `<tr>${s.fields.map(f => `<td>${f[0] === 'status' ? `<span class="status ${r[f[0]] === 'Past' ? 'past' : ''}">${esc(r[f[0]] || 'Upcoming')}</span>` : esc(r[f[0]])}</td>`).join('')}</tr>`).join('');
    return body || `<tr><td colspan="${s.fields.length}" class="empty">${term ? 'No matching records.' : 'No records yet.'}</td></tr>`;
  }
  function bindRecordActions(key) {
    if (!isAdmin) return;
    if ($('addRecord') && (!$('addRecord').dataset.recordKey || $('addRecord').dataset.recordKey === key)) $('addRecord').onclick = () => formModal(key);
  }
  function updateAnnouncementRows(term) {
    const query = term.trim().toLowerCase();
    const records = data.announcements.map((record, index) => ({ record, index }))
      .filter(({ record }) => schemas.announcements.fields.some(field => String(record[field[0]] || '').toLowerCase().includes(query)));
    const list = $('resourceAnnouncements');
    if (!list) return;
    list.innerHTML = records.length ? records.map(({ record }) => `<article class="resource-announcement"><div><span>${esc(record.category || 'Announcement')}</span><b>${esc(record.title || 'Untitled announcement')}</b><p>${esc(record.body || 'Details have not been added to this preview.')}</p></div></article>`).join('') : `<div class="empty">${query ? 'No matching announcements.' : 'No announcements are available.'}</div>`;
    bindRecordActions('announcements');
  }
  function setupAnnouncementSearch() {
    const input = $('search-announcements');
    input.setAttribute('aria-controls', 'announcementSuggestions');
    input.setAttribute('aria-expanded', 'false');
    const list = document.createElement('div');
    list.id = 'announcementSuggestions';
    list.className = 'announcement-suggestions';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    input.parentElement.append(list);
    input.onkeydown = event => {
      if (event.key === 'Escape') { list.innerHTML = ''; list.hidden = true; input.setAttribute('aria-expanded', 'false'); }
      if (event.key === 'ArrowDown') { const first = list.querySelector('[role="option"]'); if (first) { event.preventDefault(); first.focus(); } }
      if (event.key === 'Enter') { const first = list.querySelector('[role="option"]'); if (first) { event.preventDefault(); first.click(); } }
    };
  }
  function renderAnnouncementSuggestions(term) {
    const input = $('search-announcements'), list = $('announcementSuggestions');
    const query = term.trim().toLowerCase();
    if (!query) { list.innerHTML = ''; list.hidden = true; input.setAttribute('aria-expanded', 'false'); return; }
    const matches = data.announcements.filter(record => schemas.announcements.fields
      .some(field => String(record[field[0]] || '').toLowerCase().includes(query))).slice(0, 6);
    list.innerHTML = matches.length ? matches.map((record, index) => `<button type="button" class="announcement-suggestion" role="option" data-announcement-index="${index}"><span class="suggestion-icon">◉</span><span><b>${esc(record.title || 'Untitled announcement')}</b><small>${esc(record.category || record.date || 'Announcement')}</small></span></button>`).join('') : '<div class="suggestion-empty">No matching announcements found.</div>';
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    list.querySelectorAll('[data-announcement-index]').forEach((button, index) => {
      button.onmousedown = event => event.preventDefault();
      button.onclick = () => {
        const selected = matches[index];
        input.value = selected.title || '';
        globalSearchQuery = input.value;
        $('systemSearch').value = globalSearchQuery;
        updateAnnouncementRows(globalSearchQuery);
        list.innerHTML = '';
        list.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        input.focus();
      };
    });
  }
  function eventsCalendar() {
    const year = calendarMonth.getFullYear(), month = calendarMonth.getMonth();
    const firstCell = new Date(year, month, 1);
    const firstWeekday = firstCell.getDay();
    firstCell.setDate(firstCell.getDate() - firstWeekday);
    const monthName = calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const todayKey = dateKey(new Date());
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekCount = Math.ceil((firstWeekday + daysInMonth) / 7);
    const days = Array.from({ length: weekCount * 7 }, (_, index) => {
      const date = new Date(firstCell);
      date.setDate(firstCell.getDate() + index);
      const key = dateKey(date);
      const events = data.events.filter(event => event.date === key);
      const classes = ['calendar-day', events.length ? 'has-events' : '', date.getMonth() !== month ? 'outside-month' : '', key === todayKey ? 'today' : '', key === selectedCalendarDate ? 'selected' : ''].filter(Boolean).join(' ');
      const label = `${date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}${events.length ? `, ${events.length} ${events.length === 1 ? 'event' : 'events'}` : ''}`;
      return `<button type="button" class="${classes}" data-calendar-date="${key}" aria-label="${esc(label)}" aria-pressed="${key === selectedCalendarDate}" ${key === todayKey ? 'aria-current="date"' : ''}><span class="calendar-day-number">${date.getDate()}</span>${events.length ? `<span class="calendar-event-count">${events.length}</span><span class="calendar-event-marker">Event</span>` : ''}</button>`;
    }).join('');
    const selectedDate = new Date(`${selectedCalendarDate}T00:00:00`);
    const selectedEvents = data.events.filter(event => event.date === selectedCalendarDate);
    return `<section class="panel calendar-panel"><div class="calendar-toolbar"><p class="calendar-instruction">Select a green date to view its events.</p><div class="calendar-toolbar-actions"><div class="calendar-legend"><span></span>Scheduled event</div><div class="calendar-controls"><button type="button" class="icon-button" id="calendarPrevious" aria-label="Previous month">‹</button><strong id="calendarMonth">${esc(monthName)}</strong><button type="button" class="icon-button" id="calendarNext" aria-label="Next month">›</button><button type="button" class="secondary calendar-today" id="calendarToday">Today</button></div></div></div><div class="calendar-layout"><div class="calendar-grid" role="grid" aria-label="${esc(monthName)}">${dayNames.map(day => `<div class="calendar-weekday" role="columnheader">${day}</div>`).join('')}${days}</div><aside class="calendar-agenda" aria-live="polite"><span class="calendar-agenda-label">EVENTS FOR THIS DATE</span><h3>${esc(selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))}</h3>${selectedEvents.length ? selectedEvents.map(event => `<article class="calendar-agenda-event"><span class="calendar-agenda-dot"></span><div><b>${esc(event.name || 'Untitled event')}</b><small>${esc(event.location || 'Location not set')}</small></div></article>`).join('') : '<p class="calendar-empty">No events scheduled. Select a green date to see its events.</p>'}</aside></div></section>`;
  }
  function bindEventsCalendar() {
    $('calendarPrevious').onclick = () => moveCalendarMonth(-1);
    $('calendarNext').onclick = () => moveCalendarMonth(1);
    $('calendarToday').onclick = () => {
      const today = new Date();
      calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      selectedCalendarDate = dateKey(today);
      tablePage('events');
    };
    document.querySelectorAll('[data-calendar-date]').forEach(button => button.onclick = () => {
      selectedCalendarDate = button.dataset.calendarDate;
      tablePage('events');
    });
  }
  function moveCalendarMonth(offset) {
    calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1);
    selectedCalendarDate = dateKey(calendarMonth);
    tablePage('events');
  }
  function formModal(key, index) {
    if (!isAdmin) return notify('Admin login is required to manage records.');
    const s = schemas[key], isEditing = index !== undefined, item = isEditing ? data[key][index] : {};
    $('modalRoot').innerHTML = `<div class="modal-backdrop"><form class="modal" id="recordForm"><div class="modal-head"><h2>${isEditing ? 'Edit' : 'Add'} ${s.singular}</h2><button type="button" class="modal-x" id="modalX">×</button></div><p>Enter the details for this ${s.singular} record.</p><div class="form-grid">${s.fields.map(([field, label, type]) => `<label class="${field === 'body' || field === 'description' || field === 'address' ? 'full' : ''}">${label}${field === 'status' ? `<select name="${field}"><option ${item[field] === 'Upcoming' ? 'selected' : ''}>Upcoming</option><option ${item[field] === 'Past' ? 'selected' : ''}>Past</option></select>` : `<input name="${field}" type="${type || 'text'}" value="${esc(item[field] || '')}" ${field === 'email' ? 'type="email"' : ''}>`}</label>`).join('')}</div><div class="modal-actions"><button type="button" class="secondary" id="cancelModal">Cancel</button><button class="primary" type="submit">Save record</button></div></form></div>`;
    $('modalX').onclick = closeModal; $('cancelModal').onclick = closeModal;
    enableTypingSuggestions($('recordForm'));
    $('recordForm').onsubmit = e => { e.preventDefault(); const obj = Object.fromEntries(new FormData(e.currentTarget)); obj.updatedAt = new Date().toISOString(); if (index === undefined) { obj.createdAt = obj.updatedAt; data[key].unshift(obj); } else data[key][index] = { ...item, ...obj }; save(); closeModal(); render(); notify(index === undefined ? 'Record added.' : 'Record updated.'); };
  }
  function startRegistration() { registration = null; replaceIndex = null; registrationForm(); }
  function registrationForm(values = {}) {
    const today = new Date();
    const maxBirthDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    $('modalRoot').innerHTML = `<div class="modal-backdrop"><form class="modal registration-modal" id="registrationForm"><div class="modal-head"><h2>Student Registration · 1 of 2</h2><button type="button" class="modal-x" id="modalX" aria-label="Close student registration">×</button></div><p>Enter accurate student information and verify the CCS course before continuing.</p><div class="form-grid"><label>First name<input name="firstName" value="${esc(values.firstName)}" autocomplete="given-name" required></label><label>Middle name<input name="middleName" value="${esc(values.middleName)}" autocomplete="additional-name"></label><label>Last name<input name="lastName" value="${esc(values.lastName)}" autocomplete="family-name" required></label><label>Suffix <span aria-hidden="true">(optional)</span><input name="suffix" value="${esc(values.suffix)}" placeholder="e.g., Jr., III" autocomplete="off"></label><label>Gender<select name="gender" autocomplete="sex" required><option value="">Select gender</option><option ${values.gender === 'Female' ? 'selected' : ''}>Female</option><option ${values.gender === 'Male' ? 'selected' : ''}>Male</option><option ${values.gender === 'Prefer not to say' ? 'selected' : ''}>Prefer not to say</option></select></label><label>Date of birth<input name="birthDate" type="date" value="${esc(values.birthDate)}" max="${maxBirthDate}" autocomplete="bday" required></label><label>Student ID<input name="id" value="${esc(values.id)}" placeholder="College student number" autocomplete="off" required></label><label>Contact number<input name="contactNumber" type="tel" value="${esc(values.contactNumber)}" placeholder="09123456789" autocomplete="tel" pattern="(?:\\+63|0)9[0-9]{9}" title="Use 09XXXXXXXXX or +63XXXXXXXXXX" required></label><label class="full course-field">Course<div class="course-input-wrap"><input id="courseInput" name="program" value="${esc(values.program)}" placeholder="Type a course name or code" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="courseSuggestions" required><div id="courseSuggestions" class="course-suggestions" role="listbox"></div></div><small id="courseVerification" class="field-help">Start typing a course name or code.</small></label><label>Year level<select name="year" autocomplete="off" required><option value="">Select year</option>${[1, 2, 3, 4].map(n => `<option value="${n}" ${String(values.year) === String(n) ? 'selected' : ''}>Year ${n}</option>`).join('')}</select></label><label>Email address<input name="email" type="email" value="${esc(values.email)}" autocomplete="email" required></label><label class="full">Complete address<input name="address" value="${esc(values.address)}" autocomplete="street-address" placeholder="House/room, street, barangay, city/municipality, province" required></label></div><div id="registrationError" class="form-error" aria-live="polite"></div><div class="modal-actions"><button type="button" class="secondary" id="cancelModal">Cancel</button><button class="primary" type="submit">Review information</button></div></form></div>`;
    $('modalX').onclick = closeModal; $('cancelModal').onclick = closeModal;
    enableTypingSuggestions($('registrationForm'));
    const courseInput = $('courseInput');
    const suggestionList = $('courseSuggestions');
    let activeSuggestion = -1;
    let courseMatches = [];
    const closeSuggestions = () => { suggestionList.innerHTML = ''; suggestionList.hidden = true; courseInput.setAttribute('aria-expanded', 'false'); courseInput.removeAttribute('aria-activedescendant'); activeSuggestion = -1; };
    const chooseCourse = course => { courseInput.value = course.name; closeSuggestions(); verifyCourse(); };
    function renderSuggestions() {
      const query = courseInput.value.trim().toLowerCase();
      courseMatches = query ? registrationCourses().filter(course => course.name.toLowerCase().includes(query) || course.code.toLowerCase().includes(query)) : [];
      activeSuggestion = -1;
      suggestionList.innerHTML = courseMatches.map((course, index) => `<button type="button" id="courseSuggestion${index}" class="course-suggestion" role="option" aria-selected="${index === activeSuggestion}" data-course-index="${index}"><span class="course-suggestion-name">${esc(course.name)}</span></button>`).join('');
      suggestionList.hidden = !courseMatches.length;
      courseInput.setAttribute('aria-expanded', String(courseMatches.length > 0));
      courseInput.removeAttribute('aria-activedescendant');
      suggestionList.querySelectorAll('[data-course-index]').forEach((button, index) => {
        button.onmousedown = event => event.preventDefault();
        button.onclick = () => chooseCourse(courseMatches[index]);
      });
      verifyCourse();
    }
    const verifyCourse = () => { const match = matchCourse(courseInput.value); $('courseVerification').textContent = match ? `Course verified: ${match.name} (${match.code})` : courseInput.value ? 'Select a suggested course to verify it.' : 'Start typing a course name or code.'; $('courseVerification').classList.toggle('verified', !!match); };
    function setActiveSuggestion(index) {
      const options = suggestionList.querySelectorAll('[data-course-index]');
      if (!options.length) return;
      activeSuggestion = (index + options.length) % options.length;
      options.forEach((option, i) => option.setAttribute('aria-selected', String(i === activeSuggestion)));
      courseInput.setAttribute('aria-activedescendant', options[activeSuggestion].id);
    }
    courseInput.oninput = renderSuggestions;
    courseInput.onkeydown = event => {
      const count = suggestionList.querySelectorAll('[data-course-index]').length;
      if (event.key === 'ArrowDown' && count) { event.preventDefault(); setActiveSuggestion(activeSuggestion + 1); }
      else if (event.key === 'ArrowUp' && count) { event.preventDefault(); setActiveSuggestion(activeSuggestion < 0 ? count - 1 : activeSuggestion - 1); }
      else if (event.key === 'Enter' && activeSuggestion >= 0 && count) { event.preventDefault(); chooseCourse(courseMatches[activeSuggestion]); }
      else if (event.key === 'Escape') closeSuggestions();
    };
    courseInput.onblur = () => setTimeout(closeSuggestions, 120);
    verifyCourse();
    $('registrationForm').onsubmit = e => {
      e.preventDefault();
      const values = Object.fromEntries(new FormData(e.currentTarget));
      ['firstName', 'middleName', 'lastName', 'suffix', 'id', 'contactNumber', 'email', 'address'].forEach(field => {
        values[field] = String(values[field] || '').trim();
      });
      const match = matchCourse(values.program);
      if (!match) {
        $('registrationError').textContent = 'Verify a listed CCS course before continuing.';
        return;
      }
      if (values.birthDate && values.birthDate > maxBirthDate) {
        $('registrationError').textContent = 'Date of birth cannot be in the future.';
        return;
      }
      values.program = match.name;
      values.courseCode = match.code;
      registration = values;
      checkDuplicateAndReview();
    };
  }
  function registrationCourses() {
    return ['BSIT', 'BSCS'].map(code => data.programs.find(course => String(course.code || '').trim().toUpperCase() === code)).filter(Boolean);
  }
  function matchCourse(value) { const normalized = String(value || '').trim().toLowerCase(); return registrationCourses().find(p => normalized && (p.name.toLowerCase() === normalized || p.code.toLowerCase() === normalized)); }
  function checkDuplicateAndReview() {
    const v = registration;
    const registeredName = [v.firstName, v.middleName, v.lastName, v.suffix].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    const duplicateIndex = data.students.findIndex(s => (v.id && s.id && s.id.trim().toLowerCase() === v.id.trim().toLowerCase()) || (v.email && s.email && s.email.trim().toLowerCase() === v.email.trim().toLowerCase()) || (v.birthDate && s.birthDate === v.birthDate && String(s.name || '').trim().toLowerCase() === registeredName.toLowerCase()));
    if (duplicateIndex < 0) return reviewRegistration();
    duplicateModal(duplicateIndex);
  }
  function duplicateModal(index) {
    $('modalRoot').innerHTML = `<div class="modal-backdrop"><section class="modal"><div class="modal-head"><h2>Existing student credentials found</h2><button type="button" class="modal-x" id="modalX" aria-label="Close duplicate registration notice">×</button></div><p>A student record already exists with the same Student ID, email, or date of birth and name.</p><div class="notice-box">Existing record details are only available after administrator sign-in. Change or verify the entered information before registering again.</div><div class="duplicate-actions"><button class="secondary" id="useExisting">Use existing credentials</button><button class="text-button" id="cancelDuplicate">Cancel registration</button></div></section></div>`;
    $('modalX').onclick = closeModal; $('cancelDuplicate').onclick = closeModal;
    $('useExisting').onclick = () => { closeModal(); notify('Existing credentials kept. No duplicate was registered.'); };
  }
  function reviewRegistration() {
    const labels = [['First name', 'firstName'], ['Middle name', 'middleName'], ['Last name', 'lastName'], ['Suffix', 'suffix'], ['Gender', 'gender'], ['Date of birth', 'birthDate'], ['Student ID', 'id'], ['Contact number', 'contactNumber'], ['Course', 'program'], ['Year level', 'year'], ['Email address', 'email'], ['Complete address', 'address']];
    $('modalRoot').innerHTML = `<div class="modal-backdrop"><section class="modal"><div class="modal-head"><h2>Review registration · 2 of 2</h2><button type="button" class="modal-x" id="modalX" aria-label="Close registration review">×</button></div><p>Check that all information is accurate before registering.</p><dl class="review-list">${labels.map(([label, key]) => `<div><dt>${label}</dt><dd>${esc(registration[key] || '—')}</dd></div>`).join('')}</dl><div class="notice-box">Course verified: <b>${esc(registration.program)} (${esc(registration.courseCode)})</b></div><div class="modal-actions"><button class="secondary" id="cancelRegistrationReview">Go back</button><button class="primary" id="submitRegistration">Register</button></div></section></div>`;
    $('modalX').onclick = closeModal;
    $('cancelRegistrationReview').onclick = () => registrationForm(registration);
    $('submitRegistration').onclick = () => {
      const now = new Date().toISOString();
      const item = { ...registration, name: [registration.firstName, registration.middleName, registration.lastName, registration.suffix].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim(), createdAt: now, updatedAt: now };
      if (replaceIndex !== null) data.students[replaceIndex] = item; else data.students.unshift(item);
      save(); closeModal(); registration = null; replaceIndex = null; navigateTo('students'); notify('Student registration successful.');
    };
  }
  function confirmAction(title, detail, onConfirm) {
    $('modalRoot').innerHTML = `<div class="modal-backdrop"><section class="modal confirm-modal"><div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="modal-x" id="modalX">×</button></div><p>${esc(detail)}</p><div class="modal-actions"><button type="button" class="secondary" id="cancelConfirm">Cancel</button><button type="button" class="primary" id="confirmAction">Confirm</button></div></section></div>`;
    $('modalX').onclick = closeModal; $('cancelConfirm').onclick = closeModal; $('confirmAction').onclick = () => { closeModal(); onConfirm(); };
  }
  function askDelete(key, index) {
    if (!isAdmin) return notify('Admin login is required to delete records.');
    const message = key === 'students' ? 'Are you sure you want to delete these credentials?' : `Are you sure you want to delete this ${schemas[key].singular}?`;
    confirmAction(message, 'This action can be undone from the confirmation notification.', () => deleteAt(key, index));
  }
  function deleteAt(key, index, offerUndo = true) {
    const item = data[key].splice(index, 1)[0]; undoRecord = offerUndo ? { key, index, item } : null;
    save(); closeModal(); render(); notify(key === 'students' ? 'Student credentials deleted.' : 'Record deleted.', offerUndo);
  }
  function undoDelete() {
    if (!undoRecord) return;
    data[undoRecord.key].splice(undoRecord.index, 0, undoRecord.item); undoRecord = null; save(); render(); notify('Deleted record restored.');
  }
  render();
})();
