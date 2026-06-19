import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AppState, initialState } from './mock-data';
import { AppDocument, BillingDocument, BillingPreview, BillingSessionLine, FollowUp, Homework, Payment, PaymentStatus, RequestStatus, Session, SessionStatus, TutorRequest, User, UserRole,ActivityLog,ActivityLogFilters, CreateActivityLogPayload} from './models';
import { HttpClient, HttpParams } from '@angular/common/http';

const STORAGE_KEY = 'etude-reussie-frontend-state-v3';
const CURRENT_USER_KEY = 'etude-reussie-current-user-id';
const API_BASE_URL = '/https://api.etudereussie.ca/api';
const IMPERSONATOR_USER_KEY = 'etude-reussie-impersonator-user-id';
const IMPERSONATION_RETURN_URL_KEY = 'etude-reussie-impersonation-return-url';
const emptyState: AppState = {
  users: [],
  requests: [],
  sessions: [],
  homework: [],
  documents: [],
  followUps: [],
  payments: [],
  billingDocuments: []
};
@Injectable({ providedIn: 'root' })
export class AppDataService {
  private state: AppState = this.loadState();
  private lastBillingRequest?: { tutorId: string; studentId: string | 'all'; start: string; end: string; tutorRate?: number; parentRate?: number };

  constructor(private readonly http: HttpClient) {}

  async initialize(): Promise<void> {
    await this.reloadFromBackend();
  }

async login(email: string, password: string): Promise<User | undefined> {
  try {
    const response = await firstValueFrom(
      this.http.post<{ token: string; user: User }>(
        `${API_BASE_URL}/auth/login`,
        { email, password }
      )
    );

    sessionStorage.removeItem(IMPERSONATOR_USER_KEY);
    sessionStorage.removeItem(IMPERSONATION_RETURN_URL_KEY);

    sessionStorage.setItem(CURRENT_USER_KEY, response.user.id);

    await this.reloadFromBackend();

    this.upsertUser(response.user);
    this.save();

    sessionStorage.setItem(CURRENT_USER_KEY, response.user.id);

    console.log('Utilisateur connecté frontend :', response.user);

    return response.user;
  } catch (error) {
    console.error('Erreur login frontend', error);
    return undefined;
  }
}

  get users(): User[] { return this.state.users; }
  get requests(): TutorRequest[] { return this.state.requests; }
  get sessions(): Session[] { return this.state.sessions; }
  get homework(): Homework[] { return this.state.homework; }
  get documents(): AppDocument[] { return this.state.documents.filter((document) => !document.archived); }
  get allDocuments(): AppDocument[] { return this.state.documents; }
  get followUps(): FollowUp[] { return this.state.followUps.filter((followUp) => followUp.status !== 'Archivé'); }
  get allFollowUps(): FollowUp[] { return this.state.followUps; }
  get payments(): Payment[] { return this.state.payments; }
  get billingDocuments(): BillingDocument[] { return this.state.billingDocuments ?? []; }

  resetDemo(): void {
    this.state = structuredClone(initialState);
    sessionStorage.removeItem(CURRENT_USER_KEY);
    this.save();
  }

  getUser(id: string): User | undefined {
  return this.state.users.find((user) => user.id === id);
}

getUsersByRole(role: UserRole): User[] {
  return this.state.users.filter((user) => user.role === role);
}

getDisplayName(id: string): string {
  const user = this.getUser(id);
  return user ? `${user.firstName} ${user.lastName}` : 'Non défini';
}

getCurrentUser(): User | undefined {
  const currentId = sessionStorage.getItem(CURRENT_USER_KEY);

  if (!currentId) {
    return undefined;
  }

  return this.getUser(currentId);
}

private getCurrentUserForRole(role: UserRole): User | undefined {
  const currentUser = this.getCurrentUser();

  if (currentUser?.role === role) {
    return currentUser;
  }

  return undefined;
}

getSuperUser(): User {
  return this.requireCurrentUserRole('superuser');
}

getAdmin(): User {
  return this.requireCurrentUserRole('admin');
}

getTutor(): User {
  return this.requireCurrentUserRole('tuteur');
}

getStudent(): User {
  return this.requireCurrentUserRole('eleve');
}

getParent(): User {
  return this.requireCurrentUserRole('parent');
}

private requireCurrentUserRole(role: UserRole): User {
  const currentUser = this.getCurrentUser();

  if (!currentUser) {
    throw new Error(`Aucun utilisateur connecté pour le rôle ${role}.`);
  }

  if (currentUser.role !== role) {
    throw new Error(
      `Utilisateur connecté avec mauvais rôle. Connecté=${currentUser.role}, attendu=${role}.`
    );
  }

  return currentUser;
}

  getParentForStudent(studentId: string): User | undefined {
    const student = this.getUser(studentId);
    return student?.parentId ? this.getUser(student.parentId) : undefined;
  }

  getTutorForStudent(studentId: string): User | undefined {
    const student = this.getUser(studentId);
    return student?.tutorId ? this.getUser(student.tutorId) : undefined;
  }

  getChildrenForParent(parentId: string): User[] {
    return this.state.users.filter((user) => user.role === 'eleve' && user.parentId === parentId);
  }

  getStudentsForTutor(tutorId: string): User[] {
    return this.state.users.filter((user) => user.role === 'eleve' && user.tutorId === tutorId);
  }

  getSessionsForStudent(studentId: string): Session[] {
    return this.state.sessions.filter((session) => session.studentId === studentId);
  }

  getSessionsForTutor(tutorId: string): Session[] {
    return this.state.sessions.filter((session) => session.tutorId === tutorId);
  }

  getSessionsForParent(parentId: string): Session[] {
    const ids = this.getChildrenForParent(parentId).map((student) => student.id);
    return this.state.sessions.filter((session) => ids.includes(session.studentId));
  }

