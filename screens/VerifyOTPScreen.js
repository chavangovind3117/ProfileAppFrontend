import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import BACKEND_URL from "../config";

const VerifyOTPScreen = ({ navigation, route }) => {
    // const [userData, setUserData] = useState(null);
    const { username } = route.params;
    const [otp, setOtp] = useState("");

    const handleVerifyOTP = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, otp }),
            });
            const data = await response.json();
            const userData = data.userWithoutPassword
            console.log("ascync data through otp : ", userData);

            if (response.ok) {
                await AsyncStorage.setItem('userData', JSON.stringify(userData));

                Alert.alert('Login Successful', `Welcome ${userData.EmployeeName}`);
                navigation.navigate('Profile', { userData: userData });
            } else {
                Alert.alert('Enter valid OTP', data.error);
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
                    placeholder="Enter OTP"
                    placeholderTextColor="#aaa"
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="numeric"
                />
                <TouchableOpacity onPress={handleVerifyOTP} style={styles.button}>
                    <Text style={styles.buttonText}>Verify OTP</Text>
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
        // marginHorizontal: 'auto',
    },
    input: {
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

export default VerifyOTPScreen;
