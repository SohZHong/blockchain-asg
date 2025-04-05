// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';
import '@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol';

contract EventImplementation is
  Initializable,
  ERC721URIStorageUpgradeable,
  Ownable2StepUpgradeable
{
  struct EventData {
    string name;
    string description;
    string location;
    uint256 participantLimit;
    uint256 registeredParticipants;
    uint256 startDate;
    uint256 rewardCount;
    string baseUri;
  }

  uint256 private _nextTokenId;

  bool public eventStarted;

  EventData public eventData;

  mapping(address => uint256) public scanCount;
  mapping(uint256 => uint256) public milestoneMap;
  mapping(address => bool) public isParticipant;

  event EventStarted(uint256 participantCount, uint256 rewardCount);
  event ParticipantRegistered(address indexed participant);
  event ScanRecorded(
    address indexed participant,
    address scannedPerson,
    uint256 newScanCount
  );
  event NFTMinted(
    address indexed recipient,
    uint256 tokenId,
    string metadataCID
  );

  function initialize(
    address creator,
    EventData calldata _eventData
  ) public initializer {
    __Ownable2Step_init();
    __ERC721_init(_eventData.name, 'MYK');
    _transferOwnership(creator);

    eventData = _eventData;
  }

  function registerParticipant(address participant) external onlyOwner {
    require(!isParticipant[participant], 'Already registered');
    require(
      eventData.participantLimit == 0 ||
        eventData.registeredParticipants < eventData.participantLimit,
      'Participant limit reached'
    );
    isParticipant[participant] = true;
    eventData.registeredParticipants++;

    emit ParticipantRegistered(participant);
  }

  function startEvent() external onlyOwner {
    require(!eventStarted, 'Event already started');
    require(eventData.registeredParticipants > 0, 'No participants registered');
    require(eventData.rewardCount > 0, 'Invalid reward count');

    eventStarted = true;

    for (uint256 i = 1; i <= eventData.rewardCount; i++) {
      uint256 milestone = (eventData.registeredParticipants * i) /
        eventData.rewardCount;
      milestoneMap[i] = milestone;
    }

    emit EventStarted(eventData.registeredParticipants, eventData.rewardCount);
  }

  function recordScan(address scannedPerson) external {
    require(eventStarted, 'Event has not started');
    require(isParticipant[scannedPerson], 'Not a registered participant');
    require(isParticipant[msg.sender], 'You have not registered');

    scanCount[msg.sender]++;
    emit ScanRecorded(msg.sender, scannedPerson, scanCount[msg.sender]);
  }

  function mintNFT() external {
    require(eventStarted, 'Event has not started');
    require(_nextTokenId < eventData.rewardCount, 'All rewards minted');

    uint256 rewardIndex = _nextTokenId + 1; // Reward milestones start from 1
    require(
      scanCount[msg.sender] >= milestoneMap[rewardIndex],
      'Milestone not reached'
    );

    string memory metadataCID = string(
      abi.encodePacked(eventData.baseUri, rewardIndex, '.json')
    );

    _safeMint(msg.sender, rewardIndex);
    _setTokenURI(rewardIndex, metadataCID);

    _nextTokenId++;
    emit NFTMinted(msg.sender, rewardIndex, metadataCID);
  }

  function getMilestones() external view returns (uint256[] memory) {
    uint256 rewardCount = eventData.rewardCount;
    uint256[] memory milestones = new uint256[](rewardCount);

    for (uint256 i = 1; i <= rewardCount; i++) {
      milestones[i - 1] = milestoneMap[i];
    }

    return milestones;
  }
}
