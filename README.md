# dsh-rabi-default-persona

通过设置中的“Rabi”页面连接 Rabi Manager，选择并启用全局人格。聊天侧栏不再提供“计划”入口。

## 安装

锁定公开仓库的提交后，通过 DSH 官方入口安装：

```powershell
pnpm dsh plugin --profile web add github:vb2250158/dsh-rabi-default-persona#<commit>
```

插件包声明 `dsh.bundle`，安装后会把自己的配置层加入 profile。

## 配置

插件配置保存在 DSH profile 的 `cordis.patch.yml`。多电脑同步仓库只保存仓库地址、固定提交、启停状态和配置，不保存本仓库源码。

## 验证

```powershell
npm test
npm run build
npm pack --dry-run
```

## 许可证

MIT

Local integration retains the additional personaPrompt field and editor alongside the Manager binding. The additional prompt is appended independently of the Manager binding switch; the profile loader still owns whether this plugin is enabled.
