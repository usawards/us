// Minimal static file server so this frontend can run as a Render Web
// Service. It does nothing but hand back the files in this folder - no
// templating, no API logic (that all lives in usea-backend).
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(__dirname, { extensions: ['html'] }));

// Fallback for the two real pages in case a path is requested without
// its extension. This is NOT a single-page-app catch-all - unknown paths
// still correctly 404, since vote-confirm.html is its own real page.
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/vote-confirm', (req, res) => res.sendFile(path.join(__dirname, 'vote-confirm.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`usea-frontend listening on port ${PORT}`));
