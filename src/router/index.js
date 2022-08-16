import VueRouter from 'vue-router';
import Vue from 'vue';

import HomePage from "@/components/HomePage";
import PrinterState from "@/components/PrinterState";
import printHistory from "@/components/PrintHistory";

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: HomePage,
        meta: {
            title: '首页'
        }
    },
    {
        path: '/history',
        component: printHistory,
        meta: {
            title: '历史打印记录'
        }
    },
    {
        path: '/state',
        component: PrinterState,
        meta: {
            title: '打印机状态'
        }
    },
]


const router = new VueRouter({
    routes
});

router.beforeEach((to, from, next) => {
    /* 路由发生变化修改页面title */
    if (to.meta.title) {
        document.title = to.meta.title
    }
    next()
})

export default router;