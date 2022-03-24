> 保存、修改、模拟HTTP请求的响应数据，以无缝开发、测试、演示WEBAPP。

随着WEB中功能复杂度提升，业务流程变长，在开发和DEBUG过程中用真实数据调试前端代码成本升高。MOCK-PLUS扩展可以模拟接口返回数据供前端反复调试。

### 特点
- 可在网络级别修改WEB发送的请求
- 不侵入WEB中任何代码，不会向页面注入js
- 不会修改原生XMLHttpRequest及fetch对象
- 能够在开发者工具Network面板中查看相应的数据

### 功能列表
- MOCK-PLUS扩展将插入开发者工具选项卡面板中。在选项卡中可浏览保存的请求、修改或新建响应数据
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
participant MOCK面板 as panel
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
background -> background : 根据配置对比请求、响应，\n判断是否重复
background -> background : 保存条数限制检查
background -> background : 整理要保存的数据格式
background -> chrome : 保存数据
chrome -->> background : 保存成功
background -->> panel : 保存成功
```

### MOCK流程
```sequence
participant WEB as web
participant MOCK面板 as panel
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
background -> background : 根据过滤后的请求数据寻找是\n否有匹配的已保存响应数据
background -> background : 生成DATAURL
background -->> web : 将请求重定向至DATAURL
web -> web : Network中返回DATAURL
web -> web : xhr对象获取响应数据
```


### 开发者工具中MOCK面板
<img src="https://assets.luanmingli.com/mock-plus/panel.png" alt="panel" width="1000" />

### popup面板
<img src="https://assets.luanmingli.com/mock-plus/popup.jpg" alt="popup" width="1000" />

### 全局设置项说明
设置项 | 说明
:--- | :---
MOCK | 开启/关闭MOCK。开启时扩展图标上会出现红色MOCK文字
保存请求  | 开启/关闭保存请求的响应数据。开启时扩展图标上会出现蓝色SAVE文字。保存请求需打开开发者工具
生效的请求域名 | xhr请求该域名下的地址时才会触发保存
保存配置文件 | 将扩展所有数据保存至本地
上传配置文件 | 上传配置文件并覆盖扩展当前数据
相同链接条数上限 | 同一链接中保存的数据会按时间正序排列，超出限制条数后会删除最久远的未设置名称并未设置生效的响应数据
检查请求链接参数 | 判断是否已存在响应数据时，是否依据请求时的链接参数判断
检查请求体 | 判断是否已存在响应数据时，是否依据请求时的请求体参数判断
忽略请求链接参数 | 判断是否已存在响应数据时，忽略某些链接中的参数
忽略请求体参数 | 判断是否已存在响应数据时，忽略某些请求体的参数
列表中隐藏url中的字符 | MOCK面板中展示数据时，隐藏请求链接中的某些字符串，鼠标hover时会显示完整链接
过滤url中包含的请求 | 当请求链接中包含某些字符串时，忽略保存该请求
url过滤 | 根据请求链接/设置的名称过滤显示保存的数据
筛选当前页面链接 | 在保存的数据中筛选出从当前WEB链接中发出的数据



### 单条请求链接中设置项
同全局配置项，只对当前请求链接生效

设置项 | 说明
:--- | :---
对比下次请求 | 同时开启MOCK及保存请求，并有生效数据时，会对比该数据和真实返回数据，并且能直接修改保存数据。同一时间只能开启一条对比。
|  | 开启对比后url位置会出现对比图标，点击可取消对比
置顶 | 不同请求链接按请求时间倒序排列，可设置将该条目置顶
| | 置顶后url位置会出现置顶按钮，点击可取消置顶
名称 | 可配置名称，替代URL显示，hover时会显示完整请求地址
过滤RESPONSE | 根据输入的字符串过滤已保存的响应数据
关闭按钮 | 关闭该链接下所有生效的MOCK

### 单条保存数据中设置项
设置项 | 说明
:--- | :---
开启按钮 | 点击开启MOCK后返回该条响应数据
生效按钮 | 点击关闭返回该条响应数据
METHOD | 请求的method
PARAMS | 该请求根据配置项忽略后的链接参数
BODY | 该请求根据配置项忽略后的请求体参数
RESPONSE | 已保存的响应体数据
修改名称 | 设置名称方便查找，并且设置名称后可在popup面板中快速切换
