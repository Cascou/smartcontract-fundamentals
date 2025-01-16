// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./MultiToken.sol";

contract MultiTokenForger {
    MultiToken private immutable multitoken;
    uint256 private constant LOCK_DURATION = 5 seconds;
    uint256 private unlockTime;

    constructor(address _multitoken){
        multitoken = MultiToken(_multitoken);
        
    }

    function mintToken(uint256 tokenId) external{
        require(tokenId < 7, "Token ID doesn't exist");
        if(tokenId >= 0 && tokenId <=2){
            require(block.timestamp >= unlockTime, "Minute Cooldown still active");
            multitoken.mint(msg.sender, tokenId, 1);
            unlockTime = block.timestamp + LOCK_DURATION;
        }
        if(tokenId == 3){
            multitoken.burn(msg.sender, 0,1);//burns token 0
            multitoken.burn(msg.sender, 1,1);//burns token 1
            multitoken.mint(msg.sender, tokenId, 1);
        }
        if(tokenId == 4){
            multitoken.burn(msg.sender, 1,1);//burns token 1
            multitoken.burn(msg.sender, 2,1);//burns token 2
            multitoken.mint(msg.sender, tokenId, 1);
        }
        if(tokenId == 5){
            multitoken.burn(msg.sender, 0,1);//burns token 0
            multitoken.burn(msg.sender, 2,1);//burns token 2
            multitoken.mint(msg.sender, tokenId, 1);
        }
        if(tokenId == 6){
            multitoken.burn(msg.sender, 0,1);//burns token 0
            multitoken.burn(msg.sender, 1,1);//burns token 1
            multitoken.burn(msg.sender, 2,1);//burns token 2
            multitoken.mint(msg.sender, tokenId, 1);
        }
    }

    function burnToken(uint256 tokenId) external{
        require(tokenId >= 3 && tokenId <= 6, "Only 3 to 6 can be burned");
        multitoken.burn(msg.sender, tokenId, 1);       
    }

    function tradeToken(uint256 fromToken, uint256 toToken) external{
        require(fromToken >= 0 && fromToken <= 2 && toToken >= 0 && toToken <= 2 && fromToken != toToken, "Incorrect parameters");
        multitoken.burn(msg.sender, fromToken, 1);
        multitoken.mint(msg.sender, toToken, 1);     
    }
}