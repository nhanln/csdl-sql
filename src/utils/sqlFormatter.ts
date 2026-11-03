/**
 * Lightweight SQL Formatter
 * Chuẩn hoá từ khoá viết hoa và thụt dòng hợp lý
 */

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN',
  'ON', 'GROUP BY', 'HAVING', 'ORDER BY', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
  'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE',
  'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'AUTOINCREMENT', 'NOT NULL', 'DEFAULT',
  'UNION', 'UNION ALL', 'EXISTS', 'OVER', 'PARTITION BY', 'ROW_NUMBER', 'RANK', 'DENSE_RANK',
  'WITH', 'EXPLAIN QUERY PLAN'
];

export function formatSql(sql: string): string {
  if (!sql) return '';

  let formatted = sql.trim();

  // 1. Viết hoa các từ khoá SQL chính xác mà không làm hỏng chuỗi trong nháy
  // Chia theo chuỗi ký tự '...'
  const parts = formatted.split(/('(?:''|[^'])*')/);

  for (let i = 0; i < parts.length; i += 2) {
    let segment = parts[i];

    // Sắp xếp từ khoá dài trước để tránh 'JOIN' ghi đè 'INNER JOIN'
    const sortedKeywords = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);

    for (const kw of sortedKeywords) {
      const regex = new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      segment = segment.replace(regex, kw);
    }

    parts[i] = segment;
  }

  formatted = parts.join('');

  // 2. Định dạng thụt dòng cho các mệnh đề lớn
  const majorClauses = ['FROM', 'WHERE', 'INNER JOIN', 'LEFT JOIN', 'JOIN', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'SET', 'VALUES'];
  for (const clause of majorClauses) {
    const clauseRegex = new RegExp(`\\s+(${clause})\\b`, 'g');
    formatted = formatted.replace(clauseRegex, `\n$1`);
  }

  return formatted;
}

export function exportToCsv(columns: string[], values: any[][], filename: string = 'sql_result.csv') {
  const header = columns.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',');
  const rows = values.map(row => 
    row.map(cell => {
      if (cell === null || cell === undefined) return '""';
      return `"${String(cell).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = '\uFEFF' + [header, ...rows].join('\n'); // BOM for UTF-8 in Excel
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
