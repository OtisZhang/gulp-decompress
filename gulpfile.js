"use strict";
/*
 * @Description:
 * @Author: ZhangChuan
 * @Date: 2020-07-01 17:25:56
 * @LastEditors: ZhangChuan
 * @LastEditTime: 2020-07-14 21:18:31
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var gulp_1 = __importDefault(require("gulp"));
var del_1 = __importDefault(require("del"));
var fs = __importStar(require("fs"));
var decompress_1 = __importDefault(require("decompress"));
var md5 = require('gulp-md5');
var ts = require('gulp-typescript');
var zip = require('gulp-zip');
var tar = require('gulp-tar');
var pipeConcat = require('pipe-concat');
var pipeQueue = require('pipe-queue');
var colors = require('colors');
// 配置打包参数
// ---------------------------------
/** 需替换的模块名称*/
var curFolderName = 'Authority';
/**打包后的版本号*/
var curVes = '2.0.19.18';
/**打包替换的版本*/
var preVes = '2.0.19.17';
/**如果是两种包都需要，则是1，如果需要静态资源包则2，如果需要tar包则3*/
var packageType = 1;
/** 打包是STATIC还是PRO，p是Pro，s是STATIC */
var stOrPro = 'p';
// -----------------------------------
/**匹配成功的tar包名称*/
var folderNameRe;
/**tar包文件全名*/
var curFolderNameFull;
/** 需修改的文件夹名*/
var folderNameInitArry;
/** 模块名转小写*/
var curFolderNameLc;
/**读取zip压缩包文件名 */
var dataZip = [];
/** 读取tar压缩包文件名 */
var data = [];
/** tar包名的正则表达式*/
var regFolderName;
/** zip包名的正则表达式*/
var regFolderNameZip;
/** 版本号的正则表达式 */
var regRepalceVes;
/**查找对应的tar包 */
var selectFolderTar = [];
/**查找对应的zip包 */
var selectFolderZip = [];
/**解压tar包*/
var tarDec = Promise.resolve();
var concat = require('pipe-concat');
gulp_1.default.task('clean', function () {
    return del_1.default(['./newCode/**', '!./newCode', "./repository/**", "./compress/**", "!./repository", "!./compress"]);
});
gulp_1.default.task('init', function () { return __awaiter(void 0, void 0, void 0, function () {
    var zipDec, objTar, objZip;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                zipDec = Promise.resolve();
                reddirFuc();
                if (packageType === 2) {
                    zipDec = zipDecFuc();
                }
                else if (packageType === 3) {
                    tarDec = tarDecFuc();
                }
                else {
                    zipDec = zipDecFuc();
                    tarDec = tarDecFuc();
                }
                return [4 /*yield*/, Promise.all([zipDec, tarDec])];
            case 1:
                _a.sent();
                if (!(packageType === 2 || packageType === 1)) return [3 /*break*/, 3];
                if (!fs.existsSync("./repository/" + curFolderNameLc + "/__MACOSX")) return [3 /*break*/, 3];
                return [4 /*yield*/, del_1.default(["./repository/" + curFolderNameLc + "/__MACOSX/**"])];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                objTar = {}, objZip = {};
                folderNameInitArry.forEach(function (ele) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        if (packageType === 2) {
                            objZip[ele] = delZipFuc(ele);
                        }
                        else if (packageType === 3) {
                            objTar[ele] = delTarFuc(ele);
                        }
                        else {
                            objZip[ele] = delZipFuc(ele);
                            objTar[ele] = delTarFuc(ele);
                        }
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/, Promise.all(__spreadArrays(Object.keys(objTar), Object.keys(objZip)))];
        }
    });
}); });
gulp_1.default.task('oprRep', function () { return __awaiter(void 0, void 0, void 0, function () {
    var arrTar, arrZip, $pipeQueue;
    return __generator(this, function (_a) {
        arrTar = [], arrZip = [];
        if (packageType === 2) {
            arrZip = pushZip();
        }
        else if (packageType === 3) {
            arrTar = pushTar();
        }
        else {
            arrZip = pushZip();
            arrTar = pushTar();
        }
        $pipeQueue = new pipeQueue();
        $pipeQueue.when.apply($pipeQueue, __spreadArrays(arrTar, arrZip)).then(function (next, concat) {
            if (curVes !== preVes && (packageType === 1 || packageType === 3)) {
                if (!fs.existsSync("./repository/" + curFolderNameFull)) {
                    fs.mkdirSync("./repository/" + curFolderNameFull);
                }
                var move = gulp_1.default.src("./repository/" + folderNameRe + "/**")
                    .pipe(gulp_1.default.dest("./repository/" + curFolderNameFull));
                concat(move).on('end', next);
            }
            else {
                next();
            }
        }).then(function (next, concat) { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(curVes !== preVes && (packageType === 1 || packageType === 3))) return [3 /*break*/, 2];
                        return [4 /*yield*/, del_1.default(["./repository/" + folderNameRe + "/**"])];
                    case 1:
                        _a.sent();
                        next();
                        return [3 /*break*/, 3];
                    case 2:
                        next();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/, $pipeQueue.promise()];
    });
}); });
gulp_1.default.task('decompress', function () {
    var pakageTar = Promise.resolve(), pakageZip = Promise.resolve();
    pakageTar = pakageTarFuc();
    pakageZip = pakageZipFuc();
    return concat(pakageTar, pakageZip);
});
gulp_1.default.task('pac', gulp_1.default.series('init', 'oprRep', 'decompress'));
gulp_1.default.task('olpac', function () {
    curFolderNameFull = stOrPro === 'p' ? "SWP-" + curFolderName + "-" + curVes + "-PRO" : "SWP-" + curFolderName + "-" + curVes + "-STATIC";
    reddirFuc();
    if (!fs.existsSync("./newCode/" + curFolderNameFull)) {
        fs.renameSync("./newCode/" + folderNameInitArry[0], "./newCode/" + curFolderNameFull);
    }
    return gulp_1.default.src("./newCode/" + curFolderNameFull + "/**")
        .pipe(tar(curFolderNameFull + ".tar"))
        .pipe(gulp_1.default.dest('./newCode'));
});
/**
 * 读取newCode文件夹内文件夹名称
 */
