import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import MatchManagerModule from '../ignition/modules/MatchManagerModule';
import hre from 'hardhat';

async function main() {
  const signers = await hre.ethers.getSigners();
  const signer = signers[0];
  console.log('Deploying MatchManager...');

  const { matchManager } = await hre.ignition.deploy(MatchManagerModule);

  console.log(`MatchManager deployed at: ${await matchManager.getAddress()}`);

  console.log('Linking contract to MultiBaas...');

  await hre.mbDeployer.setup();

  await hre.mbDeployer.link(
    signer as SignerWithAddress,
    'MatchManager',
    await matchManager.getAddress(),
    {
      addressLabel: 'match_manager',
      contractVersion: '1.0',
      contractLabel: 'match_manager',
    }
  );

  console.log(`Contract successfully linked to MultiBaas `);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
