import {
  toDate,
  lastDayOfMonth,
  format,
  formatDate,
  sub,
  isToday,
} from 'date-fns';
import { pt, ptBR } from 'date-fns/locale';

export const today = format(toDate(new Date()), 'yyyy/MM/dd', { locale: ptBR });

export const firstMonthDay = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1);
  return format(date, 'yyyy/MM/dd', { locale: ptBR });
};

export const lastMonthDay = (month: number, year: number) => {
  const date = new Date(year, month - 1, 1);
  const lastDay = lastDayOfMonth(date);
  return format(lastDay, 'yyyy/MM/dd', { locale: ptBR });
};

export const subtractPeriod = (data: {
  days?: number;
  months?: number;
  years?: number;
}) => {
  const date = new Date();
  const result = sub(date, data);
  return format(result, 'yyyy/MM/dd', { locale: ptBR });
};
