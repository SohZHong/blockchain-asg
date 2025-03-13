// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import '../celo/celo-monorepo/packages/protocol/contracts/common/UsingRegistryV2.sol';

contract MatchManager is UsingRegistryV2 {
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
  }

  mapping(uint256 => Battle) public battles;
  uint256 public battleCounter;

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
      true
    );
    emit BattleStarted(battleCounter, msg.sender, _opponent);
  }

  function attack(uint256 _battleId) external {
    Battle storage battle = battles[_battleId];

    // Conduct checks
    require(battle.active, 'Battle has ended.');
    require(msg.sender == battle.currentTurn, 'Not your turn!');

    Player storage attacker = msg.sender == battle.player1.playerAddress
      ? battle.player1
      : battle.player2;
    Player storage defender = msg.sender == battle.player1.playerAddress
      ? battle.player2
      : battle.player1;

    // Generate random damage within range
    uint256 randomHash = uint256(getRandom().random());
    uint256 damage = attacker.minDamage +
      (randomHash % (attacker.maxDamage - attacker.minDamage + 1));

    // Apply damage
    if (damage >= defender.hp) {
      defender.hp = 0;
      battle.active = false;
      emit BattleEnded(attacker.playerAddress);
    } else {
      defender.hp -= damage;

      emit Attack(
        _battleId,
        msg.sender,
        damage,
        defender.playerAddress,
        defender.hp
      );

      // Switch turns
      battle.currentTurn = defender.playerAddress;
    }
  }

  function getHP(
    uint256 _battleId
  ) external view returns (uint256 p1HP, uint256 p2HP) {
    Battle storage battle = battles[_battleId];

    return (battle.player1.hp, battle.player2.hp);
  }
}
