import { z } from "zod";

const jsonValue: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValue),
    z.record(z.string(), jsonValue),
  ]),
);

export const submissionSchema = z
  .object({
    activityId: z.string().uuid("معرف النشاط غير صالح"),
    responseData: z.record(z.string(), jsonValue).nullable().optional(),
  })
  .strict();

export type StudentSubmissionInput = z.infer<typeof submissionSchema>;
