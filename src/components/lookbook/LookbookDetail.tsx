import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function LookbookDetail() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View
        style={{
          height: 60,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity>
          <Ionicons
            name="chevron-back"
            size={28}
            color="#111"
          />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: '#111',
          }}
        >
          2026.07.27
        </Text>

        <TouchableOpacity>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color="#111"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}