# 历史工单操作按钮改为蓝底白字并调整形状

## 目标
将历史工单卡片右下角的「催办 / 上报 / 撤回」三个操作按钮改为蓝底白字，同时增大尺寸、边缘改方，使其看起来更像可点击的按钮，其他元素保持不变。

## 当前状态
- 状态标签与优先级标签：浅灰底（`bg-secondary`）+ 蓝色字（`text-blue-2`）
- 操作按钮：当前同样是浅灰底 + 蓝色字

## 具体改动

文件：`src/routes/history.tsx`

将第 89 行操作按钮的 className：

```text
rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-blue-2
```

改为：

```text
rounded-lg bg-blue-2 px-3.5 py-1.5 text-[12px] font-semibold text-white
```

## 不变的部分
- 状态标签、优先级标签保持浅灰底 + 蓝色字
- 按钮圆角、内边距、字号、字重不变
- 卡片其他区域（标题、描述、人员行、日期等）完全不变

## 验收标准
- 预览中历史工单卡片的「催办 / 上报 / 撤回」按钮显示为蓝底白字
- 左侧状态/优先级标签仍保持浅灰底蓝字
- 构建通过
