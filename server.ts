import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to get Redirect URI
const getRedirectUri = (req: express.Request, provider: string) => {
  const host = req.get('host');
  const protocol = req.protocol;
  // If we're behind a proxy (like on AIS), we might need to be careful.
  // But usually req.get('host') is the best bet.
  return `${protocol}://${host}/auth/${provider}/callback`;
};

// --- Strava OAuth ---
app.get('/api/auth/strava/url', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || '',
    redirect_uri: getRedirectUri(req, 'strava'),
    response_type: 'code',
    scope: 'activity:read_all',
    approval_prompt: 'force'
  });
  res.json({ url: `https://www.strava.com/oauth/authorize?${params.toString()}` });
});

app.get('/auth/strava/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code'
    });
    
    // Return HTML that sends token to parent and closes
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'OAUTH_AUTH_SUCCESS', 
              provider: 'strava', 
              data: ${JSON.stringify(response.data)} 
            }, '*');
            window.close();
          </script>
          <p>Strava Connected! Closing...</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).send(`Auth Error: ${error.message}`);
  }
});

// --- Google OAuth (Samsung Health / Fit) ---
app.get('/api/auth/google/url', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri: getRedirectUri(req, 'google'),
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.sleep.read',
    access_type: 'offline',
    prompt: 'consent'
  });
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: getRedirectUri(req, 'google')
    });
    
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage({ 
              type: 'OAUTH_AUTH_SUCCESS', 
              provider: 'google', 
              data: ${JSON.stringify(response.data)} 
            }, '*');
            window.close();
          </script>
          <p>Google Fit Connected! Closing...</p>
        </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).send(`Auth Error: ${error.message}`);
  }
});

// --- Proxy Data Fetches ---
app.post('/api/proxy/strava/activities', async (req, res) => {
  const { access_token } = req.body;
  try {
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/proxy/google/sleep', async (req, res) => {
  const { access_token } = req.body;
  try {
    // Google Fit Sleep Sessions
    const response = await axios.get('https://www.googleapis.com/fitness/v1/users/me/sessions', {
      headers: { Authorization: `Bearer ${access_token}` },
      params: { startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), activityType: 72 } // 72 is sleep
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Vite Middleware ---
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