  getUpcomingSessions(sessions: Session[], limit = 5): Session[] {
    const today = new Date().toISOString().slice(0, 10);
    return sessions
      .filter((session) => session.date >= today && session.status !== 'Annulée')
      .sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`))
      .slice(0, limit);
  }

  getHomeworkForStudent(studentId: string): Homework[] {
    return this.state.homework.filter((homework) => homework.studentId === studentId);
  }

  getHomeworkForTutor(tutorId: string): Homework[] {
    return this.state.homework.filter((homework) => homework.tutorId === tutorId);
  }

  getHomeworkForParent(parentId: string): Homework[] {
    const ids = this.getChildrenForParent(parentId).map((student) => student.id);
    return this.state.homework.filter((homework) => ids.includes(homework.studentId));
  }

  getDocumentsForOwner(ownerId: string): AppDocument[] {
    return this.documents.filter((document) => document.ownerId === ownerId);
  }

  getDocumentsForStudentVisibleToTutor(studentId: string, tutorId: string): AppDocument[] {
    return this.documents.filter((document) => document.relatedStudentId === studentId && (document.visibility === 'Partagé' || document.relatedTutorId === tutorId));
  }

  getDocumentsForParent(parentId: string): AppDocument[] {
    const childrenIds = this.getChildrenForParent(parentId).map((student) => student.id);
    return this.documents.filter((document) => document.ownerId === parentId || childrenIds.includes(document.relatedStudentId ?? '') || document.visibility === 'Parent concerné');
  }

  getFollowUpsForStudent(studentId: string): FollowUp[] {
    return this.followUps.filter((followUp) => followUp.studentId === studentId);
  }

  getFollowUpsForTutor(tutorId: string): FollowUp[] {
    return this.followUps.filter((followUp) => followUp.tutorId === tutorId);
  }

  getFollowUpsForParent(parentId: string): FollowUp[] {
    const ids = this.getChildrenForParent(parentId).map((student) => student.id);
    return this.followUps.filter((followUp) => followUp.parentId === parentId || ids.includes(followUp.studentId));
  }

  getAvailableRequestsForTutor(tutorId: string): TutorRequest[] {
    const tutor = this.getUser(tutorId);
    if (!tutor) return [];
    const subjects = tutor.subjects ?? [];
    return this.state.requests.filter((request) =>
      ['Nouvelle', 'Disponible'].includes(request.status) && (subjects.length === 0 || subjects.includes(request.subject))
    );
  }

  addUser(payload: Omit<User, 'id'>): User {
    const created: User = { ...payload, id: `${payload.role}-${Date.now()}` };
    this.state.users.unshift(created);
    this.save();
    void this.postAndReload('/users', this.toUserRequest(created));
    return created;
  }

  updateUser(user: User): void {
    this.state.users = this.state.users.map((item) => item.id === user.id ? { ...user } : item);
    this.save();
    void this.putAndReload(`/users/${user.id}`, this.toUserRequest(user));
  }

  linkParentToStudent(studentId: string, parentEmail: string): boolean {
  const student = this.getUser(studentId);

  if (!student || student.role !== 'eleve') {
    alert("L'utilisateur sélectionné n'est pas un élève.");
    return false;
  }

  const normalizedEmail = parentEmail.trim().toLowerCase();

  if (!normalizedEmail) {
    student.parentId = undefined;

    this.state.followUps = this.state.followUps.map((followUp) => {
      if (followUp.studentId !== studentId) {
        return followUp;
      }

      return {
        ...followUp,
        parentId: undefined
      };
    });

    this.save();
    void this.patchAndReload(`/users/${studentId}/parent`, { parentEmail: '' });
    return true;
  }

  const parent = this.state.users.find((user) =>
    user.role === 'parent' &&
    user.email.toLowerCase() === normalizedEmail
  );

  if (!parent) {
    alert("Aucun parent trouvé avec ce courriel. Créez d'abord le compte parent.");
    return false;
  }

  student.parentId = parent.id;

  this.state.followUps = this.state.followUps.map((followUp) => {
    if (followUp.studentId !== studentId) {
      return followUp;
    }

    return {
      ...followUp,
      parentId: parent.id
    };
  });

  this.save();
  void this.patchAndReload(`/users/${studentId}/parent`, { parentEmail: normalizedEmail });

  return true;
}

  setUserStatus(userId: string, status: User['status']): void {
    const user = this.getUser(userId);
    if (user) {
      user.status = status;
      this.save();

          void this.recordActivity({
      actionType: 'STATUS_CHANGE',
      module: 'USERS',
      targetUserId: user.id,
      targetName: `${user.firstName} ${user.lastName}`,
      description: `Statut du compte modifié : ${user.firstName} ${user.lastName} est maintenant ${status}.`
    });

      void this.patchAndReload(`/users/${userId}/status`, { status });
    }
  }

  deleteUser(userId: string): void {
  const user = this.getUser(userId);

  if (!user) {
    return;
  }

  if (user.role === 'superuser') {
    alert('Le super user ne peut pas être supprimé depuis l’espace admin.');
    return;
  }

    void this.recordActivity({
    actionType: 'DELETE',
    module: 'USERS',
    targetUserId: user.id,
    targetName: `${user.firstName} ${user.lastName}`,
    description: `Compte supprimé : ${user.firstName} ${user.lastName} (${user.email}) - rôle : ${user.role}.`
  });

  this.state.users = this.state.users
    .filter((item) => item.id !== userId)
    .map((item) => ({
      ...item,
      parentId: item.parentId === userId ? undefined : item.parentId,
      tutorId: item.tutorId === userId ? undefined : item.tutorId
    }));

  this.state.sessions = this.state.sessions
    .filter((session) => session.studentId !== userId && session.tutorId !== userId);

  this.state.homework = this.state.homework
    .filter((homework) => homework.studentId !== userId && homework.tutorId !== userId);

  this.state.followUps = this.state.followUps
    .filter((followUp) =>
      followUp.studentId !== userId &&
      followUp.tutorId !== userId &&
      followUp.parentId !== userId
    );

  this.state.documents = this.state.documents
    .filter((document) =>
      document.ownerId !== userId &&
      document.relatedStudentId !== userId &&
      document.relatedTutorId !== userId
    );

  this.state.payments = this.state.payments
    .filter((payment) => payment.userEmail.toLowerCase() !== user.email.toLowerCase());

  this.state.billingDocuments = (this.state.billingDocuments ?? [])
    .filter((document) =>
      document.recipientId !== userId &&
      document.studentId !== userId &&
      document.tutorId !== userId
    );

  this.state.requests = this.state.requests
    .filter((request) => {
      if (user.role !== 'eleve') {
        return true;
      }

      return request.studentEmail.toLowerCase() !== user.email.toLowerCase();
    })
    .map((request) => {
      if (request.assignedTutorId !== userId) {
        return request;
      }

      return {
        ...request,
        assignedTutorId: undefined,
        status: 'Nouvelle'
      };
    });

  sessionStorage.removeItem('etude-reussie-current-user-id');

  this.save();

  void this.deleteAndReload(`/users/${userId}`);
}

  createRequest(payload: Omit<TutorRequest, 'id' | 'createdAt'>): TutorRequest {
    const request: TutorRequest = { ...payload, id: `request-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) };
    this.state.requests.unshift(request);
    this.save();
    void this.postAndReload('/requests', request);
    return request;
  }

  changeRequestStatus(requestId: string, status: RequestStatus): void {
    const request = this.state.requests.find((item) => item.id === requestId);
    if (request) {
      request.status = status;
      this.save();

        void this.recordActivity({
        actionType: 'STATUS_CHANGE',
        module: 'ADMIN',
        targetName: request.studentName,
        description: `Statut de la demande modifié : ${request.studentName} - ${request.subject} est maintenant ${status}.`
      });

      void this.patchAndReload(`/requests/${requestId}/status`, { status });
    }
  }

  assignRequest(requestId: string, tutorId: string): void {
    const request = this.state.requests.find((item) => item.id === requestId);
    const tutor = this.getUser(tutorId);
    if (!request || !tutor) return;
    request.assignedTutorId = tutorId;
    request.status = 'Assignée';
    const existingStudent = this.state.users.find((user) => user.email === request.studentEmail && user.role === 'eleve');
    if (existingStudent) {
      existingStudent.tutorId = tutorId;
      existingStudent.subjects = Array.from(new Set([...(existingStudent.subjects ?? []), request.subject]));
      existingStudent.parentHourlyRate = existingStudent.parentHourlyRate ?? request.hourlyRate;
      existingStudent.tutorHourlyRate = existingStudent.tutorHourlyRate ?? tutor.hourlyRate ?? request.hourlyRate;
    } else {
      this.state.users.push({
        id: `student-${Date.now()}`,
        firstName: request.studentName.split(' ')[0] ?? request.studentName,
        lastName: request.studentName.split(' ').slice(1).join(' ') || 'À compléter',
        email: request.studentEmail,
        phone: request.phone,
        city: request.city,
        role: 'eleve',
        status: 'Actif',
        level: request.level,
        grade: request.grade,
        school: request.school,
        subjects: [request.subject],
        needs: [request.subject],
        objective: request.objective,
        difficulties: request.difficulties,
        availability: request.availability,
        preferredMode: request.mode,
        tutorId,
        parentHourlyRate: request.hourlyRate,
        tutorHourlyRate: tutor.hourlyRate ?? request.hourlyRate
      });
    }
    this.save();

    void this.recordActivity({
    actionType: 'UPDATE',
    module: 'ADMIN',
    targetUserId: tutor.id,
    targetName: request.studentName,
    description: `Demande assignée : ${request.studentName} (${request.subject}) a été assigné au tuteur ${tutor.firstName} ${tutor.lastName}.`
  });

    void this.postAndReload(`/requests/${requestId}/assign`, { tutorId });
  }

  removeAssignment(requestId: string): void {
    const request = this.state.requests.find((item) => item.id === requestId);
    if (!request) return;
    const previousTutor = request.assignedTutorId;
    request.assignedTutorId = undefined;
    request.status = 'Nouvelle';
    this.state.users
      .filter((user) => user.role === 'eleve' && user.email === request.studentEmail && user.tutorId === previousTutor)
      .forEach((student) => student.tutorId = undefined);
    this.save();
    void this.deleteAndReload(`/requests/${requestId}/assignment`);
  }

  async addSession(payload: Omit<Session, 'id'>): Promise<Session | undefined> {
  const request = {
    studentId: payload.studentId,
    tutorId: payload.tutorId,
    subject: payload.subject,
    date: payload.date,
    startTime: this.normalizeTime(payload.startTime),
    endTime: this.normalizeTime(payload.endTime),
    mode: payload.mode,
    meetingLink: payload.meetingLink ?? '',
    address: payload.address ?? '',
    note: payload.note ?? '',
    status: payload.status ?? 'Programmée'
  };

  console.log('Requête envoyée à /api/sessions :', request);

  if (!this.isGuid(request.studentId)) {
    alert("Erreur : l'identifiant de l'élève n'est pas valide. L'élève doit venir de la base de données.");
    console.error('StudentId invalide :', request.studentId);
    return undefined;
  }

  if (!this.isGuid(request.tutorId)) {
    alert("Erreur : l'identifiant du tuteur n'est pas valide. Le tuteur doit venir de la base de données.");
    console.error('TutorId invalide :', request.tutorId);
    return undefined;
  }

  if (!request.date) {
    alert('Erreur : la date de la séance est obligatoire.');
    return undefined;
  }

  try {
    const created = await firstValueFrom(
      this.http.post<Session>(`${API_BASE_URL}/sessions`, request)
    );

    await this.reloadFromBackend();

     await this.recordActivity({
      actionType: 'CREATE',
      module: 'SESSIONS',
      targetUserId: request.studentId,
      targetName: this.getDisplayName(request.studentId),
      description: `Séance créée pour ${this.getDisplayName(request.studentId)} avec ${this.getDisplayName(request.tutorId)} en ${request.subject}, le ${request.date} de ${request.startTime} à ${request.endTime}.`
    });
      void this.recordActivity({
    actionType: 'CREATE',
    module: 'SESSIONS',
    targetUserId: request.studentId,
    targetName: this.getDisplayName(request.studentId),
    description: `Séance créée en ${request.subject} le ${request.date} de ${request.startTime} à ${request.endTime}.`
  });
    return created;
  } catch (error: any) {
    console.error('Erreur création séance en BD', error);
    console.error('Détail backend :', error?.error);
    alert("Impossible d'enregistrer la séance dans la base de données. Vérifiez les champs de la séance.");
    return undefined;
  }
}

