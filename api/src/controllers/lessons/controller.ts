import { Router, Request } from 'express';
import LessonsRequestParamsInterface from '@/interfaces/lessons/lessonsRequest';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import LessonsDTO from '@dto/lessonsDTO';
import LessonsFilterBuilder from '@services/lessons/lessonsFilterBuilder';

export const lessonsController = (router: Router) => {
  router.get(
    '/lessons',
    async (req: Request<LessonsRequestParamsInterface>, res: any) => {
      try {
        const lessonsValidate = plainToClass(LessonsDTO, req.query);

        const errors = await validate(lessonsValidate);

        if (errors.length > 0) {
          return res.status(400).json({
            message: 'Validation failed',
            errors: errors.map((err) => ({
              property: err.property,
              constraints: err.constraints,
            })),
          });
        }

        const filter = {
          ...lessonsValidate,
        };

        const lessonsFilterBuilder = new LessonsFilterBuilder(filter);

        const filteredLessons = lessonsFilterBuilder
          .applyDateFilter()
          .applyStatusFilter()
          .applyStudentsCountFilter()
          .applyPagination()
          .applyTeacherIdsFilter()
          .getLessonsWithRelations();

        return res.status(200).json(await filteredLessons);
      } catch (e) {
        return res.status(500).json({
          message: 'Unexpected Error',
          errors: e instanceof Error ? e.message : 'Unknown error occurred',
        });
      }
    }
  );
};
