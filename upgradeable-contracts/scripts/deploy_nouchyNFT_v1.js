const {ethers, upgrades} = require('hardhat');
async function main() {
    const NouchyNFT = await ethers.getContractFactory("NouchyNFT");
    //this is proxy token contract address
    const nouchyNFT = await upgrades.deployProxy(NouchyNFT, ['0x1C6AE17942a441de57f7E04EB03704e2706aF521'], {
        initializer: "initialize",
    });

    await nouchyNFT.deployed();

    console.log("Nouchy Token Deployed to: ", nouchyNFT.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

//implementation contract: https://holesky.etherscan.io/address/0xcb2C8810D3EC448677bD1C533Cf8BD1800A0cE82
//proxy contract: https://holesky.etherscan.io/address/0x983320373089537CF4B240FbF29E6b0b47db3A63
//proxy admin: https://holesky.etherscan.io/address/0x11Fec9A1563b30C5e318Ba8291bcd40afdDB7d9A