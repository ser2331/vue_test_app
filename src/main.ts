import {createApp} from 'vue'
import {createPinia} from 'pinia'
import App from './App.vue'

import {Quasar} from 'quasar'
import './styles/variables.css';
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css' // вместо sass версии

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(Quasar, {
    plugins: {},
})

app.mount('#app')