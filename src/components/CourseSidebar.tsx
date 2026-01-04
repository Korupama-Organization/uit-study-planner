import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Course } from '../types';
import { CourseCard } from './CourseCard';
import { useStudyPlanStore } from '../store/useStudyPlanStore';
import { Search } from 'lucide-react';

interface CourseSidebarProps {
  courses: Course[];
}

export const CourseSidebar: React.FC<CourseSidebarProps> = ({ courses }) => {
  const { searchQuery, setSearchQuery } = useStudyPlanStore();
  const { setNodeRef } = useDroppable({
    id: 'unassigned',
  });

  const filteredCourses = courses.filter(course => 
    course.ten_mon_hoc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.ma_mon_hoc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full shadow-lg z-10">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Danh mục môn học</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm môn học..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div 
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-gray-50/50"
      >
        <SortableContext 
          id="unassigned"
          items={filteredCourses.map(c => c.ma_mon_hoc)} 
          strategy={verticalListSortingStrategy}
        >
          {filteredCourses.map((course) => (
            <CourseCard key={course.ma_mon_hoc} id={course.ma_mon_hoc} course={course} />
          ))}
          {filteredCourses.length === 0 && (
            <div className="text-center text-gray-500 mt-8 text-sm">
              Không tìm thấy môn học nào
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};
