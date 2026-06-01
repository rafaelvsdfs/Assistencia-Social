import { StyleSheet, Text, View, Pressable, TextInput, Alert, Modal, ScrollView } from 'react-native';
import { useState } from 'react';
import { store, TABLE_NAME } from '../services/store';
import { enviarAtendimento } from '../services/supabase';

type ProtocoloStore = {
  name: string
  atendido: string
  cpf: string
  descricao: string
  categoria: string
  done: boolean
  status: boolean
}

type Protocolo = ProtocoloStore & { id: string }

const CATEGORIAS = [
  { label: 'Alimentação', value: 'alimentacao' },
  { label: 'Saúde', value: 'saude' },
  { label: 'Educação', value: 'educacao' },
  { label: 'Assistência Social', value: 'assistencia_social' },
]

function formatarCPF(valor: string): string {
  const nums = valor.replace(/\D/g, '').slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
}

function cpfValido(cpf: string): boolean {
  const nums = cpf.replace(/\D/g, '');
  return nums.length === 11;
}

export default function Formulario({ navigation }) {
  const [name, setName] = useState('');
  const [atendido, setAtendido] = useState('');
  const [cpf, setCpf] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const categoriaLabel = CATEGORIAS.find(c => c.value === categoria)?.label ?? null;

  function handleCpfChange(texto: string) {
    setCpf(formatarCPF(texto));
  }

  async function add() {
    if (name.trim() === "") {
      return Alert.alert("Atenção", "Informe o agente de campo")
    }
    if (atendido.trim() === "") {
      return Alert.alert("Atenção", "Informe o nome do atendido")
    }
    if (!cpfValido(cpf)) {
      return Alert.alert("Atenção", "CPF inválido. Digite os 11 dígitos.")
    }
    if (descricao.trim() === "") {
      return Alert.alert("Atenção", "Informe a descrição do atendimento")
    }
    if (categoria === "") {
      return Alert.alert("Atenção", "Selecione a categoria do atendimento")
    }

    setLoading(true)

    const id = Math.random().toString(30).substring(2, 20)

    const enviado = await enviarAtendimento({ description: descricao, name, atendido, cpf, categoria, done: false })

    store.setRow(TABLE_NAME, id, { descricao, name, atendido, cpf, categoria, done: false, status: enviado })

    setLoading(false)
    setName("")
    setDescricao("")
    setCategoria("")
    setAtendido("")
    setCpf("")

    Alert.alert(
      enviado ? "Sucesso" : "Salvo localmente",
      enviado ? "Atendimento registrado e enviado!" : "Sem conexão, salvo no dispositivo.",
      [{ text: "OK", onPress: () => navigation.navigate('Status01') }]
    )
  }

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.overlay} onPress={() => navigation.navigate('Home')}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>

          <View style={styles.modalHeader}>
            <View style={styles.modalBarra} />
            <Text style={styles.modalTitulo}>Identificação do Agente</Text>
            <Text style={styles.modalSubtitulo}>Preencha antes de continuar</Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >

            <View style={styles.campoWrapper}>
              <Text style={styles.label}>Nome do agente de campo</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu nome"
                placeholderTextColor="#bbb"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.campoWrapper}>
              <Text style={styles.label}>Nome do atendido</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite o nome do atendido"
                placeholderTextColor="#bbb"
                value={atendido}
                onChangeText={setAtendido}
              />
            </View>

            <View style={styles.campoWrapper}>
              <Text style={styles.label}>CPF do atendido</Text>
              <TextInput
                style={[styles.input, cpf.length > 0 && !cpfValido(cpf) && styles.inputErro]}
                placeholder="000.000.000-00"
                placeholderTextColor="#bbb"
                keyboardType="numeric"
                maxLength={14}
                value={cpf}
                onChangeText={handleCpfChange}
              />
              {cpf.length > 0 && !cpfValido(cpf) && (
                <Text style={styles.erroTexto}>Digite os 11 dígitos do CPF</Text>
              )}
            </View>

            <View style={styles.campoWrapper}>
              <Text style={styles.label}>Descrição do atendimento</Text>
              <TextInput
                style={[styles.input, styles.inputMultilinha]}
                placeholder="Descreva o atendimento"
                placeholderTextColor="#bbb"
                multiline
                numberOfLines={3}
                value={descricao}
                onChangeText={setDescricao}
              />
            </View>

            <View style={styles.campoWrapper}>
              <Text style={styles.label}>Categoria</Text>

              <Pressable
                style={[styles.input, styles.selectInput]}
                onPress={() => setDropdownOpen(true)}
              >
                <Text style={categoriaLabel ? styles.selectTexto : styles.selectPlaceholder}>
                  {categoriaLabel ?? 'Selecione uma categoria'}
                </Text>
                <Text style={styles.selectArrow}>›</Text>
              </Pressable>

              <Modal
                visible={dropdownOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setDropdownOpen(false)}
              >
                <Pressable style={styles.dropdownOverlay} onPress={() => setDropdownOpen(false)}>
                  <View style={styles.dropdownCard}>
                    <Text style={styles.dropdownTitulo}>Categoria</Text>
                    {CATEGORIAS.map((cat, index) => (
                      <Pressable
                        key={cat.value}
                        style={[
                          styles.dropdownItem,
                          index < CATEGORIAS.length - 1 && styles.dropdownItemBorda,
                          categoria === cat.value && styles.dropdownItemAtivo,
                        ]}
                        onPress={() => {
                          setCategoria(cat.value)
                          setDropdownOpen(false)
                        }}
                      >
                        <Text style={[
                          styles.dropdownItemTexto,
                          categoria === cat.value && styles.dropdownItemTextoAtivo,
                        ]}>
                          {cat.label}
                        </Text>
                        {categoria === cat.value && (
                          <Text style={styles.dropdownCheck}>✓</Text>
                        )}
                      </Pressable>
                    ))}
                  </View>
                </Pressable>
              </Modal>
            </View>

          </ScrollView>

          <Pressable style={[styles.botaoModal, loading && { opacity: 0.6 }]} onPress={add} disabled={loading}>
            <Text style={styles.botaoTexto}>{loading ? "Enviando..." : "Enviar"}</Text>
          </Pressable>

        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#ecf0f1' },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 600,
    maxHeight: '60%',
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 24,
    elevation: 8,
    gap: 16,
  },
  modalHeader: { alignItems: 'center', gap: 6, marginBottom: 16 },
  modalBarra: {
    width: 40, height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2, marginBottom: 8,
  },
  modalTitulo: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  modalSubtitulo: { fontSize: 12, color: '#999' },
  scrollContent: {
    gap: 16,
    paddingBottom: 28,
  },
  campoWrapper: { gap: 6 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#444' },
  input: {
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111',
  },
  inputErro: {
    borderColor: '#e57373',
    backgroundColor: '#fff5f5',
  },
  erroTexto: {
    fontSize: 11,
    color: '#e57373',
    marginTop: 2,
    marginLeft: 2,
  },
  inputMultilinha: { height: 80, textAlignVertical: 'top' },

  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectTexto: {
    fontSize: 14,
    color: '#111',
  },
  selectPlaceholder: {
    fontSize: 14,
    color: '#bbb',
  },
  selectArrow: {
    fontSize: 20,
    color: '#bbb',
    transform: [{ rotate: '90deg' }],
    lineHeight: 22,
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  dropdownCard: {
    padding: 20,
    paddingBottom: 30,
    borderRadius: 20,
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 500,
    overflow: 'hidden',
    elevation: 10,
  },
  dropdownTitulo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#999',
    paddingHorizontal: 16,
    paddingVertical: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemBorda: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemAtivo: {
    backgroundColor: '#f7f7f7',
  },
  dropdownItemTexto: {
    fontSize: 15,
    color: '#111',
  },
  dropdownItemTextoAtivo: {
    fontWeight: 'bold',
    color: '#111',
  },
  dropdownCheck: {
    fontSize: 15,
    color: '#111',
    fontWeight: 'bold',
  },

  botaoModal: {
    backgroundColor: '#111',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  botaoTexto: { color: '#fff', fontWeight: 'bold', letterSpacing: 1 },
});