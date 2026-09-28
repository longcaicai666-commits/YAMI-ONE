'use client'

import { Bell, Briefcase, Building2, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, ClipboardList, Coins, Command, Download, Eye, FileCheck2, FileText, Filter, HelpCircle, Home, Inbox, Info, LayoutDashboard, ListTodo, LogOut, Maximize2, Megaphone, Paperclip, Pencil, Trash2, Plus, RefreshCw, Search, Send, Settings, Star, TrendingUp, Trophy, Upload, UserRound, Users, X } from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'
import ReactECharts from 'echarts-for-react'
import { getCustomerList, getOpportunityList, getTenderList, getQuotationList, getContractList, getFinanceDetailList, getCollectionList, getApplyList, getApproveList, getTaskPlanList, getNoticeList } from '../lib/api'

type View = '负责人视图' | '销售视图' | 'VP视图' | '通用视图'
type MenuItem = { label: string; children?: string[] }
type MenuGroup = { label: string; items: MenuItem[] }

// 第一批数据：模块菜单对齐
const menuGroups: MenuGroup[] = [
  { label: '线索', items: [{ label: '我的线索' }, { label: '市场活动' }, { label: '标签管理' }] },
  { label: '客户', items: [{ label: '我的客户' }] },
  { label: '商机', items: [{ label: '我的商机' }, { label: '竞争对手' }, { label: '我的投标文件' }, { label: '我的报价单' }, { label: '我的合同' }, { label: '我的订单' }] },
  { label: '项目', items: [{ label: '我的项目' }] },
  { label: '财务', items: [{ label: '回款' }, { label: '财务数据' }, { label: '企业管理' }, { label: '财务明细' }] },
  { label: '我的', items: [{ label: '我的申请' }, { label: '我的审批' }, { label: '我的任务' }, { label: '我的提醒' }, { label: '工作日报' }, { label: 'OKR' }] },
  { label: '更多', items: [{ label: '产品', children: ['产品分类', '产品'] }, { label: '合作商' }, { label: '营销管理' }, { label: '统计报表' }] },
  { label: 'Blade 后台', items: [{ label: '用户管理' }, { label: '部门管理' }, { label: '角色管理' }, { label: '菜单管理' }, { label: '字典管理' }] }
]

const nav = ['首页', ...menuGroups.map(group => group.label)]
const metricNames = ['签约合同额','毛订单','净订单','毛收入','净收入','经营利润','净利润（财务）','经营现金流','净现金流（财务）','回款','成本','销售费用','研发费用','管理费用','市场费用','财务费用']
const panels = [{title:'我的待办', icon:ClipboardList, tabs:['任务','审批','申请'], text:'联系人重要地址维护错误'}, {title:'我的关注', icon:ClipboardList, tabs:['项目','商机','客户','线索'], text:'上海恒信 TMS 系统新拓项目'}, {title:'我负责的', icon:ClipboardList, tabs:['任务','商机'], text:'江苏电信 FMS 系统 2026 年扩容'}]
const ranking: [string,string,string,string][] = [['01','林晓宇','2,184.50','28.6%'], ['02','王思远','1,862.20','24.4%'], ['03','陈嘉文','1,406.80','18.4%'], ['04','赵一鸣','986.30','12.9%'], ['05','周宁','714.60','9.3%']]

// 第一批数据模型：线索
const leads = [
  {id:'L1', leadName:'安徽电信IPOSS系统', leadType:1, customer:'安徽电信', contact:'田映', phone:'--', source:'主动营销', approvalStatus:'审批通过', leadStatus:'已分配', owner:'姚其文', createTime:'2024-01-03 16:45:47', follower:'刘锋华', notes:'电话与日常交流，暂时不需要关注'},
  {id:'L2', leadName:'上海恒信IPAM系统2027年新建', leadType:1, customer:'上海恒信1', contact:'王来亮', phone:'55', source:'主动营销', approvalStatus:'审批通过', leadStatus:'已分配', owner:'刘锋华', createTime:'2026-09-11 15:53:13', follower:'--', notes:''},
  {id:'L3', leadName:'上海恒信MBOSS系统2026', leadType:2, customer:'上海恒信', contact:'王来亮', phone:'7', source:'主动营销', approvalStatus:'审批通过', leadStatus:'已分配', owner:'刘锋华', createTime:'2026-09-11 16:02:43', follower:'--', notes:''},
  {id:'L4', leadName:'上海恒信终端APP系统2026', leadType:1, customer:'上海恒信3', contact:'56', phone:'2', source:'主动营销', approvalStatus:'审批通过', leadStatus:'已分配', owner:'刘锋华', createTime:'2026-09-12 23:38:18', follower:'--', notes:''},
  {id:'L5', leadName:'上海恒信综合调度系统2028', leadType:1, customer:'上海恒信', contact:'44', phone:'1', source:'主动营销', approvalStatus:'审批通过', leadStatus:'已分配', owner:'刘锋华', createTime:'2026-09-12 23:40:01', follower:'--', notes:''}
]

// 第一批数据：客户列表
const customers = [
  {id:'C1', name:'安徽电信', level:'A级', industry:'通信', source:'主动营销', owner:'刘锋华', createTime:'2024-01-03'},
  {id:'C2', name:'上海恒信', level:'B级', industry:'金融', source:'主动营销', owner:'刘锋华', createTime:'2026-09-11'},
  {id:'C3', name:'南方电网', level:'A级', industry:'电力', source:'展会', owner:'王思远', createTime:'2026-08-15'},
]

// 第一批数据：商机列表
const opportunities = [
  {id:'O1', name:'中国电信云网融合项目', stage:'方案评审', probability:'78%', predictAmount:'2,184.50', customer:'中国电信', owner:'林晓宇', createTime:'2026-10-01'},
  {id:'O2', name:'南方电网数字化平台', stage:'采购立项', probability:'64%', predictAmount:'1,862.20', customer:'南方电网', owner:'王思远', createTime:'2026-09-15'},
]

// 第一批数据：投标、报价、合同、订单占位
const tenders = [{id:'T1', name:'中国电信招标202610', status:'进行中', amount:'2,184.50', relatedOpportunity:'O1'}]
const quotations = [{id:'Q1', name:'云网融合方案报价', status:'已发送', amount:'2,150.00', relatedOpportunity:'O1'}]
const contracts = [{id:'K1', name:'中国电信云网融合合同', status:'已签署', amount:'2,184.50', relatedOpportunity:'O1'}]
const orders = [{id:'D1', name:'中国电信订单202610', status:'已交付', amount:'2,184.50', relatedOpportunity:'O1'}]

// 第一批数据：项目
const projects = [{id:'P1', name:'中国电信TMS系统', status:'进行中', progress:'78%', budget:'2,184.50', owner:'林晓宇'}]

// 第一批数据：财务
const finances = [{id:'F1', type:'回款', amount:'1,107.29', status:'已到账', contract:'K1', date:'2026-10-05'}]

function Mark(){return <span className="workspace-mark"><i/><i/><i/></span>}

function Header({view,setView,onNavigate}:{view:View;setView:(v:View)=>void;onNavigate:(page:string)=>void}){
  const [open,setOpen]=useState<string|null>(null)
  const [expanded,setExpanded]=useState<string[]>([])
  const [activeItem,setActiveItem]=useState<string|null>(null)
  const [profileOpen,setProfileOpen]=useState(false)
  const [notificationOpen,setNotificationOpen]=useState(false)
  const [pages,setPages]=useState(['首页'])
  const openPage=(p:string)=>setPages(a=>a.includes(p)?a:[...a,p])
  const toggleItem=(item:MenuItem)=>{
    if(item.children){
      setActiveItem(current=>current===item.label?null:item.label)
    }else{
      setActiveItem(item.label)
      setOpen(null)
      openPage(item.label)
      onNavigate(item.label)
    }
  }
  const activeGroup=menuGroups.find(group=>group.label===open)
  return <><header className="workspace-header"><div className="workspace-brand"><Mark/><span>YAMIONE</span></div><nav className="enterprise-nav"><div className="nav-menu"><button className={activeItem===null?'nav-active':''} onClick={()=>{setActiveItem(null);setOpen(null);onNavigate('首页')}}>首页</button></div>{menuGroups.map(group=><div className="nav-menu" key={group.label}><button className={open===group.label?'nav-active':''} onClick={()=>setOpen(open===group.label?null:group.label)}>{group.label}<ChevronDown size={12}/></button>{open===group.label&&<div className={`nav-dropdown ${group.label==='Blade 后台'?'blade-dropdown':''}`}><b>{group.label}</b><div className="nav-tree">{activeGroup?.items.map(item=><div className={`nav-tree-group ${activeItem===item.label?'selected':''}`} key={item.label}><button onClick={()=>toggleItem(item)}>{item.label}{item.children&&<ChevronDown className={activeItem===item.label?'submenu-chevron expanded':''} size={11}/>}</button></div>)}</div><div className="nav-detail">{activeItem&&<button className="nav-detail-close" onClick={()=>setActiveItem(null)}>收起二级菜单 <X size={12}/></button>}{activeGroup?.items.find(item=>item.label===activeItem)?.children?.map(child=><button key={child} onClick={()=>{setOpen(null);setActiveItem(null);openPage(child);onNavigate(child)}}>{child}</button>)}</div></div>}</div>)}</nav><div className="workspace-actions"><div className="notification-wrap"><button className={`header-icon ${notificationOpen?'active':''}`} onClick={()=>setNotificationOpen(!notificationOpen)}><Bell size={16}/><span className="notification-count">3</span></button>{notificationOpen&&<div className="notification-panel"><div className="notification-head"><b>通知中心</b><button onClick={()=>setNotificationOpen(false)}>清空</button></div><button className="notification-item"><span className="notification-dot blue"/><span><b>线索转移</b><small>刘锋华转移了线索给你</small></span><time>10分钟前</time></button><button className="notification-item"><span className="notification-dot amber"/><span><b>审批待办</b><small>用户'田映'的合同审批待处理</small></span><time>1小时前</time></button><button className="notification-item"><span className="notification-dot green"/><span><b>商机更新</b><small>商机'云网融合'进度已更新</small></span><time>2小时前</time></button></div>}
</div><div className="profile-wrap"><button className="profile" onClick={()=>setProfileOpen(!profileOpen)}>JL</button>{profileOpen&&<div style={{position:'absolute',right:0,top:40,background:'#fff',border:'1px solid #dbe4ee',borderRadius:6,minWidth:160,zIndex:30,boxShadow:'0 8px 24px rgba(35,65,95,.12)'}}><button style={{width:'100%',padding:'10px 12px',textAlign:'left',fontSize:13,borderBottom:'1px solid #edf1f5'}}>Jason Lee</button><button style={{width:'100%',padding:'10px 12px',textAlign:'left',fontSize:13,borderBottom:'1px solid #edf1f5'}}>个人资料</button><button style={{width:'100%',padding:'10px 12px',textAlign:'left',fontSize:13}}>退出登录</button></div>}
</div></div></header><div className="opened-pages"><span>已打���</span>{pages.map((p,i)=><button className={i===pages.length-1?'opened-tab active':'opened-tab'} key={p} onClick={()=>{onNavigate(p);if(p==='首页')setActiveItem(null)}}>{p}{i>0&&<X size={12} onClick={e=>{e.stopPropagation();setPages(a=>a.filter(x=>x!==p))}}/>}</button>)}</div></>
}

function SharedTop({view,setView}:{view:View;setView:(v:View)=>void}){
  const [currency,setCurrency]=useState('美元')
  const [mode,setMode]=useState('财务')
  const [department,setDepartment]=useState('全部部门')
  const [year,setYear]=useState('2026')
  const [open,setOpen]=useState<string|null>(null)
  const toggle=(name:string)=>setOpen(open===name?null:name)
  return <div className="shared-top"><div><h1>仪表盘 <span className="dashboard-kicker">YAMIONE / UNIFIED WORKSPACE</span></h1></div><div className="shared-controls"><div className="view-switcher">{(['负责人视图','销售视图','VP视图','通用视图'] as View[]).map(v=><button className={view===v?'active':''} key={v} onClick={()=>setView(v)}>{v}</button>)}</div><div className="control-menu currency-menu"><div className="view-switcher single-control"><button className="active" onClick={()=>toggle('currency')}>{currency} <ChevronDown size={13}/></button></div>{open==='currency'&&<div className="control-popover">{['美元','人民币'].map(item=><button className={currency===item?'chosen':''} key={item} onClick={()=>{setCurrency(item);setOpen(null)}}>{item}</button>)}</div>}</div><div className="view-switcher two-control"><button className={mode==='财务'?'active':''} onClick={()=>setMode('财务')}>财务</button><button className={mode==='管理'?'active':''} onClick={()=>setMode('管理')}>管理</button></div><div className="control-menu"><div className="view-switcher single-control"><button className="active" onClick={()=>toggle('department')}>{department} <ChevronDown size={13}/></button></div>{open==='department'&&<div className="control-popover">{['全部部门','销售部','研发部','管理部'].map(item=><button className={department===item?'chosen':''} key={item} onClick={()=>{setDepartment(item);setOpen(null)}}>{item}</button>)}</div>}</div><div className="control-menu"><div className="view-switcher single-control"><button className="active" onClick={()=>toggle('year')}>{year} <ChevronDown size={13}/></button></div>{open==='year'&&<div className="calendar-popover"><label>选择年度<input type="date" value={`${year}-01-01`} onChange={e=>setYear(e.target.value.slice(0,4))}/></label></div>}</div></div></div>
}

