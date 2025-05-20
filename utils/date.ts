import { toDate, lastDayOfMonth, format, formatDate } from 'date-fns';
import { pt, ptBR } from 'date-fns/locale';

export const firstMonthDay = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1);
  return format(date, 'yyyy/MM/dd', { locale: ptBR });
};

export const lastMonthDay = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1);
  const lastDay = lastDayOfMonth(date);
  return format(lastDay, 'yyyy/MM/dd', { locale: ptBR });
};
