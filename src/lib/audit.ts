import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export type AuditAction =
    | 'USER_SIGNUP'
    | 'USER_LOGIN'
    | 'PROFILE_UPDATE'
    | 'PHOTO_UPLOAD'
    | 'VERIFICATION_REQUEST'
    | 'ADMIN_VERIFY_APPROVE'
    | 'ADMIN_VERIFY_REJECT'
    | 'SYSTEM_CONFIG_UPDATE';

interface AuditLogEntry {
    action: AuditAction;
    performedBy: string; // UID of the user/admin performing the action
    targetUser?: string; // UID of the user being affected (if different)
    details: any;
    timestamp: any;
    metadata?: {
        userAgent: string;
        ip?: string; // Client-side IP tracking is hard without a cloud function, but we'll placeholder
    };
}

/**
 * Logs a sensitive action to the 'audit_logs' collection.
 * 
 * @param action The type of action being performed
 * @param details detailed object describing the change (e.g., { field: 'status', old: 'pending', new: 'verified' })
 * @param targetUserId Optional. If the action affects another user (e.g., Admin verifying User A), this is User A's UID.
 */
export const logAction = async (action: AuditAction, details: any, targetUserId?: string) => {
    try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.warn('Attempted to log action without authenticated user:', action);
            return;
        }

        const entry: AuditLogEntry = {
            action,
            performedBy: currentUser.uid,
            targetUser: targetUserId || currentUser.uid, // Default to self if not specified
            details,
            timestamp: serverTimestamp(),
            metadata: {
                userAgent: navigator?.userAgent || 'unknown',
            }
        };

        await addDoc(collection(db, 'audit_logs'), entry);
        console.log(`[Audit] ${action} logged.`);
    } catch (error) {
        console.error('Failed to log audit entry:', error);
        // We generally don't want audit logging failure to crash the app, so we catch and log error.
    }
};
