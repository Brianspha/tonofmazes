pragma ton-solidity >=0.59.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "@broxus/contracts/contracts/utils/RandomNonce.sol";
import "@broxus/tip3/contracts/libraries/TokenMsgFlag.sol";

import "@broxus/tip3/contracts/interfaces/ITokenWallet.sol";
import "@broxus/tip3/contracts/interfaces/IAcceptTokensTransferCallback.sol";
import "@broxus/tip3/contracts/interfaces/IAcceptTokensMintCallback.sol";
import "@broxus/tip3/contracts/interfaces/IBounceTokensTransferCallback.sol";

import "../utils/errors/TonOfMazeErrors.sol";
import "locklift/src/console.sol";

contract GitcoinWarmupBase is
  RandomNonce,
  IAcceptTokensTransferCallback,
  IAcceptTokensMintCallback,
  IBounceTokensTransferCallback
{
  uint128 constant msgFee = 0.5 ever;
  uint128 constant computeFee = 0.1 ever;
  address public tokenRoot_;
  address public hiy;
  address public ki;
  address public tokenWallet;
  uint128 public balance;

  modifier onlyTokenRoot() {
    require(msg.sender == tokenRoot_, TonOfMazeErrors.NOT_TOKEN_ROOT);
    _;
  }

  modifier onlyTokenWallet() {
    require(msg.sender == tokenWallet, TonOfMazeErrors.NOT_TOKEN_WALLET);
    _;
  }

  function transferTokens(uint128 amount, address to) public view {
    TvmCell _empty;
    ITokenWallet(tokenWallet).transfer{
      value: 1 + msgFee,
      flag: TokenMsgFlag.IGNORE_ERRORS,
      bounce: true
    }({
      amount: amount,
      recipient: to,
      deployWalletValue: 1,
      remainingGasTo: address(this),
      notify: true,
      payload: _empty
    });
  }

  function receiveTokenWalletAddress(address wallet) external onlyTokenRoot {
    tokenWallet = wallet;
  }

  function onAcceptTokensTransfer(
    address _tokenRoot,
    uint128 amount,
    address sender,
    address senderWallet,
    address remainingGasTo,
    TvmCell payload
  ) external override onlyTokenWallet {
    balance += amount;
    _tokenRoot;
    sender;
    senderWallet;
    remainingGasTo;
    payload;
  }

  function onAcceptTokensMint(
    address _tokenRoot,
    uint128 amount,
    address remainingGasTo,
    TvmCell payload
  ) external override onlyTokenWallet {
    balance += amount;
    _tokenRoot;
    remainingGasTo;
    payload;
  }

  function onBounceTokensTransfer(address tokenRoot, uint128 amount, address revertedFrom) public override {
    require(msg.sender == tokenWallet, TonOfMazeErrors.NOT_TOKEN_WALLET);
    tvm.accept();
    balance += amount;
    revertedFrom;
    tokenRoot;
    revertedFrom;
  }

  onBounce(TvmSlice body) external {
    uint32 functionId = body.decode(uint32);
    if (functionId == tvm.functionId(ITokenWallet.transfer)) {
      require(msg.sender == tokenWallet, 101);
      uint128 amount = body.decode(uint128);
      balance += amount;
    }
  }
}