function Panels(){
  const [activeTabs,setActiveTabs]=useState(panels.map(()=>0))
  const pendingByTab:{[key:string]:number}={'我的待办-任务':2,'我的待办-审批':1,'我的待办-申请':0,'我的关注-项目':3,'我的关注-商机':1,'我的关注-客户':2,'我的关注-线索':0,'我负责的-任务':1,'我负责的-商机':2}
  return <section className="panel-grid">{panels.map(({title,icon:Icon,tabs,text},panelIndex)=>{const active=activeTabs[panelIndex];const activeLabel=tabs[active];const titleByTab=title==='我的待办'?{任务:'任务审批申请',审批:'审批申请',申请:'申请记录'}:title==='我的关注'?{项目:'项目商机客户线索',商机:'商机跟进',客户:'重点客户',线索:'客户线索'}:{任务:'任务商机',商机:'商机推进'};const pending=pendingByTab[`${title}-${activeLabel}`]??0;return <article className="list-panel" key={title}><header><h2><Icon size={16}/>{title}</h2><div>{tabs.map((t,i)=><button className={`${active===i?'active ':''}${pendingByTab[`${title}-${t}`]>0?'has-pending':''}`} onClick={()=>setActiveTabs(current=>current.map((value,index)=>index===panelIndex?i:value))} key={t}>{t}</button>)}</div></header><div className={`panel-pending ${pending===0?'is-clear':''}`}><span className="pending-dot"/>{pending>0?`有 ${pending} 项待处理`:'暂无待处理'}</div><div className="list-row"><span className="row-icon"><ClipboardList size={14}/></span><div><b>{titleByTab[activeLabel as keyof typeof titleByTab]}</b><small>2026 年度业务事项　负责人：Jason</small></div><span className="status">进行中</span></div></article>})}</section>
}

function RingChart(){return <div className="ring-wrap"><div className="ring ring-one"/><div className="ring ring-two"/><div className="ring ring-three"/><div className="ring-center">BI</div><div className="ring-labels"><span><i className="coral"/>净订单<br/><b>16.82%</b></span><span><i className="blue"/>净收入<br/><b>0.00%</b></span><span><i className="amber"/>净现金流<br/><b>0.00%</b></span></div></div>}

function BarChart(){
  const months=['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const values2025=[420,680,320,920,-180,1120,760,1280,540,-240,1380,980]
  const values2026=[360,540,260,780,-120,980,620,1060,420,-160,1180,820]
  const option={animationDuration:350,grid:{left:52,right:18,top:18,bottom:30,containLabel:true},legend:{show:false},tooltip:{trigger:'axis',triggerOn:'mousemove',hideDelay:100,confine:true,backgroundColor:'#fff',borderColor:'#d9e1e9',borderWidth:1,borderRadius:6,padding:[8,12],textStyle:{color:'#1b2b42',fontSize:12},extraCssText:'box-shadow:0 2px 8px rgba(0,0,0,.12);z-index:1000;',formatter:(params:any[])=>{const month=params[0]?.axisValue??'';return `<div style="font-weight:700;margin-bottom:4px">${month}</div>${params.map((item:any)=>`<div style="display:flex;align-items:center;gap:7px;min-width:150px"><i style="width:7px;height:7px;border-radius:50%;background:${item.color};display:inline-block"></i><span>${item.seriesName}</span><b style="margin-left:auto;font-weight:600">${item.value} K$</b></div>`).join('')}`}},axisPointer:{type:'line',lineStyle:{color:'#78899b',width:1,type:'dashed'}},xAxis:{type:'category',data:months,axisLine:{lineStyle:{color:'#b8c5d2'}},axisTick:{show:false},axisLabel:{color:'#52677f',fontSize:11}},yAxis:{type:'value',min:-300,max:1500,interval:300,axisLine:{lineStyle:{color:'#b8c5d2'}},axisTick:{show:false},axisLabel:{color:'#52677f',fontSize:11},splitLine:{show:true,lineStyle:{color:'#dfe6ed',type:'dashed'}},zeroLine:{show:true,lineStyle:{color:'#63778e',width:1.5}}},series:[{name:'2025',type:'bar',barMaxWidth:14,barGap:'18%',itemStyle:{color:'#e45757'},emphasis:{focus:'series',itemStyle:{shadowBlur:8,shadowColor:'rgba(228,87,87,.28)'}},blur:{itemStyle:{opacity:.24}},data:values2025},{name:'2026',type:'bar',barMaxWidth:14,itemStyle:{color:'#2457a6'},emphasis:{focus:'series',itemStyle:{shadowBlur:8,shadowColor:'rgba(36,87,166,.28)'}},blur:{itemStyle:{opacity:.24}},data:values2026}]};return <div className="bar-chart"><div className="bar-legend"><span><i className="coral"/>2025</span><span><i className="blue"/>2026</span><small>单位：K$</small></div><ReactECharts option={option} style={{height:'100%',width:'100%'}}/></div>
}

function Owner(){
  const [tab,setTab]=useState(metricNames[0])
  return <><section className="hero-grid"><article className="card overview"><div className="card-head"><div><span className="eyebrow">OVERVIEW / 2026</span><h2>经营概览</h2></div><span>BI</span></div><RingChart/></article><article className="card trend"><div className="metric-tabs">{metricNames.map(m=><button className={tab===m?'active':''} onClick={()=>setTab(m)} key={m}>{m}</button>)}</div><div className="card-head trend-head"><div><span className="eyebrow">YEAR OVER YEAR / {tab}</span><h2 className="sr-only">{tab}</h2></div><div className="trend-meta"><span><i className="coral"/>2025</span><span><i className="blue"/>2026</span><small>单位：K$</small></div></div><BarChart/></article></section><section className="metric-grid-16">{metricNames.map((m,i)=><article className="metric-card-large" key={m} onClick={()=>setTab(m)}><div className="metric-title"><b>{m}</b><small>K$</small></div><div className="completion">完成率 <strong>{i<3?['17.62%','17.18%','16.82%'][i]:'0.00%'}</strong></div><div className="progress"><i style={{width:i<3?`${17-i}%`:'0%'}}/></div><div className="money"><span>今年已完成<b>{i<3?['1,040.36','957.06','932.32'][i]:'0'}</b></span><span>全年预计<b>{i<3?['5,905.71','5,571.43','5,542.57'][i]:'5,297.24'}</b></span></div><hr/><div className="money foot"><span>近7天更新<b>0</b></span><span>本月预计完成<b>0</b></span></div></article>)}</section><Panels/></>
}

function Sales(){
  return <><section className="sales-two sales-top"><Task title="今年订单任务" value={3.41} ringLabel="订单完成率" amountDone="93.36" doneLabel="已完成订单总额" amountGoal="2,736.16" goalLabel="订单目标总额" color="blue"/><Task title="今年回款任务" value={38.23} ringLabel="回款完成率" amountDone="1,107.29" doneLabel="已完成回款总额" amountGoal="2,896.72" goalLabel="回款目标总额" color="coral"/></section><section className="sales-two sales-bottom"><Stat title="本月目标提醒" defaultPeriod="本月" items={[{icon:CheckCircle2,value:'14.74',label:'本月即将签单金额',unit:' K$',color:'blue' as const},{icon:Coins,value:'666.98',label:'本月即将回款金额',unit:' K$',color:'violet' as const}]}/><Stat title="本季业务新增" defaultPeriod="本季" items={[{icon:TrendingUp,value:'54',label:'本季新商机',unit:'',color:'amber' as const},{icon:Building2,value:'1',label:'本季新客户',unit:'',color:'green' as const},{icon:Waypoints,value:'4',label:'本季新线索',unit:'',color:'coral' as const}]}/></section><article className="card leaderboard"><div className="section-heading"><div><span className="eyebrow">TEAM PERFORMANCE</span><h2><Trophy size={16}/> 销售业绩排行榜 <small>单位：K$</small></h2></div><button>查看全部 <ChevronDown size={13}/></button></div><div className="rank-head"><span>排名 / 成员</span><span>成交额</span><span>贡献率</span></div>{ranking.map(([rank,name,amount,share])=><div className="rank-row" key={rank}><span className="member-cell"><i className={`rank-badge rank-${rank}`}>{rank}</i><span className="member"><b className="avatar">{name.slice(0,1)}</b><b>{name}</b></span></span><strong>{amount}</strong><span>{share}</span></div>)}</article><Panels/></>
}

function Task({title,value,ringLabel,amountDone,doneLabel,amountGoal,goalLabel,color}:{title:string;value:number;ringLabel:string;amountDone:string;doneLabel:string;amountGoal:string;goalLabel:string;color:'blue'|'coral'}){
  const radius=60
  const length=2*Math.PI*radius
  return <article className={`card task-row task-${color}`}><div className="task-title"><div><h2>{title}</h2><small>年度目标完成进度</small></div><span className="task-unit">K$</span></div><div className="task-body"><div className="ring-chart small"><svg viewBox="0 0 150 150"><circle className="ring-track" cx="75" cy="75" r={radius}/><circle className={`ring-value ${color}`} cx="75" cy="75" r={radius} strokeDasharray={length} strokeDashoffset={length*(1-value/100)}/></svg><div className="ring-center"><b>{value.toFixed(2)}%</b><small>{ringLabel}</small></div></div><div className="task-metric"><b>{amountDone}</b><small>{doneLabel} (K$)</small></div><div className="task-metric goal"><b>{amountGoal}</b><small>{goalLabel} (K$)</small></div></div></article>
}

function Stat({title,items,defaultPeriod}:{title:string;items:{icon:typeof TrendingUp;value:string;label:string;unit:string;color:'blue'|'violet'|'amber'|'coral'|'green'}[];defaultPeriod:string}){
  const [period,setPeriod]=useState(defaultPeriod)
  return <article className="card stat-row"><div className="stat-heading"><div><h2>{title}</h2></div><select className="period-select" value={period} onChange={e=>setPeriod(e.target.value)}><option>本周</option><option>本月</option><option>本季</option><option>本年</option></select></div><div className="stat-items">{items.map(({icon:Icon,value,label,unit,color})=><div className="stat-item" key={label}><span className={`icon-circle ${color}`}><Icon size={14}/></span><div><b>{value}<em>{unit}</em></b><small>{label}</small></div></div>)}</div></article>
}

function VP(){
  const vpRows=[['中国电信云网融合项目','2026-10-15','林晓宇','CNY','2,184,500','进行中','中国电信','通信','方案评审','78%'],['南方电网数字化平台','2026-10-22','王思远','CNY','1,862,200','进行中','南方电网','电力','采购立项','64%'],['中国联通 5G 专网升级','2026-10-28','陈嘉文','CNY','1,406,800','进行中','中国联通','通信','技术交流','52%'],['国家电网数据中台建设','2026-11-06','赵一鸣','CNY','986,300','进行中','国家电网','电力','招标预审','41%'],['广东电信 FMS 扩容项目','2026-11-12','周宁','CNY','714,600','进行中','广东电信','通信','商务谈判','36%']]
  return <main className="vp-dashboard"><section className="vp-opportunity-content"><div className="vp-task-grid"><article className="vp-task-card"><header><strong>全年订单任务</strong><small>单位：K$</small></header><div className="vp-task-progress"><b>17.18%</b><span>订单完成率</span></div><div className="vp-task-values"><span>商机预测总额<b>5,896.50</b></span><span>订单目标总额<b>5,571.43</b></span><span>已完成订单总额<b>957.06</b></span><span>未完成订单总额<b>4,614.37</b></span></div></article><article className="vp-task-card vp-task-red"><header><strong>全年回款任务</strong><small>单位：K$</small></header><div className="vp-task-progress"><b>0.00%</b><span>回款完成率</span></div><div className="vp-task-values"><span>计划回款总额<b>0.00</b></span><span>回款目标总额<b>3,824.15</b></span><span>已完成回款总额<b>0.00</b></span><span>未完成回款总额<b>3,824.15</b></span></div></article></div><section className="vp-table-panel"><div className="vp-tabs"><button className="active">商机列表</button><button>双算���机列表</button><button>毛订单列表</button><button>回款列表</button><button>回款计划及明细</button></div><div className="vp-table-tools"><label><Search size={15}/><input placeholder="搜索商机名称、客户名称或负责人" /></label><button>筛选器</button><button><Download size={14}/> 导出</button></div><div className="vp-table-wrap"><table><thead><tr>{['商机名称','预计签单日期','负责人','币种','预计金额','商机状态','客户名称','行业','采购阶段','赢单几率'].map(head=><th key={head}>{head}</th>)}</tr></thead><tbody>{vpRows.map(row=><tr key={row[0]}>{row.map((cell,index)=><td key={`${row[0]}-${index}`}>{index===5?<span className="vp-status-pill">{cell}</span>:index===9?<span className="vp-probability">{cell}</span>:cell}</td>)}</tr>)}</tbody></table></div></section></section></main>
}

function Leads(){
  const rows=[['安徽电信IPOSS系统(行业定制化网管)2024年新拓','主动营销','安徽电信','田映','--','销售自建','审批通过','已分配','姚其文','2024-01-03 16:45:47','刘锋华','电话与日常交流，暂时不需要关注。'],['上海恒信IPAM系统2027年新建线索','主动营销','上海恒信1','王来亮','55','销售自建','审批通过','已分配','刘锋华','2026-09-11 15:53:13','--',''],['上海恒信MBOSS(认证APP)系统2...','主动营销','上海恒信','王来亮','7','销售自建','审批通过','已分配','刘锋华','2026-09-11 16:02:43','--',''],['上海恒信终端APP系统2026年新...','主动营销','上海恒信3','56','2','销售自建','审批通过','已分配','刘锋华','2026-09-12 23:38:18','--',''],['上海恒信综合调度系统2028年...','主动营销','上海恒信','44','1','销售自建','审批通过','已分配','刘锋华','2026-09-12 23:40:01','--','']]
  const [detail,setDetail]=useState<string[]|null>(null)
  const [creating,setCreating]=useState(false)
  if(detail) return <LeadDetail row={detail} onBack={()=>setDetail(null)}/>
  if(creating) return <NewLead onClose={()=>setCreating(false)}/>
  return <main className="leads-page"><div className="leads-toolbar"><span>全部线索 <ChevronDown size={12}/></span><input placeholder="自定义标签"/><button>筛选负责人 <ChevronDown size={12}/></button><button>线索负责人 <ChevronDown size={12}/></button><label><Search size={14}/><input placeholder="线索名/��户���/联系人"/></label><button onClick={()=>setCreating(true)}>新建线索</button><button>更多操作 <ChevronDown size={12}/></button></div><div className="leads-table-wrap"><table><thead><tr>{['线索名称','线索类型','客户名称','联系人','联系电话','线索来源','审批状态','线索状态','负责人','创建时间','跟进人员','最新跟进','最新跟进时间','操作'].map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.map((cell,i)=><td key={`${row[0]}-${i}`}>{i===6?<span className="lead-approved lead-assigned">{cell}</span>:i===7?<span className="lead-assigned">{cell}</span>:cell}</td>)}<td>--</td><td><a onClick={()=>setDetail(row)} style={{cursor:'pointer'}}>详���</a>　<a>+ 添加标签</a></td></tr>)}</tbody></table></div><div className="leads-footer"><span>共 5 条</span><button>10条/页 <ChevronDown size={12}/></button><button disabled>‹</button><b>1</b><button>›</button></div></main>
}

