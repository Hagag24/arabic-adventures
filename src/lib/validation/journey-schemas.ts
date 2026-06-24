import { z } from "zod";

export const journeySlugSchema = z
  .string()
  .min(1, "الرابط التعريفي مطلوب")
  .regex(
    /^[a-z0-9-]+$/,
    "الرابط التعريفي يجب أن يحتوي على أحرف صغيرة وأرقام وشرطات فقط",
  );
