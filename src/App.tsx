import React, { useState, useEffect, useCallback } from 'react';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  ChevronRight,
  X,
  CalendarDays,
} from 'lucide-react';

interface DailyLog {
  id: string;
  date: string;
  content: string;
}

interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

interface Objective {
  id: string;
  title: string;
  description: string;
  category: 'content' | 'market' | 'outreach' | 'growth';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  status: 'on_track' | 'at_risk' | 'delayed' | 'completed';
  milestones: Milestone[];
  dailyLogs: DailyLog[];
  createdAt: string;
  updatedAt: string;
}

const INITIAL_OBJECTIVES: Objective[] = [
  {
    id: '1',
    title: 'Q2 产品宣传素材产出',
    description: '完成主力产品的海外宣传图文、视频脚本及多语言文案',
    category: 'content',
    targetValue: 20,
    currentValue: 8,
    unit: '篇',
    deadline: '2026-06-30',
    status: 'on_track',
    milestones: [
      { id: 'm1', title: '确定产品卖点清单', completed: true, dueDate: '2026-04-01' },
      { id: 'm2', title: '完成首批5篇图文', completed: true, dueDate: '2026-04-10' },
    ],
    dailyLogs: [],
    createdAt: '2026-03-01',
    updatedAt: '2026-04-08',
  }
];

