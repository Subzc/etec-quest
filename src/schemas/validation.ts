import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    displayName: z.string().min(2, "Informe seu nome"),
    username: z
      .string()
      .min(3, "Mínimo 3 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/, "Use apenas letras, números e _"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// ---------------------------------------------------------------------------
// Conteúdo pedagógico (usado pelo painel admin)
// ---------------------------------------------------------------------------

export const subjectSchema = z.object({
  name: z.string().min(2),
  dungeonTitle: z.string().min(2),
  description: z.string().min(10),
  icon: z.string().min(1),
  color: z.string().min(1),
  order: z.number().int().min(0),
  isPublished: z.boolean().default(false),
});
export type SubjectInput = z.infer<typeof subjectSchema>;

export const moduleSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().min(5),
  order: z.number().int().min(0),
  requiredLevel: z.number().int().min(1).optional(),
  isPublished: z.boolean().default(false),
});
export type ModuleInput = z.infer<typeof moduleSchema>;

export const lessonSchema = z.object({
  subjectId: z.string().min(1),
  moduleId: z.string().min(1),
  title: z.string().min(2),
  content: z.string().min(10),
  videoURL: z.string().url().optional().or(z.literal("")),
  order: z.number().int().min(0),
  xpReward: z.number().int().min(0),
  estimatedMinutes: z.number().int().min(1),
  isPublished: z.boolean().default(false),
});
export type LessonInput = z.infer<typeof lessonSchema>;

export const questionSchema = z.object({
  subjectId: z.string().min(1),
  moduleId: z.string().min(1),
  lessonId: z.string().optional(),
  type: z.enum(["multiple_choice", "true_false", "open_text"]),
  statement: z.string().min(5),
  options: z
    .array(z.object({ id: z.string(), text: z.string().min(1) }))
    .optional(),
  correctOptionId: z.string().optional(),
  correctBoolean: z.boolean().optional(),
  explanation: z.string().min(5),
  difficulty: z.enum(["easy", "medium", "hard"]),
  xpReward: z.number().int().min(0),
});
export type QuestionInput = z.infer<typeof questionSchema>;
