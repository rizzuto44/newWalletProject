// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/MockUSDT.sol";
import "../contracts/LightAccountFactory.sol";
import "../contracts/MyErc20Paymaster.sol";

/**
 * @title DeploySepolia
 * @dev Deployment script for Sepolia testnet
 */
contract DeploySepolia is Script {
    // Constants
    address constant ENTRYPOINT = 0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789;
    address constant CHAINLINK_ETH_USD = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
    uint256 constant UNSTAKE_DELAY = 2 days;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("Deploying contracts to Sepolia...");

        // Deploy MockUSDT
        console.log("Deploying MockUSDT...");
        MockUSDT usdt = new MockUSDT();
        console.log("MockUSDT deployed at:", address(usdt));

        // Deploy LightAccountFactory
        console.log("Deploying LightAccountFactory...");
        LightAccountFactory factory = new LightAccountFactory(ENTRYPOINT);
        console.log("LightAccountFactory deployed at:", address(factory));

        // Deploy MyErc20Paymaster
        console.log("Deploying MyErc20Paymaster...");
        MyErc20Paymaster paymaster = new MyErc20Paymaster(
            ENTRYPOINT,
            address(usdt),
            address(usdt), // Using USDT as its own oracle for simplicity
            CHAINLINK_ETH_USD
        );
        console.log("MyErc20Paymaster deployed at:", address(paymaster));

        // Setup paymaster
        console.log("Setting up paymaster...");
        
        // Add stake to paymaster
        paymaster.addStake{value: 0.02 ether}();
        console.log("Added 0.02 ETH stake to paymaster");

        // Deposit ETH to paymaster for gas sponsorship
        paymaster.deposit{value: 0.08 ether}();
        console.log("Deposited 0.08 ETH to paymaster");

        // Mint some USDT for testing
        usdt.mint(address(this), 1000 * 10**18); // 1000 USDT
        console.log("Minted 1000 USDT to deployer");

        vm.stopBroadcast();

        // Save deployment addresses
        string memory deploymentData = vm.toString(address(usdt)) + "\n" +
                                      vm.toString(address(factory)) + "\n" +
                                      vm.toString(address(paymaster));

        vm.writeFile("deploys/sepolia.txt", deploymentData);
        
        // Create JSON deployment data
        string memory jsonData = vm.toString('{"deployments":{');
        jsonData = string.concat(jsonData, '"usdt":"', vm.toString(address(usdt)), '",');
        jsonData = string.concat(jsonData, '"factory":"', vm.toString(address(factory)), '",');
        jsonData = string.concat(jsonData, '"paymaster":"', vm.toString(address(paymaster)), '"');
        jsonData = string.concat(jsonData, '},"constants":{');
        jsonData = string.concat(jsonData, '"entryPoint":"', vm.toString(ENTRYPOINT), '",');
        jsonData = string.concat(jsonData, '"chainlinkEthUsd":"', vm.toString(CHAINLINK_ETH_USD), '"');
        jsonData = string.concat(jsonData, '}}');

        vm.writeFile("deploys/sepolia.json", jsonData);

        console.log("Deployment complete!");
        console.log("Deployment data saved to deploys/sepolia.json");
        console.log("MockUSDT:", address(usdt));
        console.log("LightAccountFactory:", address(factory));
        console.log("MyErc20Paymaster:", address(paymaster));
    }
} 