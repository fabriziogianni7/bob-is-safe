// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0;
import "../modules/BobModule.sol"; 

/**
 * @title ModuleFactory - A factory contract to create instances of BobModule
 */

contract ModuleFactory { 

    event ModuleProxyCreation(address indexed module);

    /**
     * @dev This function creates a new instance of the BobModule and emits an event with the address of the newly created module.
     *
     * @param _owner The address that will be set as the owner of the new module.
     * @param _avatar The avatar address that will be set in the new module.
     * @param _target The target address that will be set in the new module.
     * @param _bobToken The address of the Bob token that will be used in the new module.
     * @param _bobDepositProtocol The address of the Bob deposit protocol that will be used in the new module.
     * @param _uniRouter The address of the Uniswap router that will be used in the new module.
     * @return The address of the newly created BobModule.
     */
    function createModule(
        address _owner, 
        address _avatar, 
        address _target, 
        address _bobToken, 
        address _bobDepositProtocol, 
        address _uniRouter
    ) 
        external 
        returns (address) 
    {
        address module = address(new BobModule(_owner, _avatar, _target, _bobToken, _bobDepositProtocol, _uniRouter)); 

        emit ModuleProxyCreation(module);

        return module;
    }
}