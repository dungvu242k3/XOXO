import { Check, Edit2, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Member } from '../types';

interface CommissionRowProps {
    member: Member;
    commission: { value: number, type: 'money' | 'percent' };
    itemPrice?: number; // Base price for conversion
    onUpdate: (value: number, type: 'money' | 'percent') => void;
    onDelete: () => void; // Reset to 0
}

const formatNumber = (num: number | string | undefined | null): string => {
    if (num === undefined || num === null) return '';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue) || numValue === 0) return '';
    // Format with max 2 decimal places for small percentages, but integers for money usually
    return numValue.toLocaleString('vi-VN', { maximumFractionDigits: 2 });
};

const CommissionRow: React.FC<CommissionRowProps> = ({ member, commission, itemPrice, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localValue, setLocalValue] = useState(commission.value);
    const [localType, setLocalType] = useState(commission.type);
    const [inputValue, setInputValue] = useState(formatNumber(commission.value));

    // Sync local state when prop changes (if not editing)
    useEffect(() => {
        if (!isEditing) {
            setLocalValue(commission.value);
            setLocalType(commission.type);
            setInputValue(formatNumber(commission.value));
        }
    }, [commission, isEditing]);

    const handleSave = () => {
        onUpdate(localValue, localType);
        setIsEditing(false);
    };

    const handleDisplayValue = () => {
        if (commission.value === 0) return '0 ₫';
        if (commission.type === 'percent') return `${commission.value.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`;
        return `${commission.value.toLocaleString('vi-VN')} ₫`;
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 bg-neutral-900/40 p-1.5 rounded border border-neutral-700/50 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                    {member.avatar ? (
                        <img src={member.avatar} alt="" className="w-5 h-5 rounded-full" />
                    ) : (
                        <div className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                            {member.name.charAt(0)}
                        </div>
                    )}
                </div>

                {/* Type Toggle */}
                <div className="flex gap-0.5 bg-neutral-800 rounded p-0.5 border border-neutral-700">
                    <button
                        onClick={() => {
                            if (localType === 'money') return;
                            setLocalType('money');
                            // Convert Percent -> Money
                            if (itemPrice && localValue > 0) {
                                const moneyVal = Math.round((localValue * itemPrice) / 100);
                                setLocalValue(moneyVal);
                                setInputValue(formatNumber(moneyVal));
                            } else {
                                // Fallback: clear or keep (clearing is safer to avoid confusion if no price)
                                if (!itemPrice) {
                                    setLocalValue(0);
                                    setInputValue('');
                                }
                            }
                        }}
                        className={`px-1.5 py-0.5 text-[10px] rounded ${localType === 'money' ? 'bg-gold-500 text-black font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                    >₫</button>
                    <button
                        onClick={() => {
                            if (localType === 'percent') return;
                            setLocalType('percent');
                            // Convert Money -> Percent
                            if (itemPrice && itemPrice > 0 && localValue > 0) {
                                const percentVal = (localValue / itemPrice) * 100;
                                // Round to 2 decimals
                                const rounded = Math.round(percentVal * 100) / 100;
                                setLocalValue(rounded);
                                setInputValue(formatNumber(rounded));
                            } else {
                                // Fallback: clear if no price to base on
                                if (!itemPrice) {
                                    setLocalValue(0);
                                    setInputValue('');
                                }
                            }
                        }}
                        className={`px-1.5 py-0.5 text-[10px] rounded ${localType === 'percent' ? 'bg-gold-500 text-black font-bold' : 'text-slate-500 hover:text-slate-300'}`}
                    >%</button>
                </div>

                {/* Input */}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        const raw = e.target.value.replace(/\./g, '');
                        if (raw === '') {
                            setLocalValue(0);
                            setInputValue('');
                            return;
                        }
                        const val = parseFloat(raw);
                        if (!isNaN(val)) {
                            setLocalValue(val);
                            setInputValue(val.toLocaleString('vi-VN'));
                        }
                    }}
                    className="w-20 bg-neutral-950 border border-neutral-700 rounded px-1.5 py-0.5 text-right text-xs text-gold-500 font-bold outline-none focus:border-gold-500"
                    placeholder="0"
                    autoFocus
                />

                {/* Action Buttons */}
                <button onClick={handleSave} className="p-1 text-emerald-500 hover:bg-emerald-900/30 rounded" title="Lưu">
                    <Check size={14} />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-1 text-slate-500 hover:bg-neutral-800 rounded" title="Hủy">
                    <X size={14} />
                </button>
            </div>
        );
    }

    // View Mode
    return (
        <div className="flex items-center gap-2 p-1.5 rounded border border-transparent hover:bg-neutral-900/40 hover:border-neutral-800/50 group transition-all">
            <div className="flex items-center gap-1.5">
                {member.avatar ? (
                    <img src={member.avatar} alt="" className="w-5 h-5 rounded-full grayscale group-hover:grayscale-0 transition-all" />
                ) : (
                    <div className="w-5 h-5 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                        {member.name.charAt(0)}
                    </div>
                )}
                <span className="text-xs text-slate-400 group-hover:text-slate-300 max-w-[80px] truncate transition-colors font-medium">{member.name}</span>
            </div>

            <div className="flex items-center gap-2">
                <span className={`text-xs font-bold ${commission.value > 0 ? 'text-gold-500' : 'text-slate-600'} min-w-[40px] text-right`}>
                    {handleDisplayValue()}
                </span>

                {/* Edit/Reset Buttons (Visible on group-hover) */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                        title="Sửa hoa hồng"
                    >
                        <Edit2 size={13} />
                    </button>

                    <button
                        onClick={onDelete}
                        className="p-1 text-red-400 hover:bg-red-900/30 rounded transition-colors"
                        title="Xóa/Gỡ nhân viên"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommissionRow;
