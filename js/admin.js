/* ===================== STATE ===================== */
let ADMIN_CATEGORIES = [];
let currentTab = 'stats';

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  if (getAdminToken()) {
    showDashboard();
  } else {
    showLogin();
  }

  document.getElementById('login-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });

  document.querySelectorAll('#admin-tabs a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(a.dataset.tab);
    });
  });

  ['cat-overlay', 'nom-overlay'].forEach((id) => {
    document.getElementById(id).addEventListener('click', (e) => {
      if (e.target.id === id) e.target.classList.remove('show');
    });
  });
});

function onAdminUnauthorized() {
  showLogin();
  showToast('Session expired — please log in again.');
}

/* ===================== AUTH ===================== */
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Enter both email and password.';
    return;
  }

  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'Logging in…';

  try {
    const data = await AdminApi.login(email, password);
    setAdminSession(data.token, data.admin);
    showDashboard();
  } catch (err) {
    errorEl.textContent = err.message || 'Login failed.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Log In';
  }
}

function doLogout() {
  clearAdminSession();
  showLogin();
}

function showLogin() {
  document.getElementById('dash-view').style.display = 'none';
  document.getElementById('login-view').style.display = 'flex';
  document.getElementById('login-password').value = '';
}

function showDashboard() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('dash-view').style.display = 'block';

  const admin = getAdminInfo();
  document.getElementById('admin-whoami').textContent = admin ? `${admin.email} (${admin.role})` : '';

  // Audit log is superadmin-only per the backend's requireRole check.
  document.getElementById('audit-tab-link').style.display = admin?.role === 'superadmin' ? '' : 'none';

  switchTab('stats');
}

/* ===================== TABS ===================== */
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('#admin-tabs a').forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
  document.querySelectorAll('.admin-panel').forEach((p) => (p.style.display = 'none'));
  document.getElementById(`panel-${tab}`).style.display = 'block';

  if (tab === 'stats') loadStats();
  if (tab === 'categories') loadCategories();
  if (tab === 'nominees') loadNomineesTabInit();
  if (tab === 'transactions') loadTransactions();
  if (tab === 'settings') loadSettings();
  if (tab === 'audit') loadAuditLogs();
}

/* ===================== STATS ===================== */
async function loadStats() {
  const grid = document.getElementById('stat-grid');
  grid.innerHTML = `<p style="color:#8a93a3;">Loading…</p>`;
  try {
    const data = await AdminApi.getStats();
    const byStatus = (data.transactions_by_status || [])
      .map((s) => `<span>${escapeHtml(s.status)}: ${s.count}</span>`).join('');

    grid.innerHTML = `
      <div class="stat-card"><div class="lbl">Total Votes</div><div class="val">${Number(data.total_votes).toLocaleString()}</div></div>
      <div class="stat-card"><div class="lbl">Total Revenue</div><div class="val">$${Number(data.total_revenue_usd).toFixed(2)}</div></div>
      <div class="stat-card"><div class="lbl">Active Nominees</div><div class="val">${Number(data.total_nominees).toLocaleString()}</div></div>
      <div class="stat-card"><div class="lbl">Transactions</div><div class="breakdown">${byStatus || '—'}</div></div>
    `;
  } catch (err) {
    grid.innerHTML = `<p style="color:var(--red);">${escapeHtml(err.message)}</p>`;
  }
}

