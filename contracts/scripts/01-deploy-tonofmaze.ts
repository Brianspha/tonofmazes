import BigNumber from "bignumber.js";
import { Address } from "locklift/.";

BigNumber.config({ EXPONENTIAL_AT: 257 });
async function main() {
  const keyPairs = await locklift.keystore.getSigner("0");
  const { contract: sample, tx } = await locklift.factory.deployContract({
    contract: "TonOfMaze",
    publicKey: keyPairs!.publicKey,
    initParams: {
      _randomNonce: locklift.utils.getRandomNonce(),
    },
    constructorParams: {
      _deployWalletBalance: 1,
      _tokenRoot: new Address("0:62bdf215061939b90d6132e995441f0944da7d886c9f4bf1d6feed31318d1083"),
    },
    value: locklift.utils.toNano(3),
  });

  console.log(`TonOfMaze deployed at: ${sample.address.toString()}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
