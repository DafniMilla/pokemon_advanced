// app/pokemons/index.tsx
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Pokemon {
  name: string;
  url: string;
  types?: string[];
}

const PAGE_LIMIT = 20;
const MAX_CONCURRENT_FETCHES = 5;
const CACHE_TTL = 1000 * 60 * 60; // 1 hora

// Cache em memória
let memoryCache: Record<string, any> = {};

// Cores típicas para cada tipo
const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export default function PokemonList() {
  const router = useRouter();
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  // --- Verifica conexão ---
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // --- Cache helper ---
  const getCachedData = async (key: string) => {
    const now = Date.now();

    // 1. memória
    if (memoryCache[key] && now - memoryCache[key].timestamp < CACHE_TTL) {
      return memoryCache[key].data;
    }

    // 2. AsyncStorage
    const cached = await AsyncStorage.getItem(key);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (now - parsed.timestamp < CACHE_TTL) {
        memoryCache[key] = parsed; // atualiza memória
        return parsed.data;
      }
    }

    return null;
  };

  const setCache = async (key: string, data: any) => {
    const cacheObj = { timestamp: Date.now(), data };
    memoryCache[key] = cacheObj;
    await AsyncStorage.setItem(key, JSON.stringify(cacheObj));
  };

  // --- Fetch Tipos ---
  const fetchTypes = async () => {
    try {
      const cached = await getCachedData("types");
      if (cached) {
        setTypes(cached);
        return;
      }

      const res = await fetch("https://pokeapi.co/api/v2/type");
      const data = await res.json();
      const allTypes = data.results.map((t: any) => t.name);
      setTypes(allTypes);
      setCache("types", allTypes);
    } catch (err) {
      console.error("Erro ao buscar tipos:", err);
    }
  };

  // --- Fetch Pokémons ---
  const fetchPokemons = async (pageOffset: number) => {
    try {
      setLoading(true);
      const cacheKey = `pokemons_${pageOffset}`;
      const cached = await getCachedData(cacheKey);
      if (cached) {
        setPokemons(prev => [...prev, ...cached]);
        if (!isOffline) refreshPokemonsInBackground(pageOffset); // refresh em background
        return;
      }

      if (isOffline) {
        Alert.alert("Offline", "Você está offline e não há cache disponível.");
        return;
      }

      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_LIMIT}&offset=${pageOffset}`);
      const data = await res.json();
      const results: Pokemon[] = [];

      for (let i = 0; i < data.results.length; i += MAX_CONCURRENT_FETCHES) {
        const chunk = data.results.slice(i, i + MAX_CONCURRENT_FETCHES);
        const promises = chunk.map(async (p: Pokemon) => {
          try {
            const res = await fetch(p.url);
            const details = await res.json();
            return { ...p, types: details.types.map((t: any) => t.type.name) };
          } catch {
            return { ...p, types: [] };
          }
        });
        results.push(...(await Promise.all(promises)));
      }

      setPokemons(prev => [...prev, ...results]);
      setCache(cacheKey, results);
    } catch (err) {
      console.error("Erro ao buscar pokémons:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Refresh em background ---
  const refreshPokemonsInBackground = async (pageOffset: number) => {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PAGE_LIMIT}&offset=${pageOffset}`);
      const data = await res.json();
      const results: Pokemon[] = [];

      for (let i = 0; i < data.results.length; i += MAX_CONCURRENT_FETCHES) {
        const chunk = data.results.slice(i, i + MAX_CONCURRENT_FETCHES);
        const promises = chunk.map(async (p: Pokemon) => {
          try {
            const res = await fetch(p.url);
            const details = await res.json();
            return { ...p, types: details.types.map((t: any) => t.type.name) };
          } catch {
            return { ...p, types: [] };
          }
        });
        results.push(...(await Promise.all(promises)));
      }

      setCache(`pokemons_${pageOffset}`, results);
    } catch {
      // fail silently
    }
  };

  useEffect(() => { fetchTypes(); }, []);
  useEffect(() => { fetchPokemons(offset); }, [offset]);

  // --- Filtrar pokémons ---
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      let list = pokemons;
      if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      if (selectedType) list = list.filter(p => p.types?.includes(selectedType));
      setFilteredPokemons(list);
    }, 300);

    return () => searchTimeout.current && clearTimeout(searchTimeout.current);
  }, [search, selectedType, pokemons]);

  const handleEndReached = () => { if (!loading) setOffset(prev => prev + PAGE_LIMIT); };

  // --- Carrossel de tipos ---
  const TypeCarousel = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilterContainer}>
      <TouchableOpacity
        style={[styles.typeButton, selectedType === null && styles.typeButtonSelected, { backgroundColor: selectedType === null ? '#af0000ff' : '#777' }]}
        onPress={() => setSelectedType(null)}
      >
        <Text style={styles.typeButtonText}>Todos</Text>
      </TouchableOpacity>
      {types.map(t => (
        <TouchableOpacity
          key={t}
          style={[styles.typeButton, selectedType === t && styles.typeButtonSelected, { backgroundColor: TYPE_COLORS[t] || '#777' }]}
          onPress={() => setSelectedType(t)}
        >
          <Text style={styles.typeButtonText}>{t}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {isOffline && <Text style={styles.offlineText}>Você está offline</Text>}

      <View style={styles.header}>
        <TouchableOpacity style={styles.home} onPress={() => router.push("/")}>
          <Ionicons name="home" size={28} color="#af0000ff" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Pesquisar Pokémon..."
          value={search}
          onChangeText={setSearch}
        />

        <TypeCarousel />
      </View>

      <View style={styles.pokemonListContainer}>
        <Text style={styles.title}>Pokémons</Text>
        <FlatList
          data={filteredPokemons}
          keyExtractor={item => item.name}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => router.push({ pathname: "/detalhes/[id]", params: { name: item.name } })}
            >
              <Text style={styles.name}>{item.name.toUpperCase()}</Text>
              <Text style={styles.types}>{item.types?.join(", ")}</Text>
            </TouchableOpacity>
          )}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading ? <ActivityIndicator size="large" color="#af0000ff" /> : null}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#bdbdbdff", padding: 20 },
  offlineText: { textAlign: "center", color: "red", marginBottom: 5 },
  header: { marginBottom: 10 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10, color: "#af0000ff" },
  input: { height: 45, borderColor: '#af0000ff', borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, marginBottom: 10 },
  typeFilterContainer: { marginBottom: 10 },
  typeButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, marginRight: 8 },
  typeButtonSelected: { borderWidth: 2, borderColor: '#000' },
  typeButtonText: { color: '#fff', fontWeight: 'bold', textTransform: 'capitalize' },
  pokemonListContainer: { flex: 1 },
  item: { padding: 15, backgroundColor: "#f1f1f1", marginBottom: 8, borderRadius: 10 },
  name: { fontSize: 16, textTransform: "capitalize" },
  types: { fontSize: 12, color: "#444" },
  home: { marginBottom: 10 },
});
