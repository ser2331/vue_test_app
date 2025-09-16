export interface AccountLabel {
    text: string;
}

export enum AccountType {
    LDAP = 'LDAP',
    LOCAL = 'Локальная'
}

export interface Account {
    id: string;
    label: AccountLabel[];
    type: AccountType;
    login: string;
    password: string | null;
}

export interface AccountForm {
    labelInput: string;
    type: AccountType;
    login: string;
    password: string;
}