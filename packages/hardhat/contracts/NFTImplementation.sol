// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";


contract NFTCollection is ERC721URIStorageUpgradeable, Ownable2StepUpgradeable {
    string private _baseTokenURI;
    uint256 private _nextTokenId;

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
        uint256 tokenId = _nextTokenId++;

        uint256 requiredMilestone = _milestones[tokenId];

        require(requiredMilestone > 0, "Milestone is not set for the NFT");
        require(_userMilestone[_recipient] >= requiredMilestone, "User has not meet the milestone");
        _safeMint(_recipient, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(_baseTokenURI, _metadataCID, ".json")));

        emit NFTMinted(_recipient, tokenId, _metadataCID);
    }
}