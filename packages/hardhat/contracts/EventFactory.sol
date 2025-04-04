// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import './EventImplementation.sol';
import '@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

contract EventFactory is Initializable, Ownable2StepUpgradeable {
  address public implementation;
  IERC721 public organizerToken;

  mapping(uint256 => address) public events;
  uint256 private nextEventId;

  event EventCreated(
    uint256 indexed eventId,
    address indexed organizer,
    address indexed eventContract,
    string name,
    string description,
    string location,
    string baseUri,
    uint256 participantLimit,
    uint256 startDate,
    uint256 rewardCount
  );

  modifier onlyRegisteredOrganizer() {
    require(organizerToken.balanceOf(msg.sender) > 0, 'Not an organizer');
    _;
  }

  function initialize(
    address _implementation,
    address _organizerToken
  ) public initializer {
    __Ownable2Step_init();
    implementation = _implementation;
    bytes32 slot = getImplementationSlot();
    assembly {
      sstore(slot, _implementation)
    }
    organizerToken = IERC721(_organizerToken);
  }

  function setImplementation(address _implementation) external onlyOwner {
    implementation = _implementation;
    bytes32 slot = getImplementationSlot();

    assembly {
      sstore(slot, _implementation)
    }
  }

  // Pick ERC-1967 Storage Slots at random to prevent collision
  function getImplementationSlot() internal pure returns (bytes32) {
    return bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1);
  }

  function getStoredImplementation() external view returns (address impl) {
    bytes32 slot = getImplementationSlot();
    assembly {
      impl := sload(slot)
    }
  }

  function createEvent(
    string memory _name,
    string memory _description,
    string memory _location,
    uint256 _participantLimit,
    uint256 _startDate,
    uint256 _rewardCount,
    string memory _baseUri
  ) external onlyRegisteredOrganizer returns (address eventContract) {
    eventContract = ClonesUpgradeable.clone(implementation);
    // Create an EventData struct instance
    EventImplementation.EventData memory eventData = EventImplementation
      .EventData(
        _name,
        _description,
        _location,
        _participantLimit,
        0,
        _startDate,
        _rewardCount,
        _baseUri
      );

    EventImplementation(eventContract).initialize(msg.sender, eventData);

    events[nextEventId] = eventContract;

    emit EventCreated(
      nextEventId,
      msg.sender,
      eventContract,
      _name,
      _description,
      _location,
      _baseUri,
      _participantLimit,
      _startDate,
      _rewardCount
    );
    nextEventId++;
  }
}
