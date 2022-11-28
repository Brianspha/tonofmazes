pragma ton-solidity >=0.59.0;

import "@broxus/contracts/contracts/libraries/MsgFlag.sol";
import "@broxus/tip3/contracts/TokenRoot.sol";
import "@broxus/contracts/contracts/utils/CheckPubKey.sol";
import "@broxus/contracts/contracts/utils/RandomNonce.sol";
import "@broxus/contracts/contracts/access/InternalOwner.sol";
import "@broxus/tip3/contracts/interfaces/ITokenRoot.sol";
import "@broxus/tip3/contracts/interfaces/ITokenWallet.sol";
import "@broxus/tip3/contracts/libraries/TokenMsgFlag.sol";
import "../../utils/errors/TonOfMazeErrors.sol";
import "../../utils/structs/TonOfMazeStructs.sol";

contract TonOfMazeToken is CheckPubKey, InternalOwner, RandomNonce {
  uint32 static randomNonce_;
  address owner_;
  TvmCell rootCode_;
  address awaitedRoot;
  TvmCell walletCode_;
  uint8  decimals;
  uint128 constant msgFee = 0.5 ever;
  uint128 constant computeFee = 0.1 ever;
  // tokenRoot => Wallet
  mapping(address => Wallet) public wallets;

  // tokenWallet => TokenRoot
  mapping(address => address) public tokenRoots;

  modifier onlyTokenWallet(address _tokenRoot) {
    require(msg.sender == wallets[_tokenRoot].tokenWallet, TonOfMazeErrors.NOT_TOKEN_WALLET);
    _;
  }

  constructor() public checkPubKey {
    tvm.accept();
    owner_ = msg.sender;
    setOwnership(owner_);
  }

  function changeOwner(address newOwner) public onlyOwner checkPubKey {
    owner_ = msg.sender;
    setOwnership(newOwner);
  }


  function deployTokenRoot(
    string name,
    string symbol,
    uint8 decimals_,
    address addressToOther,
    address initialSupplyTo,
    uint128 initialSupply,
    uint128 deployWalletValue,
    bool mintDisabled,
    bool burnByRootDisabled,
    bool burnPaused,
    address remainingGasTo
  ) public returns (address) {
    tvm.accept();
    TvmCell initData = tvm.buildStateInit({
      contr: TokenRoot,
      varInit: {
        randomNonce_: now,
        deployer_: address(this),
        rootOwner_: msg.sender,
        name_: name,
        symbol_: symbol,
        decimals_: decimals_,
        walletCode_: walletCode_
      },
      pubkey: 0,
      code: rootCode_
    });
    decimals = decimals_;
    address tokenRoot = new TokenRoot{ stateInit: initData, value: 2 ever, flag: MsgFlag.SENDER_PAYS_FEES }(
      initialSupplyTo,
      initialSupply,
      deployWalletValue,
      mintDisabled,
      burnByRootDisabled,
      burnPaused,
      remainingGasTo
    );
    awaitedRoot = tokenRoot;
    this.transfer(initialSupply / 2, addressToOther, 0);
    return tokenRoot;
  }

  function transfer(uint128 _amount, address _recipient, uint128 _deployWalletValue) public onlyOwner {
    require(wallets.exists(awaitedRoot), TonOfMazeErrors.WALLET_NOT_EXISTS);
    Wallet wallet = wallets[awaitedRoot];
    require(wallet.balance >= _amount, TonOfMazeErrors.NOT_ENOUGH_BALANCE);
    tvm.accept();

    wallet.balance -= _amount;
    wallets[awaitedRoot] = wallet;

    TvmCell _empty;
    ITokenWallet(wallet.tokenWallet).transfer{
      value: _deployWalletValue + msgFee,
      flag: TokenMsgFlag.IGNORE_ERRORS,
      bounce: true
    }({
      amount: _amount,
      recipient: _recipient,
      deployWalletValue: _deployWalletValue,
      remainingGasTo: address(this),
      notify: true,
      payload: _empty
    });
  }
}
