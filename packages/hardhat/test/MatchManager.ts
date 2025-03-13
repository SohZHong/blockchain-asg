import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
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

        expect(await matchManager.battleCounter()).to.equal(1);
      });
    });
  });
});
