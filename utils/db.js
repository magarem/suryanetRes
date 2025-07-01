// utils/db.js
export async function executeQueryRun(sql) {
  try {
    const response = await fetch(`/api/queryRun`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sql })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Query error:', error);
    return null;
  }
}

export async function executeQuery(sql) {
  const res = await fetch(`/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql })
  });
  return await res.json();
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(value);
}

export function formatDateForSQL(date) {
  if (!date) return null; // Handle null or undefined dates
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months start at 0
  const dd = String(date.getDate()).padStart(2, '0');
  
  // Optional: add time if needed
  return `${yyyy}-${mm}-${dd}`;
}

export function formatDateBR(isoString) {
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-based
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}