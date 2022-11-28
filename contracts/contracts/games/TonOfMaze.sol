pragma ton-solidity >=0.59.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;
import "@broxus/tip3/contracts/interfaces/ITokenRoot.sol";
import "@broxus/tip3/contracts/interfaces/ITokenWallet.sol";
import "@broxus/tip3/contracts/libraries/TokenMsgFlag.sol";
import "@broxus/contracts/contracts/access/InternalOwner.sol";
import "@broxus/contracts/contracts/utils/CheckPubKey.sol";
import "../abstract/GitcoinWarmupBase.sol";
import "../interfaces/game/ITonOfMaze.sol";
import "../utils/errors/TonOfMazeErrors.sol";
import "../tokens/fungible/TonOfMazeToken.sol";

contract TokenOfMaze is GitcoinWarmupBase, CheckPubKey, InternalOwner, ITonOfMaze {
  uint128 deployWalletBalance;
  address _owner;
  mapping(address => bool) players;
  uint256 constant playPrice = 0.5 ever; //@dev for 1000 Tokens
  uint256 constant claimableTokens = 500000; //@dev for 1000 Tokens

  constructor(uint128 _deployWalletBalance, address _tokenRoot) public checkPubKey {
    require(_tokenRoot != address(0), TonOfMazeErrors.INVALID_ADDRESS);
    tvm.accept();
    _owner = msg.sender;
    tokenRoot_ = _tokenRoot;
    deployWalletBalance = _deployWalletBalance;
    ITokenRoot(tokenRoot_).deployWallet{
      value: deployWalletBalance + msgFee,
      flag: TokenMsgFlag.IGNORE_ERRORS,
      callback: GitcoinWarmupBase.receiveTokenWalletAddress
    }(address(this), deployWalletBalance);
  }

  function transferOwnershipToContract() public onlyOwner {
    owner = address(this);
    setOwnership(address(this));
  }

  function purchaseTokens() public view {
    require(msg.value >= playPrice, TonOfMazeErrors.NOT_ENOUGH_TO_PLAY);
    tvm.accept();
    transferToAddress(address(this), msg.value);
    uint128 tokens = uint128((msg.value * 1000) * uint128(10)**uint128(18));
    this.transferTokens(tokens, msg.sender);
  }

  // This function can transfer currency to an existing contract with fallback
  // function.
  function transferToAddress(address destination, uint128 value) internal pure {
    destination.transfer(value);
  }

  function isFirstTime(address player) public view override returns (bool) {
    return players[player];
  }

  function claimTokens() public override {
    players[msg.sender] = false;
    this.transferTokens(uint128(claimableTokens), msg.sender);
  }
}
