import path from 'path';
import { generateTestCircuits, Protocol } from './generate_test_circuits';

export const OUTPUT_DIR = path.join(__dirname, 'artifacts', 'test');
const TEST_CIRCUITS = [
    {
        name: 'Main',
        main: 'Main',
        path: './circuits/circuit.circom',
        parameters: [],
        publicSignals: [],
        protocol: Protocol.Groth16,
        version: '2.1.4'
    },
];

if (require.main === module) {
    generateTestCircuits(TEST_CIRCUITS, OUTPUT_DIR);
}
