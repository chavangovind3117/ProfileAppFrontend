import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BACKEND_URL from "../config";

const ForgetPasswordScreen = ({ navigation }) => {
    const [username, setUsername] = useState("");

    const handleSendOTP = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/forget-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });
            const data = await response.json();
            console.log("data : ", data);

            if (response.ok) {
                Alert.alert('Please check your Email', `${data.message}`);
                navigation.navigate('VerifyOTP', { username });
            } else {
                Alert.alert('User not Found', data.error);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Unable to connect to the server');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <TextInput
                    placeholder="Username"
                    placeholderTextColor="#aaa"
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                />
                <TouchableOpacity onPress={handleSendOTP} style={styles.button}>
                    <Text style={styles.buttonText}>Send OTP</Text>
                </TouchableOpacity>
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
        marginHorizontal: 'auto',
    },
    input: {
        // width: "90%",
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

export default ForgetPasswordScreen;
