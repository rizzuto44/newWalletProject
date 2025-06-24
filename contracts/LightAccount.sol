// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LightAccount
 * @dev A simple smart contract account for Account Abstraction
 * Based on ERC-4337 standard
 */
contract LightAccount is Initializable, Ownable, UUPSUpgradeable {
    using ECDSA for bytes32;

    IEntryPoint public immutable entryPoint;
    
    event LightAccountInitialized(IEntryPoint indexed entryPoint, address indexed owner);

    modifier onlyEntryPoint() {
        require(msg.sender == address(entryPoint), "LightAccount: only entry point");
        _;
    }

    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
        _disableInitializers();
    }

    /**
     * @dev Initialize the account with an owner
     */
    function initialize(address anOwner) public virtual initializer {
        _initialize(anOwner);
    }

    function _initialize(address anOwner) internal virtual {
        owner = anOwner;
        emit LightAccountInitialized(entryPoint, owner);
    }

    /**
     * @dev Execute a transaction (called from entryPoint)
     */
    function execute(address dest, uint256 value, bytes calldata func) external onlyEntryPoint {
        _call(dest, value, func);
    }

    /**
     * @dev Execute a sequence of transactions
     */
    function executeBatch(address[] calldata dest, uint256[] calldata value, bytes[] calldata func) external onlyEntryPoint {
        require(dest.length == func.length && (value.length == 0 || value.length == func.length), "LightAccount: wrong array lengths");
        if (value.length == 0) {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], 0, func[i]);
            }
        } else {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], value[i], func[i]);
            }
        }
    }

    /**
     * @dev Validate user's signature and nonce
     */
    function validateUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 missingAccountFunds)
    external onlyEntryPoint returns (uint256 validationData) {
        address signer = userOpHash.toEthSignedMessageHash().recover(userOp.signature);
        if (owner != signer) {
            return SIG_VALIDATION_FAILED;
        }
        if (missingAccountFunds != 0) {
            (bool success,) = payable(msg.sender).call{value: missingAccountFunds}("");
            (success);
        }
        return 0;
    }

    /**
     * @dev Check current account deposit in the entryPoint
     */
    function getDeposit() public view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }

    /**
     * @dev Deposit more funds for this account in the entryPoint
     */
    function addDeposit() public payable {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    /**
     * @dev Withdraw value from the account's deposit
     */
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlyOwner {
        entryPoint.withdrawTo(withdrawAddress, amount);
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /**
     * @dev Required by the OZ UUPS module
     */
    function _authorizeUpgrade(address newImplementation) internal view override {
        (newImplementation);
        _onlyOwner();
    }

    /**
     * @dev Required by the OZ Ownable module
     */
    function _onlyOwner() internal view {
        require(owner == msg.sender, "LightAccount: caller is not the owner");
    }

    // ERC-4337 constants
    uint256 constant SIG_VALIDATION_FAILED = 1;
}

/**
 * @title IEntryPoint
 * @dev Interface for the EntryPoint contract
 */
interface IEntryPoint {
    function balanceOf(address account) external view returns (uint256);
    function depositTo(address account) external payable;
    function withdrawTo(address payable withdrawAddress, uint256 amount) external;
}

/**
 * @title UserOperation
 * @dev Structure for ERC-4337 UserOperation
 */
struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
} 