/**
 * API 客户端 - 销售管理系统接口封装
 * 与原 Vue 后端（admin-view/src/api/sales/）接口对应
 * 
 * 认证方式：utils/axios.js 自动加 blade-auth / Authorization header / Blade-Tenant
 * 本文件仅关注业务接口的字段映射和参数规范化
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  params?: Record<string, any>
}

async function request(path: string, options: RequestOptions = {}) {
  const { method = 'GET', body, params } = options
  const url = new URL(`${API_BASE}${path}`, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value))
      }
    })
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    // 认证头由网关中间件添加（blade-auth / Authorization / Blade-Tenant）
  }
  
  const response = await fetch(url.toString(), {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  
  return response.json()
}

// ==================== 客户 (Customer) ====================

export interface CustomerListParams {
  current?: number
  size?: number
  cust?: string
  keyword?: string
  custLevel?: string
  industry?: string
  customTag?: string
}

export async function getCustomerList(params: CustomerListParams = {}) {
  const { data } = await request('/sale-mgt/custinfo/list', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
    current: data?.current || 1,
    size: data?.size || 20,
  }
}

// ==================== 商机 (Opportunity) ====================

export interface OpportunityListParams {
  current?: number
  size?: number
  lead?: string // tab 值（1全部/2我负责的/...）
  optStateList?: string[]
  keyword?: string
}

export interface OpportunityRecord {
  optName: string
  custInfo?: { customerName: string }
  products?: Array<{ prodName: string }>
  chargePerson: string
  projectEffAmount: number
  estimatedOrderTimeName: string
  projectForecastName: string
  currentPhaseName: string
  optWinRadioValue: string
  optStateName: string
  createTime: string
  tags?: any[]
}

export async function getOpportunityList(params: OpportunityListParams) {
  const { data } = await request('/sale-mgt/salesOpportunity/list', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
    current: data?.current || 1,
    size: data?.size || 20,
  }
}

export async function checkCanCreateOpportunity() {
  const { data } = await request('/sale-mgt/custinfo/count', {
    params: { cust: -1, approveState: 3 }
  })
  return data > 0
}

// ==================== 投标文件 (Tender) ====================

export interface TenderListParams {
  current?: number
  size?: number
  tenderWay?: string
  tenderProductType?: string
  keyword?: string
  optId?: string
}

export interface TenderRecord {
  tenderName: string
  opportunity?: { optName: string }
  tenderWayName: string
  tenderTypeName: string
  tenderDate: string
  productList?: Array<{ tenderProductTypeName: string; docTypeName: string; sealTypeName: string }>
  approveStateName: string
  createTime: string
}

export async function getTenderList(params: TenderListParams) {
  const { data } = await request('/sale-mgt/sales-tender/list', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
  }
}

export async function checkForCreateTender(objId: string, objType: string) {
  const { data } = await request('/sale-mgt/sales-tender/checkForCreateTender', {
    params: { objId, objType }
  })
  return data
}

// ==================== 报价单 (Quotation) ====================

export interface QuotationListParams {
  current?: number
  size?: number
  status?: string
  keyword?: string
  opportId?: string
}

export interface QuotationRecord {
  quotName: string
  custName: string
  opportName: string
  netSales: number
  totalDiscount: number
  countPrice: number
  totalPrice: number
  statusName: string
  createTime: string
}

export async function getQuotationList(params: QuotationListParams) {
  const { data } = await request('/sale-mgt/salesquotation/queryQuotationList', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
  }
}

export async function listQuotationForOrder(params: { objId?: string; objType?: string; keyword?: string }) {
  const { data } = await request('/sale-mgt/salesquotation/listQuotationForOrder', { params })
  return data?.records || []
}

// ==================== 合同 (Contract) ====================

export interface ContractListParams {
  current?: number
  size?: number
  type?: string
  status?: string
  keyword?: string
  opportunityId?: string
}

export interface ContractRecord {
  number: string
  name: string
  typeName: string
  secondPartyName: string
  opportunityName?: string
  contractDate: string
  approveStateName: string
  statusName: string
  signTime: string
}

export async function getContractList(params: ContractListParams) {
  const { data } = await request('/sale-contract/sales-contract/page', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
  }
}

export async function checkForCreateContract(objId: string, objType: string) {
  const { data } = await request('/sale-mgt/salesOpportunity/checkForCreateContract', {
    params: { objId, objType }
  })
  return data
}

export async function listContractForOrder(params: { objId?: string; objType?: string; keyword?: string }) {
  const { data } = await request('/sale-contract/sales-contract/listForOrder', {
    params: { ...params, convertedOrder: 1 }
  })
  return data?.records || []
}

// ==================== 财务 (Finance) ====================

export interface FinanceListParams {
  current?: number
  size?: number
  financeType?: string
  financeObjType?: number
  projectDept?: string
  keyword?: string
}

export async function getFinanceDetailList(params: FinanceListParams) {
  const { data } = await request('/sale-contract/financedetail/list', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
  }
}

export interface CollectionListParams {
  current?: number
  size?: number
  keyword?: string
  id?: string
}

export async function getCollectionList(params: CollectionListParams) {
  const { data } = await request('/sale-project/collection-process-ins/page', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
  }
}

// ==================== 我的工作台 (Mine) ====================

export interface ApplyListParams {
  current?: number
  size?: number
  apply?: number
  createTime?: string
}

export async function getApplyList(params: ApplyListParams) {
  const { data } = await request('/blade-flow/ruexecbusisub/listMine', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
  }
}

export interface ApproveListParams {
  current?: number
  size?: number
  apply?: number
}

export async function getApproveList(params: ApproveListParams) {
  const { data } = await request('/blade-flow/ruexecbusisub/listApprove', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
  }
}

export interface TaskListParams {
  current?: number
  size?: number
  status?: number
  keyword?: string
}

export async function getTaskPlanList(params: TaskListParams) {
  const { data } = await request('/sale-mgt/sales-task-plan/list', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
  }
}

export interface NoticeListParams {
  current?: number
  size?: number
  recordState?: number
  keyword?: string
}

export async function getNoticeList(params: NoticeListParams) {
  const { data } = await request('/sale-cqrs/notice-record/page', { params })
  return {
    records: data?.records || [],
    total: data?.total || 0,
  }
}

// ==================== 工具方法 ====================

export function formatStatusTag(status: string | number, statusMap: Record<string | number, string>) {
  return statusMap[status] || String(status)
}

export function formatMoney(amount: number | string, decimals = 2) {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return isNaN(num) ? '--' : num.toFixed(decimals)
}
