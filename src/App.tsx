import React, { useEffect, useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SemesterColumn } from './components/SemesterColumn';
import { CourseSidebar } from './components/CourseSidebar';
import { CourseCard } from './components/CourseCard';
import { useStudyPlanStore } from './store/useStudyPlanStore';
import type { Course } from './types';

const StudyPlanApp: React.FC = () => {
  const { 
    semesters, 
    unassignedCourses, 
    moveCourse,
    fetchCourses,
    isLoading,
    error
  } = useStudyPlanStore();
  
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const courseId = active.id as string;
    
    // Find course in unassigned
    let course = unassignedCourses.find(c => c.ma_mon_hoc === courseId);
    
    // If not found, look in semesters
    if (!course) {
      for (const sem of Object.values(semesters)) {
        const found = sem.courses.find(c => c.ma_mon_hoc === courseId);
        if (found) {
          course = found;
          break;
        }
      }
    }
    
    setActiveCourse(course || null);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Optional: add visual feedback logic here
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveCourse(null);
      return;
    }

    const courseId = active.id as string;
    const overId = over.id as string; // semester id or 'unassigned'

    // Determine source container
    let sourceId = 'unassigned';
    if (unassignedCourses.some(c => c.ma_mon_hoc === courseId)) {
      sourceId = 'unassigned';
    } else {
      const sourceSem = Object.values(semesters).find(s => 
        s.courses.some(c => c.ma_mon_hoc === courseId)
      );
      if (sourceSem) sourceId = sourceSem.id;
    }

    // Determine target container
    let targetId = overId;
    // If dropped on a course card, find its container
    if (targetId !== 'unassigned' && !semesters[targetId]) {
       // It might be dropped onto another course card inside a semester
       const targetSem = Object.values(semesters).find(s => 
         s.courses.some(c => c.ma_mon_hoc === targetId)
       );
       if (targetSem) targetId = targetSem.id;
       else targetId = 'unassigned'; // Default fallback
    }

    moveCourse(courseId, sourceId, targetId);
    setActiveCourse(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-gray-900">
        <CourseSidebar courses={unassignedCourses} />
        
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-800">Kế hoạch học tập</h1>
              <p className="text-sm text-gray-500">Kéo thả môn học vào các học kỳ để xây dựng lộ trình</p>
            </div>
            {isLoading && <span className="text-sm text-blue-600 animate-pulse">Đang tải dữ liệu...</span>}
            {error && <span className="text-sm text-red-600">{error}</span>}
          </header>
          
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            <div className="flex gap-6 h-full pb-2">
              {Object.values(semesters).map((semester) => (
                <SemesterColumn 
                  key={semester.id} 
                  id={semester.id} 
                  semester={semester} 
                />
              ))}
            </div>
          </div>
        </main>

        <DragOverlay>
          {activeCourse ? <CourseCard id={activeCourse.ma_mon_hoc} course={activeCourse} /> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
};

export default StudyPlanApp;
