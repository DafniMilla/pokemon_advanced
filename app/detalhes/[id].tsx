// // app/detalhes/[id].tsx
// import { Ionicons } from "@expo/vector-icons";
// import { Stack, useLocalSearchParams, useRouter } from "expo-router";
// import React, { useEffect, useState } from "react";
// import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from "react-native";

// // Interface para tipagem do Pokémon
// interface PokemonDetail {
//   name: string;
//   height: number;
//   weight: number;
//   abilities: { ability: { name: string; url: string } }[];
//   stats: { base_stat: number; stat: { name: string; url: string } }[];
//   sprites: { front_default: string };
//   types: { type: { name: string; url: string } }[];
// }

// export default function PokemonDetailScreen() {
//   const { name } = useLocalSearchParams<{ name: string }>();
//   const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   // --- Busca dados do Pokémon ---
//   useEffect(() => {
//     if (!name) return;

//     setLoading(true);
//     setError(null);

//     fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
//       .then(res => {
//         if (!res.ok) throw new Error("Erro ao buscar dados do Pokémon");
//         return res.json();
//       })
//       .then(data => setPokemon(data))
//       .catch(() => setError("Não foi possível carregar os detalhes do Pokémon."))
//       .finally(() => setLoading(false));
//   }, [name]);

//   // --- Placeholder simples enquanto carrega ---
//   if (loading) {
//     return (
//       <ScrollView contentContainerStyle={styles.container}>
//         <View style={[styles.image, { backgroundColor: '#ddd', borderRadius: 90 }]} />
//         <View style={{ width: 200, height: 24, backgroundColor: '#ddd', borderRadius: 4, marginVertical: 10, alignSelf: 'center' }} />
//         <View style={[styles.card, { height: 100, backgroundColor: '#eee' }]} />
//         <View style={[styles.card, { height: 60, backgroundColor: '#eee' }]} />
//         <View style={[styles.card, { height: 80, backgroundColor: '#eee' }]} />
//       </ScrollView>
//     );
//   }

//   // --- Mensagem de erro amigável ---
//   if (error) {
//     return (
//       <View style={[styles.container, { justifyContent: "center" }]}>
//         <Text style={{ color: "red", fontSize: 16, textAlign: "center", marginBottom: 10 }}>{error}</Text>
//         <TouchableOpacity
//           onPress={() => router.replace(router.pathname)}
//           accessibilityLabel="Recarregar detalhes do Pokémon"
//           accessible
//         >
//           <Text style={{ color: "#d62828", fontWeight: "bold", textAlign: "center" }}>Tentar novamente</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   if (!pokemon) return null;

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Stack.Screen options={{ headerShown: false }} />

//       {/* Botão de voltar */}
//       <TouchableOpacity
//         style={styles.backButton}
//         onPress={() => router.push("/telaLista")}
//         accessibilityLabel="Voltar à lista de Pokémons"
//         accessible
//       >
//         <Ionicons name="arrow-back" size={28} color="#d62828" />
//       </TouchableOpacity>

//       {/* Nome e imagem */}
//       <Text style={styles.title}>{pokemon.name.toUpperCase()}</Text>
//       <Image source={{ uri: pokemon.sprites.front_default }} style={styles.image} />

//       {/* Card de informações principais */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Informações</Text>
//         <View style={styles.infoRow}>
//           <Text style={styles.infoLabel}>Altura:</Text>
//           <Text style={styles.infoValue}>{pokemon.height / 10} m</Text>
//         </View>
//         <View style={styles.infoRow}>
//           <Text style={styles.infoLabel}>Peso:</Text>
//           <Text style={styles.infoValue}>{pokemon.weight / 10} kg</Text>
//         </View>
//       </View>

//       {/* Card de tipos */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Tipos</Text>
//         <View style={styles.typesContainer}>
//           {pokemon.types.map(t => (
//             <View
//               key={t.type.name}
//               style={styles.typeBadge}
//               accessibilityLabel={`Tipo ${t.type.name}`}
//               accessible
//             >
//               <Text style={styles.typeText}>{t.type.name.toUpperCase()}</Text>
//             </View>
//           ))}
//         </View>
//       </View>

//       {/* Card de habilidades */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Habilidades</Text>
//         {pokemon.abilities.map(a => (
//           <Text key={a.ability.name} style={styles.listItem}>
//             • {a.ability.name}
//           </Text>
//         ))}
//       </View>

//       {/* Card de status */}
//       <View style={styles.card}>
//         <Text style={styles.cardTitle}>Status Base</Text>
//         {pokemon.stats.map(s => (
//           <View key={s.stat.name} style={styles.statRow}>
//             <Text style={styles.statName}>{s.stat.name.toUpperCase()}</Text>
//             <View style={styles.statBar}>
//               <View style={[styles.statFill, { width: `${Math.min(s.base_stat, 100)}%` }]} />
//             </View>
//             <Text style={styles.statValue}>{s.base_stat}</Text>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }

