/**
 * Pjax 类 - 实现页面无刷新跳转功能
 * @class
 * @param {string} containerId - 内容容器的 ID
 * @param {Object} options - 配置选项，包含 before 和 complate 回调函数
 */
class Pjax {
    constructor(containerId, options) {
        // 初始化核心属性
        this.container = containerId; // 容器ID
        this.option = options; // 配置选项
        this.contain = document.getElementById(containerId); // 容器DOM元素
        this.links = document.getElementsByTagName("a"); // 所有a标签
        this.lastTrigger = ""; // 上一次触发的链接地址

        // 绑定this指向，确保回调中this指向Pjax实例
        this.handleLinkClick = this.handleLinkClick.bind(this);
        this.handlePopstate = this.handlePopstate.bind(this);

        // 绑定事件监听器
        this.attachEventListeners();

        // 原代码的return写法不规范，constructor默认返回实例，此处移除冗余return
    }

    /**
     * 绑定事件监听器
     * 为同域名的a标签绑定点击事件，为popstate事件绑定处理函数
     */
    attachEventListeners() {
        // 遍历所有a标签，绑定点击事件
        Array.from(this.links).forEach((link) => {
            // 只处理同域名且非新窗口打开的链接
            if (window.location.host === link.host && link.target !== "_blank") {
                link.onclick = this.handleLinkClick;
            }
        });

        // 监听浏览器前进/后退事件
        window.onpopstate = this.handlePopstate;
    }

    /**
     * 处理链接点击事件
     * @param {Event} e - 点击事件对象
     */
    handleLinkClick(e) {
        // 阻止默认跳转行为
        e.preventDefault();
        const linkElement = e.target.closest('a');
        if (!linkElement) return; // 没有找到 <a> 则退出
        const targetUrl = linkElement.href;

        // 避免重复加载同一页面
        if (this.lastTrigger !== targetUrl) {
            this.lastTrigger = targetUrl;
            // 加载目标页面
            this.loadPage(targetUrl);
            // 添加历史记录
            history.pushState(null, "", targetUrl);
        }
    }

    /**
     * 处理popstate事件（浏览器前进/后退）
     * @param {PopStateEvent} e - popstate事件对象
     */
    handlePopstate(e) {
        const currentUrl = location.href;
        this.lastTrigger = currentUrl;
        // 加载当前URL对应的页面
        this.loadPage(currentUrl);
    }

    /**
     * 加载目标页面内容
     * @param {string} url - 目标页面URL
     */
    loadPage(url) {
        // 执行前置回调（如果配置了）
        if (this.option?.before) {
            this.option.before();
        }

        // 创建XMLHttpRequest对象，发起异步请求
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);

        // 处理请求完成事件
        xhr.onload = () => {
            // 请求成功（200）或缓存命中（304）
            if (xhr.status === 200 || xhr.status === 304) {
                const html = xhr.responseText;
                // 解析返回的HTML字符串
                const newContainer = new DOMParser().parseFromString(html, "text/html");
                // 获取新页面中的目标容器内容
                const newContent = newContainer.getElementById(this.container);

                // 更新页面内容
                this.contain.innerHTML = newContent.innerHTML;
                // 更新页面标题
                document.title = newContainer.querySelector("title").innerText;

                // 执行新内容中的script标签（如果有）
                const script = newContent.querySelector("script");
                if (script) {
                    eval(script.innerText);
                }

                // 更新历史记录的URL
                history.replaceState(null, "", url);
                // 滚动到页面顶部
                window.scrollTo(0, 0);

                // 执行完成回调（如果配置了）
                if (this.option?.complate) {
                    this.option.complate();
                }

                // 重新绑定事件（新内容可能包含新的a标签）
                this.attachEventListeners();
            } else {
                // 请求失败，跳转到404页面
                // window.location.replace("/404.html");
            }
        };

        // 发送请求
        xhr.send();
    }
}