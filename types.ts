export enum ProcessType {
  DEFECT = 'DEFECT',
  RECRUITMENT = 'RECRUITMENT',
}

export enum DefectCategory {
  FUNCTIONAL = 'Functional Bugs',
  LOGICAL = 'Logical Bugs',
  WORKFLOW = 'Workflow Bugs',
  OTHER = 'Other',
}

export enum DefectStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
}

export enum RecruitmentStatus {
  APPLIED = 'Applied',
  SCREENING = 'Screening',
  INTERVIEW = 'Interview',
  OFFER = 'Offer',
  HIRED = 'Hired',
  REJECTED = 'Rejected',
}

export interface Task {
  id: string;
  title: string;
  owner: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
}

export interface Defect {
  id: string;
  dateReported: string;
  customerName: string;
  description: string;
  category: DefectCategory;
  attachments: string[]; // URLs or placeholder names
  featureLink: string;
  status: DefectStatus;
  relatedTasks: Task[];
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  email: string;
  status: RecruitmentStatus;
  resumeUrl?: string;
  interviewNotes: string;
  relatedTasks: Task[];
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}