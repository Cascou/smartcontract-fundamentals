//SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// @dev: implementation of Staking contract that inherits IERC721Receiver
contract NouchyExchange is Initializable, IERC721Receiver {
    IERC721 private nouchyNFT;
    IERC20 private nouchyToken;
    uint256 private constant REWARD_RATE = 10 * (10 ** 18);
    uint256 private constant STAKING_DURATION = 1 days;
    mapping(uint256 => Stake) public stakes;
    mapping(address => uint256) public tokenRewards;

    struct Stake {
        address owner;
        uint256 stakedAt;
    }

    constructor(){
        _disableInitializers();
    }
    
    function initialize(IERC721 _nouchyNFT, IERC20 _nouchyToken) external initializer{
        nouchyNFT = _nouchyNFT;
        nouchyToken = _nouchyToken;
    }

    function onERC721Received(
        address /*operator*/,
        address from,
        uint256 tokenId,
        bytes calldata /*data*/
    ) external override returns (bytes4) {
        require(msg.sender == address(nouchyNFT), "Incorrect Caller");
        stakes[tokenId] = Stake({owner: from, stakedAt: block.timestamp});
        return IERC721Receiver.onERC721Received.selector;
    }

    function rewardCalculator(uint256 tokenId) internal returns (uint256) {
        uint256 stakedDuration = block.timestamp - stakes[tokenId].stakedAt;
        uint256 rewardAmount = (stakedDuration / STAKING_DURATION) *
            REWARD_RATE;

        if (rewardAmount > 0) {
            tokenRewards[msg.sender] += rewardAmount;
        }

        return tokenRewards[msg.sender];
    }

    function withdrawNFT(uint256 tokenId) external {
        uint256 myRewards = rewardCalculator(tokenId);
        tokenRewards[msg.sender] = myRewards;
        delete stakes[tokenId];
        nouchyNFT.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function claimRewards(uint256 tokenId) external {
        require(
            nouchyNFT.ownerOf(tokenId) == msg.sender,
            "Caller is not the owner"
        );

        uint256 myRewards = rewardCalculator(tokenId);
        require(myRewards > 0, "No rewards to claim");
        require(
            nouchyToken.balanceOf(address(this)) >= myRewards,
            "Not enough tokens in the contract"
        );

        tokenRewards[msg.sender] = 0;
        stakes[tokenId].stakedAt = block.timestamp;
        nouchyToken.transfer(msg.sender, myRewards);
    }

    function balanceOfContract() external view returns (uint256) {
        return nouchyToken.balanceOf(address(this));
    }

    function fundContract(uint256 amount) external {
        nouchyToken.transferFrom(msg.sender, address(this), amount);
    }
}
