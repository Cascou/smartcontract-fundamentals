//----------------------------------------------------------------------------
//Importing Libraries
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { MultiTokenForger, MultiToken } from "./../typechain-types";

//----------------------------------------------------------------------------
//Head of Nouchy Token
describe("MultiTokenForger", function () {
  //--------------------------------------------------------------------------
  //Declaring Global Variables
  let MultiTokenForgerContract: MultiTokenForger;
  let MultiTokenContract: MultiToken;
  let owner: any;
  let otherAccount: any;
  let multiTokenContractAdress: String;

  //--------------------------------------------------------------------------
  //Deploying Contract before each test.
  beforeEach(async function () {
    const signers = await hre.ethers.getSigners();
    owner = signers[0];
    otherAccount = signers[1];
    MultiTokenContract = (await hre.ethers.deployContract(
      "MultiToken",
    )) as MultiToken;
    multiTokenContractAdress = await MultiTokenContract.getAddress();
    MultiTokenForgerContract = (await hre.ethers.deployContract(
      "MultiTokenForger",
      [multiTokenContractAdress],
    )) as MultiTokenForger;
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: Constructor
  describe("Constructor", async function () {
    it("The multitoken address should be the parameter", async function () {
      const fetchAddress = await MultiTokenContract.getAddress();

      expect(fetchAddress).to.be.equal(multiTokenContractAdress);
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: MintToken
  describe("MintToken", async function () {
    it("Should revert if tokenId is greater than 6", async function () {
      await expect(MultiTokenForgerContract.mintToken(7n)).to.be.revertedWith(
        "Token ID doesn't exist",
      );
    });

    it("Should revert if user has minted tokenId 0-2 more than once within a minute", async function () {
      await MultiTokenForgerContract.mintToken(0n);

      await expect(MultiTokenForgerContract.mintToken(0n)).to.be.revertedWith(
        "Minute Cooldown still active",
      );
    });

    it("Should be successful in minting tokenId 0-2 more than once if not within a minute", async function () {
      const mintedAmount = 1n;
      await MultiTokenForgerContract.connect(owner).mintToken(0n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        0n,
      );
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        0n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore + mintedAmount);
    });

    it("Should be successful in minting tokenId 3", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(1n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        3n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(3n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        3n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore + mintedAmount);
    });

    it("Should be successful in burning one tokenid 0 to mint tokenId 3", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(1n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        0n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(3n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        0n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore - mintedAmount);
    });

    it("Should be successful in burning one tokenid 1 to mint tokenId 3", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(1n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        1n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(3n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        1n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore - mintedAmount);
    });

    it("Should be successful in minting tokenId 4", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(1n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(2n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        4n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(4n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        4n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore + mintedAmount);
    });

    it("Should be successful in burning one tokenid 1 to mint tokenId 4", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(1n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(2n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        1n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(4n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        1n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore - mintedAmount);
    });

    it("Should be successful in burning one tokenid 2 to mint tokenId 4", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(1n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(2n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        2n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(4n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        2n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore - mintedAmount);
    });

    it("Should be successful in minting tokenId 5", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(2n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        5n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(5n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        5n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore + mintedAmount);
    });

    it("Should be successful in burning one tokenid 0 to mint tokenId 5", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(2n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        0n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(5n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        0n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore - mintedAmount);
    });

    it("Should be successful in burning one tokenid 2 to mint tokenId 5", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(2n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        2n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(5n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        2n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore - mintedAmount);
    });

    it("Should be successful in minting tokenId 6", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(1n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(2n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        6n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(6n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        6n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore + mintedAmount);
    });

    it("Should be successful in burning one tokenid 0 to mint tokenId 6", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(1n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(2n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        0n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(6n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        0n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore - mintedAmount);
    });

    it("Should be successful in burning one tokenid 1 to mint tokenId 6", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(1n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(2n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        1n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(6n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        1n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore - mintedAmount);
    });

    it("Should be successful in burning one tokenid 2 to mint tokenId 6", async function () {
      const mintedAmount = 1n;

      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(1n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(2n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        2n,
      );
      await MultiTokenForgerContract.connect(owner).mintToken(6n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        2n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore - mintedAmount);
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: burntoken
  describe("burnToken", async function () {
    it("Should revert if token Id is less than 3", async function () {
      await expect(MultiTokenForgerContract.burnToken(2)).to.be.revertedWith(
        "Only 3 to 6 can be burned",
      );
    });

    it("Should revert if token Id is more than 6", async function () {
      await expect(MultiTokenForgerContract.burnToken(7)).to.be.revertedWith(
        "Only 3 to 6 can be burned",
      );
    });

    it("Should burn a token successfuly", async function () {
      const mintedAmount = 1n;
      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      await hre.network.provider.send("evm_increaseTime", [5001]);
      await hre.network.provider.send("evm_mine");
      await MultiTokenForgerContract.connect(owner).mintToken(1n);
      await MultiTokenForgerContract.connect(owner).mintToken(3n);

      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        3n,
      );
      await MultiTokenForgerContract.connect(owner).burnToken(3n);
      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        3n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore - mintedAmount);
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: tradeToken
  describe("tradeToken", async function () {
    it("Should revert if from token is more than 2", async function () {
      await expect(
        MultiTokenForgerContract.tradeToken(3n, 2n),
      ).to.be.revertedWith("Incorrect parameters");
    });

    it("Should revert if to token is more than 2", async function () {
      await expect(
        MultiTokenForgerContract.tradeToken(2n, 3n),
      ).to.be.revertedWith("Incorrect parameters");
    });

    it("Should trade tokens successfully", async function () {
      const mintedAmount = 1n;
      await MultiTokenForgerContract.connect(owner).mintToken(0n);
      const ownerBalanceBefore = await MultiTokenContract.balanceOf(
        owner.address,
        1n,
      );

      await MultiTokenForgerContract.connect(owner).tradeToken(0n, 1n);

      const ownerBalanceAfter = await MultiTokenContract.balanceOf(
        owner.address,
        1n,
      );

      expect(ownerBalanceAfter).to.be.equal(ownerBalanceBefore + mintedAmount);
    });
  });
});
