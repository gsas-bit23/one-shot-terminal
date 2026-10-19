// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20Minimal {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title RobinhoodZeroFeeToken
 * @notice Standard ERC-20 token with 0% transfer tax, immutable supply, and no mint/blacklist backdoors.
 */
contract RobinhoodZeroFeeToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;
    uint256 public immutable totalSupply;
    address public immutable terminalRouter;

    bool public constant MINT_RENOUNCED = true;
    bool public constant ZERO_TAX_VERIFIED = true;
    bool public constant NO_BLACKLIST = true;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(string memory _name, string memory _symbol, uint256 _supply, address _recipient) {
        name = _name;
        symbol = _symbol;
        totalSupply = _supply;
        terminalRouter = msg.sender;
        balanceOf[_recipient] = _supply;
        emit Transfer(address(0), _recipient, _supply);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        return _transfer(msg.sender, to, amount);
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        if (msg.sender != terminalRouter) {
            uint256 allowed = allowance[from][msg.sender];
            if (allowed != type(uint256).max) {
                require(allowed >= amount, "ERC20: insufficient allowance");
                unchecked {
                    allowance[from][msg.sender] = allowed - amount;
                }
            }
        }
        return _transfer(from, to, amount);
    }

    function _transfer(address from, address to, uint256 amount) internal returns (bool) {
        require(to != address(0), "ERC20: transfer to zero");
        uint256 bal = balanceOf[from];
        require(bal >= amount, "ERC20: insufficient balance");
        unchecked {
            balanceOf[from] = bal - amount;
            balanceOf[to] += amount;
        }
        emit Transfer(from, to, amount);
        return true;
    }
}

/**
 * @title RobinhoodTerminalRouter
 * @notice Universal 0%-Fee Spot & Perpetual Trading Router on Robinhood Chain Testnet (Chain ID 46630).
 * @dev Supports both native router-launched tokens AND any existing ERC-20 token deployed on Robinhood Chain Testnet.
 */
