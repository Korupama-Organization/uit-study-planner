import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Semester } from '../types';
import { CourseCard } from './CourseCard';
import { cn } from '../lib/utils';
import { useStudyPlanStore } from '../store/useStudyPlanStore';

interface SemesterColumnProps {
  semester: Semester;
  id: string;
}

export const SemesterColumn: React.FC<SemesterColumnProps> = ({ semester, id }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'Semester',
      semester,
    },
  });

  const { removeCourseFromSemester } = useStudyPlanStore();

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200 min-w-[300px]">
      <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">{semester.name}</h3>
          <span className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-full",
            semester.totalCredits > 24 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          )}>
            {semester.totalCredits} TC
          </span>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 overflow-y-auto custom-scrollbar transition-colors",
          isOver && "bg-blue-50/50"
        )}
      >
        <SortableContext 
          id={id}
          items={semester.courses.map(c => c.ma_mon_hoc)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2 min-h-[100px]">
            {semester.courses.map((course) => (
              <CourseCard 
                key={course.ma_mon_hoc} 
                id={course.ma_mon_hoc} 
                course={course}
                onRemove={() => removeCourseFromSemester(course, id)}
              />
            ))}
            {semester.courses.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic py-8 border-2 border-dashed border-gray-200 rounded-lg">
                Thả môn học vào đây
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
