# qwebpack-convert

#### 安装方式：npm install qwebpack-convert -g

此工具目的是将一个fekit工程自动转换为一个支持webpack的标准工程，执行方式为命令行到工程根目录，确保工程包含fekit.config文件。

#### 工具做的事情包括
+ 为工程根目录下的fekit_modules文件夹内的模块自动添加package.json，并同步fekit.config文件的内容到这里，这样这个文件夹里的module就是一个标准的node module了
+ 将webpack.config.js模板自动添加到文件根目录下，自动将fekit的export和alias同步进来
+ copy webpack需要用到的package.json模板到根目录下
+ 将pack，sync脚本同步到工程根目录下的build文件夹内，功能和fekit pack，fekit sync相同
+ 本地执行npm install，安装各种包（目前先手动执行，推荐升级到npm3）

以上步骤完成之后这个工程就是一个可以用webpack来打包的工程了。具体使用方法
+ 根目录下面执行webpack命令，执行一次打包过程
+ 启动调试server，根目录下执行qwebpack-server命令
  + --port      改变server端口，默认80
  + --https     启动https模式server
  + --fekit     使用fekit模式启动server，会分析文件require，使用document.write返回
  + --mock      mock数据，参考fekit -m
  + --compress  打包压缩脚本
 
pack, sync命令
+ npm run pack，执行webpack打包，同时生成refs文件夹（vm，scripts，styles，ver文件）
+ npm run sync，将pack生成的refs文件推到开发机
+ npm run pack-sync，简化命令，执行pack && sync
