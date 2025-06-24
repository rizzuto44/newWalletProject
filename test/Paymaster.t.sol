// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../contracts/MockUSDT.sol";
import "../contracts/MyErc20Paymaster.sol";

/**
 * @title PaymasterTest
 * @dev Tests for MyErc20Paymaster contract
 */
contract PaymasterTest is Test {
    MockUSDT public usdt;
    MyErc20Paymaster public paymaster;
    
    address constant ENTRYPOINT = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
    address constant CHAINLINK_ETH_USD = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
    
    address public user = address(0x123);
    address public owner = address(this);

    function setUp() public {
        // Fund this contract with enough ETH for staking and deposit
        vm.deal(address(this), 1 ether);

        // Deploy contracts
        usdt = new MockUSDT();
        paymaster = new MyErc20Paymaster(
            ENTRYPOINT,
            address(usdt),
            address(usdt), // Using USDT as its own oracle for testing
            CHAINLINK_ETH_USD
        );
        
        // Setup paymaster
        paymaster.addStake{value: 0.02 ether}();
        // paymaster.deposit{value: 0.08 ether}();
        
        // Mint USDT to user
        usdt.mint(user, 1000 * 10**18);
        
        // Label addresses for better test output
        vm.label(address(usdt), "MockUSDT");
        vm.label(address(paymaster), "MyErc20Paymaster");
        vm.label(user, "User");
    }

    function testPaymasterSetup() public {
        assertEq(address(paymaster.entryPoint()), ENTRYPOINT);
        assertEq(address(paymaster.token()), address(usdt));
        assertEq(address(paymaster.tokenOracle()), address(usdt));
        assertEq(address(paymaster.nativeOracle()), CHAINLINK_ETH_USD);
    }

    function testStakeManagement() public {
        // Test adding stake
        uint256 initialStake = paymaster.stake(address(this));
        paymaster.addStake{value: 0.01 ether}();
        assertEq(paymaster.stake(address(this)), initialStake + 0.01 ether);
        
        // Test unlocking stake
        paymaster.unlockStake();
        assertEq(paymaster.unstakeDelaySec(address(this)), 2 days);
        assertEq(paymaster.lastUnstakeTime(address(this)), block.timestamp);
    }

    function testTokenBalanceCheck() public {
        uint256 userBalance = usdt.balanceOf(user);
        assertEq(userBalance, 1000 * 10**18);
        
        // Test that user has sufficient balance for operations
        assertTrue(userBalance > 0);
    }

    function testCalculateTokenAmount() public {
        uint256 gasCost = 0.001 ether;
        uint256 tokenAmount = paymaster.calculateTokenAmount(gasCost);
        
        // Should return a non-zero amount
        assertTrue(tokenAmount > 0);
    }

    function testPaymasterValidation() public {
        // This is a basic test - in a real scenario, you'd need to create
        // proper UserOperation structures and signatures
        
        // Test that paymaster can be called by entry point
        vm.prank(ENTRYPOINT);
        // Note: This would require proper UserOperation data
        // paymaster.validatePaymasterUserOp(userOp, userOpHash, maxCost);
    }

    function test_RevertWhen_InsufficientStake() public {
        vm.expectRevert();
        vm.prank(user);
        paymaster.unlockStake();
    }

    function test_RevertWhen_WithdrawBeforeDelay() public {
        paymaster.addStake{value: 0.02 ether}();
        paymaster.unlockStake();
        vm.expectRevert();
        paymaster.withdrawStake(payable(user));
    }
} 