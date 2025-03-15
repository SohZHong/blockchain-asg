import hre from 'hardhat';

async function main() {
  const Paymaster = await hre.ethers.getContractFactory('CeloPaymaster');
  const [deployer] = await hre.ethers.getSigners();
  const ENTRYPONT_ADDRESS = '0xcBCfb18D903b74A570f2ab1C3b60FE5692731E0e';

  console.log(`Deploying from: ${deployer.address}`);

  try {
    const paymaster = await Paymaster.deploy(
      ENTRYPONT_ADDRESS,
      deployer.address // Address of the owner of the paymaster
    );
    await paymaster.transferOwnership(deployer.address);
    await paymaster.waitForDeployment();
    console.log(`✅ Paymaster deployed at: ${paymaster.target}`);
  } catch (error: any) {
    console.error(`🚨 Deployment failed: ${error.reason || error.message}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
