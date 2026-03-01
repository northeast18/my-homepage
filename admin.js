/**
 * 管理后台 - 交互逻辑
 */

; (function () {
    'use strict'

    const API_BASE = '/api'
    let authToken = localStorage.getItem('admin_token') || ''

    // ===== DOM 元素 =====
    const loginView = document.getElementById('loginView')
    const adminView = document.getElementById('adminView')
    const loginForm = document.getElementById('loginForm')
    const loginError = document.getElementById('loginError')
    const passwordInput = document.getElementById('passwordInput')
    const logoutBtn = document.getElementById('logoutBtn')
    const saveBtn = document.getElementById('saveBtn')
    const saveStatus = document.getElementById('saveStatus')
    const addLinkBtn = document.getElementById('addLinkBtn')
    const linksContainer = document.getElementById('linksContainer')

    // 表单字段
    const inputAvatar = document.getElementById('inputAvatar')
    const inputNickname = document.getElementById('inputNickname')
    const inputTagline = document.getElementById('inputTagline')
    const inputSince = document.getElementById('inputSince')
    const inputIcp = document.getElementById('inputIcp')
    const inputGongan = document.getElementById('inputGongan')
    const avatarPreview = document.getElementById('avatarPreview')

    // 当前编辑的配置
    let currentConfig = null

    // ===== 初始化 =====
    document.addEventListener('DOMContentLoaded', async () => {
        if (authToken) {
            // 尝试用已有 token 加载数据
            const ok = await loadConfig()
            if (ok) {
                showAdmin()
            } else {
                // Token 过期
                authToken = ''
                localStorage.removeItem('admin_token')
                showLogin()
            }
        } else {
            showLogin()
        }
    })

    // ===== 登录 =====
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        loginError.textContent = ''
        const loginBtn = document.getElementById('loginBtn')
        loginBtn.disabled = true
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 登录中...'

        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: passwordInput.value }),
            })
            const data = await res.json()

            if (data.ok) {
                authToken = data.token
                localStorage.setItem('admin_token', authToken)
                await loadConfig()
                showAdmin()
            } else {
                loginError.textContent = data.error || '登录失败'
            }
        } catch (err) {
            loginError.textContent = '网络错误，请确认站点已部署到 Cloudflare Pages'
        } finally {
            loginBtn.disabled = false
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> 登录'
        }
    })

    // ===== 退出 =====
    logoutBtn.addEventListener('click', () => {
        authToken = ''
        localStorage.removeItem('admin_token')
        showLogin()
    })

    // ===== 加载配置 =====
    async function loadConfig() {
        try {
            const res = await fetch(`${API_BASE}/config`, {
                headers: { 'Authorization': `Bearer ${authToken}` },
            })

            if (res.status === 401) return false

            currentConfig = await res.json()
            fillForm(currentConfig)
            return true
        } catch (err) {
            // API 不可用时使用 config.js 的默认值
            if (typeof CONFIG !== 'undefined') {
                currentConfig = JSON.parse(JSON.stringify(CONFIG))
                fillForm(currentConfig)
                return true
            }
            return false
        }
    }

    // ===== 填充表单 =====
    function fillForm(config) {
        inputAvatar.value = config.avatar || ''
        inputNickname.value = config.nickname || ''
        inputTagline.value = config.tagline || ''
        inputSince.value = config.since || 2021
        inputIcp.value = config.footer?.icp || ''
        inputGongan.value = config.footer?.gongan || ''

        // 头像预览
        updateAvatarPreview(config.avatar)

        // 渲染链接列表
        renderLinks(config.links || [])
    }

    // ===== 头像预览 =====
    inputAvatar.addEventListener('input', () => {
        updateAvatarPreview(inputAvatar.value)
    })

    function updateAvatarPreview(src) {
        if (src) {
            avatarPreview.src = src
            avatarPreview.style.display = 'block'
        } else {
            avatarPreview.style.display = 'none'
        }
    }

    // ===== 渲染链接列表 =====
    function renderLinks(links) {
        linksContainer.innerHTML = ''
        links.forEach((link, index) => {
            const item = createLinkItem(link, index)
            linksContainer.appendChild(item)
        })
    }

    function createLinkItem(link, index) {
        const div = document.createElement('div')
        div.className = 'link-item'
        div.dataset.index = index
        div.innerHTML = `
      <div class="icon-input-wrap">
        <i class="${escapeHtml(link.icon || 'fas fa-link')}" data-preview="icon"></i>
        <input type="text" value="${escapeHtml(link.icon || '')}" placeholder="图标类名" data-field="icon" list="iconOptions" />
      </div>
      <input type="text" value="${escapeHtml(link.name || '')}" placeholder="显示名称" data-field="name" />
      <input type="text" value="${escapeHtml(link.link || '')}" placeholder="链接地址" data-field="link" />
      <div class="link-actions">
        <button class="link-move-up" title="上移" type="button"><i class="fas fa-arrow-up"></i></button>
        <button class="link-move-down" title="下移" type="button"><i class="fas fa-arrow-down"></i></button>
        <button class="link-delete" title="删除" type="button"><i class="fas fa-trash-alt"></i></button>
      </div>
    `

        // 绑定图标预览事件
        const iconInput = div.querySelector('input[data-field="icon"]')
        const iconPreview = div.querySelector('i[data-preview="icon"]')
        iconInput.addEventListener('input', (e) => {
            iconPreview.className = e.target.value.trim() || 'fas fa-link'
        })

        // 删除按钮
        div.querySelector('.link-delete').addEventListener('click', () => {
            div.style.opacity = '0'
            div.style.transform = 'translateX(20px)'
            setTimeout(() => div.remove(), 200)
        })

        // 上移按钮
        div.querySelector('.link-move-up').addEventListener('click', () => {
            if (div.previousElementSibling) {
                div.parentNode.insertBefore(div, div.previousElementSibling)
            }
        })

        // 下移按钮
        div.querySelector('.link-move-down').addEventListener('click', () => {
            if (div.nextElementSibling) {
                div.parentNode.insertBefore(div.nextElementSibling, div)
            }
        })

        return div
    }

    // ===== 添加链接 =====
    addLinkBtn.addEventListener('click', () => {
        const index = linksContainer.children.length
        const item = createLinkItem({ icon: 'fas fa-link', name: '', link: '' }, index)
        linksContainer.appendChild(item)
        item.querySelector('input[data-field="name"]').focus()
    })

    // ===== 保存配置 =====
    saveBtn.addEventListener('click', async () => {
        saveBtn.disabled = true
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 保存中...'
        saveStatus.textContent = ''
        saveStatus.className = 'save-status'

        // 从表单收集数据
        const config = {
            avatar: inputAvatar.value.trim(),
            nickname: inputNickname.value.trim(),
            tagline: inputTagline.value.trim(),
            since: parseInt(inputSince.value) || 2021,
            links: [],
            footer: {
                icp: inputIcp.value.trim(),
                gongan: inputGongan.value.trim(),
            },
        }

        // 收集链接
        document.querySelectorAll('.link-item').forEach((item) => {
            const icon = item.querySelector('[data-field="icon"]').value.trim()
            const name = item.querySelector('[data-field="name"]').value.trim()
            const link = item.querySelector('[data-field="link"]').value.trim()
            if (name || link) {
                config.links.push({ icon, name, link })
            }
        })

        try {
            const res = await fetch(`${API_BASE}/config`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify(config),
            })

            const data = await res.json()

            if (data.ok) {
                saveStatus.textContent = '✓ 保存成功！主页已更新'
                saveStatus.className = 'save-status success'
                currentConfig = config
            } else {
                saveStatus.textContent = '✗ ' + (data.error || '保存失败')
                saveStatus.className = 'save-status error'
            }
        } catch (err) {
            saveStatus.textContent = '✗ 网络错误，请确认已部署到 Cloudflare Pages'
            saveStatus.className = 'save-status error'
        } finally {
            saveBtn.disabled = false
            saveBtn.innerHTML = '<i class="fas fa-save"></i> 保存所有更改'
            setTimeout(() => {
                saveStatus.textContent = ''
            }, 5000)
        }
    })

    // ===== 视图切换 =====
    function showLogin() {
        loginView.style.display = 'flex'
        adminView.style.display = 'none'
        passwordInput.value = ''
        loginError.textContent = ''
    }

    function showAdmin() {
        loginView.style.display = 'none'
        adminView.style.display = 'block'
    }

    // ===== 工具函数 =====
    function escapeHtml(str) {
        const div = document.createElement('div')
        div.textContent = str
        return div.innerHTML
    }
})()
