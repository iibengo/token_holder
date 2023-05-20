const { abi } = require("./interfaces/IERC20.json");
const testUtils = require("./utils/");
const mockData = require("./mock");
const model = require("./model");
const provider = waffle.provider;
var expect = require("chai").expect;

describe("TokenHolder", function () {
  let owner;
  let TokenHolderContract;
  let signer;
  let baseTokenContract;
  beforeEach(async () => {
    TokenHolderContract = await ethers.getContractFactory("TokenHolder");
    TokenHolderContract = await TokenHolderContract.deploy();
    await TokenHolderContract.deployed();
    [owner] = await ethers.getSigners();
    baseTokenContract = new ethers.Contract(mockData.token.BUSD, abi, provider);
    signer = await ethers.provider.getSigner();
  });

  describe("init", () => {
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
    });
  });
  describe("TokenHolder", () => {
    it("Should be owner", async () => {
      const contractOwner = await TokenHolderContract.owner();
      expect(contractOwner).to.equal(owner.address);
    });
  });
  describe("addToken", () => {
    it("Should add token", async () => {
      await TokenHolderContract.addToken(
        mockData.token.BUSD,
        model.TOKEN_NAME.BUSD
      );
      const tokenList = await TokenHolderContract.getTokenList();
      expect(tokenList).to.have.lengthOf(1);
      expect(tokenList[0].name).to.equal(model.TOKEN_NAME.BUSD);
      expect(tokenList[0].tokenAddress).to.equal(mockData.token.BUSD);
    });
  });
  describe("deposit Token", () => {
    it("Should approve and deposit tokens", async () => {
      var depositAmount = ethers.utils.parseUnits(
        mockData.balance.INIT_BALANCE,
        18
      );
      const erc20Contract = new ethers.Contract(
        mockData.token.BUSD,
        abi,
        signer
      );
      await erc20Contract.approve(TokenHolderContract.address, depositAmount);
      await TokenHolderContract.deposit(mockData.token.BUSD, depositAmount);
      const balance = await baseTokenContract.balanceOf(TokenHolderContract.address);
      expect(balance).to.equal(depositAmount);
    });
  });
});
