/**
 * 个人主页 - 应用逻辑
 * 优先从 /api/config 读取配置（Cloudflare KV）
 * 如果 API 不可用，则使用 config.js 中的默认值
 */

; (function () {
    'use strict'

    // ===== 获取配置（API 优先，config.js 兜底） =====
    async function getConfig() {
        try {
            const res = await fetch('/api/config')
            if (res.ok) {
                const data = await res.json()
                // 如果 API 返回了有效数据（至少有 nickname）
                if (data && data.nickname) return data
            }
        } catch (e) {
            // API 不可用（本地开发时）
        }
        // 兜底：使用 config.js 的静态配置
        return typeof CONFIG !== 'undefined' ? CONFIG : {}
    }

    // ===== 渲染个人信息 =====
    function renderProfile(config) {
        const avatar = document.getElementById('avatar')
        const nickname = document.getElementById('nickname')
        const tagline = document.getElementById('tagline')

        if (config.avatar) avatar.src = config.avatar
        if (config.nickname) {
            nickname.textContent = config.nickname
            document.title = `${config.nickname} - 个人主页`
        }
        if (config.tagline) {
            tagline.textContent = `${config.tagline} · 欢迎来到我的主页`
        }
    }

    // ===== 渲染导航链接 =====
    function renderLinks(config) {
        const container = document.getElementById('links')
        if (!config.links || config.links.length === 0) return

        container.innerHTML = '' // 清空可能的旧内容

        config.links.forEach((item, index) => {
            const a = document.createElement('a')
            a.className = 'link'
            a.href = item.link
            a.target = '_blank'
            a.rel = 'noopener noreferrer'
            a.title = item.name
            a.style.setProperty('--link-index', index + 1)

            const iconStr = (item.icon || '').trim()
            let iconHTML = ''
            if (iconStr.startsWith('<svg')) {
                // 如果是纯色 SVG 没有自带颜色设置，则注入 currentColor 支持主题切换
                let svgStr = iconStr
                if (!iconStr.includes('fill=')) {
                    svgStr = iconStr.replace('<svg', '<svg fill="currentColor"')
                }
                iconHTML = `<span class="link-icon">${svgStr}</span>`
            } else if (iconStr.startsWith('http') || iconStr.startsWith('data:image')) {
                iconHTML = `<span class="link-icon"><img src="${iconStr}" alt="icon"/></span>`
            } else {
                iconHTML = `<i class="${iconStr} link-icon"></i>`
            }

            a.innerHTML = `${iconHTML}<span>${item.name}</span>`
            container.appendChild(a)
        })
    }

    // ===== 渲染页脚 =====
    function renderFooter(config) {
        document.getElementById('year').textContent = new Date().getFullYear()

        const footerInfo = document.querySelector('.footer-info')
        if (!footerInfo) return

        const { icp, gongan } = config.footer || {}

        // 重建页脚内容
        footerInfo.innerHTML = ''

        if (gongan) {
            const span = document.createElement('span')
            span.textContent = gongan
            footerInfo.appendChild(span)
            addDivider(footerInfo)
        }

        if (icp) {
            const a = document.createElement('a')
            a.href = 'https://beian.miit.gov.cn/'
            a.target = '_blank'
            a.rel = 'noopener noreferrer'
            a.textContent = icp
            footerInfo.appendChild(a)
            addDivider(footerInfo)
        }

        const copy = document.createElement('span')
        copy.innerHTML = `© ${config.since || 2021}-${new Date().getFullYear()} ${config.nickname || ''}`
        footerInfo.appendChild(copy)

        const d2 = document.createElement('span')
        d2.className = 'divider'
        d2.textContent = '·'
        footerInfo.appendChild(d2)

        const powered = document.createElement('span')
        powered.innerHTML = 'Powered with ❤️'
        footerInfo.appendChild(powered)
    }

    function addDivider(parent) {
        const d = document.createElement('span')
        d.className = 'divider'
        d.textContent = '·'
        parent.appendChild(d)
    }

    // ===== 暗色模式 =====
    function initTheme() {
        const toggle = document.getElementById('themeToggle')
        const icon = document.getElementById('themeIcon')

        const stored = localStorage.getItem('theme')
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        const isDark = stored ? stored === 'dark' : prefersDark

        applyTheme(isDark)

        toggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') === 'dark'
            const next = !current
            applyTheme(next)
            localStorage.setItem('theme', next ? 'dark' : 'light')
        })

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches)
            }
        })

        function applyTheme(dark) {
            document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
            icon.className = dark ? 'fas fa-sun' : 'fas fa-moon'
        }
    }

    // ===== 初始化 =====
    document.addEventListener('DOMContentLoaded', async () => {
        initTheme()

        const config = await getConfig()
        renderProfile(config)
        renderLinks(config)
        renderFooter(config)
    })
})()
