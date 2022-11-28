const TonOfMazesScore = {
  "ABI version": 2,
  version: "2.2",
  header: ["pubkey", "time", "expire"],
  functions: [
    {
      name: "constructor",
      inputs: [],
      outputs: [],
    },
    {
      name: "upload",
      inputs: [
        { name: "score", type: "uint256" },
        { name: "level", type: "uint256" },
      ],
      outputs: [],
    },
    {
      name: "getPlayer",
      inputs: [{ name: "player", type: "address" }],
      outputs: [
        { name: "value0", type: "uint256" },
        { name: "value1", type: "uint256" },
        { name: "value2", type: "uint256" },
      ],
    },
  ],
  data: [],
  events: [],
  fields: [
    { name: "_pubkey", type: "uint256" },
    { name: "_timestamp", type: "uint64" },
    { name: "_constructorFlag", type: "bool" },
    {
      components: [
        { name: "score", type: "uint256" },
        { name: "level", type: "uint256" },
        { name: "lastUpdated", type: "uint256" },
      ],
      name: "players",
      type: "map(address,tuple)",
    },
  ],
};
module.exports = { TonOfMazesScore };
