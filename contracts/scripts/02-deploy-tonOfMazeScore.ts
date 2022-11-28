import { Address } from "locklift/.";

import { isValidEverAddress, isNumeric, Migration, zeroAddress } from "./utils";
import BigNumber from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: 257 });

const migration = new Migration();

async function main() {
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

  console.log(`TonOfMaze TonOfMazeScore at: ${sample.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
