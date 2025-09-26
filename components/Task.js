import React from "react";
import { StyleSheet, Text, View } from 'react-native';

const Task = ({ text, completed}) => {
  return (
    <View style={[styles.item, completed && styles.completedItem]}>
        <Text style={[styles.itemText, completed && styles.completedText]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    completedItem: {
        backgroundColor: '#d1ffd6',
    },
    itemText: {
        maxWidth: '80%',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#888',
    },
});
export default Task;