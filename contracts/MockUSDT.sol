// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing Account Abstraction on Sepolia
 * Features:
 * - 18 decimals (like real USDT)
 * - Owner can mint tokens
 * - Standard ERC-20 functionality
 */
contract MockUSDT is ERC20, Ownable {
    constructor() ERC20("Mock USDT", "USDT0") Ownable(msg.sender) {
        // Initial supply can be minted by owner
    }

    /**
     * @dev Mint tokens to a specific address
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @dev Mint tokens to the caller (for testing)
     * @param amount The amount of tokens to mint
     */
    function mint(uint256 amount) external {
        _mint(msg.sender, amount);
    }

    /**
     * @dev Override decimals to return 18 (like real USDT)
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
} 