// // --- Estilos ---
// const styles = StyleSheet.create({
//   container: { alignItems: "center", padding: 20, backgroundColor: "#f8f9fa", flexGrow: 1 },
//   backButton: { alignSelf: "flex-start", marginBottom: 10, minHeight: 44, justifyContent: "center" },
//   title: { fontSize: 30, fontWeight: "900", color: "#d62828", marginBottom: 15, textAlign: "center" },
//   image: { width: 180, height: 180, marginBottom: 25 },
//   card: { backgroundColor: "#fff", width: "90%", borderRadius: 16, padding: 15, marginBottom: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 },
//   cardTitle: { fontSize: 20, fontWeight: "700", color: "#222", marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#eee", paddingBottom: 4 },
//   infoRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
//   infoLabel: { fontSize: 16, color: "#444" },
//   infoValue: { fontWeight: "bold", color: "#222" },
//   typesContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
//   typeBadge: { backgroundColor: "#d62828", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, margin: 3, minHeight: 44, justifyContent: "center" },
//   typeText: { color: "#fff", fontWeight: "bold" },
//   listItem: { fontSize: 16, color: "#333", marginBottom: 4 },
//   statRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
//   statName: { flex: 1, fontSize: 14, color: "#444" },
//   statBar: { flex: 3, height: 8, backgroundColor: "#e0e0e0", borderRadius: 8, marginHorizontal: 8 },
//   statFill: { height: "100%", backgroundColor: "#a9ff47ff", borderRadius: 8 },
//   statValue: { width: 35, textAlign: "right", fontSize: 14, fontWeight: "600", color: "#222" },
// });



import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PokemonDetail {
  name: string;
  height: number;
  weight: number;

  abilities: {
    ability: {
      name: string;
      url: string;
    };
  }[];

  stats: {
    base_stat: number;
    stat: {
      name: string;
      url: string;
    };
  }[];

  sprites: {
    front_default: string;
  };

  types: {
    type: {
      name: string;
      url: string;
    };
  }[];
}

export default function PokemonDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (name) {
      fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
        .then((res) => res.json())
        .then(setPokemon)
        .catch((err) => console.error(err));
    }
  }, [name]);

  if (!pokemon) return <Text style={styles.loading}>Carregando...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/telaLista")}>
        <Ionicons name="arrow-back" size={28} color="#d62828" />
      </TouchableOpacity>

      {/* Nome e imagem */}
      <Text style={styles.title}>{pokemon.name.toUpperCase()}</Text>
      <Image source={{ uri: pokemon.sprites.front_default }} style={styles.image} />

      {/* Informações principais */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informações</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Altura:</Text>
          <Text style={styles.infoValue}>{pokemon.height / 10} m</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Peso:</Text>
          <Text style={styles.infoValue}>{pokemon.weight / 10} kg</Text>
        </View>
      </View>

      {/* Tipos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tipos</Text>
        <View style={styles.typesContainer}>
          {pokemon.types.map((t) => (
            <View key={t.type.name} style={styles.typeBadge}>
              <Text style={styles.typeText}>{t.type.name.toUpperCase()}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Habilidades */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Habilidades</Text>
        {pokemon.abilities.map((a) => (
          <Text key={a.ability.name} style={styles.listItem}>
            • {a.ability.name}
          </Text>
        ))}
      </View>

      {/* Estatísticas */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status Base</Text>
        {pokemon.stats.map((s) => (
          <View key={s.stat.name} style={styles.statRow}>
            <Text style={styles.statName}>{s.stat.name.toUpperCase()}</Text>
            <View style={styles.statBar}>
              {/*barra de progresso*/}
              <View style={[styles.statFill, { width: `${Math.min(s.base_stat, 100)}%` }]} /> 
            </View>
            <Text style={styles.statValue}>{s.base_stat}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#d62828",
    marginBottom: 15,
    textAlign: "center",
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  infoLabel: {
    fontSize: 16,
    color: "#444",
  },
  infoValue: {
    fontWeight: "bold",
    color: "#222",
  },
  typesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  typeBadge: {
    backgroundColor: "#d62828",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 3,
  },
  typeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listItem: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  statName: {
    flex: 1,
    fontSize: 14,
    color: "#444",
  },
  statBar: {
    flex: 3,
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginHorizontal: 8,
  },
  statFill: {
    height: "100%",
    backgroundColor: "#a9ff47ff",
    borderRadius: 8,
  },
  statValue: {
    width: 35,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
  },
  loading: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#d62828",
  },
});