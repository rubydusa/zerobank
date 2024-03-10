const fs = require('fs');
const path = require('path');
const tmp = require('tmp');
const snarkjs = require('snarkjs');
const { execSync } = require('child_process');

const { CONTRACTS_DIR, ZKEY_KEYS_DIR, PHASE1_PATH } = require('../paths.js');
const verifiers = require('./verifiers.js');

const ITERATIONS_NUM = 10;  // not sute of significance
const BEACON = "00".repeat(32);  // for now, don't worry about exploitability
const CONTRIBUTER_NAME = 'TheCreator';  // just for a tad of edge

const solidityTemplates = (() => {
    // copied from hardhat-circom: https://github.com/projectsophon/hardhat-circom/blob/de5fb45bbbb3254533ad15e4bb5e6bd423236ac8/src/index.ts#L729

    const snarkjsRoot = path.dirname(require.resolve("snarkjs"));
    const templateDir = fs.existsSync(path.join(snarkjsRoot, "templates")) ? "templates" : "../templates";

    const verifierGroth16TemplatePath = path.join(snarkjsRoot, templateDir, "verifier_groth16.sol.ejs");
    const verifierPlonkTemplatePath = path.join(snarkjsRoot, templateDir, "verifier_plonk.sol.ejs");

    const groth16Template = fs.readFileSync(verifierGroth16TemplatePath, "utf8");
    const plonkTemplate = fs.readFileSync(verifierPlonkTemplatePath, "utf8");

    return {
        groth16: groth16Template,
        plonk: plonkTemplate
    };
})();


(async () => {
    const dir = tmp.dirSync({prefix: 'circom_', unsafeCleanup: true});

    for (const verifier of verifiers) {
        const filename = path.join(dir.name, `${verifier.name}.circom`);
        fs.writeFileSync(filename, verifier.code, 'utf-8');
        execSync(`circom --wasm --r1cs --output ${dir.name} ${filename}`);

        const sourceWasmPath = path.join(dir.name, `${verifier.name}_js`, `${verifier.name}.wasm`);
        const targetWasmPath = path.join(ZKEY_KEYS_DIR, `${verifier.name}.wasm`);
        fs.cpSync(sourceWasmPath, targetWasmPath);

        const r1csPath = path.join(dir.name, `${verifier.name}.r1cs`);
        const preZKey1 = { type: "mem" };
        await snarkjs.zKey.newZKey(
            r1csPath,
            PHASE1_PATH,
            preZKey1
        );

        const zkeyPath = path.join(ZKEY_KEYS_DIR, `${verifier.name}.zkey`);
        await snarkjs.zKey.beacon(
            preZKey1,
            zkeyPath,
            CONTRIBUTER_NAME,
            BEACON,
            ITERATIONS_NUM
        );

        const solidityVerifier = await snarkjs.zKey.exportSolidityVerifier(
            zkeyPath,
            solidityTemplates
        );

        const solidityPath = path.join(CONTRACTS_DIR, `Verifier${verifier.name}.sol`);
        fs.writeFileSync(solidityPath, solidityVerifier, 'utf-8');
    }

    console.log('done');
    process.exit();
})();