function NLField({label,required,full,hint,children}:{label:string;required?:boolean;full?:boolean;hint?:boolean;children:React.ReactNode}){
  return <div className={`nl-field${full?' full':''}`}>
    <label>{required&&<span className="req">*</span>}{label}{hint&&<HelpCircle size={13}/>}</label>
    {children}
  </div>
}

function NLSelect({value,onChange,options,placeholder}:{value:string;onChange:(v:string)=>void;options:string[];placeholder?:string}){
  return <div className="nl-select-wrap">
    <select className={`nl-select${value?'':' placeholder'}`} value={value} onChange={e=>onChange(e.target.value)}>
      {placeholder&&<option value="">{placeholder}</option>}
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={15}/>
  </div>
}

function NewLead({onClose}:{onClose:()=>void}){
  const [f,setF]=useState({name:'',type:'主动营销',owner:'刘锋华',dept:'南方销售中心',activity:'',detail:'',cust:'',contact:'',title:'',phone:'',email:'',social:'',industry:'',region:'',remark:''})
  const set=(k:string,v:string)=>setF(p=>({...p,[k]:v}))
  const productCols:[string,boolean][]=[['产品名称',true],['产品经理',false],['交付经理',false],['订购类型',false],['单价（不含税）',true],['数量',true],['不含税总额',false],['税率(%)',true],['产品属性',false],['价税合计',false],['净销售不含税额',true],['备注',false]]
  const contactCols:[string,boolean][]=[['联系人',true],['角色',true],['重要性',true],['联系电话',false],['电子邮件',false],['社交账号',false],['部门',false],['职务',false],['备注',false]]
  return <div className="nl-overlay" role="dialog" aria-modal="true" aria-label="新建线索">
    <header className="nl-header"><h1>新建线索</h1><button className="nl-close" onClick={onClose} aria-label="关闭"><X size={20}/></button></header>
    <div className="nl-body"><div className="nl-inner">
      <section className="nl-card">
        <div className="nl-card-head"><h2>基本信息</h2></div>
        <div className="nl-grid">
          <NLField label="线索名" required><input className="nl-input" placeholder="请输入线索名称" value={f.name} onChange={e=>set('name',e.target.value)}/></NLField>
          <NLField label="线索类型" required><NLSelect value={f.type} onChange={v=>set('type',v)} options={['主动营销','被动营销','转介绍','公开招标']}/></NLField>
          <NLField label="负责人" required><input className="nl-input" value={f.owner} onChange={e=>set('owner',e.target.value)}/></NLField>
          <NLField label="负责人部门" required hint><NLSelect value={f.dept} onChange={v=>set('dept',v)} options={['南方销售中心','北方销售中心','华东销售中心','华南销售中心']}/></NLField>
          <NLField label="市场活动"><NLSelect value={f.activity} onChange={v=>set('activity',v)} options={['2024春季峰会','新品发布会','行业展会']} placeholder="市场活动"/></NLField>
          <div/>
          <NLField label="线索详情" full>
            <div className="nl-textarea-wrap">
              <textarea className="nl-textarea" maxLength={300} placeholder="线索详情" value={f.detail} onChange={e=>set('detail',e.target.value)}/>
              <span className="nl-count">{f.detail.length}/300</span>
            </div>
          </NLField>
          <NLField label="上传附件" full><button className="nl-upload"><Paperclip size={15}/> 点击上传附件</button></NLField>
        </div>
      </section>
      <section className="nl-card">
        <div className="nl-card-head"><h2>客户信息</h2></div>
        <div className="nl-grid">
          <NLField label="客户名" required><input className="nl-input" placeholder="客户名" value={f.cust} onChange={e=>set('cust',e.target.value)}/></NLField>
          <NLField label="重要联系人" required><input className="nl-input" placeholder="重要联系人" value={f.contact} onChange={e=>set('contact',e.target.value)}/></NLField>
          <NLField label="联系人职务"><input className="nl-input" placeholder="联系人职务" value={f.title} onChange={e=>set('title',e.target.value)}/></NLField>
          <NLField label="���系电话"><input className="nl-input" placeholder="联系电话" value={f.phone} onChange={e=>set('phone',e.target.value)}/></NLField>
          <NLField label="电子邮件"><input className="nl-input" placeholder="电子邮件" value={f.email} onChange={e=>set('email',e.target.value)}/></NLField>
          <NLField label="社交账号"><input className="nl-input" placeholder="微信/QQ/Whatsapp" value={f.social} onChange={e=>set('social',e.target.value)}/></NLField>
          <NLField label="行业"><NLSelect value={f.industry} onChange={v=>set('industry',v)} options={['电信','金融','政府','制造','互联网']} placeholder="行业"/></NLField>
          <NLField label="所在地区"><NLSelect value={f.region} onChange={v=>set('region',v)} options={['上海','北京','广东','安徽','江苏']} placeholder="所在地区"/></NLField>
          <div/>
          <NLField label="备注" full><input className="nl-input" placeholder="备注" value={f.remark} onChange={e=>set('remark',e.target.value)}/></NLField>
        </div>
      </section>
      <section className="nl-card">
        <div className="nl-card-head"><h2><span className="req">*</span>产品信息</h2><button className="nl-add" aria-label="添加产品"><Plus size={17}/></button></div>
        <div style={{overflowX:'auto'}}><table className="nl-table"><thead><tr>{productCols.map(([c,r])=><th key={c}>{r&&<span className="req">*</span>}{c}</th>)}</tr></thead><tbody><tr><td colSpan={productCols.length}><div className="nl-empty"><Inbox size={30}/>暂无数据</div></td></tr></tbody></table></div>
      </section>
      <section className="nl-card">
        <div className="nl-card-head"><h2>联系人</h2><button className="nl-add" aria-label="添加联系人"><Plus size={17}/></button></div>
        <div style={{overflowX:'auto'}}><table className="nl-table"><thead><tr>{contactCols.map(([c,r])=><th key={c}>{r&&<span className="req">*</span>}{c}</th>)}</tr></thead><tbody><tr><td colSpan={contactCols.length}><div className="nl-empty"><Inbox size={30}/>暂无数据</div></td></tr></tbody></table></div>
      </section>
    </div></div>
    <footer className="nl-footer"><button className="nl-btn ghost" onClick={onClose}>取消</button><button className="nl-btn outline">提交审批</button><button className="nl-btn primary">保存</button></footer>
  </div>
}

type CampaignRow=[string,string,string,string,string,'active'|'ended'|'planned',string,string,string]

const campaignStatus:{[k:string]:{label:string;bg:string;color:string;border:string}}={
  active:{label:'进行中',bg:'#fff6e8',color:'var(--amber)',border:'#f3dcb0'},
  ended:{label:'已结束',bg:'#f1f4f8',color:'var(--muted)',border:'#dde4ec'},
  planned:{label:'已计划',bg:'#eef4ff',color:'var(--blue)',border:'#cfe0f1'},
}

function NewCampaign({onClose,row}:{onClose:()=>void;row?:CampaignRow}){
  const [f,setF]=useState(()=>{
    if(!row) return {name:'',type:'',region:'',status:'已计划',invited:'0',actual:'0',budget:'',income:'',start:'',end:'',owner:'',members:'',address:'',content:''}
    const [name,type,region,budget,income,st,owner,start,end]=row
    return {name,type,region,status:campaignStatus[st].label,invited:'0',actual:'0',budget:budget.replace(/,/g,''),income:income.replace(/,/g,''),start,end,owner,members:'',address:'',content:''}
  })
  const set=(k:string,v:string)=>setF(p=>({...p,[k]:v}))
  const title=row?'编辑':'新建市场活动'
  return <div className="nl-overlay" role="dialog" aria-modal="true" aria-label={title}>
    <header className="nl-header"><h1>{title}{row&&<span className="nl-subtitle">{row[0]}</span>}</h1><button className="nl-close" onClick={onClose} aria-label="关闭"><X size={20}/></button></header>
    <div className="nl-body"><div className="nl-inner">
      <section className="nl-card">
        <div className="nl-card-head"><h2>活动信息</h2></div>
        <div className="nl-grid">
          <NLField label="市场活动名称" required><input className="nl-input" placeholder="请输入市场活动名称" value={f.name} onChange={e=>set('name',e.target.value)}/></NLField>
          <NLField label="活动类型" required><NLSelect value={f.type} onChange={v=>set('type',v)} options={['客户交流会','专业研讨会','行业展会','产品发布会','其他']} placeholder="请选择活动类型"/></NLField>
          <NLField label="活动区域" required><NLSelect value={f.region} onChange={v=>set('region',v)} options={['亚洲/中国/江苏/南京','亚洲/中国/上海','亚洲/中国/北京','亚洲/中国/广东/深圳']} placeholder="活动区域"/></NLField>
          <NLField label="活动状态" required><NLSelect value={f.status} onChange={v=>set('status',v)} options={['已计划','进行中','已结束']}/></NLField>
          <NLField label="邀请人数"><input className="nl-input" type="number" min={0} value={f.invited} onChange={e=>set('invited',e.target.value)}/></NLField>
          <NLField label="实际人数"><input className="nl-input" type="number" min={0} value={f.actual} onChange={e=>set('actual',e.target.value)}/></NLField>
        </div>
      </section>
      <section className="nl-card">
        <div className="nl-card-head"><h2>预算与排期</h2></div>
        <div className="nl-grid">
          <NLField label="活动预算（美元）" required><input className="nl-input" inputMode="decimal" placeholder="请输入活动预算" value={f.budget} onChange={e=>set('budget',e.target.value)}/></NLField>
          <NLField label="预计收入（美元）"><input className="nl-input" inputMode="decimal" placeholder="请输入预计收入" value={f.income} onChange={e=>set('income',e.target.value)}/></NLField>
          <div/>
          <NLField label="开始时间" required><input className={`nl-input${f.start?'':' nl-date-empty'}`} type="date" value={f.start} onChange={e=>set('start',e.target.value)} aria-label="请选择开始时间"/></NLField>
          <NLField label="结束时间" required><input className={`nl-input${f.end?'':' nl-date-empty'}`} type="date" min={f.start||undefined} value={f.end} onChange={e=>set('end',e.target.value)} aria-label="请选择结束时间"/></NLField>
          <div/>
        </div>
      </section>
      <section className="nl-card">
        <div className="nl-card-head"><h2>人员与内容</h2></div>
        <div className="nl-grid">
          <NLField label="负责人" required><NLSelect value={f.owner} onChange={v=>set('owner',v)} options={['刘锋华','王玉明','杨博','叶恒','王利军']} placeholder="请输入人员姓名进行搜索"/></NLField>
          <NLField label="参与人"><input className="nl-input" placeholder="请输入人员姓名，多个人之间逗号隔开" value={f.members} onChange={e=>set('members',e.target.value)}/></NLField>
          <NLField label="活动地址"><input className="nl-input" placeholder="请输入详细地址" value={f.address} onChange={e=>set('address',e.target.value)}/></NLField>
          <NLField label="活动内容" full>
            <div className="nl-textarea-wrap">
              <textarea className="nl-textarea" maxLength={1024} placeholder="请输入活动详细" value={f.content} onChange={e=>set('content',e.target.value)}/>
              <span className="nl-count">{f.content.length}/1024</span>
            </div>
          </NLField>
          <NLField label="附件" full><button className="nl-upload"><Paperclip size={15}/> 点击上传附件</button></NLField>
        </div>
      </section>
    </div></div>
    <footer className="nl-footer"><button className="nl-btn ghost" onClick={onClose}>取消</button><button className="nl-btn primary" onClick={row?onClose:undefined}>{row?'提交':'保存'}</button></footer>
  </div>
}

