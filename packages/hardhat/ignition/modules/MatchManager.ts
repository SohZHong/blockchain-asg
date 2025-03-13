import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MatchManagerModule = buildModule('MatchManagerModule', (m) => {
  const matchManager = m.contract('MatchManager');

  return { matchManager };
});

export default MatchManagerModule;
