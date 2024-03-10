// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IWageVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[5] memory input  // first public inputs, then outputs
    ) external view returns (bool r);
}

interface IIncomeRegistry {
    // TODO: might change to use packed public key format if confusing to explain
    function publicKey() external view returns (uint256, uint256);
}

contract Bank {
    enum AccountType {
        BASIC,
        GOLD,
        PLATINUM
    }

    IWageVerifier public verifier;
    IIncomeRegistry public incomeRegistry;
    mapping(address => AccountType) public accountRegistry;
    
    constructor (IWageVerifier _verifier, IIncomeRegistry _incomeRegistry) {
        verifier = _verifier;
        incomeRegistry = _incomeRegistry;
    }

    function applyForAccount(
        AccountType accountType,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c
    ) external {
        if (accountType == AccountType.BASIC) {
            accountRegistry[msg.sender] = AccountType.BASIC;
        }

        uint256 wageRequired = 0;
        if (accountType == AccountType.GOLD) {
            wageRequired = 10_000;
        } else if (accountType == AccountType.PLATINUM) {
            wageRequired = 20_000;
        }

        // maybe it's really better to change to use packed format
        // to keep the notation of a public key being an arbitrary string of bytes
        (uint256 issuerX, uint256 issuerY) = incomeRegistry.publicKey();

        uint256[5] memory input = [
            uint256(uint160(msg.sender)),
            wageRequired,
            issuerX,
            issuerY,
            1  // isTrue = true
        ];
        
        bool isProofValid = verifier.verifyProof(a, b, c, input);
        if (!isProofValid) {
            revert InvalidProof();
        }

        accountRegistry[msg.sender] = accountType;
    }

    error InvalidProof();
}
