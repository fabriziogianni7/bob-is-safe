// SPDX-License-Identifier: LGPL-3.0-only
pragma solidity >=0.8.0;

contract ModuleProxyFactory {
    event ModuleProxyCreation(
        address indexed proxy,
        address indexed masterCopy
    );

    /**
     * @dev Deploys a module proxy contract using CREATE2.
     * @param masterCopy The address of the master copy contract.
     * @param initializer The initializer data to be called on the deployed proxy contract.
     * @param saltNonce The nonce used for calculating the deployment salt.
     * @return proxy The address of the deployed module proxy contract.
     */
    function deployModule(
        address masterCopy,
        bytes memory initializer,
        uint256 saltNonce
    ) public returns (address proxy) {
        // Generate deployment salt by hashing initializer and saltNonce
        bytes32 salt = keccak256(abi.encodePacked(keccak256(initializer), saltNonce));

        // Create the proxy contract
        proxy = createProxy(masterCopy, salt);

        // Call the initializer on the proxy contract
        (bool success, ) = proxy.call(initializer);
        require(success, "deployModule: initialization failed");

        // Emit an event with the deployed proxy and master copy addresses
        emit ModuleProxyCreation(proxy, masterCopy);
    }

    /**
     * @dev Creates a proxy contract using CREATE2.
     * @param target The address of the target contract to proxy.
     * @param salt The salt value for CREATE2 deployment.
     * @return result The address of the created proxy contract.
     */
    function createProxy(address target, bytes32 salt)
        internal
        returns (address result)
    {
        // Ensure the target address is not zero
        require(
            address(target) != address(0),
            "createProxy: address can not be zero"
        );

        // Deployment bytecode for the proxy contract
        bytes memory deployment = abi.encodePacked(
            hex"3d602d80600a3d3981f3363d3d373d3d3d363d73", // Deployment prefix
            target, // Address of the target contract
            hex"5af43d82803e903d91602b57fd5bf3" // Deployment suffix
        );

        // Deploy the proxy contract using CREATE2
        assembly {
            result := create2(0, add(deployment, 0x20), mload(deployment), salt)
        }

        // Ensure the deployment was successful and the address is not zero
        require(result != address(0), "createProxy: address already taken");
    }
}
