//SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract NouchyToken is Initializable, ERC20Upgradeable {

    constructor(){
        _disableInitializers();
    }
    
    function initialize() external initializer {
        __ERC20_init("Nouchy", "NCH");
        _mint(msg.sender, 10000 * (10 ** 18));
    }
}
