import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Task from './components/Task';

const STORAGE_KEY = 'TASKS_V1';

export default function App() {
  const [task, setTask] = useState('');
  const [taskItems, setTaskItems] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');

  // Carrega tarefas
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setTaskItems(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  // Persiste tarefas
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(taskItems)).catch(() => {});
  }, [taskItems]);

  const handleAddTask = () => {
    const t = task.trim();
    if (!t) return;
    setTaskItems(prev => [...prev, { id: Date.now().toString(), text: t, completed: false }]);
    setTask('');
  };

  const toggleComplete = (index) => {
    setTaskItems(prev =>
      prev.map((item, i) => i === index ? { ...item, completed: !item.completed } : item)
    );
  };

  const removeTask = (index) => {
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditText('');
    }
    setTaskItems(prev => prev.filter((_, i) => i !== index));
  };

  const startEdit = (index) => {
    setEditingIndex(index);
    setEditText(taskItems[index].text);
  };

  const confirmEdit = () => {
    if (editingIndex === null) return;
    const value = editText.trim();
    if (!value) {
      setEditingIndex(null);
      setEditText('');
      return;
    }
    setTaskItems(prev =>
      prev.map((t, i) => i === editingIndex ? { ...t, text: value } : t)
    );
    setEditingIndex(null);
    setEditText('');
  };

  const clearCompleted = () => {
    setTaskItems(prev => prev.filter(t => !t.completed));
    if (editingIndex !== null && taskItems[editingIndex]?.completed) {
      setEditingIndex(null);
      setEditText('');
    }
  };

  const dismissKeyboard = () => Keyboard.dismiss();

  const renderItem = useCallback(({ item, index }) => (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.taskTouchable}
        activeOpacity={0.7}
        onPress={() => toggleComplete(index)}
        onLongPress={() => startEdit(index)}
        accessibilityRole="button"
        accessibilityLabel={`Tarefa ${item.text} ${item.completed ? 'concluída' : 'ativa'}`}
      >
        {editingIndex === index ? (
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            autoFocus
            onBlur={confirmEdit}
            onSubmitEditing={confirmEdit}
            returnKeyType="done"
          />
        ) : (
          <Task text={item.text} completed={item.completed} />
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => removeTask(index)} style={styles.deleteButton} accessibilityLabel="Eliminar tarefa">
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  ), [editingIndex, editText, taskItems]);

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.taskWrapper}>
          <Text style={styles.sectionTitle}>Today's tasks</Text>

          <View style={styles.metaBar}>
            <Text style={styles.metaText}>
              Total: {taskItems.length} | Done: {taskItems.filter(t => t.completed).length}
            </Text>
            <TouchableOpacity onPress={clearCompleted} disabled={!taskItems.some(t => t.completed)}>
              <Text style={[styles.clearText, !taskItems.some(t => t.completed) && styles.clearDisabled]}>
                Clear done
              </Text>
            </TouchableOpacity>
          </View>

            <FlatList
              data={taskItems}
              keyExtractor={item => item.id}
              contentContainerStyle={taskItems.length === 0 && { paddingTop: 40 }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No tasks yet. Add one below.
                </Text>
              }
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
            />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.writeTaskWrapper}
        >
          <TextInput
            style={styles.input}
            placeholder="Write a task"
            value={task}
            onChangeText={setTask}
            returnKeyType="done"
            onSubmitEditing={handleAddTask}
          />
          <TouchableOpacity onPress={handleAddTask}>
            <View style={styles.addWrapper}>
              <Text style={styles.addText}>+</Text>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e3d9d9ff' },
  taskWrapper: { paddingTop: 80, paddingHorizontal: 20, flex: 1 },
  sectionTitle: { fontSize: 24, fontWeight: 'bold' },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    alignItems: 'center'
  },
  metaText: { fontSize: 12, opacity: 0.6 },
  clearText: { fontSize: 12, color: '#d00' },
  clearDisabled: { opacity: 0.3 },
  emptyText: { textAlign: 'center', color: '#555', opacity: 0.5 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  taskTouchable: { flex: 1 },
  deleteButton: {
    marginLeft: 10,
    marginBottom: 20,
    backgroundColor: '#ff4d4d',
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  writeTaskWrapper: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 60,
    borderColor: '#c0c0c0',
    borderWidth: 1,
    width: 250
  },
  addWrapper: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#c0c0c0',
    borderWidth: 1
  },
  addText: { fontSize: 26, fontWeight: 'bold' },
  editInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16
  }
});