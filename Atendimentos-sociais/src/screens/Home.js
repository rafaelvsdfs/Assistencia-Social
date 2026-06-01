import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import { sincronizarPendentes } from '../services/supabase';
import { store, TABLE_NAME } from '../services/store';
const IconeNota = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M8 2v4"/><Path d="M12 2v4"/><Path d="M16 2v4"/>
    <Rect width="16" height="18" x="4" y="4" rx="2"/>
    <Path d="M8 10h6"/><Path d="M8 14h8"/><Path d="M8 18h5"/>
  </Svg>
);

const IconeSync = ({ color = 'black' }) => (
  <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="m2 9 3-3 3 3"/>
    <Path d="M13 18H7a2 2 0 0 1-2-2V6"/>
    <Path d="m22 15-3 3-3-3"/>
    <Path d="M11 6h6a2 2 0 0 1 2 2v10"/>
  </Svg>
);

const IconePin = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M12 17v5"/>
    <Path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
  </Svg>
);

export default function Home({ navigation }) {
  const [sincronizando, setSincronizando] = useState(false);

  async function handleSincronizar() {
    const data = store.getTable(TABLE_NAME);
    const pendentes = Object.values(data).filter(item => !item.status);

    if (pendentes.length === 0) {
      return Alert.alert('Tudo certo!', 'Não há registros pendentes para sincronizar.');
    }

    setSincronizando(true);
    const { enviados, falhas, total } = await sincronizarPendentes();
    setSincronizando(false);

    if (falhas === 0) {
      Alert.alert('Sincronizado!', `${enviados} atendimento(s) enviado(s) com sucesso.`);
    } else {
      Alert.alert('Parcial', `${enviados} enviado(s), ${falhas} falha(s). Verifique a conexão.`);
    }
  }

  return (
    <View style={styles.container}>

      <View style={styles.topo}>
        <Text style={styles.titulo}>Atendimento Social</Text>
        <Text style={styles.subtitulo}>Registre atendimentos mesmo sem internet</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardLinha}>
          <IconeNota />
          <View>
            <Text style={styles.cardTitulo}>Registro offline</Text>
            <Text style={styles.cardDesc}>Seus dados ficam salvos no dispositivo</Text>
          </View>
        </View>

        <View style={styles.divisor} />

        <View style={styles.cardLinha}>
          <IconeSync />
          <View>
            <Text style={styles.cardTitulo}>Sincronização</Text>
            <Text style={styles.cardDesc}>Enviado quando houver conexão</Text>
          </View>
        </View>

        <View style={styles.divisor} />

        <View style={styles.cardLinha}>
          <IconePin />
          <View>
            <Text style={styles.cardTitulo}>Monitoramento de status</Text>
            <Text style={styles.cardDesc}>Acompanhe cada atendimento registrado</Text>
          </View>
        </View>
      </View>

      <View style={styles.acoes}>
        <Pressable
          style={styles.botao}
          onPress={() => navigation.navigate('Formulario')}
        >
          <Text style={styles.botaoTexto}>NOVO ATENDIMENTO</Text>
        </Pressable>

        <Pressable
          style={[styles.botaoSync, sincronizando && { opacity: 0.6 }]}
          onPress={handleSincronizar}
          disabled={sincronizando}
        >
          <IconeSync color="#111" />
          <Text style={styles.botaoSyncTexto}>
            {sincronizando ? 'SINCRONIZANDO...' : 'SINCRONIZAR DADOS'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Status01')}>
          <Text style={styles.statusLink}>Ver Status de envio</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  topo: {
    alignItems: 'center',
    gap: 8,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111',
  },
  subtitulo: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '100%', 
    maxWidth: 600,
    borderRadius: 12,
    padding: 20,
    gap: 4,
  },
  cardLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  cardTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
  },
  cardDesc: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  divisor: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  acoes: {
    width: '100%', 
    alignItems: 'center',
    gap: 16,
  },
  botao: {
    backgroundColor: '#111',
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: 600,
  },
  botaoTexto: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  botaoSync: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    width: '100%',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#111',
    maxWidth: 600,
  },
  botaoSyncTexto: {
    color: '#111',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 14,
  },
  statusLink: {
    color: '#555',
    fontSize: 14,
  },
});