// @ts-ignore
import { wasm as wasmTester } from 'circom_tester';

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import { PathLike } from 'fs';

import 'mocha';

interface CircuitTest { path: PathLike,
    name: string,
    cases: CircuitTestCase[]
}

interface CircuitTestCase {
    input: object | Function | null,
    output: object | Function | null,
    reasonOfFail?: string,
    description?: string
}

export function generateCircuitTest(circuitTest: CircuitTest): void {
    describe(circuitTest.name, () => {
        let circuit: any;
        before(async () => {
            circuit = await wasmTester(circuitTest.path, {compile: false});
        });

        for (const [i, caseData] of circuitTest.cases.entries()) {
            const { reasonOfFail, description } = caseData;

            const caseName = description !== undefined ? `Case#${i}: ${description}` : `Case#${i}`; 

            it(caseName, async () => {
                const { input: rawInput, output: rawOutput } = caseData;
                const input = typeof rawInput === 'function' 
                    ? await rawInput()
                    : rawInput;
                const output = typeof rawOutput === 'function' 
                    ? await rawOutput()
                    : rawOutput;

                const routine = async () => {
                    const witness = await circuit.calculateWitness(input);
                    await circuit.checkConstraints(witness);

                    if (output !== null) {
                        await circuit.assertOut(witness, output);
                    }
                };

                if (reasonOfFail !== undefined) {
                    await expect(routine()).to.be.rejectedWith(reasonOfFail);
                } else {
                    await routine();
                }
            });
        }
    });
}


