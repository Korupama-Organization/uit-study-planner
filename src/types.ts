export interface Course {
  stt: string;
  ma_mon_hoc: string;
  ten_mon_hoc: string;
  ten_mon_hoc_en: string;
  con_mo_lop: boolean;
  don_vi_quan_ly: string;
  loai_mon_hoc: string;
  ma_cu: string;
  mon_hoc_tuong_duong: string[];
  mon_hoc_tien_quyet: string[];
  mon_hoc_truoc: string[];
  so_tin_chi_ly_thuyet: number;
  so_tin_chi_thuc_hanh: number;
  so_tin_chi: number;
}

export type SemesterId = string;

export interface Semester {
  id: SemesterId;
  name: string;
  courses: Course[];
  totalCredits: number;
}

export interface StudyPlan {
  semesters: Record<SemesterId, Semester>;
  unassignedCourses: Course[];
}
