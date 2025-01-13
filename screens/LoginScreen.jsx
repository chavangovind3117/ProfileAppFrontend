import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BACKEND_URL from '../config.js';
import { useNavigation } from '@react-navigation/native';
import axios from "axios";

const LoginScreen = ({ navigation }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    // const navigation = useNavigation();

    const handleLogin = async () => {
        setLoading(true); // Start loading
        try {
            // const response = await fetch(`http://localhost:5000/profile?username=${username}&password=${password}`);
            const response = await fetch(`${BACKEND_URL}/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            console.log("data : ", data);

            if (response.ok) {
                // Save user data to AsyncStorage
                await AsyncStorage.setItem('userData', JSON.stringify(data));

                Alert.alert('Login Successful', `Welcome ${data.EmployeeName}`);
                navigation.navigate('Profile', { userData: data });
            } else {
                Alert.alert('Login Failed', data.error);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Unable to connect to the server');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleForgetPassword = () => {
        navigation.navigate("ForgetPassword");
    };

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#f0f0f0" />
                ) : (
                    <>
                        <TextInput
                            placeholder="Username"
                            placeholderTextColor="#aaa"
                            style={styles.input}
                            value={username}
                            onChangeText={setUsername}
                        />
                        <TextInput
                            placeholder="Password"
                            placeholderTextColor="#aaa"
                            style={styles.input}
                            secureTextEntry
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity onPress={handleLogin} style={styles.button}>
                            <Text style={styles.buttonText}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleForgetPassword}>
                            <Text style={styles.linkText}>Forget Password?</Text>
                        </TouchableOpacity>
                    </>
                )}

            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#87CEEB",
        padding: 26,
    },
    subContainer: {
        width: '70%',
        // marginHorizontal: 'auto',
    },
    input: {
        // width: 100,
        height: 60,
        backgroundColor: "#fff",
        borderRadius: 30,
        paddingHorizontal: 20,
        marginVertical: 10,
        fontSize: 22,
        borderWidth: 1,
        borderColor: "#fff",
        textAlign: "center",
    },
    button: {
        backgroundColor: "#fff",
        height: 60,
        borderRadius: 30,
        paddingHorizontal: 10,
        marginVertical: 10,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
        borderWidth: 1,
        borderColor: "#fff",
    },
    buttonText: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#87CEEB",
    },
    linkText: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
        color: "#fff",
        fontSize: 18,
        marginTop: 10,
        textDecorationLine: "underline",
    },
});

export default LoginScreen;
