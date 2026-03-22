<?php
$theme = isset($_COOKIE['dark']) && $_COOKIE['dark'] === '1' ? 'dark' : '';
?>
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
      flex-direction: column;
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
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      cursor: pointer;
    }
  </style>
</head>
<body class="<?php echo $theme; ?>">
  <button class="toggle" onclick="toggle()">Toggle Theme</button>
  <h1>Hello World</h1>
  <script>
    function toggle() {
      document.body.classList.toggle('dark');
      document.cookie = 'dark=' + (document.body.classList.contains('dark') ? '1' : '0');
    }
  </script>
</body>
</html>
