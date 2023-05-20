// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IERC20.sol";
struct Token {
    address tokenAddress;
    string name;
    uint256 id;
}

contract TokenHolder {
    mapping(uint256 => Token) private tokens;
    address public owner;
    uint256 private tokenCount = 0;
    mapping(address => uint256) private balance;

    event Deposit(address token, uint256 amount);
    event Add(address token, uint256 id);

    constructor() {
        owner = msg.sender;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function addToken(
        address tokenAddress,
        string memory tokenName
    ) external isOwner {
        Token storage newToken = tokens[tokenCount];
        newToken.tokenAddress = tokenAddress;
        newToken.name = tokenName;
        newToken.id = tokenCount;
        tokens[tokenCount] = newToken;
        balance[tokenAddress] = 0;
        emit Deposit(msg.sender, tokenCount);
        tokenCount++;
    }

    function getTokenList() public view returns (Token[] memory) {
        Token[] memory tokenList = new Token[](tokenCount);
        uint256 index = 0;
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenList[index] = tokens[i];
            index++;
        }
        return tokenList;
    }
    function deposit(address tokenAddress, uint256 amount) external {
        require(amount > 0, "Amount must be greater than zero");
        IERC20 token = IERC20(tokenAddress);
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        token.transferFrom(msg.sender, address(this), amount);
        balance[tokenAddress] += amount;
        emit Deposit(tokenAddress, amount);
    }
}
