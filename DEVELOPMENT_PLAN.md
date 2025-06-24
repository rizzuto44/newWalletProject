# iOS Crypto Wallet MVP – Phase 1 Development Plan

## Project Overview
Building a native iOS wallet with local EOA generation, Face ID authentication, Apple Pay on-ramp for test USDT, and ERC-20 transfer capabilities.

## Current Status ✅
- [x] Project setup with React Native 0.80.0 + TypeScript
- [x] NativeWind styling configured
- [x] Navigation structure (Onboarding → Dashboard → Transfer)
- [x] Basic UI screens scaffolded
- [x] Required packages installed
- [x] Removed all Privy/Dynamic dependencies
- [x] Updated PRD summary

## Development Sequence & Milestones

### Phase 1: Setup & Styling ✅ (COMPLETE)
- [x] Configure Tailwind (NativeWind)
- [x] Clean up codebase (removed Privy/Dynamic)
- [x] Scaffold base screens (Onboarding, Dashboard, Transfer)
- [x] Implement basic navigation between screens
- [x] Install required packages

### Phase 2: Local Wallet Creation ❌
- [ ] Create WalletService for key management
- [ ] Implement Face ID prompt via react-native-biometrics
- [ ] Generate Ethereum keypair using ethers.Wallet.createRandom()
- [ ] Store private key in Keychain with biometric protection
- [ ] Save public address in AsyncStorage
- [ ] Test wallet creation flow

### Phase 3: Backend On-Ramp Endpoint ❌
- [ ] Set up Node.js/Express backend
- [ ] Create endpoint to validate Apple Pay proofs
- [ ] Implement mock USDT minting functionality
- [ ] Deploy to test environment
- [ ] Test endpoint with Postman/curl

### Phase 4: Apple Pay Integration ❌
- [ ] Configure react-native-payments for Apple Pay sandbox
- [ ] Wire Apple Pay sheet presentation
- [ ] Handle payment success/failure callbacks
- [ ] Call backend to mint mock USDT
- [ ] Update balance display after successful payment
- [ ] Test Apple Pay flow on device

### Phase 5: Dashboard & Balance ❌
- [ ] Load wallet data from AsyncStorage and Keychain
- [ ] Query mock USDT balance via ethers.js
- [ ] Display formatted balance as "USDT X.XX"
- [ ] Implement balance refresh functionality
- [ ] Add loading states and error handling

### Phase 6: Transfer Flow ❌
- [ ] Build transfer UI with recipient & amount input
- [ ] Implement Face ID verification before transfer
- [ ] Retrieve private key from Keychain
- [ ] Sign ERC-20 transfer transaction via ethers.js
- [ ] Broadcast transaction and get hash
- [ ] Display transaction success/error states
- [ ] Test transfer flow end-to-end

### Phase 7: Testing & QA ❌
- [ ] Unit tests for wallet, storage, and transfer logic
- [ ] Integration tests for Apple Pay flow
- [ ] Manual E2E testing on device
- [ ] Security audit of key storage
- [ ] Performance testing
- [ ] Bug fixes and polish

## Technical Implementation Details

### WalletService (Phase 2)
```typescript
// Key management with Face ID and Keychain
class WalletService {
  async createWallet(): Promise<string> // Returns address
  async getWalletAddress(): Promise<string | null>
  async signTransaction(tx: Transaction): Promise<string>
  async getBalance(): Promise<string>
}
```

### Backend API (Phase 3)
```typescript
// Apple Pay validation and mock USDT minting
POST /api/onramp/apple-pay
{
  "paymentData": ApplePayPaymentData,
  "amount": number
}
Response: { "success": boolean, "txHash": string }
```

### Apple Pay Integration (Phase 4)
```typescript
// react-native-payments configuration
const paymentRequest = {
  countryCode: 'US',
  currencyCode: 'USD',
  supportedNetworks: ['visa', 'mastercard'],
  merchantCapabilities: ['supports3DS'],
  total: { label: 'USDT Purchase', amount: '10.00' }
};
```

### ERC-20 Transfer (Phase 6)
```typescript
// ethers.js contract interaction
const contract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, wallet);
const tx = await contract.transfer(recipient, amount);
const receipt = await tx.wait();
```

## Success Criteria
- [ ] Face ID gating works; local EOA generated and stored
- [ ] Apple Pay on-ramp issues correct mock USDT
- [ ] Balance fetch displays correct USDT amount
- [ ] ERC-20 transfers succeed and return valid tx hash

## Next Steps
1. Start with Phase 2: Implement WalletService and Face ID integration
2. Set up development environment for backend API
3. Configure Apple Pay sandbox testing
4. Begin iterative development and testing

## Notes
- All blockchain interactions will be on testnet (Arbitrum Sepolia)
- Mock USDT will be used for testing
- Face ID will be required for all sensitive operations
- Apple Pay integration requires sandbox testing on physical device 

