// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {MatchManager} from "../src/MatchManager.sol";

contract DeployMatchManager is Script {
    function run() public returns (MatchManager) {
        // Start broadcasting transactions
        vm.startBroadcast();


        address entropy = 0x549Ebba8036Ab746611B4fFA1423eb0A4Df61440;
        address entropyProvider = 0x6CC14824Ea2918f5De5C2f75A9Da968ad4BD6344;
        MatchManager matchManager = new MatchManager(entropy, entropyProvider);

        vm.stopBroadcast();

        return (matchManager);
    }
}
