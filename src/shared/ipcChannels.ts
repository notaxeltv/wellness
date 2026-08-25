// Nomi dei canali IPC condivisi tra processo main e preload.
export const IpcChannels = {
  appGetInfo: 'app:get-info',

  settingsGet: 'settings:get',
  settingsUpdate: 'settings:update',

  exercisesList: 'exercises:list',

  workoutPlansList: 'workouts:list-plans',
  workoutPlanGet: 'workouts:get-plan',
  workoutSessionsList: 'workouts:list-sessions',
  workoutSessionCreate: 'workouts:create-session',
  workoutSessionDelete: 'workouts:delete-session',

  nutritionGetMeals: 'nutrition:get-meals',
  nutritionSetMealCompleted: 'nutrition:set-meal-completed',
  nutritionUpdateMealNote: 'nutrition:update-meal-note',
  nutritionUpdateMealDetails: 'nutrition:update-meal-details',

  progressList: 'progress:list',
  progressUpsert: 'progress:upsert',
  progressDelete: 'progress:delete',

  dashboardGetStats: 'dashboard:get-stats',
  dashboardGetWeeklyActivity: 'dashboard:get-weekly-activity',

  chatGetMessages: 'chat:get-messages',
  chatAddMessage: 'chat:add-message',
  chatClear: 'chat:clear',
  chatListConversations: 'chat:list-conversations',

  ollamaCheckStatus: 'ollama:check-status',
  ollamaChatStart: 'ollama:chat-start',
  ollamaChatCancel: 'ollama:chat-cancel',
  ollamaChatChunk: 'ollama:chat-chunk',
} as const;

export type IpcChannel = (typeof IpcChannels)[keyof typeof IpcChannels];
