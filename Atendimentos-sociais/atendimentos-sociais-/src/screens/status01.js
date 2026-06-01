import { StyleSheet, Text, View, Pressable, FlatList } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { store, TABLE_NAME } from '../services/store';
import Item from './Item';

export default function Status01({ navigation }) {
  const [protocolos, setProtocolos] = useState([]);

  useFocusEffect(
    useCallback(() => {
      function get() {
        const data = store.getTable(TABLE_NAME);
        const response = Object.entries(data).map(([id, item]) => ({
          id,
          description: String(item.descricao),
          name: String(item.name),
          categoria: String(item.categoria ?? ''),
          done: Boolean(item.done),
          status: Boolean(item.status),
        }));
        setProtocolos(response);
      }

      const listener = store.addTableListener(TABLE_NAME, get)
      get();

      return () => {
        store.delListener(listener)
      }
    }, [])
  );

  function handleStatus(id) {
    const item = store.getRow(TABLE_NAME, id);
    store.setRow(TABLE_NAME, id, { ...item, done: !item.done });

    setProtocolos(prev =>
      prev.map(p => p.id === id ? { ...p, done: !p.done } : p)
    );
  }

  function handleRemove(id) {
    store.delRow(TABLE_NAME, id);
    setProtocolos(prev => prev.filter(p => p.id !== id));
  }

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.overlay} onPress={() => navigation.navigate('Home')}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>

          <View style={styles.modalHeader}>
            <View style={styles.modalBarra} />
            <Text style={styles.modalTitulo}>Status dos Atendimentos</Text>
            <Text style={styles.modalSubtitulo}>Registros salvos no dispositivo</Text>
          </View>

          <View style={styles.separador} />

          <FlatList
            data={protocolos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Item
                data={item}
                onStatus={() => handleStatus(item.id)}
                onRemove={() => handleRemove(item.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <Text style={styles.empty}>Nenhum atendimento registrado.</Text>
            )}
            style={styles.list}
          />

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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,  
  }, 
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',        
    maxWidth: 600,        
    paddingVertical: 24,
    paddingHorizontal: 24,
    gap: 12,
    elevation: 8,
    maxHeight: '70%',
  }, 
  modalHeader: { alignItems: 'center', gap: 4 },
  modalBarra: {
    width: 40, height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2, marginBottom: 6,
  },
  modalTitulo: { fontSize: 17, fontWeight: 'bold', color: '#222', textAlign: 'center' },
  modalSubtitulo: { fontSize: 12, color: '#888', textAlign: 'center' },
  separador: { height: 1, backgroundColor: '#eee' },
  list: { maxHeight: 320 },
  listContent: { gap: 0, paddingVertical: 4 },
  separator: { height: 8 },
  empty: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 14,
    paddingVertical: 24,
  },
});