// File: api/proxy.js

// Elenco degli User-Agent da ruotare (lo gestisce il proxy)
const REAL_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0',
];

function getRandomUserAgent() {
  return REAL_USER_AGENTS[Math.floor(Math.random() * REAL_USER_AGENTS.length)];
}

// Questa è la funzione serverless di Vercel
export default async function handler(req, res) {
  // Prendiamo l'URL da scansionare dal parametro query
  // es: .../api/proxy?url=https://google.com
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing "url" query parameter.' });
  }

  try {
    // Il proxy fa il fetch per conto nostro con uno User-Agent a rotazione
    const response = await fetch(url, {
      headers: { 'User-Agent': getRandomUserAgent() },
    });

    // Leggiamo l'HTML
    const html = await response.text();

    // Passiamo lo status code originale
    res.status(response.status);

    // Passiamo il content-type originale (importante)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'text/html');

    // Inviamo l'HTML al nostro backend NestJS
    res.send(html);

  } catch (error) {
    console.error('Errore nel proxy fetch:', error.message);
    res.status(500).json({ error: 'Failed to fetch the target URL.', details: error.message });
  }
}