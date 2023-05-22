const { abi } = require("./interfaces/IERC20.json");
const uniSwapRouterAbi = require("./interfaces/IUniswapV2Router02.json");
const testUtils = require("./utils");
const mockData = require("./mock");
const model = require("./model");
const provider = waffle.provider;
var expect = require("chai").expect;

describe("TokenHolder", function () {
  let owner;
  let TokenHolderContract;
  let signer;
  let baseTokenContract;
  let erc20Contract;
  const pancakeRouteContract = new ethers.Contract(
    mockData.swap.PANCAKE_ROUTE, 
    uniSwapRouterAbi.abi, provider);
   describe("init", () => {
    it("Deploy",async ()=>{
      [owner] = await ethers.getSigners();
      TokenHolderContract = await ethers.getContractFactory("TokenHolder");
      TokenHolderContract = await TokenHolderContract.deploy(owner.address,mockData.swap.PANCAKE_ROUTE);
      await TokenHolderContract.deployed();
      baseTokenContract = new ethers.Contract(mockData.token.BUSD, abi, provider);
      signer = await ethers.provider.getSigner();
    })
    it("Send funds to owner", async () => {
      
      await testUtils.impersonateFundErc20(
        baseTokenContract,
        mockData.wallet.BUSD_WHALE,
        owner.address,
        mockData.balance.INITIAL_FUNDING
      );
      const balance = await baseTokenContract.balanceOf(owner.address);
      const amount = ethers.utils.parseUnits(
        mockData.balance.INITIAL_FUNDING,
        18
      );
      expect(balance).to.equal(amount);
      const ownerBnbBalance = await ethers.provider.getBalance(owner.address);
      expect(ownerBnbBalance).not.to.equal(0)
    });
  });
  describe("addToken", () => {
    it("Should add token", async () => {
      await TokenHolderContract.add(
        mockData.token.BUSD,
        model.TOKEN_NAME.BUSD
      );
      const tokenList = await TokenHolderContract.tokenList();
      expect(tokenList).to.have.lengthOf(1);
      expect(tokenList[0].name).to.equal(model.TOKEN_NAME.BUSD);
      expect(tokenList[0].tokenAddress).to.equal(mockData.token.BUSD);
    });
  });
  describe("deposit Token", () => {
    it("Should approve and deposit tokens", async () => {
      const depositAmountInWithDecimal = ethers.utils.parseUnits(mockData.balance.DEPOSIT_AMOUNT.toString(),18);

      erc20Contract = new ethers.Contract(
        mockData.token.BUSD,
        abi,
        signer
      );
      await erc20Contract.approve(TokenHolderContract.address, depositAmountInWithDecimal);
      await TokenHolderContract.deposit(mockData.token.BUSD, depositAmountInWithDecimal);
      const balance = await baseTokenContract.balanceOf(TokenHolderContract.address);
      expect(balance).to.equal(depositAmountInWithDecimal);
    });
    it("getTokenList should return updated balance",async ()=>{
      const depositAmountInWithDecimal = ethers.utils.parseUnits(mockData.balance.DEPOSIT_AMOUNT.toString(),18);
      const tokenList = await TokenHolderContract.tokenList();
      expect(tokenList).to.have.lengthOf(1);
      expect(tokenList[0].balance).to.equal(depositAmountInWithDecimal);
    })
  });
  describe("withdrawToken",()=>{
    it("should send tokens to owner",async ()=>{
      const withdrawTokenAmount = ethers.utils.parseUnits(mockData.balance.WITHDRAW_AMOUNT.toString(),18);
      await TokenHolderContract.withdraw(
        mockData.token.BUSD,
        withdrawTokenAmount
      );
      const tokenList = await TokenHolderContract.tokenList();
      expect(tokenList[0].balance).to.equal(ethers.utils.parseUnits(
        (mockData.balance.DEPOSIT_AMOUNT - mockData.balance.WITHDRAW_AMOUNT ).toString(),18));
    })
  })
  describe('swapTokensForTokens', () => {
    it('should swap busd for wbnb',async () => {
      const buyAmountInDecimals = ethers.utils.parseUnits("1200",18);
      await erc20Contract.approve(TokenHolderContract.address, buyAmountInDecimals);
      await TokenHolderContract.deposit(mockData.token.BUSD, buyAmountInDecimals);
      const amountsOut = await pancakeRouteContract
        .getAmountsOut(ethers.utils.parseUnits("1000", 18), [mockData.token.BUSD, mockData.token.WBNB]);
      await TokenHolderContract.placeTrade(
        mockData.token.BUSD,
        mockData.token.WBNB,
        ethers.utils.parseUnits("1000", 18),
        amountsOut[1]
      );
    });
  });
  describe('swapETHForTokens', () => {
    it('should swap bnb for busd',async () => {
      const buyAmount = ethers.utils.parseUnits("1",18);
      await owner.sendTransaction({
        to: TokenHolderContract.address, 
        value: buyAmount,
      });
      await TokenHolderContract.buyTokenWithEth(
        mockData.token.BUSD,
        ethers.utils.parseUnits("1", 18)
      );
    });
  });
  describe('sellTokensForEth', () => {
    it('should swap busd for eth',async () => {
      await TokenHolderContract.sellTokensForEth(
        mockData.token.BUSD,
        ethers.utils.parseUnits("10", 18)
      );
    });
  });
  describe('buyTokenWithFee', () => {
    it('should swap busd for babydoge',async () => {
        const amountsOut = await pancakeRouteContract.getAmountsOut(ethers.utils.parseUnits("10", 18), [mockData.token.BUSD, mockData.token.BABYDOGE]);
        const feePercentage = 10;
        const amountOutWithFee = amountsOut[1].sub(amountsOut[1].mul(feePercentage).div(100));
      await TokenHolderContract.placeTradeWithFee(
        mockData.token.BUSD,
        mockData.token.BABYDOGE,
        ethers.utils.parseUnits("10", 18),
        amountOutWithFee
      );
    });
  });
});
