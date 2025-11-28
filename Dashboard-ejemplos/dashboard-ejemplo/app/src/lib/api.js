const API = typeof __API_URL__ !== 'undefined' ? __API_URL__ : 'http://localhost:3000';

export async function getSummary(){
  const res = await fetch(`${API}/api/v1/summary`);
  if(!res.ok) throw new Error('Error fetching summary');
  return res.json();
}

export async function getPoints(limit=600){
  const res = await fetch(`${API}/api/v1/points?limit=${limit}`);
  if(!res.ok) throw new Error('Error fetching points');
  return res.json();
}
