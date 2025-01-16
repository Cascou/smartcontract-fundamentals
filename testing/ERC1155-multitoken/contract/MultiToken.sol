// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract MultiToken is ERC1155 {
    uint256 private constant ONE = 0;
    uint256 private constant TWO = 1;
    uint256 private constant THREE = 2;
    uint256 private constant FOUR = 3;
    uint256 private constant FIVE = 4;
    uint256 private constant SIX = 5;
    uint256 private constant SEVEN = 6;

    constructor()
        ERC1155("ipfs://QmPx7j5QpjK2T2iTLebbir72u2eY3aT6mYpN2Sn9zuuz2y/{id}")
    {}

    function burn(address from, uint256 tokenId, uint256 amount) external {
        _burn(from, tokenId, amount);
    }

    function mint(address to, uint256 tokenId, uint256 amount) external {
        _mint(to, tokenId, amount, "");
    }

    function uri(uint256 tokenId) public pure override returns (string memory) {
        require(tokenId < 7, "tokenID doesn't exist");
        return
            string(
                abi.encodePacked(
                    "ipfs://QmPx7j5QpjK2T2iTLebbir72u2eY3aT6mYpN2Sn9zuuz2y/",
                    Strings.toString(tokenId)
                )
            );
    }
}
