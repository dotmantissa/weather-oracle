# WeatherOracle Frontend (GenLayer Studio)

Production-grade React + TypeScript + Tailwind frontend for the `WeatherOracle` intelligent contract.

## Project Structure

```text
src/
  components/
    ResultCard.tsx
    Spinner.tsx
    StatusBadge.tsx
    WalletPanel.tsx
    WeatherForm.tsx
  hooks/
    useWallet.ts
    useWeatherOracle.ts
    useWeatherOracle.test.tsx
  lib/
    config.ts
    genlayerClient.ts
    genlayerClient.test.ts
    types.ts
  pages/
    HomePage.tsx
    HomePage.test.tsx
  styles/
    global.css
  test/
    setup.ts
  App.tsx
  main.tsx
```

## Features

- Wallet connect/disconnect
- Strict wallet guard before all contract actions
- Strict GenLayer Studio network enforcement
- Auto network switch (`wallet_switchEthereumChain` + fallback `wallet_addEthereumChain`)
- City input + guarded fetch flow
- `fetch_temp` write call with tx confirmation wait
- `get_last_temp` read call after confirmation
- Handles `-999`, empty input, network mismatch, tx/read errors, and double-submit spam
- Local storage persistence of last searched city
- Responsive centered card layout with loading/success/error states

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Fill required values in `.env`:

- `VITE_WEATHER_ORACLE_ADDRESS`: deployed WeatherOracle contract address
- `VITE_GENLAYER_STUDIO_CHAIN_ID`: GenLayer Studio chain id in hex
- `VITE_GENLAYER_RPC_URL`: GenLayer Studio RPC URL

## Run Locally

```bash
npm run dev
```

Open the local Vite URL in a browser with GenLayer Studio-compatible wallet provider enabled.

## Validate

```bash
npm run lint
npm run test
npm run build
```
