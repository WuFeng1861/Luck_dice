<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
    <div class="text-center text-sm text-gray-500 mb-4">
      当前路径: {{ $route.path }}
    </div>
    
    <div class="max-w-7xl mx-auto">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Casino Game API Documentation</h1>
        <p class="mt-2 text-gray-600">API 接口文档</p>
      </div>

      <!-- 基础信息 -->
      <div class="bg-white shadow rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">基础信息</h2>
        <ul class="space-y-2 text-gray-600">
          <li>
            <span class="font-medium">基础URL:</span> 
            <code class="bg-gray-100 px-2 py-1 rounded">{{ baseUrl }}</code>
          </li>
          <li>
            <span class="font-medium">认证头:</span> 
            <code class="bg-gray-100 px-2 py-1 rounded">Authorization: Bearer {token}</code>
          </li>
          <li>
            <span class="font-medium">响应格式:</span> JSON
          </li>
        </ul>
      </div>

      <!-- API 列表 -->
      <div class="space-y-6">
        <div v-for="(category, index) in apiCategories" :key="index" class="bg-white shadow rounded-lg overflow-hidden">
          <!-- 分类标题 -->
          <div class="bg-gray-50 px-6 py-4 border-b">
            <h2 class="text-xl font-semibold text-gray-900">{{ category.title }}</h2>
          </div>

          <!-- API 列表 -->
          <div class="divide-y">
            <div v-for="(api, apiIndex) in category.apis" :key="apiIndex" class="p-6">
              <!-- API 标题和方法 -->
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-medium text-gray-900">{{ api.name }}</h3>
                <div class="flex items-center space-x-2">
                  <span :class="[
                    'px-2 py-1 text-sm font-medium rounded',
                    methodColors[api.method]
                  ]">
                    {{ api.method }}
                  </span>
                  <code class="bg-gray-100 px-2 py-1 rounded text-sm">{{ api.endpoint }}</code>
                </div>
              </div>

              <!-- API 描述 -->
              <p class="text-gray-600 mb-4">{{ api.description }}</p>

              <!-- 认证要求 -->
              <div class="mb-4">
                <span class="text-sm font-medium text-gray-500">需要认证:</span>
                <span :class="api.auth ? 'text-green-600' : 'text-gray-600'">
                  {{ api.auth ? '是' : '否' }}
                </span>
              </div>

              <!-- 请求体 -->
              <template v-if="api.request">
                <div class="mb-4">
                  <h4 class="text-sm font-medium text-gray-900 mb-2">请求体:</h4>
                  <pre class="bg-gray-50 p-4 rounded-lg overflow-x-auto"><code>{{ JSON.stringify(api.request, null, 2) }}</code></pre>
                </div>
              </template>

              <!-- 响应 -->
              <div>
                <h4 class="text-sm font-medium text-gray-900 mb-2">响应:</h4>
                <pre class="bg-gray-50 p-4 rounded-lg overflow-x-auto"><code>{{ JSON.stringify(api.response, null, 2) }}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 错误处理 -->
      <div class="bg-white shadow rounded-lg p-6 mt-6">
        <h2 class="text-xl font-semibold mb-4">错误处理</h2>
        <pre class="bg-gray-50 p-4 rounded-lg overflow-x-auto mb-4"><code>{{ JSON.stringify(errorFormat, null, 2) }}</code></pre>
        <div class="space-y-2">
          <h3 class="font-medium text-gray-900">常见错误状态码:</h3>
          <ul class="list-disc list-inside text-gray-600 space-y-1">
            <li>400: 请求参数错误</li>
            <li>401: 未授权/token失效</li>
            <li>403: 权限不足</li>
            <li>404: 资源不存在</li>
            <li>500: 服务器内部错误</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  console.log('ApiDoc component mounted')
  console.log('Current route:', route.path)
})

const baseUrl = import.meta.env.VITE_API_URL

const methodColors = {
  GET: 'bg-green-100 text-green-800',
  POST: 'bg-blue-100 text-blue-800',
  PUT: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800'
}

const errorFormat = {
  error: {
    code: "ERROR_CODE",
    message: "错误信息描述"
  }
}

const apiCategories = ref([
  {
    title: '认证 API',
    apis: [
      {
        name: '用户登录',
        method: 'POST',
        endpoint: '/api/auth/login',
        description: '用于用户登录并获取认证token',
        auth: false,
        request: {
          username: 'string',
          password: 'string'
        },
        response: {
          token: 'jwt_token_string',
          user: {
            id: 'string',
            username: 'string',
            balance: 0
          }
        }
      },
      {
        name: '用户登出',
        method: 'POST',
        endpoint: '/api/auth/logout',
        description: '用于用户登出，使当前token失效',
        auth: true,
        response: {
          message: 'Successfully logged out'
        }
      },
      {
        name: '获取用户信息',
        method: 'GET',
        endpoint: '/api/auth/user',
        description: '获取当前登录用户的详细信息',
        auth: true,
        response: {
          id: 'string',
          username: 'string',
          balance: 0
        }
      }
    ]
  },
  {
    title: '余额 API',
    apis: [
      {
        name: '获取余额',
        method: 'GET',
        endpoint: '/api/balance',
        description: '获取当前用户的余额信息',
        auth: true,
        response: {
          balance: 0
        }
      },
    ]
  },
  {
    title: '游戏 API',
    apis: [
      {
        name: '下注',
        method: 'POST',
        endpoint: '/api/bet',
        description: '进行游戏下注并获取结果',
        auth: true,
        request: {
          amount: 0,
          selectedFace: 0
        },
        response: {
          finalNumber: 0,
          win: true,
          winAmount: 0
        }
      }
    ]
  },
  {
    title: '历史记录 API',
    apis: [
      {
        name: '获取历史记录',
        method: 'GET',
        endpoint: '/api/history',
        description: '获取用户的游戏历史记录',
        auth: true,
        response: {
          history: [
            {
              id: 'string',
              amount: 0,
              win: true,
              finalBalance: 0,
              diceResult: 0,
              selectedFace: 0,
              createdAt: 'string'
            }
          ]
        }
      },
      {
        name: '添加历史记录',
        method: 'POST',
        endpoint: '/api/history',
        description: '添加新的游戏历史记录',
        auth: true,
        request: {
          amount: 0,
          win: true,
          finalBalance: 0,
          diceResult: 0,
          selectedFace: 0
        },
        response: {
          id: 'string',
          amount: 0,
          win: true,
          finalBalance: 0,
          diceResult: 0,
          selectedFace: 0,
          createdAt: 'string'
        }
      }
    ]
  }
])
</script>

<style scoped>
pre {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

code {
  font-family: inherit;
}
</style> 