import {defineStore} from 'pinia';
import {ref, computed} from 'vue';
import {Account, AccountType, AccountLabel} from '../types/account';

export const useAccountsStore = defineStore('accounts', () => {
    const loadAccounts = (): Account[] => {
        try {
            const stored = localStorage.getItem('accounts');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return [];
        }
    };
    const accounts = ref<Account[]>(loadAccounts());

    const saveToStorage = () => {
        localStorage.setItem('accounts', JSON.stringify(accounts.value));
    };

    // Добавление учетной записи
    const addAccount = (account: Omit<Account, 'id'>) => {
        const newAccount: Account = {
            ...account,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9) // Уникальный ID
        };
        accounts.value.push(newAccount);
        saveToStorage();
        return newAccount; // Возвращаем созданный аккаунт
    };

    // Обновление учетной записи
    const updateAccount = (id: string, updates: Partial<Account>) => {
        const index = accounts.value.findIndex(acc => acc.id === id);
        if (index !== -1) {
            accounts.value[index] = {...accounts.value[index], ...updates};
            saveToStorage();
        }
    };

    // Удаление учетной записи
    const removeAccount = (id: string) => {
        accounts.value = accounts.value.filter(acc => acc.id !== id);
        saveToStorage();
    };

    // Преобразование строки меток в массив объектов
    const parseLabels = (labelString: string): AccountLabel[] => {
        if (!labelString.trim()) return [];

        return labelString
            .split(';')
            .map(label => label.trim())
            .filter(label => label.length > 0)
            .map(label => ({text: label}));
    };

    // Валидация
    const validateAccount = (account: Partial<Account>): boolean => {
        if (!account.login || account.login.trim().length === 0) return false;
        if (account.login.length > 100) return false;

        if (account.type === AccountType.LOCAL) {
            if (!account.password || account.password.length === 0) return false;
            if (account.password.length > 100) return false;
        }

        return true;
    };


    return {
        accounts: computed(() => accounts.value),
        addAccount,
        updateAccount,
        removeAccount,
        parseLabels,
        validateAccount
    };
});