import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

// Celo Entrypoint
const ENTRYPONT_ADDRESS = '0xcBCfb18D903b74A570f2ab1C3b60FE5692731E0e';

const PaymasterModule = buildModule('PaymasterModule', (m) => {
  const owner = m.getAccount(0);
  const celoPaymaster = m.contract(
    'CeloPaymaster',
    [ENTRYPONT_ADDRESS, owner],
    {
      from: owner,
    }
  );

  return { celoPaymaster };
});

export default PaymasterModule;
