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
  mapping(address => mapping(uint256 => bool)) public hasMinted;

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

  function registerParticipant() external {
    require(!isParticipant[msg.sender], 'Already registered');
    require(
      eventData.participantLimit == 0 ||
        eventData.registeredParticipants < eventData.participantLimit,
      'Participant limit reached'
    );
    isParticipant[msg.sender] = true;
    eventData.registeredParticipants++;

    emit ParticipantRegistered(msg.sender);
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
    require(eventData.registeredParticipants > 0, 'No participants registered');

    // Loop through all possible milestones to allow sequential minting
    for (
      uint256 rewardIndex = 0;
      rewardIndex < eventData.rewardCount;
      rewardIndex++
    ) {
      // Check if the participant has reached the milestone and hasn't minted for it yet
      if (
        scanCount[msg.sender] >= milestoneMap[rewardIndex] &&
        !hasMinted[msg.sender][rewardIndex]
      ) {
        // Ensure rewardIndex is a valid number
        require(
          rewardIndex >= 0 && rewardIndex < eventData.rewardCount,
          'Invalid reward index'
        );

        // Mint the NFT for this milestone
        string memory metadataCID = string(
          abi.encodePacked(eventData.baseUri, uint2str(rewardIndex), '.json')
        );

        // Mint the NFT and set the URI
        _safeMint(msg.sender, rewardIndex);
        _setTokenURI(rewardIndex, metadataCID);

        // Mark the milestone as minted for this participant
        hasMinted[msg.sender][rewardIndex] = true;

        // Emit the minting event
        emit NFTMinted(msg.sender, rewardIndex, metadataCID);

        // Stop the loop once the participant has minted the reward
        break;
      }
    }
  }

  // Helper function to convert uint to string
  function uint2str(
    uint256 _i
  ) internal pure returns (string memory _uintAsString) {
    if (_i == 0) {
      return '0';
    }
    uint256 j = _i;
    uint256 len;
    while (j != 0) {
      len++;
      j /= 10;
    }
    bytes memory bstr = new bytes(len);
    uint256 k = len - 1;
    while (_i != 0) {
      bstr[k--] = bytes1(uint8(48 + (_i % 10)));
      _i /= 10;
    }
    return string(bstr);
  }

  // Function to retrieve all the milestone values for a participant
  function getMilestones() external view returns (uint256[] memory) {
    uint256 rewardCount = eventData.rewardCount;
    uint256[] memory milestones = new uint256[](rewardCount);

    for (uint256 i = 1; i <= rewardCount; i++) {
      milestones[i - 1] = milestoneMap[i];
    }

    return milestones;
  }
}
