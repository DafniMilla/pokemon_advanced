import { View, Text, Button, StyleSheet, Image } from "react-native";
import { router, Stack } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Image
        source={{ uri: "https://raw.githubusercontent.com/PokeAPI/media/master/logo/pokeapi.svg?sanitize=true" }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Bem-vindo ao Pokédex App!</Text>
      <Text style={styles.subtitle}>
        Explore e descubra os Pokémons.
      </Text>

      <Button
        title="Ver Pokémons"
        onPress={() => router.push("/telaLista")}
        color="#c7b8b8be"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#af0000ff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 200,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#ffffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#ffffffff",
    marginBottom: 20,
    textAlign: "center",
  },
});
