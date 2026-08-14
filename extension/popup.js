// popup: single persisted toggle for the host-UI background skin
const toggle = document.getElementById('skin-toggle');

document.documentElement.lang = chrome.i18n.getUILanguage();
for (const element of document.querySelectorAll('[data-i18n]')) {
  const message = chrome.i18n.getMessage(element.dataset.i18n);
  if (message) element.textContent = message;
}

chrome.storage.sync.get({ skinEnabled: true }).then(({ skinEnabled }) => {
  toggle.checked = !!skinEnabled;
});

toggle.addEventListener('change', () => {
  chrome.storage.sync.set({ skinEnabled: toggle.checked });
});
