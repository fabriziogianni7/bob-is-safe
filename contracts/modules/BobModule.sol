// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity ^0.8.0;

import "./ISwapRouter.sol";
import "./Copy_IBobModule.sol";
import "./IZkBobDirectDeposits.sol";
import "./IGnosisSafe.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * @title BobModule - A Safe Module to achieve private transaction integrating ZK Bob protocol
 * @dev The BobModule contract integrates the ZK Bob protocol for privacy-enhanced transactions.
 */

contract BobModule is IBobModule {

    // state variables

    // Addresses of the Bob token, Bob deposit protocol, and Uniswap router
    address bobToken;
    address bobDepositProtocol;
    address uniRouter02;

    // Init addresses
    address owner;
    address workerAccount;

    // Interface for the Uniswap router
    ISwapRouter router;

    IGnosisSafe safe;

    IZkBobDirectDeposits zkBobProtocol;

    // Structure for holding details about scheduled payments.
    struct ScheduledPayment{
        uint256 recurringAmmount; // Recurring amount for scheduled payment.
        uint256 executionInterval; // Time interval for payment execution.
        uint256 nextExecution; // Timestamp for the next scheduled execution.
        address paymentToken; // Token to be used for payment.
        bytes zkAddress; // Zk address for privacy-enhanced transactions.
        uint256 paymentsLeft; // Number of payments left in the schedule.
        bool active; // If the scheduled payment is active or not.
    }

    // Mapping of scheduled payments. The bytes32 key is a unique identifier for each scheduled payment.
    mapping(bytes32 => ScheduledPayment) public scheduledPayments;

    // Private index used to create unique identifiers for scheduled payments.
    uint256 private _keyIndex;

    // Modifier to restrict access to functions only for the worker or owner (if worker is not defined).
    modifier onlyWorkerOrOwner() {
        require(workerAccount == address(0) ? msg.sender == owner : msg.sender == workerAccount, "Caller is not owner");
        _;
    }

    // constructor

    /**
     * @dev Constructor function.
     * @param _owner The owner of the contract.
     * @param _workerAccount The wallet that can chanhge settings on behalf of the Safe wallet.
     * @param _bobToken The address of the Bob token.
     * @param _bobDepositProtocol The address of the Bob deposit protocol.
     * @param _uniRouter02 The address of the Uniswap router.
     */

    constructor(
        address _owner,
        address _workerAccount,
        address _bobToken,
        address _bobDepositProtocol,
        address _uniRouter02
    )
    {
        owner = _owner;
        workerAccount = _workerAccount;
        bobToken = _bobToken;
        bobDepositProtocol = _bobDepositProtocol;
        uniRouter02 = _uniRouter02;
        router = ISwapRouter(uniRouter02);
        zkBobProtocol = IZkBobDirectDeposits(bobDepositProtocol);

        safe = IGnosisSafe(owner);
    }

    /**
     * @dev Function to change the worker account. Only accessible by the owner.
     * @param newWorker The new worker wallet address.
     * @return The new worker address.
     */
    function setNewWorkerAddress(address newWorker) external returns(address) {
        require (msg.sender == owner);
        return(workerAccount = newWorker);
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
    function singlePrivatePayment(
        address _fallbackUser,
        uint256 _amount,
        bytes memory _rawZkAddress,
        address[] memory tokens,
        uint24[] memory fees,
        uint256 amountOutMin
        )
        external
        returns(uint256)
    {
        return (_singlePrivatePayment(_fallbackUser, _amount, _rawZkAddress, tokens, fees, amountOutMin));
    }

    /**
     * @dev Creates a new scheduled payment with the provided parameters. Can only be called by the owner or the worker.
     * @param amount The recurring amount for the scheduled payment.
     * @param executionTimeInterval The time interval for payment execution.
     * @param paymentToken The token to be used for payment.
     * @param payments The total number of payments in the schedule.
     * @param _rawZkAddress The raw ZK address for privacy-enhanced transactions.
     * @return _keyIndex The unique identifier for the created scheduled payment.
     */
    function createScheduledPayment(uint256 amount, uint256 executionTimeInterval, address paymentToken, uint256 payments, bytes memory _rawZkAddress) onlyWorkerOrOwner external returns(uint256) {
        bytes32 id = _randomKey(_keyIndex++);

        // assign each field individually
        ScheduledPayment storage payment = scheduledPayments[id];
        payment.recurringAmmount = amount;
        payment.executionInterval = executionTimeInterval;
        payment.paymentToken = paymentToken;
        payment.zkAddress = _rawZkAddress;
        payment.paymentsLeft = payments;
        payment.active = true;

        emit NewPaymentScheduled(amount, executionTimeInterval, payments, _rawZkAddress);

        return _keyIndex;    
    }

    /**
     * @dev Executes a scheduled payment identified by the payment index.
     * @param paymentIndex The unique identifier of the scheduled payment to be executed.
     */
    function executeScheduledPayment(bytes32 paymentIndex) external {

        ScheduledPayment storage scheduledPayment = scheduledPayments[paymentIndex];

        if(scheduledPayment.active == false) revert PaymentDisabled();

        _singlePrivatePayment(owner, scheduledPayment.recurringAmmount, scheduledPayment.zkAddress, new address[](0), new uint24[](0), 0);
                
        if (scheduledPayment.paymentsLeft-- == 0) {
            scheduledPayment.active = false;
        }

        scheduledPayment.nextExecution = _setNextExecution(scheduledPayment.executionInterval);
    }

    /**
     * @dev Modifies an existing scheduled payment identified by the payment index. Can only be called by the owner or the worker.
     * @param index The unique identifier of the scheduled payment to be modified.
     * @param amount The new recurring amount for the scheduled payment.
     * @param executionTimeInterval The new time interval for payment execution.
     * @param paymentToken The new token to be used for payment.
     * @param _rawZkAddress The new raw ZK address for privacy-enhanced transactions.
     * @param deactivePayment If set to 1, the scheduled payment will be deactivated.
     */
    function changeScheduledPayment(bytes32 index, uint256 amount, uint256 executionTimeInterval, address paymentToken, bytes memory _rawZkAddress, uint256 deactivePayment) onlyWorkerOrOwner external {
        
        ScheduledPayment storage scheduledPayment = scheduledPayments[index];

        // check id the scheduled payment is valid 
        if(scheduledPayment.active == false) revert PaymentDisabled();

        scheduledPayment.recurringAmmount = (amount != 0 ? amount : scheduledPayment.recurringAmmount);
        scheduledPayment.executionInterval = (executionTimeInterval != 0 ? executionTimeInterval : scheduledPayment.executionInterval);
        scheduledPayment.paymentToken = (paymentToken != address(0) ? paymentToken : scheduledPayment.paymentToken);
        scheduledPayment.zkAddress = _rawZkAddress.length != 0 ? _rawZkAddress : scheduledPayment.zkAddress;

        if(deactivePayment == 1) {
            scheduledPayment.active = false;
        }

        emit ChangedPaymentScheduled(scheduledPayment.recurringAmmount, scheduledPayment.executionInterval, scheduledPayment.paymentsLeft, scheduledPayment.zkAddress);

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
        bytes memory _rawZkAddress,
        address _fallbackUser
        )
        internal
        returns(uint256)
    {
        // Approve the deposit protocol to spend the BOB tokens
        IERC20(bobToken).approve(bobDepositProtocol, depositAmount);

        // Execute the deposit
        (uint256 depositId) = IZkBobDirectDeposits(bobDepositProtocol).directDeposit(_fallbackUser, depositAmount, _rawZkAddress);

        //emit DepositSuccess(avatar, depositAmount);
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
        require(tokens[tokens.length-1] == bobToken);

        // Approve the router to spend the token
        IERC20(tokens[0]).approve(uniRouter02, amountIn);

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

    // private function to make deposits
    function _singlePrivatePayment(
        address _fallbackUser,
        uint256 _amount,
        bytes memory _rawZkAddress,
        address[] memory tokens,
        uint24[] memory fees,
        uint256 amountOutMin
        ) private returns(uint256) 

    {
        // Check if a swap is required
        if (tokens.length != 0) {
            // Transfer token from safe to Bob module
            bytes memory data = abi.encodeWithSignature("transfer(address,uint256)", address(this), _amount);
            require(safe.execTransactionFromModule(tokens[0], 0, data, Enum.Operation.Call), "Could not execute token transfer");
            // Swap from token to Bob
            (uint256 amountOutput) = swapExactInputMultihop(tokens, fees, amountOutMin, _amount);
            return(depositBob(amountOutput, _rawZkAddress, _fallbackUser));
        }
        else {
            // transfer from safe to Bob module
            bytes memory data = abi.encodeWithSignature("transfer(address,uint256)", address(this), _amount);
            require(safe.execTransactionFromModule(bobToken, 0, data, Enum.Operation.Call), "Could not execute token transfer");
            return(depositBob(_amount, _rawZkAddress, _fallbackUser));
        }

    }

    // Private function to calculate the next execution time for a payment schedule.
    function _setNextExecution(uint256 interval) private view returns(uint256){
        return(block.timestamp + interval);
    }

    // Private function to generate a random key. The key is a hash of multiple inputs to achieve high entropy.
    function _randomKey(uint256 i) private view returns (bytes32) {
        return keccak256(abi.encode(i, block.timestamp, block.number, tx.origin, tx.gasprice, block.coinbase, block.prevrandao, msg.sender, blockhash(block.number - 5)));
    }

    function getScheduledPayment(bytes32 paymentIndex) public view returns (ScheduledPayment memory) {
        return (scheduledPayments[paymentIndex]);
    }

    function isScheduledPaymentActive (bytes32 paymentIndex) public view returns (bool) {
        return (scheduledPayments[paymentIndex].active);
    }

    function nextScheduledPayment (bytes32 paymentIndex) public view returns (uint256) {
        return (scheduledPayments[paymentIndex].nextExecution);
    }
}
