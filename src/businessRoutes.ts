import type {RouteRecordRaw} from 'vue-router'
export const businessRoutes:RouteRecordRaw[]=[
{path:'',component:()=>import('./views/HomePage.vue')},
{path:'bills',component:()=>import('./views/BillsPage.vue')},
{path:'bills/:id',component:()=>import('./views/BillDetailPage.vue')},
{path:'energy',component:()=>import('./views/EnergyPage.vue')},
{path:'energy/usage',component:()=>import('./views/UsagePage.vue')},
{path:'energy/deposit',component:()=>import('./views/DepositPage.vue')},
{path:'energy/deposit/confirm',component:()=>import('./views/DepositConfirmPage.vue')},
{path:'help',component:()=>import('./views/HelpPage.vue')},
{path:'prepay',component:()=>import('./views/PrepayPage.vue')},
{path:'confirm',component:()=>import('./views/ConfirmPage.vue')},
{path:'wallet',component:()=>import('./views/WalletPage.vue')},
{path:'wallet/:id',component:()=>import('./views/EntriesPage.vue')},
{path:'records',component:()=>import('./views/RecordsPage.vue')},
{path:'profile',component:()=>import('./views/ProfilePage.vue')},]
