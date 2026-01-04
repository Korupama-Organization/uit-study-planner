import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Course } from '../types';
import { cn } from '../lib/utils';
import { GripVertical, X } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  id: string;
  onRemove?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, id, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white p-3 rounded-lg shadow-sm border border-gray-200 mb-2 group hover:shadow-md transition-shadow relative",
        isDragging && "opacity-50 ring-2 ring-blue-500 z-50"
      )}
    >
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical size={16} />
        </div>
        <div className="flex-1 pr-4">
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{course.ten_mon_hoc}</h4>
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full whitespace-nowrap ml-2 flex-shrink-0">
              {course.so_tin_chi} TC
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{course.ma_mon_hoc}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {course.mon_hoc_tien_quyet && course.mon_hoc_tien_quyet.length > 0 && (
              <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">
                TQ: {course.mon_hoc_tien_quyet.join(', ')}
              </span>
            )}
          </div>
        </div>
        {onRemove && (
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent drag start if clicking remove or any other unintended interaction
              onRemove();
            }}
            onPointerDown={(e) => e.stopPropagation()} // Important: prevent DnD from capturing the click
            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Bỏ môn học khỏi học kỳ này"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
