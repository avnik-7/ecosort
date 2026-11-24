export type AppRole = 'landing' | 'citizen' | 'admin';

export type CitizenView = 'dashboard' | 'guide' | 'search' | 'reports';

export type AdminView =
  | 'dashboard'
  | 'overview'
  | 'areas'
  | 'reports'
  | 'planner'
  | 'batches'
  | 'hotspots'
  | 'analytics';

export type WasteCategoryId = 'wet' | 'dry' | 'ewaste' | 'hazardous';

export interface WasteCategorySpec {
  id: WasteCategoryId;
  name: string;
  shortName: string;
  binDesignation: string;
  tagline: string;
  summary: string;
  preparationRule: string;
  collectionRoute: string;
  dos: string[];
  donts: string[];
  examples: string[];
}

export interface WasteItem {
  id: string;
  name: string;
  category: WasteCategoryId;
  aliases: string[];
  keywords: string[];
  explanation: string;
  disposalSteps: string[];
  preparationTip: string;
  safetyWarning?: string;
  commonMistake?: string;
  dropOffChannel: string;
}

export interface AmbiguityRule {
  triggers: string[];
  reason: string;
  candidateIds: string[];
  clarifyingQuestion: string;
}

export interface SearchResolution {
  status: 'empty' | 'matched' | 'ambiguous' | 'unknown';
  query: string;
  primaryMatch?: WasteItem;
  relatedMatches: WasteItem[];
  ambiguousCandidates: WasteItem[];
  reason?: string;
  clarifyingQuestion?: string;
  uncertaintyGuidance?: string[];
}

export type WardType = 'Residential' | 'Commercial' | 'Mixed' | 'Institutional';

export interface MunicipalZoneStat {
  id: string;
  zoneCode: string;
  zoneName: string;
  wardType: WardType;
  householdsServed: number;
  dailyTonnes: number;
  wetSharePct: number;
  drySharePct: number;
  ewasteKgWeek: number;
  hazardousKgWeek: number;
  segregationCompliancePct: number;
  contaminationRatePct: number;
  collectionSchedule: string;
  operationalNote: string;
}

export interface MunicipalCategorySummary {
  category: WasteCategoryId;
  monthlyTonnes: number;
  shareOfTotalPct: number;
  diversionOrRecoveryPct: number;
  contaminationPct: number;
  processingDestination: string;
  operationalNote: string;
}

export type CivicReportType =
  | 'overflowing_bin'
  | 'illegal_dumping'
  | 'missed_collection'
  | 'hazardous_waste'
  | 'other';

export type CivicReportStatus =
  | 'Submitted'
  | 'Under Review'
  | 'In Progress'
  | 'Resolved';

export interface CivicReportHistoryEntry {
  id: string;
  status: CivicReportStatus;
  timestamp: string;
  actor: 'Citizen' | 'Municipal Admin' | 'System';
  note: string;
}

export interface CivicReport {
  id: string;
  reportType: CivicReportType;
  area: string;
  locationDetail: string;
  description: string;
  contactOptional?: string;
  status: CivicReportStatus;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
  statusHistory: CivicReportHistoryEntry[];
  isDemoRecord: boolean;
}

export interface CivicReportCreateInput {
  reportType: CivicReportType;
  area: string;
  locationDetail: string;
  description: string;
  contactOptional?: string;
}

export interface CivicReportValidationResult {
  isValid: boolean;
  fieldErrors: Partial<
    Record<'reportType' | 'area' | 'locationDetail' | 'description' | 'contactOptional', string>
  >;
}

export type CollectionPriority = 'Low' | 'Medium' | 'High';

export type CollectionScheduleStatus =
  | 'Scheduled'
  | 'Assigned'
  | 'Collected'
  | 'Cancelled';

export interface DemoCollectionFleetUnit {
  id: string;
  vehicleCode: string;
  teamName: string;
  specialization: string;
  isDemoRecord: true;
}

export interface CollectionSchedule {
  id: string;
  area: string;
  wasteCategory: WasteCategoryId;
  scheduledDate: string;
  scheduledTime: string;
  assignedFleetId: string;
  assignedTeamLabel: string;
  priority: CollectionPriority;
  status: CollectionScheduleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isDemoRecord: boolean;
}

export interface CollectionScheduleCreateInput {
  area: string;
  wasteCategory: WasteCategoryId;
  scheduledDate: string;
  scheduledTime: string;
  assignedFleetId: string;
  priority: CollectionPriority;
  notes?: string;
}

export interface CollectionScheduleValidationResult {
  isValid: boolean;
  fieldErrors: Partial<
    Record<
      | 'area'
      | 'wasteCategory'
      | 'scheduledDate'
      | 'scheduledTime'
      | 'assignedFleetId'
      | 'priority',
      string
    >
  >;
}

export type WasteBatchStatus =
  | 'Awaiting Collection'
  | 'Collected'
  | 'In Transit'
  | 'At Processing Facility'
  | 'Processed';

export interface WasteBatchHistoryEntry {
  id: string;
  status: WasteBatchStatus;
  timestamp: string;
  actor: 'Municipal Admin' | 'System';
  note: string;
}

export interface WasteBatch {
  id: string;
  wasteCategory: WasteCategoryId;
  sourceArea: string;
  collectionDate: string;
  estimatedKg: number;
  status: WasteBatchStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  statusHistory: WasteBatchHistoryEntry[];
  isDemoRecord: boolean;
}

export interface WasteBatchCreateInput {
  wasteCategory: WasteCategoryId;
  sourceArea: string;
  collectionDate: string;
  estimatedKg: number;
  notes?: string;
}

export interface WasteBatchValidationResult {
  isValid: boolean;
  fieldErrors: Partial<
    Record<'wasteCategory' | 'sourceArea' | 'collectionDate' | 'estimatedKg', string>
  >;
}


