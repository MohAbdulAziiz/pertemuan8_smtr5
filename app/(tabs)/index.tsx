import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  Platform,
  Animated,
  Easing,
  RefreshControl
} from 'react-native';

interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  kelas: string;
  points: string;
}

const AnimatedCard = ({ item, index }: { item: Mahasiswa; index: number }) => {
  const cardAnim = useState(new Animated.Value(0))[0];
  
  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 600,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const cardOpacity = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View 
      style={[
        styles.card,
        {
          opacity: cardOpacity,
          transform: [{ translateY: cardTranslateY }]
        }
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.nama.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.nama}>{item.nama}</Text>
          <Text style={styles.nim}>NIM: {item.nim}</Text>
        </View>
        <View style={[
          styles.pointsBadge, 
          parseInt(item.points) > 80 ? styles.pointsHigh : 
          parseInt(item.points) > 60 ? styles.pointsMedium : 
          styles.pointsLow
        ]}>
          <Text style={styles.pointsText}>{item.points}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Kelas:</Text>
          <Text style={styles.value}>{item.kelas}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.label}>Progress:</Text>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  width: `${Math.min(100, parseInt(item.points))}%`,
                  backgroundColor: parseInt(item.points) > 80 ? '#4CAF50' : 
                                  parseInt(item.points) > 60 ? '#FF9800' : '#F44336'
                }
              ]} 
            />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default function IndexScreen() {
  const [data, setData] = useState<Mahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animasi values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleValue = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      startAnimations();
    }
  }, [loading, error]);

  const fetchData = async () => {
    try {
      // Gunakan proxy untuk menghindari CORS di web
      const url =
        Platform.OS === 'web'
          ? 'https://api.allorigins.win/get?url=' +
            encodeURIComponent('https://mmc-clinic.com/dipa/api/mhs.php')
          : 'https://mmc-clinic.com/dipa/api/mhs.php';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari server');
      }

      // Jika pakai proxy, data dikembalikan dalam format berbeda
      const result = await response.json();
      const jsonData =
        Platform.OS === 'web' ? JSON.parse(result.contents).data : result.data;

      if (Array.isArray(jsonData)) {
        setData(jsonData);
      } else {
        throw new Error('Format data tidak sesuai');
      }
    } catch (err: any) {
      console.error('❌ Terjadi kesalahan:', err.message);
      setError('Tidak dapat memuat data. Periksa koneksi atau coba ulangi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleValue.setValue(0.9);
    fetchData();
  };

  const renderItem = ({ item, index }: { item: Mahasiswa; index: number }) => {
    return <AnimatedCard item={item} index={index} />;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Memuat data mahasiswa...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Animated.View 
          style={[
            styles.errorContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={fetchData}>
            Tap untuk mencoba lagi
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleValue }]
          }
        ]}
      >
        <Text style={styles.title}>🎓 Data Mahasiswa</Text>
        <Text style={styles.subtitle}>
          {data.length} mahasiswa terdaftar
        </Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6366F1']}
              tintColor="#6366F1"
            />
          }
          contentContainerStyle={styles.listContent}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    marginHorizontal: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  retryText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerText: {
    flex: 1,
  },
  nama: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  nim: {
    fontSize: 14,
    color: '#64748B',
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 50,
    alignItems: 'center',
  },
  pointsHigh: {
    backgroundColor: '#DCFCE7',
  },
  pointsMedium: {
    backgroundColor: '#FEF9C3',
  },
  pointsLow: {
    backgroundColor: '#FEE2E2',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  cardBody: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});