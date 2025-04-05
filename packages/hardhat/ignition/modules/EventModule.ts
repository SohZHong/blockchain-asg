import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const EventModule = buildModule('EventModule', (m) => {
  // Deploy EventImplementation first
  const eventImplementation = m.contract('EventImplementation');

  const organizerTokenAddress = '0x8a608cc6b060B865EF35183d0e39C24c5Fc4a731';

  // Deploy EventFactory without constructor arguments
  const eventFactory = m.contract('EventFactory');

  // Call initialize() on EventFactory
  m.call(eventFactory, 'initialize', [
    eventImplementation,
    organizerTokenAddress,
  ]);

  return { eventImplementation, eventFactory };
});

export default EventModule;
