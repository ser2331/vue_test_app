<template>
  <div class="account-form">
    <div class="header">
      <div class="header-content">
        <h5 class="title">Учетные записи</h5>
        <q-btn
            icon="add"
            color="primary"
            @click="addNewAccount"
            label="Добавить учетную запись"
            class="add-btn"
        />
      </div>

      <div class="hint">
        <q-icon name="info" size="sm"/>
        <span>В поле "Метка" вводите текстовые метки через знак ;</span>
      </div>
    </div>

    <div class="accounts-list">
      <div
          v-for="(account, index) in accounts"
          :key="account.id"
          class="account-item card"
          :class="{ 'has-error': hasErrors(account.id) }"
      >
        <div class="account-header">
          <span class="account-title">Учетная запись {{ index + 1 }}</span>
          <q-btn
              icon="delete"
              color="negative"
              size="sm"
              @click="removeAccount(account.id)"
              flat
              round
              class="delete-btn"
          />
        </div>

        <div class="account-fields">
          <q-input
              v-model="getAccountForm(account.id).labelInput"
              label="Метка"
              hint="Максимум 50 символов, разделитель ;"
              :maxlength="50"
              @blur="updateAccountLabels(account.id)"
              dense
              outlined
              class="field"
          />

          <q-select
              v-model="getAccountForm(account.id).type"
              :options="accountTypeOptions"
              label="Тип записи"
              emit-value
              map-options
              @update:model-value="updateAccountType(account.id)"
              dense
              outlined
              class="field"
          />

          <q-input
              v-model="getAccountForm(account.id).login"
              label="Логин *"
              hint="Обязательное поле, максимум 100 символов"
              :maxlength="100"
              :error="!getAccountForm(account.id).login && getTouchedFields(account.id)?.login"
              @blur="handleBlur(account.id, 'login')"
              dense
              outlined
              class="field"
          />

          <q-input
              v-if="getAccountForm(account.id).type === 'Локальная'"
              v-model="getAccountForm(account.id).password"
              label="Пароль *"
              type="password"
              hint="Обязательное поле, максимум 100 символов"
              :maxlength="100"
              :error="!getAccountForm(account.id).password && getTouchedFields(account.id)?.password"
              @blur="handleBlur(account.id, 'password')"
              dense
              outlined
              class="field"
          />
        </div>

        <div v-if="hasErrors(account.id)" class="error-message">
          Пожалуйста, заполните все обязательные поля правильно
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, computed, watch} from 'vue';
import {useAccountsStore} from '../stores/accounts';
import {AccountType} from '../types/account';

const accountsStore = useAccountsStore();

const accountForms = reactive<Record<string, any>>({});
const touchedFields = reactive<Record<string, any>>({});

const accountTypeOptions = [
  {label: 'LDAP', value: AccountType.LDAP},
  {label: 'Локальная', value: AccountType.LOCAL}
];

const accounts = computed(() => accountsStore.accounts);

const getAccountForm = (accountId: string) => {
  if (!accountForms[accountId]) {
    const account = accounts.value.find(acc => acc.id === accountId);
    accountForms[accountId] = {
      labelInput: account?.label.map(l => l.text).join('; ') || '',
      type: account?.type || AccountType.LOCAL,
      login: account?.login || '',
      password: account?.password || ''
    };
  }
  return accountForms[accountId];
};

const getTouchedFields = (accountId: string) => {
  if (!touchedFields[accountId]) {
    touchedFields[accountId] = {};
  }
  return touchedFields[accountId];
};

const initializeForms = () => {
  accounts.value.forEach(account => {
    getAccountForm(account.id);
    getTouchedFields(account.id);
  });
};

const addNewAccount = () => {
  const newAccount = {
    label: [],
    type: AccountType.LOCAL,
    login: '',
    password: null
  };

  accountsStore.addAccount(newAccount);

  const newAccountId = accounts.value[accounts.value.length - 1].id;
  accountForms[newAccountId] = {
    labelInput: '',
    type: AccountType.LOCAL,
    login: '',
    password: ''
  };
  touchedFields[newAccountId] = {};
};

const removeAccount = (id: string) => {
  accountsStore.removeAccount(id);
  delete accountForms[id];
  delete touchedFields[id];
};

const updateAccountLabels = (id: string) => {
  const labels = accountsStore.parseLabels(getAccountForm(id).labelInput);
  accountsStore.updateAccount(id, {label: labels});
};

const updateAccountType = (id: string) => {
  const form = getAccountForm(id);
  const password = form.type === AccountType.LDAP ? null : form.password;
  accountsStore.updateAccount(id, {
    type: form.type,
    password
  });
};

const handleBlur = (id: string, field: 'login' | 'password') => {
  const fields = getTouchedFields(id);
  touchedFields[id] = {...fields, [field]: true};
  validateAndSaveAccount(id);
};

const validateAndSaveAccount = (id: string) => {
  const account = accounts.value.find(acc => acc.id === id);
  const form = getAccountForm(id);

  if (!account) return;

  const updates: any = {
    login: form.login.trim(),
    type: form.type
  };

  if (form.type === AccountType.LOCAL) {
    updates.password = form.password;
  } else {
    updates.password = null;
  }

  if (accountsStore.validateAccount({...account, ...updates})) {
    accountsStore.updateAccount(id, updates);
  }
};

const hasErrors = (id: string): boolean => {
  const account = accounts.value.find(acc => acc.id === id);
  if (!account) return false;

  const form = getAccountForm(id);
  const fields = getTouchedFields(id);

  const hasLoginError = !form.login.trim();
  const hasPasswordError = form.type === AccountType.LOCAL && !form.password;

  return (hasLoginError || hasPasswordError) && fields?.login && fields?.password;
};

watch(accounts, initializeForms, {immediate: true});
</script>

<style scoped>
.account-form {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  min-height: 100vh;
}

.header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.title {
  color: var(--white);
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 2px 4px var(--shadow-light);
}

.add-btn {
  font-weight: 500;
  box-shadow: 0 4px 12px var(--shadow-light);
}

.hint {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  background: var(--hint-bg);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  color: var(--white);
  border: 1px solid var(--hint-border);
}

.accounts-list {
  display: grid;
  gap: 20px;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  padding-right: 8px;
}

.accounts-list::-webkit-scrollbar {
  width: 6px;
}

.accounts-list::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 3px;
}

.accounts-list::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.accounts-list::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

.account-item {
  padding: 24px;
  border-radius: 16px;
  background: var(--white);
  box-shadow: 0 8px 32px var(--shadow-light);
  backdrop-filter: blur(10px);
  border: 1px solid var(--hint-border);
  transition: all 0.3s ease;
}

.account-item:hover {
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.account-item.has-error {
  border-color: var(--error-red);
  box-shadow: 0 8px 32px var(--shadow-error);
}

.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--border-light);
}

.account-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-dark);
}

.delete-btn {
  transition: all 0.2s ease;
}

.delete-btn:hover {
  transform: scale(1.1);
}

.account-fields {
  display: flex;
  gap: 16px;
}

.field {
  width: 100%;
  transition: all 0.3s ease;
}

.field:hover {
  transform: translateX(2px);
}

.error-message {
  color: var(--error-red);
  font-size: 14px;
  font-weight: 500;
  margin-top: 16px;
  padding: 12px;
  background: var(--error-bg);
  border-radius: 8px;
  border-left: 4px solid var(--error-red);
}

@media (max-width: 768px) {
  .account-form {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .title {
    text-align: center;
  }

  .account-item {
    padding: 20px;
  }

  .account-fields {
    gap: 12px;
  }
}
</style>