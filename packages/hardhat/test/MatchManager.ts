import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { expect } from 'chai';
import hre from 'hardhat';

describe('MatchManager', function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployMatchManager() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MatchManager = await hre.ethers.getContractFactory('MatchManager');
    const matchManager = await MatchManager.deploy();

    return { matchManager, owner, otherAccount };
  }

  describe('Deployment', function () {
    it('Should have 0 battles', async function () {
      const { matchManager } = await loadFixture(deployMatchManager);
      expect(await matchManager.battleCounter()).to.equal(0);
    });
  });

  describe('Battles', function () {
    describe('Implementations', function () {
      it('Should have active status', async function () {
        const { matchManager, owner, otherAccount } = await loadFixture(
          deployMatchManager
        );
        await matchManager.startBattle(otherAccount.address, 5, 10, 6, 11, {
          from: owner.address,
        });
        const battle = await matchManager.battles(1);
        expect(battle.active).to.equal(true);
      });

      it('Should have reduced hp after attack', async function () {
        const { matchManager, owner, otherAccount } = await loadFixture(
          deployMatchManager
        );
        await matchManager.startBattle(otherAccount.address, 5, 10, 6, 11, {
          from: owner.address,
        });
        await matchManager.attack(1);
        const { p1HP, p2HP } = await matchManager.getHP(1);
        expect(p2HP).to.lessThan(p1HP);
      });

      it('Should change turns after attack', async function () {
        const { matchManager, owner, otherAccount } = await loadFixture(
          deployMatchManager
        );
        await matchManager.startBattle(otherAccount.address, 5, 10, 6, 11, {
          from: owner.address,
        });
        await matchManager.attack(1);
        const battle = await matchManager.battles(1);
        expect(battle.currentTurn).to.equal(otherAccount.address);
      });

      it('Should end battle after hp reduced to 0', async function () {
        const { matchManager, owner, otherAccount } = await loadFixture(
          deployMatchManager
        );
        // Set min and max damage to 100
        await matchManager.startBattle(otherAccount.address, 100, 100, 6, 11, {
          from: owner.address,
        });
        await matchManager.attack(1);
        const battle = await matchManager.battles(1);
        expect(battle.active).to.equal(false);
      });
    });

    describe('Events', function () {
      it('Should emit an event on battle start', async function () {
        const { matchManager, owner, otherAccount } = await loadFixture(
          deployMatchManager
        );

        await expect(
          await matchManager.startBattle(otherAccount.address, 5, 10, 6, 11)
        )
          .to.emit(matchManager, 'BattleStarted')
          .withArgs(1, owner.address, otherAccount.address);
      });

      it('Should emit an event on attack', async function () {
        const { matchManager, owner, otherAccount } = await loadFixture(
          deployMatchManager
        );
        await matchManager.startBattle(otherAccount.address, 5, 10, 6, 11, {
          from: owner.address,
        });
        await expect(await matchManager.attack(1))
          .to.emit(matchManager, 'Attack')
          .withArgs(1, owner.address, anyValue, otherAccount.address, anyValue);
      });

      it('Should emit an event on battle ended', async function () {
        const { matchManager, owner, otherAccount } = await loadFixture(
          deployMatchManager
        );
        // Set min and max damage to 100
        await matchManager.startBattle(otherAccount.address, 100, 100, 6, 11, {
          from: owner.address,
        });
        await expect(await matchManager.attack(1))
          .to.emit(matchManager, 'BattleEnded')
          .withArgs(1, owner.address);
      });
    });
  });
});
