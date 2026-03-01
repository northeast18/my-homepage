/**
 * 个人主页 - 应用逻辑
 * 读取 config.js 中的 CONFIG 对象，渲染页面
 */

; (function () {
    'use strict'

    // ===== 渲染个人信息 =====
    function renderProfile() {
        const avatar = document.getElementById('avatar')
        const nickname = document.getElementById('nickname')
        const tagline = document.getElementById('tagline')

        if (CONFIG.avatar) avatar.src = CONFIG.avatar
        if (CONFIG.nickname) {
            nickname.textContent = CONFIG.nickname
            document.title = `${CONFIG.nickname} - 个人主页`
        }
        if (CONFIG.tagline) {
            tagline.textContent = `${CONFIG.tagline} · 欢迎来到我的主页`
        }
    }

    // ===== 渲染导航链接 =====
    function renderLinks() {
        const container = document.getElementById('links')
        if (!CONFIG.links || CONFIG.links.length === 0) return

        CONFIG.links.forEach((item, index) => {
            const a = document.createElement('a')
            a.className = 'link'
            a.href = item.link
            a.target = '_blank'
            a.rel = 'noopener noreferrer'
            a.title = item.name
            a.style.setProperty('--link-index', index + 1)
            a.innerHTML = `<i class="${item.icon}"></i><span>${item.name}</span>`
            container.appendChild(a)
        })
    }

    // ===== 渲染页脚 =====
    function renderFooter() {
        document.getElementById('year').textContent = new Date().getFullYear()

        const footerInfo = document.querySelector('.footer-info')
        if (!footerInfo) return

        // 动态添加备案信息
        const { icp, gongan } = CONFIG.footer || {}
        if (gongan || icp) {
            // 清空默认内容重建
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
            copy.innerHTML = `© ${CONFIG.since || 2021}-${new Date().getFullYear()} ${CONFIG.nickname}`
            footerInfo.appendChild(copy)
        }
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

        // 检查本地存储或系统偏好
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

        // 监听系统主题变化
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
    document.addEventListener('DOMContentLoaded', () => {
        renderProfile()
        renderLinks()
        renderFooter()
        initTheme()
    })
})()
