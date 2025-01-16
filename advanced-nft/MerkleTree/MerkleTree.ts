import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import fs from "fs";

// Read and split the CSV data
const [encoding, ...leafs] = fs
    .readFileSync("MerkleTree/values.csv", "utf-8")
    .trim() // Remove extra whitespace from the whole file content
    .split("\n");

// Create the Merkle tree by trimming and cleaning up the values
const tree = StandardMerkleTree.of(
    leafs.map((leaf) => {
        // Remove extra whitespace and carriage returns from each value
        const cleanedLeaf = leaf.split(",").map((item) => item.trim().replace("\r", ""));
        return cleanedLeaf;
    }),
    encoding.split(",").map((enc) => enc.trim()) // Clean encoding too
);

// Output the Merkle root
console.log("Merkle Root: ", tree.root);
// Write the tree to a file
fs.writeFileSync("tree.json", JSON.stringify(tree.dump(), null, 3));