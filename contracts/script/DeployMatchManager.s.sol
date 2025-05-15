// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {MatchManager} from "../src/MatchManager.sol";

contract DeployMatchManager is Script {
    function run() public returns (MatchManager) {
        vm.createSelectFork("alfajores");

        // Start broadcasting transactions
        vm.startBroadcast();

        MatchManager matchManager = new MatchManager();

        vm.stopBroadcast();

        return (matchManager);
    }
}
