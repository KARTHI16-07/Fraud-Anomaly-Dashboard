const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
  } catch {
    throw new Error('Unable to reach the dashboard service. Please try again.');
  }
  if (!response.ok) {
    if (response.status === 503) throw new Error('The prediction service is unavailable. Please try again shortly.');
    if (response.status === 409) throw new Error('That transaction ID already exists.');
    if (response.status === 400) throw new Error('Please check the transaction details and try again.');
    throw new Error('The request could not be completed. Please try again.');
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  getTransactions: () => request('/api/transactions'),
  getDashboardStats: () => request('/api/dashboard/stats'),
  getActivity: () => request('/api/dashboard/activity'),
  getSuspiciousTransactions: () => request('/api/transactions/suspicious'),
  createTransaction: (transaction) => request('/api/transactions', { method: 'POST', body: JSON.stringify(transaction) }),
  deleteTransaction: (id) => request(`/api/transactions/${id}`, { method: 'DELETE' }),
};
