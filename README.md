
### 单独执行打包
文件夹内已配置好，只是进行打包；
配置打包参数的curFolderName、curVes、stOrPro需配置
```
第一步  执行指令：gulp clean
第二步  指令：gulp olpac
```
### 需替换修改文件的打包
newCode只有修改后的文件夹
配置打包参数的curFolderName、curVes、preVes、stOrPro、packageType需配置
```
第一步  执行指令：gulp clean
第二步  将修改后的文件夹拷如newCode文件夹
第三步  执行指令 gulp pac

```