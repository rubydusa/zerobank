const path = require('path');

const { CIRCUITS_DIR } = require('../paths.js');

const verifiers = [
    {
        name: 'Main',
        code: `
pragma circom 2.1.5;
include "${path.join(CIRCUITS_DIR, 'circuit.circom')}";
component main {public [address, wageRequired, issuerX, issuerY]} = Main();
        `,
        testCases: []
    },
];

module.exports = verifiers;
