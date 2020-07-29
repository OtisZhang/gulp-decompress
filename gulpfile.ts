
/*
 * @Description:
 * @Author: ZhangChuan
 * @Date: 2020-07-01 17:25:56
 * @LastEditors: ZhangChuan
 * @LastEditTime: 2020-07-16 09:47:28
 */


import gulp from 'gulp';
import del from "del"
import * as fs from 'fs';
import decompress from "decompress";

const md5 = require('gulp-md5')
const zip = require('gulp-zip');
const tar = require('gulp-tar');
const pipeConcat = require('pipe-concat')
const pipeQueue = require('pipe-queue')
const colors = require('colors')

// 配置打包参数
// ---------------------------------
/** 需替换的模块名称*/
let curFolderName = 'Authority';
/**打包后的版本号*/
let curVes = '2.0.19.20';
/**打包替换的版本*/
let preVes = '2.0.19.19';
/**如果是两种包都需要，则是1，如果需要静态资源包则2，如果需要tar包则3*/
let packageType = 1;
/** 打包是STATIC还是PRO，p是Pro，s是STATIC */
let stOrPro = 'p';
// -----------------------------------


/**匹配成功的tar包名称*/
let folderNameRe: string;
/**tar包文件全名*/
let curFolderNameFull: string;
/** 需修改的文件夹名*/
let folderNameInitArry: Array<string>;
/** 模块名转小写*/
let curFolderNameLc: string;
/**读取zip压缩包文件名 */
let dataZip: Array<string> = [];
/** 读取tar压缩包文件名 */
let data: Array<string> = [];
/** tar包名的正则表达式*/
let regFolderName: RegExp;
/** zip包名的正则表达式*/
let regFolderNameZip: RegExp;
/** 版本号的正则表达式 */
let regRepalceVes: RegExp;
/**查找对应的tar包 */
let selectFolderTar: Array<string> = [];
/**查找对应的zip包 */
let selectFolderZip: Array<string> = [];
/**解压tar包*/
let tarDec: Promise<any> = Promise.resolve();

const concat = require('pipe-concat');

gulp.task('clean', () => {
    return del(['./newCode/**', '!./newCode', `./repository/**`, `./compress/**`, `!./repository`, `!./compress`])
})

gulp.task('init', async () => {

    /** 解压zip包*/
    let zipDec: Promise<any> = Promise.resolve();
    reddirFuc();

    if (packageType === 2) {
        zipDec = zipDecFuc();
    } else if (packageType === 3) {
        tarDec = tarDecFuc()
    } else {
        zipDec = zipDecFuc();
        tarDec = tarDecFuc()
    }
    await Promise.all([zipDec, tarDec]);

    // 删除mac打包自带的文件
    if (packageType === 2 || packageType === 1) {
        if (fs.existsSync(`./repository/${curFolderNameLc}/__MACOSX`)) {
            await del([`./repository/${curFolderNameLc}/__MACOSX/**`])
        }
    }
    // 删除解压后对应的修改文件夹里的内容
    let objTar: folderArry = {}, objZip: folderArry = {};
    folderNameInitArry.forEach(async (ele) => {
        if (packageType === 2) {
            objZip[ele] = delZipFuc(ele)
        } else if (packageType === 3) {
            objTar[ele] = delTarFuc(ele)
        } else {
            objZip[ele] = delZipFuc(ele);
            objTar[ele] = delTarFuc(ele)
        }
    });
    return Promise.all([...Object.keys(objTar), ...Object.keys(objZip)]);

})

gulp.task('oprRep', async () => {
    let arrTar: Array<any> = [], arrZip: Array<any> = [];
    if (packageType === 2) {
        arrZip = pushZip();
    } else if (packageType === 3) {
        arrTar = pushTar();
    } else {
        arrZip = pushZip();
        arrTar = pushTar();
    }
    const $pipeQueue = new pipeQueue();
    $pipeQueue.when(...arrTar, ...arrZip).then((next: Function, concat: Function) => {
        if (curVes !== preVes && (packageType === 1 || packageType === 3)) {
            if (!fs.existsSync(`./repository/${curFolderNameFull}`)) {
                fs.mkdirSync(`./repository/${curFolderNameFull}`)
            }
            if (!fs.existsSync(`./repository/${curFolderNameFull}/${curFolderNameFull}`)) {
                fs.mkdirSync(`./repository/${curFolderNameFull}/${curFolderNameFull}`)
            }
            const move = gulp.src(`./repository/${folderNameRe}/**`)
                .pipe(gulp.dest(`./repository/${curFolderNameFull}/${curFolderNameFull}`));
            concat(move).on('end', next)
        } else {
            next()
        }
    }).then(async (next: Function, concat: Function) => {
        if (curVes !== preVes && (packageType === 1 || packageType === 3)) {
            await del([`./repository/${folderNameRe}/**`]);
            next()
        } else {
            next()
        }

    })
    return $pipeQueue.promise();
})

