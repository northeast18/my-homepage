/**
 * Cloudflare Pages Function: POST /api/login
 * 验证管理员密码，返回 token
 *
 * 环境变量：ADMIN_PASSWORD
 */

export async function onRequestPost(context) {
    const { request, env } = context

    // CORS headers
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    try {
        const body = await request.json()
        const { password } = body

        if (!password) {
            return new Response(JSON.stringify({ ok: false, error: '请输入密码' }), {
                status: 400,
                headers,
            })
        }

        const adminPassword = env.ADMIN_PASSWORD
        if (!adminPassword) {
            return new Response(
                JSON.stringify({ ok: false, error: '服务器未配置管理员密码，请在 Cloudflare 环境变量中设置 ADMIN_PASSWORD' }),
                { status: 500, headers }
            )
        }

        if (password !== adminPassword) {
            return new Response(JSON.stringify({ ok: false, error: '密码错误' }), {
                status: 401,
                headers,
            })
        }

        // 生成简单的 token（密码的 SHA-256 哈希）
        const encoder = new TextEncoder()
        const data = encoder.encode(adminPassword + '-homepage-admin-' + Date.now().toString().slice(0, -4))
        const hashBuffer = await crypto.subtle.digest('SHA-256', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const token = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        // 将 token 存入 KV（有效期 24 小时）
        if (env.SITE_KV) {
            await env.SITE_KV.put(`token:${token}`, 'valid', { expirationTtl: 86400 })
        }

        return new Response(JSON.stringify({ ok: true, token }), {
            status: 200,
            headers,
        })
    } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: '服务器错误' }), {
            status: 500,
            headers,
        })
    }
}

// Handle preflight
export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
