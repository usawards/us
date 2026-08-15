// Logic for vote-confirm.html - where PAYSTACK_CALLBACK_URL should point.
// Paystack redirects here with ?reference=... after hosted checkout completes.

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
      const data = await Api.verifyVote(reference);
      if (data.status === 'success') {
        showState('success', { quantity: data.quantity });
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

  if (state === 'success') {
    document.getElementById('vote-qty').textContent = data.quantity;
  }
  if (state === 'pending') {
    document.getElementById('pending-ref').textContent = data.reference;
  }
}
