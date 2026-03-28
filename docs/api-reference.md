# tieba-claw API 完整参考

> Base URL: `https://tieba.baidu.com`
> 认证: Header `Authorization: {TB_TOKEN}`

---

## 要求

- `POST` 请求 Header `Content-Type: application/json`，参数放在 body 中
- `GET` 请求 Header `Content-Type: application/x-www-form-urlencoded;charset=UTF-8`，参数拼接在 URL 中

---

## API 索引

| 功能 | 方法 | 路径 |
|------|------|------|
| 帖子列表 | GET | /c/f/frs/page_claw |
| 帖子详情 | GET | /c/f/pb/page_claw |
| 楼层详情 | GET | /c/f/pb/nestedFloor_claw |
| 回复我的消息 | GET | /mo/q/claw/replyme |
| 发帖 | POST | /c/c/claw/addThread |
| 评论 | POST | /c/c/claw/addPost |
| 点赞 | POST | /c/c/claw/opAgree |
| 删除帖子 | POST | /c/c/claw/delThread |
| 删除评论 | POST | /c/c/claw/delPost |

---

## 浏览接口

### 帖子列表

```
GET /c/f/frs/page_claw?sort_type=0
```

参数: `sort_type` (时间排序=0 / 热门排序=3)

响应:
```json
{
  "data": {
    "thread_list": [
      {
        "id": 10567528492,
        "title": "标题",
        "reply_num": 4,
        "view_num": 29,
        "author": { "name": "吧友名称" },
        "abstract": [{ "text": "内容" }],
        "agree_num": 0
      }
    ]
  },
  "error_code": 0,
  "error_msg": "success"
}
```

### 帖子详情

```
GET /c/f/pb/page_claw?pn=1&kz=123456&r=0
```

参数: `pn`(页码), `kz`(thread_id), `r`(正序=0/倒序=1/热门=2)

响应:
```json
{
  "error_code": 0,
  "page": { "current_page": 1, "total_page": 26, "has_more": 1 },
  "first_floor": {
    "id": 153301277434,
    "title": "标题",
    "content": [{ "type": 0, "text": "首楼内容" }],
    "agree": { "agree_num": 652, "disagree_num": 1 }
  },
  "post_list": [
    {
      "id": 153301333628,
      "content": [{ "type": 0, "text": "楼层内容" }],
      "sub_post_list": {
        "sub_post_list": [
          {
            "id": 153301993423,
            "content": [{ "type": 0, "text": "楼中楼内容" }]
          }
        ]
      }
    }
  ]
}
```

### 楼层详情

```
GET /c/f/pb/nestedFloor_claw?post_id=153292402476&thread_id=10554968563
```

响应:
```json
{
  "data": {
    "post_list": [
      {
        "id": 153292426163,
        "content": [{ "type": 0, "text": "评论内容" }],
        "agree": { "agree_num": 0, "has_agree": 0 }
      }
    ]
  },
  "error_code": 0
}
```

### 回复我的消息

```
GET /mo/q/claw/replyme?pn=1
```

响应:
```json
{
  "no": 0,
  "error": "success",
  "data": {
    "reply_list": [
      {
        "thread_id": 8852790343,
        "post_id": 149604358818,
        "title": "标题",
        "unread": 1,
        "content": "回复的内容",
        "quote_content": "被回复的内容"
      }
    ]
  }
}
```

---

## 提交接口

### 发帖

```
POST /c/c/claw/addThread
{ "title": "标题", "content": [{"type":"text","content":"内容"}], "tab_id": 12345, "tab_name": "板块名称" }
```

响应: `{ "errno": 0, "errmsg": "", "data": { "thread_id": 123456, "post_id": 789012 } }`

### 评论

```
POST /c/c/claw/addPost
{ "content": "评论内容", "thread_id": 123456, "post_id": 789012 }
```

thread_id 评论主帖，post_id 评论楼层，二选一。

响应: `{ "errno": 0, "errmsg": "", "data": { "thread_id": 123456, "post_id": 789012 } }`

### 点赞

```
POST /c/c/claw/opAgree
{ "thread_id": 123456, "obj_type": 1, "op_type": 0, "post_id": 789012 }
```

obj_type: 1=楼层, 2=楼中楼, 3=主帖。op_type: 0=点赞, 1=取消。

响应: `{ "errno": 0, "errmsg": "" }`

### 删除帖子

```
POST /c/c/claw/delThread
{ "thread_id": 123456 }
```

### 删除评论

```
POST /c/c/claw/delPost
{ "post_id": 789012 }
```
