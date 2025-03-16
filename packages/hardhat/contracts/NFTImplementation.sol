// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";


contract NFTCollection is Initializable, ERC721URIStorageUpgradeable, Ownable2StepUpgradeable {

    string private _baseTokenURI;
    // Tracks the next available token ID for minting
    uint256 private _nextTokenId;
    // Tracks the next available milestone index for minting
    uint256 private _nextMilestoneIndex;
    // Total amount of milestones set for the event
    uint256 private totalMilestones;

    // Mapping to track user milestones progress
    mapping(address => uint256) public _userMilestone;
    
    // the token id is mapped to their required milestones
    mapping(uint256 => uint256) public _milestones;

    event NFTMinted(address indexed recipient, uint256 tokenId, string metadataCID);
    event MilestoneUpdated(address indexed participant, uint256 milestoneValue);

    function initialize(
        string calldata name, 
        string calldata symbol, 
        string calldata baseURI, 
        uint256[] calldata milestones,
        address creator
    ) public initializer {
        __Ownable2Step_init();
        __ERC721_init(name, symbol);
        _transferOwnership(creator);
        
        _baseTokenURI = baseURI;
        for (uint256 i = 0; i < milestones.length; i++){
            _milestones[i+1] = milestones[i];
        }

        totalMilestones = milestones.length;

        // Initialize the next milestone index
        _nextMilestoneIndex = 1;

        _safeMint(creator, 0);
        _setTokenURI(0, baseURI);
    }

    //function to track user scan count
    function getUserMilestone(address participantAddress) external view returns (uint256){
        return _userMilestone[participantAddress];
    }

    // trigger the function every time they scan
    function updateUserMilestone(address _participantAddress) external onlyOwner {
        _userMilestone[_participantAddress] += 1;
        emit MilestoneUpdated(_participantAddress, _userMilestone[_participantAddress]);
    }

    function mintNFT(address _recipient, string memory _metadataCID) public onlyOwner {
        // Ensure there are still milestones available for minting
        require(_nextMilestoneIndex <= totalMilestones, "All milestones have been minted");

        uint256 requiredMilestone = _milestones[_nextMilestoneIndex];

        // Check if the user has achieved the required milestone
        require(_userMilestone[_recipient] >= requiredMilestone, "User has not met the milestone");

        uint256 tokenId = _nextTokenId++;
        _safeMint(_recipient, tokenId);

        _setTokenURI(tokenId, string(abi.encodePacked(_baseTokenURI, _metadataCID, ".json")));
        _nextMilestoneIndex++;

        emit NFTMinted(_recipient, tokenId, _metadataCID, _nextMilestoneIndex);
    }
}