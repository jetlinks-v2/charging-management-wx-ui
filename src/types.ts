export interface Session { token:string; applicationId:string; environmentId?:string }
export interface RuntimeConfig { title:string; apiBase:string }
export interface Authorization {user:{id:string;name?:string;username?:string};permissions:{id:string;actions:string[]}[];dimensions?:{type:string;id:string}[]}
export interface Room {projectId:string;projectName:string;spaceId:string;name:string;fullName:string;customerName:string;nature:string}
export interface Pager<T> {total:number;pageIndex:number;pageSize:number;data:T[]}
export interface Bill {id:string;subjectName:string;periodStart:string;periodEnd:string;dueDate:string;periodStatus:string;amount:string;paidAmount:string;arrears:string;discount:string;lateFee:string;standardName?:string;receivableDate?:string;confirmedDate?:string;sourceType?:string;usage?:string;price?:string;energyType?:EnergyKind}
export interface Account {id:string;balance:string;available:string;subjectId?:string;subjectName?:string;standardId?:string;standardName?:string}
export interface Entry {id:string;action:string;occurredAt:string;amount:string;beforeBalance:string;afterBalance:string;subjectName?:string;standardName?:string}
export interface PaymentRecord {id:string;start:string;end:string;paidAt:string;method:string;status:string;amount:string;refunded:string}
export interface Tier {paidMonths:number;giftMonths:number}
export interface Activity {id:string;name:string;endDate:string;tiers:Tier[]}
export interface Setting {id:string;settlementMethod:string;activities:Activity[]}
export interface QuoteInput {settingId:string;activityId?:string;paidMonths:number;giftMonths:number}
export interface QuoteLine {type:string;start:string;end:string;originalAmount:string;paidAmount:string;discountAmount:string}
export interface Quote {id:string;status:string;expiresAt:number;businessDate:string;houseName:string;payerName:string;payAmount:string;originalAmount:string;lines:QuoteLine[]}
export type EnergyKind='water'|'electricity'|'gas'
export interface EnergyDay {date:string;usage:string|null;complete:boolean}
export interface EnergyMeter {id:string;name:string;energyType:EnergyKind;usage:string|null;complete:boolean;lastTime:number|null;days:EnergyDay[]}
export interface EnergySetting {id:string;subjectId:string;subjectName:string;standardId:string;standardName:string;energyType:EnergyKind;price:string}
export interface EnergyOverview {month:string;meters:EnergyMeter[];settings:EnergySetting[];accounts:Account[];usageError?:string}
export interface DepositInput {settingId:string;amount:string}
export interface DepositQuote {settingId:string;subjectName:string;standardName:string;amount:string;houseName:string;payerName:string;paymentAvailable:boolean}