/* ===================== CATEGORIES ===================== */
async function loadCategories() {
  const body = document.getElementById('categories-body');
  body.innerHTML = `<tr><td colspan="4">Loading…</td></tr>`;
  try {
    const data = await AdminApi.getCategories();
    ADMIN_CATEGORIES = data.categories || [];
    body.innerHTML = ADMIN_CATEGORIES.map((c) => `
      <tr>
        <td>${escapeHtml(c.name)}</td>
        <td><code>${escapeHtml(c.slug)}</code></td>
        <td>${escapeHtml(c.description || '')}</td>
        <td class="row-actions">
          <button onclick='openCategoryForm(${JSON.stringify(c)})'>Edit</button>
          <button class="danger" onclick="deleteCategory('${c.id}')">Delete</button>
        </td>
      </tr>`).join('') || `<tr><td colspan="4">No categories yet.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="4" style="color:var(--red);">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openCategoryForm(category = null) {
  const isEdit = !!category;
  document.getElementById('cat-modal-content').innerHTML = `
    <div class="admin-modal-body">
      <h3>${isEdit ? 'Edit Category' : 'New Category'}</h3>
      <div class="form-row"><label>Name</label><input id="cat-form-name" value="${isEdit ? escapeAttr(category.name) : ''}"></div>
      <div class="form-row"><label>Description</label><textarea id="cat-form-desc" rows="3">${isEdit ? escapeHtml(category.description || '') : ''}</textarea></div>
      <div id="cat-form-error" class="admin-error"></div>
      <button class="btn-primary" style="width:100%;" onclick="submitCategoryForm(${isEdit ? `'${category.id}'` : 'null'})">${isEdit ? 'Save Changes' : 'Create Category'}</button>
    </div>`;
  document.getElementById('cat-overlay').classList.add('show');
}
function closeCategoryModal() {
  document.getElementById('cat-overlay').classList.remove('show');
}

async function submitCategoryForm(id) {
  const name = document.getElementById('cat-form-name').value.trim();
  const description = document.getElementById('cat-form-desc').value.trim();
  const errorEl = document.getElementById('cat-form-error');
  errorEl.textContent = '';

  if (name.length < 2) {
    errorEl.textContent = 'Name must be at least 2 characters.';
    return;
  }

  try {
    if (id) await AdminApi.updateCategory(id, { name, description });
    else await AdminApi.createCategory({ name, description });
    closeCategoryModal();
    showToast(id ? 'Category updated.' : 'Category created.');
    loadCategories();
  } catch (err) {
    errorEl.textContent = err.message || 'Something went wrong.';
  }
}

async function deleteCategory(id) {
  if (!confirm('Delete this category? This only works if it has no nominees.')) return;
  try {
    await AdminApi.deleteCategory(id);
    showToast('Category deleted.');
    loadCategories();
  } catch (err) {
    showToast(err.message || 'Could not delete category.');
  }
}

/* ===================== NOMINEES ===================== */
async function loadNomineesTabInit() {
  if (ADMIN_CATEGORIES.length === 0) {
    try {
      const data = await AdminApi.getCategories();
      ADMIN_CATEGORIES = data.categories || [];
    } catch (_) { /* fall through, filter dropdown just stays empty */ }
  }
  const sel = document.getElementById('nominee-filter-cat');
  sel.innerHTML = '<option value="">All Categories</option>' +
    ADMIN_CATEGORIES.map((c) => `<option value="${c.slug}">${escapeHtml(c.name)}</option>`).join('');
  loadNominees();
}

async function loadNominees() {
  const body = document.getElementById('nominees-body');
  body.innerHTML = `<tr><td colspan="6">Loading…</td></tr>`;
  const category = document.getElementById('nominee-filter-cat').value;
  try {
    const data = await AdminApi.getNominees({ category, limit: 100 });
    const nominees = data.nominees || [];
    body.innerHTML = nominees.map((n) => `
      <tr>
        <td><div class="admin-thumb" style="background-image:url('${escapeAttr(n.photo_url || '')}')"></div></td>
        <td>${escapeHtml(n.name)}</td>
        <td>${escapeHtml(n.category_name || '')}</td>
        <td>${escapeHtml(n.state || '')}</td>
        <td>${Number(n.votes_count).toLocaleString()}</td>
        <td class="row-actions">
          <button onclick='openNomineeForm(${JSON.stringify(n)})'>Edit</button>
          <button class="danger" onclick="deleteNominee('${n.id}')">Delete</button>
        </td>
      </tr>`).join('') || `<tr><td colspan="6">No nominees found.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="6" style="color:var(--red);">${escapeHtml(err.message)}</td></tr>`;
  }
}

function openNomineeForm(nominee = null) {
  const isEdit = !!nominee;
  const catOptions = ADMIN_CATEGORIES.map((c) =>
    `<option value="${c.id}" ${isEdit && nominee.category_slug === c.slug ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');

  document.getElementById('nom-modal-content').innerHTML = `
    <div class="admin-modal-body">
      <h3>${isEdit ? 'Edit Nominee' : 'New Nominee'}</h3>
      <div class="form-row"><label>Name</label><input id="nom-form-name" value="${isEdit ? escapeAttr(nominee.name) : ''}"></div>
      <div class="form-row"><label>Category</label><select id="nom-form-cat" class="select" style="width:100%;">${catOptions}</select></div>
      <div class="form-row"><label>State (2-letter, optional)</label><input id="nom-form-state" maxlength="2" value="${isEdit ? escapeAttr(nominee.state || '') : ''}"></div>
      <div class="form-row"><label>Bio</label><textarea id="nom-form-bio" rows="3">${isEdit ? escapeHtml(nominee.bio || '') : ''}</textarea></div>
      <div class="form-row"><label>Photo URL</label><input id="nom-form-photo" value="${isEdit ? escapeAttr(nominee.photo_url || '') : ''}"></div>
      <div id="nom-form-error" class="admin-error"></div>
      <button class="btn-primary" style="width:100%;" onclick="submitNomineeForm(${isEdit ? `'${nominee.id}'` : 'null'})">${isEdit ? 'Save Changes' : 'Create Nominee'}</button>
    </div>`;
  document.getElementById('nom-overlay').classList.add('show');
}
function closeNomineeModal() {
  document.getElementById('nom-overlay').classList.remove('show');
}

async function submitNomineeForm(id) {
  const name = document.getElementById('nom-form-name').value.trim();
  const category_id = document.getElementById('nom-form-cat').value;
  const state = document.getElementById('nom-form-state').value.trim().toUpperCase();
  const bio = document.getElementById('nom-form-bio').value.trim();
  const photo_url = document.getElementById('nom-form-photo').value.trim();
  const errorEl = document.getElementById('nom-form-error');
  errorEl.textContent = '';

  if (name.length < 2) {
    errorEl.textContent = 'Name must be at least 2 characters.';
    return;
  }
  if (!category_id) {
    errorEl.textContent = 'Choose a category.';
    return;
  }

  const payload = { name, category_id, state: state || undefined, bio: bio || undefined, photo_url: photo_url || undefined };

  try {
    if (id) await AdminApi.updateNominee(id, payload);
    else await AdminApi.createNominee(payload);
    closeNomineeModal();
    showToast(id ? 'Nominee updated.' : 'Nominee created.');
    loadNominees();
  } catch (err) {
    errorEl.textContent = err.message || 'Something went wrong.';
  }
}

async function deleteNominee(id) {
  if (!confirm('Remove this nominee from public listings? (Their vote history is kept.)')) return;
  try {
    await AdminApi.deleteNominee(id);
    showToast('Nominee removed.');
    loadNominees();
  } catch (err) {
    showToast(err.message || 'Could not delete nominee.');
  }
}

/* ===================== TRANSACTIONS ===================== */
async function loadTransactions() {
  const body = document.getElementById('tx-body');
  body.innerHTML = `<tr><td colspan="8">Loading…</td></tr>`;
  const status = document.getElementById('tx-status-filter').value;
  try {
    const data = await AdminApi.getTransactions({ status, limit: 100 });
    const txs = data.transactions || [];
    body.innerHTML = txs.map((t) => `
      <tr>
        <td><code>${escapeHtml(t.reference)}</code></td>
        <td>${escapeHtml(t.nominee_name)}</td>
        <td>${t.quantity}</td>
        <td>$${Number(t.amount_usd).toFixed(2)}</td>
        <td><span class="badge-status ${escapeHtml(t.status)}">${escapeHtml(t.status)}</span></td>
        <td>${escapeHtml(t.channel || '—')}</td>
        <td>${escapeHtml(t.voter_email)}</td>
        <td>${new Date(t.created_at).toLocaleString()}</td>
      </tr>`).join('') || `<tr><td colspan="8">No transactions found.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="8" style="color:var(--red);">${escapeHtml(err.message)}</td></tr>`;
  }
}

async function exportCsv() {
  try {
    const token = getAdminToken();
    const res = await fetch(`${API_BASE_URL}/api/admin/transactions/export.csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Export failed.');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usea-transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    showToast(err.message || 'Export failed.');
  }
}

/* ===================== SETTINGS ===================== */
async function loadSettings() {
  const errorEl = document.getElementById('settings-error');
  errorEl.textContent = '';
  try {
    const data = await AdminApi.getSettings();
    const s = data.settings || {};
    document.getElementById('set-deadline').value = s.voting_deadline || '';
    document.getElementById('set-headline').value = s.homepage_banner?.headline || '';
    document.getElementById('set-subtext').value = s.homepage_banner?.subtext || '';
    document.getElementById('set-prizes').value = Array.isArray(s.prizes) ? s.prizes.join('\n') : '';
  } catch (err) {
    errorEl.textContent = err.message || 'Could not load settings.';
  }
}

async function saveSettings() {
  const errorEl = document.getElementById('settings-error');
  errorEl.textContent = '';

  const deadline = document.getElementById('set-deadline').value.trim();
  const headline = document.getElementById('set-headline').value.trim();
  const subtext = document.getElementById('set-subtext').value.trim();
  const prizes = document.getElementById('set-prizes').value.split('\n').map((s) => s.trim()).filter(Boolean);

  try {
    await AdminApi.updateSetting('voting_deadline', deadline);
    await AdminApi.updateSetting('homepage_banner', { headline, subtext });
    await AdminApi.updateSetting('prizes', prizes);
    showToast('Settings saved.');
  } catch (err) {
    errorEl.textContent = err.message || 'Could not save settings.';
  }
}

/* ===================== AUDIT LOG ===================== */
async function loadAuditLogs() {
  const body = document.getElementById('audit-body');
  body.innerHTML = `<tr><td colspan="5">Loading…</td></tr>`;
  try {
    const data = await AdminApi.getAuditLogs();
    const logs = data.audit_logs || [];
    body.innerHTML = logs.map((l) => `
      <tr>
        <td>${escapeHtml(l.admin_email || '—')}</td>
        <td>${escapeHtml(l.action)}</td>
        <td><code style="font-size:11px;">${escapeHtml(JSON.stringify(l.details || {}))}</code></td>
        <td>${escapeHtml(l.ip_address || '')}</td>
        <td>${new Date(l.created_at).toLocaleString()}</td>
      </tr>`).join('') || `<tr><td colspan="5">No audit log entries.</td></tr>`;
  } catch (err) {
    body.innerHTML = `<tr><td colspan="5" style="color:var(--red);">${escapeHtml(err.message)}</td></tr>`;
  }
}

/* ===================== MISC / UTIL ===================== */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-text').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
function escapeAttr(str) {
  return String(str ?? '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}
