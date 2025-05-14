// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {Marketplace} from "../src/Marketplace.sol";

contract DeployMarketplace is Script {
    function run() public returns (Marketplace) {
        // Start broadcasting transactions
        vm.startBroadcast();
        uint256 feePercentage = 250;

        Marketplace marketplace = new Marketplace(feePercentage);

        vm.stopBroadcast();

        return (marketplace);
    }
}