async updateSessionStatus(sessionId: string, status: SessionStatus): Promise<void> {
  if (!this.isGuid(sessionId)) {
    alert("Erreur : cette séance n'a pas un identifiant valide en base de données.");
    console.error('SessionId invalide :', sessionId);
    return;
  }

  try {
    await firstValueFrom(
      this.http.patch(`${API_BASE_URL}/sessions/${sessionId}/status`, { status })
    );

    await this.reloadFromBackend();
    void this.recordActivity({
    actionType: 'STATUS_CHANGE',
    module: 'SESSIONS',
    targetName: sessionId,
    description: `Statut de la séance modifié : ${status}.`
  });
  } catch (error: any) {
    console.error('Erreur modification statut séance en BD', error);
    console.error('Détail backend :', error?.error);
    alert("Impossible de modifier le statut de la séance dans la base de données.");
  }
}

async updateSession(session: Session): Promise<void> {
  if (!this.isGuid(session.id)) {
    alert("Erreur : cette séance n'a pas un identifiant valide en base de données.");
    console.error('SessionId invalide :', session.id);
    return;
  }

  const request = {
    studentId: session.studentId,
    tutorId: session.tutorId,
    subject: session.subject,
    date: session.date,
    startTime: this.normalizeTime(session.startTime),
    endTime: this.normalizeTime(session.endTime),
    mode: session.mode,
    meetingLink: session.meetingLink ?? '',
    address: session.address ?? '',
    note: session.note ?? '',
    status: session.status
  };

  try {
    await firstValueFrom(
      this.http.put(`${API_BASE_URL}/sessions/${session.id}`, request)
    );

    await this.reloadFromBackend();

    void this.recordActivity({
      actionType: 'UPDATE',
      module: 'SESSIONS',
      targetUserId: session.studentId,
      targetName: this.getDisplayName(session.studentId),
      description: `Séance modifiée : ${session.subject} le ${session.date} de ${session.startTime} à ${session.endTime}.`
    });
  } catch (error: any) {
    console.error('Erreur modification séance en BD', error);
    console.error('Détail backend :', error?.error);
    alert("Impossible de modifier la séance dans la base de données.");
  }
}

