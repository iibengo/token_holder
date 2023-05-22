// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./Wallet.sol";
import "./Swap.sol";

contract TokenHolder is Wallet, Swap {
    constructor(address _output, address _route) {
        owner = msg.sender;
        outPut = _output;
        route = IUniswapV2Router02(_route);
    }

    function add(
        address token,
        string memory tokenName
    ) external isOwner {
        addToken(token, tokenName);
    }

    function deposit(address token, uint256 amount) external isOwner {
        depositToken(token, amount);
    }

    function addAndDeposit(
        address token,
        uint256 amount,
        string memory tokenName
    ) external isOwner {
        addToken(token, tokenName);
        depositToken(token, amount);
    }

    function tokenList() external view isOwner returns (Token[] memory) {
        return getTokenList();
    }

    function placeTrade(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    ) external isOwner {
        swapTokenForToken(tokenIn, tokenOut,amountIn, amountOut);
    }
    function buyTokenWithEth(
        address tokenAddress,
        uint256 amount
    ) external isOwner {
        swapETHForToken(tokenAddress, amount);
    }
    function placeTradeWithFee(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOutWithFee
    ) external isOwner {
        swapTokenForTokenWithFee(tokenIn, tokenOut, amountIn,amountOutWithFee);
    }

    function sellTokensForEth(
        address token,
        uint256 amount
    ) external isOwner {
        swapTokenForETH(token, amount);
    }
     function withdraw(address token, uint256 amount) external isOwner {
        withdrawToken(token, amount);
    }
     function updateRoute(address token, uint256 amount) external isOwner {
        withdrawToken(token, amount);
    }
}
