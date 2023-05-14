// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.0;

import "./ISwapRouter.sol";
import "./IBobModule.sol";
import "./IZkBobDirectDeposits.sol";
import "./Module.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * @title BobModule - A Safe Module to achieve private transaction integrating ZK Bob protocol
 * @dev The BobModule contract integrates the ZK Bob protocol for privacy-enhanced transactions.
 */

contract BobModule is Module, IBobModule {

    // Addresses of the Bob token, Bob deposit protocol, and Uniswap router
    address bobToken;
    address bobDepositProtocol;
    address uniRouter;

    // Interface for the Uniswap router
    ISwapRouter router;

    // Constant address representing Ether
    address constant ETH = 0x0000000000000000000000000000000000000000; // Replace with the appropriate Ether representation
    

    // Interface for the ZK Bob deposit protocol
    IZkBobDirectDeposits zkBobProtocol =
        IZkBobDirectDeposits(bobDepositProtocol);  //goerli


    /**
     * @dev Constructor function.
     * @param _owner The owner of the contract.
     * @param _avatar The avatar to be set for the contract.
     * @param _target The target to be set for the contract.
     * @param _bobToken The address of the Bob token.
     * @param _bobDepositProtocol The address of the Bob deposit protocol.
     * @param _uniRouter The address of the Uniswap router.
     */
    constructor(
        address _owner,
        address _avatar,
        address _target,
        address _bobToken,
        address _bobDepositProtocol,
        address _uniRouter
    ) {
        bytes memory initParams = abi.encode(
            _owner,
            _avatar,
            _target,
            _bobToken,
            _bobDepositProtocol,
            _uniRouter
        );
        setUp(initParams);
    }

    /**
     * @dev Set up function.
     * @param initParams The initialization parameters.
     */
    function setUp(
        bytes memory initParams
        ) 
        public 
        override 
        initializer 
    {
        (
            address _owner,
            address _avatar,
            address _target,
            address _bobToken,
            address _bobDepositProtocol,
            address _uniRouter
        ) = abi.decode(
                initParams,
                (
                    address,
                    address,
                    address,
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
        bobToken = _bobToken;
        bobDepositProtocol = _bobDepositProtocol;
        uniRouter = _uniRouter;
        router = ISwapRouter(uniRouter);
    }

    /**
     * @dev Function to perform a payment in private mode using ZK Bob Protocol.
     * @param _fallbackUser The fallback user address.
     * @param _amount The amount to be paid.
     * @param _rawZkAddress The raw ZK address.
     * @param tokens The addresses of the tokens to be swapped.
     * @param fees The fees associated with each swap.
     * @param amountOutMin The minimum output amount from the swap.
     * @return The deposit ID.
     */
    function paymentInPrivateMode(
        address _fallbackUser,
        uint256 _amount,
        string calldata _rawZkAddress,
        address[] memory tokens,
        uint24[] memory fees,
        uint256 amountOutMin
        )
        external
        returns(uint256)
    {
        // Check if a swap is required
        if (tokens.length != 0) {
            // Transfer token from safe to Bob module
            bytes memory data = abi.encodeWithSignature("transfer(address,uint256)", address(this), _amount);
            require(IAvatar(avatar).execTransactionFromModule(tokens[0], 0, data, Enum.Operation.Call), "Could not execute token transfer");
            // Swap from token to Bob
            (uint256 amountOutput) = swapExactInputMultihop(tokens, fees, amountOutMin, _amount);
            return(depositBob(amountOutput,             _rawZkAddress, 
            _fallbackUser));
        }
        else {
            // transfer from safe to Bob module
            bytes memory data = abi.encodeWithSignature("transfer(address,uint256)", address(this), _amount);
            require(IAvatar(avatar).execTransactionFromModule(bobToken, 0, data, Enum.Operation.Call), "Could not execute token transfer");
            return(depositBob(_amount, _rawZkAddress, _fallbackUser));
        }
    }

    /**
     * @dev Function to deposit BOB tokens.
     * @param depositAmount The amount of BOB tokens to deposit.
     * @param _rawZkAddress The raw ZK address.
     * @param _fallbackUser The fallback user address.
     * @return The deposit ID.
     */
    function depositBob(
        uint256 depositAmount,
        string calldata _rawZkAddress,
        address _fallbackUser
        )
        internal
        returns(uint256)
    {
        // Approve the deposit protocol to spend the BOB tokens
        IERC20(bobToken).approve(bobDepositProtocol, depositAmount);

        // Execute the deposit
        (uint256 depositId) = IZkBobDirectDeposits(bobDepositProtocol).directDeposit(_fallbackUser, depositAmount, _rawZkAddress);

        emit DepositSuccess(avatar, depositAmount);
        return (depositId);
    }

    /**
     * @dev Function to swap an exact input amount across a multi-hop path.
     * @param tokens The addresses of the tokens in the path.
     * @param fees The fees associated with each hop in the path.
     * @param amountOutMin The minimum output amount.
     * @param amountIn The input amount.
     * @return The output amount.
     */
    function swapExactInputMultihop(
        //bytes memory path,
        address[] memory tokens,
        uint24[] memory fees,
        uint256 amountOutMin,
        uint256 amountIn
        ) 
        public 
        payable 
        returns (uint256) 
    {
        require(fees.length+1 == tokens.length, "Fees array length should be one less than tokens array length");

        // Approve the router to spend the token
        IERC20(tokens[0]).approve(0xE592427A0AEce92De3Edee1F18E0157C05861564, amountIn);

        // Construct the path
        bytes memory path = new bytes(0);
        for (uint i = 0; i < tokens.length - 1; i++) {
            path = abi.encodePacked(path, tokens[i], fees[i]);
        }
        path = abi.encodePacked(path, tokens[tokens.length - 1]);

        // Construct the parameters for the swap
        ISwapRouter.ExactInputParams memory params =
            ISwapRouter.ExactInputParams({
                path: path,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: amountOutMin
            });

        // Executes the swap and returns the output amount
        uint256 amountOut;
        return (( amountOut) = router.exactInput(params));
    }   
}
