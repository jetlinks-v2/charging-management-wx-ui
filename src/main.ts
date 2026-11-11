import {createApp,watch} from 'vue'
import {createRouter,createWebHashHistory} from 'vue-router'
import 'vant/lib/index.css'
import './style.css'
import './components/mobile/mobile.css'
import Root from './Root.vue'
import {state} from './services/session'
import {hosted,hostState} from './services/host'
import {installMobile} from './components/mobile/install'
import {resetRooms} from './services/rooms'
watch(()=>state.session,resetRooms,{flush:'sync'})
export const router=createRouter({history:createWebHashHistory(),routes:[
{path:'/',component:()=>import('./views/HomePage.vue')},
{path:'/login',component:()=>import('./views/LoginPage.vue')},
{path:'/bills',component:()=>import('./views/BillsPage.vue')},
{path:'/prepay',component:()=>import('./views/PrepayPage.vue')},
{path:'/confirm',component:()=>import('./views/ConfirmPage.vue')},
{path:'/wallet',component:()=>import('./views/WalletPage.vue')},
{path:'/wallet/:id',component:()=>import('./views/EntriesPage.vue')},
{path:'/records',component:()=>import('./views/RecordsPage.vue')},
{path:'/profile',component:()=>import('./views/ProfilePage.vue')},
{path:'/:pathMatch(.*)*',redirect:'/'}]})
router.beforeEach(to=>{
 if(!state.ready)return true
 if(hosted&&hostState.error)return false
 if(hosted&&to.path==='/login')return '/'
 if(to.path!=='/login'&&!state.session)return '/login'
 return true
})
const app=createApp(Root);installMobile(app);app.use(router).mount('#app')
