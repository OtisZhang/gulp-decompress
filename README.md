
### 项目背景
    简化打包流程，只需将修改后的模块文件夹拷入newCode文件夹，运行命令，即可分别打包出远程服务器包和静态资源包。
    解决MAC不能打tar包问题
### 使用技术
    gulp+TypeScript
### 安装
    
    git clone https://github.com/OtisZhang/gulp-decompress.git 
    npm i 或 yarn
    
### 使用
#### 单独执行打包
文件夹内已配置好，只是进行打包；
```
    第一步  执行指令：gulp clean 
    第二步  将前后端分离已经打好的包拷贝到“newCode”文件夹 
    第三步  将上一个版本的远程资源包和静态资源包放入tar和zip文件夹
    第四步  配置打包参数的curFolderName、curVes、stOrPro
    第五步  执行指令：gulp olpac
```
#### 需替换修改文件的打包
newCode只有修改后的文件夹
```
    第一步  执行指令：gulp clean
    第二步  将修改后的文件夹拷入newCode文件夹
    第三步  配置打包参数的curFolderName、curVes、preVes、stOrPro、packageType
    第四步  将上一个版本的远程资源包和静态资源包放入tar和zip文件夹
    第五步  执行指令 gulp pac
```