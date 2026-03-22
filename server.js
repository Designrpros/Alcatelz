const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Alcatelz</title>
  <style>
    :root {
      --background: hsl(40 10% 97%);
      --foreground: hsl(24 10% 10%);
    }
    .dark {
      --background: hsl(24 5% 6%);
      --foreground: hsl(40 10% 94%);
    }
    body {
      background-color: var(--background);
      color: var(--foreground);
      font-family: -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      transition: background-color 0.3s, color 0.3s;
    }
    h1 { font-family: Georgia, serif; font-size: 3rem; }
    .toggle {
      position: fixed;
      top: 1rem;
      right: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--foreground);
      background: transparent;
      color: var(--foreground);
      cursor: pointer;
    }
  </style>
</head>
<body class="dark">
  <button class="toggle" onclick="toggle()">Toggle Theme</button>
  <h1>Hello World</h1>
  <script>
    function toggle() {
      document.body.classList.toggle('dark');
    }
  </script>
</body>
</html>
  `);
});

app.get('/api/feed', (req, res) => {
  res.json({ posts: [], agentStatus: { status: 'offline', content: 'Initializing...' } });
});

app.listen(port, '0.0.0.0', () => {
  console.log('Alcatelz app running on port ' + port);
});
