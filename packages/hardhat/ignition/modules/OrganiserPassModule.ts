import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const OrganiserModule = buildModule('OrganiserModule', (m) => {
  const baseURI: string =
    'ipfs://bafybeiawnhynmc7iqgelc5ro7chmxewnwn5hzkxpfhbefmkx4wykstmdxa/';
  const organiserToken = m.contract('OrganizerToken', [baseURI]);

  return { organiserToken };
});

export default OrganiserModule;
