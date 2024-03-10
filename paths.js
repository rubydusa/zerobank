const path = require('path');

const ROOT = __dirname;
const CIRCUITS_DIR = path.join(ROOT, 'circuits');
const CIRCUITS_ARTIFACTS_DIR = path.join(ROOT, 'circuits', 'artifacts');
const CONTRACTS_DIR = path.join(ROOT, 'contracts');
const DATA_DIR = path.join(ROOT, 'data');
const ZKEY_KEYS_DIR = path.join(ROOT, 'data', 'keys');
const PHASE1_PATH = path.join(ROOT, 'powersOfTau28_hez_final_19.ptau');

const TEST_CIRCUITS_DIR = path.join(CIRCUITS_ARTIFACTS_DIR, 'test');

module.exports = {
    ROOT,
    CIRCUITS_DIR,
    CIRCUITS_ARTIFACTS_DIR,
    CONTRACTS_DIR,
    DATA_DIR,
    ZKEY_KEYS_DIR,
    PHASE1_PATH,
    TEST_CIRCUITS_DIR
}

