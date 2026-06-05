import type { Category } from '../lib/database.types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function CategoryBadge({ category, size = 'md', showText = true }: CategoryBadgeProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="inline-flex items-center gap-2">
      {category.image_url ? (
        <div className={`${sizeClasses[size]} rounded-lg overflow-hidden flex-shrink-0 border border-[#334155] shadow-sm`}>
          <img
            src={category.image_url}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-lg flex-shrink-0 border border-[#334155]`}
          style={{ backgroundColor: `${category.color}20` }}
        />
      )}
      {showText && (
        <span className={`font-medium text-[#F8FAFC] ${textSizeClasses[size]}`}>{category.name}</span>
      )}
    </div>
  );
}
