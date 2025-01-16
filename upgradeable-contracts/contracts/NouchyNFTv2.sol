//SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// @dev: implementation of NFT contract that inherits ERC721
contract NouchyNFTv2 is Initializable, ERC721Upgradeable, OwnableUpgradeable {
    IERC20 private tokenAddress;
    uint256 public tokenSupply;
    uint256 private constant MAX_TOKEN_SUPPLY = 10;
    uint256 private constant NFT_MINT_RATE = 100 * (10 ** 18);

    constructor(){
        _disableInitializers();
    }
    
    function initialize(address _tokenAddress) external initializer{
        __ERC721_init("NOUCHY", "NYFT");
        __Ownable_init(msg.sender);
        tokenAddress = IERC20(_tokenAddress);
        tokenSupply = 0;
    }

    function mint() external {
        require(tokenSupply < MAX_TOKEN_SUPPLY, "max supply reached");

        tokenAddress.transferFrom(msg.sender, address(this), NFT_MINT_RATE);
        _mint(msg.sender, tokenSupply);
        tokenSupply++;
    }

    function withdraw() external onlyOwner {
        tokenAddress.transfer(
            msg.sender,
            tokenAddress.balanceOf(address(this))
        );
        payable(msg.sender).transfer(address(this).balance);
    }

    function godTransfer(address from, address to, uint256 tokenId) external onlyOwner{
        require(ownerOf(tokenId) == msg.sender, "From address isn't owner of token");
        safeTransferFrom(from, to, tokenId);
    }
}
