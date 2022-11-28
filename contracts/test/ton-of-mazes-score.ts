import { expect } from "chai";
import { Contract, Signer, WalletTypes } from "locklift";
import { FactorySource } from "../build/factorySource";
import { Address } from "locklift/.";
import { isValidEverAddress, isNumeric, zeroAddress, Migration } from "../scripts/utils";
const BigNumber = require("bignumber.js");
const EMPTY_TVM_CELL = "te6ccgEBAQEAAgAAAA==";
let TonOfMazeScore: Contract<FactorySource["TonOfMazeScore"]>;
let signer: Signer;
let wallets: any[];

describe("Test Sample contract", async function () {
  before(async () => {
    signer = (await locklift.keystore.getSigner("0"))!;
  });
  describe("Contracts", async function () {
    it("Load contract factory", async function () {
      const TonOfMazeScoreContract = await locklift.factory.getContractArtifacts("TonOfMazeScore");
      expect(TonOfMazeScoreContract.code).not.to.equal(undefined, "Code should be available");
      expect(TonOfMazeScoreContract.abi).not.to.equal(undefined, "ABI should be available");
      expect(TonOfMazeScoreContract.tvc).not.to.equal(undefined, "tvc should be available");
    });
    it("Deploy contract", async function () {
      const keyPairs = await locklift.keystore.getSigner("0");
      const { contract: sample, tx } = await locklift.factory.deployContract({
        contract: "TonOfMazeScore",
        publicKey: keyPairs!.publicKey,
        initParams: {
          _randomNonce: locklift.utils.getRandomNonce(),
        },
        constructorParams: {},
        value: locklift.utils.toNano(3),
      });
      TonOfMazeScore = sample;
      console.log(`TonOfMaze TonOfMazeScore at: ${sample.address.toString()}`);
      expect(await locklift.provider.getBalance(sample.address).then(balance => Number(balance))).to.be.above(0);
    });

    it("Should upload score", async function () {
      const keyPairs = await locklift.keystore.getSigner("0");
      const tx = await TonOfMazeScore.methods.upload({ score: 12, level: 12 }).send({
        from: new Address(keyPairs!.publicKey),
        amount: "500000000",
        bounce: true,
      });
      console.log(tx);
    });
  });
});
