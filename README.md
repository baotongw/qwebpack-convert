# qwebpack-convert
Convert a fekit project to a webpak compatible one

#### 安装方式：npm install qwebpack-convert -g

此工具目的是将一个fekit工程自动转换为一个支持webpack的标准工程，执行方式为命令行到工程根目录，确保工程包含fekit.config文件。

#### 工具做的事情包括
+ 为工程根目录下的fekit_modules文件夹内的模块自动添加package.json，并同步fekit.config文件的内容到这里，这样这个文件夹里的module就是一个标准的node module了
+ 将webpack.config.js模板自动添加到文件根目录下（目前还不支持自动copy fekit.config中的exports、alias，需要手动执行）
+ copy webpack需要用到的package.json模板到根目录下
+ 本地执行npm install，安装各种包
