// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {OrganiserToken} from "../src/OrganiserToken.sol";

contract DeployOrganiserToken is Script {
    function run() public returns (OrganiserToken) {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Step 1: Deploy OrganiserToken first
        OrganiserToken organiserToken = new OrganiserToken("ipfs://bafybeiawnhynmc7iqgelc5ro7chmxewnwn5hzkxpfhbefmkx4wykstmdxa/");

        vm.stopBroadcast();

        return (organiserToken);
    }
}

