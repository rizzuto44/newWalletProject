// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./interfaces/IEntryPoint.sol";

/**
 * @title MyErc20Paymaster
 * @dev ERC-20 Paymaster for gas-in-token payments
 * Based on Pimlico's ERC-20 Paymaster
 */
contract MyErc20Paymaster is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    IEntryPoint public immutable entryPoint;
    IERC20 public immutable token;
    AggregatorV3Interface public immutable tokenOracle;
    AggregatorV3Interface public immutable nativeOracle;
    
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MIN_STAKE = 0.02 ether;
    uint256 public constant UNSTAKE_DELAY = 2 days;
    
    mapping(address => uint256) public stake;
    mapping(address => uint256) public unstakeDelaySec;
    mapping(address => uint256) public lastUnstakeTime;
    
    event TokensCharged(address indexed account, uint256 tokenAmount, uint256 nativeAmount);
    event StakeAdded(address indexed account, uint256 amount);
    event StakeUnlocked(address indexed account, uint256 unlockTime);
    event StakeWithdrawn(address indexed account, uint256 amount);

    constructor(
        address _entryPoint,
        address _token,
        address _tokenOracle,
        address _nativeOracle
    ) Ownable() {
        _transferOwnership(msg.sender);
        entryPoint = IEntryPoint(_entryPoint);
        token = IERC20(_token);
        tokenOracle = AggregatorV3Interface(_tokenOracle);
        nativeOracle = AggregatorV3Interface(_nativeOracle);
    }

    /**
     * @dev Add stake for this paymaster
     */
    function addStake() external payable {
        stake[msg.sender] += msg.value;
        emit StakeAdded(msg.sender, msg.value);
    }

    /**
     * @dev Unlock stake (must wait for UNSTAKE_DELAY)
     */
    function unlockStake() external {
        require(stake[msg.sender] >= MIN_STAKE, "MyErc20Paymaster: insufficient stake");
        unstakeDelaySec[msg.sender] = UNSTAKE_DELAY;
        lastUnstakeTime[msg.sender] = block.timestamp;
        emit StakeUnlocked(msg.sender, block.timestamp + UNSTAKE_DELAY);
    }

    /**
     * @dev Withdraw stake after delay period
     */
    function withdrawStake(address payable withdrawAddress) external {
        require(
            block.timestamp >= lastUnstakeTime[msg.sender] + unstakeDelaySec[msg.sender],
            "MyErc20Paymaster: stake not yet unlocked"
        );
        uint256 amount = stake[msg.sender];
        stake[msg.sender] = 0;
        unstakeDelaySec[msg.sender] = 0;
        lastUnstakeTime[msg.sender] = 0;
        (bool success,) = withdrawAddress.call{value: amount}("");
        require(success, "MyErc20Paymaster: stake withdrawal failed");
        emit StakeWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Validate paymaster userOp
     */
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external view returns (bytes memory context, uint256 validationData) {
        require(msg.sender == address(entryPoint), "MyErc20Paymaster: only entry point");
        
        // Decode paymaster data
        (uint256 tokenAmount, uint256 maxTokenAmount, uint256 validUntil, bytes memory signature) = 
            abi.decode(userOp.paymasterAndData[20:], (uint256, uint256, uint256, bytes));
        
        require(validUntil == 0 || validUntil > block.timestamp, "MyErc20Paymaster: expired");
        require(tokenAmount <= maxTokenAmount, "MyErc20Paymaster: token amount too high");
        
        // Verify signature
        bytes32 hash = keccak256(abi.encodePacked(
            userOp.sender,
            tokenAmount,
            maxTokenAmount,
            validUntil
        ));
        address signer = hash.toEthSignedMessageHash().recover(signature);
        require(signer == owner(), "MyErc20Paymaster: invalid signature");
        
        // Check token balance
        require(
            token.balanceOf(userOp.sender) >= tokenAmount,
            "MyErc20Paymaster: insufficient token balance"
        );
        
        return (abi.encode(userOp.sender, tokenAmount), 0);
    }

    /**
     * @dev Post-operation handler
     */
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external {
        require(msg.sender == address(entryPoint), "MyErc20Paymaster: only entry point");
        
        (address sender, uint256 tokenAmount) = abi.decode(context, (address, uint256));
        
        if (mode == PostOpMode.opSucceeded) {
            // Charge tokens for gas
            token.safeTransferFrom(sender, address(this), tokenAmount);
            emit TokensCharged(sender, tokenAmount, actualGasCost);
        }
    }

    /**
     * @dev Deposit ETH to paymaster
     */
    function deposit() external payable {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    /**
     * @dev Withdraw ETH from paymaster
     */
    function withdrawTo(address payable withdrawAddress, uint256 amount) external onlyOwner {
        entryPoint.withdrawTo(withdrawAddress, amount);
    }

    /**
     * @dev Get token price in USD
     */
    function getTokenPrice() public view returns (uint256) {
        (, int256 price,,,) = tokenOracle.latestRoundData();
        return uint256(price);
    }

    /**
     * @dev Get native token price in USD
     */
    function getNativePrice() public view returns (uint256) {
        (, int256 price,,,) = nativeOracle.latestRoundData();
        return uint256(price);
    }

    /**
     * @dev Calculate token amount needed for gas cost
     */
    function calculateTokenAmount(uint256 gasCost) public view returns (uint256) {
        uint256 tokenPrice = getTokenPrice();
        uint256 nativePrice = getNativePrice();
        
        if (tokenPrice == 0 || nativePrice == 0) {
            revert("MyErc20Paymaster: invalid oracle price");
        }
        
        return (gasCost * nativePrice * PRECISION) / (tokenPrice * PRECISION);
    }

    receive() external payable {}
}

/**
 * @title AggregatorV3Interface
 * @dev Chainlink price feed interface
 */
interface AggregatorV3Interface {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 answer,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}

/**
 * @title PostOpMode
 * @dev Enum for post-operation modes
 */
enum PostOpMode {
    opSucceeded,
    opReverted,
    postOpReverted
} 