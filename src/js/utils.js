/**
 * utils.js - Formatting & Math Utilities
 */

export function formatIDR(value) {
  const num = Math.round(Number(value) || 0);
  return 'Rp ' + num.toLocaleString('id-ID');
}

export function formatDateID(dateString) {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  
  const year = parts[0];
  const monthNum = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const months = [
    'Okt', 'Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep'
  ];

  // Standard Indonesian calendar months
  const idMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const monthName = idMonths[monthNum - 1] || parts[1];
  return `${day} ${monthName} ${year}`;
}
