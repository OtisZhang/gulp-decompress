/*
 * @Description: 
 * @Author: ZhangChuan
 * @Date: 2020-07-01 17:25:56
 * @LastEditors: ZhangChuan
 * @LastEditTime: 2020-07-14 11:47:58
 */


import gulp from 'gulp';
import rename from "gulp-rename";
import del from "del"
import * as fs from 'fs';
import decompress from "decompress";

const md5 = require('gulp-md5')
const ts = require('gulp-typescript');
const zip = require('gulp-zip');
const tar = require('gulp-tar');
const pipeConcat = require('pipe-concat')
const pipeQueue = require('pipe-queue')


// 配置打包参数
// ---------------------------------
/** 需替换的模块名称*/
let curFolderName = 'Authority';
/**打包后的版本号*/
let curVes = '2.0.19.18';
/**打包替换的版本*/
let preVes = '2.0.19.17';
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
    let arry: Array<string> = fs.readdirSync('./newCode');
    folderNameInitArry = arry.filter(item => {
        return item !== '.DS_Store' && !(new RegExp(`\\bSWP\\b`)).test(item)
    })
    regFolderNameZip = new RegExp(`^H5_${curFolderName}_${preVes}_\\w{32}`, 'i')
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
    folderNameInitArry.forEach(async (ele) => {
        arrTar.push(gulp.src(`./newCode/${ele}/**`)
            .pipe(gulp.dest(`./repository/${folderNameRe}/home/${ele}`)))
    })
    folderNameInitArry.forEach(async (ele) => {
        arrZip.push(gulp.src(`./newCode/${ele}/**`)
            .pipe(gulp.dest(`./repository/${curFolderNameLc}/${curFolderNameLc}/${ele}`)))
    })

    const $pipeQueue = new pipeQueue();
    $pipeQueue.when(...arrTar, ...arrZip).then((next: Function, concat: Function) => {
        if (curVes !== preVes) {
            const editName = gulp.src(`./repository/${folderNameRe}`)
                .pipe(rename(`${curFolderNameFull}`))
                .pipe(gulp.dest(`./repository`))
            concat(editName).on('end', next)
        } else {
            next()
        }
    }
    ).then((next: Function, concat: Function) => {
        if (curVes !== preVes) {
            const move = gulp.src(`./repository/${folderNameRe}/**`)
                .pipe(gulp.dest(`./repository/${curFolderNameFull}`));
            concat(move).on('end', next)
        } else {
            next()
        }
    }).then(async (next: Function, concat: Function) => {
        if (curVes !== preVes) {
            await del([`./repository/${folderNameRe}/**`]);
            next()
        } else {
            next()
        }

    })
    return $pipeQueue.promise();
})

gulp.task('decompress', () => {

    const pakageTar = gulp.src(`./repository/${curFolderNameFull}/**`)
        .pipe(tar(`${curFolderNameFull}.tar`))
        .pipe(gulp.dest('./newCode'))

    const pakageZip = gulp.src(`./repository/${curFolderNameLc}/**`)
        .pipe(zip(`H5_${curFolderNameLc}_${curVes}.zip`))
        .pipe(md5())
        .pipe(gulp.dest('./newCode'))
    return concat(pakageTar, pakageZip)
})

gulp.task('pac', gulp.series('init', 'oprRep', 'decompress'))
/**
 * 解压静态资源包
 */
function zipDecFuc(): Promise<any> {
    curFolderNameLc = curFolderName.toLowerCase();
    dataZip = fs.readdirSync("./zip");
    regFolderName = new RegExp(`\\b${curFolderName}\\b`)
    selectFolderZip = dataZip.filter(item => {
        return regFolderNameZip.test(item)
    })
    if (!selectFolderZip || (selectFolderZip as []).length === 0) {
        console.log('无可替换的远程资源包')
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

    regRepalceVes = RegExp(`\\b${preVes}\\b`)
    selectFolderTar = data.filter(item => {
        return regFolderName.test(item) && regRepalceVes.test(item)
    })
    if (!selectFolderTar || (selectFolderTar as []).length === 0) {
        console.log('无可替换的远程资源包')
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
interface folderArry {
    [propName: string]: any
}
