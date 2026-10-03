# GitHub Pages deployment

In this repository's **Settings → Pages**, select **GitHub Actions** as the source. The `Deploy browser demo` workflow publishes `web/` on pushes to `main`; it can also be started manually under Actions.

Expected URL: https://jinxiao-wan.github.io/DeltaV-Nitration-Process-Control-/

The `Verify control demo` workflow checks model behavior, generates reproducible CSV runs and verifies desktop/mobile interactions with Chromium. Its `control-demo-results` artifact includes screenshots and traces.
