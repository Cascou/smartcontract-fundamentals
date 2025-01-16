import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";

// Load the Merkle tree from the file
const tree = StandardMerkleTree.load(JSON.parse(fs.readFileSync("tree.json", "utf-8")));

/**
 * Function to get the Merkle proof for a given address and typeIndex
 * @param typeIndex The index of the value to compare (e.g. 0 for address)
 * @param address The address (or value) to search for
 */
function getMerkleProof(typeIndex: number, address: string) {
    for (const [i, v] of tree.entries()) {
        if (v[typeIndex] === address) {
            const proof = tree.getProof(i);
            console.log("Value: ", v);
            console.log("Proof: ", proof);
            return;
        }
    }
    console.log("No matching value found for the given input.");
}

// Example usage: Pass the index of the address field (typeIndex) and the address itself
const typeIndex = 0; // Assuming the address is the first element in the value array
const address = "0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"; // Replace with the desired address

getMerkleProof(typeIndex, address);
