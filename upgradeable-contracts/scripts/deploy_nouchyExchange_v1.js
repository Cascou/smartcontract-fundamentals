const {ethers, upgrades} = require('hardhat');
async function main() {
    const NouchyExchange = await ethers.getContractFactory("NouchyExchange");
    //this is proxy contract address (NFT, TOKEN)
    const nouchyExchange = await upgrades.deployProxy(NouchyExchange, ['0x983320373089537CF4B240FbF29E6b0b47db3A63','0x1C6AE17942a441de57f7E04EB03704e2706aF521'], {
        initializer: "initialize",
    });

    //await nouchyExchange.deployed();

    console.log("Nouchy Token Deployed to: ", nouchyExchange.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

//implementation contract: https://holesky.etherscan.io/address/0xc775276174031c0Fa060AD63e1a885b0E448a6C8
//proxy contract: https://holesky.etherscan.io/address/0x1581Af4305B54745B0d21e03bcF9edB1f1aF4127
//proxy admin: https://holesky.etherscan.io/address/0x278da91593D41a8Ec3646c19c09Bcd0fC14e454C