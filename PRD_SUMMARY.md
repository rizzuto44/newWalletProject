# iOS Crypto Wallet MVP – Phase 1 PRD Summary

## 🎯 Core Objective
Build a clean, minimal iOS wallet enabling users to:
- Create/authenticate self-custodial Ethereum wallet via Privy's Expo SDK passkey flow
- On-ramp USD to testnet USDC on Arbitrum Sepolia using Coinbase On-Ramp SDK
- View unified "USD" balance (1:1 peg) without exposing chain details
- Transfer tokens to any address, gated by Face ID approval prompt

## 📋 User Stories & Acceptance Criteria

### 1. Wallet Onboarding
**User Story**: As a user, I can sign in or create my wallet via Privy.
**Acceptance Criteria**: Calling `login()` returns an EOA address displayed onscreen.

### 2. Fiat On-Ramp
**User Story**: As a user, I can buy USDC test tokens via Coinbase.
**Acceptance Criteria**: Widget opens; success callback returns dummy tx ID.

### 3. Balance Overview
**User Story**: As a user, I can see my USD balance.
**Acceptance Criteria**: `getBalance()` returns a non-zero value shown as "USD".

### 4. Token Transfer
**User Story**: As a user, I can send USD to another address.
**Acceptance Criteria**: Face ID succeeds; `sendTransaction()` returns a tx hash.

## 🏗️ Technical Architecture
- **Framework**: React Native 0.80.0 + TypeScript
- **Styling**: NativeWind (Tailwind CSS)
- **Wallet**: Privy Expo SDK (@privy-io/expo + native extensions)
- **On-Ramp**: Coinbase Wallet SDK (@coinbase/wallet-sdk)
- **Blockchain**: Ethers.js + polyfills
- **Biometrics**: React Native Biometrics (react-native-biometrics)
- **State**: React Context / Hooks

## 📦 Required Dependencies

### Already Installed ✅
- `nativewind` & `tailwindcss` (styling)

### Still Needed ❌
- **Blockchain & Polyfills**: `react-native-get-random-values`, `@ethersproject/shims`, `react-native-url-polyfill`, `ethers`
- **Biometrics**: `react-native-biometrics`
- **Fiat On-Ramp**: `@coinbase/wallet-sdk`
- **Privy Expo SDK**: `expo-apple-authentication`, `expo-crypto`, `expo-linking`, `expo-secure-store`, `expo-web-browser`, `react-native-webview`, `@privy-io/expo`, `@privy-io/expo-native-extensions`

## 🚀 Development Sequence

### Phase 1: Setup & Styling ✅ (COMPLETE)
- [x] Configure Tailwind (NativeWind)
- [x] Clean up codebase (removed react-native-passkey)
- [x] Scaffold base screens (Onboarding, Home, Transfer)
- [x] Implement basic navigation between screens

### Phase 2: Privy Passkey & Wallet ❌
- [ ] Install Privy Expo SDK dependencies
- [ ] Wrap app in `<PrivyProvider appId=...>`
- [ ] Call `login()` and display EOA address

### Phase 3: Fiat On-Ramp ❌
- [ ] Integrate Coinbase On-Ramp widget
- [ ] Handle sandbox onSuccess

### Phase 4: Balance Fetch ❌
- [ ] Use ethers.js to query USDC balanceOf
- [ ] Format & display as "USD"

### Phase 5: Transfer Flow ❌
- [ ] Prompt Face ID (react-native-biometrics)
- [ ] Call `useSmartWallets().client.sendTransaction(...)`
- [ ] Display tx hash

### Phase 6: Testing & QA ❌
- [ ] Unit tests for hooks
- [ ] Manual end-to-end QA

## 🎯 Success Metrics
1. Wallet login via Privy → EOA address displayed
2. Coinbase widget returns a dummy tx ID
3. Balance fetch shows non-zero "USD"
4. Transfers require Face ID and return a valid tx hash 