gulp.task('decompress', () => {
    let pakageTar: Promise<any> = Promise.resolve(), pakageZip: Promise<any> = Promise.resolve();
    pakageTar = pakageTarFuc()
    pakageZip = pakageZipFuc();
    return concat(pakageTar, pakageZip)
})

gulp.task('pac', gulp.series('init', 'oprRep', 'decompress'))

gulp.task('olpac', () => {
    curFolderNameFull = stOrPro === 'p' ? `SWP-${curFolderName}-${curVes}-PRO` : `SWP-${curFolderName}-${curVes}-STATIC`;
    reddirFuc()
    if (!fs.existsSync(`./newCode/${curFolderNameFull}`)) {
        fs.renameSync(`./newCode/${folderNameInitArry[0]}`, `./newCode/${curFolderNameFull}`)
    }
    return gulp.src(`./newCode/${curFolderNameFull}/**`)
        .pipe(tar(`${curFolderNameFull}.tar`))
        .pipe(gulp.dest('./newCode'))
})
/**
 * 读取newCode文件夹内文件夹名称
 */
function reddirFuc() {
    let arry: Array<string> = fs.readdirSync('./newCode');
    folderNameInitArry = arry.filter(item => {
        return item !== '.DS_Store' && !(new RegExp(`\\bSWP\\b`)).test(item)
    })
}
/**
 * 解压静态资源包
 */
function zipDecFuc(): Promise<any> {
    curFolderNameLc = curFolderName.toLowerCase();
    dataZip = fs.readdirSync("./zip");
    regFolderNameZip = new RegExp(`^H5_${curFolderName}_${preVes}_\\w{32}`, 'i')

    selectFolderZip = dataZip.filter(item => {
        return regFolderNameZip.test(item)
    })
    if (!selectFolderZip || (selectFolderZip as []).length === 0) {
        console.log(colors.red('未找到静态资源包'));
    }
    if (!fs.existsSync(`repository/${curFolderNameLc}`)) {
        fs.mkdirSync(`repository/${curFolderNameLc}`);
    }
    return decompress(`./zip/${selectFolderZip[0]}`, `repository/${curFolderNameLc}`);
}
/**
 * 解压服务器远程资源包
 */
function tarDecFuc(): Promise<any> {

    data = fs.readdirSync("./tar");
    regFolderName = new RegExp(`\\b${curFolderName}\\b`)
    regRepalceVes = RegExp(`\\b${preVes}\\b`)
    selectFolderTar = data.filter(item => {
        return regFolderName.test(item) && regRepalceVes.test(item)
    })
    if (!selectFolderTar || (selectFolderTar as []).length === 0) {
        console.log(colors.red('未找到远程资源包'));
    }
    folderNameRe = selectFolderTar[0].split('.tar')[0];
    curFolderNameFull = stOrPro === 'p' ? `SWP-${curFolderName}-${curVes}-PRO` : `SWP-${curFolderName}-${curVes}-STATIC`;

    return decompress(`./tar/${selectFolderTar[0]}`, 'repository');
}
/**
 *
 * 删除静态资源包需替换的文件夹
 */
function delZipFuc(ele: string) {
    return del([`./repository/${curFolderNameLc}/${curFolderNameLc}/${ele}/**`, `!./repository/${curFolderNameLc}/${curFolderNameLc}/${ele}`])
}
/**
 * 删除服务远程资源包需替换的文件夹
 *
 */
function delTarFuc(ele: string) {
    return del([`./repository/${folderNameRe}/home/${ele}/**`, `!./repository/${folderNameRe}/home/${ele}`])
}
/**
 * 替换远程服务器文件
 */
function pushTar() {
    let arrTar: Array<any> = []
    folderNameInitArry.forEach(async (ele) => {
        arrTar.push(gulp.src(`./newCode/${ele}/**`)
            .pipe(gulp.dest(`./repository/${folderNameRe}/home/${ele}`)))
    })
    return arrTar
}
/**
 * 替换静态资源文件
 */
function pushZip() {
    let arrZip: Array<any> = [];
    folderNameInitArry.forEach(async (ele) => {
        arrZip.push(gulp.src(`./newCode/${ele}/**`)
            .pipe(gulp.dest(`./repository/${curFolderNameLc}/${curFolderNameLc}/${ele}`)))
    })
    return arrZip
}
/**
 * 远程服务器打包
 */
function pakageTarFuc() {
    return gulp.src(`./repository/${curFolderNameFull}/**`)
        .pipe(tar(`${curFolderNameFull}.tar`))
        .pipe(gulp.dest('./newCode'))
}
/**
 * 静态资源打包
 */
function pakageZipFuc() {
    return gulp.src(`./repository/${curFolderNameLc}/**`)
        .pipe(zip(`H5_${curFolderNameLc}_${curVes}.zip`))
        .pipe(md5())
        .pipe(gulp.dest('./newCode'))
}
interface folderArry {
    [propName: string]: any
}
