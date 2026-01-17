export const validateNIC = (nic: string): boolean => {
    if (!nic) return false;
    const cleanNIC = nic.trim().toUpperCase();

    // Old Format: 9 digits + V or X (e.g., 123456789V)
    const oldNicRegex = /^[0-9]{9}[VX]$/;

    // New Format: 12 digits (e.g., 199012304567)
    const newNicRegex = /^[0-9]{12}$/;

    return oldNicRegex.test(cleanNIC) || newNicRegex.test(cleanNIC);
};

export const formatNIC = (nic: string): string => {
    return nic.trim().toUpperCase();
};
