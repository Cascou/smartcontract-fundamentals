//----------------------------------------------------------------------------
//Importing Libraries
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { StringContract } from "./../typechain-types";


//----------------------------------------------------------------------------
//Head of StringContract
describe("StringContract", function () {

    //--------------------------------------------------------------------------
    //Declaring Global Variables
    let stringContract: StringContract;
    let owner: any;

    //--------------------------------------------------------------------------
    //Deploying Contract before each test.
    beforeEach(async function () {
        const signers = await hre.ethers.getSigners();
        owner = signers[0];
        stringContract = await hre.ethers.deployContract("StringContract") as StringContract;
    });

    //TEST CASES:
    //Case 1: charAt("abcdef", 2) should return 0x6300
    //Case 2: charAt("", 0) should return 0x0000
    //Case 3: charAt("george", 10) should return 0x0000
    //--------------------------------------------------------------------------
    //All tests pertaining to: charAt
    describe("charAt", async function (){
    it("Case 1, should return 0x6300", async function(){
      const result = await stringContract.connect(owner).charAt("abcdef", "2");
      expect(result).to.be.equal("0x6300"); // Compare with the expected name
    });

    it("Case 2, should return 0x0000", async function(){
        const result = await stringContract.connect(owner).charAt("", "0");
        expect(result).to.be.equal("0x0000"); // Compare with the expected name
    });
    it("Case 3, should return 0x0000", async function(){
        const result = await stringContract.connect(owner).charAt("george", "10");
        expect(result).to.be.equal("0x0000"); // Compare with the expected name
    });
  });


})