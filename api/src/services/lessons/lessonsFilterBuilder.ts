import db from '@/db/config';
import dayjs from 'dayjs';
import LessonsRequestParamsInterface from '@interfaces/lessons/lessonsRequest';

export default class LessonsFilterBuilder {
  private readonly filters: LessonsRequestParamsInterface;
  private readonly query;

  constructor(filters: LessonsRequestParamsInterface) {
    this.filters = filters;
    this.query = db('lessons');
  }

  applyDateFilter() {
    const { date } = this.filters;
    if (date) {
      const [startDate, endDate] = date.split(',');
      if (endDate) {
        this.query.whereBetween('lessons.date', [
          dayjs(startDate).toDate(),
          dayjs(endDate).toDate(),
        ]);
      } else {
        this.query.where('lessons.date', dayjs(startDate).toDate());
      }
    }
    return this;
  }

  applyStatusFilter() {
    const { status } = this.filters;
    if (status !== undefined) {
      this.query.where('lessons.status', status);
    }
    return this;
  }

  applyTeacherIdsFilter() {
    const { teacherIds } = this.filters;
    if (teacherIds) {
      this.query
        .join('lesson_teachers', 'lessons.id', '=', 'lesson_teachers.lesson_id')
        .whereIn('lesson_teachers.teacher_id', teacherIds);
    }
    return this;
  }

  applyStudentsCountFilter() {
    const { studentsCount } = this.filters;
    if (studentsCount) {
      const [minCount, maxCount] = studentsCount.split(',');
      this.query
        .join('lesson_students', 'lessons.id', '=', 'lesson_students.lesson_id')
        .groupBy('lessons.id')
        .having(
          db.raw(
            maxCount
              ? 'COUNT(lesson_students.student_id) BETWEEN ? AND ?'
              : 'COUNT(lesson_students.student_id) = ?',
            maxCount
              ? [parseInt(minCount), parseInt(maxCount)]
              : [parseInt(minCount)]
          )
        );
    }
    return this;
  }

  applyPagination() {
    const { page = 1, lessonsPerPage = 5 } = this.filters;
    this.query.limit(lessonsPerPage).offset((page - 1) * lessonsPerPage);
    return this;
  }

  build() {
    return this.query;
  }

  async getLessonsWithRelations() {
    const lessons = await this.build().select(
      'lessons.id',
      'lessons.date',
      'lessons.title',
      'lessons.status'
    );

    if (!lessons.length) return [];

    const lessonIds = lessons.map((lesson) => lesson.id);

    const fetchLessonStudents = async (lessonIds: number[]) => {
      try {
        // @ts-ignore
        const result = await db('lesson_students')
          .join('students', 'lesson_students.student_id', '=', 'students.id')
          .whereIn('lesson_students.lesson_id', lessonIds)
          .select(
            'lesson_students.lesson_id',
            'students.id as student_id',
            'students.name as student_name',
            'lesson_students.visit as visit'
          );

        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error fetching students:', error);
        return [];
      }
    };

    const fetchLessonTeachers = async (lessonIds: number[]) => {
      try {
        // @ts-ignore
        const result = await db('lesson_teachers')
          .join('teachers', 'lesson_teachers.teacher_id', '=', 'teachers.id')
          .whereIn('lesson_teachers.lesson_id', lessonIds)
          .select(
            'lesson_teachers.lesson_id',
            'teachers.id as teacher_id',
            'teachers.name as teacher_name'
          );

        return Array.isArray(result) ? result : [];
      } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
      }
    };

    const students = await fetchLessonStudents(lessonIds);
    const teachers = await fetchLessonTeachers(lessonIds);

    return lessons.map((lesson) => {
      const lessonStudents = Array.isArray(students)
        ? students.filter((s) => s.lesson_id === lesson.id)
        : [];
      const lessonTeachers = Array.isArray(teachers)
        ? teachers.filter((t) => t.lesson_id === lesson.id)
        : [];

      return {
        id: lesson.id,
        date: lesson.date,
        title: lesson.title,
        status: lesson.status,
        visitCount: lessonStudents.filter((s) => s.visit).length,
        students: lessonStudents.map((s) => ({
          id: s.student_id,
          name: s.student_name,
          visit: s.visit,
        })),
        teachers: lessonTeachers.map((t) => ({
          id: t.teacher_id,
          name: t.teacher_name,
        })),
      };
    });
  }
}
