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

---

# Ethereum Sepolia Wallet MVP – Phase 2 Implementation Plan

## 🎯 Phase 2 Objective
Implement Account Abstraction (AA) with Smart Contract Accounts (SCA) on Ethereum Sepolia testnet, enabling gasless transactions paid in USDT₀ tokens.

## 📋 Phase 2 User Stories & Acceptance Criteria

### 1. Smart Contract Account Creation
**User Story**: As a user, I can create a smart contract account from my EOA.
**Acceptance Criteria**: SCA address is generated and persisted after Face ID authentication.

### 2. Gasless Token Transfers
**User Story**: As a user, I can send USDT₀ tokens without holding ETH for gas.
**Acceptance Criteria**: Transactions execute successfully with gas fees deducted in USDT₀.

### 3. Fee Estimation
**User Story**: As a user, I can see the USDT₀ fee before sending a transaction.
**Acceptance Criteria**: Fee banner displays "≈ 0.0X USDT₀ fee" before transaction.

### 4. Enhanced Security
**User Story**: As a user, my transactions are secured by my EOA private key.
**Acceptance Criteria**: All SCA operations require EOA signature via Face ID.

## 🏗️ Phase 2 Technical Architecture

### Smart Contract Layer
- **MockUSDT**: 18-decimals ERC-20 token with owner minting capability
- **LightAccountFactory**: Kernel v0.2 factory for SCA creation
- **MyErc20Paymaster**: Forked Pimlico ERC-20 Paymaster for gas-in-token payments
- **EntryPoint**: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`

### Mobile App Integration
- **Account Kit**: `@stackup/account-kit` for SCA client management
- **Viem**: `viem` for enhanced blockchain interactions
- **Smart Account Client**: Bundled operations with paymaster integration

### Backend Infrastructure
- **Stackup Bundler**: For transaction bundling and submission
- **Pimlico Paymaster**: For gas fee sponsorship and token payments
- **Chainlink Oracle**: ETH/USD price feeds for fee calculations

## 📦 Phase 2 Dependencies

### Smart Contract Development
- **Foundry**: For contract development, testing, and deployment
- **OpenZeppelin**: For ERC-20 and security contracts

### Mobile App Dependencies
- **@stackup/account-kit**: Smart account client and operations
- **viem**: Enhanced Ethereum client library

### Infrastructure
- **Stackup Project**: Bundler endpoint and configuration
- **Pimlico API**: Paymaster service integration

## 🚀 Phase 2 Implementation Sequence

### 0. Project Setup & Hygiene
- [ ] Create `phase-2` branch off `main`
- [ ] Add `.env.example` with AA variables and git-ignore real `.env`
- [ ] Bump React Native to ≥ 0.80 and run clean `pod install`
- [ ] Freeze exact versions of all new AA libraries in `package.json`

### 1. Smart Contract Development
- [ ] **1-A**: Write Contracts
  - [ ] `contracts/MockUSDT.sol` – 18-decimals ERC-20, owner-mint
  - [ ] `contracts/LightAccountFactory.sol` – Kernel v0.2 factory
  - [ ] `contracts/MyErc20Paymaster.sol` – Forked Pimlico ERC-20 Paymaster
- [ ] **1-B**: Foundry Deploy Script
  - [ ] `/scripts/deploy_sepolia.s.sol` with broadcast and verification
- [ ] **1-C**: Unit Tests (Foundry)
  - [ ] Paymaster debits USDT correctly and refunds on revert
  - [ ] Factory's counterfactual address matches JS helper
- [ ] **1-D**: Deploy to Sepolia
  - [ ] Run deployment script with verification
  - [ ] Save addresses to `deploys/sepolia.json`

### 2. Mobile App Integration
- [ ] **2-A**: Install & Link Libraries
  - [ ] Validate existing packages before installing new ones
  - [ ] Install `@stackup/account-kit` and `viem` if not present
- [ ] **2-B**: AA Provider Setup
  - [ ] Create `src/aaProvider.ts` with smart account client
- [ ] **2-C**: Onboarding Enhancement
  - [ ] Update `useOnboard.ts` to create SCA from EOA
  - [ ] Persist SCA address in AsyncStorage
- [ ] **2-D**: Wallet Context Update
  - [ ] Replace `ethers.Wallet` references with `SmartAccount`
  - [ ] Expose helpers: `sendTransaction`, `estimatePaymasterFee`
- [ ] **2-E**: Transfer Screen Enhancement
  - [ ] Update to use SCA for USDT₀ transfers
- [ ] **2-F**: Fee Banner Component
  - [ ] Create component to display estimated USDT₀ fees
- [ ] **2-G**: Safety & UX Polish
  - [ ] Disable Send button until fee & balance fetched
  - [ ] Handle insufficient token payment errors gracefully

### 3. Backend Infrastructure
- [ ] **3-A**: On-ramp Endpoint Update
  - [ ] Send USDT₀ to SCA address instead of EOA
- [ ] **3-B**: Paymaster Management
  - [ ] Cron job to top-up Paymaster ETH if < 0.01 ETH
- [ ] **3-C**: Analytics Integration
  - [ ] Webhook to listen to Paymaster `TokensCharged` events

### 4. DevOps & Infrastructure
- [ ] **4-A**: Stackup Project Setup
  - [ ] Create Stackup project and store bundler endpoint
- [ ] **4-B**: Optional Self-hosted Bundler
  - [ ] Deploy Pimlico bundler if > 12 TPS needed

### 5. Environment Configuration
- [ ] **5-A**: Environment Variables
  - [ ] Add AA-specific variables to `.env.example`
  - [ ] Configure RPC, EntryPoint, contract addresses, and API endpoints

### 6. Testing & Quality Assurance
- [ ] **6-A**: Smart Contract Testing
  - [ ] Foundry tests for Solidity contracts
- [ ] **6-B**: Mobile App Testing
  - [ ] Jest unit tests for Face ID, Keychain storage, SCA persistence
- [ ] **6-C**: End-to-End Testing
  - [ ] Detox tests for complete user flows

### 7. CI/CD Pipeline
- [ ] **7-A**: GitHub Actions
  - [ ] `forge test` on Sepolia fork
  - [ ] `npm test`, `detox build --headless`
- [ ] **7-B**: iOS Build Pipeline
  - [ ] Xcode CLI or `eas build` for iOS builds
  - [ ] Upload `.ipa` to TestFlight

### 8. Documentation
- [ ] **8-A**: README Updates
  - [ ] Add `yarn setup:sepolia` instructions
  - [ ] Document Paymaster ETH rotation
  - [ ] Include troubleshooting tips

## 🎯 Phase 2 Success Metrics
1. **Smart Contract Deployment**: All contracts verified on Sepolia Etherscan
2. **CI/CD Pipeline**: All tests passing and builds successful
3. **End-to-End Flow**: Create SCA → on-ramp → USDT₀ transfer with USDT₀ gas fees
4. **Error Handling**: No runtime errors in Xcode/JS logs
5. **Code Quality**: Lint & type-check pass
6. **Documentation**: Complete docs merged to main

## ⏱️ Estimated Engineering Effort
**≈ 3 – 4 dev-days** split across:
- **Smart Contract Development**: 1-1.5 days
- **Mobile App Integration**: 1.5-2 days  
- **DevOps & Infrastructure**: 0.5-1 day

## 🔧 Definition of Done
- [ ] Contracts verified on Sepolia Etherscan
- [ ] CI green with all tests passing
- [ ] Manual smoke-test succeeds: create → on-ramp → USDT₀ transfer with USDT₀ gas
- [ ] No runtime errors in Xcode/JS logs
- [ ] Lint & type-check pass
- [ ] Documentation merged to main 