const CATEGORIES = {
  content:  { label: '内容创作', color: 'bg-blue-500',    lightColor: 'bg-blue-50',    textColor: 'text-blue-700'    },
  market:   { label: '市场拓展', color: 'bg-purple-500',  lightColor: 'bg-purple-50',  textColor: 'text-purple-700'  },
  outreach: { label: '客户触达', color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-700' },
  growth:   { label: '转化增长', color: 'bg-amber-500',   lightColor: 'bg-amber-50',   textColor: 'text-amber-700'   },
};

const STATUS_CONFIG = {
  on_track:  { label: '正常推进', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  at_risk:   { label: '存在风险', color: 'bg-amber-100 text-amber-800 border-amber-200',       icon: AlertCircle  },
  delayed:   { label: '已延期',   color: 'bg-rose-100 text-rose-800 border-rose-200',          icon: Clock        },
  completed: { label: '已完成',   color: 'bg-slate-100 text-slate-800 border-slate-200',       icon: CheckCircle2 },
};

function loadData(): Objective[] {
  try {
    const saved = localStorage.getItem('okr-objectives');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((o: Objective) => ({ ...o, dailyLogs: o.dailyLogs || [] }));
    }
    return INITIAL_OBJECTIVES;
  } catch {
    return INITIAL_OBJECTIVES;
  }
}

function saveData(data: Objective[]) {
  try {
    localStorage.setItem('okr-objectives', JSON.stringify(data));
  } catch {
    // ignore
  }
}

export default function OKRDashboard() {
  const [objectives, setObjectives] = useState<Objective[]>(loadData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedObjective = objectives.find(o => o.id === selectedId) ?? null;
  const [showAddModal, setShowAddModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    saveData(objectives);
  }, [objectives]);

  const stats = {
    total:       objectives.length,
    completed:   objectives.filter(o => o.status === 'completed').length,
    onTrack:     objectives.filter(o => o.status === 'on_track').length,
    atRisk:      objectives.filter(o => o.status === 'at_risk' || o.status === 'delayed').length,
    avgProgress: objectives.length > 0
      ? Math.round(objectives.reduce((acc, o) => acc + (o.currentValue / o.targetValue) * 100, 0) / objectives.length)
      : 0,
  };

  const handleUpdateProgress = useCallback((id: string, newValue: number) => {
    setObjectives(prev => prev.map(obj =>
      obj.id === id ? {
        ...obj,
        currentValue: Math.max(0, Math.min(obj.targetValue, newValue)),
        updatedAt: new Date().toISOString(),
        status: newValue >= obj.targetValue ? 'completed' : obj.status,
      } : obj
    ));
    setLastUpdated(new Date());
  }, []);

  const handleEditObjective = useCallback((id: string, data: Partial<Objective>) => {
    setObjectives(prev => prev.map(obj =>
      obj.id === id ? { ...obj, ...data } : obj
    ));
    setLastUpdated(new Date());
  }, []);

  const handleAddLog = useCallback((id: string, content: string) => {
    const log: DailyLog = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('zh-CN'),
      content,
    };
    setObjectives(prev => prev.map(obj =>
      obj.id === id ? {
        ...obj,
        dailyLogs: [log, ...(obj.dailyLogs || [])],
        updatedAt: new Date().toISOString(),
      } : obj
    ));
    setLastUpdated(new Date());
  }, []);

  const handleDeleteLog = useCallback((objId: string, logId: string) => {
    setObjectives(prev => prev.map(obj =>
      obj.id === objId ? {
        ...obj,
        dailyLogs: obj.dailyLogs.filter(l => l.id !== logId),
      } : obj
    ));
  }, []);

  const handleAddObjective = useCallback((newObjective: Omit<Objective, 'id' | 'milestones' | 'dailyLogs' | 'createdAt' | 'updatedAt'>) => {
    const objective: Objective = {
      ...newObjective,
      id: Date.now().toString(),
      milestones: [],
      dailyLogs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setObjectives(prev => [...prev, objective]);
    setShowAddModal(false);
    setLastUpdated(new Date());
  }, []);

  const handleDeleteObjective = useCallback((id: string) => {
    if (window.confirm('确定要删除这个目标吗？')) {
      setObjectives(prev => prev.filter(o => o.id !== id));
      setSelectedId(prev => prev === id ? null : prev);
      setLastUpdated(new Date());
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-lg shadow-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-900 to-slate-800 bg-clip-text text-transparent">
                工作目标追踪
              </h1>
              <p className="text-xs text-slate-500">实时更新 • 个人管理系统</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">最后更新</p>
              <p className="text-sm font-medium text-slate-700">{lastUpdated.toLocaleTimeString()}</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>新建目标</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="总目标数"  value={stats.total}            icon={Target}       color="indigo"  />
          <StatCard title="已完成"    value={stats.completed}         icon={CheckCircle2} color="emerald" />
          <StatCard title="需关注"    value={stats.atRisk}            icon={AlertCircle}  color="amber"   />
          <StatCard title="平均进度"  value={`${stats.avgProgress}%`} icon={TrendingUp}   color="blue"    />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              目标概览
            </h2>
            <div className="space-y-4">
              {objectives.map(objective => (
                <ObjectiveCard
                  key={objective.id}
                  objective={objective}
                  isSelected={objective.id === selectedId}
                  onClick={() => setSelectedId(prev => prev === objective.id ? null : objective.id)}
                  onUpdateProgress={handleUpdateProgress}
                />
              ))}
              {objectives.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                  <p className="text-slate-400">暂无目标，点击右上角新建一个吧</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {selectedObjective ? (
                <DetailPanel
                  objective={selectedObjective}
                  onClose={() => setSelectedId(null)}
                  onUpdate={handleUpdateProgress}
                  onDelete={handleDeleteObjective}
                  onEdit={handleEditObjective}
                  onAddLog={handleAddLog}
                  onDeleteLog={handleDeleteLog}
                />
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">选择目标查看详情</h3>
                  <p className="text-slate-500 text-sm">点击左侧卡片查看并编辑目标</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showAddModal && (
        <AddObjectiveModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddObjective}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    indigo:  'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    blue:    'bg-blue-50 text-blue-600 border-blue-100',
  };
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500">{title}</div>
    </div>
  );
}

function ObjectiveCard({ objective, isSelected, onClick, onUpdateProgress }: {
  objective: Objective;
  isSelected: boolean;
  onClick: () => void;
  onUpdateProgress: (id: string, val: number) => void;
}) {
  const progress = objective.targetValue > 0 ? (objective.currentValue / objective.targetValue) * 100 : 0;
  const category = CATEGORIES[objective.category];
  const status = STATUS_CONFIG[objective.status];

  const handleMinus = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onUpdateProgress(objective.id, objective.currentValue - 1);
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onUpdateProgress(objective.id, objective.currentValue + 1);
  };

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ${
        isSelected ? 'border-indigo-400 ring-1 ring-indigo-300' : 'border-slate-200'
      }`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-3">
            <div className={`w-1 h-10 rounded-full ${category.color}`} />
            <div>
              <h3 className="font-bold text-slate-900 mb-1">{objective.title}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${status.color} flex items-center gap-1 w-fit`}>
                  <status.icon className="w-3 h-3" />{status.label}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${category.lightColor} ${category.textColor}`}>
                  {category.label}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-500">进度: {objective.currentValue} / {objective.targetValue}{objective.unit}</span>
            <span className="font-bold text-indigo-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${category.color}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
      <div className="bg-slate-50 px-5 py-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">截止 {objective.deadline}</span>
        <div className="flex gap-2">
          <button onClick={handleMinus} className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded hover:bg-indigo-50 text-slate-600 font-bold">-</button>
          <button onClick={handlePlus}  className="w-7 h-7 flex items-center justify-center bg-white border border-slate-200 rounded hover:bg-indigo-50 text-slate-600 font-bold">+</button>
        </div>
      </div>
    </div>
  );
}

function DetailPanel({ objective, onClose, onUpdate, onDelete, onEdit, onAddLog, onDeleteLog }: {
  objective: Objective;
  onClose: () => void;
  onUpdate: (id: string, val: number) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, data: Partial<Objective>) => void;
  onAddLog: (id: string, content: string) => void;
  onDeleteLog: (objId: string, logId: string) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [tempValue, setTempValue] = useState(objective.currentValue);
  const [logInput, setLogInput] = useState('');
  const [editData, setEditData] = useState({
    title: objective.title,
    description: objective.description,
    category: objective.category,
    deadline: objective.deadline,
    status: objective.status,
    targetValue: objective.targetValue,
    unit: objective.unit,
  });

  useEffect(() => {
    setTempValue(objective.currentValue);
    setEditData({
      title: objective.title,
      description: objective.description,
      category: objective.category,
      deadline: objective.deadline,
      status: objective.status,
      targetValue: objective.targetValue,
      unit: objective.unit,
    });
  }, [objective]);

  const setField = <K extends keyof typeof editData>(key: K, value: typeof editData[K]) =>
    setEditData(prev => ({ ...prev, [key]: value }));

  const category = CATEGORIES[objective.category];
  const progress = Math.min(100, Math.round((objective.currentValue / objective.targetValue) * 100));

  const handleSubmitLog = () => {
    if (!logInput.trim()) return;
    onAddLog(objective.id, logInput.trim());
    setLogInput('');
  };

  if (editMode) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className={`h-1.5 ${CATEGORIES[editData.category].color}`} />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-700">编辑目标</span>
            <button onClick={() => setEditMode(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">目标名称</label>
              <input className="w-full border p-2 rounded text-sm" value={editData.title} onChange={e => setField('title', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">具体描述</label>
              <textarea className="w-full border p-2 rounded text-sm" rows={3} value={editData.description} onChange={e => setField('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">目标值</label>
                <input type="number" className="w-full border p-2 rounded text-sm" value={editData.targetValue} onChange={e => setField('targetValue', Number(e.target.value))} />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">单位</label>
                <input className="w-full border p-2 rounded text-sm" value={editData.unit} onChange={e => setField('unit', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">分类</label>
              <select className="w-full border p-2 rounded text-sm" value={editData.category} onChange={e => setField('category', e.target.value as Objective['category'])}>
                <option value="content">内容创作</option>
                <option value="market">市场拓展</option>
                <option value="outreach">客户触达</option>
                <option value="growth">转化增长</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">状态</label>
              <select className="w-full border p-2 rounded text-sm" value={editData.status} onChange={e => setField('status', e.target.value as Objective['status'])}>
                <option value="on_track">正常推进</option>
                <option value="at_risk">存在风险</option>
                <option value="delayed">已延期</option>
                <option value="completed">已完成</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">截止日期</label>
              <input type="date" className="w-full border p-2 rounded text-sm" value={editData.deadline} onChange={e => setField('deadline', e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditMode(false)} className="flex-1 py-2 border rounded text-sm hover:bg-slate-50">取消</button>
              <button
                onClick={() => { onEdit(objective.id, { ...editData, updatedAt: new Date().toISOString() }); setEditMode(false); }}
                disabled={!editData.title.trim()}
                className="flex-1 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-40"
              >保存修改</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden max-h-[85vh] overflow-y-auto">
      <div className={`h-1.5 ${category.color}`} />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <span className={`text-xs font-bold px-2 py-1 rounded ${category.lightColor} ${category.textColor}`}>
            {category.label}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditMode(true)} className="text-slate-400 hover:text-slate-600">
              <Edit3 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-900 mb-2">{objective.title}</h2>
        <p className="text-slate-500 text-sm mb-4">{objective.description}</p>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>完成进度</span>
            <span className="font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${category.color} transition-all duration-500`} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">数值更新</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tempValue}
                min={0}
                max={objective.targetValue}
                onChange={e => setTempValue(Number(e.target.value))}
                className="w-16 px-1 border rounded text-sm text-center"
              />
              <button onClick={() => onUpdate(objective.id, tempValue)} className="text-xs px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                保存
              </button>
            </div>
          </div>
          <div className="text-xl font-bold text-indigo-600">
            {objective.currentValue} / {objective.targetValue} {objective.unit}
          </div>
        </div>

        <div className="text-xs text-slate-400 mb-5">
          截止日期：{objective.deadline} · 更新于 {new Date(objective.updatedAt).toLocaleDateString()}
        </div>

        {/* 每日记录板块 */}
        <div className="border-t border-slate-100 pt-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-slate-700">每日记录</span>
          </div>
          <div className="flex gap-2 mb-3">
            <textarea
              placeholder="记录今日执行情况..."
              className="flex-1 border p-2 rounded text-sm resize-none"
              rows={2}
              value={logInput}
              onChange={e => setLogInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleSubmitLog(); }}
            />
            <button
              onClick={handleSubmitLog}
              disabled={!logInput.trim()}
              className="px-3 py-2 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-40 self-end"
            >
              添加
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(objective.dailyLogs || []).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3">暂无记录</p>
            ) : (
              (objective.dailyLogs || []).map(log => (
                <div key={log.id} className="bg-slate-50 rounded-lg p-3 group">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-indigo-600">{log.date}</span>
                    <button
                      onClick={() => onDeleteLog(objective.id, log.id)}
                      className="text-slate-300 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{log.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(objective.id)}
          className="w-full py-2 flex items-center justify-center gap-2 text-rose-600 bg-rose-50 rounded-lg text-sm hover:bg-rose-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          删除目标
        </button>
      </div>
    </div>
  );
}

function AddObjectiveModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: Omit<Objective, 'id' | 'milestones' | 'dailyLogs' | 'createdAt' | 'updatedAt'>) => void;
}) {
  const [formData, setFormData] = useState({
    title:        '',
    description:  '',
    category:     'content' as Objective['category'],
    targetValue:  100,
    currentValue: 0,
    unit:         '%',
    deadline:     new Date().toISOString().split('T')[0],
    status:       'on_track' as Objective['status'],
  });

  const set = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4">新建 OKR 目标</h2>
        <div className="space-y-4">
          <input
            placeholder="目标名称 *"
            className="w-full border p-2 rounded"
            value={formData.title}
            onChange={e => set('title', e.target.value)}
          />
          <textarea
            placeholder="具体描述"
            className="w-full border p-2 rounded"
            value={formData.description}
            onChange={e => set('description', e.target.value)}
          />
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">目标值</label>
              <input type="number" className="w-full border p-2 rounded" value={formData.targetValue} onChange={e => set('targetValue', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">当前值</label>
              <input type="number" className="w-full border p-2 rounded" value={formData.currentValue} onChange={e => set('currentValue', Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">单位</label>
              <input placeholder="如 %" className="w-full border p-2 rounded" value={formData.unit} onChange={e => set('unit', e.target.value)} />
            </div>
          </div>
          <select className="w-full border p-2 rounded" value={formData.category} onChange={e => set('category', e.target.value as Objective['category'])}>
            <option value="content">内容创作</option>
            <option value="market">市场拓展</option>
            <option value="outreach">客户触达</option>
            <option value="growth">转化增长</option>
          </select>
          <select className="w-full border p-2 rounded" value={formData.status} onChange={e => set('status', e.target.value as Objective['status'])}>
            <option value="on_track">正常推进</option>
            <option value="at_risk">存在风险</option>
            <option value="delayed">已延期</option>
          </select>
          <input type="date" className="w-full border p-2 rounded" value={formData.deadline} onChange={e => set('deadline', e.target.value)} />
          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2 border rounded hover:bg-slate-50">取消</button>
            <button
              onClick={() => { if (formData.title.trim()) onAdd(formData); }}
              disabled={!formData.title.trim()}
              className="flex-1 py-2 bg-indigo-600 text-white rounded shadow-md hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              保存目标
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}