
// this is all based on: https://firebase.google.com/docs/auth/admin/errors
interface TableOfErrors {
    [key: string]: string;
}

const tableOfErrors: TableOfErrors = {
    'auth/invalid-credential': 'Wrong credentials',
    'auth/invalid-email': 'Invalid email',
    'auth/invalid-password': 'Invalid password',
    'auth/email-already-exists': 'Email already exists',
    'auth/email-already-in-use': 'Email is already in use',
    'auth/internal-error': 'Internal error',
    'auth/too-many-requests': 'Too many requests have been made, try again later',
    'auth/missing-password': 'Missing password',
    'auth/weak-password': 'The password is too weak',
};

export function cleanerError(errorCode: string): string {
    console.log(errorCode);
    return tableOfErrors[errorCode] || 'Unknown error';
}