export const getFormattedDate = (date: Date): string => {
  return new Intl.DateTimeFormat().format(date);
};
