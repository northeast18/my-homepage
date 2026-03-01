/**
 * ============================================
 *  个人主页配置文件
 *  修改以下内容即可自定义你的主页
 * ============================================
 */

const CONFIG = {
    // ===== 个人信息 =====
    nickname: '技术探索',
    tagline: '这是我记录点滴碎片感情的小窝',
    // 头像图片链接（可以替换为你自己的图片 URL）
    avatar: 'https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F6bb31bb2-3a9c-49c3-afdd-be980c2f8e71%2F421b5af9-3ca0-44c3-a4c5-fac6b89a3f45%2Fnotion_avatar.png?table=collection&id=35ddfbe3-8e54-4da8-8ea9-dbce40bcabcb',

    // ===== 建站年份 =====
    since: 2021,

    // ===== 导航链接 =====
    // icon: Font Awesome 图标类名 (https://fontawesome.com/icons)
    // name: 按钮上显示的文字
    // link: 点击后跳转的链接
    links: [
        { icon: 'fas fa-blog', name: '博客', link: 'https://jishu.nn.kg' },
        { icon: 'fas fa-archive', name: '归档', link: 'https://jishu.nn.kg/archive' },
        { icon: 'fas fa-envelope', name: '邮箱', link: 'mailto:your-email@example.com' },
        { icon: 'fab fa-github', name: 'GitHub', link: 'https://github.com/northeast18' },
        { icon: 'fab fa-bilibili', name: 'Bilibili', link: 'https://bilibili.com' },
        { icon: 'fas fa-rss', name: 'RSS', link: 'https://jishu.nn.kg/feed' },
    ],

    // ===== 页脚信息 =====
    footer: {
        // ICP 备案号（没有就留空）
        icp: '',
        // 公安备案号（没有就留空）
        gongan: '',
    }
}