function CampaignDetail({row,onBack,onEdit}:{row:CampaignRow;onBack:()=>void;onEdit:()=>void}){
  const [name,type,region,budget,income,st,owner,start,end]=row
  const s=campaignStatus[st]
  const facts:[string,string][]=[['活动预算（美元）',budget],['预计收入（美元）',income],['开始时间',start],['结束时间',end]]
  const fields:[string,string][]=[['市场活动',name],['活动类型',type],['活动区域',region],['活动状态',s.label],['邀请人数','0'],['实际人数','0'],['活动预算（美元）',budget],['预计收入（美元）',income],['开始时间',start],['结束时间',end],['负责人',owner],['参与人','--']]
  const wide:[string,string][]=[['活动地址','--'],['活动内容','--'],['附件','--']]
  return <main className="lead-detail" style={{minHeight:'calc(100vh - 62px)',background:'var(--canvas)',padding:'20px 24px 40px',fontSize:13,color:'var(--ink)'}}>
    <div style={{...detailCard,marginBottom:16,overflow:'hidden'}}>
      <div style={{padding:'18px 24px 20px',background:'linear-gradient(180deg,#f7fafd,#fff)',borderBottom:'1px solid var(--line)'}}>
        <nav aria-label="面包屑" style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,fontSize:12,color:'var(--muted)'}}>
          <a onClick={onBack} style={{cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4,color:'var(--muted)'}}><ChevronLeft size={14}/> 市场活动</a>
          <span style={{color:'#c3cedb'}}>/</span>
          <span style={{color:'var(--ink)'}}>活动详情</span>
        </nav>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:16,minWidth:0}}>
            <span style={{width:52,height:52,borderRadius:14,background:'#fff6e8',border:'1px solid #f3dcb0',display:'grid',placeItems:'center',color:'var(--amber)',flexShrink:0,boxShadow:'0 2px 6px rgba(214,150,40,.14)'}}><Megaphone size={24} strokeWidth={1.8}/></span>
            <div style={{minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                <h1 style={{fontSize:18,lineHeight:1.3,fontWeight:700,margin:0}}>市场活动信息 · {name}</h1>
                <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,borderRadius:20,padding:'2px 11px',fontSize:11,fontWeight:600}}>{s.label}</span>
              </div>
              <div style={{marginTop:9,color:'var(--muted)',fontSize:12,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                <span>负责人：<span style={{color:'var(--ink)',fontWeight:500}}>{owner}</span></span>
                <span style={{color:'#c3cedb'}}>|</span>
                <span>活动类型：<span style={{color:'var(--ink)',fontWeight:500}}>{type}</span></span>
                <span style={{color:'#c3cedb'}}>|</span>
                <span>活动区域：<span style={{color:'var(--ink)',fontWeight:500}}>{region}</span></span>
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:10,flexShrink:0}}>
            <button style={{height:34,padding:'0 15px',borderRadius:7,background:'var(--paper)',border:'1px solid var(--line)',color:'var(--muted)',fontSize:13,display:'inline-flex',alignItems:'center',gap:6}}><Trash2 size={14}/> 删除</button>
            <button onClick={onEdit} style={{height:34,padding:'0 20px',borderRadius:7,background:'var(--blue)',color:'#fff',fontSize:13,display:'inline-flex',alignItems:'center',gap:6,boxShadow:'0 2px 6px rgba(47,102,197,.25)'}}><Pencil size={14}/> 编辑</button>
          </div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
        {facts.map(([label,value],i)=><div key={label} style={{padding:'16px 24px',borderLeft:i?'1px solid var(--line)':'0'}}>
          <div style={{color:'var(--muted)',fontSize:12,marginBottom:6}}>{label}</div>
          <div style={{color:'var(--ink)',fontSize:15,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>{value||'--'}</div>
        </div>)}
      </div>
    </div>
    <section style={{...detailCard,overflow:'hidden'}}>
      <div style={{padding:'14px 24px',borderBottom:'1px solid var(--line)',background:'linear-gradient(180deg,#fff,#f9fbfd)'}}>
        <h2 style={{margin:0,fontSize:14,fontWeight:600,display:'flex',alignItems:'center',gap:8}}><span style={{width:3,height:14,borderRadius:2,background:'var(--blue)'}}/>活动资料</h2>
      </div>
      <div style={{padding:'20px 24px 24px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px 32px'}}>
        {fields.map(([label,value])=><div key={label} style={{minWidth:0}}>
          <div style={{color:'var(--muted)',fontSize:12,marginBottom:6}}>{label}</div>
          <div style={{color:'var(--ink)',fontSize:13,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={value}>{value||'--'}</div>
        </div>)}
        {wide.map(([label,value])=><div key={label} style={{gridColumn:'1 / -1',paddingTop:16,borderTop:'1px dashed var(--line)'}}>
          <div style={{color:'var(--muted)',fontSize:12,marginBottom:6}}>{label}</div>
          <div style={{color:'var(--ink)',fontSize:13,lineHeight:1.6}}>{value}</div>
        </div>)}
      </div>
    </section>
  </main>
}

function Campaigns(){
  const rows:CampaignRow[]=[
    ['南京市灵璧商会','其他','亚洲/中国/江苏/南京','2,000.00','0.00','active','王玉明','2022-06-15','2023-06-30'],
    ['紫云智慧园区华为营销打法讲座活动','专业研讨会','亚洲/中国/江苏/南京/建邺区','100.00','0.00','ended','杨博','2022-05-10','2022-05-10'],
    ['EBOSS企业微信直播分享会','客户交流会','亚洲/中国/江苏/南京/雨花台区','100.00','0.00','ended','叶恒','2022-01-11','2022-01-11'],
    ['活动1','客户交流会','北京省办','100,000.00','200,000.00','planned','王利军','2021-08-18','2021-08-19'],
  ]
  const status:{[k:string]:[string,string]}={active:['进行中','camp-active'],ended:['已结束','camp-ended'],planned:['已计划','camp-planned']}
  const cols=['市场活动名称','活动类型','活动区域','活动预算（美元）','预计收入（美元）','活动状态','负责人','开始日期','结束日期','操作']
  const numeric=[3,4]
  const [creating,setCreating]=useState(false)
  const [detail,setDetail]=useState<CampaignRow|null>(null)
  const [editing,setEditing]=useState(false)
  const [menuOpen,setMenuOpen]=useState(false)
  if(creating) return <NewCampaign onClose={()=>setCreating(false)}/>
  if(detail&&editing) return <NewCampaign row={detail} onClose={()=>setEditing(false)}/>
  if(detail) return <CampaignDetail row={detail} onBack={()=>setDetail(null)} onEdit={()=>setEditing(true)}/>
  return <main className="leads-page">
    <div className="leads-toolbar">
      <span>全部活动 <ChevronDown size={12}/></span>
      <button aria-label="筛选"><Filter size={13}/></button>
      <button><Maximize2 size={13}/> 专注</button>
      <button aria-label="设置"><Settings size={13}/></button>
      <button aria-label="刷新"><RefreshCw size={13}/></button>
      <label><Search size={14}/><input placeholder="市场活动名称/负责人姓名"/></label>
      <button onClick={()=>setCreating(true)}>新建市场活动</button>
      <div className="more-menu" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setMenuOpen(false)}} onKeyDown={e=>{if(e.key==='Escape')setMenuOpen(false)}}>
        <button aria-haspopup="menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(o=>!o)}>更多操作 <ChevronDown size={12} style={{transition:'transform .2s',transform:menuOpen?'rotate(180deg)':'none'}}/></button>
        {menuOpen&&<div className="more-menu-list" role="menu">
          <button role="menuitem" onClick={()=>setMenuOpen(false)}><Upload size={14}/> 导入市场活动</button>
          <button role="menuitem" onClick={()=>setMenuOpen(false)}><Download size={14}/> 导出市场活动</button>
        </div>}
      </div>
    </div>
    <div className="leads-table-wrap camp-table">
      <table>
        <thead><tr>{cols.map((c,i)=><th key={c} style={numeric.includes(i)?{textAlign:'right'}:undefined}><span style={{display:'inline-flex',alignItems:'center',gap:4,justifyContent:numeric.includes(i)?'flex-end':'flex-start'}}>{c}{i<cols.length-1&&<ChevronsUpDown size={12} style={{color:'#b6c2d0',flexShrink:0}}/>}</span></th>)}</tr></thead>
        <tbody>{rows.map(r=>{const [name,type,region,budget,income,st,owner,start,end]=r;const [label,cls]=status[st];return <tr key={name}>
          <td title={name}>{name}</td>
          <td>{type}</td>
          <td title={region}>{region}</td>
          <td style={{textAlign:'right'}}>{budget}</td>
          <td style={{textAlign:'right'}}>{income}</td>
          <td><span className={`camp-pill ${cls}`}>{label}</span></td>
          <td>{owner}</td>
          <td>{start}</td>
          <td>{end}</td>
          <td><a onClick={()=>setDetail(r)} style={{cursor:'pointer'}}>详情</a></td>
        </tr>})}</tbody>
      </table>
    </div>
    <div className="leads-footer"><span>共 4 条</span><button>10条/页 <ChevronDown size={12}/></button><button disabled>‹</button><b>1</b><button>›</button></div>
  </main>
}

type TagRow={name:string;topic:string;desc:string;source:'规则筛选'|'文件上传';cust:number;contact:number;color:string;uses:number;created:string}

const tagColors=[{v:'#2f66c5',label:'蓝色'},{v:'#e45757',label:'红色'},{v:'#c9a166',label:'琥珀'},{v:'#3f9d6b',label:'绿色'},{v:'#8a97a8',label:'灰色'}]

const initialTags:TagRow[]=[
  {name:'国际移网客户组',topic:'新品推荐',desc:'该组客户指客户标签字段=MNO or MNO副牌 or MVNO的所有客户',source:'规则筛选',cust:96,contact:716,color:'#2f66c5',uses:0,created:'2026-08-13 19:49:04'},
  {name:'TEST0813-许雪飞',topic:'-',desc:'',source:'规则筛选',cust:1,contact:1,color:'#2f66c5',uses:0,created:'2026-08-13 11:39:37'},
  {name:'非李来权客户',topic:'-',desc:'',source:'规则筛选',cust:370,contact:2639,color:'#2f66c5',uses:0,created:'2026-02-11 13:52:04'},
  {name:'排除亚信安全',topic:'-',desc:'排除邮箱包含asiainfo-sec.com',source:'规则筛选',cust:385,contact:2842,color:'#2f66c5',uses:0,created:'2026-02-11 12:03:18'},
  {name:'排除亚信科技',topic:'-',desc:'排除邮箱地址：asiainfo.com',source:'规则筛选',cust:385,contact:2841,color:'#2f66c5',uses:0,created:'2026-02-11 12:02:31'},
  {name:'排除CMEC 薛志平',topic:'-',desc:'',source:'规则筛选',cust:385,contact:2842,color:'#2f66c5',uses:0,created:'2026-02-11 11:52:21'},
  {name:'TEST',topic:'-',desc:'',source:'规则筛选',cust:1,contact:1,color:'#2f66c5',uses:0,created:'2026-02-10 17:07:57'},
  {name:'排除邮箱zte、huawei、cmi、xfusion、ctsig、chinatelecomgloba',topic:'-',desc:'排除邮箱zte、huawei、cmi、xfusion、ctsig、chinatelecomglobal、alibaba-inc',source:'规则筛选',cust:380,contact:2688,color:'#2f66c5',uses:0,created:'2026-02-10 10:38:17'},
  {name:'非渠道客户',topic:'-',desc:'',source:'规则筛选',cust:366,contact:2757,color:'#3f9d6b',uses:0,created:'2026-02-06 12:00:11'},
  {name:'非老挝、也门、蒙古',topic:'-',desc:'',source:'规则筛选',cust:373,contact:2770,color:'#2f66c5',uses:0,created:'2026-02-03 16:47:22'},
  {name:'东南亚重点运营商',topic:'区域拓展',desc:'东南亚地区年营收前二十的运营商客户',source:'规则筛选',cust:42,contact:318,color:'#c9a166',uses:3,created:'2026-01-28 09:15:40'},
  {name:'即将到期大型金融客户',topic:'续约提醒',desc:'合同将于90天内到期的金融行业客户',source:'规则筛选',cust:27,contact:164,color:'#e45757',uses:5,created:'2026-01-22 14:30:12'},
  {name:'2025年展会名单',topic:'市场活动',desc:'2025年行业展会现场收集的联系人',source:'文件上传',cust:58,contact:203,color:'#3f9d6b',uses:2,created:'2026-01-15 10:02:55'},
  {name:'政企高价值客户',topic:'新品推荐',desc:'近三年合同总额超过500万的政企客户',source:'规则筛选',cust:64,contact:421,color:'#c9a166',uses:1,created:'2026-01-09 16:44:08'},
  {name:'沉默客户唤醒',topic:'客户关怀',desc:'超过180天无跟进记录的客户',source:'规则筛选',cust:112,contact:689,color:'#8a97a8',uses:0,created:'2025-12-30 11:20:36'},
  {name:'华东区域CIO',topic:'-',desc:'华东区域客户中职务为CIO的联系人',source:'规则筛选',cust:88,contact:96,color:'#2f66c5',uses:4,created:'2025-12-18 15:05:47'},
  {name:'渠道伙伴名单',topic:'渠道合作',desc:'',source:'文件上传',cust:35,contact:77,color:'#3f9d6b',uses:1,created:'2025-12-02 09:48:19'},
  {name:'测试标签-勿用',topic:'-',desc:'',source:'规则筛选',cust:0,contact:0,color:'#8a97a8',uses:0,created:'2025-11-20 17:31:02'},
]

type TagCond={id:number;field:string;op:string;value:string}
const condGroups:{key:'cust'|'prod'|'contact';label:string;add:string;fields:string[]}[]=[
  {key:'cust',label:'客户属性',add:'添加客户属性条件',fields:['客户名称','客户行业','所在地区','客户等级','客户标签']},
  {key:'prod',label:'产品信息',add:'添加产品信息条件',fields:['产品名称','产品经理','订购类型','合同到期时间']},
  {key:'contact',label:'联系人',add:'添加联系人条件',fields:['联系人职务','电子邮件','重要性','所属部门']},
]
const condOps=['等于','不等于','包含','不包含']
const previewContacts=[['张立军','中国移动国际','CIO','zhanglj@cmi.chinamobile.com'],['Nguyen Van An','Viettel Group','采购总监','an.nv@viettel.com.vn'],['李梦婷','上海恒信','IT经理','limt@hengxin.com'],['Ahmed Karim','Ooredoo','CTO','a.karim@ooredoo.com'],['王振宇','安徽电信','网络部主任','wangzy@ah.chinatelecom.cn'],['Siti Rahma','Telkomsel','产品经理','siti.r@telkomsel.co.id'],['陈晓峰','南京灵璧商会','秘书长','chenxf@lbsh.org'],['Maria Santos','Globe Telecom','运营总监','m.santos@globe.com.ph']]

function NewTag({row,readOnly=false,onClose,onSave,onEdit}:{row?:TagRow;readOnly?:boolean;onClose:()=>void;onSave:(t:TagRow)=>void;onEdit?:()=>void}){
  const [name,setName]=useState(row?.name??'')
  const [topic,setTopic]=useState(row&&row.topic!=='-'?row.topic:'')
  const [desc,setDesc]=useState(row?.desc??'')
  const [color,setColor]=useState(row?.color??tagColors[0].v)
  const [source,setSource]=useState<TagRow['source']>(row?.source??'规则筛选')
  const [rule,setRule]=useState<'and'|'or'>('and')
  const [conds,setConds]=useState<{[k:string]:TagCond[]}>({cust:[],prod:[],contact:[]})
  const [nextId,setNextId]=useState(1)
  const [preview,setPreview]=useState<number|null>(null)
  const [error,setError]=useState(false)
  const total=Object.values(conds).reduce((n,l)=>n+l.length,0)
  const addCond=(k:string,field:string)=>{setConds(c=>({...c,[k]:[...c[k],{id:nextId,field,op:'等于',value:''}]}));setNextId(i=>i+1);setPreview(null)}
  const updCond=(k:string,id:number,patch:Partial<TagCond>)=>{setConds(c=>({...c,[k]:c[k].map(x=>x.id===id?{...x,...patch}:x)}));setPreview(null)}
  const delCond=(k:string,id:number)=>{setConds(c=>({...c,[k]:c[k].filter(x=>x.id!==id)}));setPreview(null)}
  const runPreview=()=>setPreview(total===0?0:rule==='and'?Math.max(2,8-total*2):Math.min(8,4+total*2))
  const matched=preview?previewContacts.slice(0,preview):[]
  const save=()=>{
    if(!name.trim()){setError(true);return}
    const now=new Date(),p=(n:number)=>String(n).padStart(2,'0')
    onSave({name:name.trim(),topic:topic||'-',desc,source,color,cust:row?.cust??new Set(matched.map(m=>m[1])).size,contact:row?.contact??matched.length,uses:row?.uses??0,created:row?.created??`${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}:${p(now.getSeconds())}`})
  }
  const title=readOnly?'查看标签':row?'编辑标签':'新增标签'
  const shownContacts=readOnly?previewContacts.slice(0,row?.contact??0):matched
  const showList=readOnly?shownContacts.length>0:!!preview
  return <div className="nl-overlay" role="dialog" aria-modal="true" aria-label={title}>
    <header className="nl-header"><h1>{title}{row&&<span className="nl-subtitle">{row.name}</span>}</h1><button className="nl-close" onClick={onClose} aria-label="关闭"><X size={20}/></button></header>
    <div className="nt-body">
      <section className="nt-panel">
        <div className="nl-card-head"><h2>标签配置</h2></div>
        <div className="nt-panel-body"><fieldset className="nt-form" disabled={readOnly}>
          <div className="nt-row">
            <label htmlFor="nt-name"><span className="req">*</span>标签名称</label>
            <div className="nt-field">
              <div className="nl-textarea-wrap"><input id="nt-name" className="nl-input" style={{paddingRight:64,...(error?{borderColor:'var(--coral)'}:{})}} maxLength={50} placeholder="例：产品即将到期的大型金融客户" value={name} onChange={e=>{setName(e.target.value);setError(false)}} aria-invalid={error}/><span className="nl-count" style={{bottom:12}}>{name.length}/50</span></div>
              {error&&<span className="nt-error">请输入标签名称</span>}
            </div>
          </div>
          <div className="nt-row">
            <label>标签主题</label>
            <NLSelect value={topic} onChange={setTopic} options={['新品推荐','续约提醒','区域拓展','市场活动','客户关怀','渠道合作']} placeholder="请选择标签主题"/>
          </div>
          <div className="nt-row">
            <label htmlFor="nt-desc">标签描述</label>
            <div className="nl-textarea-wrap"><textarea id="nt-desc" className="nl-textarea" maxLength={200} placeholder="选填，标签的用途和说明" value={desc} onChange={e=>setDesc(e.target.value)}/><span className="nl-count">{desc.length}/200</span></div>
          </div>
          <div className="nt-row">
            <label><span className="req">*</span>标签颜色</label>
            <div className="nt-swatches" role="radiogroup" aria-label="标签颜色">
              {tagColors.map(c=><button key={c.v} role="radio" aria-checked={color===c.v} aria-label={c.label} className="nt-swatch" style={{background:c.v}} onClick={()=>setColor(c.v)}>{color===c.v&&<CheckCircle2 size={15}/>}</button>)}
            </div>
          </div>
          <div className="nt-row">
            <label>名单来源</label>
            <div><div className="nt-seg">{(['规则筛选','文件上传'] as const).map(s=><button key={s} aria-pressed={source===s} onClick={()=>{setSource(s);setPreview(null)}}>{s}</button>)}</div></div>
          </div>
          {source==='规则筛选'?<>
            <div className="nt-row">
              <label>匹配规则</label>
              <div className="nt-rule">
                <button aria-pressed={rule==='and'} onClick={()=>{setRule('and');setPreview(null)}}><b>满足所有条件</b><span>AND</span></button>
                <button aria-pressed={rule==='or'} onClick={()=>{setRule('or');setPreview(null)}}><b>满足任一条件</b><span>OR</span></button>
              </div>
            </div>
            {condGroups.map(g=><div className="nt-row" key={g.key}>
              <label>{g.label}</label>
              <div className="nt-conds">
                {conds[g.key].map(c=><div className="nt-cond" key={c.id}>
                  <NLSelect value={c.field} onChange={v=>updCond(g.key,c.id,{field:v})} options={g.fields}/>
                  <NLSelect value={c.op} onChange={v=>updCond(g.key,c.id,{op:v})} options={condOps}/>
                  <input className="nl-input" placeholder="请输入条件值" aria-label={`${c.field}条件值`} value={c.value} onChange={e=>updCond(g.key,c.id,{value:e.target.value})}/>
                  <button className="nt-del" aria-label="删除条件" onClick={()=>delCond(g.key,c.id)}><Trash2 size={15}/></button>
                </div>)}
                {readOnly?(conds[g.key].length===0&&<span className="nt-none">-</span>)
                :<button className="nt-add-cond" onClick={()=>addCond(g.key,g.fields[0])}><Plus size={15}/>{g.add}</button>}
              </div>
            </div>)}
          </>:<div className="nt-row">
            <label>上传名单</label>
            <div className="nt-drop">
              <span className="nt-drop-icon"><Upload size={20}/></span>
              <b>点击或拖拽文件到此处上传</b>
              <span>支持 .xlsx / .csv 格式，单次最多 5000 条联系人</span>
              <button className="nl-upload" style={{alignSelf:'center',marginTop:6}}><Download size={14}/> 下载导入模板</button>
            </div>
          </div>}
        </fieldset></div>
      </section>
      <section className="nt-panel">
        <div className="nl-card-head"><h2>{readOnly?'匹配结果':'预览匹配结果'}</h2>{!readOnly&&preview!==null&&preview>0&&<span className="nt-badge">已更新</span>}</div>
        <div className="nt-panel-body nt-preview">
          {!readOnly&&<button className="nt-preview-btn" onClick={runPreview}><Eye size={16}/> 点击预览（更新匹配数据）</button>}
          {readOnly&&row?<div className="nt-stats">
            <div><span>匹配客户</span><b>{row.cust}<small>个</small></b></div>
            <div><span>匹配联系人</span><b>{row.contact}<small>个</small></b></div>
          </div>
          :preview!==null&&preview>0&&<div className="nt-stats">
            <div><span>匹配客户</span><b>{new Set(matched.map(m=>m[1])).size}<small>个</small></b></div>
            <div><span>匹配联系人</span><b>{matched.length}<small>个</small></b></div>
          </div>}
          <h3 className="nt-sub">联系人列表</h3>
          {showList?<div className="nt-list"><table className="nl-table"><thead><tr><th>联系人</th><th>客户</th><th>职务</th><th>电子邮件</th></tr></thead><tbody>{shownContacts.map(m=><tr key={m[0]}>{m.map((v,i)=><td key={i} style={{padding:'12px 18px',borderBottom:'1px solid #edf1f6',color:i?'var(--muted)':'var(--ink)',fontWeight:i?400:500,whiteSpace:'nowrap'}}>{v}</td>)}</tr>)}</tbody></table></div>
          :<div className="nt-empty"><span><Info size={22}/></span>{preview===0?'暂无匹配条件，请先添加至少一个条件':'请配置匹配条件后点击预览'}</div>}
        </div>
      </section>
    </div>
    <footer className="nl-footer">{readOnly
      ?<><button className="nl-btn ghost" onClick={onClose}>关闭</button>{onEdit&&<button className="nl-btn primary" onClick={onEdit}>编辑</button>}</>
      :<><button className="nl-btn ghost" onClick={onClose}>取消</button><button className="nl-btn primary" onClick={save}>保存</button></>}</footer>
  </div>
}

function TagManage(){
  const [tags,setTags]=useState<TagRow[]>(initialTags)
  const [q,setQ]=useState('')
  const [query,setQuery]=useState('')
  const [page,setPage]=useState(1)
  const [size,setSize]=useState(10)
  const [jump,setJump]=useState('1')
  const [editing,setEditing]=useState<TagRow|null|'new'>(null)
  const [viewing,setViewing]=useState(false)
  const filtered=tags.filter(t=>!query||t.name.includes(query)||t.desc.includes(query))
  const pages=Math.max(1,Math.ceil(filtered.length/size))
  const cur=Math.min(page,pages)
  const shown=filtered.slice((cur-1)*size,cur*size)
  const go=(n:number)=>{const p=Math.min(pages,Math.max(1,n));setPage(p);setJump(String(p))}
  if(editing) return <NewTag key={viewing?'view':'edit'} row={editing==='new'?undefined:editing} readOnly={viewing} onEdit={()=>setViewing(false)} onClose={()=>{setEditing(null);setViewing(false)}} onSave={t=>{setTags(list=>editing==='new'?[t,...list]:list.map(x=>x===editing?t:x));setEditing(null);if(editing==='new')go(1)}}/>
  const cols:[string,boolean,boolean][]=[['标签名称',true,false],['标签主题',true,false],['标签描述',true,false],['名单来源',false,true],['成员数',false,true],['标签颜色',false,true],['使用次数',true,true],['创建时间',true,false],['操作',false,true]]
  return <main className="tag-page">
    <div className="tag-bar">
      <form className="tag-search" role="search" onSubmit={e=>{e.preventDefault();setQuery(q.trim());go(1)}}>
        <input placeholder="搜索标签名称或描述" aria-label="搜索标签名称或描述" value={q} onChange={e=>{setQ(e.target.value);if(!e.target.value){setQuery('');go(1)}}}/>
        <button type="submit" aria-label="搜索"><Search size={15}/></button>
      </form>
      <button className="tag-create" onClick={()=>setEditing('new')}><Plus size={15}/> 创建新标签</button>
    </div>
    <section className="tag-card">
      <div className="tag-table-wrap"><table className="tag-table">
        <thead><tr>{cols.map(([c,sort,center])=><th key={c} className={center?'c':undefined}><span className="tag-th">{c}{sort&&<ChevronsUpDown size={12}/>}</span></th>)}</tr></thead>
        <tbody>{shown.length?shown.map(t=><tr key={t.name+t.created}>
          <td><span className="tag-name" title={t.name}>{t.name}</span></td>
          <td className="tag-muted">{t.topic}</td>
          <td><span className="tag-desc" title={t.desc}>{t.desc||<span className="tag-muted">-</span>}</span></td>
          <td className="c"><span className="tag-src">{t.source}</span></td>
          <td className="c tag-members"><b>{t.cust}</b> 个客户<span>/</span><b>{t.contact}</b> 个联系人</td>
          <td className="c"><span className="tag-dot" style={{background:t.color,boxShadow:`0 0 0 4px ${t.color}22`}} aria-label={tagColors.find(c=>c.v===t.color)?.label}/></td>
          <td className="c tag-num">{t.uses}</td>
          <td className="tag-num tag-muted">{t.created}</td>
          <td className="c"><div className="tag-actions"><button onClick={()=>{setViewing(true);setEditing(t)}}>查看</button><button onClick={()=>{setViewing(false);setEditing(t)}}>编辑</button><button className="danger" onClick={()=>{if(window.confirm(`确定删除标签「${t.name}」吗？`))setTags(l=>l.filter(x=>x!==t))}}>删除</button></div></td>
        </tr>):<tr><td colSpan={cols.length}><div className="nl-empty"><Inbox size={30}/>暂无匹配的标签</div></td></tr>}</tbody>
      </table></div>
      <div className="tag-footer">
        <span>共 {filtered.length} 条</span>
        <div className="nl-select-wrap" style={{width:110}}><select className="nl-select tag-size" value={size} aria-label="每页条数" onChange={e=>{setSize(Number(e.target.value));go(1)}}>{[10,20,50].map(n=><option key={n} value={n}>{n}条/页</option>)}</select><ChevronDown size={14}/></div>
        <nav className="tag-pager" aria-label="分页">
          <button className="tag-pg" disabled={cur===1} onClick={()=>go(cur-1)} aria-label="上一页"><ChevronLeft size={15}/></button>
          {Array.from({length:pages},(_,i)=>i+1).map(n=><button key={n} className="tag-pg" aria-current={n===cur?'page':undefined} onClick={()=>go(n)}>{n}</button>)}
          <button className="tag-pg" disabled={cur===pages} onClick={()=>go(cur+1)} aria-label="下一页"><ChevronRight size={15}/></button>
        </nav>
        <label className="tag-jump">前往<input value={jump} inputMode="numeric" aria-label="跳转页码" onChange={e=>setJump(e.target.value.replace(/\D/g,''))} onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing&&e.keyCode!==229)go(Number(jump)||1)}} onBlur={()=>go(Number(jump)||1)}/>页</label>
      </div>
    </section>
  </main>
}

