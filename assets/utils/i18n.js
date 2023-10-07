// You must declare all your locales here
const ES = require('../locales/es.json');
const DEFAULT_LANGUAGE = 'en';
const availableLocales = [ES];
let { ipcRenderer } = require('electron');

const appLanguage = (navigator.userLanguage || navigator.language).substr(0, 2);

function loadTranslations(language) {
  const userLocale = availableLocales.find(locale => locale.lang === language);

  if (userLocale) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      let text = key.split('.').reduce((obj, i) => (obj ? obj[i] : null), userLocale.translations);

      // Does this text have any variables? (eg {something})
      const variables = text.match(/{(.*?)}/g);
      if (variables) {

        // Iterate each variable in the text.
        variables.forEach((variable) => {

          // Filter all `data-*` attributes for this element to find the matching key.
          Object.entries(element.dataset).filter(([key, value]) => {
            if (`{${key}}` === variable) {
              try {
                // Attempt to run actual JavaScript code.
                text = text.replace(`${variable}`, new Function(`return (${value})`)());
              } catch (error) {
                // Probably just static text replacement.
                text = text.replace(`${variable}`, value);
              }
            }
          })
        });
      }

      // Regular text replacement for given locale.
      element.innerHTML = text;
    });
  }
}

// This app has English labels in place, no need to translate for now
if (appLanguage !== DEFAULT_LANGUAGE) {
  loadTranslations(appLanguage)
}

ipcRenderer.on('i18n-change', (event, arg) => {
  // Handle the event here
  console.log('Event received gio:', arg);
  loadTranslations(arg);
});
