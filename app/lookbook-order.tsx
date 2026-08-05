import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import DraggableFlatList from 'react-native-draggable-flatlist';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL!;

export default function LookbookOrderScreen() {
  const router = useRouter();

  const [lookbooks, setLookbooks] = useState<any[]>([]);

  const loadLookbooks = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/get-collections`
      );

      if (res.data.success) {
        setLookbooks(res.data.collections);
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadLookbooks();
  }, []);

  const saveOrder = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/update-collection-order`,
        {
          collections: lookbooks.map((item, index) => ({
            id: item.id,
            order: index + 1,
          })),
        }
      );

      router.back();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="close"
            size={28}
            color="#111"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          룩북 순서 편집
        </Text>

        <TouchableOpacity onPress={saveOrder}>
          <Text style={styles.done}>
            완료
          </Text>
        </TouchableOpacity>

      </View>

      <DraggableFlatList
        data={lookbooks}
        keyExtractor={(item) => String(item.id)}
        onDragEnd={({ data }) => setLookbooks(data)}
        renderItem={({ item, drag, isActive }) => (
          <View
            style={[
              styles.item,
              isActive && {
                backgroundColor: '#F7F7F7',
              },
            ]}
          >
            <Text style={styles.itemName}>
              {item.name}
            </Text>

            <TouchableOpacity onPressIn={drag}>
              <Ionicons
                name="menu"
                size={24}
                color="#999"
              />
            </TouchableOpacity>
          </View>
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    height: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },

  done: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FF5C8A',
  },

  item: {
    height: 64,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },

  itemName: {
    fontSize: 17,
    fontWeight: '500',
    color: '#111111',
  },
});