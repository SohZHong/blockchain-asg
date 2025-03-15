import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const EntryPointModule = buildModule('EntryPointModule', (m) => {
  const entryPoint = m.contract('CeloEntryPoint');

  return { entryPoint };
});

export default EntryPointModule;
