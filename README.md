<!-- TITLE -->
<p align="center">
  <img width="100px" src="https://github.com/celo-org/celo-composer/blob/main/images/readme/celo_isotype.svg" align="center" alt="Celo" />
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
    <li><a href="#multibaas-setup-and-testing-instructions">Multibaas Setup and Testing Instructions</a></li>
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

## Built With

- [Celo](https://celo.org/)
- [Multibaas](https://docs.curvegrid.com/multibaas)
- [Solidity](https://docs.soliditylang.org/en/v0.8.19/)
- [Hardhat](https://hardhat.org/)
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

MultiBaas serves as the read-layer integration for the project, acting as the intermediary for indexing contract events and handling selected real-time triggers. All contracts are deployed and verified via **Hardhat**, and then linked within the MultiBaas UI and SDK. The platform is not used for any write operations as all writes are handled separately (e.g., via Thirdweb Engine and signed session keys).

Main Usages are:

- Contract Read Operations through SDK
- Frontend development with CORS origins
- Event indexing
- Webhook

This project involves the following smart contracts:

- Marketplace: Handles listings and offers
- MatchManager: Controls the battle system
- OrganizerToken: Verifies permission to create events
- EventFactory: Deploys event contracts
- Event (implementation): The template for all deployed event contracts

### Contract Read Operations

**Purpose**: Use MultiBaas to call view/pure contract functions through the SDK without needing to instantiate a full Web3 provider.

These read operations are useful for fetching on-chain state in a simple, reliable, and gasless way.

#### Example Usage: Reading Milestones

If the contract has a function like this:

```solidity
  function getMilestones() external view returns (uint256[] memory) {
    uint256 rewardCount = eventData.rewardCount;
    uint256[] memory milestones = new uint256[](rewardCount);

    for (uint256 i = 1; i <= rewardCount; i++) {
      milestones[i - 1] = milestoneMap[i];
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
• Node.js (v20 or above)
• Docker (for containerized services)
• Multibaas SDK
• Webhook server (e.g., Express.js)

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

### Challenges

### Wins

## License

Distributed under the MIT License. See `LICENSE.txt` for more information.
