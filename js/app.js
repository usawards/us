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
  grid.innerHTML = CATEGORIES.map((c, i) => `
    <div class="cat-card" onclick="filterByCategory('${c.slug}')">
      <div class="medallion">0${i + 1}</div>
      <div class="eyebrow-tag">Award Category</div>
      <h3>${escapeHtml(c.name)}</h3>
      <p>${escapeHtml(c.description || '')}</p>
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
  { q: 'How much does each vote cost?', a: 'Each vote costs $0.90 USD for most categories, paid by Apple Pay or card. The Best African Youth Leader category is $KES 120 per vote via M-Pesa. You can vote for any nominee as many times as you like — there is no limit on total votes.' },
  { q: 'What payment methods are accepted?', a: 'Apple Pay and card (Visa, Mastercard, American Express where supported) for most categories, processed securely through Paystack. The Best African Youth Leader category accepts M-Pesa via STK push instead.' },
  { q: 'Is my payment secure?', a: 'Yes. All transactions are processed through Paystack with webhook verification, and no card or M-Pesa details are stored on our servers.' },
  { q: 'When do votes appear on the leaderboard?', a: 'Immediately — the leaderboard updates in real time as soon as a payment is confirmed.' },
  { q: 'Will I get an email receipt?', a: 'No — voting doesn\'t require an email address, so no receipt is sent. Your vote is confirmed immediately on screen, and it appears on the leaderboard right away.' },
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

function isMpesaCategory() {
  return currentNominee?.category_payment_mode === 'mpesa';
}
function pricePerVote() {
  return isMpesaCategory() ? VOTE_PRICE_KES : VOTE_PRICE_USD;
}
function currencySymbol() {
  return isMpesaCategory() ? 'KES ' : '$';
}

function renderModalForm() {
  const n = currentNominee;
  const total = (currentQty * pricePerVote()).toFixed(2);
  const sym = currencySymbol();

  const qtyBlock = `
    <div class="qty-label">Number of Votes</div>
    <div class="qty-presets">
      ${PRESETS.map((v) => `<div class="qty-chip ${v === currentQty ? 'active' : ''}" onclick="setQty(${v})">${v}</div>`).join('')}
    </div>
    <div class="qty-stepper">
      <button onclick="stepQty(-5)">−</button>
      <input type="number" id="qty-input" value="${currentQty}" min="1" oninput="onQtyInput(this.value)">
      <button onclick="stepQty(5)">+</button>
    </div>
    <div class="form-row"><label>Name (optional)</label><input id="voter-name" placeholder="Jane Doe"></div>
  `;

  const totalBlock = `
    <div class="total-row">
      <div>
        <div class="lbl">Total Amount</div>
        <div class="sub">${currentQty} votes × ${sym}${pricePerVote().toFixed(2)}</div>
      </div>
      <div class="amt" id="total-amt">${sym}${total}</div>
    </div>
    <div id="modal-error" style="color:#A32638;font-size:12.5px;margin-bottom:10px;"></div>
  `;

  const paymentBlock = isMpesaCategory() ? `
    <div class="form-row"><label>M-Pesa Phone Number</label><input id="voter-phone" type="tel" placeholder="07XXXXXXXX"></div>
    <button class="btn-pay" id="pay-btn" onclick="startMpesaPayment()">Send M-Pesa Prompt — ${sym}${total}</button>
    <div class="secure-note">🔒 You'll get an STK push on your phone — enter your M-Pesa PIN to complete this vote</div>
  ` : `
    <button class="pay-apple" onclick="startPayment('apple_pay')">
      <svg viewBox="0 0 24 24" fill="white" style="height:20px;"><path d="M16.5 3c-1.1.1-2.3.7-3.1 1.6-.7.8-1.3 2-1.1 3.1 1.2.1 2.4-.6 3.2-1.5.7-.9 1.2-2.1 1-3.2zM20.9 17.4c-.5 1.1-.8 1.6-1.4 2.6-.9 1.4-2.2 3.1-3.7 3.1-1.4 0-1.7-.9-3.5-.9s-2.2.9-3.5.9c-1.5 0-2.7-1.6-3.6-3-2.5-3.7-2.7-8-.1-12.2 1.2-1.7 2.9-2.7 4.6-2.7 1.4 0 2.4.9 3.5.9 1 0 2.3-1 3.9-.9.6 0 3 .2 4.5 2.4-.1.1-2.7 1.6-2.6 4.7 0 3.7 3.3 4.9 3.4 5.1z"/></svg>
      Pay with Apple Pay
    </button>
    <div class="divider">or pay by card</div>
    <button class="btn-pay" id="pay-btn" onclick="startPayment('card')">Pay with Card — ${sym}${total}</button>
    <div class="secure-note">🔒 Redirects to Paystack's secure checkout</div>
  `;

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
      ${qtyBlock}
      ${totalBlock}
      ${paymentBlock}
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
  const total = (currentQty * pricePerVote()).toFixed(2);
  const sym = currencySymbol();
  document.getElementById('total-amt').textContent = `${sym}${total}`;
  const btn = document.getElementById('pay-btn');
  if (btn && !isMpesaCategory()) btn.textContent = `Pay with Card — ${sym}${total}`;
  if (btn && isMpesaCategory()) btn.textContent = `Send M-Pesa Prompt — ${sym}${total}`;
  document.querySelectorAll('.qty-chip').forEach((c) => c.classList.remove('active'));
}

// ---- Standard flow: card / Apple Pay, redirects to Paystack's hosted checkout ----
async function startPayment(preferredChannel) {
  const name = document.getElementById('voter-name').value.trim();
  const errorEl = document.getElementById('modal-error');
  errorEl.textContent = '';

  const btn = document.getElementById('pay-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Starting secure checkout…'; }

  try {
    const data = await Api.initiateVote({
      nominee_id: currentNominee.id,
      quantity: currentQty,
      name: name || undefined,
      preferred_channel: preferredChannel,
    });
    window.location.href = data.authorization_url;
  } catch (err) {
    errorEl.textContent = err.message || 'Could not start payment. Please try again.';
    if (btn) { btn.disabled = false; btn.textContent = `Pay with Card — $${(currentQty * VOTE_PRICE_USD).toFixed(2)}`; }
  }
}

// ---- M-Pesa flow: triggers an STK push, no redirect - poll until it resolves ----
async function startMpesaPayment() {
  const name = document.getElementById('voter-name').value.trim();
  const phone = document.getElementById('voter-phone').value.trim();
  const errorEl = document.getElementById('modal-error');
  errorEl.textContent = '';

  if (!/^(?:\+?254|0)7\d{8}$/.test(phone.replace(/\s+/g, ''))) {
    errorEl.textContent = 'Enter a valid M-Pesa number, e.g. 07XXXXXXXX.';
    return;
  }

  const btn = document.getElementById('pay-btn');
  btn.disabled = true;
  btn.textContent = 'Sending M-Pesa prompt…';

  try {
    const data = await Api.initiateVote({
      nominee_id: currentNominee.id,
      quantity: currentQty,
      name: name || undefined,
      voter_phone: phone,
    });
    showMpesaWaiting(data.reference, data.display_text);
    pollMpesaStatus(data.reference);
  } catch (err) {
    errorEl.textContent = err.message || 'Could not start the M-Pesa payment. Please try again.';
    btn.disabled = false;
    btn.textContent = `Send M-Pesa Prompt — KES ${(currentQty * VOTE_PRICE_KES).toFixed(2)}`;
  }
}

function showMpesaWaiting(reference, displayText) {
  document.getElementById('modal-content').innerHTML = `
    <div class="success-view">
      <div class="success-check"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A32638" stroke-width="2.5"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/></svg></div>
      <h3>Check Your Phone</h3>
      <p>${escapeHtml(displayText || 'Enter your M-Pesa PIN to complete this vote.')}</p>
      <p style="font-size:11.5px;color:#9aa4b2;">Reference: ${escapeHtml(reference)}</p>
    </div>`;
}

async function pollMpesaStatus(reference, attempts = 0) {
  try {
    const data = await Api.verifyVote(reference);
    if (data.status === 'success') {
      showVoteSuccess(reference, data.quantity);
      return;
    }
    if (data.status === 'failed') {
      document.getElementById('modal-content').innerHTML = `
        <div class="success-view">
          <h3 style="color:#A32638;">Payment Not Completed</h3>
          <p>The M-Pesa prompt wasn't confirmed. No votes were charged.</p>
          <button class="btn-primary" style="width:100%;" onclick="closeModal()">Close</button>
        </div>`;
      return;
    }
  } catch (err) {
    // keep polling - a transient error here shouldn't end the wait
  }
  if (attempts < 20) {
    setTimeout(() => pollMpesaStatus(reference, attempts + 1), 3000);
  } else {
    document.getElementById('modal-content').innerHTML = `
      <div class="success-view">
        <h3>Still Waiting</h3>
        <p>This is taking longer than usual. If you completed the prompt on your phone, your vote will still be counted — check the leaderboard shortly.</p>
        <button class="btn-primary" style="width:100%;" onclick="closeModal()">Close</button>
      </div>`;
  }
}

function showVoteSuccess(reference, quantity) {
  document.getElementById('modal-content').innerHTML = `
    <div class="success-view">
      <div class="success-check"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A32638" stroke-width="2.5"><path d="M4 12l5 5L20 6"/></svg></div>
      <h3>Vote Confirmed</h3>
      <p>${quantity} vote${quantity === 1 ? '' : 's'} counted for ${escapeHtml(currentNominee?.name || '')}.</p>
      <button class="btn-primary" style="width:100%;" onclick="closeModal(); renderNominees(); renderLeaderboard();">Done</button>
    </div>`;
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
