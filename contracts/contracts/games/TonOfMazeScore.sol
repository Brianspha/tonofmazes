pragma ton-solidity >=0.59.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "@broxus/contracts/contracts/utils/CheckPubKey.sol";
import "../interfaces/game/ITonOfMaze.sol";
import "../utils/errors/TonOfMazeErrors.sol";
import "../utils/structs/TonOfMazeStructs.sol";

contract TonOfMazeScore is CheckPubKey {
  mapping(address => Player) players;

  constructor() public checkPubKey {
    tvm.accept();
  }

  function upload(uint256 score, uint256 level) public {
    require(msg.sender != address(0), TonOfMazeErrors.INVALID_ADDRESS);
    players[msg.sender].score = score;
    players[msg.sender].level = level;
    players[msg.sender].lastUpdated = block.timestamp;
  }

  function getPlayer(address player) public view returns (uint256, uint256, uint256) {
    return (players[msg.sender].score, players[msg.sender].level, players[msg.sender].lastUpdated);
  }
}
