// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "node_modules/@pythnetwork/entropy-sdk-solidity/IEntropy.sol";
import "node_modules/@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

contract MatchManager is IEntropyConsumer {
  struct Player {
    address playerAddress;
    uint256 hp;
    uint256 minDamage;
    uint256 maxDamage;
  }

  struct Battle {
    Player player1;
    Player player2;
    address currentTurn;
    bool active;
    bool waitingForRandom;
  }

  struct PendingAttack {
    uint256 battleId;
    address attacker;
    address defender;
  }

  mapping(uint256 => Battle) public battles;
  mapping(uint64 => PendingAttack) public pendingAttacks;
  uint256 public battleCounter;
  IEntropy private entropy;
  address private entropyProvider;

  event Attack(
    uint256 battleId,
    address attacker,
    uint256 damage,
    address target,
    uint256 remainingHp
  );
  event BattleStarted(
    uint256 battleId,
    address indexed player1,
    address indexed player2
  );
  event BattleEnded(uint256 battleId, address indexed winner);
  event AttackRequested(uint256 battleId, uint64 sequenceNumber);

  constructor(address _entropy, address _entropyProvider) {
    entropy = IEntropy(_entropy);
    entropyProvider = _entropyProvider;
  }

  function startBattle(
    address _opponent,
    uint256 _player1MinDmg,
    uint256 _player1MaxDmg,
    uint256 _player2MinDmg,
    uint256 _player2MaxDmg
  ) external {
    battleCounter++;
    // Default hp to 100
    battles[battleCounter] = Battle(
      Player(msg.sender, 100, _player1MinDmg, _player1MaxDmg),
      Player(_opponent, 100, _player2MinDmg, _player2MaxDmg),
      msg.sender,
      true,
      false
    );
    emit BattleStarted(battleCounter, msg.sender, _opponent);
  }


  // Commented the code cause Celo L2 does not support randomness anymore
  // function getRandom() internal view returns (uint256) {
  //   if (block.chainid == 31337) {
  //     // Hardhat local testnet
  //     return
  //       uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao)));
  //   } else {
  //     // Actual Celo implementation
  //     return
  //       uint256(
  //         IRandom(
  //           IRegistry(0x000000000000000000000000000000000000ce10).getAddressFor(
  //             keccak256(abi.encodePacked('Random'))
  //           )
  //         ).random()
  //       );
  //   }
  // }

  function attack(uint256 _battleId) external payable {
    Battle storage battle = battles[_battleId];

    // Conduct checks
    require(battle.active, 'Battle has ended.');
    require(msg.sender == battle.currentTurn, 'Not your turn!');
    require(!battle.waitingForRandom, 'Already waiting for random number');

    Player storage attacker = msg.sender == battle.player1.playerAddress
      ? battle.player1
      : battle.player2;
    Player storage defender = msg.sender == battle.player1.playerAddress
      ? battle.player2
      : battle.player1;

    // Get the fee required for random number generation using Pyth provider
    uint256 fee = entropy.getFee(entropyProvider);
    require(msg.value >= fee, 'Insufficient fee');

    bytes32 userRandomNumber = keccak256(abi.encodePacked(block.timestamp, msg.sender, _battleId));

    uint64 sequenceNumber = entropy.requestWithCallback{value: fee}(
      entropyProvider,
      userRandomNumber
    );

    pendingAttacks[sequenceNumber] = PendingAttack(_battleId, msg.sender, defender.playerAddress);
    battle.waitingForRandom = true;

    emit AttackRequested(_battleId, sequenceNumber);
  }

  function entropyCallback(
    uint64 sequenceNumber,
    address,
    bytes32 randomNumber
  ) internal override {
    PendingAttack memory pending = pendingAttacks[sequenceNumber];
    Battle storage battle = battles[pending.battleId];
    
    require(battle.active, 'Battle has ended');
    require(battle.waitingForRandom, 'No pending attack');

    Player storage attacker = pending.attacker == battle.player1.playerAddress
      ? battle.player1
      : battle.player2;
    Player storage defender = pending.attacker == battle.player1.playerAddress
      ? battle.player2
      : battle.player1;

    // Generate damage within range using the random number
    uint256 damage = attacker.minDamage +
      (uint256(randomNumber) % (attacker.maxDamage - attacker.minDamage + 1));

    // Apply damage
    if (damage >= defender.hp) {
      defender.hp = 0;
      battle.active = false;
      emit BattleEnded(pending.battleId, attacker.playerAddress);
    } else {
      defender.hp -= damage;
      emit Attack(
        pending.battleId,
        pending.attacker,
        damage,
        pending.defender,
        defender.hp
      );
      // Switch turns
      battle.currentTurn = defender.playerAddress;
    }
    battle.waitingForRandom = false;
    delete pendingAttacks[sequenceNumber];
  }

  function getEntropy() internal view override returns (address) {
    return address(entropy);
  }

  function getHP(
    uint256 _battleId
  ) external view returns (uint256 p1HP, uint256 p2HP) {
    Battle storage battle = battles[_battleId];
    return (battle.player1.hp, battle.player2.hp);
  }

  receive() external payable {}
}