function LeadDetail({row,onBack}:{row:string[];onBack:()=>void}){
  const [tab,setTab]=useState('任务计划')
  const [followed,setFollowed]=useState(false)
  const tabs=['任务计划','���进记录','线索资料','团队成员','审批记录','操作日志']
  const leadName=row[0], leadType=row[1], custName=row[2], contact=row[3], source=row[5], approval=row[6], leadStatus=row[7], owner=row[8], created=row[9]
  const facts:[string,string][]=[['客户名称',custName],['联系人',contact],['线索来源',source],['创建时间',created]]
  return <main className="lead-detail" style={{minHeight:'calc(100vh - 62px)',background:'var(--canvas)',padding:'20px 24px 40px',fontSize:13,color:'var(--ink)'}}>
    <div style={{...detailCard,marginBottom:16,overflow:'hidden'}}>
      <div style={{padding:'18px 24px 20px',background:'linear-gradient(180deg,#f7fafd,#fff)',borderBottom:'1px solid var(--line)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16,fontSize:12,color:'var(--muted)'}}>
          <a onClick={onBack} style={{cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4,color:'var(--muted)'}}><ChevronLeft size={14}/> 我的线索</a>
          <span style={{color:'#c3cedb'}}>/</span>
          <span style={{color:'var(--ink)'}}>线索详情</span>
        </div>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:16,minWidth:0}}>
            <span style={{width:52,height:52,borderRadius:14,background:'#e5efff',border:'1px solid #cfe0f1',display:'grid',placeItems:'center',color:'var(--blue)',flexShrink:0,boxShadow:'0 2px 6px rgba(47,102,197,.12)'}}><Briefcase size={24} strokeWidth={1.8}/></span>
            <div style={{minWidth:0}}>
              <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
                <b style={{fontSize:18,lineHeight:1.3}}>销售线索 · {leadName}</b>
                <span style={{background:'#eef4ff',color:'var(--blue)',borderRadius:20,padding:'3px 11px',fontSize:11,fontWeight:600}}>{leadStatus}</span>
                <span style={{background:'#e6f7ec',color:'#27ab56',borderRadius:20,padding:'3px 11px',fontSize:11,fontWeight:600}}>{approval}</span>
              </div>
              <div style={{marginTop:9,color:'var(--muted)',fontSize:12,display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                <span>线索负责人：<span style={{color:'var(--ink)',fontWeight:500}}>{owner}</span></span>
                <span style={{color:'#c3cedb'}}>|</span>
                <span>线索类型：<span style={{color:'var(--ink)',fontWeight:500}}>{leadType}</span></span>
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:10,flexShrink:0}}>
            <button onClick={()=>setFollowed(f=>!f)} style={{height:34,padding:'0 15px',borderRadius:7,background:followed?'#fff7ec':'var(--paper)',border:`1px solid ${followed?'#ecd4a6':'var(--line)'}`,color:followed?'var(--amber)':'var(--muted)',fontSize:13,display:'inline-flex',alignItems:'center',gap:6,transition:'all .18s ease'}}><Star size={14} fill={followed?'currentColor':'none'}/> {followed?'已关注':'关注'}</button>
            <button style={{height:34,padding:'0 22px',borderRadius:7,background:'var(--blue)',color:'#fff',fontSize:13,boxShadow:'0 2px 6px rgba(47,102,197,.25)'}}>编辑</button>
          </div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)'}}>
        {facts.map(([label,value],i)=><div key={label} style={{padding:'16px 24px',borderLeft:i?'1px solid var(--line)':'0'}}>
          <div style={{color:'var(--muted)',fontSize:12,marginBottom:6}}>{label}</div>
          <div style={{color:'var(--ink)',fontSize:13,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}} title={value||'--'}>{value||'--'}</div>
        </div>)}
      </div>
    </div>
    <div style={{...detailCard,marginBottom:16,padding:'0 24px'}}>
      <div style={{display:'flex',gap:28}}>{tabs.map(item=><button key={item} onClick={()=>setTab(item)} style={{position:'relative',padding:'15px 2px',border:0,background:'transparent',color:tab===item?'var(--blue)':'var(--muted)',fontSize:14,fontWeight:tab===item?600:400,cursor:'pointer',borderBottom:tab===item?'2px solid var(--blue)':'2px solid transparent',marginBottom:-1,transition:'color .18s ease'}}>{item}</button>)}</div>
    </div>
    {tab==='任务计划'&&<TaskPlanTab leadName={leadName}/>}
    {tab==='跟进记录'&&<FollowTab leadName={leadName}/>}
    {tab==='线索资料'&&<InfoTab leadName={leadName} owner={owner}/>}
    {tab==='团队成员'&&<TeamTab/>}
    {tab==='审批记录'&&<ApprovalTab/>}
    {tab==='操作日志'&&<LogTab/>}
  </main>
}

