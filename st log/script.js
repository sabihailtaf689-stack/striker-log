(() => {
  'use strict';

  const STORAGE_KEY = 'strikers-log-entries-v1';
  const PROFILE_KEY = 'strikers-log-profile-v1';

  /* ---------- Storage ---------- */
  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Could not read saved entries', e);
      return [];
    }
  }

  function saveEntries(entries) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
      return true;
    } catch (e) {
      console.error('Could not save entries', e);
      showToast("Couldn't save — your browser storage may be full or blocked.");
      return false;
    }
  }

  function loadProfile() {
    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (!raw) return { name: '', number: '', position: '', club: '' };
      return { name: '', number: '', position: '', club: '', ...JSON.parse(raw) };
    } catch (e) {
      return { name: '', number: '', position: '', club: '' };
    }
  }

  function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }

  let entries = loadEntries();
  let profile = loadProfile();

  /* ---------- Elements ---------- */
  const el = (id) => document.getElementById(id);

  const formPanel = el('formPanel');
  const entryForm = el('entryForm');
  const formTitle = el('formTitle');
  const btnAdd = el('btnAdd');
  const btnCancel = el('btnCancel');
  const btnExport = el('btnExport');
  const importFile = el('importFile');

  const fId = el('fId');
  const fDate = el('fDate');
  const fType = el('fType');
  const fQty = el('fQty');
  const fMinute = el('fMinute');
  const fOpponent = el('fOpponent');
  const fCompetition = el('fCompetition');
  const fNotes = el('fNotes');

  const fSeason = el('fSeason');
  const fTypeFilter = el('fTypeFilter');
  const fSearch = el('fSearch');

  const statGoals = el('statGoals');
  const statAssists = el('statAssists');
  const statGA = el('statGA');
  const statMatches = el('statMatches');

  const logBody = el('logBody');
  const logCount = el('logCount');
  const emptyState = el('emptyState');

  const chartSvg = el('chartSvg');
  const chartTitle = el('chartTitle');
  const timelineWrap = el('timelineWrap');
  const timelineHint = el('timelineHint');

  const toastEl = el('toast');

  const profileName = el('profileName');
  const profileNumber = el('profileNumber');
  const profileMeta = el('profileMeta');
  const btnEditProfile = el('btnEditProfile');
  const profilePanel = el('profilePanel');
  const profileForm = el('profileForm');
  const btnCancelProfile = el('btnCancelProfile');
  const btnClearData = el('btnClearData');
  const pName = el('pName');
  const pNumber = el('pNumber');
  const pPosition = el('pPosition');
  const pClub = el('pClub');

  const heroEmpty = el('heroEmpty');
  const btnHeroAdd = el('btnHeroAdd');
  const btnDemo = el('btnDemo');
  const footerStatus = el('footerStatus');
  const footerYear = el('footerYear');
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* ---------- Utilities ---------- */
  function uid() {
    return 'e_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function seasonYear(dateStr) {
    return new Date(dateStr + 'T00:00:00').getFullYear();
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  }

  let toastTimer = null;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- Profile ---------- */
  function renderProfile() {
    profileName.textContent = profile.name.trim() || 'Your Name';
    profileNumber.textContent = profile.number !== '' && profile.number !== null ? profile.number : '—';
    const metaParts = [profile.position.trim() || 'Add your position', profile.club.trim() || 'Add your club'];
    profileMeta.textContent = metaParts.join(' · ');
  }

  function openProfileForm() {
    pName.value = profile.name;
    pNumber.value = profile.number;
    pPosition.value = profile.position;
    pClub.value = profile.club;
    closeForm();
    profilePanel.hidden = false;
    profilePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    pName.focus();
  }

  function closeProfileForm() {
    profilePanel.hidden = true;
  }

  btnEditProfile.addEventListener('click', openProfileForm);
  btnCancelProfile.addEventListener('click', closeProfileForm);

  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    profile = {
      name: pName.value.trim(),
      number: pNumber.value === '' ? '' : Math.max(0, parseInt(pNumber.value, 10)),
      position: pPosition.value.trim(),
      club: pClub.value.trim(),
    };
    saveProfile(profile);
    renderProfile();
    closeProfileForm();
    showToast('Profile saved.');
  });

  btnClearData.addEventListener('click', () => {
    if (!confirm('Delete every logged goal and assist? This cannot be undone — export a backup first if you want to keep it.')) return;
    entries = [];
    saveEntries(entries);
    populateSeasonOptions();
    renderAll();
    closeProfileForm();
    showToast('All entries cleared.');
  });

  /* ---------- Demo data ---------- */
  function seedDemoData() {
    const year = new Date().getFullYear();
    const demo = [
      { m: 2, d: 14, type: 'goal', qty: 1, minute: 23, opponent: 'Riverside FC', competition: 'League', notes: 'left-foot finish' },
      { m: 2, d: 14, type: 'assist', qty: 1, minute: 61, opponent: 'Riverside FC', competition: 'League', notes: 'through ball' },
      { m: 3, d: 2, type: 'goal', qty: 2, minute: 34, opponent: 'Hilltop United', competition: 'League', notes: 'brace' },
      { m: 3, d: 19, type: 'assist', qty: 1, minute: 78, opponent: 'Oakwood Athletic', competition: 'Cup', notes: 'corner delivery' },
      { m: 4, d: 6, type: 'goal', qty: 1, minute: 5, opponent: 'Parkside Rovers', competition: 'League', notes: 'header' },
      { m: 4, d: 20, type: 'goal', qty: 1, minute: 89, opponent: 'Northgate City', competition: 'League', notes: 'late winner' },
      { m: 5, d: 4, type: 'assist', qty: 2, minute: 40, opponent: 'Hilltop United', competition: 'League', notes: '' },
      { m: 5, d: 18, type: 'goal', qty: 1, minute: 15, opponent: 'Eastbrook Town', competition: 'Friendly', notes: 'penalty' },
      { m: 9, d: 7, type: 'goal', qty: 1, minute: 52, opponent: 'Riverside FC', competition: 'League', notes: 'volley' },
      { m: 9, d: 21, type: 'assist', qty: 1, minute: 30, opponent: 'Parkside Rovers', competition: 'League', notes: '' },
      { m: 10, d: 5, type: 'goal', qty: 1, minute: 71, opponent: 'Oakwood Athletic', competition: 'Cup', notes: 'tap-in' },
      { m: 10, d: 26, type: 'goal', qty: 1, minute: 12, opponent: 'Northgate City', competition: 'League', notes: 'free kick' },
      { m: 11, d: 9, type: 'assist', qty: 1, minute: 66, opponent: 'Eastbrook Town', competition: 'League', notes: 'cutback' },
    ];
    demo.forEach((x) => {
      entries.push({
        id: uid(),
        date: `${year}-${String(x.m).padStart(2, '0')}-${String(x.d).padStart(2, '0')}`,
        type: x.type,
        qty: x.qty,
        minute: x.minute,
        opponent: x.opponent,
        competition: x.competition,
        notes: x.notes,
      });
    });
    saveEntries(entries);
    populateSeasonOptions();
    fSeason.value = String(year);
    renderAll();
    showToast('Sample season loaded — edit or clear it any time.');
  }

  /* ---------- Form open/close ---------- */
  function openForm(entryToEdit) {
    closeProfileForm();
    entryForm.reset();
    fQty.value = 1;
    if (entryToEdit) {
      formTitle.textContent = 'Edit contribution';
      fId.value = entryToEdit.id;
      fDate.value = entryToEdit.date;
      fType.value = entryToEdit.type;
      fQty.value = entryToEdit.qty || 1;
      fMinute.value = entryToEdit.minute ?? '';
      fOpponent.value = entryToEdit.opponent || '';
      fCompetition.value = entryToEdit.competition || '';
      fNotes.value = entryToEdit.notes || '';
    } else {
      formTitle.textContent = 'Log a contribution';
      fId.value = '';
      fDate.value = new Date().toISOString().slice(0, 10);
    }
    formPanel.hidden = false;
    formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fDate.focus();
  }

  function closeForm() {
    formPanel.hidden = true;
  }

  btnAdd.addEventListener('click', () => openForm(null));
  btnCancel.addEventListener('click', closeForm);
  btnHeroAdd.addEventListener('click', () => openForm(null));
  btnDemo.addEventListener('click', seedDemoData);

  entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!fDate.value) {
      showToast('Pick a date first.');
      return;
    }
    const entry = {
      id: fId.value || uid(),
      date: fDate.value,
      type: fType.value,
      qty: Math.max(1, parseInt(fQty.value, 10) || 1),
      minute: fMinute.value === '' ? null : Math.max(0, parseInt(fMinute.value, 10)),
      opponent: fOpponent.value.trim(),
      competition: fCompetition.value.trim(),
      notes: fNotes.value.trim(),
    };

    const existingIdx = entries.findIndex((x) => x.id === entry.id);
    if (existingIdx >= 0) {
      entries[existingIdx] = entry;
      showToast('Entry updated.');
    } else {
      entries.push(entry);
      showToast(entry.type === 'goal' ? 'Goal logged ⚽' : 'Assist logged 🎯');
    }
    saveEntries(entries);
    closeForm();
    populateSeasonOptions();
    renderAll();
  });

  function deleteEntry(id) {
    const entry = entries.find((x) => x.id === id);
    if (!entry) return;
    const label = `${entry.type} on ${formatDate(entry.date)}`;
    if (!confirm(`Delete this ${label}? This can't be undone.`)) return;
    entries = entries.filter((x) => x.id !== id);
    saveEntries(entries);
    populateSeasonOptions();
    renderAll();
    showToast('Entry deleted.');
  }

  /* ---------- Export / Import ---------- */
  btnExport.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `strikers-log-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Backup downloaded.');
  });

  importFile.addEventListener('change', () => {
    const file = importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error('not an array');
        const existingIds = new Set(entries.map((x) => x.id));
        let added = 0;
        imported.forEach((raw) => {
          if (!raw || !raw.date || !raw.type) return;
          const clean = {
            id: existingIds.has(raw.id) || !raw.id ? uid() : raw.id,
            date: raw.date,
            type: raw.type === 'assist' ? 'assist' : 'goal',
            qty: Math.max(1, parseInt(raw.qty, 10) || 1),
            minute: raw.minute ?? null,
            opponent: raw.opponent || '',
            competition: raw.competition || '',
            notes: raw.notes || '',
          };
          entries.push(clean);
          existingIds.add(clean.id);
          added++;
        });
        saveEntries(entries);
        populateSeasonOptions();
        renderAll();
        showToast(`Imported ${added} ${added === 1 ? 'entry' : 'entries'}.`);
      } catch (err) {
        console.error(err);
        showToast("That file doesn't look like a valid backup.");
      }
      importFile.value = '';
    };
    reader.readAsText(file);
  });

  /* ---------- Filters ---------- */
  function populateSeasonOptions() {
    const years = Array.from(new Set(entries.map((x) => seasonYear(x.date)))).sort((a, b) => b - a);
    const current = fSeason.value;
    fSeason.innerHTML = '<option value="all">All-time</option>' +
      years.map((y) => `<option value="${y}">${y} season</option>`).join('');
    if (years.includes(Number(current))) {
      fSeason.value = current;
    } else if (years.length) {
      fSeason.value = String(years[0]);
    } else {
      fSeason.value = 'all';
    }
  }

  [fSeason, fTypeFilter, fSearch].forEach((input) => {
    input.addEventListener('input', renderAll);
    input.addEventListener('change', renderAll);
  });

  function getFilteredEntries() {
    const season = fSeason.value;
    const type = fTypeFilter.value;
    const q = fSearch.value.trim().toLowerCase();
    return entries.filter((x) => {
      if (season !== 'all' && String(seasonYear(x.date)) !== season) return false;
      if (type !== 'all' && x.type !== type) return false;
      if (q) {
        const hay = `${x.opponent} ${x.competition} ${x.notes}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  /* ---------- Scoreboard (career, unaffected by filters) ---------- */
  function renderScoreboard() {
    let goals = 0, assists = 0;
    const matchDates = new Set();
    entries.forEach((x) => {
      if (x.type === 'goal') goals += x.qty;
      else assists += x.qty;
      matchDates.add(x.date);
    });
    statGoals.textContent = goals;
    statAssists.textContent = assists;
    statGA.textContent = goals + assists;
    statMatches.textContent = matchDates.size;

    heroEmpty.hidden = entries.length !== 0;

    if (!entries.length) {
      footerStatus.textContent = 'No entries logged yet.';
    } else {
      const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
      const last = sorted[0];
      footerStatus.textContent = `${matchDates.size} matchday${matchDates.size === 1 ? '' : 's'} logged · last update ${formatDate(last.date)}.`;
    }
  }

  /* ---------- Table ---------- */
  function renderTable(filtered) {
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
    logBody.innerHTML = '';
    logCount.textContent = `${sorted.length} ${sorted.length === 1 ? 'entry' : 'entries'}`;
    emptyState.hidden = sorted.length !== 0;

    sorted.forEach((x) => {
      const tr = document.createElement('tr');

      const tdDate = document.createElement('td');
      tdDate.textContent = formatDate(x.date);
      tr.appendChild(tdDate);

      const tdType = document.createElement('td');
      const pill = document.createElement('span');
      pill.className = `pill pill-${x.type}`;
      pill.textContent = x.type === 'goal' ? '⚽ Goal' : '🎯 Assist';
      tdType.appendChild(pill);
      tr.appendChild(tdType);

      const tdQty = document.createElement('td');
      tdQty.textContent = x.qty;
      tr.appendChild(tdQty);

      const tdOpp = document.createElement('td');
      tdOpp.textContent = x.opponent || '—';
      tr.appendChild(tdOpp);

      const tdComp = document.createElement('td');
      tdComp.textContent = x.competition || '—';
      tr.appendChild(tdComp);

      const tdMin = document.createElement('td');
      tdMin.textContent = (x.minute ?? x.minute === 0) ? `${x.minute}'` : '—';
      tr.appendChild(tdMin);

      const tdNotes = document.createElement('td');
      tdNotes.textContent = x.notes || '—';
      tr.appendChild(tdNotes);

      const tdActions = document.createElement('td');
      const actions = document.createElement('div');
      actions.className = 'row-actions';
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-small';
      editBtn.type = 'button';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => openForm(x));
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn-danger';
      delBtn.type = 'button';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => deleteEntry(x.id));
      actions.appendChild(editBtn);
      actions.appendChild(delBtn);
      tdActions.appendChild(actions);
      tr.appendChild(tdActions);

      logBody.appendChild(tr);
    });
  }

  /* ---------- Chart (SVG bar chart) ---------- */
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function renderChart(filtered) {
    const season = fSeason.value;
    const NS = 'http://www.w3.org/2000/svg';
    chartSvg.innerHTML = '';

    let buckets, labels;
    if (season === 'all') {
      chartTitle.textContent = 'Career, by season';
      const years = Array.from(new Set(entries.map((x) => seasonYear(x.date)))).sort((a, b) => a - b);
      labels = years.map(String);
      buckets = years.map((y) => {
        let g = 0, a = 0;
        entries.forEach((x) => {
          if (seasonYear(x.date) === y) { if (x.type === 'goal') g += x.qty; else a += x.qty; }
        });
        return { g, a };
      });
    } else {
      chartTitle.textContent = `${season} season, by month`;
      labels = MONTHS;
      buckets = MONTHS.map((_, i) => {
        let g = 0, a = 0;
        entries.forEach((x) => {
          const d = new Date(x.date + 'T00:00:00');
          if (String(d.getFullYear()) === season && d.getMonth() === i) {
            if (x.type === 'goal') g += x.qty; else a += x.qty;
          }
        });
        return { g, a };
      });
    }

    if (!labels.length) {
      const text = document.createElementNS(NS, 'text');
      text.setAttribute('x', '20');
      text.setAttribute('y', '110');
      text.setAttribute('fill', '#4B5A62');
      text.setAttribute('font-family', 'Work Sans, sans-serif');
      text.setAttribute('font-size', '14');
      text.textContent = 'No data yet — log a goal or assist to see the chart.';
      chartSvg.appendChild(text);
      chartSvg.setAttribute('viewBox', '0 0 480 220');
      return;
    }

    const width = Math.max(480, labels.length * 64);
    const height = 220;
    const padBottom = 34;
    const padTop = 14;
    const chartH = height - padBottom - padTop;
    const maxVal = Math.max(1, ...buckets.map((b) => b.g + b.a));
    const groupW = width / labels.length;
    const barW = Math.min(22, groupW / 3.2);

    chartSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    // baseline
    const baseline = document.createElementNS(NS, 'line');
    baseline.setAttribute('x1', 0);
    baseline.setAttribute('x2', width);
    baseline.setAttribute('y1', height - padBottom);
    baseline.setAttribute('y2', height - padBottom);
    baseline.setAttribute('stroke', '#ECE8DE');
    baseline.setAttribute('stroke-width', '2');
    chartSvg.appendChild(baseline);

    labels.forEach((label, i) => {
      const { g, a } = buckets[i];
      const cx = i * groupW + groupW / 2;

      const gH = (g / maxVal) * chartH;
      const aH = (a / maxVal) * chartH;

      const gBar = document.createElementNS(NS, 'rect');
      gBar.setAttribute('x', cx - barW - 2);
      gBar.setAttribute('y', height - padBottom - gH);
      gBar.setAttribute('width', barW);
      gBar.setAttribute('height', gH);
      gBar.setAttribute('rx', 3);
      gBar.setAttribute('fill', '#E8A33D');
      chartSvg.appendChild(gBar);
      if (g > 0) {
        const t = document.createElementNS(NS, 'title');
        t.textContent = `${label}: ${g} goal${g === 1 ? '' : 's'}`;
        gBar.appendChild(t);
      }

      const aBar = document.createElementNS(NS, 'rect');
      aBar.setAttribute('x', cx + 2);
      aBar.setAttribute('y', height - padBottom - aH);
      aBar.setAttribute('width', barW);
      aBar.setAttribute('height', aH);
      aBar.setAttribute('rx', 3);
      aBar.setAttribute('fill', '#3A6EA5');
      chartSvg.appendChild(aBar);
      if (a > 0) {
        const t = document.createElementNS(NS, 'title');
        t.textContent = `${label}: ${a} assist${a === 1 ? '' : 's'}`;
        aBar.appendChild(t);
      }

      const labelText = document.createElementNS(NS, 'text');
      labelText.setAttribute('x', cx);
      labelText.setAttribute('y', height - 12);
      labelText.setAttribute('text-anchor', 'middle');
      labelText.setAttribute('font-family', 'JetBrains Mono, monospace');
      labelText.setAttribute('font-size', '11');
      labelText.setAttribute('fill', '#4B5A62');
      labelText.textContent = label;
      chartSvg.appendChild(labelText);
    });
  }

  /* ---------- Timeline ribbon ---------- */
  function renderTimeline(filtered) {
    const season = fSeason.value;
    timelineWrap.innerHTML = '';

    if (season === 'all') {
      timelineHint.hidden = false;
      timelineHint.textContent = 'Pick a specific season above to see when it happened, match by match.';
      return;
    }

    const yearEntries = entries
      .filter((x) => String(seasonYear(x.date)) === season)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (!yearEntries.length) {
      timelineHint.hidden = false;
      timelineHint.textContent = `No entries logged for the ${season} season yet.`;
      return;
    }

    timelineHint.hidden = true;

    const NS = 'http://www.w3.org/2000/svg';
    const width = Math.max(480, yearEntries.length * 46 + 80);
    const height = 130;
    const y = 64;

    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Timeline of contributions in the ${season} season`);

    const jan1 = new Date(`${season}-01-01T00:00:00`);
    const dec31 = new Date(`${season}-12-31T00:00:00`);
    const totalDays = (dec31 - jan1) / 86400000 || 1;
    const xFor = (dateStr) => {
      const d = new Date(dateStr + 'T00:00:00');
      const dayOfYear = (d - jan1) / 86400000;
      return 40 + (dayOfYear / totalDays) * (width - 80);
    };

    const line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', 30);
    line.setAttribute('x2', width - 30);
    line.setAttribute('y1', y);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#ECE8DE');
    line.setAttribute('stroke-width', '3');
    svg.appendChild(line);

    ['Jan', 'Apr', 'Jul', 'Oct', 'Dec'].forEach((m, idx) => {
      const monthIdx = [0, 3, 6, 9, 11][idx];
      const md = new Date(`${season}-${String(monthIdx + 1).padStart(2, '0')}-01T00:00:00`);
      const x = xFor(md.toISOString().slice(0, 10));
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', x);
      t.setAttribute('y', y + 34);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('font-family', 'JetBrains Mono, monospace');
      t.setAttribute('font-size', '11');
      t.setAttribute('fill', '#4B5A62');
      t.textContent = m;
      svg.appendChild(t);
    });

    // group entries that fall on close-together x to slightly offset vertically to avoid overlap
    yearEntries.forEach((x, i) => {
      const cx = xFor(x.date);
      const isGoal = x.type === 'goal';
      const cy = y + (i % 2 === 0 ? -18 : 18);

      const stem = document.createElementNS(NS, 'line');
      stem.setAttribute('x1', cx);
      stem.setAttribute('x2', cx);
      stem.setAttribute('y1', y);
      stem.setAttribute('y2', cy);
      stem.setAttribute('stroke', '#ECE8DE');
      stem.setAttribute('stroke-width', '2');
      svg.appendChild(stem);

      let marker;
      if (isGoal) {
        marker = document.createElementNS(NS, 'circle');
        marker.setAttribute('cx', cx);
        marker.setAttribute('cy', cy);
        marker.setAttribute('r', 7);
        marker.setAttribute('fill', '#E8A33D');
      } else {
        marker = document.createElementNS(NS, 'polygon');
        const p = [
          [cx, cy - 8], [cx - 7, cy + 6], [cx + 7, cy + 6]
        ].map((pt) => pt.join(',')).join(' ');
        marker.setAttribute('points', p);
        marker.setAttribute('fill', '#3A6EA5');
      }
      marker.style.cursor = 'pointer';
      const title = document.createElementNS(NS, 'title');
      const parts = [formatDate(x.date), isGoal ? 'Goal' : 'Assist'];
      if (x.qty > 1) parts.push(`x${x.qty}`);
      if (x.opponent) parts.push(`vs ${x.opponent}`);
      if (x.minute !== null && x.minute !== undefined) parts.push(`${x.minute}'`);
      title.textContent = parts.join(' — ');
      marker.appendChild(title);
      svg.appendChild(marker);
    });

    timelineWrap.appendChild(svg);
  }

  /* ---------- Render all ---------- */
  function renderAll() {
    const filtered = getFilteredEntries();
    renderScoreboard();
    renderTable(filtered);
    renderChart(filtered);
    renderTimeline(filtered);
  }

  /* ---------- Init ---------- */
  renderProfile();
  populateSeasonOptions();
  renderAll();
})();
