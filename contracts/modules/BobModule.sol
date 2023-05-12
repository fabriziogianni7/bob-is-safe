// SPDX-License-Identifier: LGPL-3.0-only
//pragma solidity >=0.7.0 <0.9.0;
pragma solidity ^0.8.0;

import "./ISwapRouter.sol";
import "./IZkBobDirectDeposits.sol";
import "./Module.sol";


/**
 * @title 
 * @author 
 */


 // hardcable zk receivers
 // hardcable token to swap eg. usdc

contract BobModule is Module {

    //receive() external payable {}

    address public safe;
    //address public owner;

    ISwapRouter constant router =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    IZkBobDirectDeposits constant zkBobProtocol =
        IZkBobDirectDeposits(0x668c5286eAD26fAC5fa944887F9D2F20f7DDF289);  



    constructor(
        address _owner,
        address _avatar,
        address _target
    ) {
        bytes memory initParams = abi.encode(
            _owner,
            _avatar,
            _target
        );
        setUp(initParams);
    }

    function setUp(bytes memory initParams) public override {
        (
            address _owner,
            address _avatar,
            address _target
        ) = abi.decode(
                initParams,
                (
                    address,
                    address,
                    address
                )
            );
        __Ownable_init();
        require(_avatar != address(0), "Avatar can not be zero address");
        require(_target != address(0), "Target can not be zero address");
        setAvatar(_avatar);
        setTarget(_target);
        transferOwnership(_owner);
        //owner = _owner;

        //emit RealityModuleSetup(msg.sender, _owner, avatar, target); //chnage name
    }
    
    function simpleSwapExactInputSingle(
        address[] calldata path,
        uint24 fee, //Fee possibilities: 500, 3000, 10000
        uint256 amountOutMin
    ) 
        internal 
        returns (uint256) 
    {
        (uint256 outputAmount) = ISwapRouter(router).exactInputSingle{value: address(this).balance}(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: path[0],
                tokenOut: path[1],
                fee: fee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: address(this).balance,
                amountOutMinimum: amountOutMin,
                sqrtPriceLimitX96: 0
            })
        );
        return(outputAmount);
    }  

    function directDeposit(
        address _fallbackUser,
        uint256 _amount,
        bytes memory _rawZkAddress
    ) 
        external 
        returns (uint256)
    { //add return nonce di directDeposit
        (uint256 depositId) = IZkBobDirectDeposits(zkBobProtocol).directDeposit(_fallbackUser, _amount, _rawZkAddress);
        return(depositId);
    }

    function PaymentInPrivateMode(
        address _fallbackUser,
        uint256 _amount,
        bytes memory _rawZkAddress,
        address[] calldata path,
        uint24 fee, //Fee possibilities: 500, 3000, 10000
        uint256 amountOutMin
    )
        external
        //returns ()
    {
        bytes memory dataSwap = abi.encodeWithSignature("simpleSwapExactInputSingle(address[],uint24,uint256)", path, fee,amountOutMin);

        //require(safe.execTransactionFromModule(address(this), 0, data, Enum.Operation.Call), "Could not execute token transfer");

        bytes memory dataDeposit = abi.encodeWithSignature("directDeposit(address,uint256,bytes)", _fallbackUser, _amount,_rawZkAddress);

        //require(safe.execTransactionFromModule(token, 0, data, Enum.Operation.Call), "Could not execute token transfer");
    }
}