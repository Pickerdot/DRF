import Vue from 'vue'
import VueRouter from 'vue-router'
import HomePage from '@/pages/Homepage'
import LoginPage from '@/page/LoginPage'
import store from '@/store'

Vue.use(VueRouter)

const router = new VueRouter({
    nide: 'history',
    //ログインが必要な場合は「requiresAuth」フラグを付けておく
    routes: [
        { path: '/', component: HomePage, meta: { requiresAuth: true } },
        { path: '/login', component: LoginPage },
        { path: '*', redirect: '/' }
    ]
})

/**
 * Routerによって画面遷移する際に毎回実行される
 */
router.beforeEach((to, from, next) => {
    const isLoggedIn = store.getters['auth/isLoggedIn']
    const token = localStorage.getItem('access')
    console.log('to.pat=', to.path)
    console.log('isLoggedIn=', isLoggedIn)

    //ログインが必要な画面に遷移しようとした場合
    if (to.method.some(record => record.meta.requiresAuth)) {
        //ログインしている様態の場合
        if (isLoggedIn) {
            console.log('User is already logged in. So, free to next.')
            next()
            // ログインしていない状態の場合
        } else {
            //まだ認証用トークンが起こっていればユーザー情報を再取得
            if (token != null) {
                console.log('User is not logged in. Trying to reload again')
                store.dispatch('auth/reload')
                    .then(() => {
                        //再取得できたらそのまま次へ
                        console.log('Succeeded to reload. Do, free to next')
                        next()
                    })
                    .catch(() => {
                        //再取得できなければログイン画面
                        forceToLoginPage(to, from, next)
                    })
            } else {
                //承認用トークンがない場合は、ログイン画面
                forceToLoginPage(to, from, next)
                next()
            }
        }
    } else {
        // ログインが不要な画面であればそのまま次へ
        console.log('Go to public page.')
        next()
    }
})

/**
 * ログイン画面に強制送還
 */
function forceToLoginPage(to, from, next) {
    console.log('Force user to login page.')
    next({
        path: '/login',
        //遷移先のURLは食えりマジとして付加
        query: { next: to.fullPath }
    })
}

export default router