const path = require('path');
const { OUTPUT_DIR } = require('../../circuits/test_config');

const { generateCircuitTest } = require('../../circuits/generate_tests');

generateCircuitTest({
    name: 'Main',
    path: path.join(OUTPUT_DIR, 'Main.t.circom'),
    cases: [
        {
            input: {
                in: 0
            },
            output: {
                out: 0
            },
        }
    ]
});