const detailCard:React.CSSProperties={background:'var(--paper)',border:'1px solid var(--line)',borderRadius:10,boxShadow:'0 6px 18px rgba(35,65,95,.05)'}
const chip:React.CSSProperties={height:34,display:'inline-flex',alignItems:'center',gap:6,padding:'0 12px',border:'1px solid var(--line)',borderRadius:7,background:'var(--paper)',color:'var(--muted)',fontSize:12}

function TaskPlanTab({leadName}:{leadName:string}){
  const weeks=['一','二','三','四','五','六','日']
  const cells=[...Array(1).fill(null),...Array.from({length:30},(_,i)=>i+1)]
  return <div style={{...detailCard,padding:20}}>
    <div style={{display:'flex',gap:10,marginBottom:18,flexWrap:'wrap',alignItems:'center'}}>
      <span style={chip}>我创建的 <span style={{color:'var(--muted)'}}>+2</span> <ChevronDown size={12}/></span>
      <span style={chip}>进行中 <span style={{color:'var(--muted)'}}>+1</span> <ChevronDown size={12}/></span>
      <label style={{...chip,width:210}}><Search size={13}/><input placeholder="���输入任务名称" style={{border:0,outline:0,background:'transparent',flex:1,fontSize:12,color:'var(--ink)'}}/></label>
      <label style={{display:'inline-flex',alignItems:'center',gap:6,color:'var(--muted)'}}><input type="checkbox"/> 未分配</label>
      <span style={{...chip,width:32,justifyContent:'center',padding:0}}><Filter size={14}/></span>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:20}}>
      <div style={{border:'1px solid var(--line)',borderRadius:8,minHeight:280,display:'grid',placeItems:'center'}}>
        <button style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,background:'transparent',color:'var(--blue)'}}><ClipboardList size={40} style={{opacity:.5}}/><b style={{fontSize:12}}>+建任务</b></button>
      </div>
      <div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}><button style={{background:'transparent',color:'var(--blue)'}}><ChevronLeft size={16}/></button><b style={{fontSize:13}}>2026年9月</b><button style={{background:'transparent',color:'var(--blue)'}}><ChevronRight size={16}/></button></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'6px 0',textAlign:'center'}}>
          {weeks.map(w=><div key={w} style={{color:'var(--muted)',padding:'6px 0'}}>{w}</div>)}
          {cells.map((day,index)=>day===null?<div key={`empty-${index}`}/>:<div key={day} style={{padding:'9px 0'}}><span style={{display:'inline-grid',placeItems:'center',width:30,height:30,borderRadius:'50%',background:day===23?'var(--blue)':'transparent',color:day===23?'#fff':'var(--ink)'}}>{String(day).padStart(2,'0')}</span></div>)}
        </div>
        <div style={{marginTop:14,paddingTop:14,borderTop:'1px solid var(--line)',display:'flex',alignItems:'center',justifyContent:'space-between',color:'var(--muted)'}}>
          <span>9月23日　暂无待办事项</span>
          <span style={{display:'flex',gap:12}}><span style={{display:'inline-flex',alignItems:'center',gap:4}}><i style={{width:7,height:7,borderRadius:'50%',background:'var(--blue)',display:'inline-block'}}/>有任务</span><span style={{display:'inline-flex',alignItems:'center',gap:4}}><i style={{width:7,height:7,borderRadius:'50%',background:'var(--coral)',display:'inline-block'}}/>任务到期</span></span>
        </div>
      </div>
    </div>
  </div>
}

