pragma ton-solidity >=0.59.0;

struct Wallet {
  address tokenWallet;
  uint256 balance;
}

struct Player {
  uint256 score;
  uint level;
  uint256 lastUpdated;
}