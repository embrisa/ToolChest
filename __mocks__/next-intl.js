const messages = require('../messages/en.json');

export const useTranslations = (namespace = '') => (key) => {
  const path = [namespace, key].filter(Boolean).join('.');
  return path.split('.').reduce((obj, segment) => obj?.[segment], messages) || path;
};
export const useLocale = () => 'en';
export const NextIntlClientProvider = ({ children }) => children;
export const getMessages = async () => messages;
