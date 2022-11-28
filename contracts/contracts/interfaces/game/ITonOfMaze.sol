pragma ton-solidity >=0.57.0;

/// @title ITonOfMaze
/// @author brianspha
/// @notice Interface contains all functions to be implemented by any client that inherits from this interface
/// @dev WIP
interface ITonOfMaze {
  function isFirstTime(address player) external view returns (bool);

  function claimTokens() external;
}
