const {  ethers } = require("hardhat");
const getAmountOut = async (contract, amountIn, from, to) => {
    console.log( amountIn, from, to);
    const amountOut =  await contract
    .getAmountsOut(ethers.utils.parseUnits("1000", 18), [mockData.token.BUSD, mockData.token.WBNB]);
    return amountOut;
  };
  module.exports = {
    getAmountOut:getAmountOut
  };
  