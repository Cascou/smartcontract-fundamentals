// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
// OpenZeppelin Contracts (last updated v5.0.0)
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Multicall} from "@openzeppelin/contracts/utils/Multicall.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import {BitMaps} from "@openzeppelin/contracts/utils/structs/BitMaps.sol";

contract AdvancedNFT is ERC721 {
    //Main Global Variables
    bytes32 private immutable root;
    uint256 public constant MAX_NFT = 100;
    uint256 public totalSupply = 0;
    uint256 public tokenCount = 0;
    uint8 private constant MAX_REVEAL_BLOCKS = 10;
    uint256 public constant MINT_PRICE = 0.006 ether;
    uint public creationTime = block.timestamp;

    //NFT minted Matrix
    mapping(uint256 => uint256) private mintedNFT;

    //To not allow Minting Abuse
    uint256 private constant COOLDOWN_PERIOD =  5 minutes;
    mapping(address => uint256) public lastMintTime;

    //To set owner for restricted calls
    address private owner;

    //To setup owner withdrawals to contributors
    mapping(address => uint256) public contributorBalances;

    //To handle Presale Whitelist
    BitMaps.BitMap private _airdropList;
    mapping(address => bool) public claimed;
    
    struct Commit{
        bytes32 commit;
        uint64 block;
        bool revealed;
    }
    mapping(address=> Commit) public commits;
    enum Stages{
        Presale,
        PublicSale,
        SoldOut
    }
    Stages public stage = Stages.Presale;
    
    error FunctionInvalidAtThisStage();
    event CommitHash(address sender, bytes32 dataHash, uint64 block);
    event Reveal(address sender, bytes32 revealHash, uint256 random);

    /**
      * @dev Modifier that takes a parameter of enum 'Stages', only allows users to call that method during that stage in the contract lifecycle
      * Reverts with an {FunctionInvalidAtThisStage} error.
      */
    modifier atStage(Stages _stage){
        if(stage != _stage){
            revert FunctionInvalidAtThisStage();
        }
        _;
    }

    /**
      * @dev Modifier that increases the stage of the contract lifecycle based of certain conditions
      */
    modifier timeTransitions(){
        if(stage == Stages.Presale && block.timestamp >= creationTime + 10 days){
            nextStage();
        }else if(stage == Stages.PublicSale && totalSupply == 100){
            nextStage();
        }
        _;
    }

    /**
      * @dev Initializes the contract with merkle root for airdrop as parameter, and the name and symbol for the ERC721 token
      */
    constructor(bytes32 _root) ERC721("NOUCHY", "NYFT"){
        root = _root;
        owner = msg.sender;
    }

    /**
      * @dev Internal function to move contract lifecycle to next stage
      */
    function nextStage() internal{
        stage = Stages(uint(stage) + 1);
    }

    /**
      * @dev External function to allow user's to mint NFTs during PublicSale Stage, safemint's the NFT using a random tokenID
      */
    function mintNFT() timeTransitions atStage(Stages.PublicSale) external payable{
        require(stage != Stages.SoldOut, "NFTs sold out");
        require(msg.value == MINT_PRICE, "Incorrect Ether value sent");
        require(block.timestamp >= lastMintTime[msg.sender] + COOLDOWN_PERIOD, "5min cool down");

        uint256 maxIndex = MAX_NFT - tokenCount;
        uint256 randomID = uint256(keccak256(
            abi.encodePacked(
                msg.sender,
                block.coinbase,
                block.difficulty,
                block.gaslimit,
                block.timestamp
            )
        )) % maxIndex;
        
        uint value = 0;
        if(mintedNFT[randomID] == 0){
            value = randomID;
        }else{
            value = mintedNFT[randomID];
        }

        if(mintedNFT[maxIndex -1] ==0){
            mintedNFT[randomID] = maxIndex -1;
        }else{
            mintedNFT[randomID] = mintedNFT[maxIndex -1];
        }
        totalSupply++;
        tokenCount++;

        lastMintTime[msg.sender] = block.timestamp;
        //safe minting the token
        _safeMint(msg.sender, randomID, "");
    }

    /**
      * @dev External function to allow users to transfer their NFTs or multiple NFTs to an address of their choice, using safeTransfer
      */
    function multiTransfer(address to, uint256[] calldata tokenIDs) public {
        for (uint256 i = 0; i < tokenIDs.length; i++) {
            require(_ownerOf(tokenIDs[i]) == msg.sender, "Is not owner of this token");

            safeTransferFrom(msg.sender, to, tokenIDs[i]);
        }
    }

    /**
      * @dev External function that only the owner call, to setup contributors to withdraw their amounts from the contract
      */
    function setupContributors(address[] calldata recipients, uint256[] calldata amounts) atStage(Stages.SoldOut) external{
        require(owner == msg.sender, "unauthorized to setup contributors");
        require(recipients.length == amounts.length, "recipients/amounts don't match");

        //calculate total withdrawals
        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }
        require(address(this).balance >= total, "insufficient funds");
        //allocate funds to recipients
        for (uint256 i = 0; i < recipients.length; i++) {
            contributorBalances[recipients[i]] += amounts[i];
        }
    }

    /**
      * @dev External function that external contributors can use to claim their funds
      */
    function withdraw() atStage(Stages.SoldOut) public{
        uint256 payment = contributorBalances[msg.sender];
        require(payment > 0, "No funds to withdraw");

        contributorBalances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: payment}("");
        require(success, "Withdrawal failed");
    }

    /**
      * @dev External function allowing user's to commit the hash of their secret byte32 during PreSale Stage, and timetransitions modifier
      * event {CommitHash} is emitted 
      */
    function commit(bytes32 dataHash) timeTransitions atStage(Stages.Presale) public {
        require(commits[msg.sender].commit == 0, "Already committed");
        commits[msg.sender] = Commit({
            commit: getHash(dataHash),
            block: uint64(block.number),
            revealed: false
        });

        emit CommitHash(msg.sender, commits[msg.sender].commit, commits[msg.sender].block);
    }

    /**
      * @dev External function allowing users to reveal their commit hash to get random number for tokenID during PreSale Stage, and timetransitions modifier
      * event {Reveal} is emitted 
      */
    function reveal(bytes32 revealBytes, bytes32[] calldata proof, uint256 index, uint256 amount) timeTransitions atStage(Stages.Presale) public {
        Commit storage userCommit = commits[msg.sender];
        require(!userCommit.revealed, "commit already revealed");
        require(block.number > userCommit.block, "reveal and commit happened on the same block");
        require(block.number >= userCommit.block + MAX_REVEAL_BLOCKS, "too early to reveal");
        require(block.number <= userCommit.block + 250, "revealed too late");
        require(getHash(revealBytes) == commits[msg.sender].commit, "revealed bytes does not match commit");

        bytes32 blockHash = blockhash(userCommit.block);
        uint256 maxIndex = MAX_NFT - tokenCount;
        uint256 randomID = uint256(keccak256(
            abi.encodePacked(
                msg.sender,
                block.coinbase,
                block.difficulty,
                block.gaslimit,
                block.timestamp
            )
        )) % maxIndex;
        
        uint value = 0;
        if(mintedNFT[randomID] == 0){
            value = randomID;
        }else{
            value = mintedNFT[randomID];
        }

        if(mintedNFT[maxIndex -1] ==0){
            mintedNFT[randomID] = maxIndex -1;
        }else{
            mintedNFT[randomID] = mintedNFT[maxIndex -1];
        }
        totalSupply++;
        tokenCount++;

        userCommit.revealed = true;

        emit Reveal(msg.sender, revealBytes, randomID);

        claimImprove(proof, index, amount);

        //safe minting the token
        _safeMint(msg.sender, randomID, "");
    }

    /**
      * @dev Public function to claim NFT whitelist, improved using Bitmaps.
      * Gas cost: AD1 = 56024, AD2 = 36359 , AD3 = 36370 {Cheaper}
      */ 
    function claimImprove(
        bytes32[] calldata proof,
        uint256 index,
        uint256 amount
        ) public{
            //checks if not already claimed in BitMap
            require(!BitMaps.get(_airdropList, index), "Already claimed");
            //verifies proof in merkle tree
            _verify(proof, index, amount, msg.sender);
            //changes bitmap at user's index
            BitMaps.setTo(_airdropList, index, true);
    }

    /**
      * @dev Public function to claim NFT whitelist, using bool mapping.
      * Gas Cost: AD1 = 55796, AD2 = 55796 , AD3 = 55808
      */
    function claim(
        bytes32[] calldata proof,
        uint256 index,
        uint256 amount        
    ) external{
        //checks if not already claimed in mapping
        require(!claimed[msg.sender], "Already claimed");
        //creates leaf 
        bytes32 leaf = keccak256(bytes.concat(
            keccak256(abi.encode(msg.sender, index, amount))
        ));
        //verifies proof in merkle tree
        require(MerkleProof.verify(proof, root, leaf), "Invalid Merkle Proof");
        claimed[msg.sender] = true;
        //mint after this but not using this method.
    }

    /**
      * @dev Private function to verify merkle root with proof 
      */
    function _verify(
        bytes32[] memory proof,
        uint256 index,
        uint256 amount,
        address addr
    ) private view{
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(addr, index, amount))));
        require(MerkleProof.verify(proof, root, leaf), "Invalid proof");
    }

    /**
      * @dev Private function to hash your secret bytes32
      */
    function getHash(bytes32 data) private view returns(bytes32){
        return keccak256(abi.encodePacked(address(this), data));
    }

    /**
      * @dev gets the uri of the NFTs {mock}
      */
    function _baseURI() internal pure override returns (string memory){
        return "ipfs://QmPx7j5QpjK2T2iTLebbir72u2eY3aT6mYpN2Sn9zuuz2y/";
    }
      /**
      * @dev Fallback function to accept Ether sent directly to the contract.
      */
    receive() external payable { 
        
    }

}

