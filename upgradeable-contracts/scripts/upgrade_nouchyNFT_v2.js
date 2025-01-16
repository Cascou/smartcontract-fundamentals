const {ethers, upgrades} = require("hardhat");

const PROXY = "0x983320373089537CF4B240FbF29E6b0b47db3A63";

async function main(){
    const NouchyNFTv2 = await ethers.getContractFactory("NouchyNFTv2");
    await upgrades.upgradeProxy(PROXY, NouchyNFTv2);
    console.log("NFT upgraded.");
}

main();

//new implementation: https://holesky.etherscan.io/address/0x318806EDC3E491F336042C233D0B46199425446C