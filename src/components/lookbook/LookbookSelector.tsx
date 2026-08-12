import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Props = {
  collections: any[];
  selectedCollections: any[];
  isCollectionOpen: boolean;
  showCreateInput: boolean;
  newCollectionName: string;

  onToggleOpen: () => void;
  onToggleCollection: (item: any) => void;
  onToggleCreateInput: () => void;
  onChangeNewCollectionName: (text: string) => void;
  onCreateCollection: () => void;
};

export default function LookbookSelector({
  collections,
  selectedCollections,
  isCollectionOpen,
  showCreateInput,
  newCollectionName,

  onToggleOpen,
  onToggleCollection,
  onToggleCreateInput,
  onChangeNewCollectionName,
  onCreateCollection,
}: Props) {
  return (
    <>
       <TouchableOpacity
            style={styles.dropdownButton}
            onPress={onToggleOpen}
            >
            <View>
                <Text style={styles.dropdownTitle}>
                룩북 선택
                </Text>

                <Text style={styles.dropdownSubtitle}>
                {selectedCollections.length === 0
                    ? '선택된 룩북이 없습니다.'
                    : selectedCollections.length === 1
                    ? selectedCollections[0].name
                    : `${selectedCollections[0].name} 외 ${
                        selectedCollections.length - 1
                    }개`}
                </Text>
            </View>

            <Ionicons
                name={
                isCollectionOpen
                    ? 'chevron-up'
                    : 'chevron-down'
                }
                size={22}
                color="#666"
            />
            </TouchableOpacity>

      {isCollectionOpen && (
        <ScrollView
          style={styles.collectionList}
          nestedScrollEnabled
        >
          <TouchableOpacity
            style={styles.collectionItem}
            onPress={onToggleCreateInput}
          >
            <Text style={styles.addCollectionText}>
              ➕ 새 룩북 만들기
            </Text>
          </TouchableOpacity>

          {showCreateInput && (
            <View style={styles.createInputContainer}>
              <TextInput
                placeholder="새 룩북 이름"
                value={newCollectionName}
                onChangeText={onChangeNewCollectionName}
                style={styles.createInput}
              />

              <TouchableOpacity
                style={styles.createCircleButton}
                onPress={onCreateCollection}
              >
                <Ionicons
                  name="add"
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          )}

          {collections.map(item => {
            const checked =
              selectedCollections.some(
                c => c.id === item.id
              );

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.collectionItem}
                onPress={() =>
                  onToggleCollection(item)
                }
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={styles.collectionText}>
                    {item.name}
                  </Text>

                  <Ionicons
                    name={
                      checked
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={22}
                    color="#FF5C8A"
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    backgroundColor: '#F7F7F7',

    borderRadius: 16,

    paddingHorizontal: 16,
    paddingVertical: 16,

    minHeight: 64,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginBottom: 12,
    },

  dropdownText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#111',
  },

  collectionList: {
    maxHeight: 220,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 16,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },

  collectionItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,

    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },

  addCollectionText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FF5C8A',
    paddingVertical: 3,
  },

  collectionText: {
    fontSize: 15,
    color: '#111',
  },

  createInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,

    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  createInput: {
    flex: 1,
    height: 44,

    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,

    paddingHorizontal: 14,
    backgroundColor: '#FFF',
  },

  createCircleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: '#FF5C8A',

    justifyContent: 'center',
    alignItems: 'center',
  },

    dropdownTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111',
        },

    dropdownSubtitle: {
        marginTop: 4,
        fontSize: 13,
        color: '#888',
        },
    });