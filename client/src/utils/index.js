export const formatDate = (date, locale = 'ka-GE') => {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale);
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\+995)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return first + last || '?';
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};
