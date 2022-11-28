import { Address } from "locklift/.";
import { Command } from "commander";
import prompts from "prompts";

import { isValidEverAddress, isNumeric, Migration, zeroAddress } from "./utils";
import BigNumber from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: 257 });

const program = new Command();

const migration = new Migration();

async function main() {
  const keyPairs = await locklift.keystore.getSigner("0");
  const initialSupplyTo = "0:2b20c0d0451c40945fb13b38ae5121128e38a7f15fcbc11f9cc5d8a968b8775d";
  const rootOwner = zeroAddress;
  const name = "Ton Of Maze Token";
  const symbol = "TOMT";
  const decimals = 18;
  const disableMint = false;
  const disableBurnByRoot = false;
  const pauseBurn = false;
  let initialSupply = 100000000000;
  const TokenWallet = locklift.factory.getContractArtifacts("TokenWallet");
  const { contract: tokenRoot } = await locklift.factory.deployContract({
    contract: "TokenRoot",
    publicKey: keyPairs!.publicKey,
    initParams: {
      deployer_: new Address(zeroAddress),
      randomNonce_: (Math.random() * 6400) | 0,
      rootOwner_: rootOwner,
      name_: name,
      symbol_: symbol,
      decimals_: decimals,
      walletCode_: TokenWallet.code,
    },
    constructorParams: {
      initialSupplyTo: initialSupplyTo,
      initialSupply: new BigNumber(initialSupply).shiftedBy(decimals).toFixed(),
      deployWalletValue: locklift.utils.toNano(1),
      mintDisabled: disableMint,
      burnByRootDisabled: disableBurnByRoot,
      burnPaused: pauseBurn,
      remainingGasTo: new Address(zeroAddress),
    },
    value: locklift.utils.toNano(5),
  });

  console.log(`${name}: ${tokenRoot.address}`);
  migration.store(tokenRoot, "token");
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.log(e);
    process.exit(1);
  });
