import {
    LayoutDashboard,
    Users,
    UserRoundSearch,
    FileText,
    Upload,
    ClipboardList,
    ShieldCheck,
    Settings,
} from "lucide-react";

export const ROLES = {
    ADMIN: "admin",
    DOCTOR: "doctor",
    NURSE: "nurse",
    LAB_TECHNICIAN: "lab_technician",
    RECORDS_OFFICER: "records_officer",
    AUDITOR: "auditor",
    PATIENT: "patient",
};

export const ROLE_LABELS = {
    [ROLES.ADMIN]: "Administrator",
    [ROLES.DOCTOR]: "Doctor",
    [ROLES.NURSE]: "Nurse",
    [ROLES.LAB_TECHNICIAN]: "Lab Technician",
    [ROLES.RECORDS_OFFICER]: "Records Officer",
    [ROLES.AUDITOR]: "Auditor",
    [ROLES.PATIENT]: "Patient",
};

export const PERMISSIONS = {
    MANAGE_USERS: "manage_users",
    UPLOAD_RECORDS: "upload_records",
    VIEW_RECORDS: "view_records",
    VIEW_RECORD_DETAIL: "view_record_detail",
    VIEW_LOGS: "view_logs",
    EDIT_OWN_RECORDS: "edit_own_records",
    LINK_PATIENT_IDENTITY: "link_patient_identity",
};

const item = (label, path, icon, group, permission = null) => ({
    label,
    path,
    icon,
    group,
    permission,
});

export const NAVIGATION = {
    [ROLES.ADMIN]: [
        item("Dashboard", "/dashboard", LayoutDashboard, "Overview"),
        item("Patients", "/patients", Users, "Clinical Data"),
        item("Medical Records", "/records", FileText, "Clinical Data", PERMISSIONS.VIEW_RECORDS),
        item("User Management", "/users", Users, "Administration", PERMISSIONS.MANAGE_USERS),
        item("Audit Logs", "/audit", ShieldCheck, "Administration", PERMISSIONS.VIEW_LOGS),
        item("Settings", "/settings", Settings, "Account"),
    ],

    [ROLES.DOCTOR]: [
        item("Dashboard", "/dashboard", LayoutDashboard, "Overview"),
        item("My Patients", "/patients", UserRoundSearch, "Patient Care"),
        item("Medical Records", "/records", FileText, "Patient Care", PERMISSIONS.VIEW_RECORDS),
        item("Upload Record", "/upload", Upload, "Patient Care", PERMISSIONS.UPLOAD_RECORDS),
        item("Settings", "/settings", Settings, "Account"),
    ],

    [ROLES.NURSE]: [
        item("Dashboard", "/dashboard", LayoutDashboard, "Overview"),
        item("My Patients", "/patients", UserRoundSearch, "Patient Care"),
        item("Medical Records", "/records", FileText, "Patient Care", PERMISSIONS.VIEW_RECORDS),
        item("Upload Record", "/upload", Upload, "Patient Care", PERMISSIONS.UPLOAD_RECORDS),
        item("Settings", "/settings", Settings, "Account"),
    ],

    [ROLES.LAB_TECHNICIAN]: [
        item("Dashboard", "/dashboard", LayoutDashboard, "Overview"),
        item("Patients", "/patients", UserRoundSearch, "Patient Care"),
        item("Medical Records", "/records", FileText, "Patient Care", PERMISSIONS.VIEW_RECORDS),
        item("Upload Record", "/upload", Upload, "Patient Care", PERMISSIONS.UPLOAD_RECORDS),
        item("Settings", "/settings", Settings, "Account"),
    ],

    [ROLES.RECORDS_OFFICER]: [
        item("Dashboard", "/dashboard", LayoutDashboard, "Overview"),
        item("Patients", "/patients", Users, "Records"),
        item("Medical Records", "/records", FileText, "Records", PERMISSIONS.VIEW_RECORDS),
        item("Settings", "/settings", Settings, "Account"),
    ],

    [ROLES.AUDITOR]: [
        item("Dashboard", "/dashboard", LayoutDashboard, "Overview"),
        item("Audit Logs", "/audit", ClipboardList, "Oversight", PERMISSIONS.VIEW_LOGS),
        item("Settings", "/settings", Settings, "Account"),
    ],

    [ROLES.PATIENT]: [
        item("Dashboard", "/dashboard", LayoutDashboard, "Overview"),
        item("My Records", "/records", FileText, "My Care", PERMISSIONS.VIEW_RECORDS),
        item("Settings", "/settings", Settings, "Account"),
    ],
};

export const getNavigationForRole = (role) => NAVIGATION[role] || [];