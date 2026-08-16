/* ===================== STATE ===================== */
let CATEGORIES = [];
let currentNominee = null; // nominee currently open in the vote modal
let currentQty = 10;
const PRESETS = [10, 25, 50, 100];

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadSettings();
  renderNominees();
  renderLeaderboard();
  renderFaq();
  setInterval(renderLeaderboard, 30000); // light polling so counts stay fresh
  document.getElementById('overlay').addEventListener('click', (e) => {
    if (e.target.id === 'overlay') closeModal();
  });
});

/* ===================== CATEGORIES ===================== */
async function loadCategories() {
  try {
    const data = await Api.getCategories();
    CATEGORIES = data.categories || [];
  } catch (err) {
    console.error('Failed to load categories:', err);
    CATEGORIES = [];
  }

  const grid = document.getElementById('cat-grid');
  grid.innerHTML = CATEGORIES.map((c) => `
    <div class="cat-card" onclick="filterByCategory('${c.slug}')">
      <h3>${escapeHtml(c.name)}</h3>
    </div>`).join('');

  const sel = document.getElementById('filter-cat');
  sel.innerHTML = '<option value="">All Categories</option>' +
    CATEGORIES.map((c) => `<option value="${c.slug}">${escapeHtml(c.name)}</option>`).join('');
}

function filterByCategory(slug) {
  document.getElementById('filter-cat').value = slug;
  renderNominees();
  document.getElementById('nominees').scrollIntoView({ behavior: 'smooth' });
}

