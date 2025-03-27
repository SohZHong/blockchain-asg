// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol';

contract OrganizerToken is ERC721, ERC721Burnable, Ownable {
  uint256 private _nextTokenId;
  string private _baseTokenURI;

  mapping(address => bool) public hasToken;

  event OrganizerMinted(address indexed organizer, uint256 tokenId);
  event OrganizerBurned(address indexed organizer, uint256 tokenId);

  constructor(
    string memory baseURI
  ) ERC721('Event Organizer Token', 'EOT') Ownable(msg.sender) {
    _baseTokenURI = baseURI;
  }

  function mint(address to) external onlyOwner {
    require(!hasToken[to], 'Already an organizer');

    uint256 tokenId = _nextTokenId++;
    _safeMint(to, tokenId);
    hasToken[to] = true;

    emit OrganizerMinted(to, tokenId);
  }

  function burn(uint256 tokenId) public override onlyOwner {
    address owner = ownerOf(tokenId);
    _burn(tokenId);
    hasToken[owner] = false;
    emit OrganizerBurned(owner, tokenId);
  }

  function tokenURI(
    uint256 tokenId
  ) public view override returns (string memory) {
    require(_ownerOf(tokenId) != address(0), 'Token does not exist');
    return string(abi.encodePacked(_baseTokenURI, '0.json')); // Always return the same JSON file
  }

  function _update(
    address to,
    uint256 tokenId,
    address auth
  ) internal override returns (address) {
    address from = _ownerOf(tokenId);
    require(
      from == address(0) || to == address(0),
      'Soulbound: Transfers are disabled'
    );
    return super._update(to, tokenId, auth);
  }
}
