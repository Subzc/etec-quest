/**
 * ETEC Quest — Modelo de dados (Firestore)
 * ------------------------------------------------------------------
 * Cada interface abaixo corresponde a uma coleção (ou subcoleção) do
 * Firestore. Nada aqui é hardcoded: matérias, módulos, lições, questões
 * e simulados são todos documentos criados pelo painel admin.
 *
 * Convenção de coleções:
 *   users/{uid}
 *   users/{uid}/studySessions/{sessionId}
 *   users/{uid}/xpHistory/{entryId}
 *   users/{uid}/levelHistory/{entryId}
 *   users/{uid}/inventory/{itemId}
 *   users/{uid}/equipment/{slot}
 *   users/{uid}/pets/{petId}
 *   users/{uid}/achievements/{achievementId}
 *   users/{uid}/answers/{answerId}
 *   users/{uid}/dailyQuests/{questId}
 *   users/{uid}/weeklyQuests/{questId}
 *   users/{uid}/notifications/{notificationId}
 *   users/{uid}/titles/{titleId}
 *   users/{uid}/settings/preferences
 *   users/{uid}/city (doc único: cityState)
 *   users/{uid}/farm (doc único: farmState)
 *
 *   subjects/{subjectId}
 *   subjects/{subjectId}/modules/{moduleId}
 *   subjects/{subjectId}/modules/{moduleId}/lessons/{lessonId}
 *   subjects/{subjectId}/modules/{moduleId}/lessons/{lessonId}/questions/{questionId}
 *   subjects/{subjectId}/bosses/{bossId}
 *   dungeons/{dungeonId}
 *   mockExams/{examId}                (simulados)
 *   mockExams/{examId}/questions/{questionId}
 *   rankings/{period}                 (global | monthly | weekly)
 *   npcs/{npcId}
 *   mapAreas/{areaId}
 */

// ---------------------------------------------------------------------------
// Usuário / Personagem
// ---------------------------------------------------------------------------

export type AuthProvider = "google" | "password";

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL?: string;
  authProvider: AuthProvider;
  createdAt: string; // ISO
  updatedAt: string;

  // RPG / progresso
  level: number;
  currentXP: number; // XP dentro do nível atual
  totalXP: number; // XP acumulado histórico
  title: string; // título ativo (ex.: "Aventureiro")
  classe?: string; // "classe" de personagem, opcional (ex.: "Mago da Lógica")

  // Estatísticas agregadas (denormalizadas para o dashboard ser rápido)
  stats: UserStats;

  // Sequência de dias estudando
  streak: {
    current: number;
    longest: number;
    lastStudyDate: string | null; // ISO date (yyyy-MM-dd)
  };

  role: "student" | "admin";
}

export interface UserStats {
  totalStudyMinutes: number;
  totalSessions: number;
  subjectsCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  accuracyRate: number; // 0-100, derivado, recalculado a cada resposta
  lessonsCompleted: number;
  bossesDefeated: number;
}

export interface UserSettings {
  theme: "dark" | "light" | "system";
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  dailyGoalMinutes: number;
  language: "pt-BR";
}

// ---------------------------------------------------------------------------
// Sessões de estudo / XP / Nível (cronômetro)
// ---------------------------------------------------------------------------

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  moduleId?: string;
  lessonId?: string;
  startedAt: string; // ISO
  endedAt: string | null; // null enquanto em andamento
  durationSeconds: number; // atualizado incrementalmente
  xpEarned: number;
  date: string; // yyyy-MM-dd, para agregações por dia
  source: "timer" | "lesson" | "exercise" | "mockExam" | "boss";
}

export type XPSourceType =
  | "study_time" // cada N minutos estudando
  | "correct_answer"
  | "lesson_completed"
  | "module_completed"
  | "boss_defeated"
  | "daily_quest"
  | "weekly_quest"
  | "achievement"
  | "mock_exam";

export interface XPHistoryEntry {
  id: string;
  userId: string;
  amount: number;
  source: XPSourceType;
  refId?: string; // id da sessão/questão/lição relacionada
  createdAt: string; // ISO
  levelAtTime: number;
}

export interface LevelHistoryEntry {
  id: string;
  userId: string;
  level: number;
  reachedAt: string; // ISO
  unlockedItemIds: string[];
  unlockedPetIds: string[];
  unlockedTitleIds: string[];
  unlockedAreaIds: string[];
  unlockedDungeonIds: string[];
}

// ---------------------------------------------------------------------------
// Conteúdo pedagógico (100% dinâmico — criado pelo admin)
// ---------------------------------------------------------------------------

export interface Subject {
  id: string;
  name: string; // ex.: "Álgebra"
  dungeonTitle: string; // ex.: "Fortaleza da Álgebra"
  description: string;
  icon: string; // nome do ícone (material symbols) ou url
  color: string; // token de cor tailwind
  order: number;
  totalModules: number; // denormalizado
  isPublished: boolean;
  createdBy: string; // uid do admin
  createdAt: string;
  updatedAt: string;
}