/* ===================== SETTINGS (homepage banner / prizes / deadline) ===================== */
async function loadSettings() {
  try {
    const data = await Api.getSettings();
    const settings = data.settings || {};

    if (settings.voting_deadline) startCountdown(settings.voting_deadline);
    else startCountdown('2026-09-01T00:00:00.000Z');

    if (Array.isArray(settings.prizes) && settings.prizes.length) {
      const grid = document.getElementById('prize-grid');
      grid.innerHTML = settings.prizes.map((p) => `
        <div class="prize-card"><div class="amt">${escapeHtml(p)}</div></div>`).join('');
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
    startCountdown('2026-09-01T00:00:00.000Z');
  }
}

/* ===================== NOMINEES ===================== */
let nomineeSearchTimer = null;
function onSearchInput() {
  clearTimeout(nomineeSearchTimer);
  nomineeSearchTimer = setTimeout(renderNominees, 300); // debounce typing
}

async function renderNominees() {
  const grid = document.getElementById('nominee-grid');
  grid.innerHTML = `<p style="color:#8a93a3;font-size:14px;">Loading nominees…</p>`;

  const params = {
    search: document.getElementById('search').value.trim(),
    category: document.getElementById('filter-cat').value,
    state: document.getElementById('filter-state').value,
    sort: document.getElementById('sort-by').value,
  };

  let nominees = [];
  try {
    const data = await Api.getNominees(params);
    nominees = data.nominees || [];
  } catch (err) {
    grid.innerHTML = `<p style="color:#8a93a3;font-size:14px;">Couldn't load nominees right now. Please refresh.</p>`;
    console.error(err);
    return;
  }

  populateStateFilter(nominees);

  if (nominees.length === 0) {
    grid.innerHTML = `<p style="color:#8a93a3;font-size:14px;">No nominees match your search.</p>`;
    return;
  }

  grid.innerHTML = nominees.map((n) => {
    const catLabel = (n.category_name || '').replace('Best ', '').replace(' Award', '');
    return `
    <div class="nom-card">
      <div class="nom-photo" style="background-image:url('${escapeAttr(n.photo_url || '')}')">
        <div class="badge">${escapeHtml(catLabel)}</div>
      </div>
      <div class="nom-stub">
        <h3>${escapeHtml(n.name)}</h3>
        <div class="state">${escapeHtml(n.state || '')}</div>
        <div class="bio">${escapeHtml(n.bio || '')}</div>
        <div class="nom-stats">
          <div>
            <div class="votecount">${Number(n.votes_count).toLocaleString()}</div>
            <div class="votelabel">Total Votes</div>
          </div>
        </div>
        <div class="nom-actions">
          <button class="btn-vote" onclick='openVoteModal(${JSON.stringify(n)})'>Vote Now</button>
          <button class="btn-share" title="Share profile" onclick="shareProfile('${n.id}')">↗</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function populateStateFilter(nominees) {
  const stateSel = document.getElementById('filter-state');
  const current = stateSel.value;
  const states = [...new Set(nominees.map((n) => n.state).filter(Boolean))].sort();
  stateSel.innerHTML = '<option value="">All States</option>' +
    states.map((s) => `<option value="${s}">${s}</option>`).join('');
  stateSel.value = states.includes(current) ? current : '';
}

function shareProfile(id) {
  const url = `${window.location.origin}${window.location.pathname}#nominee-${id}`;
  navigator.clipboard?.writeText(url);
  showToast('Profile link copied to clipboard.');
}

/* ===================== LEADERBOARD ===================== */
async function renderLeaderboard() {
  let leaderboard = [];
  let totalVotes = 0;
  try {
    const data = await Api.getLeaderboard({ limit: 50 });
    leaderboard = data.leaderboard || [];
    totalVotes = data.total_votes || 0;
  } catch (err) {
    console.error('Failed to load leaderboard:', err);
    return;
  }

  const max = leaderboard[0]?.votes_count || 1;
  const body = document.getElementById('board-body');
  body.innerHTML = leaderboard.map((n) => {
    const rankClass = n.rank === 1 ? 'r1' : n.rank === 2 ? 'r2' : n.rank === 3 ? 'r3' : '';
    return `
    <div class="board-row">
      <div class="rank ${rankClass}">${n.rank}</div>
      <div class="board-photo" style="background-image:url('${escapeAttr(n.photo_url || '')}')"></div>
      <div>
        <div class="board-name">${escapeHtml(n.name)}</div>
        <div class="board-bar"><div class="board-bar-fill" style="width:${(n.votes_count / max * 100).toFixed(0)}%"></div></div>
      </div>
      <div class="board-cat col-cat">${escapeHtml(n.category_name || '')}</div>
      <div class="board-votes">${Number(n.votes_count).toLocaleString()}</div>
    </div>`;
  }).join('');

  document.getElementById('stub-total').textContent = totalVotes.toLocaleString();
}

/* ===================== FAQ (static content, no API needed) ===================== */
const FAQS = [
  { q: 'How much does each vote cost?', a: 'Each vote costs $0.90 USD. You can vote for any nominee as many times as you like — there is no limit on total votes.' },
  { q: 'What payment methods are accepted?', a: 'We accept Apple Pay, Visa, Mastercard, and American Express (where supported), all processed securely through Paystack.' },
  { q: 'Is my payment secure?', a: 'Yes. All transactions are encrypted and processed through Paystack with webhook verification, and no card details are stored on our servers.' },
  { q: 'When do votes appear on the leaderboard?', a: 'Immediately — the leaderboard updates in real time as soon as a payment is confirmed.' },
  { q: 'Will I get a receipt?', a: 'Yes, a payment confirmation and receipt are emailed to you automatically after every successful transaction.' },
];

function renderFaq() {
  const list = document.getElementById('faq-list');
  list.innerHTML = FAQS.map((f, i) => `
    <div class="faq-item" id="faq-${i}">
      <button class="faq-q" onclick="toggleFaq(${i})">
        <span>${escapeHtml(f.q)}</span><span class="plus">+</span>
      </button>
      <div class="faq-a" id="faq-a-${i}"><div class="faq-a-inner">${escapeHtml(f.a)}</div></div>
    </div>`).join('');
}

function toggleFaq(i) {
  const item = document.getElementById(`faq-${i}`);
  const answer = document.getElementById(`faq-a-${i}`);
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach((el) => {
    el.classList.remove('open');
    el.querySelector('.faq-a').style.maxHeight = null;
  });
  if (!isOpen) {
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}

/* ===================== COUNTDOWN ===================== */
let countdownDeadline = null;
function startCountdown(deadlineIso) {
  countdownDeadline = new Date(deadlineIso);
  tickCountdown();
}
function tickCountdown() {
  if (!countdownDeadline) return;
  const diff = Math.max(0, countdownDeadline - new Date());
  document.getElementById('cd-days').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
  document.getElementById('cd-hours').textContent = String(Math.floor(diff % 86400000 / 3600000)).padStart(2, '0');
  document.getElementById('cd-mins').textContent = String(Math.floor(diff % 3600000 / 60000)).padStart(2, '0');
  document.getElementById('cd-secs').textContent = String(Math.floor(diff % 60000 / 1000)).padStart(2, '0');
}
setInterval(tickCountdown, 1000);

/* ===================== VOTE MODAL ===================== */
function openVoteModal(nominee) {
  currentNominee = nominee;
  currentQty = 10;
  renderModalForm();
  document.getElementById('overlay').classList.add('show');
}
function closeModal() {
  document.getElementById('overlay').classList.remove('show');
  currentNominee = null;
}

function renderModalForm() {
  const n = currentNominee;
  const total = (currentQty * VOTE_PRICE_USD).toFixed(2);

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-head">
      <div class="photo" style="background-image:url('${escapeAttr(n.photo_url || '')}')"></div>
      <div>
        <h3>${escapeHtml(n.name)}</h3>
        <p>${escapeHtml(n.category_name || '')}</p>
      </div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <div class="qty-label">Number of Votes</div>
      <div class="qty-presets">
        ${PRESETS.map((v) => `<div class="qty-chip ${v === currentQty ? 'active' : ''}" onclick="setQty(${v})">${v}</div>`).join('')}
      </div>
      <div class="qty-stepper">
        <button onclick="stepQty(-5)">−</button>
        <input type="number" id="qty-input" value="${currentQty}" min="1" oninput="onQtyInput(this.value)">
        <button onclick="stepQty(5)">+</button>
      </div>

      <div class="form-row"><label>Email (optional) — for your receipt</label><input id="voter-email" type="email" placeholder="you@email.com"></div>
      <div class="form-row"><label>Name (optional)</label><input id="voter-name" placeholder="Jane Doe"></div>

      <div class="total-row">
        <div>
          <div class="lbl">Total Amount</div>
          <div class="sub">${currentQty} votes × $${VOTE_PRICE_USD.toFixed(2)}</div>
        </div>
        <div class="amt" id="total-amt">$${total}</div>
      </div>

      <div id="modal-error" style="color:#A32638;font-size:12.5px;margin-bottom:10px;"></div>

      <button class="btn-pay" id="pay-btn" onclick="startPayment()">Continue to Payment — $${total}</button>
      <div class="secure-note">🔒 You'll choose Apple Pay or card on Paystack's secure checkout page</div>
    </div>
  `;
}

function setQty(v) {
  currentQty = v;
  renderModalForm();
}
function stepQty(delta) {
  currentQty = Math.max(1, currentQty + delta);
  renderModalForm();
}
function onQtyInput(v) {
  currentQty = Math.max(1, parseInt(v) || 1);
  const total = (currentQty * VOTE_PRICE_USD).toFixed(2);
  document.getElementById('total-amt').textContent = `$${total}`;
  document.getElementById('pay-btn').textContent = `Continue to Payment — $${total}`;
  document.querySelectorAll('.qty-chip').forEach((c) => c.classList.remove('active'));
}

async function startPayment() {
  let email = document.getElementById('voter-email').value.trim();
  const name = document.getElementById('voter-name').value.trim();
  const errorEl = document.getElementById('modal-error');
  errorEl.textContent = '';

  // Email is optional. If left blank, use a clearly-internal placeholder
  // (not a fake-looking real address) so the transaction row still has a
  // value. If they *did* type something, it still has to be a valid email
  // since that's where their receipt goes.
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    errorEl.textContent = 'That doesn\'t look like a valid email — leave it blank to skip, or fix the format.';
    return;
  }
  if (!email) {
    email = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@usawards.github.io`;
  }

  const btn = document.getElementById('pay-btn');
  btn.disabled = true;
  btn.textContent = 'Starting secure checkout…';

  try {
    const data = await Api.initiateVote({
      nominee_id: currentNominee.id,
      quantity: currentQty,
      email,
      name: name || undefined,
    });
    // Redirect to Paystack's hosted checkout - it presents Apple Pay/card
    // itself based on your Paystack account settings + the visitor's device.
    window.location.href = data.authorization_url;
  } catch (err) {
    errorEl.textContent = err.message || 'Could not start payment. Please try again.';
    btn.disabled = false;
    btn.textContent = `Continue to Payment — $${(currentQty * VOTE_PRICE_USD).toFixed(2)}`;
  }
}

/* ===================== MISC / UTIL ===================== */
function scrollToNominees() {
  document.getElementById('nominees').scrollIntoView({ behavior: 'smooth' });
}

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
  return String(str ?? '').replace(/'/g, '%27');
}
