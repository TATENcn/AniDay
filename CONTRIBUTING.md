# AniDay 数据维护与资源命名规范

为了确保 AniDay 项目的稳定运行及后续的自动化维护，请在添加新角色或修改数据时遵循以下规范。

---

## 1. 数据库管理 (db.json)

目前项目采用 **LowDB** 方案，所有数据集中存储在根目录下的 `db.json` 中。

### 角色条目规范
在 `characters` 数组中添加对象时，字段要求如下：

| 字段 | 类型 | 说明 | 示例 |
| :--- | :--- | :--- | :--- |
| `id` | Integer | 唯一标识符，按顺序递增 | `523` |
| `name` | String | 角色姓名（必填） | `"古河 渚"` |
| `work` | String | 所属作品名称 | `"CLANNAD"` |
| `cv` | String | 声优姓名（可选） | `"中原麻衣"` |
| `avatar` | String | 头像路径，建议存放在 `/avatar/` | `"/avatar/Clannad_Nagisa.jpg"` |
| `month` | Integer | 生日月份 (1-12) | `12` |
| `day` | Integer | 生日日期 (1-31) | `24` |
| `quotes` | Array | 角色名言列表，至少包含一个字符串 | `["生日快乐", "我真的好喜欢这个小镇"]` |
| `tags` | Array | 角色属性标签（可选） | `["女主角", "治愈系"]` |
| `color` | String | 角色代表色 Hex 码（可选） | `"#ffcccc"` |
| `source_url` | String | 详情链接（如萌娘百科）（可选） | `"https://..."` |
| `bg` | String | 角色专属背景（可选） | `"/background/special/nagisa_hill.jpg"` |
| `music` | String | 角色专属音乐（可选） | `"/music/char_nagisa_theme.mp3"` |

---

## 2. 资源命名与存放规范

所有资源文件必须存放在 `public/` 目录下，前端通过以 `/` 开头的绝对路径访问。

### A. 每日背景图 (Daily Backgrounds)
*   **存放位置**: `public/background/`
*   **命名规则**: `月-日.jpg` 或 `月-日.png`
*   **示例**: `/background/5-9.jpg`
*   **注意**: 即使数据库未配置，系统也会自动尝试寻找该命名格式的文件。

### B. 角色头像 (Avatars)
*   **存放位置**: `public/avatar/`
*   **命名规则**: `作品名_角色名.jpg`
*   **示例**: `/avatar/Clannad_FurukawaNagisa.jpg`
*   **注意**: 建议统一尺寸（如 200x200px），格式建议使用 `.jpg` 或 `.webp` 以节省空间。

### C. 音乐文件 (Music)
*   **存放位置**: `public/music/`
*   **命名规则**: `类型_作品名_曲名.格式`
*   **示例**: `/music/char_Clannad_Dango.mp3`
*   **注意**: 浏览器对 `.flac` 的支持较好，但为了兼容性，`.mp3` 也是不错的选择。

---

## 3. 操作流程 (重要)

当你修改完 `db.json` 或添加了新资源后，请务必执行以下步骤：

1.  **保存 `db.json`**。
2.  **执行同步命令**：
    在终端运行以下命令，将数据库更改同步到前端静态目录：
    ```bash
    npm run db:gen
    ```
3.  **预览测试**：
    运行 `npm run dev` 并在浏览器中切换到对应日期，检查：
    - [ ] 角色头像是否显示。
    - [ ] 背景图是否正确。
    - [ ] 音乐是否播放。
    - [ ] 音乐标题/作曲信息是否正确显示。

---

## 4. 常见问题
*   **图片闪烁/不显示**：检查 `db.json` 中的路径是否以 `/` 开头，并确认文件确实存在于 `public/` 对应目录下。
*   **音乐信息报错**：确保音乐文件是完整的且包含 ID3 标签，否则系统将只显示文件名。