private isGuid(value?: string): boolean {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

private normalizeTime(value: string): string {
  if (!value) {
    return '00:00:00';
  }

  return value.length === 5 ? `${value}:00` : value;
}

  calculateDurationHours(session: Session): number {
    const [startHour, startMinute] = session.startTime.split(':').map(Number);
    const [endHour, endMinute] = session.endTime.split(':').map(Number);
    const minutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    return Math.max(minutes / 60, 0);
  }

  getParentRateForStudent(studentId: string): number {
    const student = this.getUser(studentId);
    return student?.parentHourlyRate ?? 45;
  }

  getTutorRateForSession(session: Session): number {
    const student = this.getUser(session.studentId);
    const tutor = this.getUser(session.tutorId);
    return student?.tutorHourlyRate ?? tutor?.hourlyRate ?? 30;
  }

  submitHomework(payload: Omit<Homework, 'id' | 'submittedAt' | 'status'>): Homework {
    const created: Homework = { ...payload, id: `homework-${Date.now()}`, submittedAt: new Date().toISOString().slice(0, 10), status: 'Soumis' };
    this.state.homework.unshift(created);
    this.save();
    void this.postAndReload('/homework', created);
    return created;
  }

  async submitHomeworkWithFiles(payload: {
  studentId: string;
  tutorId: string;
  title: string;
  subject: string;
  description?: string;
  files: File[];
}): Promise<Homework | undefined> {
  const formData = new FormData();

  formData.append('studentId', payload.studentId);
  formData.append('tutorId', payload.tutorId);
  formData.append('title', payload.title);
  formData.append('subject', payload.subject);
  formData.append('description', payload.description ?? '');

  payload.files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const created = await firstValueFrom(
      this.http.post<Homework>(`${API_BASE_URL}/homework/submit`, formData)
    );

    await this.reloadFromBackend();

        void this.recordActivity({
      actionType: 'CREATE',
      module: 'HOMEWORK',
      targetUserId: payload.studentId,
      targetName: this.getDisplayName(payload.studentId),
      description: `Devoir envoyé à ${this.getDisplayName(payload.studentId)} : ${payload.title} (${payload.subject}).`
    });
    return created;
  } catch (error) {
    console.error('Erreur upload devoir', error);
    alert("Impossible d'envoyer le devoir. Vérifiez le backend.");
    return undefined;
  }
}

