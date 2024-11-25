# Casino Game API Documentation

## 基础信息
- 基础URL: `${VITE_API_URL}`
- 所有需要认证的接口都需要在请求头中携带: `Authorization: Bearer {token}`
- 所有响应都应该是 JSON 格式

## 错误处理
所有API可能返回的错误格式：
json
{
    "error": {
    "code": "ERROR_CODE",
    "message": "错误信息描述"
    }
}
http
POST /api/auth/login
json
{
"username": "string",
"password": "string"
}
json
{
"token": "jwt_token_string",
"user": {
"id": "string",
"username": "string",
"balance": number
}
}
http
POST /api/auth/logout
json
{
"message": "Successfully logged out"
}
http
GET /api/auth/user
json
{
"id": "string",
"username": "string",
"balance": number
}
http
GET /api/balance
json
{
"balance": number
}
http
POST /api/balance/update
json
{
"amount": number // 可以是正数（增加）或负数（减少）
}
json
{
"balance": number // 更新后的余额
}
http
POST /api/bet
json
{
"amount": number, // 下注金额
"selectedFace": number // 选择的骰子面数（1-6）
}
json
{
"finalNumber": number, // 最终骰子点数
"win": boolean, // 是否获胜
"winAmount": number // 获胜金额（如果赢的话）
}
http
GET /api/history
json
{
"history": [
{
"id": "string",
"amount": number, // 下注金额
"win": boolean, // 是否获胜
"finalBalance": number, // 游戏后余额
"diceResult": number, // 骰子结果
"selectedFace": number, // 选择的面数
"createdAt": "string" // 创建时间
}
]
}
http
POST /api/history
json
{
"amount": number, // 下注金额
"win": boolean, // 是否获胜
"finalBalance": number, // 游戏后余额
"diceResult": number, // 骰子结果
"selectedFace": number // 选择的面数
}
json
{
"id": "string",
"amount": number,
"win": boolean,
"finalBalance": number,
"diceResult": number,
"selectedFace": number,
"createdAt": "string"
}
这个文档详细说明了：
API 的基本信息和认证方式
每个接口的详细说明，包括请求方法、URL、参数和响应格式
错误处理机制
安全性考虑
实现注意事项
这些 API 完整覆盖了骰子游戏所需的所有功能，包括用户认证、余额管理、游戏操作和历史记录等方面。