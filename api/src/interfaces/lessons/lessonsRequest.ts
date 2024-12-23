export default interface LessonsRequestParamsInterface {
  date?: string;
  status?: number;
  teacherIds?: number[];
  studentsCount?: string;
  page: number;
  lessonsPerPage: number;
}