export interface SubjectModule {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  order: number;
  requiredLevel?: number;
  totalLessons: number; // denormalizado
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Lesson {
  id: string;
  subjectId: string;
  moduleId: string;
  title: string;
  content: string; // markdown/rich text
  videoURL?: string;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  totalQuestions: number; // denormalizado
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type QuestionType = "multiple_choice" | "true_false" | "open_text";

export interface Question {
  id: string;
  subjectId: string;
  moduleId: string;
  lessonId?: string; // ausente quando pertence só a um simulado
  mockExamId?: string;
  type: QuestionType;
  statement: string;
  options?: { id: string; text: string }[]; // para multiple_choice
  correctOptionId?: string;
  correctBoolean?: boolean;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserAnswer {
  id: string;
  userId: string;
  questionId: string;
  subjectId: string;
  selectedOptionId?: string;
  selectedBoolean?: boolean;
  isCorrect: boolean;
  xpEarned: number;
  answeredAt: string;
  timeSpentSeconds: number;
}

export interface MockExam {
  id: string;
  title: string;
  description: string;
  subjectIds: string[]; // simulados podem misturar matérias
  totalQuestions: number;
  durationMinutes: number;
  xpReward: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// RPG: personagem, inventário, equipamentos, pets, bosses
// ---------------------------------------------------------------------------

export type EquipmentSlot = "weapon" | "armor" | "helmet" | "accessory" | "mount";
export type ItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: ItemRarity;
  slot?: EquipmentSlot; // presente se for equipável
  requiredLevel: number;
  statBonuses?: Record<string, number>; // ex.: { foco: 5, memoria: 3 }
}

export interface InventoryItem {
  id: string; // = itemDefinitionId
  userId: string;
  itemId: string;
  quantity: number;
  acquiredAt: string;
  equipped: boolean;
}

export interface PetDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredLevel: number;
  rarity: ItemRarity;
}

export interface UserPet {
  id: string;
  userId: string;
  petId: string;
  nickname?: string;
  level: number;
  isActive: boolean; // pet atualmente acompanhando o personagem
  acquiredAt: string;
}

export interface Boss {
  id: string;
  subjectId: string;
  name: string; // ex.: "O Guardião da Matriz"
  description: string;
  icon: string;
  requiredModuleIds: string[]; // módulos que precisam estar completos
  questionIds: string[]; // banco de questões do confronto
  xpReward: number;
  itemRewardIds: string[];
}

export interface UserBossDefeat {
  id: string;
  userId: string;
  bossId: string;
  defeatedAt: string;
  score: number;
}

export interface Dungeon {
  id: string;
  subjectId: string;
  title: string;
  requiredLevel: number;
  order: number;
  isUnlockedByDefault: boolean;
}

// ---------------------------------------------------------------------------
// Cidade e Fazenda (evoluem com XP / horas estudadas)
// ---------------------------------------------------------------------------

export interface CityBuilding {
  id: string;
  name: string;
  requiredLevel: number;
  icon: string;
}

export interface CityState {
  userId: string;
  unlockedBuildingIds: string[];
  cityLevel: number; // derivado do nível do usuário
  updatedAt: string;
}

export interface FarmState {
  userId: string;
  growthStage: number; // 0-N, avança a cada hora estudada
  totalStudyHoursInvested: number;
  lastGrowthAt: string;
  unlockedCropIds: string[];
}

// ---------------------------------------------------------------------------
// NPCs e mapa
// ---------------------------------------------------------------------------

export interface NPC {
  id: string;
  name: string;
  areaId: string;
  dialogueLines: string[];
  role: "mentor" | "merchant" | "quest_giver";
}

export interface MapArea {
  id: string;
  name: string;
  requiredLevel: number;
  x: number;
  y: number;
  linkedSubjectId?: string;
}

// ---------------------------------------------------------------------------
// Conquistas, títulos, missões, ranking, notificações
// ---------------------------------------------------------------------------

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: "streak" | "totalXP" | "questionsAnswered" | "bossesDefeated" | "subjectsCompleted";
    value: number;
  };
  xpReward: number;
}

export interface UserAchievement {
  id: string; // = achievementDefinitionId
  userId: string;
  unlockedAt: string;
}

export interface TitleDefinition {
  id: string;
  name: string; // ex.: "Aventureiro", "Mestre da Álgebra"
  requiredLevel?: number;
  requiredAchievementId?: string;
}

export type QuestStatus = "pending" | "completed" | "expired";

export interface DailyQuest {
  id: string;
  userId: string;
  date: string; // yyyy-MM-dd
  title: string;
  description: string;
  goal: { type: "study_minutes" | "questions_answered" | "lessons_completed"; target: number };
  progress: number;
  xpReward: number;
  status: QuestStatus;
}

export interface WeeklyQuest {
  id: string;
  userId: string;
  weekStart: string; // yyyy-MM-dd (segunda-feira)
  title: string;
  description: string;
  goal: { type: "study_minutes" | "questions_answered" | "bosses_defeated"; target: number };
  progress: number;
  xpReward: number;
  status: QuestStatus;
}

export type RankingPeriod = "global" | "monthly" | "weekly";

export interface RankingEntry {
  userId: string;
  username: string;
  photoURL?: string;
  level: number;
  totalXP: number;
  position: number;
}

export interface NotificationDoc {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: "level_up" | "achievement" | "quest" | "system" | "ranking";
  read: boolean;
  createdAt: string;
}