async returnCorrectedHomeworkWithFiles(
  homeworkId: string,
  files: File[],
  tutorComment: string
): Promise<Homework | undefined> {
  const formData = new FormData();

  formData.append('tutorComment', tutorComment);

  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const updated = await firstValueFrom(
      this.http.post<Homework>(`${API_BASE_URL}/homework/${homeworkId}/correction`, formData)
    );

    await this.reloadFromBackend();

    const homework = this.state.homework.find((item) => item.id === homeworkId);

    void this.recordActivity({
      actionType: 'UPDATE',
      module: 'HOMEWORK',
      targetUserId: homework?.studentId,
      targetName: homework ? this.getDisplayName(homework.studentId) : homeworkId,
      description: `Correction déposée pour le devoir : ${homework?.title ?? homeworkId}.`
    });

    return updated;
  } catch (error) {
    console.error('Erreur dépôt correction', error);
    alert("Impossible de déposer le document corrigé.");
    return undefined;
  }
}

deleteHomework(homeworkId: string): void {
  this.state.homework = this.state.homework.filter((item) => item.id !== homeworkId);
  this.save();
  void this.deleteAndReload(`/homework/${homeworkId}`);
}

deleteAllHomework(): void {
  this.state.homework = [];
  this.save();
  void this.deleteAndReload('/homework/purge');
}

getHomeworkSubmissionDownloadUrl(homeworkId: string, fileName: string): string {
  return `${API_BASE_URL}/homework/${homeworkId}/download-submission/${encodeURIComponent(fileName)}`;
}

getHomeworkCorrectionDownloadUrl(homeworkId: string, fileName: string): string {
  return `${API_BASE_URL}/homework/${homeworkId}/download-correction/${encodeURIComponent(fileName)}`;
}

async uploadDocumentWithFile(payload: {
  title: string;
  category: string;
  ownerId: string;
  ownerRole: UserRole;
  relatedStudentId?: string;
  relatedTutorId?: string;
  visibility: AppDocument['visibility'];
  verificationStatus?: AppDocument['verificationStatus'];
  file: File;
}): Promise<AppDocument | undefined> {
  const formData = new FormData();

  formData.append('title', payload.title);
  formData.append('category', payload.category);
  formData.append('ownerId', payload.ownerId);
  formData.append('ownerRole', payload.ownerRole);
  formData.append('visibility', payload.visibility);

  if (payload.relatedStudentId) {
    formData.append('relatedStudentId', payload.relatedStudentId);
  }

  if (payload.relatedTutorId) {
    formData.append('relatedTutorId', payload.relatedTutorId);
  }

  if (payload.verificationStatus) {
    formData.append('verificationStatus', payload.verificationStatus);
  }

  formData.append('file', payload.file);

  try {
    const created = await firstValueFrom(
      this.http.post<AppDocument>(`${API_BASE_URL}/documents/upload`, formData)
    );

    await this.reloadFromBackend();
    return created;
  } catch (error) {
    console.error('Erreur upload document', error);
    alert("Impossible d'envoyer le document. Vérifiez le backend.");
    return undefined;
  }
}

getDocumentDownloadUrl(documentId: string): string {
  return `${API_BASE_URL}/documents/${documentId}/download`;
}

