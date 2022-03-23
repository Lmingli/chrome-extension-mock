> 保存、修改、模拟HTTP请求的响应数据，以无缝开发、测试、演示WEBAPP。

MOCK扩展可在网络级别修改WEB发送的请求，不侵入WEB中任何代码，不会注入js修改原生XMLHttpRequest及fetch对象。并且能够在开发者工具Network面板中查看相应的数据。

### 功能列表
- MOCK扩展将插入开发者工具选项卡面板中。在选项卡中可浏览保存的请求、修改或新建响应数据
- 可在WEB会话生命周期中任意时刻MOCK请求
- 可配置的生效请求域名、忽略的请求链接
- 不会保存相同请求体，并可配置request中忽略的params/data参数
- 单条请求链接级别配置request中忽略的params/data参数
- 可对比勾选的响应数据和真实响应数据的不同
- 对响应数据添加名称以便于区分，并可在popup面板中快速切换响应数据
- 保存及上传完整的配置文件，可用于共享

### 保存请求流程
```sequence
participant WEB as web
participant 控制台MOCK面板 as panel
participant DEVTOOL as devtool
participant BACKGROUND as background
participant CHROME as chrome

panel -> devtool : 开启保存
devtool -> chrome : 保存配置
web -> devtool : 发送请求
devtool -> chrome : 检查是否开启
chrome -->> devtool : 开启保存
devtool -> devtool : 监听req、res
devtool -> devtool : 过滤xhr类型
devtool -> devtool : 过滤redirect
devtool -> background : 发送请求数据
devtool -> background : 发送当前页面地址
background -> chrome : 读取配置
chrome -->> background : 返回配置
background -> background : 检查保存开关是否开启
background -> background : 检查配置的生效请求域名
background -> background : 获取链接中参数
background -> background : 根据配置过滤链接参数
background -> background : 获取请求体中参数
background -> background : 根据配置过滤请求体参数
background -> background : 根据配置信息对比请求数据、响应数据，判断是否重复
background -> background : 保存条数限制检查
background -> background : 整理要保存的数据格式
background -> chrome : 保存数据
chrome -->> background : 保存成功
background -->> panel : 保存成功
```

### MOCK流程
```sequence
participant WEB as web
participant 控制台MOCK面板 as panel
participant DEVTOOL as devtool
participant BACKGROUND as background
participant CHROME as chrome

panel -> devtool : 开启保存
devtool -> chrome : 保存配置
chrome -->> background : 通知开启
web -> background : 发送请求
background -> background : 过滤请求域名
background -> background : 过滤xhr类型
background -> background : 检查是否开启
background -> background : 检查请求链接是否过滤
background -> background : 检查是否有开启MOCK的数据
background -> background : 获取链接中参数
background -> background : 根据配置过滤链接参数
background -> background : 获取请求体中参数
background -> background : 根据配置过滤请求体参数
background -> background : 根据过滤后的请求数据寻找是否有匹配的已保存响应数据
background -> background : 生成DATAURL
background -->> web : 将请求重定向至DATAURL
web -> web : Network中返回DATAURL
web -> web : xhr对象获取响应数据
```
