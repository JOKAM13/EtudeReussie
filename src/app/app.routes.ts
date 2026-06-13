import { Routes } from '@angular/router';
import { PortalLayoutComponent } from './layouts/portal-layout.component';
import { LoginComponent } from './pages/auth/login.component';
import { StudentDashboardComponent } from './pages/student/student-dashboard.component';
import { StudentSessionsComponent } from './pages/student/student-sessions.component';
import { StudentHomeworkComponent } from './pages/student/student-homework.component';
import { StudentSubmitHomeworkComponent } from './pages/student/student-submit-homework.component';
import { StudentDocumentsComponent } from './pages/student/student-documents.component';
import { StudentFollowupsComponent } from './pages/student/student-followups.component';
import { StudentProfileComponent } from './pages/student/student-profile.component';
import { TutorDashboardComponent } from './pages/tutor/tutor-dashboard.component';
import { TutorRequestsComponent } from './pages/tutor/tutor-requests.component';
import { TutorStudentsComponent } from './pages/tutor/tutor-students.component';
import { TutorCalendarComponent } from './pages/tutor/tutor-calendar.component';
import { TutorHomeworkComponent } from './pages/tutor/tutor-homework.component';
import { TutorFollowupsComponent } from './pages/tutor/tutor-followups.component';
import { TutorDocumentsComponent } from './pages/tutor/tutor-documents.component';
import { TutorProfileComponent } from './pages/tutor/tutor-profile.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard.component';
import { AdminUsersComponent } from './pages/admin/admin-users.component';
import { AdminRequestsComponent } from './pages/admin/admin-requests.component';
import { AdminAssignmentsComponent } from './pages/admin/admin-assignments.component';
import { AdminBillingComponent } from './pages/admin/admin-billing.component';
import { AdminSessionsComponent } from './pages/admin/admin-sessions.component';
import { AdminFollowupsComponent } from './pages/admin/admin-followups.component';
import { AdminDocumentsComponent } from './pages/admin/admin-documents.component';
import { AdminPaymentsComponent } from './pages/admin/admin-payments.component';
import { ParentDashboardComponent } from './pages/parent/parent-dashboard.component';
import { ParentChildrenComponent } from './pages/parent/parent-children.component';
import { ParentSessionsComponent } from './pages/parent/parent-sessions.component';
import { ParentFollowupsComponent } from './pages/parent/parent-followups.component';
import { ParentHomeworkComponent } from './pages/parent/parent-homework.component';
import { ParentDocumentsComponent } from './pages/parent/parent-documents.component';
import { ParentInvoicesComponent } from './pages/parent/parent-invoices.component';
import { ParentProfileComponent } from './pages/parent/parent-profile.component';
import { SuperUserUsersComponent } from './pages/superuser/super-user-users.component';
import { StudentInvoicesComponent } from './pages/student/student-invoices.component';
import { TutorInvoicesComponent } from './pages/tutor/tutor-invoices.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { title: 'Connexion' } },
  {
    path: 'super-user',
    component: PortalLayoutComponent,
    data: { role: 'superuser' },
    children: [
      { path: '', redirectTo: 'utilisateurs', pathMatch: 'full' },
      { path: 'utilisateurs', component: SuperUserUsersComponent, data: { title: 'Utilisateurs gestionnaires' } }
    ]
  },
  {
    path: 'eleve',
    component: PortalLayoutComponent,
    data: { role: 'eleve' },
    children: [
      { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
      { path: 'tableau-de-bord', component: StudentDashboardComponent, data: { title: 'Tableau de bord' } },
      { path: 'seances', component: StudentSessionsComponent, data: { title: 'Mes séances' } },
      { path: 'devoirs', component: StudentHomeworkComponent, data: { title: 'Mes devoirs' } },
      { path: 'soumettre-devoir', component: StudentSubmitHomeworkComponent, data: { title: 'Soumettre un devoir' } },
      { path: 'documents', component: StudentDocumentsComponent, data: { title: 'Documents' } },
      { path: 'suivis', component: StudentFollowupsComponent, data: { title: 'Suivis du tuteur' } },
      { path: 'factures', component: StudentInvoicesComponent, data: { title: 'Factures' } },
      { path: 'profil', component: StudentProfileComponent, data: { title: 'Mon profil' } }
    ]
  },
  {
    path: 'tuteur',
    component: PortalLayoutComponent,
    data: { role: 'tuteur' },
    children: [
      { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
      { path: 'tableau-de-bord', component: TutorDashboardComponent, data: { title: 'Tableau de bord' } },
      { path: 'demandes', component: TutorRequestsComponent, data: { title: 'Demandes disponibles' } },
      { path: 'eleves', component: TutorStudentsComponent, data: { title: 'Mes élèves' } },
      { path: 'calendrier', component: TutorCalendarComponent, data: { title: 'Calendrier tuteur' } },
      { path: 'devoirs', component: TutorHomeworkComponent, data: { title: 'Devoirs soumis' } },
      { path: 'suivis-parents', component: TutorFollowupsComponent, data: { title: 'Suivis aux parents' } },
      { path: 'documents', component: TutorDocumentsComponent, data: { title: 'Documents' } },
      { path: 'factures', component: TutorInvoicesComponent, data: { title: 'Factures' } },
      { path: 'profil', component: TutorProfileComponent, data: { title: 'Mon profil' } }
    ]
  },
  {
    path: 'parent',
    component: PortalLayoutComponent,
    data: { role: 'parent' },
    children: [
      { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
      { path: 'tableau-de-bord', component: ParentDashboardComponent, data: { title: 'Tableau de bord' } },
      { path: 'enfants', component: ParentChildrenComponent, data: { title: 'Mes enfants' } },
      { path: 'seances', component: ParentSessionsComponent, data: { title: 'Séances' } },
      { path: 'suivis', component: ParentFollowupsComponent, data: { title: 'Suivis du tuteur' } },
      { path: 'devoirs', component: ParentHomeworkComponent, data: { title: 'Devoirs' } },
      { path: 'documents', component: ParentDocumentsComponent, data: { title: 'Documents' } },
      { path: 'factures', component: ParentInvoicesComponent, data: { title: 'Factures' } },
      { path: 'profil', component: ParentProfileComponent, data: { title: 'Mon profil' } }
    ]
  },
  {
    path: 'admin',
    component: PortalLayoutComponent,
    data: { role: 'admin' },
    children: [
      { path: '', redirectTo: 'tableau-de-bord', pathMatch: 'full' },
      { path: 'tableau-de-bord', component: AdminDashboardComponent, data: { title: 'Tableau de bord' } },
      { path: 'utilisateurs', component: AdminUsersComponent, data: { title: 'Gestion des utilisateurs' } },
      { path: 'demandes', component: AdminRequestsComponent, data: { title: 'Demandes' } },
      { path: 'assignations', component: AdminAssignmentsComponent, data: { title: 'Assignations' } },
      { path: 'facturation', component: AdminBillingComponent, data: { title: 'Facturation' } },
      { path: 'seances', component: AdminSessionsComponent, data: { title: 'Séances' } },
      { path: 'suivis', component: AdminFollowupsComponent, data: { title: 'Suivis parents' } },
      { path: 'documents', component: AdminDocumentsComponent, data: { title: 'Documents' } },
      { path: 'paiements', component: AdminPaymentsComponent, data: { title: 'Paiements' } }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
