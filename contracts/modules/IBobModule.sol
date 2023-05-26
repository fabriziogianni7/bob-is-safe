// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;
interface IBobModule {

    function setNewWorkerAddress(address) external returns(address);
    function singlePrivatePayment( address, uint256, bytes memory, address[] memory, uint24[] memory, uint256) external returns(uint256);
    function createScheduledPayment(uint256, uint256, address, uint256, bytes memory) external returns(uint256);
    function executeScheduledPayment(bytes32) external;
    function changeScheduledPayment(bytes32, uint256, uint256, address, bytes memory, uint256, uint256) external;

    event BobModuleSetup(address, address, address, address);
    event DepositSuccess(address, uint256);
    event NewPaymentScheduled(uint256, uint256, uint256, bytes);
    event ChangedPaymentScheduled(uint256, uint256, uint256, bytes);
    error PaymentDisabled();
    error TooEarly();
    error WrongFeesOrTokensArrays();
    error WrongOutToken();
}
