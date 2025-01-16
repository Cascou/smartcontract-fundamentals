const {ethers, upgrades} = require('hardhat');
async function main() {
    const NouchyToken = await ethers.getContractFactory("NouchyToken");

    const nouchyToken = await upgrades.deployProxy(NouchyToken, {
        initializer: "initialize",
    });

    await nouchyToken.deployed();

    console.log("Nouchy Token Deployed to: ", nouchyToken.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

//implementation contract: https://holesky.etherscan.io/address/0xBa6f653f7790b79F207f427Fcb5fac11f1699fbC#readContract
//proxy contract: https://holesky.etherscan.io/address/0x1C6AE17942a441de57f7E04EB03704e2706aF521
//proxy admin: https://holesky.etherscan.io/address/0x8a9b0D94b30683fcF02d7fB288F545F53DD64701