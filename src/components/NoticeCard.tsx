import { useState } from 'react';
import {
  Clock, Bookmark, BookmarkCheck, Archive, Eye, EyeOff, User,
  Paperclip, ChevronDown, ChevronUp, Tag, Building2, AlertCircle, Pencil, Trash2, Clock3
} from 'lucide-react';
import type { NoticeWithDetails } from '../lib/database.types';

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', class: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30' },
  high: { label: 'High', class: 'bg-[#FB923C]/20 text-[#FB923C] border-[#FB923C]/30' },
  normal: { label: 'Normal', class: 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30' },
  low: { label: 'Low', class: 'bg-[#94A3B8]/20 text-[#94A3B8] border-[#94A3B8]/30' },
};

interface NoticeCardProps {
  notice: NoticeWithDetails;
  role: 'student' | 'teacher';
  isRead?: boolean;
  isBookmarked?: boolean;
  isReadLater?: boolean;
  isArchived?: boolean;
  onRead?: (id: string) => void;
  onBookmark?: (id: string, add: boolean) => void;
  onReadLater?: (id: string, add: boolean) => void;
  onArchive?: (id: string, add: boolean) => void;
  onEdit?: (notice: NoticeWithDetails) => void;
  onDelete?: (id: string) => void;
}

export default function NoticeCard({
  notice, role, isRead, isBookmarked, isReadLater, isArchived,
  onRead, onBookmark, onReadLater, onArchive, onEdit, onDelete,
}: NoticeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITY_CONFIG[notice.priority];
  const isExpired = notice.expires_at && new Date(notice.expires_at) < new Date();

  const daysLeft = notice.expires_at
    ? Math.ceil((new Date(notice.expires_at).getTime() - Date.now()) / 86400000)
    : null;

  const handleExpand = () => {
    setExpanded(e => !e);
    if (!isRead && !expanded) onRead?.(notice.id);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className={`card-premium transition-all duration-200 hover:border-[#475569] ${
      isRead ? 'border-[#334155]' : 'border-[#10B981]/30 shadow-sm shadow-emerald-500/10'
    } ${isExpired ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div
        className="p-4 sm:p-5 cursor-pointer select-none"
        onClick={handleExpand}
      >
        <div className="flex items-start gap-3">
          {/* Unread indicator */}
          {!isRead && role === 'student' && (
            <div className="mt-1.5 w-2 h-2 rounded-full bg-[#10B981] flex-shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {notice.categories && (
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full border inline-flex items-center gap-1.5"
                  style={{ backgroundColor: `${notice.categories.color}20`, color: notice.categories.color, borderColor: `${notice.categories.color}40` }}
                >
                  <span className="text-sm">{notice.categories.emoji || '📌'}</span>
                  {notice.categories.name}
                </span>
              )}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priority.class}`}>
                {priority.label}
              </span>
              {isExpired && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#64748B]/40 text-[#94A3B8] border border-[#64748B]/30">
                  Expired
                </span>
              )}
              {daysLeft !== null && daysLeft <= 3 && daysLeft > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {daysLeft}d left
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className={`font-semibold text-base leading-snug mb-1.5 ${isRead && role === 'student' ? 'text-[#CBD5E1]' : 'text-white'}`}>
              {notice.title}
            </h3>

            {/* Info */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#94A3B8]">
              {notice.profiles && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {notice.profiles.full_name}
                </span>
              )}
              {notice.departments && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {notice.departments.code}
                </span>
              )}
              <span className="flex items-center gap-1 rounded-full border border-slate-700 px-2 py-0.5 text-xs bg-slate-900/70">
                {notice.target_years?.length ? `Years ${notice.target_years.join(', ')}` : 'All Years'}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Eye className="w-3.5 h-3.5" />
                {(notice.view_count ?? 0)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(notice.created_at)}
              </span>
              {notice.attachment_urls?.length > 0 && (
                <span className="flex items-center gap-1 text-blue-400">
                  <Paperclip className="w-3.5 h-3.5" />
                  {notice.attachment_urls.length} file{notice.attachment_urls.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Expand toggle */}
          <div className="text-slate-500 flex-shrink-0 mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 border-t border-slate-700/50 pt-4">
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap mb-4">{notice.content}</p>

          {notice.expires_at && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
              <Clock3 className="w-3.5 h-3.5" />
              Expires: {formatDate(notice.expires_at)}
            </div>
          )}

          {notice.attachment_names?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {notice.attachment_names.map((name, i) => (
                <a
                  key={i}
                  href={notice.attachment_urls[i]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-slate-700/50 border border-slate-600 text-slate-300 hover:text-blue-400 hover:border-blue-500/50 transition-all text-xs px-3 py-1.5 rounded-lg"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  {name}
                </a>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-700/50">
            {role === 'student' && (
              <>
                <ActionBtn
                  active={!!isBookmarked}
                  activeClass="bg-amber-500/20 text-amber-400 border-amber-500/30"
                  inactiveClass="bg-slate-700/50 text-slate-400 border-slate-600"
                  icon={isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                  label={isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  onClick={() => onBookmark?.(notice.id, !isBookmarked)}
                />
                <ActionBtn
                  active={!!isReadLater}
                  activeClass="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                  inactiveClass="bg-slate-700/50 text-slate-400 border-slate-600"
                  icon={<Clock3 className="w-3.5 h-3.5" />}
                  label={isReadLater ? 'Saved' : 'Read Later'}
                  onClick={() => onReadLater?.(notice.id, !isReadLater)}
                />
                <ActionBtn
                  active={!!isArchived}
                  activeClass="bg-slate-600/40 text-slate-300 border-slate-500"
                  inactiveClass="bg-slate-700/50 text-slate-400 border-slate-600"
                  icon={<Archive className="w-3.5 h-3.5" />}
                  label={isArchived ? 'Archived' : 'Archive'}
                  onClick={() => onArchive?.(notice.id, !isArchived)}
                />
              </>
            )}

            {role === 'teacher' && (
              <>
                <ActionBtn
                  active={false}
                  activeClass=""
                  inactiveClass="bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20"
                  icon={<Pencil className="w-3.5 h-3.5" />}
                  label="Edit"
                  onClick={() => onEdit?.(notice)}
                />
                <ActionBtn
                  active={false}
                  activeClass=""
                  inactiveClass="bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  label="Delete"
                  onClick={() => onDelete?.(notice.id)}
                />
              </>
            )}

            {isRead && role === 'student' && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
                <Eye className="w-3.5 h-3.5" />
                Read
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ active, activeClass, inactiveClass, icon, label, onClick }: {
  active: boolean;
  activeClass: string;
  inactiveClass: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${active ? activeClass : inactiveClass}`}
    >
      {icon}
      {label}
    </button>
  );
}
