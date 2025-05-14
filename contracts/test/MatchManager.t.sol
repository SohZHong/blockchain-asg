// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/MatchManager.sol";

contract MatchManagerTest is Test {
    MatchManager public matchManager;
    address public player1;
    address public player2;
    uint256 public constant PLAYER1_MIN_DMG = 10;
    uint256 public constant PLAYER1_MAX_DMG = 20;
    uint256 public constant PLAYER2_MIN_DMG = 15;
    uint256 public constant PLAYER2_MAX_DMG = 25;

    event BattleStarted(
        uint256 battleId,
        address indexed player1,
        address indexed player2
    );
    event Attack(
        uint256 battleId,
        address attacker,
        uint256 damage,
        address target,
        uint256 remainingHp
    );
    event BattleEnded(uint256 battleId, address indexed winner);

    function setUp() public {
        matchManager = new MatchManager();
        player1 = makeAddr("player1");
        player2 = makeAddr("player2");
    }

    function test_StartBattle() public {
        vm.startPrank(player1);
        vm.expectEmit();
        emit BattleStarted(1, player1, player2);
        matchManager.startBattle(
            player2,
            PLAYER1_MIN_DMG,
            PLAYER1_MAX_DMG,
            PLAYER2_MIN_DMG,
            PLAYER2_MAX_DMG
        );
        vm.stopPrank();

        (uint256 p1HP, uint256 p2HP) = matchManager.getHP(1);
        assertEq(p1HP, 100);
        assertEq(p2HP, 100);
    }

    function test_Attack() public {
        vm.startPrank(player1);
        vm.expectEmit();
        emit BattleStarted(1, player1, player2);
        matchManager.startBattle(
            player2,
            PLAYER1_MIN_DMG,
            PLAYER1_MAX_DMG,
            PLAYER2_MIN_DMG,
            PLAYER2_MAX_DMG
        );
        vm.stopPrank();

        vm.startPrank(player1);
        vm.expectEmit();
        emit Attack(1, player1, 20, player2, 80);
        matchManager.attack(1, 20);
        vm.stopPrank();

        (uint256 p1HP, uint256 p2HP) = matchManager.getHP(1);
        assertEq(p1HP, 100);
        assertEq(p2HP, 80);
    }

    function test_AttackNotYourTurn() public {
        vm.startPrank(player1);
        matchManager.startBattle(
            player2,
            PLAYER1_MIN_DMG,
            PLAYER1_MAX_DMG,
            PLAYER2_MIN_DMG,
            PLAYER2_MAX_DMG
        );
        vm.stopPrank();

        vm.startPrank(player2);
        vm.expectRevert("Not your turn!");
        matchManager.attack(1, 20);
        vm.stopPrank();
    }

    function test_AttackBattleEnded() public {
        vm.startPrank(player1);
        matchManager.startBattle(
            player2,
            PLAYER1_MIN_DMG,
            PLAYER1_MAX_DMG,
            PLAYER2_MIN_DMG,
            PLAYER2_MAX_DMG
        );
        vm.stopPrank();

        vm.startPrank(player1);
        vm.expectEmit();
        emit BattleEnded(1, player1);
        matchManager.attack(1, 100);
        vm.stopPrank();

        vm.startPrank(player2);
        vm.expectRevert("Battle has ended.");
        matchManager.attack(1, 20);
        vm.stopPrank();
    }

    function test_MultipleBattles() public {
        vm.startPrank(player1);
        vm.expectEmit();
        emit BattleStarted(1, player1, player2);
        matchManager.startBattle(
            player2,
            PLAYER1_MIN_DMG,
            PLAYER1_MAX_DMG,
            PLAYER2_MIN_DMG,
            PLAYER2_MAX_DMG
        );
        vm.stopPrank();

        vm.startPrank(player1);
        vm.expectEmit();
        emit Attack(1, player1, 20, player2, 80);
        matchManager.attack(1, 20);
        vm.stopPrank();

        vm.startPrank(player2);
        vm.expectEmit();
        emit Attack(1, player2, 25, player1, 75);
        matchManager.attack(1, 25);
        vm.stopPrank();

        (uint256 p1HP, uint256 p2HP) = matchManager.getHP(1);
        assertEq(p1HP, 75);
        assertEq(p2HP, 80);
    }

    function test_BattleEnded() public {
        vm.startPrank(player1);
        vm.expectEmit();
        emit BattleStarted(1, player1, player2);
        matchManager.startBattle(
            player2,
            PLAYER1_MIN_DMG,
            PLAYER1_MAX_DMG,
            PLAYER2_MIN_DMG,
            PLAYER2_MAX_DMG
        );
        vm.stopPrank();

        vm.startPrank(player1);
        vm.expectEmit();
        emit BattleEnded(1, player1);
        matchManager.attack(1, 100);
        vm.stopPrank();

        (uint256 p1HP, uint256 p2HP) = matchManager.getHP(1);
        assertEq(p1HP, 100);
        assertEq(p2HP, 0);
    }
}
