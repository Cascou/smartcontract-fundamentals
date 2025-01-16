// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract BitWise {
    // count the number of bit set in data.  i.e. data = 7, result = 3
    function countBitSet(uint8 data) public pure returns (uint8 result) {
        for( uint i = 0; i < 8; i += 1) {
            if( ((data >> i) & 1) == 1) {
                result += 1;
            }
        }
    }

    function countBitSetAsm(uint8 data ) public pure returns (uint8 result) {
        assembly{
            //set the length
            let max:= 8
            //variable to count set bits
            let bitsSet := 0 

            for {let i := 0} lt(i,max) {i:= add(i,1)}
            {
                //shifts data right by i, then AND with 1 to check if i-th bit is set   
                if eq(and(shr(i, data), 1), 1) {
                    bitsSet := add(bitsSet, 1)
                }
            }

            result := bitsSet
        }
    }
}
