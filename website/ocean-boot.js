// Website-only handshake: loading the module is not the same as drawing a frame.
function notify(status) {
  parent.postMessage({ type: 'oss-website-renderer', status,
    attempt: new URLSearchParams(location.search).get('attempt') }, location.origin);
}
const observer = new MutationObserver(() => {
  if (!document.body.classList.contains('ready')) return;
  observer.disconnect();
  notify('ready');
});
observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
window.addEventListener('pagehide', () => observer.disconnect(), { once: true });
import('./ocean.js?skin=1').catch(() => notify('fallback'));
