import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { Api, ApiError, Gym as ApiGym } from '@/lib/api';

type Gym = {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  location: string;
  plan: string;
  status: 'Active' | 'Disabled';
  subscription: 'Paid' | 'Pending';
};

const fromApi = (g: ApiGym): Gym => ({
  id: g.id,
  name: g.name,
  owner: g.email ?? '',
  email: g.email ?? '',
  phone: g.phone ?? '',
  location: g.address ?? '',
  plan: g.status === 'active' ? 'Active plan' : 'Trial',
  status: g.status === 'suspended' ? 'Disabled' : 'Active',
  subscription: g.status === 'active' ? 'Paid' : 'Pending',
});

export default function GymsScreen() {
  const { theme } = useAppTheme();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);

  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  const [gyms, setGyms] = useState<Gym[]>([]);

  useEffect(() => {
    let active = true;
    Api.listGyms()
      .then((rows) => { if (active) setGyms(rows.map(fromApi)); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const totalGyms = gyms.length;
  const activeGyms = gyms.filter(gym => gym.status === 'Active').length;
  const disabledGyms = gyms.filter(gym => gym.status === 'Disabled').length;

  const filteredGyms = gyms.filter(gym => {
    const matchesSearch =
      gym.name.toLowerCase().includes(search.toLowerCase()) ||
      gym.owner.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'All' ||
      gym.status === filter;

    return matchesSearch && matchesFilter;
  });

  const addGym = async () => {
    if (
      !gymName.trim() ||
      !ownerName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !location.trim()
    ) {
      Alert.alert('Missing Details', 'Please fill all the fields.');
      return;
    }
    try {
      const created = await Api.createGym({
        name: gymName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: location.trim(),
      });
      setGyms(prev => [fromApi(created), ...prev]);
      setGymName(''); setOwnerName(''); setEmail(''); setPhone(''); setLocation('');
      setModalVisible(false);
      Alert.alert('Success', 'Gym added successfully.');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      Alert.alert('Could not add gym', msg || 'Please try again.');
    }
  };

  const toggleGymStatus = async (id: string) => {
    const current = gyms.find(g => g.id === id);
    if (!current) return;
    const nextStatus = current.status === 'Active' ? 'suspended' : 'active';
    try {
      const updated = await Api.updateGym(id, { status: nextStatus as any });
      setGyms(prev => prev.map(g => g.id === id ? fromApi(updated) : g));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : (e as Error).message;
      Alert.alert('Could not update gym', msg || 'Please try again.');
    }
  };

  const showGymActions = (gym: Gym) => {
    Alert.alert(
      gym.name,
      'Select an action',
      [
        {
          text: 'View Details',
          onPress: () => setSelectedGym(gym),
        },
        {
          text: gym.status === 'Active' ? 'Disable Gym' : 'Enable Gym',
          style: gym.status === 'Active' ? 'destructive' : 'default',
          onPress: () =>
            Alert.alert(
              'Confirm Action',
              `Are you sure you want to ${
                gym.status === 'Active' ? 'disable' : 'enable'
              } ${gym.name}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm',
                  onPress: () => toggleGymStatus(gym.id),
                },
              ]
            ),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.heading, { color: theme.text }]}>
              Gym Management
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Manage all registered gyms
            </Text>
          </View>

          <Pressable
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Gym</Text>
          </Pressable>
        </View>

        {/* Statistics */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="business-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {totalGyms}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              Total Gyms
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {activeGyms}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              Active
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="ban-outline" size={20} color="#DC2626" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {disabledGyms}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              Disabled
            </Text>
          </View>
        </View>

        {/* Search */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name="search-outline" size={20} color={theme.secondaryText} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search gym or owner..."
            placeholderTextColor={theme.secondaryText}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={19} color={theme.secondaryText} />
            </Pressable>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {['All', 'Active', 'Disabled'].map(item => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterButton,
                {
                  backgroundColor:
                    filter === item ? theme.primary : theme.card,
                  borderColor:
                    filter === item ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={{
                  color: filter === item ? '#FFFFFF' : theme.text,
                  fontWeight: '600',
                  fontSize: 12,
                }}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Gym List */}
        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Registered Gyms
          </Text>
          <Text style={[styles.resultCount, { color: theme.secondaryText }]}>
            {filteredGyms.length} results
          </Text>
        </View>

        {filteredGyms.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <Ionicons name="business-outline" size={38} color={theme.secondaryText} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Gyms Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>
              Try changing your search or filter.
            </Text>
          </View>
        ) : (
          filteredGyms.map(gym => (
            <View
              key={gym.id}
              style={[
                styles.gymCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.gymTop}>
                <View style={[styles.gymIcon, { backgroundColor: theme.inputBackground }]}>
                  <Ionicons name="barbell-outline" size={25} color={theme.primary} />
                </View>

                <View style={styles.gymInfo}>
                  <Text style={[styles.gymName, { color: theme.text }]}>
                    {gym.name}
                  </Text>
                  <Text style={[styles.ownerName, { color: theme.secondaryText }]}>
                    Owner: {gym.owner}
                  </Text>
                </View>

                <Pressable onPress={() => showGymActions(gym)}>
                  <Ionicons name="ellipsis-vertical" size={21} color={theme.secondaryText} />
                </Pressable>
              </View>

              <View style={styles.gymDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={16} color={theme.secondaryText} />
                  <Text style={[styles.detailText, { color: theme.secondaryText }]}>
                    {gym.location}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="call-outline" size={15} color={theme.secondaryText} />
                  <Text style={[styles.detailText, { color: theme.secondaryText }]}>
                    {gym.phone}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.bottomDetails}>
                <View>
                  <Text style={[styles.smallLabel, { color: theme.secondaryText }]}>
                    SUBSCRIPTION PLAN
                  </Text>
                  <Text style={[styles.planName, { color: theme.text }]}>
                    {gym.plan}
                  </Text>
                </View>

                <View style={styles.badges}>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          gym.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: gym.status === 'Active' ? '#15803D' : '#DC2626',
                        fontSize: 10,
                        fontWeight: '700',
                      }}
                    >
                      {gym.status}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          gym.subscription === 'Paid' ? '#DBEAFE' : '#FEF3C7',
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color: gym.subscription === 'Paid' ? '#1D4ED8' : '#B45309',
                        fontSize: 10,
                        fontWeight: '700',
                      }}
                    >
                      {gym.subscription}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 25 }} />
      </ScrollView>

      {/* Add Gym Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Add New Gym
              </Text>

              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            {[
              {
                label: 'Gym Name',
                value: gymName,
                setter: setGymName,
                placeholder: 'Enter gym name',
              },
              {
                label: 'Owner Name',
                value: ownerName,
                setter: setOwnerName,
                placeholder: 'Enter owner name',
              },
              {
                label: 'Email Address',
                value: email,
                setter: setEmail,
                placeholder: 'Enter email address',
              },
              {
                label: 'Phone Number',
                value: phone,
                setter: setPhone,
                placeholder: 'Enter phone number',
              },
              {
                label: 'Location',
                value: location,
                setter: setLocation,
                placeholder: 'Enter city and state',
              },
            ].map(field => (
              <View key={field.label}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>
                  {field.label}
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.border,
                    },
                  ]}
                  placeholder={field.placeholder}
                  placeholderTextColor={theme.secondaryText}
                  value={field.value}
                  onChangeText={field.setter}
                  keyboardType={
                    field.label === 'Email Address'
                      ? 'email-address'
                      : field.label === 'Phone Number'
                      ? 'phone-pad'
                      : 'default'
                  }
                  autoCapitalize={
                    field.label === 'Email Address' ? 'none' : 'words'
                  }
                />
              </View>
            ))}

            <Pressable
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={addGym}
            >
              <Text style={styles.saveButtonText}>Add Gym</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Gym Details Modal */}
      <Modal
        visible={selectedGym !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedGym(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Gym Details
              </Text>
              <Pressable onPress={() => setSelectedGym(null)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            {selectedGym && (
              <>
                <Text style={[styles.detailHeading, { color: theme.text }]}>
                  {selectedGym.name}
                </Text>

                {[
                  ['Owner', selectedGym.owner],
                  ['Email', selectedGym.email],
                  ['Phone', selectedGym.phone],
                  ['Location', selectedGym.location],
                  ['Plan', selectedGym.plan],
                  ['Status', selectedGym.status],
                  ['Payment', selectedGym.subscription],
                ].map(([label, value]) => (
                  <View key={label} style={styles.detailModalRow}>
                    <Text style={[styles.detailModalLabel, { color: theme.secondaryText }]}>
                      {label}
                    </Text>
                    <Text style={[styles.detailModalValue, { color: theme.text }]}>
                      {value}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heading: {
    fontSize: 23,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 5,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 9,
  },
  statCard: {
    flex: 1,
    borderRadius: 13,
    padding: 12,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  statNumber: {
    fontSize: 23,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  searchBox: {
    marginHorizontal: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    height: 47,
    gap: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 16,
    marginTop: 15,
  },
  filterButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 17,
    paddingVertical: 9,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 25,
    marginBottom: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  resultCount: {
    fontSize: 12,
  },
  gymCard: {
    marginHorizontal: 16,
    marginBottom: 13,
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
  },
  gymTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  gymIcon: {
    width: 47,
    height: 47,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 15,
    fontWeight: '700',
  },
  ownerName: {
    fontSize: 11,
    marginTop: 4,
  },
  gymDetails: {
    marginTop: 15,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  detailText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  bottomDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  smallLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  planName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  badges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 30,
    borderRadius: 14,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 18,
  },
  modalContent: {
    borderRadius: 18,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  saveButton: {
    marginTop: 22,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  detailHeading: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
  },
  detailModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#999999',
    gap: 10,
  },
  detailModalLabel: {
    fontSize: 12,
  },
  detailModalValue: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
});