deleteAllDocuments(): void {
  this.state.documents = [];
  this.save();
  void this.deleteAndReload('/documents/purge');
}



  returnCorrectedHomework(homeworkId: string, fileNames: string[], tutorComment: string): void {
    const homework = this.state.homework.find((item) => item.id === homeworkId);
    if (homework) {
      homework.correctedFileNames = fileNames;
      homework.tutorComment = tutorComment;
      homework.returnedAt = new Date().toISOString().slice(0, 10);
      homework.status = 'Corrigé';
      this.save();
      void this.patchAndReload(`/homework/${homeworkId}/return`, { correctedFileNames: fileNames, tutorComment });
    }
  }

  addDocument(payload: Omit<AppDocument, 'id' | 'addedAt'>): AppDocument {
    const created: AppDocument = { ...payload, id: `doc-${Date.now()}`, addedAt: new Date().toISOString().slice(0, 10) };
    this.state.documents.unshift(created);
    this.save();
    void this.postAndReload('/documents', created);
    return created;
  }

  deleteDocument(documentId: string): void {
    this.state.documents = this.state.documents.filter((document) => document.id !== documentId);
    this.save();
    void this.deleteAndReload(`/documents/${documentId}`);
  }

  archiveDocument(documentId: string): void {
    const document = this.state.documents.find((item) => item.id === documentId);
    if (document) {
      document.archived = true;
      this.save();
      void this.patchAndReload(`/documents/${documentId}/archive`, {});
    }
  }

  setDocumentVerification(documentId: string, status: AppDocument['verificationStatus'], refusalReason = ''): void {
    const document = this.state.documents.find((item) => item.id === documentId);
    if (document) {
      document.verificationStatus = status;
      document.refusalReason = refusalReason;
      this.save();
      void this.patchAndReload(`/documents/${documentId}/verification`, { verificationStatus: status, refusalReason });
    }
  }

  createFollowUp(payload: Omit<FollowUp, 'id'>): FollowUp {
    const created: FollowUp = { ...payload, id: `follow-${Date.now()}` };
    this.state.followUps.unshift(created);
    this.save();
    void this.postAndReload('/followups', created);
    return created;
  }

  archiveFollowUp(followUpId: string): void {
    const followUp = this.state.followUps.find((item) => item.id === followUpId);
    if (followUp) {
      followUp.status = 'Archivé';
      this.save();
      void this.patchAndReload(`/followups/${followUpId}/archive`, {});
    }
  }

  deleteFollowUp(followUpId: string): void {
    this.state.followUps = this.state.followUps.filter((item) => item.id !== followUpId);
    this.save();
    void this.deleteAndReload(`/followups/${followUpId}`);
  }

  addPayment(payload: Omit<Payment, 'id'>): Payment {
    const created: Payment = { ...payload, id: `payment-${Date.now()}` };
    this.state.payments.unshift(created);
    this.save();

      void this.recordActivity({
      actionType: 'CREATE',
      module: 'PAYMENTS',
      targetName: created.userEmail,
      description: `Paiement ajouté : ${created.amount} $ pour ${created.userEmail} (${created.type}).`
    });

    void this.postAndReload('/payments', created);
    return created;
  }

  setPaymentStatus(paymentId: string, status: PaymentStatus): void {
    const payment = this.state.payments.find((item) => item.id === paymentId);
    if (payment) {
      payment.status = status;
      this.save();

       void this.recordActivity({
      actionType: 'STATUS_CHANGE',
      module: 'PAYMENTS',
      targetName: payment.userEmail,
      description: `Statut du paiement modifié : ${payment.amount} $ pour ${payment.userEmail} est maintenant ${status}.`
    });
    
      void this.patchAndReload(`/payments/${paymentId}/status`, { status });
    }
  }

  deletePayment(paymentId: string): void {
    this.state.payments = this.state.payments.filter((item) => item.id !== paymentId);
    this.save();
    void this.deleteAndReload(`/payments/${paymentId}`);
  }

  generatePaymentsByPeriod(start: string, end: string): Payment[] {
    const grouped = new Map<string, number>();
    this.state.sessions
      .filter((session) => session.status === 'Terminée' && session.date >= start && session.date <= end)
      .forEach((session) => {
        const student = this.getUser(session.studentId);
        const parent = student?.parentId ? this.getUser(student.parentId) : undefined;
        const email = parent?.email ?? student?.email ?? 'inconnu@email.com';
        const amount = this.calculateDurationHours(session) * this.getParentRateForStudent(session.studentId);
        grouped.set(email, (grouped.get(email) ?? 0) + amount);
      });
    const created: Payment[] = [];
    grouped.forEach((amount, email) => {
      created.push({
        id: `payment-${Date.now()}-${created.length}`,
        userEmail: email,
        type: 'Tutorat',
        amount,
        date: new Date().toISOString().slice(0, 10),
        reference: `AUTO-${start}-${end}`,
        status: 'En attente'
      });
    });
    this.state.payments.unshift(...created);
    this.save();
    void this.postAndReload('/payments/generate-by-period', { start, end });
    return created;
  }

  generateBillingPreview(tutorId: string, studentId: string | 'all', start: string, end: string, tutorRate?: number, parentRate?: number): BillingPreview | undefined {
    this.lastBillingRequest = { tutorId, studentId, start, end, tutorRate, parentRate };
    void this.postAndReload('/billing/preview', { tutorId, studentId: studentId === 'all' ? null : studentId, start, end, tutorRate, parentRate });
    const tutor = this.getUser(tutorId);
    if (!tutor) return undefined;
    const sessions = this.state.sessions.filter((session) => {
      const matchStudent = studentId === 'all' || session.studentId === studentId;
      return session.tutorId === tutorId && matchStudent && session.date >= start && session.date <= end && session.status === 'Terminée';
    });
    if (sessions.length === 0) return undefined;
    const lines: BillingSessionLine[] = sessions.map((session) => {
      const duration = this.calculateDurationHours(session);
      const effectiveTutorRate = tutorRate ?? this.getTutorRateForSession(session);
      const effectiveParentRate = parentRate ?? this.getParentRateForStudent(session.studentId);
      return {
        date: session.date,
        subject: session.subject,
        studentName: this.getDisplayName(session.studentId),
        durationHours: duration,
        tutorRate: effectiveTutorRate,
        parentRate: effectiveParentRate,
        tutorAmount: duration * effectiveTutorRate,
        parentAmount: duration * effectiveParentRate
      };
    });
    const firstStudent = this.getUser(sessions[0].studentId);
    const parent = firstStudent?.parentId ? this.getUser(firstStudent.parentId) : undefined;
    return {
      parentInvoice: {
        parentId: parent?.id,
        parentName: parent ? `${parent.firstName} ${parent.lastName}` : 'Parent à compléter',
        parentEmail: parent?.email,
        studentName: studentId === 'all' ? 'Tous les élèves du tuteur' : this.getDisplayName(studentId),
        tutorName: `${tutor.firstName} ${tutor.lastName}`,
        period: `${start} au ${end}`,
        sessions: lines,
        total: lines.reduce((sum, line) => sum + line.parentAmount, 0)
      },
      tutorStatement: {
        tutorId: tutor.id,
        tutorEmail: tutor.email,
        tutorName: `${tutor.firstName} ${tutor.lastName}`,
        period: `${start} au ${end}`,
        sessions: lines,
        totalHours: lines.reduce((sum, line) => sum + line.durationHours, 0),
        total: lines.reduce((sum, line) => sum + line.tutorAmount, 0)
      }
    };
  }

async generateBillingDocuments(
  preview: BillingPreview,
  studentId: string | 'all'
): Promise<BillingDocument[]> {
  if (!this.lastBillingRequest) {
    alert('Impossible de générer les documents : aucune prévisualisation disponible.');
    return [];
  }

  const request = this.lastBillingRequest;

  try {
    const created = await firstValueFrom(
      this.http.post<BillingDocument[]>(`${API_BASE_URL}/billing/generate`, {
        tutorId: request.tutorId,
        studentId: request.studentId === 'all' ? null : request.studentId,
        start: request.start,
        end: request.end,
        tutorRate: request.tutorRate,
        parentRate: request.parentRate
      })
    );

    await this.reloadFromBackend();
    return created;
  } catch (error: any) {
    console.error('Erreur génération documents en BD', error);
    console.error('Détail backend :', error?.error);
    alert("Impossible de générer les documents dans la base de données.");
    return [];
  }
}

  submitBillingDocument(documentId: string): void {
  const document = this.state.billingDocuments.find((item) => item.id === documentId);

  if (document) {
    document.status = 'Soumis';
    document.submittedAt = new Date().toISOString().slice(0, 10);
    void this.recordActivity({
      actionType: 'SUBMIT',
      module: 'BILLING',
      targetUserId: document.recipientId,
      targetName: document.recipientEmail,
      description: `${document.kind} soumis à ${document.recipientEmail} pour la période ${document.period}.`
    });
    this.save();

    void this.postAndReload(`/billing-documents/${documentId}/submit`, {});
  }
}

