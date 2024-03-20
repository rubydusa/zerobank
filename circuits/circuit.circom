pragma circom 2.1.4;

include "../node_modules/circomlib/circuits/eddsa.circom";
include "../node_modules/circomlib/circuits/pointbits.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template Main() {
    // public
    signal input address;
    signal input wageRequired;
    signal input issuerX;
    signal input issuerY;

    // private
    signal input wage;

    // signature
    signal input A[256];  // bits of issuer public key
    signal input R8[256];  // signature
    signal input S[256];  // signature

    // 1 if wage >= wageRequired 0 otherwise
    signal output isTrue; 

    // verify that public key of signature matches that of issuer
    component bits2PointA = Bits2Point_Strict();
    bits2PointA.in <== A;
    issuerX === bits2PointA.out[0];
    issuerY === bits2PointA.out[1];

    component bitifyAddress = Num2Bits(160);
    bitifyAddress.in <== address;

    component bitifyWage = Num2Bits(32);
    bitifyWage.in <== wage;

    // verify signature
    component signatureVerifier = EdDSAVerifier(160 + 32);
    for (var i = 0; i < 160; i++) {
        signatureVerifier.msg[i] <== bitifyAddress.out[i];
    }
    for (var i = 0; i < 32; i++) {
        signatureVerifier.msg[160 + i] <== bitifyWage.out[i];
    }
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

