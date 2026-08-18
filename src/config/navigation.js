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

/*
 * Frontend permissions mirror backend permission names.
 *
 * These control UI visibility only.
 * Backend authorization remains the security boundary.
 */
export const PERMISSIONS = {
    MANAGE_USERS: "manage_users",
    UPLOAD_RECORDS: "upload_records",
    VIEW_RECORDS: "view_records",
    VIEW_RECORD_DETAIL: "view_record_detail",
    VIEW_LOGS: "view_logs",
    EDIT_OWN_RECORDS: "edit_own_records",
    LINK_PATIENT_IDENTITY: "link_patient_identity",
};

const item = (label, path, icon, permission = null) => ({
    label,
    path,
    icon,
    permission,
});

export const NAVIGATION = {
    [ROLES.ADMIN]: [
        item("Dashboard", "/dashboard", LayoutDashboard),
        item("Patients", "/patients", Users),
        item(
            "Medical Records",
            "/records",
            FileText,
            PERMISSIONS.VIEW_RECORDS
        ),
        item(
            "User Management",
            "/users",
            Users,
            PERMISSIONS.MANAGE_USERS
        ),
        item(
            "Audit Logs",
            "/audit",
            ShieldCheck,
            PERMISSIONS.VIEW_LOGS
        ),
        item("Settings", "/settings", Settings),
    ],

    [ROLES.DOCTOR]: [
        item("Dashboard", "/dashboard", LayoutDashboard),
        item("My Patients", "/patients", UserRoundSearch),
        item(
            "Medical Records",
            "/records",
            FileText,
            PERMISSIONS.VIEW_RECORDS
        ),
        item(
            "Upload Record",
            "/upload",
            Upload,
            PERMISSIONS.UPLOAD_RECORDS
        ),
        item("Settings", "/settings", Settings),
    ],

    [ROLES.NURSE]: [
        item("Dashboard", "/dashboard", LayoutDashboard),
        item("My Patients", "/patients", UserRoundSearch),
        item(
            "Medical Records",
            "/records",
            FileText,
            PERMISSIONS.VIEW_RECORDS
        ),
        item(
            "Upload Record",
            "/upload",
            Upload,
            PERMISSIONS.UPLOAD_RECORDS
        ),
        item("Settings", "/settings", Settings),
    ],

    [ROLES.LAB_TECHNICIAN]: [
        item("Dashboard", "/dashboard", LayoutDashboard),
        item("Patients", "/patients", UserRoundSearch),
        item(
            "Medical Records",
            "/records",
            FileText,
            PERMISSIONS.VIEW_RECORDS
        ),
        item(
            "Upload Record",
            "/upload",
            Upload,
            PERMISSIONS.UPLOAD_RECORDS
        ),
        item("Settings", "/settings", Settings),
    ],

    [ROLES.RECORDS_OFFICER]: [
        item("Dashboard", "/dashboard", LayoutDashboard),
        item("Patients", "/patients", Users),
        item(
            "Medical Records",
            "/records",
            FileText,
            PERMISSIONS.VIEW_RECORDS
        ),
        item("Settings", "/settings", Settings),
    ],

    [ROLES.AUDITOR]: [
        item("Dashboard", "/dashboard", LayoutDashboard),
        item(
            "Audit Logs",
            "/audit",
            ClipboardList,
            PERMISSIONS.VIEW_LOGS
        ),
        item("Settings", "/settings", Settings),
    ],

    [ROLES.PATIENT]: [
        item("Dashboard", "/dashboard", LayoutDashboard),
        item(
            "My Records",
            "/records",
            FileText,
            PERMISSIONS.VIEW_RECORDS
        ),
        item("Settings", "/settings", Settings),
    ],
};

export const getNavigationForRole = (role) =>
    NAVIGATION[role] || [];