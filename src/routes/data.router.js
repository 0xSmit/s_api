"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var debug_1 = __importDefault(require("debug"));
var express_1 = require("express");
var web3_1 = __importDefault(require("web3"));
var config_1 = __importDefault(require("config"));
var eth_multicall_1 = require("eth-multicall");
var constants_1 = __importDefault(require("../constants"));
var abi_1 = require("../common/abi");
var bignumber_js_1 = __importDefault(require("bignumber.js"));
var debug = (0, debug_1.default)('app:routes:data');
var router = (0, express_1.Router)();
var web3 = {
    polygon: new web3_1.default(config_1.default.get('Rpc.polygon')),
    avax: new web3_1.default(config_1.default.get('Rpc.avax')),
};
var multicall = {
    polygon: new eth_multicall_1.MultiCall(web3.polygon, constants_1.default.polygon.multicall),
    avax: new eth_multicall_1.MultiCall(web3.avax, constants_1.default.avax.multicall),
};
var tokens = {
    polygon: new web3.polygon.eth.Contract(abi_1.erc20ABI, constants_1.default.polygon.token),
    avax: new web3.avax.eth.Contract(abi_1.erc20ABI, constants_1.default.avax.token),
};
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var polyCalls, avaxCalls, calls, _a, poly, avax, circulatingSupply, burned, data, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                polyCalls = [
                    {
                        totalSupply: tokens.polygon.methods.totalSupply(),
                        burned: tokens.polygon.methods.balanceOf(constants_1.default.polygon.burn),
                    },
                ];
                avaxCalls = [
                    {
                        totalSupply: tokens.avax.methods.totalSupply(),
                        burned: tokens.avax.methods.balanceOf(constants_1.default.avax.burn),
                    },
                ];
                calls = [multicall.polygon.all([polyCalls]), multicall.avax.all([avaxCalls])];
                return [4, Promise.all(calls)];
            case 1:
                _a = _b.sent(), poly = _a[0][0][0], avax = _a[1][0][0];
                circulatingSupply = new bignumber_js_1.default(0).plus(poly.totalSupply).minus(poly.burned).toFixed();
                burned = new bignumber_js_1.default(poly.burned).toFixed();
                data = {
                    tokenname: 'POLYGAJ',
                    symbol: 'GAJ',
                    address: { polygon: constants_1.default.polygon.token, avax: constants_1.default.avax.token },
                    raw: {
                        totalBurned: burned,
                        circulatingSupply: circulatingSupply,
                        totalSupply: circulatingSupply,
                        maxSupply: circulatingSupply,
                        burned: { polygon: poly.burned, avax: avax.burned },
                    },
                    sanitized: {
                        totalBurned: sanitizeDecimals(burned),
                        circulatingSupply: sanitizeDecimals(circulatingSupply),
                        totalSupply: sanitizeDecimals(circulatingSupply),
                        maxSupply: sanitizeDecimals(circulatingSupply),
                        burned: { polygon: sanitizeDecimals(poly.burned), avax: sanitizeDecimals(avax.burned) },
                    },
                };
                res.send(data);
                return [3, 3];
            case 2:
                error_1 = _b.sent();
                debug(error_1.message);
                return [3, 3];
            case 3: return [2];
        }
    });
}); });
function sanitizeDecimals(value, decimals) {
    if (decimals === void 0) { decimals = 18; }
    return new bignumber_js_1.default(value).div(new bignumber_js_1.default(10).pow(decimals)).toFixed();
}
exports.default = router;
