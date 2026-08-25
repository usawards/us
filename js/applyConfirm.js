// Logic for apply-confirm.html - where PAYSTACK_APPLICATION_CALLBACK_URL
// should point. Paystack redirects here with ?reference=... after hosted
// checkout completes.

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const reference = params.get('reference') || params.get('trxref');

  if (!reference) {
    showState('error');
    return;
  }

  let attempts = 0;
  const poll = async () => {
    attempts += 1;
    try {
      const data = await Api.verifyApplication(reference);
      // "paid" here means the fee cleared - the application still needs
      // manual admin review before it becomes a nominee.
      if (data.status === 'paid' || data.status === 'approved') {
        showState('success');
        return;
      }
      if (data.status === 'failed') {
        showState('failed');
        return;
      }
      if (attempts < 8) {
        setTimeout(poll, 1500);
      } else {
        showState('pending', { reference });
      }
    } catch (err) {
      showState('error');
    }
  };

  poll();
});

function showState(state, data = {}) {
  document.querySelectorAll('.confirm-state').forEach((el) => (el.style.display = 'none'));
  const el = document.getElementById(`state-${state}`);
  el.style.display = 'block';

  if (state === 'pending') {
    document.getElementById('pending-ref').textContent = data.reference;
  }
}
