const path = require('path');
const { OUTPUT_DIR } = require('../../circuits/test_config');

const { generateCircuitTest } = require('../../circuits/generate_tests');
const { buildEddsa } = require('circomlibjs');

let _eddsa = null;
const eddsaSingleton = async () => {
    if (_eddsa === null) {
        _eddsa = await buildEddsa();
    }
    return _eddsa
}

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
Buffer.from('03030303', 'hex').copy(ADDRESS);

async function generateInput (wage, wageRequired) {
    const eddsa = await eddsaSingleton();
    const message = concatUint8Arrays(ADDRESS, wage);

    const A = eddsa.prv2pub(PRIVATE_KEY);
    const pA = eddsa.babyJub.packPoint(A);
    const sig = eddsa.signPedersen(PRIVATE_KEY, message);
    const pSig = eddsa.packSignature(sig);

    const r8Bits = buffer2Bits(pSig.slice(0, 32));
    const sBits = buffer2Bits(pSig.slice(32, 64));

    return {
        address: buffer2Num(ADDRESS),
        wageRequired: wageRequired,
        issuerX: eddsa.babyJub.F.toObject(A[0]),
        issuerY: eddsa.babyJub.F.toObject(A[1]),
        wage: buffer2Num(wage),
        A: buffer2Bits(pA),
        R8: r8Bits,
        S: sBits
    }
}

generateCircuitTest({
    name: 'Main',
    path: path.join(OUTPUT_DIR, 'Main.t.circom'),
    cases: [
        {
            description: "positive case",
            input: async () => {
                // wage: 255, required: 30
                const wage = Buffer.alloc(4);
                Buffer.from('ff000000', 'hex').copy(wage);
                const wageRequired = 30n;

                return await generateInput(wage, wageRequired);
            },
            output: async () => {
                return {
                    isTrue: 1
                }
            },
        },
        {
            description: "negative case",
            input: async () => {
                // wage: 255, required: 300
                const wage = Buffer.alloc(4);
                Buffer.from('ff000000', 'hex').copy(wage);
                const wageRequired = 300n;

                return await generateInput(wage, wageRequired);
            },
            output: async () => {
                return {
                    isTrue: 0
                }
            },
        },
        {
            description: "invalid public key",
            input: async () => {
                // wage: 255, required: 30
                const wage = Buffer.alloc(4);
                Buffer.from('ff000000', 'hex').copy(wage);
                const wageRequired = 30n;

                const input = await generateInput(wage, wageRequired);
                const eddsa = await eddsaSingleton();
                const fakePrivateKey = Buffer.from('ffffffff', 'hex');
                const fakePublicKey = eddsa.prv2pub(fakePrivateKey);
                const pFakePublicKey = eddsa.babyJub.packPoint(fakePrivateKey);

                input.A = buffer2Bits(pFakePublicKey);

                return input;
            },
            output: null,
            reasonOfFail: 'Assert Failed'
        }
    ]
});