# Phase 2 Implementation Plan - Step by Step

## 🎯 Overview
This document outlines the step-by-step implementation of Phase 2: Ethereum Sepolia Wallet MVP with Account Abstraction (AA) and Smart Contract Accounts (SCA).

## 📋 Pre-Implementation Checklist

### Current Package Analysis
Based on `package.json`, we already have:
- ✅ `ethers` (^5.7.2) - Blockchain interactions
- ✅ `expo-secure-store` - Secure storage for keys
- ✅ `expo-local-authentication` - Face ID integration
- ✅ `@react-native-async-storage/async-storage` - Data persistence
- ✅ `react-native-get-random-values` - Crypto randomness
- ✅ `buffer` - Buffer polyfills

### New Packages Required
- ❌ `@stackup/account-kit` - Smart account client
- ❌ `viem` - Enhanced Ethereum client (optional, can use ethers)

## 🚀 Implementation Sequence

### Step 0: Project Setup & Hygiene
**Status**: ⏳ Pending

1. **Create Phase 2 Branch**
   ```bash
   git checkout -b phase-2
   ```

2. **Environment Configuration**
   - Create `.env.example` with AA variables
   - Ensure `.env` is git-ignored
   - Add required environment variables

3. **React Native Version Check**
   - Current: 0.79.4
   - Required: ≥ 0.80
   - Action: Bump version if needed

4. **Package Version Freezing**
   - Lock exact versions of new AA libraries
   - Update package.json with precise versions

### Step 1: Smart Contract Development
**Status**: ⏳ Pending

#### 1.1 Contract Creation
**Files to create:**
- `contracts/MockUSDT.sol`
- `contracts/LightAccountFactory.sol` 
- `contracts/MyErc20Paymaster.sol`

**Key Requirements:**
- MockUSDT: 18-decimals ERC-20 with owner minting
- LightAccountFactory: Kernel v0.2 factory
- MyErc20Paymaster: Forked Pimlico ERC-20 Paymaster
- EntryPoint: `0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789`

#### 1.2 Foundry Setup
**Files to create:**
- `foundry.toml` (if not exists)
- `scripts/deploy_sepolia.s.sol`

**Deployment Script Requirements:**
- Deploy MockUSDT
- Deploy LightAccountFactory with EntryPoint
- Deploy MyErc20Paymaster with USDT and Chainlink oracle
- Add stake and deposit to paymaster
- Save addresses to `deploys/sepolia.json`

#### 1.3 Testing
**Test Files:**
- `test/Paymaster.t.sol`
- `test/Factory.t.sol`

**Test Requirements:**
- Paymaster debits USDT correctly
- Paymaster refunds on revert
- Factory counterfactual address matches JS helper

#### 1.4 Deployment
**Commands:**
```bash
forge script scripts/deploy_sepolia.s.sol --rpc-url $RPC_URL --broadcast --verify
```

### Step 2: Mobile App Integration
**Status**: ⏳ Pending

#### 2.1 Package Installation & Validation
**Before installing, check if packages exist:**
```bash
npm list @stackup/account-kit
npm list viem
```

**Install only if missing:**
```bash
npm install @stackup/account-kit viem
```

#### 2.2 AA Provider Setup
**File to create:** `src/aaProvider.ts`

**Implementation:**
```typescript
import { createSmartAccountClient } from '@stackup/account-kit';

export const aa = createSmartAccountClient({
  bundlerRpcUrl: process.env.BUNDLER_RPC,
  entryPoint: process.env.ENTRYPOINT,
  paymasterUrl: process.env.PAYMASTER_URL,
});
```

#### 2.3 Onboarding Enhancement
**File to update:** `src/screens/OnboardingScreen.tsx`

**Changes required:**
- Import AA provider
- Create SCA from EOA after Face ID
- Persist SCA address in AsyncStorage
- Update UI to show SCA address

#### 2.4 Wallet Context Update
**File to update:** `src/services/WalletService.ts`

**Changes required:**
- Replace `ethers.Wallet` with `SmartAccount`
- Add `sendTransaction` helper
- Add `estimatePaymasterFee` helper
- Update balance fetching for SCA

#### 2.5 Transfer Screen Enhancement
**File to update:** `src/screens/TransferScreen.tsx`

**Changes required:**
- Use SCA for USDT₀ transfers
- Integrate paymaster fee estimation
- Handle gas-in-token payments
- Update transaction flow

#### 2.6 Fee Banner Component
**File to create:** `src/components/FeeBanner.tsx`

**Implementation:**
- Display estimated USDT₀ fees
- Show fee breakdown
- Handle loading states

#### 2.7 Safety & UX Polish
**Files to update:**
- `src/screens/TransferScreen.tsx`
- `src/components/CreationLoadingModal.tsx`

