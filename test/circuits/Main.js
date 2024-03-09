const path = require('path');
const { OUTPUT_DIR } = require('../../circuits/test_config');

const { generateCircuitTest } = require('../../circuits/generate_tests');
const { buildEddsa } = require('circomlibjs');

function buffer2Bits(buff) {
    const res = [];
    for (let i=0; i<buff.length; i++) {
        for (let j=0; j<8; j++) {
            if ((buff[i]>>j)&1) {
                res.push(1n);
            } else {
                res.push(0n);
            }
        }
    }
    return res;
}

function bits2Num(bits) {
    let num = 0n;
    let e2 = 1n;
    for (let i = 0n; i < BigInt(bits.length); i++) {
        num += bits[i] * e2;
        e2 *= 2n;
    }
    return num;
}

const buffer2Num = (buff) => bits2Num(buffer2Bits(buff));

function concatUint8Arrays(array1, array2) {
    const combinedArray = new Uint8Array(array1.length + array2.length);
    combinedArray.set(array1);
    combinedArray.set(array2, array1.length);
    return combinedArray;
}

const PRIVATE_KEY = Buffer.from('01020304050607080910111213141516', 'hex');
const ADDRESS = Buffer.alloc(20);
ADDRESS.copy(Buffer.from('03030303', 'hex'));
const WAGE = Buffer.alloc(4);
WAGE.copy(Buffer.from('000000ff', 'hex'));

const WAGE_REQUIRED = 30n;

generateCircuitTest({
    name: 'Main',
    path: path.join(OUTPUT_DIR, 'Main.t.circom'),
    cases: [
        {
            input: async () => {
                const eddsa = await buildEddsa();
                const message = concatUint8Arrays(ADDRESS, WAGE);

                const A = eddsa.prv2pub(PRIVATE_KEY);
                const pA = eddsa.babyJub.packPoint(A);
                const sig = eddsa.signPedersen(PRIVATE_KEY, message);
                const pSig = eddsa.packSignature(sig);

                const r8Bits = buffer2Bits(pSig.slice(0, 32));
                const sBits = buffer2Bits(pSig.slice(32, 64));

                console.log(eddsa.babyJub.F.toObject(A[0]));
                console.log(eddsa.babyJub.F.toObject(A[1]));

                return {
                    address: buffer2Num(ADDRESS),
                    wageRequired: WAGE_REQUIRED,
                    issuerX: eddsa.babyJub.F.toObject(A[0]),
                    issuerY: eddsa.babyJub.F.toObject(A[1]),
                    wage: buffer2Num(WAGE),
                    A: buffer2Bits(pA),
                    R8: r8Bits,
                    S: sBits
                }
            },
            output: async () => {
                return {
                    isTrue: 1
                }
            },
        }
    ]
});


