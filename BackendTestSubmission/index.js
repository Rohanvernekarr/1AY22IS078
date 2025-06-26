const express = require("express");
const { requestLogger, Log } = require("../Logging Middleware/Logger");
const { nanoid } = require('nanoid');

const bodyParser = require("body-parser");
const app = express();
const cors = require('cors');
app.use(cors());

const port = 5000;

app.use(bodyParser.json());
app.use(requestLogger);

const urlMap = new Map();

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
app.get('/',(req,res)=>{
    res.send("Hello")
})

app.post("/shorturls", async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url || !isValidUrl(url)) {
    await Log("backend", "error", "validation", "invalid URL");
    return res.status(409).json({ error: "Invalid url" });
  }
  const code = shortcode || nanoid(6);
  if (urlMap.has(code)) {
    return res.status(409).json({ error: " Short code exists already" });
  }

  const createdAt = new Date();
  const expiry = new Date(createdAt.getTime() + validity * 60000);

  urlMap.set(code, {
    url,
    createdAt,
    expiry,
    clicks: [],
  });

  await Log("backend", "info", "shorten", `shortened url ${url} as ${code}`);

  return res.status(201).json({
    shortLink: `http://localhost:${port}/${code}`,
    expiry: expiry.toISOString(),
  });
});


app.get('/:shortcode', async (req, res) => {
  const code = req.params.shortcode;
  const entry = urlMap.get(code);

  if (!entry) {
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  if (new Date() > entry.expiry) {
    return res.status(410).json({ error: 'Shortcode expired' });
  }

  // Loging click
  entry.clicks.push({
    time: new Date().toISOString(),
    referer: req.get('Referer') || 'direct',
    location: req.ip
  });

  await Log('backend', 'info', 'redirect', `Redirecting ${code} to ${entry.url}`);
  return res.redirect(entry.url);
});



app.get("/shorturls/:shortcode", async (req, res) => {
  const code = req.params.shortcode;
  const entry = urlMap.get(code);
  if (!entry) {
    return res.status(404).json({ error: "Shortcode not found" });
  }
  const stats = {
    totalClicks: entry.clicks.length,
    originalURL: entry.url,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    clicks: entry.clicks,
  };

  await Log("backend", "info", "stats", `Stats requested for ${code}`);
  return res.json(stats);
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
