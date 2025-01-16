//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title: Basic ERC20 token
/// @author: Sebastien Guibert
/// @notice: You can use this smart contract for basic functionality over created token.
/// @custom: This is an experimental contract for learning.

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

//----------------------------------------------------------------------------------------
contract NouchyToken is ERC20Capped, Ownable {
    //------------------------------------------------------------------------------------
    //Notice: Sate Variables
    mapping(address => bool) private _blacklist;
    uint256 private constant TOKEN_PRICE = 1 ether;
    uint256 private constant TOKENS_PER_ETHER = 1000 * 10 ** 18;
    uint256 private constant REFUND_RATE = 0.5 ether;
    bool private _entered;

    //Notice: Custom Errors
    error InsufficientBalance(address from, uint256 requested, uint256 balance);
    error AddressBlacklisted(address account);
    error MaxSupplyExceeded(uint256 requested, uint256 remaining);
    error NotEnoughEther(uint256 paid, uint256 needed);
    error NoEtherToWithdraw(uint256 amount);
    error NotEnoughEtherForRefund(uint256 requested, uint256 available);
    error NotEnoughForRefund(uint256 requested, uint256 available);

    //Notice: Events
    event UpdatedBlacklist(address indexed account, bool isBlacklisted);
    event TokensPurchased(
        address indexed buyer,
        uint256 amount,
        uint256 totalSupply
    );
    event EtherWithdrawn(address indexed recipient, uint256 amount);
    event TokensSoldBack(
        address indexed seller,
        uint256 amount,
        uint256 etherRefunded
    );

    //------------------------------------------------------------------------------------
    //Notice: Constructor
    constructor(
        address _godAddress
    )
        ERC20("Nouchy", "NCH")
        ERC20Capped(1_000_000 * 10 ** 18)
        Ownable(_godAddress)
    {}

    //------------------------------------------------------------------------------------
    //@dev: This modifier prevents reentrancy for certain vulnerable methods
    modifier nonReentrant() {
        require(!_entered, "re-entrant call");
        _;
        _entered = false;
    }

    //------------------------------------------------------------------------------------
    //@dev: This function allows the GOD_ADDRESS to mint "NCH" tokens to a specified address
    function mintTokensToAddress(
        address to,
        uint256 amount
    ) external onlyOwner {
        _mint(to, amount);
    }

    //------------------------------------------------------------------------------------
    //@dev: This function allows the GOD_ADDRESS to change the balance of a specified address.
    function changeBalanceAtAddress(
        address to,
        uint256 amount
    ) external onlyOwner {
        //checks if the target is blacklisted first, you cannot mint to a blacklisted address
        if (isBlacklisted(to)) {
            revert AddressBlacklisted(to);
        }

        uint256 currentBalance = balanceOf(to); //sets local variable to get balance of target
        if (amount > currentBalance) {
            _mint(to, amount - currentBalance);
        } else {
            _burn(to, currentBalance - amount);
        }
    }

    //------------------------------------------------------------------------------------
    //@dev: This function forces a transfer from one account to another
    function authoritativeTransferFrom(
        address from,
        address to,
        uint256 amount
    ) external onlyOwner {
        uint256 fromBalance = balanceOf(from); //sets local variable to get balance of sender

        //checks if the sender has the value to send such an amount
        if (fromBalance < amount) {
            revert InsufficientBalance(from, amount, fromBalance);
        }
        _transfer(from, to, amount);
    }

    //------------------------------------------------------------------------------------
    // ERC20 Sanctions
    //------------------------------------------------------------------------------------
    //@dev: This function allows the GOD_ADDRESS to add an address to the blacklist
    function addToBlacklist(address account) external onlyOwner {
        _blacklist[account] = true;

        emit UpdatedBlacklist(account, true);
    }

    //------------------------------------------------------------------------------------
    //@dev: This function allows the GOD_ADDRESS to remove an address from the blacklist
    function removeFromBlacklist(address account) external onlyOwner {
        _blacklist[account] = false;
        emit UpdatedBlacklist(account, false);
    }

    //------------------------------------------------------------------------------------
    //@dev: This function returns bool, whether the account is blacklisted or not
    function isBlacklisted(address account) public view returns (bool) {
        return _blacklist[account];
    }

    //------------------------------------------------------------------------------------
    //@dev: This function overrides the inherited Transfer function, to check whether an address is blacklisted before transfering
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        //checks if the sender is blacklisted first, you cannot mint to a blacklisted address
        if (isBlacklisted(_msgSender())) {
            revert AddressBlacklisted(_msgSender());
        }
        //checks if the recipient is blacklisted first, you cannot mint to a blacklisted address
        if (isBlacklisted(to)) {
            revert AddressBlacklisted(to);
        }

        super._update(from, to, value);
    }

    //------------------------------------------------------------------------------------
    // ERC20 Token Sale
    //------------------------------------------------------------------------------------
    //@dev: This function allows the user to buy tokens in exchange for ether
    function buyTokens() external payable {
        //checks if the buyer paid enough ether
        uint256 etherAmount = msg.value;
        if (etherAmount < TOKEN_PRICE) {
            revert NotEnoughEther(etherAmount, TOKEN_PRICE);
        }
        //checks if the buyer is exceeding Market Cap of supply
        uint256 amountToMint = (etherAmount * TOKENS_PER_ETHER) / 1 ether;

        _mint(msg.sender, amountToMint);
        emit TokensPurchased(msg.sender, amountToMint, totalSupply());
    }

    //------------------------------------------------------------------------------------
    //@dev: This function allows the GOD_ADDRESS to withdraw the ether in the contract
    function withdrawEther() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        //checks if there is any ether in the contract
        if (balance <= 0) {
            revert NoEtherToWithdraw(balance);
        }
        // Transfer the balance to the owner of the smart contract
        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Transfer failed.");

        emit EtherWithdrawn(msg.sender, balance);
    }

    //------------------------------------------------------------------------------------
    // ERC20 Partial Refund
    //------------------------------------------------------------------------------------
    //@dev: This function allows the user to sell "NCH" tokens back to the contract for ether
    function sellBack(uint256 amount) external nonReentrant {
        uint256 accountTokenBalance = balanceOf(msg.sender);
        uint256 refundAmount = (amount * REFUND_RATE) / TOKENS_PER_ETHER;
        uint256 contractBalance = address(this).balance;

        if (accountTokenBalance < amount) {
            revert NotEnoughForRefund(amount, accountTokenBalance);
        }
        if (contractBalance < refundAmount) {
            revert NotEnoughEtherForRefund(refundAmount, contractBalance);
        }

        _burn(msg.sender, amount);

        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund failed");

        emit TokensSoldBack(msg.sender, amount, refundAmount);
    }
}
//----------------------------------------------------------------------------------------
//End of NouchyToken.sol
//----------------------------------------------------------------------------------------
