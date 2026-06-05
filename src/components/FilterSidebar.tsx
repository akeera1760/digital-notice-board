import type { Category, Department } from '../lib/database.types';
import { Tag, Building2, BarChart2, X } from 'lucide-react';

interface FilterSidebarProps {
  categories: Category[];
  departments: Department[];
  selectedCategory: string;
  selectedDepartment: string;
  selectedPriority: string;
  onCategoryChange: (id: string) => void;
  onDepartmentChange: (id: string) => void;
  onPriorityChange: (p: string) => void;
}

const PRIORITIES = [
  { value: 'urgent', label: 'Urgent', color: 'text-[#EF4444]' },
  { value: 'high', label: 'High', color: 'text-[#FB923C]' },
  { value: 'normal', label: 'Normal', color: 'text-[#10B981]' },
  { value: 'low', label: 'Low', color: 'text-[#94A3B8]' },
];

export default function FilterSidebar({
  categories, departments,
  selectedCategory, selectedDepartment, selectedPriority,
  onCategoryChange, onDepartmentChange, onPriorityChange,
}: FilterSidebarProps) {
  const hasFilters = selectedCategory || selectedDepartment || selectedPriority;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Filters</h3>
        {hasFilters && (
          <button
            onClick={() => { onCategoryChange(''); onDepartmentChange(''); onPriorityChange(''); }}
            className="flex items-center gap-1 text-xs text-[#10B981] hover:text-[#6EE7B7] transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Category</span>
        </div>
        <div className="space-y-1">
          <FilterButton active={!selectedCategory} onClick={() => onCategoryChange('')} label="All Categories" color="#64748B" />
          {categories.map(c => (
            <FilterButton
              key={c.id}
              active={selectedCategory === c.id}
              onClick={() => onCategoryChange(selectedCategory === c.id ? '' : c.id)}
              label={c.name}
              color={c.color}
              emoji={c.emoji}
            />
          ))}
        </div>
      </div>

      {/* Departments */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Department</span>
        </div>
        <div className="space-y-1">
          <FilterButton active={!selectedDepartment} onClick={() => onDepartmentChange('')} label="All Departments" color="#64748B" />
          {departments.map(d => (
            <FilterButton
              key={d.id}
              active={selectedDepartment === d.id}
              onClick={() => onDepartmentChange(selectedDepartment === d.id ? '' : d.id)}
              label={`${d.name} (${d.code})`}
              color="#6B7280"
            />
          ))}
        </div>
      </div>

      {/* Priority */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide">Priority</span>
        </div>
        <div className="space-y-1">
          <FilterButton active={!selectedPriority} onClick={() => onPriorityChange('')} label="All Priorities" color="#64748B" />
          {PRIORITIES.map(p => (
            <button
              key={p.value}
              onClick={() => onPriorityChange(selectedPriority === p.value ? '' : p.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedPriority === p.value ? `bg-[#334155] ${p.color}` : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#CBD5E1]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, label, color, emoji }: { active: boolean; onClick: () => void; label: string; color: string; emoji?: string | null }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
        active ? 'bg-[#334155] text-white' : 'text-[#94A3B8] hover:bg-[#1E293B] hover:text-[#CBD5E1]'
      }`}
    >
      {emoji ? (
        <span className="text-sm">{emoji}</span>
      ) : (
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
}
