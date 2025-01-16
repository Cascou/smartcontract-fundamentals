//----------------------------------------------------------------------------
//Importing Libraries
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { NouchyToken } from "./../typechain-types";

//----------------------------------------------------------------------------
//Head of Nouchy Token
describe("NouchyToken", function () {

  //--------------------------------------------------------------------------
  //Declaring Global Variables
  let nouchyContract: NouchyToken;
  let owner: any;
  let otherAccount: any;

  //--------------------------------------------------------------------------
  //Deploying Contract before each test.
  beforeEach(async function () {
    const signers = await hre.ethers.getSigners();
    owner = signers[0];
    otherAccount = signers[1];
    nouchyContract = await hre.ethers.deployContract("NouchyToken", [owner.address]) as NouchyToken;
  });
  
  //--------------------------------------------------------------------------
  //All tests pertaining to: Constructor
  describe("Constructor", async function (){
    it("The owner should be the parameter", async function(){
      const txOwner = await nouchyContract.owner(); // Access the name() function from ERC20
      expect(txOwner).to.be.equal(owner.address); // Compare with the expected name
    });

    it("Should have the correct token name", async function(){
      const txName = await nouchyContract.name(); // Access the name() function from ERC20
      expect(txName).to.be.equal("Nouchy"); // Compare with the expected name
    });

    it("Should have the correct token symbol", async function(){
      const txSymbol = await nouchyContract.symbol(); // Access the name() function from ERC20
      expect(txSymbol).to.be.equal("NCH"); // Compare with the expected name
    });

    it("Should have the correct token total supply", async function(){
      const txSupplyCap = await nouchyContract.cap(); // Access the name() function from ERC20
      expect(txSupplyCap).to.be.equal(1_000_000n * 10n ** 18n); // Compare with the expected name
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: mintTokensToAddress
  describe("mintTokensToAddress", async function(){
    it("Should revert if a non-owner tries to mint tokens", async function(){
        const mintAmount = 1_000n * 10n ** 18n;

        await expect(
          nouchyContract.connect(otherAccount).mintTokensToAddress(otherAccount.address, mintAmount)
        ).to.be.revertedWithCustomError(nouchyContract, "OwnableUnauthorizedAccount");
    });

    it("Should revert if owner tries to mint more than token cap", async function(){
      const mintAmount = 1_000_001n * 10n ** 18n;

      await expect(
        nouchyContract.connect(owner).mintTokensToAddress(owner.address, mintAmount)
      ).to.be.revertedWithCustomError(nouchyContract, "ERC20ExceededCap");
    });

    it("Should increase the total supply by the minted amount", async function(){
      const mintAmount = 1_000n * 10n **18n;
      const initialSupply = await nouchyContract.totalSupply();
      await nouchyContract.connect(owner).mintTokensToAddress(owner.address, mintAmount);
      const finalSupply = await nouchyContract.totalSupply();
      await expect(finalSupply).to.be.equal( initialSupply+ mintAmount);
    });

    it("Should successfully mint tokens to correct address", async function(){
      const mintAmount = 1_000n * 10n ** 18n;

      await nouchyContract.connect(owner).mintTokensToAddress(owner.address, mintAmount);
      const ownerBalance = await nouchyContract.balanceOf(owner.address);

      await expect(ownerBalance).to.be.equal(mintAmount);
    });

    it("Should emit transfer event when mint is successful", async function(){
      const mintAmount = 1_000n * 10n ** 18n;
      //emit Transfer(from, to, value);
      await expect(
        nouchyContract.connect(owner).mintTokensToAddress(owner.address, mintAmount)
      ).to.emit(nouchyContract, "Transfer")
      .withArgs("0x0000000000000000000000000000000000000000", owner.address, mintAmount);
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: changeBalanceAtAddress
  describe("changeBalanceAtAddress", async function(){
    it("Should revert if a non-owner tries to change balance at address", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;

      await expect(
        nouchyContract.connect(otherAccount).changeBalanceAtAddress(otherAccount.address, tokenAmount)
      ).to.be.revertedWithCustomError(nouchyContract, "OwnableUnauthorizedAccount");
    });

    it("Should revert if recipient is blacklisted", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;
      await nouchyContract.connect(owner).addToBlacklist(otherAccount);

      await expect(
        nouchyContract.connect(owner).changeBalanceAtAddress(otherAccount.address, tokenAmount)
      ).to.be.revertedWithCustomError(nouchyContract, "AddressBlacklisted");
    });

    it("Should mint if the requested amount is more than balance", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;
      const recipientBalanceBefore = await nouchyContract.balanceOf(otherAccount.address);

      await nouchyContract.connect(owner).changeBalanceAtAddress(otherAccount.address, tokenAmount);
      const recipientBalanceAfter = await nouchyContract.balanceOf(otherAccount.address);
      
      expect(recipientBalanceAfter).to.be.equal(recipientBalanceBefore + tokenAmount);     
    });

    it("Should burn if the requested amount is less than balance", async function(){
      const balanceAmount = 9_000n * 10n ** 18n;
      await nouchyContract.connect(owner).mintTokensToAddress(otherAccount.address, balanceAmount);

      const tokenAmount = 1_000n * 10n ** 18n;
      const recipientBalanceBefore = await nouchyContract.balanceOf(otherAccount.address);
      await nouchyContract.connect(owner).changeBalanceAtAddress(otherAccount.address, tokenAmount);

      const burnAmount = balanceAmount - tokenAmount;
      const recipientBalanceAfter = await nouchyContract.balanceOf(otherAccount.address);

      expect(recipientBalanceAfter).to.be.equal(recipientBalanceBefore - burnAmount);
    });

    it("Should emit transfer event when change balance is successful", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;
      
      await expect(
        nouchyContract.connect(owner).changeBalanceAtAddress(otherAccount.address, tokenAmount)
      ).to.emit(nouchyContract, "Transfer")
      .withArgs("0x0000000000000000000000000000000000000000", otherAccount.address, tokenAmount);
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: authoritativeTransferFrom
  describe("authoritativeTransferFrom", async function(){
    it("Should revert if a non-owner tries to do an authoritative transfer", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;

      await expect(
        nouchyContract.connect(otherAccount).authoritativeTransferFrom(otherAccount.address, owner.address, tokenAmount)
      ).to.be.revertedWithCustomError(nouchyContract, "OwnableUnauthorizedAccount");
    });

    it("Should revert if transfer from doesn't have enough amount to send", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;

      await expect(
        nouchyContract.connect(owner).authoritativeTransferFrom(owner.address, otherAccount.address, tokenAmount)
      ).to.be.revertedWithCustomError(nouchyContract, "InsufficientBalance");
    });

    it("Should transfer amount from sender", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;
      await nouchyContract.connect(owner).mintTokensToAddress(owner.address, tokenAmount);
      const senderBalanceBefore = await nouchyContract.balanceOf(owner.address);
      await nouchyContract.connect(owner).authoritativeTransferFrom(owner.address, otherAccount.address, tokenAmount);
      const senderBalanceAfter = await nouchyContract.balanceOf(owner.address);

      expect(senderBalanceAfter).to.be.equal(senderBalanceBefore - tokenAmount);
    });

    it("Should transfer amount to recipient", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;
      await nouchyContract.connect(owner).mintTokensToAddress(owner.address, tokenAmount);

      const recipientBalanceBefore = await nouchyContract.balanceOf(otherAccount.address);
      await nouchyContract.connect(owner).authoritativeTransferFrom(owner.address, otherAccount.address, tokenAmount);
      const recipientBalanceAfter = await nouchyContract.balanceOf(otherAccount.address);

      expect(recipientBalanceAfter).to.be.equal(recipientBalanceBefore + tokenAmount);
    });

    it("Should emit transfer event when authoritative transfer is successful", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;
      await nouchyContract.connect(owner).mintTokensToAddress(owner.address, tokenAmount);
      
      await expect(
        nouchyContract.connect(owner).authoritativeTransferFrom(owner.address, otherAccount.address, tokenAmount)
      ).to.emit(nouchyContract, "Transfer")
      .withArgs(owner.address, otherAccount.address, tokenAmount);
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: addToBlacklist
  describe("addToBlacklist", async function(){
    it("Should revert if a non-owner tries to add account to blacklist", async function(){
      await expect(
        nouchyContract.connect(otherAccount).addToBlacklist(owner.address)
      ).to.be.revertedWithCustomError(nouchyContract, "OwnableUnauthorizedAccount");
    });

    it("Blacklist mapping should not be equal to false, when added", async function (){
      const boolValue = false;
      await nouchyContract.connect(owner).addToBlacklist(otherAccount.address);
      const accountStatus = await nouchyContract.isBlacklisted(otherAccount.address);
      expect(accountStatus).to.not.be.equal(boolValue);
    });

    it("Should emit UpdatedBlacklist event when account is added to blacklist", async function(){
      await expect(
        nouchyContract.connect(owner).addToBlacklist(otherAccount.address)
      ).to.emit(nouchyContract, "UpdatedBlacklist")
      .withArgs(otherAccount.address, true);
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: removeFromBlacklist
  describe("removeFromBlacklist", async function(){
    it("Should revert if a non-owner tries to remove account from blacklist", async function(){
      await expect(
        nouchyContract.connect(otherAccount).removeFromBlacklist(owner.address)
      ).to.be.revertedWithCustomError(nouchyContract, "OwnableUnauthorizedAccount");
    });

    it("Blacklist mapping should not be equal to true, when removed", async function (){
      await nouchyContract.connect(owner).addToBlacklist(otherAccount.address);
      const boolValue = true;
      await nouchyContract.connect(owner).removeFromBlacklist(otherAccount.address);
      const accountStatus = await nouchyContract.isBlacklisted(otherAccount.address);
      expect(accountStatus).to.not.be.equal(boolValue);
    });

    it("Should emit UpdatedBlacklist event when account is removed from blacklist", async function(){
      await nouchyContract.connect(owner).addToBlacklist(otherAccount.address);
      
      await expect(
        nouchyContract.connect(owner).removeFromBlacklist(otherAccount.address)
      ).to.emit(nouchyContract, "UpdatedBlacklist")
      .withArgs(otherAccount.address, false);
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: _update
  describe("_update", async function (){
    it("checks if user that is sending is blacklisted", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;
      await nouchyContract.connect(owner).mintTokensToAddress(owner.address, tokenAmount);
      await nouchyContract.connect(owner).addToBlacklist(owner.address);
      
      await expect(
        nouchyContract.connect(owner).authoritativeTransferFrom(owner.address, otherAccount.address, tokenAmount)
      ).to.revertedWithCustomError(nouchyContract, "AddressBlacklisted");
    });

    it("checks if user that is recieving is blacklisted", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;
      await nouchyContract.connect(owner).mintTokensToAddress(owner.address, tokenAmount);
      await nouchyContract.connect(owner).addToBlacklist(otherAccount.address);
      
      await expect(
        nouchyContract.connect(owner).authoritativeTransferFrom(owner.address, otherAccount.address, tokenAmount)
      ).to.revertedWithCustomError(nouchyContract, "AddressBlacklisted");
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: buyTokens
  describe("buyTokens", async function (){
    it("Should be reverted if user hasn't paid 1 ether to buy tokens", async function(){
      await expect(
        nouchyContract.connect(otherAccount).buyTokens({
          value: ethers.parseEther("0.5")
        })
      ).to.be.revertedWithCustomError(nouchyContract, "NotEnoughEther");
    });

    it("User should get paid tokens after paying 1 ether", async function(){
      const recipientBalanceBefore = await nouchyContract.balanceOf(otherAccount);
      
      const txBuyToken = await nouchyContract.connect(otherAccount).buyTokens({
        value: ethers.parseEther("1.0")
      });

      const recipientBalanceAfter = await nouchyContract.balanceOf(otherAccount);

      expect(recipientBalanceAfter).to.be.equal(recipientBalanceBefore + (txBuyToken.value * (1000n * 10n ** 18n)/ethers.parseEther("1.0")));
    });

    it("Should emit TokensPurchased event when buyToken is successful", async function(){
      const totalSupply = await nouchyContract.totalSupply();
      const purchaseValue = ethers.parseEther("1.0");
      const expectedTokens = purchaseValue * (1000n * 10n ** 18n)/ethers.parseEther("1.0")
      
      await expect(
        nouchyContract.connect(otherAccount).buyTokens({
          value: ethers.parseEther("1.0")
        })
      ).to.emit(nouchyContract, "TokensPurchased")
      .withArgs(otherAccount.address, expectedTokens, totalSupply + expectedTokens);
    });


  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: withdrawEther
  describe("withdrawEther", async function (){
    it("Should revert if a non-owner tries to withdraw ether", async function(){
      await expect(
        nouchyContract.connect(otherAccount).withdrawEther()
      ).to.be.revertedWithCustomError(nouchyContract, "OwnableUnauthorizedAccount");
    });

    it("Should revert if contract balance has nothing to withdraw", async function () {
      await expect(
        nouchyContract.connect(owner).withdrawEther())
        .to.be.revertedWithCustomError(nouchyContract, "NoEtherToWithdraw");
    });

    it("Should withdraw ether successful to owners account", async function(){
      const payment = ethers.parseEther("1.0");
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      

      await nouchyContract.connect(otherAccount).buyTokens({
        value: payment });
      await nouchyContract.connect(owner).withdrawEther();
            
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      
      expect(BigInt(ownerBalanceAfter - ownerBalanceBefore)).to.be.closeTo(
        BigInt(payment),
        BigInt(ethers.parseEther("0.001"))
      );
    });
    
    it("Should emit a Etherwithdrawn event when withdrawn correctly", async function(){
      const contractBalance = await ethers.provider.getBalance(nouchyContract.getAddress());
      await nouchyContract.connect(owner).buyTokens({
        value: ethers.parseEther("1.0")});
      expect(
        await nouchyContract.connect(owner).withdrawEther()
      ).to.emit(nouchyContract, "EtherWithdrawn")
      .withArgs(owner.address, contractBalance)
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: sellBack
  describe("sellBack", async function (){
    it("Should revert if token balance isn't high enough for requested amount", async function(){
      const sellAmount = 1_000n * 10n ** 18n;
      await expect(
        nouchyContract.connect(owner).sellBack(sellAmount)
      ).to.be.revertedWithCustomError(nouchyContract, "NotEnoughForRefund");
    });

    it("Should revert if contract doesn't have enough ether for refund", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;
      await nouchyContract.connect(owner).mintTokensToAddress(owner.address, tokenAmount);

      await expect(
        nouchyContract.connect(owner).sellBack(tokenAmount)
      ).to.be.revertedWithCustomError(nouchyContract, "NotEnoughEtherForRefund");
    });

    it("Should sellback ether successful to users account", async function(){
      const tokenAmount = 1_000n * 10n ** 18n;
      const tokenPricePerEther = 1_000n * 10n ** 18n;

      //first need to deposit ether in contract address
      await nouchyContract.connect(otherAccount).buyTokens({
        value: ethers.parseEther("1.0") });

      await nouchyContract.connect(owner).mintTokensToAddress(owner.address, tokenAmount);
  
      const ownerEthBalanceBefore = await ethers.provider.getBalance(owner.address);

      await nouchyContract.connect(owner).sellBack(tokenAmount);
 
      const ownerEthBalanceAfter = await ethers.provider.getBalance(owner.address);
     
      const refundCalculation = tokenAmount * ethers.parseEther("0.5")/ tokenPricePerEther;
      
      expect(BigInt(ownerEthBalanceAfter - ownerEthBalanceBefore)).to.be.closeTo(
        BigInt(refundCalculation),
        BigInt(ethers.parseEther("0.001"))
      );
    });

    it("Should emit TokenSoldBack event when sell back is successful", async function (){
      const tokenAmount = 1_000n * 10n ** 18n;
      const tokenPricePerEther = 1_000n * 10n ** 18n;
      const refundCalculation = tokenAmount * ethers.parseEther("0.5")/ tokenPricePerEther;

      //first need to deposit ether in contract address
      await nouchyContract.connect(owner).buyTokens({
        value: ethers.parseEther("1.0") });

      await expect(
        nouchyContract.connect(owner).sellBack(tokenAmount)
      ).to.emit(nouchyContract, "TokensSoldBack")
      .withArgs(owner.address, tokenAmount, refundCalculation)
    });   
  });
});