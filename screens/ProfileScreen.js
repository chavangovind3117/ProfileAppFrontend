import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Modal, FlatList, ScrollView, SafeAreaView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import BACKEND_URL from '../config';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const ProfileScreen = ({ navigation, route }) => {
    // const { userData } = route.params;
    const [userData, setUserData] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current Month
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());   // Current Year
    const [isModalVisible, setModalVisible] = useState(false);                   // Modal visibility
    const [salaryDetails, setSalaryDetails] = useState(null);
    const [month, setMonth] = useState();
    const [year, setYear] = useState();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
        setRefreshing(true);
        // Simulate a data fetch or update
        setTimeout(() => {
            console.log('Profile data refreshed!');
            setRefreshing(false); // End refreshing
        }, 2000); // Adjust delay as needed
    };

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i); // Last 20 years

    const handleSelection = (item, type) => {
        if (type === "month") {
            setSelectedMonth(item.index + 1);
        } else if (type === "year") {
            setSelectedYear(item.value);
        }

        console.log("selected month and year : ", months[selectedMonth - 1], selectedYear)
    };

    const loadUserData = async () => {
        try {
            console.log("Attempting to load user data from AsyncStorage");
            const storedUserData = await AsyncStorage.getItem('userData');
            console.log("Retrieved from AsyncStorage:", storedUserData);
            if (storedUserData) {
                const parsedUserData = JSON.parse(storedUserData);
                console.log("Parsed user data:", parsedUserData);
                setUserData(parsedUserData);
            } else {
                console.log("No user data found in AsyncStorage");
                Alert.alert('Session Expired', 'Please log in again.');
                navigation.navigate('Login');
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        }
    };

    // Fetch Salary Details based on Month and Year ----****----

    const fetchSalaryDetails = async (month, year) => {
        try {
            const response = await fetch(
                `${BACKEND_URL}/fetch-salary?employeeID=${userData.EmployeeID}&month=${month}&year=${year}`
            );
            const data = await response.json();
            console.log("fetch-salaryData : ", data);
            if (response.ok) {
                setSalaryDetails(data);
            } else {
                Alert.alert('Error', data.error || 'Failed to fetch salary details.');
            }
        } catch (error) {
            console.error('Error fetching salary details:', error);
            Alert.alert('Error', 'Unable to fetch salary details.');
        }
    };

    const fetchData = async () => {
        await loadUserData();
        if (userData) {
            const month = months[selectedMonth - 1];
            setMonth(month);
            const year = selectedYear;
            setYear(year);
            fetchSalaryDetails(month, year);
        }
    };

    useEffect(() => {
        loadUserData();
        fetchData();
    }, [selectedMonth, selectedYear]);

    const exportToPDF = async () => {
        if (!salaryDetails) {
            Alert.alert('No Data', 'No salary details available to export.');
            return;
        }

        try {
            // Generate HTML for the PDF
            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { text-align: center; color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f4f4f4; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                    </style>
                </head>
                <body>
                    <h1 style="text-align: center;">Profile Details</h1>
                    <p><strong>Name:</strong> ${userData.EmployeeName}</p>
                    <p><strong>Designation:</strong> ${userData.Designation}</p>
                    <p><strong>Employee ID:</strong> ${userData.EmployeeID}</p>
                    <p><strong>Username:</strong> ${userData.username}</p>
                    <h1>Salary Details</h1>
                    <table>
                        <tr>
                            <th>Component</th>
                            <th>Amount</th>
                        </tr>
                        <tr>
                            <td>Basic</td>
                            <td>${salaryDetails.Basic}</td>
                        </tr>
                        <tr>
                            <td>HRA</td>
                            <td>${salaryDetails.HRA}</td>
                        </tr>
                        <tr>
                            <td>Medical Allowance</td>
                            <td>${salaryDetails.MedicalAllowance}</td>
                        </tr>
                        <tr>
                            <td>Conveyance</td>
                            <td>${salaryDetails.Conveyance}</td>
                        </tr>
                        <tr>
                            <th>Total CTC</th>
                            <th>${salaryDetails.TotalCTC}</th>
                        </tr>
                    </table>
                </body>
                </html>
            `;

            // Create the PDF
            const { uri } = await Print.printToFileAsync({ html: htmlContent });

            // Share the PDF
            await Sharing.shareAsync(uri);
            console.log('PDF shared:', uri);
        } catch (error) {
            console.error('Error exporting PDF:', error);
            Alert.alert('Error', 'An error occurred while exporting the PDF.');
        }
    };

    // LogOUt Button ---***---

    const handleLogout = async () => {
        try {
            console.log("Logging out...");
            await AsyncStorage.removeItem('userData');
            Alert.alert('Logout Successful', 'You have been logged out.');
            // Navigate to login screen and reset the navigation stack
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Login' }], // Replace with the name of your Login screen
                })
            );
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#6200EE', '#03DAC6', '#BB86FC']} // Android spinner colors
                        progressBackgroundColor="#e0f7fa" // Spinner background color
                    />
                }
            >

                <View style={styles.container}>
                    {refreshing && (
                        <View style={styles.refreshMessageContainer}>
                            <Text style={styles.refreshMessage}>Loading...</Text>
                        </View>
                    )}
                    <View style={styles.header}>
                        <Text style={styles.title}>Profile</Text>
                    </View>
                    {userData ? (
                        <View style={styles.subContainer}>
                            {/* Profile Information */}
                            <View style={styles.profileContainer}>
                                <Image
                                    source={require('../assets/profilePic/user.jpg')}
                                    style={styles.profileImage}
                                />
                                <View>
                                    <Text style={styles.profileName}>{userData.EmployeeName}</Text>
                                    <Text style={styles.profileDesignation}>{userData.Designation}</Text>
                                    <Text style={styles.profileDetails}>{userData.EmployeeID}</Text>
                                    <Text style={styles.profileDetails}>{userData.username}</Text>
                                </View>
                            </View>

                            {/* Month-Year Picker and Salary Details */}

                            <View style={styles.salaryContainer}>

                                <View style={styles.DateContainer}>
                                    {/* Dropdown Button */}
                                    <TouchableOpacity
                                        style={styles.dropdown}
                                        onPress={() => setModalVisible(true)}
                                    >
                                        <Text style={styles.dropdownText}>
                                            {months[selectedMonth - 1]}, {selectedYear}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Modal */}
                                    <Modal
                                        visible={isModalVisible}
                                        transparent={true}
                                        animationType="slide"
                                        onRequestClose={() => setModalVisible(false)}
                                    >
                                        <View style={styles.modalContainer}>
                                            <View style={styles.modalContent}>
                                                <Text style={styles.modalTitle}>Select Date</Text>

                                                <View style={styles.pickerContainer}>
                                                    {/* Month List */}
                                                    <View style={styles.listContainer}>
                                                        <Text style={styles.sectionTitle}>Month</Text>
                                                        <FlatList
                                                            data={months.map((month, index) => ({ label: month, index }))}
                                                            keyExtractor={(item) => item.label}
                                                            renderItem={({ item }) => (
                                                                <TouchableOpacity
                                                                    style={[
                                                                        styles.item,
                                                                        item.index === selectedMonth - 1 && styles.selectedItem,
                                                                    ]}
                                                                    onClick={() => handleSelection(item, "month")} // Add this for mouse clicks
                                                                    onPress={() => handleSelection(item, "month")} // Still needed for touch
                                                                >
                                                                    <Text
                                                                        style={[
                                                                            styles.itemText,
                                                                            item.index === selectedMonth - 1 && styles.selectedItemText,
                                                                        ]}
                                                                    >
                                                                        {item.label}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            )}
                                                            showsVerticalScrollIndicator={false}
                                                        />
                                                    </View>

                                                    {/* Year List */}

                                                    <View style={styles.listContainer}>
                                                        <Text style={styles.sectionTitle}>Year</Text>
                                                        <FlatList
                                                            data={years.map((year) => ({ value: year }))}
                                                            keyExtractor={(item) => item.value.toString()}
                                                            renderItem={({ item }) => (
                                                                <TouchableOpacity
                                                                    style={[
                                                                        styles.item,
                                                                        item.value === selectedYear && styles.selectedItem,
                                                                    ]}
                                                                    onPress={() => handleSelection(item, "year")}  // this for mouse clicks
                                                                    onClick={() => handleSelection(item, "year")}  // Still needed for touch

                                                                >
                                                                    <Text
                                                                        style={[
                                                                            styles.itemText,
                                                                            item.value === selectedYear && styles.selectedItemText,
                                                                        ]}
                                                                    >
                                                                        {item.value}
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            )}
                                                            showsVerticalScrollIndicator={false}
                                                        />
                                                    </View>
                                                </View>

                                                <TouchableOpacity
                                                    onPress={() => setModalVisible(false)}
                                                    style={styles.closeButton}
                                                >
                                                    <Text style={styles.closeButtonText}>Close</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </Modal>
                                </View>


                                {/* Salary Details */}

                                {salaryDetails ? (
                                    <View style={styles.salaryDetailsContainer}>
                                        <View style={styles.salaryDetails}>
                                            <Text style={styles.salaryText}>Basic</Text>
                                            <Text style={styles.salaryValue}>{salaryDetails.Basic}</Text>
                                        </View>
                                        <View style={styles.salaryDetails}>
                                            <Text style={styles.salaryText}>HRA</Text>
                                            <Text style={styles.salaryValue}>{salaryDetails.HRA}</Text>
                                        </View>
                                        <View style={styles.salaryDetails}>
                                            <Text style={styles.salaryText}>Medical Allowance</Text>
                                            <Text style={styles.salaryValue}>{salaryDetails.MedicalAllowance}</Text>
                                        </View>
                                        <View style={styles.salaryDetails}>
                                            <Text style={styles.salaryText}>Conveyance</Text>
                                            <Text style={styles.salaryValue}>{salaryDetails.Conveyance}</Text>
                                        </View>
                                        <View style={styles.salaryDetails}>
                                            <Text style={styles.salaryText}>Total CTC</Text>
                                            <Text style={styles.salaryValue}>{salaryDetails.TotalCTC}</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={styles.noDataText}>
                                        {`No salary details are available with this `}
                                        <Text style={{ fontWeight: 'bold', color: '#fa5252' }}>{month}</Text>
                                        {`, `}
                                        <Text style={{ fontWeight: 'bold', color: '#fa5252' }}>{year}</Text>
                                        {` Date.`}
                                    </Text>
                                )}
                            </View>

                            {/* Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.exportButton} onPress={exportToPDF}>
                                    <Text style={styles.exportButtonText}>Export as PDF</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                    <Text style={styles.logoutButtonText}>LogOut</Text>
                                    <Image
                                        source={require('../assets/profilePic/logout.png')}
                                        style={styles.logoutIcon}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    ) : (
                        <Text>Loading...</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    refreshMessageContainer: {
        position: 'absolute',
        top: 70,
        width: '100%',
        alignItems: 'center',
        zIndex: 10,
    },
    refreshMessage: {
        fontSize: 20,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontFamily: 'Courier New',
        color: '#666',
        // Custom font family color: '#333',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#87CEEB'
        // padding: 16,
    },
    scrollContainer: {
        flexGrow: 1, // Allow content to grow
        // maxHeight: 100,
        paddingVertical: 16, // Add some padding for a better experience
    },
    container: {
        flex: 1,
        backgroundColor: '#87CEEB', // Light blue background
        padding: 16,
    },
    header: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        flex: 1,
    },
    subContainer: {
        // maxHeight: 1000,
        maxWidth: 600,
        // marginHorizontal: 'auto',
    },
    // Profile Container ----****----

    profileContainer: {
        // height: 'auto',
        // maxHeight: 300,
        marginHorizontal: 10,
        marginTop: 8,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 30,
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 24,
    },
    profileImage: {
        width: 100,
        height: 130,
        borderRadius: 16,
        backgroundColor: '#fff',
        marginBottom: 8,
    },
    profileName: {
        fontSize: 25,
        fontWeight: 'semibold',
        color: '#000',
    },
    profileDesignation: {
        fontSize: 22,
        // color: '#555',
        color: '#555555',
        marginBottom: 8,
    },
    profileDetails: {
        fontSize: 22,
        color: '#333',
    },
    salaryContainer: {
        // width: '100%',
        // maxHeight: 350,
        // height: '0%',
        backgroundColor: '#f0f0f0',
        borderRadius: 30,
        padding: 30,
        marginVertical: 10,
    },

    // Month and Year selection button ----****----

    DateContainer: {
        // marginTop: -40,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    dropdown: {
        fontSize: 20,
        fontWeight: 'semibold',
        backgroundColor: "#fff",
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        width: "45%",
        alignItems: "center",
        elevation: 2,
    },
    dropdownText: {
        fontSize: 18,
        // color: "#333",
        color: '#000',
    },
    modalContainer: {
        marginHorizontal: 'auto',
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: '45%'
        // backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        width: "100%",
        borderRadius: 25,
        padding: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    pickerContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    listContainer: {
        flex: 1,
        marginHorizontal: 10,
        maxHeight: 200, // Restrict height for scrollable window
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    item: {
        padding: 10,
        alignItems: "center",
        borderRadius: 5,
        marginVertical: 2,
        backgroundColor: "#f0f0f0",
    },
    selectedItem: {
        // backgroundColor: "#007bff",
        backgroundColor: "#51b3db",
    },
    itemText: {
        fontSize: 16,
        color: "#333",
    },
    selectedItemText: {
        color: "#fff",
        fontWeight: "bold",
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: "#51b3db",
        padding: 10,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    noDataText: {
        // height: 500,
        flexWrap: 'wrap',
        width: '90%',
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#000',
        flexDirection: 'row',
        marginTop: 15,
        marginHorizontal: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Salary Details ----****----
    salaryDetailsContainer: {

    },
    salaryDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
    },
    salaryText: {
        fontSize: 18,
        color: '#333333',
        fontWeight: 'semibold',
    },
    salaryValue: {
        fontSize: 20,
        fontWeight: 'semibold',
        color: '#242424',
    },
    buttonContainer: {
        flex: 1,
        maxHeight: 200,
        // height: 'auto',
    },
    exportButton: {
        backgroundColor: '#f0f0f0',
        borderRadius: 22,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 16,
    },
    exportButtonText: {
        fontSize: 18,
        fontWeight: 'semibold',
        color: '#333333',
    },
    logoutButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 14,
        backgroundColor: '#ff7b7b',
        borderRadius: 20,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    logoutIcon: {
        marginRight: -40,
        width: 45,
        height: 40,
    },
    logoutButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});
