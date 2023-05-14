pragma solidity >=0.7.0 <0.9.0;

contract Encode {
    function encode(address _string1, address _uint, address _string2) public pure returns (bytes memory) {
            return (abi.encode(_string1, _uint, _string2));
        }
    function decode(bytes memory data) public pure returns (string memory _str1, uint _number, string memory _str2) {
            (_str1, _number, _str2) = abi.decode(data, (string, uint, string));            
        }
}