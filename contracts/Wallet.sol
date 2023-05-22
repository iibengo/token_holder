// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IERC20.sol";
struct Token {
    address tokenAddress;
    string name;
    uint256 id;
    uint256 balance;
}

contract Wallet {
    address internal owner;
    uint256 public capital = 0;
    uint256 private tokenCount = 0;
    mapping(uint256 => Token) private tokens;
    mapping(address => uint256) private balance;
    address internal outPut;
    event Deposit(address token, uint256 amount);
    event Add(address token, uint256 id);

    function addToken(
        address tokenAddress,
        string memory tokenName
    ) internal  {
        Token storage newToken = tokens[tokenCount];
        newToken.tokenAddress = tokenAddress;
        newToken.name = tokenName;
        newToken.id = tokenCount;
        newToken.balance = 0;
        tokens[tokenCount] = newToken;
        balance[tokenAddress] = 0;
        emit Deposit(msg.sender, tokenCount);
        tokenCount++;
    }

    function getTokenList() internal view returns (Token[] memory) {
        Token[] memory tokenList = new Token[](tokenCount);
        uint256 index = 0;
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenList[index] = tokens[i];
            tokenList[index].balance = balance[tokenList[index].tokenAddress];
            index++;
        }
        return tokenList;
    }
    function depositToken(address tokenAddress, uint256 amount) internal {
        require(amount > 0, "Amount must be greater than zero");
        IERC20 token = IERC20(tokenAddress);
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        token.transferFrom(msg.sender, address(this), amount);
        balance[tokenAddress] += amount;
        emit Deposit(tokenAddress, amount);
    }
    function withdrawETH(uint256 amount) internal {
        require(capital >= amount, "Capital must be geater or equal than amount");
        payable(outPut).transfer(amount);
        capital -= amount;
    }  
    function withdrawToken(address tokenAddress, uint256 amount) internal {
        require(balance[tokenAddress] >= amount, "Insufficient balance");
        balance[tokenAddress] -= amount;
        IERC20 token = IERC20(tokenAddress);
        token.approve(address(this), amount);
        token.transfer(outPut, amount);
    }  
    receive() external payable {
        capital += msg.value;
    }
      modifier isOwner()  {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
}
