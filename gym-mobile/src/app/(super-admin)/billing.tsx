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

type Payment = {
  id: number;
  transactionId: string;
  gymName: string;
  owner: string;
  plan: string;
  amount: number;
  date: string;
  method: string;
  status: 'Success' | 'Pending' | 'Failed';
};

export default function BillingScreen() {
  const { theme, themeMode } = useAppTheme();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [payments] = useState<Payment[]>([
    {
      id: 1,
      transactionId: 'TXN100245',
      gymName: 'Fitness Hub',
      owner: 'Rahul Sharma',
      plan: 'Premium',
      amount: 3999,
      date: '30 Oct 2026',
      method: 'UPI',
      status: 'Success',
    },
    {
      id: 2,
      transactionId: 'TXN100246',
      gymName: 'Power Zone Gym',
      owner: 'Amit Verma',
      plan: 'Pro',
      amount: 1999,
      date: '29 Oct 2026',
      method: 'Credit Card',
      status: 'Success',
    },
    {
      id: 3,
      transactionId: 'TXN100247',
      gymName: 'Fit Life Studio',
      owner: 'Priya Patel',
      plan: 'Basic',
      amount: 999,
      date: '28 Oct 2026',
      method: 'UPI',
      status: 'Pending',
    },
    {
      id: 4,
      transactionId: 'TXN100248',
      gymName: 'Iron Paradise',
      owner: 'Rohit Singh',
      plan: 'Pro',
      amount: 1999,
      date: '27 Oct 2026',
      method: 'Net Banking',
      status: 'Failed',
    },
    {
      id: 5,
      transactionId: 'TXN100249',
      gymName: 'Gold Fitness',
      owner: 'Karan Mehta',
      plan: 'Premium',
      amount: 3999,
      date: '26 Oct 2026',
      method: 'UPI',
      status: 'Success',
    },
  ]);

  const successfulPayments = payments.filter(
    payment => payment.status === 'Success'
  );

  const pendingPayments = payments.filter(
    payment => payment.status === 'Pending'
  );

  const failedPayments = payments.filter(
    payment => payment.status === 'Failed'
  );

  const totalRevenue = successfulPayments.reduce(
    (total, payment) => total + payment.amount,
    0
  );

  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      payment.gymName.toLowerCase().includes(search.toLowerCase()) ||
      payment.owner.toLowerCase().includes(search.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === 'All' || payment.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: Payment['status']) => {
    if (status === 'Success') return '#15803D';
    if (status === 'Pending') return '#B45309';
    return '#DC2626';
  };

  const getStatusBackground = (status: Payment['status']) => {
    if (status === 'Success') return '#DCFCE7';
    if (status === 'Pending') return '#FEF3C7';
    return '#FEE2E2';
  };

  const showInvoice = (payment: Payment) => {
    Alert.alert(
      'Invoice Preview',
      `Invoice for ${payment.gymName}\n\nTransaction: ${payment.transactionId}\nAmount: ₹${payment.amount.toLocaleString('en-IN')}\nStatus: ${payment.status}\n\nThis is a demo invoice preview.`
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
              Billing & Payments
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Track platform revenue and transactions
            </Text>
          </View>

          <View style={[styles.headerIcon, { backgroundColor: theme.card }]}>
            <Ionicons name="wallet-outline" size={23} color={theme.primary} />
          </View>
        </View>

        {/* Revenue Card */}
        <View style={[styles.revenueCard, { backgroundColor: theme.primary }]}>
          <View style={styles.revenueTop}>
            <View>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueAmount}>
                ₹{totalRevenue.toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={styles.revenueIcon}>
              <Ionicons name="trending-up" size={25} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.revenueBottom}>
            <Ionicons name="checkmark-circle" size={17} color="#FFFFFF" />
            <Text style={styles.revenueNote}>
              Revenue from successful payments
            </Text>
          </View>
        </View>

        {/* Payment Statistics */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark-circle-outline" size={21} color="#16A34A" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {successfulPayments.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              Successful
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="time-outline" size={21} color="#D97706" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {pendingPayments.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              Pending
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="close-circle-outline" size={21} color="#DC2626" />
            </View>
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {failedPayments.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
              Failed
            </Text>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Transactions
          </Text>
          <Text style={[styles.transactionCount, { color: theme.secondaryText }]}>
            {filteredPayments.length} records
          </Text>
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
            placeholder="Search gym or transaction ID..."
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {['All', 'Success', 'Pending', 'Failed'].map(item => (
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
                  fontSize: 12,
                  fontWeight: '600',
                }}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Payment List */}
        {filteredPayments.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
            <Ionicons name="receipt-outline" size={38} color={theme.secondaryText} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Transactions Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.secondaryText }]}>
              Try another search or filter.
            </Text>
          </View>
        ) : (
          filteredPayments.map(payment => (
            <Pressable
              key={payment.id}
              style={[
                styles.paymentCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => setSelectedPayment(payment)}
            >
              <View style={styles.paymentTop}>
                <View style={styles.paymentIcon}>
                  <Ionicons name="business-outline" size={22} color={theme.primary} />
                </View>

                <View style={styles.paymentInfo}>
                  <Text style={[styles.gymName, { color: theme.text }]}>
                    {payment.gymName}
                  </Text>
                  <Text style={[styles.ownerName, { color: theme.secondaryText }]}>
                    {payment.owner}
                  </Text>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={[styles.amount, { color: theme.text }]}>
                    ₹{payment.amount.toLocaleString('en-IN')}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusBackground(payment.status) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(payment.status) },
                      ]}
                    >
                      {payment.status}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.paymentBottom}>
                <Text style={[styles.transactionId, { color: theme.secondaryText }]}>
                  ID: {payment.transactionId}
                </Text>

                <Text style={[styles.paymentDate, { color: theme.secondaryText }]}>
                  {payment.date}
                </Text>
              </View>
            </Pressable>
          ))
        )}

        <View style={{ height: 25 }} />
      </ScrollView>

      {/* Transaction Details Modal */}
      <Modal
        visible={selectedPayment !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedPayment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Payment Details
              </Text>

              <Pressable onPress={() => setSelectedPayment(null)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            {selectedPayment && (
              <>
                <View style={styles.modalAmount}>
                  <Text style={[styles.modalAmountLabel, { color: theme.secondaryText }]}>
                    Payment Amount
                  </Text>
                  <Text style={[styles.modalAmountValue, { color: theme.text }]}>
                    ₹{selectedPayment.amount.toLocaleString('en-IN')}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getStatusBackground(selectedPayment.status),
                        marginTop: 9,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(selectedPayment.status) },
                      ]}
                    >
                      {selectedPayment.status}
                    </Text>
                  </View>
                </View>

                {[
                  ['Gym Name', selectedPayment.gymName],
                  ['Owner', selectedPayment.owner],
                  ['Plan', selectedPayment.plan],
                  ['Transaction ID', selectedPayment.transactionId],
                  ['Payment Method', selectedPayment.method],
                  ['Payment Date', selectedPayment.date],
                ].map(([label, value]) => (
                  <View key={label} style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>
                      {label}
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {value}
                    </Text>
                  </View>
                ))}

                <Pressable
                  style={[styles.invoiceButton, { backgroundColor: theme.primary }]}
                  onPress={() => showInvoice(selectedPayment)}
                >
                  <Ionicons name="document-text-outline" size={19} color="#FFFFFF" />
                  <Text style={styles.invoiceButtonText}>View Invoice</Text>
                </Pressable>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 23,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 5,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueCard: {
    marginHorizontal: 16,
    padding: 19,
    borderRadius: 16,
  },
  revenueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueLabel: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  revenueAmount: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 7,
  },
  revenueIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revenueBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 17,
  },
  revenueNote: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    gap: 9,
    marginTop: 15,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 13,
  },
  statIcon: {
    width: 35,
    height: 35,
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
    fontSize: 10,
    marginTop: 4,
  },
  sectionHeader: {
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
  transactionCount: {
    fontSize: 12,
  },
  searchBox: {
    marginHorizontal: 16,
    height: 47,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterRow: {
    paddingHorizontal: 16,
    gap: 9,
    marginTop: 14,
    paddingBottom: 4,
  },
  filterButton: {
    borderWidth: 1,
    paddingHorizontal: 17,
    paddingVertical: 9,
    borderRadius: 20,
  },
  paymentCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  paymentTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentIcon: {
    width: 43,
    height: 43,
    borderRadius: 11,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 14,
    fontWeight: '700',
  },
  ownerName: {
    fontSize: 11,
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  paymentBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  transactionId: {
    fontSize: 10,
  },
  paymentDate: {
    fontSize: 10,
  },
  emptyState: {
    marginHorizontal: 16,
    marginTop: 15,
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
  modalAmount: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  modalAmountLabel: {
    fontSize: 12,
  },
  modalAmountValue: {
    fontSize: 30,
    fontWeight: '800',
    marginTop: 7,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#999999',
    gap: 10,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  invoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 20,
  },
  invoiceButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});