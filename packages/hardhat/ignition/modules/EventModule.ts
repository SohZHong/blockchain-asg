import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const EventModule = buildModule('EventModule', (m) => {
  // Step 1: Deploy EventImplementation first
  const eventImplementation = m.contract('EventImplementation');

  // Replace this with the actual organizer token address
  const organizerTokenAddress = '0xfb8672FDF496B66FB81b43B1b1cF1938CA7fb71e';

  // Step 2: Deploy EventFactory without constructor arguments
  const eventFactory = m.contract('EventFactory');

  // Step 3: Call initialize() on EventFactory
  m.call(eventFactory, 'initialize', [
    eventImplementation,
    organizerTokenAddress,
  ]);

  return { eventImplementation, eventFactory };
});

export default EventModule;
