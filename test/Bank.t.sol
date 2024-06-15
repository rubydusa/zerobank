// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Test, console2} from "forge-std/Test.sol";
import {Bank, IWageVerifier, IIncomeRegistry} from "src/Bank.sol";

contract BankTest is Test {
    Bank bank;
    address WAGE_VERIFIER = makeAddr("WAGE_VERIFIER");
    address INCOME_REGISTRY = makeAddr("INCOME_REGISTRY");

    function setUp() public {
        bank = new Bank(IWageVerifier(WAGE_VERIFIER), IIncomeRegistry(INCOME_REGISTRY));
    }

    function test_simpleCase_accountRegistered() public {
        // TODO
        revert();
    }

    function test_InvalidProof_registrationFails() public {
        // TODO
        revert();
    }
}

