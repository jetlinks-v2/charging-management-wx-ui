import {onScopeDispose} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {showToast} from 'vant'
import {hostBack,hosted} from '../services/host'

export function parentPage(path:string){
 if(path==='/energy/deposit/confirm')return '/energy/deposit'
 if(path.startsWith('/energy/'))return '/energy'
 if(path.startsWith('/bills/'))return '/bills'
 if(path.startsWith('/wallet/'))return '/wallet'
 if(path==='/confirm')return '/prepay'
 if(['/prepay','/records','/help','/energy'].includes(path))return '/'
 return undefined
}
/** 只记录本次挂载后的业务导航；memory history 和深链均不向宿主页面回退。 */
export function useOwnerBack(){
 const route=useRoute(),router=useRouter(),visited=[route.fullPath];let returning=false
 const remove=router.afterEach((_to,_from,failure)=>{
  if(failure){returning=false;return}
  if(returning){returning=false;return}
  if(visited.at(-1)!==route.fullPath)visited.push(route.fullPath)
 })
 onScopeDispose(remove)
 return ()=>{
  if(returning)return
  if(visited.length>1){visited.pop();returning=true;router.back();return}
  const parent=parentPage(route.path)
  if(parent){
   // 深链首屏没有可回退条目：替换为安全父页，不能把被替换页面记为可返回历史。
   returning=true
   void router.replace({path:parent,query:parent==='/energy/deposit'?route.query:undefined}).then(()=>{visited[0]=route.fullPath;returning=false})
   return
  }
  if(hosted){hostBack();return}
  showToast('已是入口页面')
 }
}