function FollowTab({leadName}:{leadName:string}){
  const records=[
    {date:'2024-08-29',name:'刘锋华',tag:'任务',title:'拜访田总咨询此线索进展',time:'2024-08-29 20:13',text:'品牌与客户关系：电话与田总交流，暂时不需要关注。'},
    {date:'2024-08-13',name:'刘锋华',tag:'',title:'',time:'2024-08-13 15:04',text:'品牌与客户关系：暂无进展'},
    {date:'2024-07-24',name:'刘锋华',tag:'任务',title:'咨询项目调研进展',time:'2024-07-24 09:35',text:'品牌与客户关系：田总反馈，烽火无更进。我们暂时也不用管。'},
    {date:'2024-07-12',name:'刘锋华',tag:'',title:'',time:'2024-07-12 18:19',text:'品牌与客户关系：徐亮总反馈，目前烽火也无进展。'},
  ]
  return <div style={{...detailCard,padding:20}}>
    <div style={{display:'flex',gap:10,marginBottom:20,alignItems:'center'}}>
      <span style={{...chip,width:120}}>全部 <ChevronDown size={12} style={{marginLeft:'auto'}}/></span>
      <span style={{...chip,width:160}}>跟进人员 <ChevronDown size={12} style={{marginLeft:'auto'}}/></span>
      <label style={{...chip,width:210}}><Search size={13}/><input placeholder="请输入任务名称" style={{border:0,outline:0,background:'transparent',flex:1,fontSize:12,color:'var(--ink)'}}/></label>
      <button style={{marginLeft:'auto',height:32,padding:'0 16px',borderRadius:6,background:'var(--blue)',color:'#fff',fontSize:12}}>写跟进</button>
    </div>
    {records.map((rec,index)=><div key={index} style={{marginBottom:24}}>
      <b style={{fontSize:14}}>{rec.date}</b>
      <div style={{display:'flex',gap:12,marginTop:12}}>
        <span style={{width:36,height:36,borderRadius:'50%',background:'var(--canvas)',display:'grid',placeItems:'center',color:'var(--muted)',flexShrink:0}}><UserRound size={18}/></span>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',color:'var(--muted)'}}>
            <span style={{color:'var(--ink)',fontWeight:600}}>{rec.name}</span>
            {rec.tag&&<span style={{background:'#eef2fb',color:'var(--blue)',borderRadius:4,padding:'2px 6px',fontSize:11}}>{rec.tag}</span>}
            {rec.title&&<span>{rec.title}</span>}
            <span style={{background:'#eef2fb',color:'var(--blue)',borderRadius:4,padding:'2px 6px',fontSize:11}}>来源</span>
            <span>{leadName}</span>
            <span style={{color:'var(--muted)'}}>{rec.time}</span>
          </div>
          <div style={{marginTop:10,background:'var(--canvas)',borderRadius:6,padding:'12px 14px',color:'var(--ink)'}}>{rec.text}</div>
        </div>
      </div>
    </div>)}
  </div>
}

function InfoField({label,value}:{label:string;value:string}){
  return <div><div style={{color:'var(--muted)',marginBottom:6}}>{label}</div><div style={{color:'var(--ink)'}}>{value}</div></div>
}
function InfoSection({title,children}:{title:string;children:React.ReactNode}){
  return <div style={{marginBottom:28}}>
    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:18}}><span style={{width:3,height:14,background:'var(--blue)',borderRadius:2}}/><b style={{fontSize:14}}>{title}</b></div>
    {children}
  </div>
}
function InfoTab({leadName,owner}:{leadName:string;owner:string}){
  const grid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'22px 40px'}
  return <div style={{...detailCard,padding:24}}>
    <InfoSection title="基本信息">
      <div style={grid}>
        <InfoField label="线索名" value={leadName}/><InfoField label="线索类型" value="主动营销"/><InfoField label="负责人" value={owner}/>
        <InfoField label="负责人部门" value="两江"/><div/><div/>
        <InfoField label="线索详情" value="纳管mud、olt。"/><div/><div/>
        <InfoField label="附件" value="--"/>
      </div>
    </InfoSection>
    <div style={{borderTop:'1px solid var(--line)',marginBottom:28}}/>
    <InfoSection title="客户信息">
      <div style={grid}>
        <InfoField label="客户名" value="安徽电信"/><InfoField label="重要联系人" value="田映"/><InfoField label="联系人职务" value="--"/>
        <InfoField label="联系电话" value="--"/><InfoField label="电子邮件" value="tianyu01.ah@chinatelecom.cn"/><InfoField label="社交账号" value="--"/>
        <InfoField label="行业" value="--"/><InfoField label="所在地区" value="--"/><div/>
        <InfoField label="备注" value="--"/>
      </div>
    </InfoSection>
    <div style={{borderTop:'1px solid var(--line)',marginBottom:28}}/>
    <InfoSection title="产品信息">
      <div style={{border:'1px solid var(--line)',borderRadius:8,padding:16,marginBottom:14}}>
        <div style={grid}><InfoField label="产品/服务名称" value="IPOSS（IP综合网管系统）"/><InfoField label="订购类型" value="新购"/><InfoField label="数量" value="1"/></div>
        <div style={{marginTop:16}}><InfoField label="备注" value="--"/></div>
      </div>
      <div style={{border:'1px solid var(--line)',borderRadius:8,padding:16}}>
        <div style={grid}><InfoField label="产品/服务名称" value="--"/><InfoField label="订购类型" value="新购"/><InfoField label="数量" value="1"/></div>
        <div style={{marginTop:16}}><InfoField label="备注" value="--"/></div>
      </div>
    </InfoSection>
    <div style={{borderTop:'1px solid var(--line)',marginBottom:28}}/>
    <InfoSection title="客户联系人"><div style={{color:'var(--muted)'}}>暂无数据</div></InfoSection>
  </div>
}

function TeamTab(){
  const members=[['姚其文','两江','运维',''],['刘锋华','南方销售中心','销售','团队成员']]
  return <div style={{...detailCard,padding:20}}>
    <div style={{display:'flex',gap:10,marginBottom:18}}>
      <span style={{...chip,width:300}}>职务 <ChevronDown size={12} style={{marginLeft:'auto'}}/></span>
      <label style={{...chip,width:300}}><input placeholder="请输入人员姓名" style={{border:0,outline:0,background:'transparent',flex:1,fontSize:12,color:'var(--ink)'}}/></label>
    </div>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
      <thead><tr style={{borderBottom:'1px solid var(--line)'}}>{['姓名','部门','职务','角色','操作'].map(label=><th key={label} style={{padding:'12px 8px',textAlign:'left',color:'var(--muted)',fontWeight:600}}>{label}</th>)}</tr></thead>
      <tbody>{members.map((member,index)=><tr key={index} style={{borderBottom:'1px solid #edf1f5'}}>{member.map((cell,cellIndex)=><td key={cellIndex} style={{padding:'14px 8px',color:'var(--ink)'}}>{cell||''}</td>)}<td style={{padding:'14px 8px'}}/></tr>)}</tbody>
    </table>
  </div>
}

function ApprovalTab(){
  return <div style={{...detailCard,padding:20}}>
    <div style={{border:'1px solid var(--line)',borderRadius:8,padding:20,display:'flex',justifyContent:'space-between'}}>
      <div>
        <b style={{fontSize:14}}>安徽电信网管</b>
        <div style={{marginTop:14,display:'flex',flexDirection:'column',gap:8,color:'var(--muted)'}}>
          <span>申请类型　<span style={{color:'var(--ink)'}}>新线索申请</span></span>
          <span>申请人　<span style={{color:'var(--ink)'}}>姚其文</span></span>
          <span>申请时间　<span style={{color:'var(--ink)'}}>2024-01-03 16:46:00</span></span>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',justifyContent:'space-between'}}>
        <span style={{background:'#e6f7ec',color:'#27ab56',borderRadius:4,padding:'3px 8px',fontSize:11,fontWeight:600}}>审批通过</span>
        <a style={{color:'var(--blue)',cursor:'pointer'}}>审批详情</a>
      </div>
    </div>
  </div>
}

function LogTab(){
  return <div style={{...detailCard,padding:20}}>
    <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginBottom:16}}>
      <span style={{...chip,width:32,justifyContent:'center',padding:0}}><Filter size={14}/></span>
      <span style={chip}><Maximize2 size={13}/> 专注</span>
      <span style={{...chip,width:32,justifyContent:'center',padding:0}}><Settings size={14}/></span>
      <span style={{...chip,width:32,justifyContent:'center',padding:0}}><RefreshCw size={14}/></span>
    </div>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
      <thead><tr style={{background:'var(--canvas)'}}>{['日志时间','姓名','操作分类'].map(label=><th key={label} style={{padding:'12px',textAlign:'left',color:'var(--muted)',fontWeight:600}}>{label} <ChevronDown size={11} style={{display:'inline'}}/></th>)}</tr></thead>
      <tbody><tr><td colSpan={3} style={{padding:'48px',textAlign:'center',color:'var(--muted)'}}>暂无数据</td></tr></tbody>
    </table>
    <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:10,paddingTop:14,color:'var(--muted)'}}>
      <span>共 0 条</span><span style={chip}>10条/页 <ChevronDown size={12}/></span><button style={{...chip,width:32,justifyContent:'center',padding:0}} disabled><ChevronLeft size={14}/></button><b style={{width:28,height:28,display:'grid',placeItems:'center',borderRadius:6,background:'var(--blue)',color:'#fff'}}>1</b><button style={{...chip,width:32,justifyContent:'center',padding:0}}><ChevronRight size={14}/></button>
    </div>
  </div>
}