updateBillingDocument(
  documentId: string,
  changes: Partial<BillingDocument> & Record<string, unknown>
): void {
  this.state.billingDocuments = (this.state.billingDocuments ?? []).map((document) => {
    if (document.id !== documentId) {
      return document;
    }

    return {
      ...document,
      ...changes,
      updatedAt: new Date().toISOString().slice(0, 10)
    } as BillingDocument;
  });

  this.save();

  void this.putAndReload(`/billing-documents/${documentId}`, changes);
}

deleteBillingDocument(documentId: string): void {
  this.state.billingDocuments = (this.state.billingDocuments ?? []).filter((document) => {
    return document.id !== documentId;
  });if (document) {
  void this.recordActivity({
    actionType: 'DELETE',
    module: 'DOCUMENTS',
    targetName: document.title,
     description: `Document supprimé : ${document.title}.`
  });
}



  this.save();

  void this.deleteAndReload(`/billing-documents/${documentId}`);
}

getBillingDocumentsForParent(parentId: string): BillingDocument[] {
  const childIds = this.getChildrenForParent(parentId).map((student) => student.id);

  return this.billingDocuments.filter((doc) => {
    if (doc.kind !== 'Facture parent') {
      return false;
    }

    return doc.recipientId === parentId || childIds.includes(doc.studentId ?? '');
  });
}

getBillingDocumentsForStudent(studentId: string): BillingDocument[] {
  const student = this.getUser(studentId);
  const parentId = student?.parentId;
  const parentEmail = parentId ? this.getUser(parentId)?.email : undefined;

  return this.billingDocuments.filter((doc) => {
    if (doc.kind !== 'Facture parent') {
      return false;
    }

    const isSubmitted = doc.status === 'Soumis';

    const invoiceDirectlyLinkedToStudent = doc.studentId === studentId;

    const invoiceLinkedToParent =
      !!parentId &&
      doc.recipientId === parentId &&
      (!doc.studentId || doc.studentId === studentId);

    const invoiceLinkedToParentEmail =
      !!parentEmail &&
      doc.recipientEmail?.toLowerCase() === parentEmail.toLowerCase() &&
      (!doc.studentId || doc.studentId === studentId);

    return isSubmitted && (
      invoiceDirectlyLinkedToStudent ||
      invoiceLinkedToParent ||
      invoiceLinkedToParentEmail
    );
  });
}

