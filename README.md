# 项目管理系统

一款基于 Electron 和 Vue 3 构建的现代化桌面应用，用于管理 Web 开发项目。

简体中文 | [English](./README_EN.md)

## 应用截图

### 仪表盘
![仪表盘](./screenshots/01-dashboard.png)

### 项目列表
![项目列表](./screenshots/02-project-list.png)

### 编辑项目
![编辑项目](./screenshots/03-edit-project.png)

## 功能特性

- **项目组织管理**: 在集中的工作区中管理多个项目
- **项目生命周期**: 跟踪项目阶段（待做、已交付、需修改）
- **丰富的项目详情**: 存储客户信息、截止日期、优先级和需求
- **文件附件**: 为项目附加文档、图片和文件
- **批量操作**: 批量导入现有项目文件夹并批量更新项目状态
- **持久化存储**: 自动数据持久化，可配置存储位置
- **现代化界面**: 简洁、专业的界面设计，响应式布局

## 技术栈

- **前端**: Vue 3 + TypeScript + Vite
- **桌面框架**: Electron
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **数据存储**: JSON 文件 + electron-store

## 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

## 安装

1. 克隆仓库
```bash
git clone https://github.com/68057022/Windows-Folder-Management.git
cd project-management-system
```

2. 安装依赖
```bash
npm install
```

## 开发

启动开发服务器：

```bash
npm run electron:dev
```

这将会：
- 启动 Vite 开发服务器在 `http://localhost:5173`
- 启动 Electron 应用程序
- 启用 Vue 组件的热模块替换

## 打包构建

构建生产版本应用：

```bash
npm run electron:build
```

构建后的应用程序将在 `dist` 目录中。

## 项目结构

```
project-management-system/
├── electron/              # Electron 主进程和预加载脚本
│   ├── main.ts           # 主进程
│   └── preload.ts        # IPC 预加载脚本
├── src/                  # Vue 应用源码
│   ├── components/       # 可复用的 Vue 组件
│   ├── views/           # 页面级组件
│   ├── stores/          # Pinia 状态存储
│   ├── types/           # TypeScript 类型定义
│   ├── App.vue          # 根组件
│   ├── main.ts          # 应用入口
│   └── style.css        # 全局样式
├── public/              # 静态资源
├── electron-builder.json # Electron 构建配置
├── package.json         # 项目依赖和脚本
├── tsconfig.json        # TypeScript 配置
└── vite.config.ts       # Vite 配置
```

## 配置

### 数据存储

首次启动时，应用会提示您选择数据存储目录。该目录将包含：
- `projects.json`: 项目数据
- `attachments/`: 项目附件

您可以在设置中更改存储位置。

### 工作区

选择一个工作区文件夹，您的项目文件夹将位于此处。应用将帮助您组织和管理该工作区内的文件夹。


## 可用脚本

- `npm run dev`: 启动 Vite 开发服务器
- `npm run build`: 构建生产版本 Vue 应用
- `npm run electron:dev`: 以开发模式启动 Electron 应用
- `npm run electron:build`: 构建并打包 Electron 应用

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交 Pull Request。

详见 [贡献指南](./CONTRIBUTING_CN.md)

## 支持

如果您遇到任何问题或有疑问，请在 GitHub 仓库中提交 issue。

