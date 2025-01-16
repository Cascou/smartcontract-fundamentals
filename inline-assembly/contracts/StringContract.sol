// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract StringContract {
    function charAt(string memory input, uint index) public pure returns (bytes2) {
        //Global Variable
        bytes1 char;

        assembly {
	    //get length of the string
            let length := mload(input)

            //Checks if index is out of bounds
            if iszero(lt(index, length)) {
                char := 0x00//assign 0x00 if out of bounds
            }

            //Load the char at index
            let word := mload(add(add(input, 0x20), index))
            char := byte(0, word)

            let result := shl(248, char)

            mstore(0x0, result)
            return (0x0, 32)           
        }
   }
}
