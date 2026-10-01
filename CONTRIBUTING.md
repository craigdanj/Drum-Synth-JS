# Contributing

Use Node 20+. Run `npm test`, `npm run check`, and `npm start`. No installation or build is needed.

Keep the engine dependency-free. For DSP changes, test finite bounded output, attack/tail behavior, several pitches and sample rates, and listen at a modest level. Add regression tests for bugs. Update declarations and README when changing the API. Do not commit generated samples, node_modules or secrets.

For browser changes, check desktop and narrow mobile layouts, keyboard focus, audio unlocking, scheduled playback, Stop, WAV downloads and page visibility. Node mocks do not replace real browser testing.

Open a focused pull request explaining the behavior change and validation. New voices should have their own preset and a reproducible test. Use issues for proposed features before large changes.