**Requirements:**
- Disable Send button until fee & balance fetched
- Handle insufficient token payment errors
- Show user-friendly error messages

### Step 3: Environment Configuration
**Status**: ⏳ Pending

#### 3.1 Environment Variables
**File to update:** `.env.example`

**Required variables:**
```env
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<key>
ENTRYPOINT=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789
USDT0_ADDRESS=0x...
FACTORY_ADDRESS=0x...
PAYMASTER_URL=https://api.pimlico.io/v2/sepolia/paymaster
BUNDLER_RPC=https://api.stackup.sh/v1/node/<key>
```

#### 3.2 Type Definitions
**File to update:** `env.d.ts`

**Add AA-specific types:**
```typescript
declare module '@env' {
  export const RPC_URL: string;
  export const ENTRYPOINT: string;
  export const USDT0_ADDRESS: string;
  export const FACTORY_ADDRESS: string;
  export const PAYMASTER_URL: string;
  export const BUNDLER_RPC: string;
}
```

### Step 4: Testing & Quality Assurance
**Status**: ⏳ Pending

#### 4.1 Smart Contract Testing
**Commands:**
```bash
forge test
forge test --fork-url $RPC_URL
```

#### 4.2 Mobile App Testing
**Files to create:**
- `__tests__/aaProvider.test.ts`
- `__tests__/walletService.test.ts`

**Test Requirements:**
- Face ID integration
- Keychain storage
- SCA persistence
- Transaction execution

#### 4.3 End-to-End Testing
**Setup Detox for E2E testing:**
- Create SCA
- On-ramp USDT₀
- Send USDT₀ with gas-in-token

### Step 5: Infrastructure Setup
**Status**: ⏳ Pending

#### 5.1 Stackup Project
- Create Stackup project
- Get bundler endpoint
- Store in environment variables

#### 5.2 Pimlico Integration
- Set up Pimlico paymaster
- Configure token payments
- Test integration

### Step 6: Documentation
**Status**: ⏳ Pending

#### 6.1 README Updates
**File to update:** `README.md`

**Add sections:**
- Phase 2 setup instructions
- Environment configuration
- Deployment guide
- Troubleshooting tips

#### 6.2 API Documentation
**File to create:** `docs/API.md`

**Document:**
- Smart contract interfaces
- Mobile app APIs
- Integration examples

## 🔧 Decision Points & Alternatives

### Package Management
**Decision Point:** Whether to use `viem` alongside `ethers`
**Alternatives:**
1. Use only `ethers` (already installed)
2. Use only `viem` (newer, more modern)
3. Use both (ethers for existing code, viem for new AA features)

**Recommendation:** Start with `ethers` only, add `viem` only if needed for specific AA features.

### Smart Contract Architecture
**Decision Point:** Whether to use existing AA frameworks or custom implementation
**Alternatives:**
1. Use Stackup's LightAccount (recommended in PRD)
2. Use Biconomy's Account Abstraction
3. Custom implementation

**Recommendation:** Follow PRD recommendation for Stackup LightAccount.

### Testing Strategy
**Decision Point:** Testing scope and tools
**Alternatives:**
1. Unit tests only
2. Unit + integration tests
3. Unit + integration + E2E tests

**Recommendation:** Start with unit tests, add integration tests as needed.

## ⚠️ Risk Mitigation

### Technical Risks
1. **Package Compatibility**: Test all new packages with existing setup
2. **Smart Contract Security**: Thorough testing and auditing
3. **Gas Optimization**: Monitor and optimize gas usage

### Development Risks
1. **Scope Creep**: Stick to PRD requirements
2. **Timeline**: Break down into smaller, manageable tasks
3. **Dependencies**: Validate all external dependencies

## 📊 Success Metrics

### Technical Metrics
- [ ] All contracts deployed and verified on Sepolia
- [ ] CI/CD pipeline passing
- [ ] No runtime errors in development
- [ ] All tests passing

### User Experience Metrics
- [ ] SCA creation works seamlessly
- [ ] Gasless transactions execute successfully
- [ ] Fee estimation is accurate
- [ ] Error handling is user-friendly

### Business Metrics
- [ ] End-to-end flow works: create → on-ramp → transfer
- [ ] Gas fees are properly deducted in USDT₀
- [ ] User can complete transactions without holding ETH

## 🎯 Next Steps

1. **Immediate**: Start with Step 0 (Project Setup)
2. **Short-term**: Focus on Smart Contract Development (Step 1)
3. **Medium-term**: Mobile App Integration (Step 2)
4. **Long-term**: Testing and Documentation (Steps 4-6)

## 📝 Notes

- Always validate existing packages before installing new ones
- Test each step thoroughly before moving to the next
- Document any deviations from the PRD
- Keep the implementation focused on the core requirements 