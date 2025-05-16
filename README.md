<!-- TITLE -->
<p align="center">
  <img width="100px" src="thirdweb-app/public/landing-page/white-title.svg" align="center" alt="Title" />
 <h2 align="center">Mystic Kaizer</h2>
 <p align="center">Our One Liner</p>
</p>
</p>

<!-- TABLE OF CONTENTS -->

<div>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
      <ol>
        <li><a href="#features">Features</a></li>
        <li><a href="#built-with">Built With</a></li>
        <li><a href="#prerequisites">Prerequisites</a></li>
     </ol>
     <li><a href="#how-multibaas-is-used">How Multibaas Is Used</a>
        <ol>
          <li><a href="#contract-read-operations">Contract Read Operations</a></li>
          <li><a href="#event-indexing">Event Indexing</a></li>
          <li><a href="#webhook-triggers">Webhook Triggers</a></li>
        </ol>
     </li>
    <li><a href="#multibaas-setup-and-testing-instructions">Multibaas Setup and Testing Instructions</a></li>
        <ol>
          <li><a href="#prerequisites">Prerequisites</a></li>
          <li><a href="#setup-steps">Setup Steps</a></li>
        </ol>
    <li><a href="#experience-with-multibaas">Experience with Multibaas</a></li>
        <ol>
          <li><a href="#feedback">Feedback</a></li>
          <li><a href="#challenges">Challenges</a></li>
          <li><a href="#wins">Wins</a></li>
        </ol>
    <li><a href="#license">License</a></li>

  </ol>
</div>

<!-- ABOUT THE PROJECT -->

## About The Project

One Liner for our project

<p align="right">(<a href="#top">back to top</a>)</p>

## Features

### AI-Generated NFT Game Cards

- **Dynamic Character Creation**: Players receive unique NFT game cards upon signup, generated via an AI agent that assembles randomized traits.
- **On-Chain Minting**: Images are uploaded to IPFS and minted as ERC-721 NFTs using smart contracts.

### On-Chain Battle Mechanics

- **Turn-Based Battles**: Players join code-based lobbies and engage in turn-based PvP battles.
- **Smart Contract Execution**: Battle logic is enforced on-chain through custom contracts for fairness and transparency.

### Integrated NFT Marketplace

- **Trade & Collect**: Players can browse, trade, and collect NFTs through a built-in marketplace.

### Modular Smart Contract System

