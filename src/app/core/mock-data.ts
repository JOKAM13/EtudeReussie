import { AppDocument, BillingDocument, FollowUp, Homework, Payment, Session, TutorRequest, User } from './models';

export interface AppState {
  users: User[];
  requests: TutorRequest[];
  sessions: Session[];
  homework: Homework[];
  documents: AppDocument[];
  followUps: FollowUp[];
  payments: Payment[];
  billingDocuments: BillingDocument[];
}

const avatar = (name: string, color = '2563eb') => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&bold=true&size=128`;

export const initialState: AppState = {
  users: [
    {
      id: 'super-1', firstName: 'Jordan', lastName: 'Super User', email: 'super@etudereussie.ca', phone: '514-663-1877', city: 'Québec', role: 'superuser', status: 'Actif', avatarUrl: avatar('Jordan Super', '0f172a'), temporaryPassword: 'Super123!'
    },
    {
      id: 'admin-1', firstName: 'Jordan', lastName: 'Admin', email: 'admin@etudereussie.ca', phone: '514-663-1877', city: 'Québec', role: 'admin', status: 'Actif', avatarUrl: avatar('Jordan Admin', '2563eb'), temporaryPassword: 'Admin123!'
    },
    {
      id: 'tutor-1', firstName: 'Sarah', lastName: 'Tremblay', email: 'sarah.tuteur@email.com', phone: '418-555-0101', city: 'Québec', role: 'tuteur', status: 'Actif', avatarUrl: avatar('Sarah Tremblay', '16a34a'),
      subjects: ['Mathématiques', 'Sciences'], teachingLevels: ['Secondaire', 'Cégep'], hourlyRate: 30, preferredMode: 'Les deux', profileStatus: 'Actif',
      biography: 'Tuteure patiente et structurée, spécialisée en mathématiques.', languages: ['Français', 'Anglais'], diploma: 'Baccalauréat en mathématiques', experience: '3 ans de tutorat', availability: 'Lundi, mercredi et samedi soir.'
    },
    {
      id: 'tutor-2', firstName: 'Marc', lastName: 'Bélanger', email: 'marc.tuteur@email.com', phone: '418-555-0122', city: 'Lévis', role: 'tuteur', status: 'Actif', avatarUrl: avatar('Marc Bélanger', '0891b2'),
      subjects: ['Français', 'Histoire'], teachingLevels: ['Primaire', 'Secondaire'], hourlyRate: 28, preferredMode: 'En ligne', profileStatus: 'Actif',
      biography: 'Approche pédagogique claire avec beaucoup de pratique.', languages: ['Français'], diploma: 'Études en enseignement', experience: '2 ans', availability: 'Soirs de semaine.'
    },
    {
      id: 'parent-1', firstName: 'Nadia', lastName: 'Kouadio', email: 'parent.nadia@email.com', phone: '418-555-0188', city: 'Québec', address: 'Québec, QC', role: 'parent', status: 'Actif', communicationPreference: 'Courriel', avatarUrl: avatar('Nadia Kouadio', '7c3aed'), temporaryPassword: 'Parent123!'
    },
    {
      id: 'student-1', firstName: 'Yasmine', lastName: 'Kouadio', email: 'yasmine@email.com', phone: '418-555-0199', city: 'Québec', role: 'eleve', status: 'Actif', avatarUrl: avatar('Yasmine Kouadio', 'f59e0b'),
      level: 'Secondaire', grade: 'Secondaire 4', school: 'École de la Cité', subjects: ['Mathématiques', 'Sciences'], needs: ['Mathématiques'], objective: 'Améliorer les notes et préparer les examens.', difficulties: 'Difficultés avec les fonctions et les problèmes écrits.', availability: 'Mardi et jeudi après 18 h', preferredMode: 'En ligne', parentId: 'parent-1', tutorId: 'tutor-1', parentHourlyRate: 45, tutorHourlyRate: 30
    },
    {
      id: 'student-2', firstName: 'Adam', lastName: 'Nguyen', email: 'adam@email.com', phone: '418-555-0177', city: 'Lévis', role: 'eleve', status: 'Actif', avatarUrl: avatar('Adam Nguyen', 'dc2626'),
      level: 'Primaire', grade: '6e année', school: 'École du Parc', subjects: ['Français'], needs: ['Français'], objective: 'Renforcer la lecture et l’écriture.', difficulties: 'Manque de confiance en rédaction.', availability: 'Samedi matin', preferredMode: 'Présentiel', parentId: 'parent-1', tutorId: 'tutor-2', parentHourlyRate: 40, tutorHourlyRate: 28
    }
  ],
  requests: [
    {
      id: 'request-1', studentName: 'Léa Martin', studentEmail: 'lea@email.com', parentEmail: 'parent.lea@email.com', phone: '514-555-0202', level: 'Secondaire', grade: 'Secondaire 5', school: 'Collège Saint-Louis', subject: 'Mathématiques', city: 'Québec', mode: 'En ligne', availability: 'Lundi et mercredi après 18 h', objective: 'Préparation examen ministériel', difficulties: 'Algèbre et résolution de problèmes', specialNeed: 'Besoin de beaucoup d’exemples pratiques', hourlyRate: 25, hoursPerWeek: 2, desiredStartDate: '2026-06-10', comment: 'Urgent avant les examens.', status: 'Nouvelle', createdAt: '2026-05-28', internalNote: 'Parent très motivé.'
    },
    {
      id: 'request-2', studentName: 'Kofi Mensah', studentEmail: 'kofi@email.com', parentEmail: 'parent.kofi@email.com', phone: '438-555-0155', level: 'Cégep', grade: 'Cégep 1', school: 'Cégep Garneau', subject: 'Physique', city: 'Québec', mode: 'Présentiel', availability: 'Samedi après-midi', objective: 'Rattrapage de session', difficulties: 'Cinématique et forces', hourlyRate: 30, hoursPerWeek: 3, desiredStartDate: '2026-06-15', status: 'Disponible', createdAt: '2026-05-27'
    },
    {
      id: 'request-3', studentName: 'Yasmine Kouadio', studentEmail: 'yasmine@email.com', parentEmail: 'parent.nadia@email.com', phone: '418-555-0188', level: 'Secondaire', grade: 'Secondaire 4', school: 'École de la Cité', subject: 'Mathématiques', city: 'Québec', mode: 'En ligne', availability: 'Mardi et jeudi soir', objective: 'Suivi hebdomadaire', difficulties: 'Fonctions', hourlyRate: 25, hoursPerWeek: 2, desiredStartDate: '2026-05-20', status: 'Assignée', assignedTutorId: 'tutor-1', createdAt: '2026-05-19'
    }
  ],
  sessions: [
    { id: 'session-1', studentId: 'student-1', tutorId: 'tutor-1', subject: 'Mathématiques', date: '2026-06-04', startTime: '18:00', endTime: '19:30', mode: 'En ligne', meetingLink: 'https://meet.google.com/demo-er-1', note: 'Réviser les fonctions.', status: 'Prévue' },
    { id: 'session-2', studentId: 'student-1', tutorId: 'tutor-1', subject: 'Mathématiques', date: '2026-05-26', startTime: '18:00', endTime: '19:30', mode: 'En ligne', meetingLink: 'https://meet.google.com/demo-er-2', note: 'Séance réalisée.', status: 'Terminée' },
    { id: 'session-3', studentId: 'student-2', tutorId: 'tutor-2', subject: 'Français', date: '2026-06-07', startTime: '10:00', endTime: '11:30', mode: 'Présentiel', address: 'Bibliothèque Gabrielle-Roy', note: 'Rédaction descriptive.', status: 'Terminée' },
    { id: 'session-4', studentId: 'student-1', tutorId: 'tutor-1', subject: 'Sciences', date: '2026-05-18', startTime: '17:00', endTime: '18:00', mode: 'En ligne', status: 'Annulée', note: 'Annulée par le parent.' }
  ],
  homework: [
    { id: 'homework-1', studentId: 'student-1', tutorId: 'tutor-1', title: 'Exercices fonctions', subject: 'Mathématiques', description: 'J’ai besoin d’aide pour les numéros 4 et 5.', submittedAt: '2026-05-29', fileNames: ['fonctions-exercices.pdf'], status: 'Soumis' },
    { id: 'homework-2', studentId: 'student-1', tutorId: 'tutor-1', title: 'Révision chapitre 3', subject: 'Sciences', description: 'Document à vérifier.', submittedAt: '2026-05-20', fileNames: ['chapitre3.docx'], status: 'Corrigé', tutorComment: 'Bon travail. Revoir la question 6.', correctedFileNames: ['chapitre3-corrige.pdf'], returnedAt: '2026-05-22' }
  ],
  documents: [
    { id: 'doc-1', title: 'Bulletin étape 2', category: 'Bulletin', ownerId: 'student-1', ownerRole: 'eleve', relatedStudentId: 'student-1', relatedTutorId: 'tutor-1', fileName: 'bulletin-etape-2.pdf', sizeKb: 830, addedAt: '2026-05-21', visibility: 'Partagé' },
    { id: 'doc-2', title: 'Spécimen de chèque Sarah', category: 'Spécimen de chèque', ownerId: 'tutor-1', ownerRole: 'tuteur', relatedTutorId: 'tutor-1', fileName: 'specimen-sarah.pdf', sizeKb: 420, addedAt: '2026-05-16', visibility: 'Admin seulement', verificationStatus: 'Validé' },
    { id: 'doc-3', title: 'Facture mai', category: 'Facture', ownerId: 'parent-1', ownerRole: 'parent', relatedStudentId: 'student-1', fileName: 'facture-mai.pdf', sizeKb: 260, addedAt: '2026-05-31', visibility: 'Parent concerné' }
  ],
  followUps: [
    { id: 'follow-1', studentId: 'student-1', tutorId: 'tutor-1', parentId: 'parent-1', sessionId: 'session-2', subject: 'Mathématiques', sessionDate: '2026-05-26', notions: 'Fonctions affines, lecture de graphique.', progress: 'L’élève comprend mieux la pente et l’ordonnée à l’origine.', difficulties: 'Attention aux signes dans les calculs.', homework: 'Faire les exercices 8 à 12.', generalComment: 'Bonne séance, participation active.', understandingPercent: 78, homeworkPercent: 80, participation: 'Bonne', status: 'Envoyé', sentAt: '2026-05-26' }
  ],
  payments: [
    { id: 'payment-1', userEmail: 'parent.nadia@email.com', type: 'Tutorat', amount: 75, date: '2026-05-27', reference: 'INT-0527-YK', status: 'Payé' },
    { id: 'payment-2', userEmail: 'parent.kofi@email.com', type: 'Tutorat', amount: 90, date: '2026-06-01', reference: 'ATT-0601-KM', status: 'En attente' }
  ],
  billingDocuments: []
};
