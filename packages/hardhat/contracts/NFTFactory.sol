// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "contracts/NFTImplementation.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";

contract NFTFactory is Initializable, Ownable2StepUpgradeable {

    address implementation;

    // Mapping of index to NFT contract address
    mapping(address => mapping(uint256 => address)) private nfts;
    
    event NFTCollectionCreated(
        address indexed owner, address clone
    );

    function initialize(address _implementation) public initializer {
        __Ownable2Step_init();
        bytes32 slot = getImplementationSlot();
        assembly {
            sstore(slot, _implementation)
        }
    }

    function setImplementation(address _implementation) external onlyOwner {
        bytes32 slot = getImplementationSlot();

        assembly {
            sstore(slot, _implementation)
        }
    }

    function createNFTCollection(
        string calldata _name,
        string calldata _symbol,
        string calldata _baseURI,
        uint256[] calldata _milestones,
        address creator
    ) external returns (address nft) {
        nft = ClonesUpgradeable.clone(implementation);
        // NftImplementation(nft).initialize(_name, _symbol, _baseURI, _milestones, creator);
        (bool success, ) = nft.call(
            abi.encodeWithSignature("initialize(string,string,string,uint256[],address)", _name, _symbol, _baseURI, _milestones, creator)
        );
        require(success, "Initialization failed");
        emit NFTCollectionCreated(
            msg.sender, nft
        );
    }

    // Pick ERC-1967 Storage Slots at random to prevent collision
    function getImplementationSlot() internal pure returns (bytes32) {
        return bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);
    }

    // calculate the milestones based on the amount of participants
    function getMilestones (uint256 participants, uint256 milestoneAmount) internal pure returns (uint256[] memory) {
        uint256 [] memory milestones = new uint256[](milestoneAmount);
        for (uint256 i = 1; i < milestoneAmount + 1; i++) {
            milestones[i] = participants/milestoneAmount * i;
        }
        return milestones;
    }
}