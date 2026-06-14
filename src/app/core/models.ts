export type UserRole = 'superuser' | 'admin' | 'tuteur' | 'eleve' | 'parent';
export type AccountStatus = 'Actif' | 'Suspendu' | 'Désactivé' | 'En attente';
export type CourseMode = 'En ligne' | 'Présentiel' | 'Hybride';
export type SessionStatus = 'Programmée' | 'Prévue' | 'Confirmée' | 'Terminée' | 'Annulée';
export type RequestStatus = 'Nouvelle' | 'Disponible' | 'Assignée' | 'En cours' | 'Terminée' | 'Annulée' | 'Archivée' | 'Fermée';
export type HomeworkStatus = 'Soumis' | 'En correction' | 'Corrigé' | 'À revoir';
export type DocumentStatus = 'En attente' | 'Validé' | 'Refusé';
export type FollowUpStatus = 'Brouillon' | 'Envoyé' | 'Archivé';
export type PaymentStatus = 'Payé' | 'En attente';
export type BillingDocumentKind = 'Facture parent' | 'Relevé tuteur';
export type BillingDocumentStatus = 'Brouillon' | 'Généré' | 'Soumis';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  role: UserRole;
  status: AccountStatus;
  avatarUrl?: string;
  level?: string;
  grade?: string;
  school?: string;
  subjects?: string[];
  needs?: string[];
  objective?: string;
  difficulties?: string;
  availability?: string;
  preferredMode?: CourseMode | 'Les deux';
  parentId?: string;
  tutorId?: string;
  biography?: string;
  languages?: string[];
  hourlyRate?: number;
  parentHourlyRate?: number;
  tutorHourlyRate?: number;
  diploma?: string;
  experience?: string;
  teachingLevels?: string[];
  profileStatus?: 'Actif' | 'Suspendu';
  communicationPreference?: string;
  temporaryPassword?: string;
}

export interface TutorRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  parentEmail?: string;
  phone?: string;
  level: string;
  grade?: string;
  school?: string;
  subject: string;
  city: string;
  mode: CourseMode | 'Les deux';
  availability: string;
  objective: string;
  difficulties: string;
  specialNeed?: string;
  hourlyRate: number;
  hoursPerWeek: number;
  desiredStartDate: string;
  comment?: string;
  status: RequestStatus;
  assignedTutorId?: string;
  createdAt: string;
  internalNote?: string;
}

export interface Session {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: CourseMode;
  meetingLink?: string;
  address?: string;
  note?: string;
  status: SessionStatus;
}

export interface Homework {
  id: string;
  studentId: string;
  tutorId: string;
  title: string;
  subject: string;
  description?: string;
  submittedAt: string;
  fileNames: string[];
  status: HomeworkStatus;
  tutorComment?: string;
  correctedFileNames?: string[];
  returnedAt?: string;
}

export interface AppDocument {
  id: string;
  title: string;
  category: string;
  ownerId: string;
  ownerRole: UserRole;
  relatedStudentId?: string;
  relatedTutorId?: string;
  fileName: string;
  sizeKb: number;
  addedAt: string;
  visibility: 'Admin seulement' | 'Tuteur concerné' | 'Parent concerné' | 'Élève concerné' | 'Partagé';
  verificationStatus?: DocumentStatus;
  refusalReason?: string;
  archived?: boolean;
}

export interface FollowUp {
  id: string;
  studentId: string;
  tutorId: string;
  parentId?: string;
  sessionId?: string;
  subject: string;
  sessionDate: string;
  notions: string;
  progress: string;
  difficulties: string;
  homework: string;
  generalComment: string;
  understandingPercent: number;
  homeworkPercent: number;
  participation: 'Faible' | 'Moyenne' | 'Bonne' | 'Excellente';
  status: FollowUpStatus;
  sentAt?: string;
}

export interface Payment {
  id: string;
  userEmail: string;
  type: string;
  amount: number;
  date: string;
  reference?: string;
  status: PaymentStatus;
}

export interface BillingDocument {
  id: string;
  kind: BillingDocumentKind;
  status: BillingDocumentStatus;
  title: string;
  recipientId: string;
  recipientEmail: string;
  studentId?: string;
  tutorId?: string;
  period: string;
  total: number;
  generatedAt: string;
  submittedAt?: string;
  lines: BillingSessionLine[];
}

export interface BillingPreview {
  parentInvoice: {
    parentId?: string;
    parentName: string;
    parentEmail?: string;
    studentName: string;
    tutorName: string;
    period: string;
    sessions: BillingSessionLine[];
    total: number;
  };
  tutorStatement: {
    tutorId: string;
    tutorEmail?: string;
    tutorName: string;
    period: string;
    sessions: BillingSessionLine[];
    totalHours: number;
    total: number;
  };
}

export interface BillingSessionLine {
  date: string;
  subject: string;
  studentName: string;
  durationHours: number;
  tutorRate: number;
  parentRate: number;
  tutorAmount: number;
  parentAmount: number;
}

export type ActivityActionType =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'VIEW'
  | 'SUBMIT'
  | 'DOWNLOAD'
  | 'STATUS_CHANGE'
  | 'IMPERSONATE';

export type ActivityModule =
  | 'USERS'
  | 'BILLING'
  | 'DOCUMENTS'
  | 'SESSIONS'
  | 'HOMEWORK'
  | 'FOLLOWUPS'
  | 'PAYMENTS'
  | 'ADMIN';

export interface ActivityLog {
  id: string;
  actorUserId?: string;
  actorName: string;
  actorRole: string;
  actionType: ActivityActionType;
  module: ActivityModule;
  targetUserId?: string;
  targetName: string;
  description: string;
  createdAt: string;
}

export interface CreateActivityLogPayload {
  actorUserId?: string;
  actorName: string;
  actorRole: string;
  actionType: ActivityActionType;
  module: ActivityModule;
  targetUserId?: string;
  targetName: string;
  description: string;
}

export interface ActivityLogFilters {
  startDate?: string;
  endDate?: string;
  actorUserId?: string;
  actionType?: string;
  module?: string;
  search?: string;
}
