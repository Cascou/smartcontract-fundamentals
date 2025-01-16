//----------------------------------------------------------------------------
//Importing Libraries
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { MultiToken } from "./../typechain-types";

//----------------------------------------------------------------------------
//Head of MultiToken
describe("MultiToken", function () {
  //--------------------------------------------------------------------------
  //Declaring Global Variables
  let multiTokenContract: MultiToken;
  let owner: any;
  let otherAccount: any;

  //--------------------------------------------------------------------------
  //Deploying Contract before each test.
  beforeEach(async function () {
    const signers = await hre.ethers.getSigners();
    owner = signers[0];
    otherAccount = signers[1];
    multiTokenContract = (await hre.ethers.deployContract(
      "MultiToken",
    )) as MultiToken;
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: burn
  describe("burn", async function () {
    it("Should burn the token(id) from a given address", async function () {
      const amountBurned = 1n;

      await multiTokenContract.connect(owner).mint(owner.address, 0n, 1n);
      const balanceOfTokenIdBefore = await multiTokenContract.balanceOf(
        owner.address,
        0n,
      );

      await multiTokenContract
        .connect(owner)
        .burn(owner.address, 0n, amountBurned);

      const balanceOfTokenIdAfter = await multiTokenContract.balanceOf(
        owner.address,
        0n,
      );

      expect(balanceOfTokenIdAfter).to.be.equal(
        balanceOfTokenIdBefore - amountBurned,
      );
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: mint
  describe("mint", async function () {
    it("Should mint the token(id) from a given address", async function () {
      const amountMinted = 1n;

      const balanceBeforeMint = await multiTokenContract.balanceOf(
        owner.address,
        0n,
      );
      await multiTokenContract
        .connect(owner)
        .mint(owner.address, 0n, amountMinted);
      const balanceAfterMint = await multiTokenContract.balanceOf(
        owner.address,
        0n,
      );

      expect(balanceAfterMint).to.be.equal(balanceBeforeMint + amountMinted);
    });
  });

  //--------------------------------------------------------------------------
  //All tests pertaining to: uri
  describe("uri", async function () {
    it("Should be reverted with error, if token Id >= 7", async function () {
      await expect(multiTokenContract.uri(7)).to.be.revertedWith(
        "tokenID doesn't exist",
      );
    });
    it("Should return ipfs string if tokenId<7 && > 0", async function () {
      const ipfsString =
        "ipfs://QmPx7j5QpjK2T2iTLebbir72u2eY3aT6mYpN2Sn9zuuz2y/";
      const tokenId = 4;

      const resultString = await multiTokenContract.uri(tokenId);

      expect(resultString).to.be.equal(ipfsString + tokenId.toString());
    });
  });
});
