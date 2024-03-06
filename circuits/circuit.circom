pragma circom 2.1.4;

include "../node_modules/circomlib/circuits/eddsa.circom";
include "../node_modules/circomlib/circuits/pointbits.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// does user have wage above a certain range?
template Main() {
    signal input address;  // public
    signal input wageRequired;  // public
    signal input issuerX;  // public
    signal input issuerY;  // public

    signal input wage;  // private

    signal input A[256];  // bits of issuer public key
    signal input R8[256];  // signature
    signal input S[256];  // signature

    signal output isTrue; // 1 if wage >= wageRequired 0 otherwise

    // verify that public key of signature matches that of issuer
    component bits2PointA = Bits2Point_Strict();
    bits2PointA.in <== A;
    issuerX === bits2PointA.out[0];
    issuerY === bits2PointA.out[1];

    // verify signature
    component signatureVerifier = EdDSAVerifier(2);
    signatureVerifier.msg[0] <== address;
    signatureVerifier.msg[1] <== wage;
    signatureVerifier.A <== A;
    signatureVerifier.R8 <== R8;
    signatureVerifier.S <== S;

    // verify wage requirement
    // NOTE: technically vulnarable to comparator attack, to prevent constrain bits
    component wageChecker = GreaterEqThan(32);
    wageChecker.in[0] <== wage;
    wageChecker.in[1] <== wageRequired;
    
    isTrue <== wageChecker.out;
}

