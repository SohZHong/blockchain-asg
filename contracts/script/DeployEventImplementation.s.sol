// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {EventImplementation} from "../src/EventImplementation.sol";
import {EventFactory} from "../src/EventFactory.sol";

contract DeployEventImplementation is Script {
    function run() public returns (EventImplementation, EventFactory) {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Step 1: Deploy EventImplementation first
        EventImplementation eventImplementation = new EventImplementation();

        // Replace this with the actual organizer token address
        address organizerTokenAddress = 0xfb8672FDF496B66FB81b43B1b1cF1938CA7fb71e;

        // Step 2: Deploy EventFactory
        EventFactory eventFactory = new EventFactory();

        // Step 3: Call initialize() on EventFactory
        eventFactory.initialize(address(eventImplementation), organizerTokenAddress);

        vm.stopBroadcast();

        return (eventImplementation, eventFactory);
    }
}
