import { createStore } from "tinybase"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const store = createStore()
export const TABLE_NAME = "protocolo"

const STORAGE_KEY = "@atendimentos:store"

// Carrega os dados salvos quando o app abre
export async function loadStore() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY)
    if (json) {
      const tables = JSON.parse(json)
      store.setTables(tables)
    }
  } catch (e) {
    console.error("Erro ao carregar dados:", e)
  }
}

// Salva os dados no AsyncStorage
export async function saveStore() {
  try {
    const tables = store.getTables()
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tables))
  } catch (e) {
    console.error("Erro ao salvar dados:", e)
  }
}

// Salva automaticamente sempre que o store mudar
store.addTablesListener(() => {
  saveStore()
})

// Carrega ao iniciar
loadStore()