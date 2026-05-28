import React, { useCallback, useState } from 'react';
import { Copy, Download, Eye, Lock, RefreshCw, Shield, X } from 'lucide-react';
import { listTravelPlans } from '../services/cloudbaseClient.js';

function fmt(n) {
  if (n == null) return '-';
  return Number(n).toLocaleString('zh-CN');
}

function s(v) {
  if (v == null || v === '') return '-';
  return String(v);
}

function fmtDate(d) {
  if (!d) return '-';
  try {
    var date = new Date(d);
    if (isNaN(date.getTime())) return '-';
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    var h = String(date.getHours()).padStart(2, '0');
    var min = String(date.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + day + ' ' + h + ':' + min;
  } catch (e) {
    return '-';
  }
}

function entryLabel(mode) {
  var map = { quick: '速速看', full: '慢慢出', 'price-compare': '比价带入' };
  return map[mode] || mode || '-';
}

function levelLabel(lv) {
  var map = { budget: '经济型', standard: '标准型', premium: '高预算型' };
  return map[lv] || lv || '-';
}

function sourceLabel(ch) {
  var map = { xhs: '小红书', dy: '抖音', wechat: '微信', direct: '直接访问' };
  return map[ch] || ch || '-';
}

function csvEscape(val) {
  var str = val == null ? '' : String(val);
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function buildSummary(record) {
  var lines = [];
  lines.push('提交时间：' + fmtDate(record.createdAt));
  lines.push('入口模式：' + entryLabel(record.entryMode));
  lines.push('来源：' + sourceLabel(record.source?.sourceChannel));
  if (record.source?.sourceNoteId) lines.push('笔记：' + record.source.sourceNoteId);
  if (record.source?.sourceCampaign) lines.push('活动：' + record.source.sourceCampaign);
  lines.push('目的地：' + s(record.tripInfo?.destination));
  lines.push('出发城市：' + s(record.tripInfo?.departureCity));
  lines.push('人数：' + s(record.tripInfo?.peopleCount));
  lines.push('出行天数：' + s(record.tripInfo?.travelDays));
  lines.push('租车天数：' + s(record.tripInfo?.rentalDays));
  lines.push('总预算：' + fmt(record.budgetResult?.tripTotal));
  lines.push('人均预算：' + fmt(record.budgetResult?.perPerson));
  lines.push('日均预算：' + fmt(record.budgetResult?.dailyAverage));
  lines.push('预算等级：' + levelLabel(record.budgetResult?.budgetLevel));
  return lines.join('\n');
}

export default function AdminPage() {
  var [token, setToken] = useState('');
  var [authed, setAuthed] = useState(false);
  var [records, setRecords] = useState(null);
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState('');
  var [copiedId, setCopiedId] = useState('');

  var fetchRecords = useCallback(function (tk) {
    setLoading(true);
    setError('');

    listTravelPlans(tk, { pageSize: 50 }).then(function (res) {
      setLoading(false);
      if (res.success) {
        setRecords(res.records || []);
        setAuthed(true);
      } else {
        setError(res.message || '读取失败，请稍后重试');
        setRecords(null);
        setAuthed(false);
      }
    }).catch(function () {
      setLoading(false);
      setError('读取失败，请稍后重试');
      setRecords(null);
      setAuthed(false);
    });
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!token.trim()) {
      setError('请输入访问口令');
      return;
    }
    fetchRecords(token);
  }

  function handleRefresh() {
    if (token) {
      fetchRecords(token);
    }
  }

  function handleExportCSV() {
    if (!records || records.length === 0) {
      setError('暂无数据可导出');
      return;
    }

    var headers = [
      '提交时间', '版本', '入口模式', '来源渠道', '来源笔记', '活动', '关键词',
      '目的地', '出发城市', '人数', '出行天数', '租车天数', '能源类型', '里程',
      '总预算', '人均预算', '日均预算', '预算等级', '车辆费用占比',
    ];

    var rows = [headers.map(csvEscape).join(',')];

    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      var row = [
        fmtDate(r.createdAt),
        s(r.schemaVersion),
        entryLabel(r.entryMode),
        sourceLabel(r.source?.sourceChannel),
        s(r.source?.sourceNoteId),
        s(r.source?.sourceCampaign),
        s(r.source?.sourceKeyword),
        s(r.tripInfo?.destination),
        s(r.tripInfo?.departureCity),
        r.tripInfo?.peopleCount ?? '',
        r.tripInfo?.travelDays ?? '',
        r.tripInfo?.rentalDays ?? '',
        s(r.tripInfo?.energyType),
        r.tripInfo?.mileage ?? '',
        r.budgetResult?.tripTotal ?? '',
        r.budgetResult?.perPerson ?? '',
        r.budgetResult?.dailyAverage ?? '',
        levelLabel(r.budgetResult?.budgetLevel),
        r.budgetResult?.vehicleCostRatio != null ? r.budgetResult.vehicleCostRatio + '%' : '',
      ];
      rows.push(row.map(csvEscape).join(','));
    }

    var csvStr = rows.join('\n');
    var blob = new Blob(['﻿' + csvStr], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);

    var now = new Date();
    var ds = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    var filename = 'travel-plans-' + ds + '.csv';

    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopySummary(record) {
    var text = buildSummary(record);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setCopiedId(record.id);
        setTimeout(function () { setCopiedId(''); }, 2000);
      }).catch(function () {
        fallbackCopy(text, record.id);
      });
    } else {
      fallbackCopy(text, record.id);
    }
  }

  function fallbackCopy(text, id) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      setCopiedId(id);
      setTimeout(function () { setCopiedId(''); }, 2000);
    } catch (e) {
      // ignore
    }
    document.body.removeChild(ta);
  }

  function handleClear() {
    setToken('');
    setAuthed(false);
    setRecords(null);
    setError('');
  }

  // ======================== 未认证：口令输入 ========================
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#F3FBFE' }}>
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#D4EDF6]">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-[#0EA5D6]" />
              <h1 className="text-lg font-bold text-[#102F3A]">数据后台</h1>
            </div>
            <p className="text-sm text-[#5A7D8A] mb-5">
              仅用于查看匿名旅行预算提交记录
            </p>

            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-[#102F3A] mb-1.5">
                访问口令
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8CADB8]" />
                <input
                  type="password"
                  value={token}
                  onChange={function (e) { setToken(e.target.value); setError(''); }}
                  placeholder="请输入后台访问口令"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-[#D4EDF6] bg-[#F8FCFE] text-[#102F3A] text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA5D6]/30 focus:border-[#0EA5D6] placeholder:text-[#8CADB8]"
                  autoFocus
                />
              </div>

              {error && (
                <div className="mt-3 flex items-center gap-1.5 text-sm text-red-500">
                  <X className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm text-white bg-[#0EA5D6] hover:bg-[#0B8FB8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    验证中...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    查看数据
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ======================== 已认证：数据表格 ========================
  return (
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-8" style={{ background: '#F3FBFE' }}>
      <div className="mx-auto" style={{ maxWidth: '1400px' }}>
        {/* 顶部栏 */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#D4EDF6] p-4 sm:p-6 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0EA5D6]" />
                <h1 className="text-lg font-bold text-[#102F3A]">数据后台</h1>
              </div>
              <p className="text-sm text-[#5A7D8A] mt-1">
                共 {records ? records.length : 0} 条记录
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#102F3A] bg-[#E8F4FA] hover:bg-[#D4EDF6] disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={'w-4 h-4' + (loading ? ' animate-spin' : '')} />
                刷新
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-white bg-[#12BFC1] hover:bg-[#0FA8AA] transition-colors"
              >
                <Download className="w-4 h-4" />
                导出 CSV
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-[#5A7D8A] hover:text-[#102F3A] hover:bg-[#E8F4FA] transition-colors"
              >
                退出
              </button>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm text-red-600">
            <X className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={function () { setError(''); }} className="ml-auto text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 加载中 */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D4EDF6] p-12 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-[#0EA5D6] mr-3" />
            <span className="text-sm text-[#5A7D8A]">加载中...</span>
          </div>
        )}

        {/* 空数据 */}
        {!loading && records && records.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D4EDF6] p-12 text-center">
            <p className="text-[#8CADB8] text-sm">暂无提交记录</p>
          </div>
        )}

        {/* 数据表格 */}
        {!loading && records && records.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#D4EDF6] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#D4EDF6] bg-[#F8FCFE]">
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">提交时间</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">版本</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">入口</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">来源</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">笔记</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">活动</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">关键词</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">目的地</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">出发</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">人数</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">出行天</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">租车天</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">能源</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">里程</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-[#5A7D8A]">总预算</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-[#5A7D8A]">人均</th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-[#5A7D8A]">日均</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">等级</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">车辆比</th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-[#5A7D8A]">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(function (r) {
                    var isCopied = copiedId === r.id;
                    return (
                      <tr key={r.id} className="border-b border-[#E8F4FA] hover:bg-[#F8FCFE] transition-colors">
                        <td className="px-3 py-2.5 text-[#102F3A]">{fmtDate(r.createdAt)}</td>
                        <td className="px-3 py-2.5 text-[#102F3A]">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[#E8F4FA] text-[#5A7D8A]">{s(r.schemaVersion)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[#102F3A]">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[#E8F4FA] text-[#5A7D8A]">{entryLabel(r.entryMode)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[#102F3A]">{sourceLabel(r.source?.sourceChannel)}</td>
                        <td className="px-3 py-2.5 text-[#102F3A] max-w-[120px] truncate" title={s(r.source?.sourceNoteId)}>
                          {s(r.source?.sourceNoteId)}
                        </td>
                        <td className="px-3 py-2.5 text-[#102F3A]">{s(r.source?.sourceCampaign)}</td>
                        <td className="px-3 py-2.5 text-[#102F3A]">{s(r.source?.sourceKeyword)}</td>
                        <td className="px-3 py-2.5 font-medium text-[#102F3A]">{s(r.tripInfo?.destination)}</td>
                        <td className="px-3 py-2.5 text-[#102F3A]">{s(r.tripInfo?.departureCity)}</td>
                        <td className="px-3 py-2.5 text-[#102F3A] text-center">{r.tripInfo?.peopleCount ?? '-'}</td>
                        <td className="px-3 py-2.5 text-[#102F3A] text-center">{r.tripInfo?.travelDays ?? '-'}</td>
                        <td className="px-3 py-2.5 text-[#102F3A] text-center">{r.tripInfo?.rentalDays ?? '-'}</td>
                        <td className="px-3 py-2.5 text-[#102F3A]">{s(r.tripInfo?.energyType)}</td>
                        <td className="px-3 py-2.5 text-[#102F3A] text-right font-mono">{fmt(r.tripInfo?.mileage)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-[#102F3A]">{fmt(r.budgetResult?.tripTotal)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-[#102F3A]">{fmt(r.budgetResult?.perPerson)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-[#102F3A]">{fmt(r.budgetResult?.dailyAverage)}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[#FFF3E0] text-[#E67E22]">{levelLabel(r.budgetResult?.budgetLevel)}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[#102F3A] text-right font-mono">
                          {r.budgetResult?.vehicleCostRatio != null ? r.budgetResult.vehicleCostRatio + '%' : '-'}
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={function () { handleCopySummary(r); }}
                            className="flex items-center gap-1 text-xs text-[#0EA5D6] hover:text-[#0B8FB8] transition-colors"
                          >
                            {isCopied ? (
                              <span className="text-green-500 text-xs">已复制</span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                摘要
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