function reddirFuc() {
    var arry = fs.readdirSync('./newCode');
    folderNameInitArry = arry.filter(function (item) {
        return item !== '.DS_Store' && !(new RegExp("\\bSWP\\b")).test(item);
    });
}
/**
 * 解压静态资源包
 */
function zipDecFuc() {
    curFolderNameLc = curFolderName.toLowerCase();
    dataZip = fs.readdirSync("./zip");
    regFolderNameZip = new RegExp("^H5_" + curFolderName + "_" + preVes + "_\\w{32}", 'i');
    selectFolderZip = dataZip.filter(function (item) {
        return regFolderNameZip.test(item);
    });
    if (!selectFolderZip || selectFolderZip.length === 0) {
        console.log(colors.red('未找到静态资源包'));
    }
    if (!fs.existsSync("repository/" + curFolderNameLc)) {
        fs.mkdirSync("repository/" + curFolderNameLc);
    }
    return decompress_1.default("./zip/" + selectFolderZip[0], "repository/" + curFolderNameLc);
}
/**
 * 解压服务器远程资源包
 */
function tarDecFuc() {
    data = fs.readdirSync("./tar");
    regFolderName = new RegExp("\\b" + curFolderName + "\\b");
    regRepalceVes = RegExp("\\b" + preVes + "\\b");
    selectFolderTar = data.filter(function (item) {
        return regFolderName.test(item) && regRepalceVes.test(item);
    });
    if (!selectFolderTar || selectFolderTar.length === 0) {
        console.log(colors.red('未找到远程资源包'));
    }
    folderNameRe = selectFolderTar[0].split('.tar')[0];
    curFolderNameFull = stOrPro === 'p' ? "SWP-" + curFolderName + "-" + curVes + "-PRO" : "SWP-" + curFolderName + "-" + curVes + "-STATIC";
    return decompress_1.default("./tar/" + selectFolderTar[0], 'repository');
}
/**
 *
 * 删除静态资源包需替换的文件夹
 */
function delZipFuc(ele) {
    return del_1.default(["./repository/" + curFolderNameLc + "/" + curFolderNameLc + "/" + ele + "/**", "!./repository/" + curFolderNameLc + "/" + curFolderNameLc + "/" + ele]);
}
/**
 * 删除服务远程资源包需替换的文件夹
 *
 */
function delTarFuc(ele) {
    return del_1.default(["./repository/" + folderNameRe + "/home/" + ele + "/**", "!./repository/" + folderNameRe + "/home/" + ele]);
}
/**
 * 替换远程服务器文件
 */
function pushTar() {
    var _this = this;
    var arrTar = [];
    folderNameInitArry.forEach(function (ele) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            arrTar.push(gulp_1.default.src("./newCode/" + ele + "/**")
                .pipe(gulp_1.default.dest("./repository/" + folderNameRe + "/home/" + ele)));
            return [2 /*return*/];
        });
    }); });
    return arrTar;
}
/**
 * 替换静态资源文件
 */
function pushZip() {
    var _this = this;
    var arrZip = [];
    folderNameInitArry.forEach(function (ele) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            arrZip.push(gulp_1.default.src("./newCode/" + ele + "/**")
                .pipe(gulp_1.default.dest("./repository/" + curFolderNameLc + "/" + curFolderNameLc + "/" + ele)));
            return [2 /*return*/];
        });
    }); });
    return arrZip;
}
/**
 * 远程服务器打包
 */
function pakageTarFuc() {
    return gulp_1.default.src("./repository/" + curFolderNameFull + "/**")
        .pipe(tar(curFolderNameFull + ".tar"))
        .pipe(gulp_1.default.dest('./newCode'));
}
/**
 * 静态资源打包
 */
function pakageZipFuc() {
    return gulp_1.default.src("./repository/" + curFolderNameLc + "/**")
        .pipe(zip("H5_" + curFolderNameLc + "_" + curVes + ".zip"))
        .pipe(md5())
        .pipe(gulp_1.default.dest('./newCode'));
}
