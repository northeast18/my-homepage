/**
 * Cloudflare Pages Function: /api/config
 * GET  - 读取站点配置（公开）
 * PUT  - 更新站点配置（需 token 鉴权）
 *
 * KV 绑定名：SITE_KV
 * KV key：site-config
 */

const KV_KEY = 'site-config'

// 默认配置（KV 中没有数据时使用）
const DEFAULT_CONFIG = {
    nickname: '技术探索',
    tagline: '这是我记录点滴碎片感情的小窝',
    avatar: '',
    since: 2021,
    links: [
        { icon: 'fas fa-blog', name: '博客', link: 'https://jishu.nn.kg' },
        { icon: 'fas fa-archive', name: '归档', link: 'https://jishu.nn.kg/archive' },
        { icon: 'fas fa-envelope', name: '邮箱', link: 'mailto:your-email@example.com' },
        { icon: 'fab fa-github', name: 'GitHub', link: 'https://github.com/northeast18' },
        { icon: 'fab fa-bilibili', name: 'Bilibili', link: 'https://bilibili.com' },
        { icon: 'fas fa-rss', name: 'RSS', link: 'https://jishu.nn.kg/feed' },
    ],
    footer: {
        icp: '',
        gongan: '',
    },
}

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/**
 * GET /api/config — 公开读取
 */
export async function onRequestGet(context) {
    const { env } = context

    try {
        if (!env.SITE_KV) {
            return new Response(JSON.stringify(DEFAULT_CONFIG), { headers: CORS_HEADERS })
        }

        const stored = await env.SITE_KV.get(KV_KEY, 'json')
        const config = stored || DEFAULT_CONFIG

        return new Response(JSON.stringify(config), { headers: CORS_HEADERS })
    } catch (err) {
        return new Response(JSON.stringify(DEFAULT_CONFIG), { headers: CORS_HEADERS })
    }
}

/**
 * PUT /api/config — 需要鉴权
 */
export async function onRequestPut(context) {
    const { request, env } = context

    try {
        // 验证 token
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ ok: false, error: '未授权' }), {
                status: 401,
                headers: CORS_HEADERS,
            })
        }

        const token = authHeader.replace('Bearer ', '')

        if (env.SITE_KV) {
            const tokenValid = await env.SITE_KV.get(`token:${token}`)
            if (!tokenValid) {
                return new Response(JSON.stringify({ ok: false, error: 'Token 已过期，请重新登录' }), {
                    status: 401,
                    headers: CORS_HEADERS,
                })
            }
        }

        // 解析并保存配置
        const newConfig = await request.json()

        if (!env.SITE_KV) {
            return new Response(
                JSON.stringify({ ok: false, error: '服务器未绑定 KV 存储，请在 Cloudflare 控制台绑定 SITE_KV' }),
                { status: 500, headers: CORS_HEADERS }
            )
        }

        await env.SITE_KV.put(KV_KEY, JSON.stringify(newConfig))

        return new Response(JSON.stringify({ ok: true }), { headers: CORS_HEADERS })
    } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: '保存失败: ' + err.message }), {
            status: 500,
            headers: CORS_HEADERS,
        })
    }
}

// Handle preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
    })
}