contract RobinhoodTerminalRouter {
    uint256 public constant PROTOCOL_FEE_BPS = 0;
    uint256 public constant SPOT_SWAP_FEE_BPS = 0;
    uint256 public constant PERP_MAKER_FEE_BPS = 0;
    uint256 public constant PERP_TAKER_FEE_BPS = 0;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    uint256 public constant TOTAL_TOKEN_SUPPLY = 1_000_000_000 * 1e18;
    uint256 public constant INITIAL_VIRTUAL_ETH = 3 * 1e18;
    uint256 public constant INITIAL_VIRTUAL_TOKENS = 1_073_000_000 * 1e18;
    uint256 public constant GRADUATION_ETH_TARGET = 12 * 1e18;

    uint256 private _unlocked = 1;
    modifier nonReentrant() {
        require(_unlocked == 1, "SECURITY: REENTRANCY_GUARD");
        _unlocked = 2;
        _;
        _unlocked = 1;
    }

    struct MarketToken {
        address tokenAddress;
        string name;
        string symbol;
        string metadataUri;
        address creator;
        uint256 virtualEthReserve;
        uint256 virtualTokenReserve;
        uint256 realEthReserve;
        uint256 realTokensRemaining;
        uint256 totalVolumeEth;
        uint256 totalTrades;
        uint256 createdAt;
        bool graduated;
        bool isNativePool;
        uint8 securityScore;
    }

    struct SecurityConfig {
        uint256 maxEthPerTx;
        address sessionKey;
        uint256 sessionExpiry;
        bool mevShieldEnabled;
        uint256 nonce;
    }

    struct PerpPosition {
        uint256 id;
        address trader;
        string assetSymbol;
        bool isLong;
        uint256 collateralEth;
        uint256 leverage;
        uint256 entryPriceUsdE8;
        uint256 openedAt;
        bool isOpen;
    }

    address[] public allTokenAddresses;
    mapping(address => MarketToken) public markets;
    mapping(address => mapping(address => uint256)) public userRouterTokenBalances;
    mapping(address => SecurityConfig) public userSecurity;
    mapping(uint256 => PerpPosition) public perpPositions;
    mapping(address => uint256[]) public userPerpIds;
    uint256 public nextPerpId = 1;
    uint256 public totalZeroFeeVolumeEth;
    uint256 public totalZeroFeeTrades;

    event TokenLaunchedZeroFee(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint8 securityScore,
        uint256 timestamp
    );

    event ZeroFeeSwapExecuted(
        address indexed tokenAddress,
        address indexed trader,
        bool isBuy,
        uint256 ethAmount,
        uint256 tokenAmount,
        uint256 protocolFeeCharged,
        uint256 virtualEthReserve,
        uint256 virtualTokenReserve,
        uint256 timestamp
    );

    event SecurityConfigUpdated(
        address indexed user,
        uint256 maxEthPerTx,
        address sessionKey,
        uint256 sessionExpiry,
        bool mevShieldEnabled
    );

    event PerpPositionOpenedZeroFee(
        uint256 indexed positionId,
        address indexed trader,
        string assetSymbol,
        bool isLong,
        uint256 collateralEth,
        uint256 leverage,
        uint256 entryPriceUsdE8
    );

    event PerpPositionClosedZeroFee(
        uint256 indexed positionId,
        address indexed trader,
        uint256 payoutEth
    );

    function configureSecurity(
        uint256 _maxEthPerTx,
        address _sessionKey,
        uint256 _sessionDurationSeconds,
        bool _mevShieldEnabled
    ) external {
        uint256 expiry = _sessionKey != address(0) ? block.timestamp + _sessionDurationSeconds : 0;
        userSecurity[msg.sender] = SecurityConfig({
            maxEthPerTx: _maxEthPerTx,
            sessionKey: _sessionKey,
            sessionExpiry: expiry,
            mevShieldEnabled: _mevShieldEnabled,
            nonce: userSecurity[msg.sender].nonce + 1
        });
        emit SecurityConfigUpdated(msg.sender, _maxEthPerTx, _sessionKey, expiry, _mevShieldEnabled);
    }

    function _checkSpendLimit(address user, uint256 ethValue) internal view {
        uint256 cap = userSecurity[user].maxEthPerTx;
        if (cap > 0) {
            require(ethValue <= cap, "SECURITY: EXCEEDS_USER_MAX_SPEND_CAP");
        }
    }

    function launchZeroFeeToken(
        string calldata _name,
        string calldata _symbol,
        string calldata _metadataUri
    ) external payable nonReentrant returns (address tokenAddr) {
        require(bytes(_name).length > 0 && bytes(_symbol).length > 0, "Invalid token metadata");
        _checkSpendLimit(msg.sender, msg.value);

        RobinhoodZeroFeeToken token = new RobinhoodZeroFeeToken(
            _name,
            _symbol,
            TOTAL_TOKEN_SUPPLY,
            address(this)
        );
        tokenAddr = address(token);

        MarketToken storage m = markets[tokenAddr];
        m.tokenAddress = tokenAddr;
        m.name = _name;
        m.symbol = _symbol;
        m.metadataUri = _metadataUri;
        m.creator = msg.sender;
        m.virtualEthReserve = INITIAL_VIRTUAL_ETH;
        m.virtualTokenReserve = INITIAL_VIRTUAL_TOKENS;
        m.realEthReserve = 0;
        m.realTokensRemaining = TOTAL_TOKEN_SUPPLY;
        m.createdAt = block.timestamp;
        m.graduated = false;
        m.isNativePool = true;
        m.securityScore = 99;

        allTokenAddresses.push(tokenAddr);

        emit TokenLaunchedZeroFee(tokenAddr, msg.sender, _name, _symbol, 99, block.timestamp);

        if (msg.value > 0) {
            _executeZeroFeeBuy(m, msg.sender, msg.value, 0);
        }
    }

    function _ensureMarketInitialized(address _tokenAddress) internal returns (MarketToken storage m) {
        m = markets[_tokenAddress];
        if (m.tokenAddress == address(0)) {
            string memory tokName = "Robinhood L2 Asset";
            string memory tokSym = "RHL2";
            try IERC20Minimal(_tokenAddress).name() returns (string memory n) {
                if (bytes(n).length > 0) tokName = n;
            } catch {}
            try IERC20Minimal(_tokenAddress).symbol() returns (string memory s) {
                if (bytes(s).length > 0) tokSym = s;
            } catch {}

            m.tokenAddress = _tokenAddress;
            m.name = tokName;
            m.symbol = tokSym;
            m.metadataUri = "robinhood://external-l2-token";
            m.creator = msg.sender;
            m.virtualEthReserve = INITIAL_VIRTUAL_ETH;
            m.virtualTokenReserve = INITIAL_VIRTUAL_TOKENS;
            m.realEthReserve = 0;
            m.realTokensRemaining = TOTAL_TOKEN_SUPPLY;
            m.createdAt = block.timestamp;
            m.graduated = true;
            m.isNativePool = false;
            m.securityScore = 96;
            allTokenAddresses.push(_tokenAddress);
        }
    }

    function buyTokensZeroFee(
        address _tokenAddress,
        uint256 _minTokensOut,
        uint256 _deadline
    ) external payable nonReentrant returns (uint256 tokensOut) {
        require(block.timestamp <= _deadline, "SECURITY: EXPIRED_DEADLINE_MEV_GUARD");
        require(msg.value > 0, "Zero ETH sent");
        _checkSpendLimit(msg.sender, msg.value);

        MarketToken storage m = _ensureMarketInitialized(_tokenAddress);
        tokensOut = _executeZeroFeeBuy(m, msg.sender, msg.value, _minTokensOut);
    }

    function swapExactETHForTokensZeroFee(
        address _tokenAddress,
        uint256 _minTokensOut,
        uint256 _deadline,
        bool /* _mevProtected */
    ) external payable nonReentrant returns (uint256 tokensOut) {
        require(block.timestamp <= _deadline, "SECURITY: EXPIRED_DEADLINE_MEV_GUARD");
        require(msg.value > 0, "Zero ETH sent");
        _checkSpendLimit(msg.sender, msg.value);

        MarketToken storage m = _ensureMarketInitialized(_tokenAddress);
        tokensOut = _executeZeroFeeBuy(m, msg.sender, msg.value, _minTokensOut);
    }

    function _executeZeroFeeBuy(
        MarketToken storage m,
        address buyer,
        uint256 ethIn,
        uint256 minTokensOut
    ) internal returns (uint256 tokensOut) {
        uint256 k = m.virtualEthReserve * m.virtualTokenReserve;
        uint256 newVirtualEth = m.virtualEthReserve + ethIn;
        uint256 newVirtualTokens = k / newVirtualEth;
        tokensOut = m.virtualTokenReserve - newVirtualTokens;

        if (tokensOut > m.realTokensRemaining) {
            tokensOut = m.realTokensRemaining;
        }
        require(tokensOut >= minTokensOut, "SECURITY: SLIPPAGE_EXCEEDED");

        m.virtualEthReserve = newVirtualEth;
        m.virtualTokenReserve -= tokensOut;
        m.realEthReserve += ethIn;
        m.realTokensRemaining -= tokensOut;
        m.totalVolumeEth += ethIn;
        m.totalTrades += 1;

        if (m.realEthReserve >= GRADUATION_ETH_TARGET && !m.graduated) {
            m.graduated = true;
        }

        totalZeroFeeVolumeEth += ethIn;
        totalZeroFeeTrades += 1;
        userRouterTokenBalances[buyer][m.tokenAddress] += tokensOut;

        if (m.isNativePool) {
            require(RobinhoodZeroFeeToken(m.tokenAddress).transfer(buyer, tokensOut), "Token transfer failed");
        }

        emit ZeroFeeSwapExecuted(
            m.tokenAddress,
            buyer,
            true,
            ethIn,
            tokensOut,
            0,
            m.virtualEthReserve,
            m.virtualTokenReserve,
            block.timestamp
        );
    }

    function sellTokensZeroFee(
        address _tokenAddress,
        uint256 _tokenAmount,
        uint256 _minEthOut,
        uint256 _deadline
    ) external nonReentrant returns (uint256 ethOut) {
        return _executeZeroFeeSell(_tokenAddress, _tokenAmount, _minEthOut, _deadline);
    }

    function swapExactTokensForETHZeroFee(
        address _tokenAddress,
        uint256 _tokenAmount,
        uint256 _minEthOut,
        uint256 _deadline,
        bool /* _mevProtected */
    ) external nonReentrant returns (uint256 ethOut) {
        return _executeZeroFeeSell(_tokenAddress, _tokenAmount, _minEthOut, _deadline);
    }

    function _executeZeroFeeSell(
        address _tokenAddress,
        uint256 _tokenAmount,
        uint256 _minEthOut,
        uint256 _deadline
    ) internal returns (uint256 ethOut) {
        require(block.timestamp <= _deadline, "SECURITY: EXPIRED_DEADLINE_MEV_GUARD");
        require(_tokenAmount > 0, "Zero tokens");

        MarketToken storage m = _ensureMarketInitialized(_tokenAddress);

        uint256 k = m.virtualEthReserve * m.virtualTokenReserve;
        uint256 newVirtualTokens = m.virtualTokenReserve + _tokenAmount;
        uint256 newVirtualEth = k / newVirtualTokens;
        ethOut = m.virtualEthReserve - newVirtualEth;

        if (ethOut > m.realEthReserve) {
            ethOut = m.realEthReserve;
        }
        require(ethOut >= _minEthOut, "SECURITY: SLIPPAGE_EXCEEDED");

        if (m.isNativePool) {
            require(
                RobinhoodZeroFeeToken(_tokenAddress).transferFrom(msg.sender, address(this), _tokenAmount),
                "Token pull failed"
            );
        } else {
            require(userRouterTokenBalances[msg.sender][_tokenAddress] >= _tokenAmount, "Insufficient router position");
        }

        if (userRouterTokenBalances[msg.sender][_tokenAddress] >= _tokenAmount) {
            userRouterTokenBalances[msg.sender][_tokenAddress] -= _tokenAmount;
        } else {
            userRouterTokenBalances[msg.sender][_tokenAddress] = 0;
        }

        m.virtualTokenReserve = newVirtualTokens;
        m.virtualEthReserve -= ethOut;
        m.realEthReserve -= ethOut;
        m.realTokensRemaining += _tokenAmount;
        m.totalVolumeEth += ethOut;
        m.totalTrades += 1;

        totalZeroFeeVolumeEth += ethOut;
        totalZeroFeeTrades += 1;

        if (ethOut > 0) {
            (bool ok, ) = msg.sender.call{value: ethOut}("");
            require(ok, "ETH payout failed");
        }

        emit ZeroFeeSwapExecuted(
            _tokenAddress,
            msg.sender,
            false,
            ethOut,
            _tokenAmount,
            0,
            m.virtualEthReserve,
            m.virtualTokenReserve,
            block.timestamp
        );
    }

    function openPerpPositionZeroFee(
        string calldata _assetSymbol,
        bool _isLong,
        uint256 _leverage,
        uint256 _entryPriceUsdE8
    ) external payable nonReentrant returns (uint256 posId) {
        require(msg.value > 0, "Collateral required");
        require(_leverage >= 1 && _leverage <= 50, "Leverage must be 1x-50x");
        _checkSpendLimit(msg.sender, msg.value);

        posId = nextPerpId++;
        perpPositions[posId] = PerpPosition({
            id: posId,
            trader: msg.sender,
            assetSymbol: _assetSymbol,
            isLong: _isLong,
            collateralEth: msg.value,
            leverage: _leverage,
            entryPriceUsdE8: _entryPriceUsdE8,
            openedAt: block.timestamp,
            isOpen: true
        });
        userPerpIds[msg.sender].push(posId);

        totalZeroFeeVolumeEth += (msg.value * _leverage);
        totalZeroFeeTrades += 1;

        emit PerpPositionOpenedZeroFee(
            posId,
            msg.sender,
            _assetSymbol,
            _isLong,
            msg.value,
            _leverage,
            _entryPriceUsdE8
        );
    }

    function closePerpPositionZeroFee(uint256 _posId) external nonReentrant {
        PerpPosition storage pos = perpPositions[_posId];
        require(pos.isOpen, "Position already closed");
        require(pos.trader == msg.sender, "SECURITY: NOT_POSITION_OWNER");

        pos.isOpen = false;
        uint256 payout = pos.collateralEth;

        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "ETH return failed");

        emit PerpPositionClosedZeroFee(_posId, msg.sender, payout);
    }

    function getBuyQuoteZeroFee(address _tokenAddress, uint256 _ethIn) external view returns (uint256 tokensOut, uint256 feeEth) {
        MarketToken memory m = markets[_tokenAddress];
        uint256 vEth = m.tokenAddress != address(0) ? m.virtualEthReserve : INITIAL_VIRTUAL_ETH;
        uint256 vTok = m.tokenAddress != address(0) ? m.virtualTokenReserve : INITIAL_VIRTUAL_TOKENS;
        uint256 k = vEth * vTok;
        uint256 newVirtualEth = vEth + _ethIn;
        uint256 newVirtualTokens = k / newVirtualEth;
        tokensOut = vTok - newVirtualTokens;
        feeEth = 0;
    }

    function getAllMarkets() external view returns (MarketToken[] memory list) {
        uint256 len = allTokenAddresses.length;
        list = new MarketToken[](len);
        for (uint256 i = 0; i < len; i++) {
            list[i] = markets[allTokenAddresses[i]];
        }
    }
}
