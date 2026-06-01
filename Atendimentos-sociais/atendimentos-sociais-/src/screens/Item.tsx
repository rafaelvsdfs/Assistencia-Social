import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const CATEGORIA_LABELS: Record<string, string> = {
  alimentacao: 'Alimentação',
  saude: 'Saúde',
  educacao: 'Educação',
  assistencia_social: 'Assistência Social',
}

type ItemData = {
  done: boolean
  description: string
  name: string
  atendido: string
  categoria: string
  status: boolean
}

type Props = {
  data: ItemData
  onRemove: () => void
}

export default function Item({ data, onRemove }: Props) {
  const enviado = data.status ?? false
  const categoriaLabel = CATEGORIA_LABELS[data.categoria] ?? data.categoria ?? '—'

  return (
    <View style={styles.container}>
      <View style={[styles.barra, enviado ? styles.barrEnviado : styles.barraPendente]} />

      <View style={styles.info}>
        <Text style={styles.agente}>Agente: {data.name}</Text>
        <Text style={styles.agente}>Atendido: {data.atendido}</Text>
        <Text style={styles.description}>{data.description}</Text>
        <View style={styles.categoriaTag}>
          <Text style={styles.categoriaTexto}>{categoriaLabel}</Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <View style={[styles.badge, enviado ? styles.badgeEnviado : styles.badgePendente]}>
          <MaterialIcons
            name={enviado ? "check-circle" : "schedule"}
            size={12}
            color={enviado ? "#2e7d32" : "#e65100"}
          />
          <Text style={[styles.badgeText, enviado ? styles.badgeTextEnviado : styles.badgeTextPendente]}>
            {enviado ? "ENVIADO" : "PENDENTE"}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={onRemove}>
          <MaterialIcons name="delete-outline" size={22} color="#e57373" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#fff',
    overflow: 'hidden',
    gap: 12,
    elevation: 1,
  },
  barra: {
    width: 4,
  },
  barraPendente: {
    backgroundColor: '#e65100',
  },
  barrEnviado: {
    backgroundColor: '#2e7d32',
  },
  info: {
    flex: 1,
    gap: 4,
    paddingVertical: 12,
  },
  agente: {
    fontSize: 12,
    color: '#888',
  },
  description: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
  },
  categoriaTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  categoriaTexto: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
  },
  rightCol: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingRight: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgePendente: {
    backgroundColor: '#fff3e0',
  },
  badgeEnviado: {
    backgroundColor: '#e8f5e9',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTextPendente: {
    color: '#e65100',
  },
  badgeTextEnviado: {
    color: '#2e7d32',
  },
});