- [EventFactory](https://alfajores.celoscan.io/address/0xC4F53B0021141407Ec99F14Fd844f8A0C03ACacF) Spawns new event contract instances dynamically.
- [MatchManager](https://alfajores.celoscan.io/address/0x97f768869a4207DE4450C610A3A5331e36CC3BAd): Manages the creation and flow of battles.
- [Marketplace](https://alfajores.celoscan.io/address/0x41Be93E3914e4262dD7A08cEce2f80EB84b8B0e2): Handles listing and trading of NFTs.
- [OrganizerToken](https://alfajores.celoscan.io/address/0xFa1946Ae5C5cc2b07419D307F727484b52C9A6c1): Provides event organizer-specific logic and permissions.

### Multibaas Integration

- **Event Indexing**: Tracks and indexes smart contract events in real-time.
- **Contract Read Access**: Uses MultiBaas SDK to fetch on-chain state efficiently.
- **Webhook Triggers**: Sends contract event data to the backend, where it’s processed and stored in Supabase.

### Supabase Backend

- **Real-Time Data Sync**: Stores off-chain metadata for events, players, battles, and logs.
- **Battle & Event Logging**: Inserts event and action data triggered from on-chain events.
- **RPC Support**: Uses stored procedures (e.g., for incrementing participant count) for more secure updates.

### Dockerized for Deployment

- **Local & Remote Ready**: Easily deploy the backend server using Docker for both local dev and remote environments.
- **Webhook Hosting**: Dockerized Express server can be used as a webhook endpoint for MultiBaas.

## Built With

- [Celo](https://celo.org/)
- [Multibaas](https://docs.curvegrid.com/multibaas)
- [Solidity](https://docs.soliditylang.org/en/v0.8.19/)
- [Foundry](https://book.getfoundry.sh/)
- [Thirdweb](https://portal.thirdweb.com/)
- [Pinata](https://pinata.cloud/)
- [Next.js](https://nextjs.org/)
- [Tailwind](https://tailwindcss.com/)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Prerequisites

- Node (v20 or higher)
- Git (v2.38 or higher)

## How Multibaas is Used

MultiBaas serves as both the read and write integration layer for the project, acting as the intermediary for:

- Indexing and querying on-chain contract events
- Executing contract write operations such as marketplace listings
- Running custom event queries for filtered real-time data

All contracts are deployed and verified using **Foundry**, then registered in the **MultiBaas UI Console** with assigned aliases and linked ABIs. This dynamic linking allows the SDK to interact with any deployed contract without hardcoding addresses.

While some transactions are still executed via Thirdweb Engine (e.g., for gasless flows using session keys), MultiBaas handles a majority of smart contract interaction logic.

Main Usages are:

- Contract Read, Write Operations through SDK
- Frontend development with CORS origins
- Event indexing
- Event Queries with Filtering
- Webhook

This project involves the following smart contracts:

- `Marketplace`: Handles listings and offers
- `MatchManager`: Controls the battle system
- `OrganizerToken`: Verifies permission to create events
- `EventFactory`: Deploys event contracts
- `Event (implementation)`: The template for all deployed event contracts

### Contract Read Operations

**Purpose**: Use MultiBaas to call view/pure contract functions through the SDK without needing to instantiate a full Web3 provider.

These read operations are useful for fetching on-chain state in a simple, reliable, and gasless way.

#### Example Usage: Reading Milestones

If the contract has a function like this:

```solidity
  function getMilestones() external view returns (uint256[] memory) {
      uint256[] memory milestones = new uint256[](eventData.rewardCount);
      for (uint256 i = 0; i < eventData.rewardCount; i++) {
          milestones[i] = milestoneMap[i];
      }
      return milestones;
  }
```

We can use Multibaas to query it via the SDK:

```typescript
const getMilestoneData = useCallback(
  async (contractAddress: string): Promise<string[] | null> => {
    try {
      const result = await callContractFunction(
        'getMilestones',
        contractAddress,
        eventImplementationContractLabel
      );
      return result as string[];
    } catch (err) {
      console.error('Error getting player hp:', err);
      return null;
    }
  },
  [callContractFunction, eventImplementationContractLabel]
);
```

### Contract Write Operations

**Purpose**: Allow us to execute write transactions to any deployed contract by specifying the function name, arguments, and sender address without manually encoding data

#### Example Usage: Listing NFTs to marketplace

```typescript
const payload: MultiBaas.PostMethodArgs = {
  args: [listing.nftAddress, listing.tokenId, listing.price],
  from: account.address,
};

const resp = await contractsApi.callContractFunction(
  chain,
  deployedAddressOrAlias,
  contractLabel,
  'listBeast',
  payload
);
```

#### Example Usage: Buying an NFT from marketplace

```typescript
const payload: MultiBaas.PostMethodArgs = {
  args: [listingId],
  from: account.address,
  value: totalAmount.toString(),
};

const resp = await contractsApi.callContractFunction(
  chain,
  deployedAddressOrAlias,
  contractLabel,
  'buyBeast',
  payload
);
```

### Event Queries API

**Purpose**: Allow us to query emitted events with powerful filters and custom logic, replacing the need to manually scan on-chain logs or maintain separate indexers

For example, after calling `getActiveBeastListings`, we fetch matching events for those listings:

```typescript
const response = await contractsApi.callContractFunction(
  chain,
  deployedAddressOrAlias,
  contractLabel,
  'getActiveBeastListings',
  payload
);
const activeListingId: any = response.data.result;
console.log('Function call result:\n', activeListingId.output);

const response2 = await eventQueriesApi.executeArbitraryEventQuery(
  requestBody,
  0,
  50
);
const activeListing: any = response2.data.result;
```

#### Benefits:

- Custom filtering logic (e.g., by wallet, timestamp, event params)
- Combines with contract calls to enrich frontend UX

### Event Indexing

**Purpose**: Used to monitor and expose blockchain events via Events API, for querying or displaying on the frontend, without requiring backend-side actions.

#### Examples:

- Displaying event details (eventId, name, location):

```typescript
const getOrganisedEvents = useCallback(
  async (pageNum: number = 1, limit: number = 20): Promise<Array<Event>> => {
    const eventSignature =
      'EventCreated(uint256,address,address,string,string,string,string,uint256,uint256,uint256)';
    const response = await eventsApi.listEvents(
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      chain,
      eventFactoryAddressLabel,
      eventFactoryContractLabel,
      eventSignature,
      limit,
      (pageNum - 1) * limit
    );
    return response.data.result;
  },
  [eventsApi, chain, eventFactoryAddressLabel, eventFactoryContractLabel]
);
```

### Webhook Triggers

**Purpose**: Used for reacting to specific events in real-time, where backend logic needs to execute immediately upon event emission.

In our project, the primary webhook use case is the `EventCreated` event emitted by the `EventFactory` contract. When this fires, a webhook is triggered that:

1. Receives the deployed event contract address
2. Save the event details into `Supabase`.
3. Calls the `addressApi` to link the new contract to a readable alias
4. Calls the `contractsApi` to associate the alias with the implementation ABI
5. From this point, the new event contract is fully indexed and queryable

[Github Repo for Webhook](https://github.com/SohZHong/mystic-kaizer-express)

#### Example Implementation:

```typescript
if (event.event.name === 'EventCreated') {
  const inputs = event.event.inputs;

  // Extract necessary fields
  const eventId = inputs.find(
    (input: EventField) => input.name === 'eventId'
  )?.value;
  const organizer = inputs.find(
    (input: EventField) => input.name === 'organizer'
  )?.value;
  const eventContract = inputs.find(
    (input: EventField) => input.name === 'eventContract'
  )?.value;
  const name = inputs.find((input: EventField) => input.name === 'name')?.value;
  const description = inputs.find(
    (input: EventField) => input.name === 'description'
  )?.value;
  const location = inputs.find(
    (input: EventField) => input.name === 'location'
  )?.value;
  const participantLimit = inputs.find(
    (input: EventField) => input.name === 'participantLimit'
  )?.value;
  const startDate = inputs.find(
    (input: EventField) => input.name === 'startDate'
  )?.value;
  const rewardCount = inputs.find(
    (input: EventField) => input.name === 'rewardCount'
  )?.value;

  // Save to Supabase
  const { data, error } = await supabase.from('events').insert([
    {
      event_id: eventId,
      organizer,
      address: eventContract,
      name,
      description,
      location,
      participant_limit: Number(participantLimit),
      reward_count: Number(rewardCount),
      start_date: new Date(startDate * 1000).toISOString(),
    },
  ]);

  if (error) {
    console.error('Error inserting into Supabase:', error);
    throw error;
  } else {
    console.log('Successfully saved event:', data);
  }

  // Create an alias for the new address
  const alias = `eventimplementation${eventId}`;
  await addressApi.setAddress('ethereum', {
    alias,
    address: eventContract,
  });

  // Link to multibaas
  await contractsApi.linkAddressContract('ethereum', alias, {
    label: `eventimplementation1`,
    startingBlock: 'latest',
  });
}
```

This enables dynamic on-chain deployments (like new events) to be tracked without pre-registering them.

## Multibaas Setup and Testing Instructions

This section will guide you through the process of setting up and testing Multibaas with event tracking. The setup process involves deploying contracts, setting up a webhook server, and using the Multibaas SDK to manage and link event contracts.

### Prerequisites

Ensure that you have the following installed:

- [Node.js](https://nodejs.org/) (v20 or above)
- [Docker](https://www.docker.com/get-started) (for containerized services)
- Multibaas SDK
- Webhook server (e.g., Express.js)

### Setup Steps

#### 1. Deploy Event Implementation and Event Factory

The first step in setting up your system is to deploy the event implementation and event factory contracts.

- **Event Implementation**: This contract defines the logic of an event. It contains the business logic and manages the event’s state.
- **Event Factory**: This contract is used to deploy new events and manage them at a higher level.

You can deploy them by navigating to `packages/hardhat` directory and run this in the CLI:

```bash
npx hardhat ignition deploy ignition/modules/EventModule.ts --reset --network alfajores --verify
```

After deploying both contracts, verify their deployment on the blockchain and make a note of their addresses.

![Deployed and verified contracts](/images/deployed-contracts.png)

#### 2. Add Implementation as an Interface in Multibaas

Now, you’ll need to connect the Event Implementation contract to Multibaas by adding it as an interface.

1.  In your Multibaas cosole, navigate to the **Library** page under **Contracts** section.
2.  Click on the **"+"** button on the top left, click on **"Link Contract"**.
3.  Then, click on **"Contract from Address"** and input the event implementation contract's address into the field.
4.  Click on **"Search"**, there should be an option to select the contract Multibaas found, select **"Implementation Contract"** and click **"Continue"**.
5.  Input your preferred label and version and click **"Continue"**.
6.  You're done. This step allows Multibaas to recognize the contract’s methods and interact with it on-chain.

#### 3. Track Events from Event Factory Through Address

Next, you need to track the events emitted by the Event Factory contract. Multibaas will listen for specific events and process them accordingly.

1.  In your Multibaas cosole, navigate to the **On-Chain** page under **Contracts** section.
2.  Click on the **"+"** button on the top left, click on **"Link Contract"**.
3.  Then, click on **"Contract from Address"** and input the event factory contract's address into the field.
4.  Click on **"Search"**, there should be an option to select the contract Multibaas found, click **"Continue"**.
5.  Input your preferred label and version and click **"Continue"**.

This ensures that any new event created by the Event Factory will trigger an event in Multibaas, allowing you to process the information.

#### 4. Write a Webhook Server to Listen for Events

Now that Multibaas is tracking the events, you need to write a server that listens for the "EventCreated" webhook. This webhook will be triggered whenever a new event is created by the Event Factory.

1. Set up an Express.js (or other suitable framework) server.
2. The server should listen for POST requests to a route like /webhook.
3. On receiving the webhook, extract the necessary data (e.g., event contract address, event ID).

Example Webhook Server (Express.js With Typescript):

```typescript
import express, { Request, Response } from 'express';
import { ContractsApi, AddressesApi } from '@curvegrid/multibaas-sdk';

const app = express();

// Initialize Multibaas APIs
const contractsApi = new ContractsApi(mbConfig);
const addressApi = new AddressesApi(mbConfig);

// Webhook Receiver
app.post('/webhook', async (req: Request, res: Response) => {
  const eventList = req.body;
  try {
    for (var i = 0; i < eventList.length; i++) {
      const event: Event = eventList[i].data;

      if (event.event.name === 'EventCreated') {
        const inputs = event.event.inputs;

        // Extract necessary fields
        const eventId = inputs.find(
          (input: EventField) => input.name === 'eventId'
        )?.value;
        const organizer = inputs.find(
          (input: EventField) => input.name === 'organizer'
        )?.value;
        const eventContract = inputs.find(
          (input: EventField) => input.name === 'eventContract'
        )?.value;
        const name = inputs.find(
          (input: EventField) => input.name === 'name'
        )?.value;
        const description = inputs.find(
          (input: EventField) => input.name === 'description'
        )?.value;
        const location = inputs.find(
          (input: EventField) => input.name === 'location'
        )?.value;
        const participantLimit = inputs.find(
          (input: EventField) => input.name === 'participantLimit'
        )?.value;
        const startDate = inputs.find(
          (input: EventField) => input.name === 'startDate'
        )?.value;
        const rewardCount = inputs.find(
          (input: EventField) => input.name === 'rewardCount'
        )?.value;

        // Create an alias for the new address
        const alias = 'YOUR_ALIAS';
        await addressApi.setAddress('ethereum', {
          alias,
          address: eventContract,
        });

        // Link to multibaas
        await contractsApi.linkAddressContract('ethereum', alias, {
          label: ' <YOUR_CONTRACT_LABEL>',
          startingBlock: 'latest',
        });
      }
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

After receiving the webhook, the webhook will link the newly deployed child contract (i.e., the event) to an alias using the Address API from the Multibaas SDK:

1. Extract the contract address from the webhook payload.
2. Use the `addressApi.setAddress` method to link the contract to an alias on the Ethereum network.

This alias will serve as a reference to the newly created event contract.

Finally, after linking the address to an alias, the webhook use the Contracts API to link the address to a contract. This allows Multibaas to track and sync events from the new event contract.

1. Use the `contractsApi.linkAddressContract` method.
2. Specify the contract label (e.g., EventCreated) and the starting block (e.g., `latest`).
3. This ensures that Multibaas can now track the events from this newly linked contract.

#### 5. Testing

To test the entire setup, follow these steps:

1. Deploy the event factory and event implementation contracts as described above.
2. Trigger an event by creating a new event through the Event Factory contract.
3. Check if the webhook is received by your server.
4. Verify that the event contract is linked correctly in Multibaas and that the event is synced properly.

## Experience with Multibaas

### Feedback

#### More SDK Documentation Needed

The SDK would benefit greatly from expanded documentation. Specifically:

- Mapping between SDK methods and API endpoints (e.g., what `contractsApi.linkAddressToContract` corresponds to in the UI).
- Sample code snippets to demonstrate common SDK workflows.

#### Guidance for Factory-Spawned Contracts

Clearer documentation or tutorials on how to handle child contracts created from factory contracts — including best practices for dynamically linking and syncing them in MultiBaas.

#### Sample Integration Code

Having a GitHub repo or official examples showing how to integrate MultiBaas SDK (e.g., for address aliasing, event indexing, webhook processing) would significantly improve the developer experience.

### Challenges

#### WebSocket Setup & Debugging

- Initial difficulty setting up the webhook listener, as the structure of the response body wasn’t clearly documented. Required trial-and-error and extensive logging to decode payload structure.

#### Understanding Event Payloads

Had to manually inspect and parse the response from the Events API to extract useful fields (e.g., `eventContract` from EventCreated, `battleId` from Attack, etc.).

#### Dynamic Linking of Deployed Contracts

Learned that dynamically linking newly deployed contracts via the SDK requires:

1. Adding the contract as an interface under the **Library** section.
2. Assigning the deployed address an alias using `addressApi`.
3. Linking the address to a known contract definition using `contractsApi`.

#### Insufficient Documentation on Linking Steps

The documentation did not fully clarify the required order or prerequisites for linking child contracts deployed through factories, which led to confusion until clarification was received from Curvegrid support.

#### Role & Permission Setup

Navigating user roles and avoiding accidental exposure of sensitive access (e.g., Admin API keys). Required multiple permission tweaks to separate read-only from write operations securely.

#### WebSocket Delivery Timing

Webhook payloads sometimes arrived before the contract was fully linked and indexed, which required adding a delay or retry logic in the backend.

#### Lack of SDK Documentation

While the MultiBaas SDK is powerful, it lacks comprehensive documentation. Specifically, there’s no clear mapping between the SDK functions and the MultiBaas Web UI or API endpoints. This made it difficult to discover the correct methods (e.g., `contractsApi.linkAddressToContract`, `addressApi.createAddressAlias`) without trial and error or support intervention.

#### Inconsistent eventType Field in SDK vs Webhook Response

The eventType field in the WebhookEvent type from the SDK did not match the actual value received in live webhook responses. This mismatch caused unexpected errors until logging and debugging revealed the discrepancy.

Expected Response as Shown by SDK:
![SDK Interface](/images/multibaas-sdk.png)

Actual Response Received:
![Actual Response](/images/actual-received.png)

#### Support via Multiple Channels

Had to reach out via both live support chat and in-person at Curvegrid’s booth for some critical clarifications, highlighting gaps in async documentation.

### Wins

#### Clear Separation of Read vs Write Flows

Originally used MultiBaas exclusively for read-only operations and event indexing, with Thirdweb Engine handling write transactions. As the project matured, MultiBaas was extended to handle specific write operations (e.g., marketplace listing), allowing for greater flexibility and better contract-level control.

#### Powerful Event Indexing & Querying

Used MultiBaas to track emitted events like `EventCreated`, `Attack`, `ParticipantRegistered`. Additionally, leveraged Arbitrary Event Queries API to dynamically query and filter indexed event logs.

#### Scalable Webhook Architecture

Built a generalized webhook handler that listens to emitted events and automatically syncs data into Supabase with dynamic routing logic.

#### Integration with Supabase

Seamlessly connected MultiBaas webhooks to Supabase writes, enabling low-latency event-based logging for actions like battle logs, participant tracking, and marketplace listings.

#### Built a Robust Backend Flow

Created a full pipeline: from contract deployment → event detection → webhook delivery → backend processing → data persistence. This is done all using MultiBaas’s interface and SDK.

#### Enhanced Developer Understanding

The challenges helped deepen understanding of contract aliasing, event decoding, permission modeling, and SDK integration workflows.

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.
