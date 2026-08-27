function showTooltip(event, text) {
  let tooltip = document.getElementById('statusTooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'statusTooltip';
    tooltip.className = 'fixed bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none z-50';
    document.body.appendChild(tooltip);
  }
  tooltip.textContent = text;
  let left = event.clientX + 10;
  let top = event.clientY - 30;
  if (left + tooltip.offsetWidth > window.innerWidth - 10) left = event.clientX - tooltip.offsetWidth - 10;
  if (top < 10) top = event.clientY + 20;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.style.display = 'block';
  setTimeout(() => { if (tooltip.parentNode) tooltip.style.display = 'none'; }, 3000);
}

function initInternationalLink() {
  const internationalLinkBtn = document.getElementById('internationalLinkBtn');
  const internationalModal = document.getElementById('internationalModal');
  const continueToInternational = document.getElementById('continueToInternational');
  const cancelInternational = document.getElementById('cancelInternational');
  if (!internationalLinkBtn || !internationalModal) return;

  const openModal = () => { internationalModal.classList.remove('hidden'); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { internationalModal.classList.add('hidden'); document.body.style.overflow = ''; };

  internationalLinkBtn.addEventListener('click', openModal);
  if (cancelInternational) cancelInternational.addEventListener('click', closeModal);
  if (continueToInternational) continueToInternational.addEventListener('click', () => { window.open('https://sky-shards.pages.dev/zh', '_blank'); closeModal(); });
  internationalModal.addEventListener('click', (e) => { if (e.target === internationalModal) closeModal(); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initInternationalLink);
else initInternationalLink();