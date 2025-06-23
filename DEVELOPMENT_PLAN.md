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