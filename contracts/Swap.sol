// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IERC20.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IUniswapV2Factory.sol";

contract Swap {
    address internal ROUTE_ADDRESS =
        0x10ED43C718714eb63d5aA57B78B54704E256024E; // Dirección del contrato del enrutador de PancakeSwap en BSC
    IUniswapV2Router02 internal route;
    event swap(
        address from,
        address to,
        uint256 amountIn,
        uint256 amountOut
    );
    event swapWithFees(
            address from,
            address to,
            uint256 amountIn,
            uint256 amountOut
    );
    event swapForEth(
            address from,
            address to,
            uint256 amountIn
    );
    event swapWithEth(
            address from,
            address to,
            uint256 amountIn
    );
    function swapETHForToken(address to, uint256 amount) internal {
        address from = route.WETH();
        address[] memory path = new address[](2);
        path[0] = from;
        path[1] = to;
        route
            .swapExactETHForTokensSupportingFeeOnTransferTokens{value: amount}(
            0,
            path,
            address(this),
            block.timestamp + 40 minutes
        );
      emit swapWithEth(from,to,amount);  
    }

    function swapTokenForETH(address from, uint256 amount) internal {
         address to = route.WETH();
        address[] memory path = new address[](2);
        path[0] = from;
        path[1] = to;
        IERC20(from).approve(
            address(route),
            amount
        );
        route
            .swapExactTokensForETHSupportingFeeOnTransferTokens(
                amount,
                0,
                path,
                address(this),
                block.timestamp + 40 minutes
            );
        emit swapForEth(from,to,amount);
    }

    function swapTokenForToken(
        address from,
        address to,
        uint256 amountIn,
        uint256 amountOut
    ) internal {
        IERC20(from).approve(address(route), amountIn);
        address[] memory path = new address[](2);
        path[0] = from;
        path[1] = to;
        uint256 amountRecived = route
            .swapExactTokensForTokens(
                amountIn,
                amountOut,
                path,
                address(this),
                block.timestamp + 40 minutes
            )[1];
        require(amountRecived > 0, "Aborted tx: trade returned zero");
        emit swap(from,to,amountIn,amountOut);
    }

    function swapTokenForTokenWithFee(
        address from,
        address to,
        uint256 amountIn,
        uint256 amountOutWithFee
    ) internal {
        IERC20(from).approve(address(route), amountIn);
        address[] memory path = new address[](2);
        path[0] = from;
        path[1] = to;
        route
            .swapExactTokensForTokensSupportingFeeOnTransferTokens(
                amountIn,
                amountOutWithFee,
                path,
                address(this),
                block.timestamp + 40 minutes
            );
        emit swapWithFees(from,to,amountIn,amountOutWithFee);
    }
}
