import React, { useState } from 'react';
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

type Plan = {
  id: number;
  name: string;
  price: string;
  duration: string;
  members: string;
  features: string[];
  active: boolean;
  popular?: boolean;
};

export default function PlansScreen() {
  const { theme, themeMode } = useAppTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [planName, setPlanName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('Monthly');
  const [maxMembers, setMaxMembers] = useState('');

  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      name: 'Basic',
      price: '999',
      duration: 'Monthly',
      members: '50',
      features: [
        'Member Management',
        'Attendance Tracking',
        'Basic Reports',
      ],
      active: true,
    },
    {
      id: 2,
      name: 'Pro',
      price: '1999',
      duration: 'Monthly',
      members: '200',
      features: [
        'All Basic Features',
        'Diet Plan Management',
        'Advanced Reports',
        'Class Management',
      ],
      active: true,
      popular: true,
    },
    {
      id: 3,
      name: 'Premium',
      price: '3999',
      duration: 'Monthly',
      members: 'Unlimited',
      features: [
        'All Pro Features',
        'Multiple Trainers',
        'Advanced Analytics',
        'Priority Support',
      ],
      active: true,
    },
  ]);

  const activePlans = plans.filter(plan => plan.active).length;

  const addPlan = () => {
    if (!planName.trim() || !price.trim() || !maxMembers.trim()) {
      Alert.alert('Missing Details', 'Please fill all the fields.');
      return;
    }

    if (Number(price) <= 0 || Number(maxMembers) <= 0) {
      Alert.alert('Invalid Details', 'Enter valid price and member limit.');
      return;
    }

    const newPlan: Plan = {
      id: Date.now(),
      name: planName.trim(),
      price: price.trim(),
      duration,
      members: maxMembers.trim(),
      features: ['Member Management', 'Attendance Tracking'],
      active: true,
    };

    setPlans(prev => [...prev, newPlan]);

    setPlanName('');
    setPrice('');
    setMaxMembers('');
    setDuration('Monthly');
    setModalVisible(false);
  };

  const togglePlan = (id: number) => {
    setPlans(prev =>
      prev.map(plan =>
        plan.id === id ? { ...plan, active: !plan.active } : plan
      )
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.heading, { color: theme.text }]}>
              Subscription Plans
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Manage gym subscription packages
            </Text>
          </View>

          <Pressable
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Plan</Text>
          </Pressable>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Ionicons name="layers-outline" size={22} color={theme.primary} />
            <Text style={[styles.summaryNumber, { color: theme.text }]}>
              {plans.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
              Total Plans
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color="#16A34A"
            />
            <Text style={[styles.summaryNumber, { color: theme.text }]}>
              {activePlans}
            </Text>
            <Text style={[styles.summaryLabel, { color: theme.secondaryText }]}>
              Active Plans
            </Text>
          </View>
        </View>

        {/* Plan Cards */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Available Plans
          </Text>
          <Text style={[styles.sectionCount, { color: theme.secondaryText }]}>
            {plans.length} packages
          </Text>
        </View>

        {plans.map(plan => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              {
                backgroundColor: theme.card,
                borderColor: plan.popular ? theme.primary : theme.border,
              },
            ]}
          >
            {plan.popular && (
              <View
                style={[styles.popularBadge, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.popularText}>POPULAR</Text>
              </View>
            )}

            <View style={styles.planTop}>
              <View>
                <Text style={[styles.planName, { color: theme.text }]}>
                  {plan.name}
                </Text>
                <Text style={[styles.planDuration, { color: theme.secondaryText }]}>
                  {plan.duration} Subscription
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: plan.active ? '#DCFCE7' : '#FEE2E2',
                  },
                ]}
              >
                <Text
                  style={{
                    color: plan.active ? '#15803D' : '#DC2626',
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  {plan.active ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
            </View>

            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: theme.text }]}>
                ₹{plan.price}
              </Text>
              <Text style={[styles.priceDuration, { color: theme.secondaryText }]}>
                / {plan.duration.toLowerCase()}
              </Text>
            </View>

            <View style={styles.memberLimit}>
              <Ionicons
                name="people-outline"
                size={17}
                color={theme.secondaryText}
              />
              <Text style={[styles.memberText, { color: theme.secondaryText }]}>
                {plan.members} Members Limit
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <Text style={[styles.featuresTitle, { color: theme.text }]}>
              Plan Features
            </Text>

            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={17} color="#16A34A" />
                <Text style={[styles.featureText, { color: theme.secondaryText }]}>
                  {feature}
                </Text>
              </View>
            ))}

            <Pressable
              style={[
                styles.toggleButton,
                {
                  borderColor: plan.active ? '#DC2626' : '#16A34A',
                },
              ]}
              onPress={() =>
                Alert.alert(
                  plan.active ? 'Disable Plan?' : 'Enable Plan?',
                  `Are you sure you want to ${plan.active ? 'disable' : 'enable'} ${plan.name}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Confirm',
                      onPress: () => togglePlan(plan.id),
                    },
                  ]
                )
              }
            >
              <Ionicons
                name={plan.active ? 'ban-outline' : 'checkmark-circle-outline'}
                size={17}
                color={plan.active ? '#DC2626' : '#16A34A'}
              />
              <Text
                style={{
                  color: plan.active ? '#DC2626' : '#16A34A',
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                {plan.active ? 'Disable Plan' : 'Enable Plan'}
              </Text>
            </Pressable>
          </View>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add Plan Modal */}
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
                Create New Plan
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Plan Name
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
              placeholder="Enter plan name"
              placeholderTextColor={theme.secondaryText}
              value={planName}
              onChangeText={setPlanName}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Price (₹)
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
              placeholder="Enter price"
              placeholderTextColor={theme.secondaryText}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Maximum Members
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
              placeholder="Enter member limit"
              placeholderTextColor={theme.secondaryText}
              value={maxMembers}
              onChangeText={setMaxMembers}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Subscription Duration
            </Text>

            <View style={styles.durationRow}>
              {['Monthly', 'Quarterly', 'Yearly'].map(item => (
                <Pressable
                  key={item}
                  onPress={() => setDuration(item)}
                  style={[
                    styles.durationOption,
                    {
                      backgroundColor:
                        duration === item ? theme.primary : theme.inputBackground,
                      borderColor:
                        duration === item ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: duration === item ? '#FFFFFF' : theme.text,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={addPlan}
            >
              <Text style={styles.saveButtonText}>Create Plan</Text>
            </Pressable>
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
    gap: 10,
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
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 15,
    gap: 7,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 12,
  },
  planCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 17,
  },
  popularBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 12,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  planTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
  },
  planDuration: {
    fontSize: 12,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 18,
  },
  price: {
    fontSize: 29,
    fontWeight: '800',
  },
  priceDuration: {
    fontSize: 12,
    marginLeft: 4,
  },
  memberLimit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 10,
  },
  memberText: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 10,
  },
  featureText: {
    fontSize: 13,
  },
  toggleButton: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 11,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 18,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  durationOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 9,
    borderWidth: 1,
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});