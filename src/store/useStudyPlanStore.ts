import { create } from 'zustand';
import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Course, StudyPlan, SemesterId } from '../types';

interface StudyPlanState extends StudyPlan {
  isLoading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  addCourseToSemester: (course: Course, semesterId: SemesterId) => void;
  removeCourseFromSemester: (course: Course, semesterId: SemesterId) => void;
  moveCourse: (courseId: string, fromSemesterId: SemesterId | 'unassigned', toSemesterId: SemesterId | 'unassigned') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const initialSemesters = Array.from({ length: 8 }, (_, i) => ({
  id: `semester-${i + 1}`,
  name: `Học kỳ ${i + 1}`,
  courses: [],
  totalCredits: 0,
}));

const initialSemestersMap = initialSemesters.reduce((acc, sem) => {
  acc[sem.id] = sem;
  return acc;
}, {} as Record<string, typeof initialSemesters[0]>);

const getSemesterNumber = (id: string): number => {
  if (id === 'unassigned') return -1;
  const match = id.match(/semester-(\d+)/);
  return match ? parseInt(match[1]) : -1;
};

export const useStudyPlanStore = create<StudyPlanState>((set, get) => ({
  semesters: initialSemestersMap,
  unassignedCourses: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  fetchCourses: async () => {
    set({ isLoading: true, error: null });
    try {
      const corsProxy = 'https://api.allorigins.win/raw?url=';
      const url = 'https://daa.uit.edu.vn/danh-muc-mon-hoc-dai-hoc';
      
      const response = await axios.get(corsProxy + encodeURIComponent(url));
      const html = response.data;
      const $ = cheerio.load(html);
      const data: Course[] = [];

      $('table.tablesorter tbody tr').each((_i, el) => {
          const row = $(el).find('td');

          const getText = (element: any) => {
              return element.text().trim().replace(/\u00a0/g, ' ').trim();
          }

          const getCourses = (index: number) => {
            const cellHtml = $(row[index]).html();
            if (!cellHtml) return [];
            return cellHtml.split('<br>').map((s: string) => $(`<td>${s}</td>`).text().trim()).filter((s: string) => s);
          }

          const so_tclt = parseInt(getText($(row[11]))) || 0;
          const so_tcth = parseInt(getText($(row[12]))) || 0;

          const course: Course = {
              'stt': getText($(row[0])),
              'ma_mon_hoc': getText($(row[1])),
              'ten_mon_hoc': getText($(row[2])),
              'ten_mon_hoc_en': getText($(row[3])),
              'con_mo_lop': $(row[4]).find('img').attr('title') === 'Hiện đang mở',
              'don_vi_quan_ly': getText($(row[5])),
              'loai_mon_hoc': getText($(row[6])),
              'ma_cu': getText($(row[7])),
              'mon_hoc_tuong_duong': getCourses(8),
              'mon_hoc_tien_quyet': getCourses(9),
              'mon_hoc_truoc': getCourses(10),
              'so_tin_chi_ly_thuyet': so_tclt,
              'so_tin_chi_thuc_hanh': so_tcth,
              'so_tin_chi': so_tclt + so_tcth,
          };
          data.push(course);
      });

      set({ unassignedCourses: data, isLoading: false });
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      set({ 
        error: 'Failed to fetch course data. Please try again later. ' + (error.message || ''), 
        isLoading: false 
      });
    }
  },
  
  addCourseToSemester: (course, semesterId) => 
    get().moveCourse(course.ma_mon_hoc, 'unassigned', semesterId),

  removeCourseFromSemester: (course, semesterId) =>
    get().moveCourse(course.ma_mon_hoc, semesterId, 'unassigned'),

  moveCourse: (courseId, fromSemesterId, toSemesterId) =>
    set((state) => {
      if (fromSemesterId === toSemesterId) return state;

      // Find the course object
      let course: Course | undefined;
      if (fromSemesterId === 'unassigned') {
        course = state.unassignedCourses.find(c => c.ma_mon_hoc === courseId);
      } else {
        const sourceSem = state.semesters[fromSemesterId];
        course = sourceSem?.courses.find(c => c.ma_mon_hoc === courseId);
      }

      if (!course) return state;

      // Validation logic
      if (toSemesterId !== 'unassigned') {
        const targetSemNum = getSemesterNumber(toSemesterId);

        // 1. Check prerequisites (mon_hoc_truoc)
        // Ensure all prerequisite courses are in semesters < targetSemNum
        if (course.mon_hoc_truoc && course.mon_hoc_truoc.length > 0) {
          for (const prereqCode of course.mon_hoc_truoc) {
            // Find prerequisite course in semesters
            let prereqSemId: string | undefined;
            for (const semId in state.semesters) {
              if (state.semesters[semId].courses.some(c => c.ma_mon_hoc === prereqCode)) {
                prereqSemId = semId;
                break;
              }
            }

            if (prereqSemId) {
              const prereqSemNum = getSemesterNumber(prereqSemId);
              if (prereqSemNum >= targetSemNum) {
                alert(`Không thể xếp môn "${course.ten_mon_hoc}" vào ${state.semesters[toSemesterId].name} vì môn tiên quyết "${prereqCode}" đang ở ${state.semesters[prereqSemId].name}. Môn tiên quyết phải học trước.`);
                return state;
              }
            }
          }
        }

        // 2. Check dependents
        // Ensure all courses that have this course as prerequisite are in semesters > targetSemNum
        for (const semId in state.semesters) {
          const sem = state.semesters[semId];
          const semNum = getSemesterNumber(semId);
          
          for (const scheduledCourse of sem.courses) {
            if (scheduledCourse.ma_mon_hoc === courseId) continue; 
            
            if (scheduledCourse.mon_hoc_truoc && scheduledCourse.mon_hoc_truoc.includes(courseId)) {
              if (targetSemNum >= semNum) {
                 alert(`Không thể xếp môn "${course.ten_mon_hoc}" vào ${state.semesters[toSemesterId].name} vì môn học sau nó là "${scheduledCourse.ten_mon_hoc}" đang ở ${sem.name}. Môn tiên quyết phải học trước.`);
                 return state;
              }
            }
          }
        }
      }

      // Execute Move
      let newUnassigned = [...state.unassignedCourses];
      let newSemesters = { ...state.semesters };

      // Remove from source
      if (fromSemesterId === 'unassigned') {
        newUnassigned = newUnassigned.filter(c => c.ma_mon_hoc !== courseId);
      } else {
        const sourceSem = newSemesters[fromSemesterId];
        newSemesters[fromSemesterId] = {
          ...sourceSem,
          courses: sourceSem.courses.filter(c => c.ma_mon_hoc !== courseId),
          totalCredits: sourceSem.totalCredits - course.so_tin_chi
        };
      }

      // Add to destination
      if (toSemesterId === 'unassigned') {
        newUnassigned.push(course);
      } else {
        const destSem = newSemesters[toSemesterId];
        newSemesters[toSemesterId] = {
          ...destSem,
          courses: [...destSem.courses, course],
          totalCredits: destSem.totalCredits + course.so_tin_chi
        };
      }

      return {
        semesters: newSemesters,
        unassignedCourses: newUnassigned
      };
    })
}));