getBillingDocumentsForTutor(tutorId: string): BillingDocument[] {
  return this.billingDocuments.filter((doc) => {
    if (doc.kind !== 'Relevé tuteur') {
      return false;
    }

    return doc.recipientId === tutorId || doc.tutorId === tutorId;
  });
}

 private async reloadFromBackend(): Promise<void> {
  try {
    const state = await firstValueFrom(this.http.get<AppState>(`${API_BASE_URL}/bootstrap`));

    this.state = {
      ...structuredClone(emptyState),
      ...state,
      billingDocuments: state.billingDocuments ?? []
    };

    this.save();
  } catch (error) {
    console.error('Backend non disponible. Impossible de charger les données réelles.', error);
  }
}

  private async postAndReload(path: string, payload: unknown): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${API_BASE_URL}${path}`, payload));
      await this.reloadFromBackend();
    } catch (error) {
      console.warn(`POST ${path} a échoué. Données locales conservées.`, error);
    }
  }

  private async putAndReload(path: string, payload: unknown): Promise<void> {
    try {
      await firstValueFrom(this.http.put(`${API_BASE_URL}${path}`, payload));
      await this.reloadFromBackend();
    } catch (error) {
      console.warn(`PUT ${path} a échoué. Données locales conservées.`, error);
    }
  }

  private async patchAndReload(path: string, payload: unknown): Promise<void> {
    try {
      await firstValueFrom(this.http.patch(`${API_BASE_URL}${path}`, payload));
      await this.reloadFromBackend();
    } catch (error) {
      console.warn(`PATCH ${path} a échoué. Données locales conservées.`, error);
    }
  }

  private async deleteAndReload(path: string): Promise<void> {
    try {
      await firstValueFrom(this.http.delete(`${API_BASE_URL}${path}`));
      await this.reloadFromBackend();
    } catch (error) {
      console.warn(`DELETE ${path} a échoué. Données locales conservées.`, error);
    }
  }

  private toUserRequest(user: User): Record<string, unknown> {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      city: user.city,
      address: user.address,
      temporaryPassword: user.temporaryPassword,
      parentId: user.parentId,
      tutorId: user.tutorId,
      level: user.level,
      grade: user.grade,
      school: user.school,
      subjects: user.subjects ?? [],
      needs: user.needs ?? [],
      objective: user.objective,
      difficulties: user.difficulties,
      availability: user.availability,
      preferredMode: user.preferredMode,
      biography: user.biography,
      languages: user.languages ?? [],
      hourlyRate: user.hourlyRate,
      parentHourlyRate: user.parentHourlyRate,
      tutorHourlyRate: user.tutorHourlyRate,
      diploma: user.diploma,
      experience: user.experience,
      teachingLevels: user.teachingLevels ?? [],
      profileStatus: user.profileStatus,
      communicationPreference: user.communicationPreference,
      avatarUrl: user.avatarUrl
    };
  }

  private upsertUser(user: User): void {
  const index = this.state.users.findIndex((item) => item.id === user.id);

  if (index >= 0) {
    this.state.users[index] = user;
    return;
  }

  const sameEmailIndex = this.state.users.findIndex((item) => {
    return item.email.toLowerCase() === user.email.toLowerCase();
  });

  if (sameEmailIndex >= 0) {
    this.state.users[sameEmailIndex] = user;
    return;
  }

  this.state.users.unshift(user);
}

  private loadState(): AppState {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return structuredClone(emptyState);
  }

  try {
    const parsed = JSON.parse(raw) as AppState;

    return {
      ...structuredClone(emptyState),
      ...parsed,
      billingDocuments: parsed.billingDocuments ?? []
    };
  } catch {
    return structuredClone(emptyState);
  }
}

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

startImpersonation(targetUserId: string, returnUrl = '/admin/utilisateurs'): boolean {
  let currentUser = this.getCurrentUser();
  const targetUser = this.getUser(targetUserId);

  if (!targetUser) {
    alert("Utilisateur introuvable.");
    return false;
  }

  if (targetUser.role === 'admin' || targetUser.role === 'superuser') {
    alert("Vous ne pouvez pas ouvrir l’espace d’un autre administrateur.");
    return false;
  }

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superuser')) {
    currentUser =
      this.state.users.find((user) => user.role === 'admin') ??
      this.state.users.find((user) => user.role === 'superuser');
  }

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superuser')) {
    alert("Aucun administrateur trouvé pour utiliser cette fonctionnalité.");
    return false;
  }

  void this.recordActivity({
  actionType: 'IMPERSONATE',
  module: 'USERS',
  targetUserId: targetUser.id,
  targetName: `${targetUser.firstName} ${targetUser.lastName}`,
  description: `${currentUser.firstName} ${currentUser.lastName} a consulté l’espace de ${targetUser.firstName} ${targetUser.lastName}.`
});

  sessionStorage.setItem(IMPERSONATOR_USER_KEY, currentUser.id);
  sessionStorage.setItem(IMPERSONATION_RETURN_URL_KEY, returnUrl);
  sessionStorage.setItem(CURRENT_USER_KEY, targetUser.id);

  return true;
}

stopImpersonation(): void {
  const adminId = sessionStorage.getItem(IMPERSONATOR_USER_KEY);

  if (adminId) {
    sessionStorage.setItem(CURRENT_USER_KEY, adminId);
  }

  sessionStorage.removeItem(IMPERSONATOR_USER_KEY);
  sessionStorage.removeItem(IMPERSONATION_RETURN_URL_KEY);
}

isImpersonating(): boolean {
  return !!sessionStorage.getItem(IMPERSONATOR_USER_KEY);
}

getImpersonatedUser(): User | undefined {
  if (!this.isImpersonating()) {
    return undefined;
  }

  return this.getCurrentUser();
}

getImpersonationReturnUrl(): string {
  return sessionStorage.getItem(IMPERSONATION_RETURN_URL_KEY) ?? '/admin/utilisateurs';
}

getPortalUrlForUser(user: User): string {
  if (user.role === 'eleve') {
    return '/eleve/tableau-de-bord';
  }

  if (user.role === 'parent') {
    return '/parent/tableau-de-bord';
  }

  if (user.role === 'tuteur') {
    return '/tuteur/tableau-de-bord';
  }

  if (user.role === 'admin') {
    return '/admin/tableau-de-bord';
  }

  if (user.role === 'superuser') {
    return '/superuser/tableau-de-bord';
  }

  return '/';
}

async getActivityLogs(filters: ActivityLogFilters = {}): Promise<ActivityLog[]> {
  let params = new HttpParams();

  if (filters.startDate) {
    params = params.set('startDate', filters.startDate);
  }

  if (filters.endDate) {
    params = params.set('endDate', filters.endDate);
  }

  if (filters.actorUserId) {
    params = params.set('actorUserId', filters.actorUserId);
  }

  if (filters.actionType) {
    params = params.set('actionType', filters.actionType);
  }

  if (filters.module) {
    params = params.set('module', filters.module);
  }

  if (filters.search) {
    params = params.set('search', filters.search);
  }

  try {
    return await firstValueFrom(
      this.http.get<ActivityLog[]>(`${API_BASE_URL}/activity-logs`, { params })
    );
  } catch (error) {
    console.error('Erreur chargement journal activité', error);
    return [];
  }
}

async recordActivity(payload: Omit<CreateActivityLogPayload, 'actorUserId' | 'actorName' | 'actorRole'>): Promise<void> {
  const currentUser = this.getCurrentUser();

  const body: CreateActivityLogPayload = {
    actorUserId: currentUser?.id,
    actorName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'Système',
    actorRole: currentUser?.role ?? 'system',
    actionType: payload.actionType,
    module: payload.module,
    targetUserId: payload.targetUserId,
    targetName: payload.targetName,
    description: payload.description
  };

  try {
    await firstValueFrom(
      this.http.post<ActivityLog>(`${API_BASE_URL}/activity-logs`, body)
    );
  } catch (error) {
    console.error('Erreur écriture journal activité', error);
  }
}

async forgotPassword(email: string): Promise<boolean> {
  try {
    await firstValueFrom(
      this.http.post(`${API_BASE_URL}/auth/forgot-password`, { email })
    );

    return true;
  } catch (error: any) {
    console.error('Erreur mot de passe oublié', error);
    return false;
  }
}

async resetPassword(token: string, newPassword: string, confirmPassword: string): Promise<boolean> {
  try {
    await firstValueFrom(
      this.http.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword,
        confirmPassword
      })
    );

    return true;
  } catch (error: any) {
    console.error('Erreur réinitialisation mot de passe', error);

    const message =
      error?.error?.message ??
      "Impossible de réinitialiser le mot de passe.";

    alert(message);

    return false;
  }
}

logout(): void {
  sessionStorage.removeItem(CURRENT_USER_KEY);
  sessionStorage.removeItem(IMPERSONATOR_USER_KEY);
  sessionStorage.removeItem(IMPERSONATION_RETURN_URL_KEY);
  localStorage.removeItem('etude-reussie-admin-token');
}
}
