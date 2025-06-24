// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./LightAccount.sol";

/**
 * @title LightAccountFactory
 * @dev Factory contract for creating LightAccount instances
 * Based on Kernel v0.2 standard for Account Abstraction
 */
contract LightAccountFactory is Ownable {
    LightAccount public immutable accountImplementation;
    
    event AccountCreated(address indexed account, address indexed owner);

    constructor(address _entryPoint) Ownable(msg.sender) {
        accountImplementation = new LightAccount(_entryPoint);
    }

    /**
     * @dev Create an account, and return its address.
     * Returns the address even if the account is already deployed.
     * Note that during UserOperation execution, this method is called only if the account is not deployed.
     * This method returns an existing account address so that entryPoint.getSenderAddress() would work even after account creation
     */
    function createAccount(address owner) public returns (LightAccount ret) {
        address addr = getAddress(owner);
        uint codeSize = addr.code.length;
        if (codeSize > 0) {
            return LightAccount(payable(addr));
        }
        ret = LightAccount(payable(new ERC1167Proxy{salt: bytes32(uint256(uint160(owner)))}(address(accountImplementation), abi.encodeCall(LightAccount.initialize, (owner)))));
    }

    /**
     * @dev Calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAddress(address owner) public view returns (address) {
        return Clones.predictDeterministicAddress(
            address(accountImplementation),
            bytes32(uint256(uint160(owner))),
            address(this)
        );
    }
}

/**
 * @title ERC1167Proxy
 * @dev Minimal proxy contract for cloning
 */
contract ERC1167Proxy {
    constructor(address implementation, bytes memory data) {
        (bool success, bytes memory returndata) = implementation.delegatecall(data);
        if (!success) {
            if (returndata.length > 0) {
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert("ERC1167Proxy: delegatecall failed");
            }
        }
    }
} 