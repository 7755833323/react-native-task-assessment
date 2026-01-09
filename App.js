
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostCard from './components/PostCard';
import Skeleton from './components/Skeleton';

export default function App() {
  const [posts, setPosts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const saved = await AsyncStorage.getItem('search');
    if (saved) setSearch(saved);
    fetchPosts();
  };

  const fetchPosts = async () => {
    try {
      setError(false);
      const res = await fetch('https://jsonplaceholder.typicode.com/posts');
      const data = await res.json();
      setPosts(data);
      setFiltered(
        data.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
      );
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    AsyncStorage.setItem('search', search);
    setFiltered(
      posts.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search]);

  if (loading) return <Skeleton />;
  if (error) return <Text style={styles.center}>Unable to fetch posts. Check your network connection.</Text>;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search posts..."
        value={search}
        onChangeText={setSearch}
      />
      {filtered.length === 0 ? (
        <Text style={styles.center}>No posts found.</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <PostCard post={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {
              setRefreshing(true);
              fetchPosts();
            }} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:10 },
  input: { borderWidth:1, padding:8, marginBottom:10, borderRadius:6 },
  center: { textAlign:'center', marginTop:20 }
});
