/**
 * 自动数据刷新模块
 * 当后台数据更新时，自动刷新前端显示
 */

(function() {
    'use strict';

    let dataVersion = null;
    let versionCheckInterval = null;
    let isRefreshing = false;

    // 配置
    const CONFIG = {
        checkInterval: 5000, // 每5秒检查一次（毫秒）
        apiBaseUrl: window.location.origin + '/api'
    };

    // 检查数据版本
    async function checkDataVersion() {
        if (isRefreshing) return;

        try {
            const response = await fetch(`${CONFIG.apiBaseUrl}/version`);
            const result = await response.json();

            if (result.success && result.version) {
                // 如果版本号变化，刷新页面
                if (dataVersion !== null && dataVersion !== result.version) {
                    console.log('📊 数据已更新，正在刷新页面...');
                    isRefreshing = true;
                    showUpdateNotification();

                    // 延迟1秒后刷新，给用户时间看到通知
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
                dataVersion = result.version;
                console.log('✅ 数据版本:', new Date(result.timestamp).toLocaleString('zh-CN'));
            }
        } catch (error) {
            console.error('❌ 版本检查失败:', error);
        }
    }

    // 显示更新通知
    function showUpdateNotification() {
        // 移除旧的通知（如果有）
        const oldNotification = document.getElementById('autoUpdateNotification');
        if (oldNotification) {
            oldNotification.remove();
        }

        // 创建通知元素
        const notification = document.createElement('div');
        notification.id = 'autoUpdateNotification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 14px 24px;
            border-radius: 10px;
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            z-index: 99999;
            font-size: 15px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
        `;

        notification.innerHTML = `
            <span style="font-size: 20px;">✨</span>
            <span>数据已更新，页面即将刷新...</span>
        `;

        // 添加动画样式（如果还没有）
        if (!document.getElementById('autoUpdateStyles')) {
            const style = document.createElement('style');
            style.id = 'autoUpdateStyles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px) scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0) scale(1);
                        opacity: 1;
                    }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                #autoUpdateNotification {
                    animation: slideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), pulse 2s ease-in-out infinite;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);
    }

    // 初始化自动刷新
    function initAutoRefresh() {
        console.log('🔄 自动数据刷新已启动');
        console.log(`📡 每 ${CONFIG.checkInterval / 1000} 秒检查一次数据更新`);

        // 首次检查
        checkDataVersion();

        // 定期检查
        versionCheckInterval = setInterval(checkDataVersion, CONFIG.checkInterval);
    }

    // 停止自动刷新
    function stopAutoRefresh() {
        if (versionCheckInterval) {
            clearInterval(versionCheckInterval);
            versionCheckInterval = null;
            console.log('⏹️ 自动数据刷新已停止');
        }
    }

    // 页面加载时启动
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAutoRefresh);
    } else {
        initAutoRefresh();
    }

    // 页面卸载时清理
    window.addEventListener('beforeunload', stopAutoRefresh);

    // 暴露到全局（可选，用于手动控制）
    window.autoRefresh = {
        start: initAutoRefresh,
        stop: stopAutoRefresh,
        checkNow: checkDataVersion,
        getVersion: () => dataVersion
    };
})();
