// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.7.0 <0.9.0;
interface IBobModule {
    event BobModuleSetup(address, address, address, address);
    event DepositSuccess(address, uint256);
    event NewPaymentScheduled(uint256, uint256, uint256, bytes);
    event ChangedPaymentScheduled(uint256, uint256, uint256, bytes);
    error PaymentDisabled();
}
