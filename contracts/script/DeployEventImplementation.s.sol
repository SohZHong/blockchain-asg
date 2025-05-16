// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {EventImplementation} from "../src/EventImplementation.sol";
import {EventFactory} from "../src/EventFactory.sol";

contract DeployEventImplementation is Script {
    function run() public {
        // Start broadcasting transactions
        vm.createSelectFork("alfajores");
        vm.startBroadcast();

        // Step 1: Deploy EventImplementation first
        EventImplementation eventImplementation = new EventImplementation();

        // Replace this with the actual organizer token address
        address organizerTokenAddress = 0xFa1946Ae5C5cc2b07419D307F727484b52C9A6c1;

        // Step 2: Deploy EventFactory
        EventFactory eventFactory = new EventFactory();

        // Step 3: Call initialize() on EventFactory
        eventFactory.initialize(
            address(eventImplementation),
            organizerTokenAddress
        );

        vm.stopBroadcast();
    }
}