/*
--Merkle Root--
0x6a2d42d7abae6ae9c134903fcbb2674454928a474ccaefcc955179545093f9bb
--PROOFS--
Address 1: 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4, index: 0
[
  "0xffdcf024b2d0af41e9af9c908b9658dfb6cb0ba14989b3945c2c0253c2ac8811",
  "0x8f736b351cdf8d915887bedbd63b151e7ac406f734edd7c390ceb11d34958f53",
  "0x57897ae74c113711f9a423a842316de74027cd9cee2fbd0d7e5210a2483f218c"
]
Address 2: 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2, index: 1
[
  "0x262927d5e6aae53ed23e4e6fc527a1bf6540d2ac7baf3e355739edbb09f95ba2",
  "0x6e707cfc4f3adea75b6bac46ad829e0e2f9f02eb7fcca8769d22fd3bcef0604e",
  "0x62661beeb64d61dbaf00b0e20b9fa5ec7f39787f6d8521029a676d68a988d3e6"
]
Address 3: 0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db, index: 2
[
  "0x95951ca5cbb7b945960eaee9c45aad64d3a990cc7e3358bfa09163795d273c79",
  "0x42ad4bde479bbda7b8e1d589f5e0e91f9e864e91cd50a9b5ca800efd125f6617",
  "0x62661beeb64d61dbaf00b0e20b9fa5ec7f39787f6d8521029a676d68a988d3e6"
]
*/