// 通用列表页模板
function ListPage({title, data, columns, tabs}: {title: string; data: any[]; columns: {key: string; label: string}[]; tabs?: string[]}) {
  const [activeTab, setActiveTab] = useState(tabs?.[0] || '')
  const [search, setSearch] = useState('')
  const filteredData = data.filter(row => search === '' || Object.values(row).some(v => String(v).includes(search)))
  
  return <main className="list-page" style={{minHeight: 'calc(100vh - 120px)', background: 'var(--canvas)', padding: '20px 28px'}}>
    <div className="list-header" style={{marginBottom: '16px'}}>
      <h2 style={{fontSize: 18, margin: '0 0 12px'}}>{title}</h2>
      {tabs && tabs.length > 0 && <div style={{display: 'flex', gap: 8, borderBottom: '1px solid var(--line)', paddingBottom: 8}}>
        {tabs.map(tab => <button key={tab} onClick={() => setActiveTab(tab)} style={{padding: '6px 12px', borderBottom: activeTab === tab ? '2px solid var(--blue)' : 'none', color: activeTab === tab ? 'var(--blue)' : 'var(--muted)', background: 'transparent', cursor: 'pointer', fontSize: 13}}>{tab}</button>)}
      </div>}
    </div>
    
    <div className="list-toolbar" style={{display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center'}}>
      <input type="text" placeholder="搜索..." value={search} onChange={e => setSearch(e.target.value)} style={{flex: 1, height: 34, border: '1px solid var(--line)', borderRadius: 6, padding: '0 11px', fontSize: 12}}/>
      <button style={{height: 34, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--paper)', cursor: 'pointer', fontSize: 12}}>筛选</button>
      <button style={{height: 34, padding: '0 12px', border: '1px solid var(--line)', borderRadius: 6, background: 'var(--paper)', cursor: 'pointer', fontSize: 12}}><Plus size={14}/> 新建</button>
    </div>
    
    <div className="list-table-wrap" style={{background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 8, overflow: 'auto'}}>
      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: 12}}>
        <thead>
          <tr style={{background: 'var(--canvas)', borderBottom: '1px solid var(--line)'}}>
            {columns.map(col => <th key={col.key} style={{padding: 12, textAlign: 'left', color: 'var(--muted)', fontWeight: 600, whiteSpace: 'nowrap'}}>{col.label}</th>)}
            <th style={{padding: 12, textAlign: 'left', color: 'var(--muted)', fontWeight: 600}}>操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, i) => <tr key={i} style={{borderTop: '1px solid #edf1f5', background: i % 2 === 1 ? 'var(--canvas)' : 'var(--paper)'}}>
            {columns.map(col => <td key={col.key} style={{padding: 12, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{String(row[col.key] || '--')}</td>)}
            <td style={{padding: 12, fontSize: 11}}><a style={{color: 'var(--blue)', cursor: 'pointer', marginRight: 12}}>详情</a><a style={{color: 'var(--blue)', cursor: 'pointer'}}>编辑</a></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  </main>
}

function CustomerPage(){
  const [tab, setTab] = useState('全部客户')
  const [keyword, setKeyword] = useState('')
  const tabMap: Record<string, string> = {'全部客户':'1','我负责的':'2','我创建的':'3','待分配':'4','公共客户':'5','团队客户':'6'}
  const {data,error,isLoading} = useSWR(['customers', tab, keyword], () => getCustomerList({current:1,size:20,cust:tabMap[tab],keyword}))
  const rows = data?.records || []
  const value = (row:any, keys:string[]) => keys.reduce((current,key) => current?.[key], row)
  return <main className="list-page" style={{minHeight:'calc(100vh - 120px)',background:'var(--canvas)',padding:'20px 28px'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}><h2 style={{fontSize:18,margin:0}}>全部客户</h2><span style={{fontSize:12,color:'var(--muted)'}}>共 {data?.total || 0} 条</span></div>
    <div style={{display:'flex',gap:8,borderBottom:'1px solid var(--line)',marginBottom:12}}>{Object.keys(tabMap).map(item => <button key={item} onClick={() => setTab(item)} style={{padding:'9px 14px',border:0,borderBottom:tab===item?'2px solid var(--blue)':'2px solid transparent',background:'transparent',color:tab===item?'var(--blue)':'var(--muted)',fontSize:12,cursor:'pointer'}}>{item}</button>)}</div>
    <div style={{display:'flex',gap:8,marginBottom:12}}><input value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="客户名称" style={{height:34,width:190,border:'1px solid var(--line)',borderRadius:6,padding:'0 10px',background:'var(--paper)',color:'var(--ink)',fontSize:12}}/><button style={{height:34,padding:'0 14px',border:0,borderRadius:6,background:'var(--blue)',color:'#fff',fontSize:12}}>新建客户</button><button style={{height:34,padding:'0 14px',border:'1px solid var(--line)',borderRadius:6,background:'var(--paper)',color:'var(--muted)',fontSize:12}}>更多操作</button></div>
    <div style={{background:'var(--paper)',border:'1px solid var(--line)',borderRadius:8,overflow:'auto'}}>{isLoading?<div style={{padding:32,color:'var(--muted)'}}>正在加载客户数据...</div>:error?<div style={{padding:32,color:'#c44949'}}>接口加载失败：{error.message}</div>:<table style={{width:'100%',minWidth:1250,borderCollapse:'collapse',fontSize:12}}><thead><tr style={{background:'var(--canvas)'}}>{['客户名称','客户负责人','����人员','最新跟进','最新跟进时间','客户状态','自定义标签','操作'].map(label=><th key={label} style={{height:42,padding:'0 12px',textAlign:'left',color:'var(--muted)',fontWeight:600,whiteSpace:'nowrap'}}>{label}</th>)}</tr></thead><tbody>{rows.map((row:any,index:number)=><tr key={row.id||row.custId||index} style={{borderTop:'1px solid #edf1f5'}}><td style={{padding:12,color:'var(--ink)'}}>{row.customerName||row.custName||row.name||'--'}</td><td style={{padding:12}}>{row.chargePersonName||row.ownerName||row.chargePerson||'--'}</td><td style={{padding:12}}>{row.followUserName||row.followPersonName||'--'}</td><td style={{padding:12,maxWidth:420,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.latestFollow||row.followContent||'--'}</td><td style={{padding:12,whiteSpace:'nowrap'}}>{row.latestFollowTime||row.followTime||row.updateTime||'--'}</td><td style={{padding:12}}><span className={String(row.customerStatus||row.statusName||'').includes('跟进')?'lead-assigned':'lead-approved'}>{row.customerStatus||row.statusName||'--'}</span></td><td style={{padding:12,color:'var(--muted)'}}>{row.customTagName||row.customTags||'--'}</td><td style={{padding:12,whiteSpace:'nowrap'}}><a style={{color:'var(--blue)',cursor:'pointer'}}>详情</a><span style={{color:'var(--muted)',margin:'0 6px'}}>+</span><a style={{color:'var(--blue)',cursor:'pointer'}}>添加标签</a></td></tr>)}</tbody></table>}</div>
  </main>
}

function ApiListPage({title, load, columns, tabs}:{title:string;load:()=>Promise<{records:any[];total:number}>;columns:{key:string;label:string}[];tabs?:string[]}){
  const {data,error,isLoading}=useSWR(`${title}`,load)
  const rows=data?.records || []
  return <main className="list-page" style={{minHeight:'calc(100vh - 120px)',background:'var(--canvas)',padding:'20px 28px'}}><div className="list-header" style={{marginBottom:16}}><h2 style={{fontSize:18,margin:'0 0 12px'}}>{title}</h2>{tabs&&<div style={{display:'flex',gap:8,borderBottom:'1px solid var(--line)',paddingBottom:8}}>{tabs.map(tab=><button key={tab} style={{padding:'6px 12px',color:'var(--blue)',background:'transparent',fontSize:13}}>{tab}</button>)}</div>}</div><div className="list-toolbar" style={{display:'flex',gap:8,marginBottom:16}}><button style={{height:34,padding:'0 12px',border:'1px solid var(--line)',borderRadius:6,background:'var(--paper)',fontSize:12}}><Search size={14}/> 筛选</button><button style={{height:34,padding:'0 12px',border:0,borderRadius:6,background:'var(--blue)',color:'#fff',fontSize:12}}><Plus size={14}/> 新建</button></div><div className="list-table-wrap" style={{background:'var(--paper)',border:'1px solid var(--line)',borderRadius:8,overflow:'auto'}}>{isLoading?<div style={{padding:32,color:'var(--muted)'}}>正在加载数据...</div>:error?<div style={{padding:32,color:'#c44949'}}>接口加载失败：{error.message}</div>:<table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}><thead><tr style={{background:'var(--canvas)'}}>{columns.map(col=><th key={col.key} style={{padding:12,textAlign:'left',color:'var(--muted)',fontWeight:600}}>{col.label}</th>)}<th style={{padding:12,textAlign:'left',color:'var(--muted)'}}>�����作</th></tr></thead><tbody>{rows.map((row,index)=><tr key={row.id||row.number||index} style={{borderTop:'1px solid #edf1f5'}}>{columns.map(col=><td key={col.key} style={{padding:12,color:'var(--ink)',whiteSpace:'nowrap'}}>{String(col.key.split('.').reduce((v,k)=>v?.[k],row) ?? '--')}</td>)}<td style={{padding:12}}><a style={{color:'var(--blue)'}}>详情</a></td></tr>)}</tbody></table>}</div><div style={{paddingTop:12,color:'var(--muted)',fontSize:12}}>共 {data?.total||0} 条</div></main>
}

function General(){
  const shortcuts=['建任务','写日报','写跟进','我��任务','我的申请','我的审批']
  return <><section className="shortcut-grid">{shortcuts.map((x,i)=><button className="shortcut" key={x}><span>{i%2?<FileText size={18}/>:<Plus size={18}/>}</span><b>{x}</b></button>)}</section><section className="task-counts">{['已逾期','今明到期','待处理','进行中','已处理','任务总数'].map((x,i)=><div key={x}><strong>{['08','12','24','36','128','208'][i]}</strong><span>{x}</span></div>)}</section><Panels/></>
}

export default function Page(){
  const [view, setView] = useState<View>('负责人视图')
  const [page, setPage] = useState('首页')
  const isOwnerView = view === '负责人视图' || !['销售视图','VP视图','通用视图'].includes(view)
  
  // 根据页面名称渲染对应模块
  const pageComponentMap: {[key: string]: React.ReactNode} = {
    '我的线索': <Leads />,
    '市场活动': <Campaigns />,
    '标签管理': <TagManage />,
    '我的客户': <CustomerPage />,
    '我的商机': <ApiListPage title="我的商机" load={() => getOpportunityList({current:1,size:20,lead:'1'})} columns={[{key:'optName',label:'商机名称'},{key:'custInfo.customerName',label:'客户'},{key:'chargePerson',label:'负责人'},{key:'projectEffAmount',label:'预计签单金额'},{key:'currentPhaseName',label:'商机阶段'},{key:'optStateName',label:'商机状态'}]} />,
'我的投标文件': <ApiListPage title="我的投标文件" load={() => getTenderList({current:1,size:20})} columns={[{key:'tenderName',label:'投标文件名称'},{key:'opportunity.optName',label:'商机'},{key:'tenderWayName',label:'投标方式'},{key:'tenderTypeName',label:'投标类型'},{key:'approveStateName',label:'审批状态'}]} />,
    '我的报价单': <ApiListPage title="我的报价单" load={() => getQuotationList({current:1,size:20})} columns={[{key:'quotName',label:'报价单名称'},{key:'custName',label:'客户'},{key:'opportName',label:'商机'},{key:'totalPrice',label:'报价总额'},{key:'statusName',label:'状态'}]} />,
    '我的合同': <ApiListPage title="我的合同" load={() => getContractList({current:1,size:20})} columns={[{key:'number',label:'合同编号'},{key:'name',label:'合同名称'},{key:'secondPartyName',label:'客户'},{key:'approveStateName',label:'审批状态'},{key:'statusName',label:'执行状态'}]} />,
    '回款': <ApiListPage title="回款管理" load={() => getCollectionList({current:1,size:20})} columns={[{key:'projectName',label:'项目名称'},{key:'milestoneName',label:'里程碑'},{key:'processName',label:'回款阶段'},{key:'chargerName',label:'回款负责人'},{key:'statusName',label:'状态'}]} />,
    '财务数据': <ApiListPage title="财务数据" load={() => getFinanceDetailList({current:1,size:20,financeType:'10'})} columns={[{key:'financeObjTypeName',label:'数据计入类型'},{key:'name',label:'名称'},{key:'financeTypeName',label:'财务指标类型'},{key:'regDate',label:'计入日期'},{key:'amount',label:'金额'}]} />,
    '我的申请': <ApiListPage title="我的申请" load={() => getApplyList({current:1,size:20,apply:2})} columns={[{key:'objBusiId',label:'申请类型'},{key:'name',label:'审批节点'},{key:'assigneeName',label:'审批人'},{key:'createTime',label:'申请时间'}]} />,
    '我的审批': <ApiListPage title="我的审批" load={() => getApproveList({current:1,size:20,apply:1})} columns={[{key:'objBusiId',label:'业务类型'},{key:'name',label:'审批节点'},{key:'createTime',label:'申请时间'}]} />,
    '我的任务': <ApiListPage title="我的任务" load={() => getTaskPlanList({current:1,size:20})} columns={[{key:'taskName',label:'任务简述'},{key:'taskTypeName',label:'任务方式'},{key:'taskTime',label:'截止时间'},{key:'statusName',label:'任务状态'},{key:'taskUserName',label:'执行人'}]} />,
    '我的提醒': <ApiListPage title="我的提醒" load={() => getNoticeList({current:1,size:20})} columns={[{key:'createTime',label:'提醒时间'},{key:'recordStateName',label:'消息状态'},{key:'simpleContent',label:'通知内容'}]} />,
  }

  return <main className="workspace">
    <Header view={view} setView={setView} onNavigate={(next) => {setPage(next); if(next === '首页') setView('负责人视图')}} />
    {page === '首页' ? (
      <div className="workspace-shell">
        <SharedTop view={view} setView={setView} />
        {isOwnerView && <Owner />}
        {view === '销售视图' && <Sales />}
        {view === 'VP视图' && <VP />}
        {view === '通用视图' && <General />}
      </div>
    ) : (
      pageComponentMap[page] || <ListPage title={page} data={[]} columns={[]} />
    )}
  </main>
}
