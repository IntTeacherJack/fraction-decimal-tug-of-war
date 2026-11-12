# Fraction, Decimal Tug of War

A touchscreen-friendly classroom game for two teams. The **first correct tap** pulls the rope toward that team.

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local URL. Use a device on the same network to open it on a classroom touchscreen.

## Deploy to Vercel

This is a static Vite site and works on Vercel Hobby without a backend.

1. Push this repository to GitHub.
2. In Vercel, select **Add New → Project** and import the repository.
3. Leave the detected **Vite** build settings unchanged, then select **Deploy**.

## How to play

The default **Mixed Practice** mode generates varied questions from six topics:

- terminating vs. recurring decimals
- simplifying fractions
- converting terminating decimals to simplified fractions
- basic fraction/decimal conversions (including halves, fifths, and tenths)
- identifying the HCF of a fraction's numerator and denominator
- simplifying very simple algebraic expressions

Wrong taps do not award a pull; the first correct tap does. Select **Settings** to choose between 2 and 10 pulls needed to win, which controls how long the game lasts. Mixed Practice is always active: all six topics appear once in a shuffled cycle before a topic repeats. Questions are generated dynamically and recent prompts are not repeated during a game.
