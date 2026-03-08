// SPDX-License-Identifier: MIT
pragma solidity ^^.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GlitchNFT
 * @dev ERC-721 contract for minting glitch art NFTs on Base
 */
contract GlitchNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping from tokenId to creator address
    mapping(uint256 => address) public creators;

    // Events for indexing
    event GlitchArtMinted(
        address indexed creator,
        uint256 indexed tokenId,
        string tokenURI
    );

    constructor(
        address initialOwner
    ) ERC721("Glitch Art Studio", "GLITCH") Ownable(initialOwner) {}

    /**
     * @dev Mint a new glitch art NFT
     * @param to Address to mint the NFT to
     * @param uri IPFS or HTTP metadata URI
     * @return tokenId The ID of the minted token
     */
    function safeMint(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        creators[tokenId] = msg.sender;

        emit GlitchArtMinted(msg.sender, tokenId, uri);

        return tokenId;
    }

    /**
     * @dev Mint multiple NFTs at once (gas efficient for batches)
     * @param to Address to mint NFTs to
     * @param uris Array of metadata URIs
     */
    function batchMint(address to, string[] memory uris) public {
        for (uint256 i = 0; i < uris.length; i++) {
            safeMint(to, uris[i]);
        }
    }

    /**
     * @dev Get total supply of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Get token IDs owned by an address
     * @param owner Address to query
     * @return tokenIds Array of token IDs
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        uint256 index = 0;

        for (uint256 i = 0; i < _tokenIdCounter.current(); i++) {
            if (ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }

        return tokenIds;
    }

    // Overrides required by Solidity
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
