import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type AttendanceStatus = 'Present' | 'Absent' | 'Rest Day';

type AttendanceRecord = {
  date: string;
  day: string;
  status: AttendanceStatus;
  checkIn?: string;
  duration?: string;
};

export default function AttendanceScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  const [selectedFilter, setSelectedFilter] = useState('All');

  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const today = new Date();

  const monthName = selectedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Sample attendance records for UI preview.
  // Real attendance data can be connected to your backend later.
  const attendanceRecords: AttendanceRecord[] = [
    {
      date: '28 Oct',
      day: 'Wednesday',
      status: 'Present',
      checkIn: '07:15 AM',
      duration: '1h 20m',
    },
    {
      date: '27 Oct',
      day: 'Tuesday',
      status: 'Present',
      checkIn: '07:30 AM',
      duration: '1h 10m',
    },
    {
      date: '26 Oct',
      day: 'Monday',
      status: 'Absent',
    },
    {
      date: '25 Oct',
      day: 'Sunday',
      status: 'Rest Day',
    },
    {
      date: '24 Oct',
      day: 'Saturday',
      status: 'Present',
      checkIn: '08:00 AM',
      duration: '1h 30m',
    },
    {
      date: '23 Oct',
      day: 'Friday',
      status: 'Present',
      checkIn: '07:20 AM',
      duration: '1h 15m',
    },
  ];

  const filteredRecords =
    selectedFilter === 'All'
      ? attendanceRecords
      : attendanceRecords.filter(
          (record) => record.status === selectedFilter,
        );

  const changeMonth = (direction: number) => {
    setSelectedMonth(
      new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + direction,
        1,
      ),
    );
  };

  const isCurrentMonth =
    selectedMonth.getMonth() === today.getMonth() &&
    selectedMonth.getFullYear() === today.getFullYear();

  const calendarDays = (() => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: totalDays }, (_, index) => index + 1),
    ];
  })();

  // Sample calendar dates for demonstration.
  const presentDays = [2, 3, 5, 6, 9, 10, 12, 14, 16, 17, 20, 21, 23, 24, 27];
  const absentDays = [8, 15, 26];

  const styles = createStyles(theme);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR FITNESS JOURNEY</Text>
            <Text style={styles.title}>Attendance</Text>
            <Text style={styles.subtitle}>
              Every visit brings you closer to your goal.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="calendar-outline"
              size={25}
              color={theme.primary}
            />
          </View>
        </View>

        {/* Monthly Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>MONTHLY ATTENDANCE</Text>
              <View style={styles.percentageRow}>
                <Text style={styles.percentage}>83%</Text>
                <View style={styles.trendBadge}>
                  <Ionicons
                    name="trending-up"
                    size={14}
                    color="#B9F6CA"
                  />
                  <Text style={styles.trendText}>On track</Text>
                </View>
              </View>
              <Text style={styles.summaryDescription}>
                Great consistency! Keep it up.
              </Text>
            </View>

            <View style={styles.targetCircle}>
              <Ionicons name="fitness" size={30} color="#FFFFFF" />
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressCaption}>Attendance goal</Text>
            <Text style={styles.progressTarget}>90%</Text>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E1F8E9' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#239653" />
            </View>
            <Text style={styles.statNumber}>15</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FDE8E7' }]}>
              <Ionicons name="close-circle" size={20} color="#D94A48" />
            </View>
            <Text style={styles.statNumber}>03</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E6EDFF' }]}>
              <Ionicons name="flame" size={20} color="#536DE8" />
            </View>
            <Text style={styles.statNumber}>05</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Attendance calendar</Text>
              <Text style={styles.sectionSubtitle}>
                Track your gym visits
              </Text>
            </View>
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.monthHeader}>
              <Pressable
                onPress={() => changeMonth(-1)}
                style={styles.monthButton}
                accessibilityLabel="Previous month"
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={theme.text}
                />
              </Pressable>

              <Text style={styles.monthTitle}>{monthName}</Text>

              <Pressable
                onPress={() => changeMonth(1)}
                disabled={
                  selectedMonth.getFullYear() > today.getFullYear() ||
                  (selectedMonth.getFullYear() === today.getFullYear() &&
                    selectedMonth.getMonth() >= today.getMonth())
                }
                style={styles.monthButton}
                accessibilityLabel="Next month"
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    isCurrentMonth
                      ? theme.secondaryText
                      : theme.text
                  }
                />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(
                (day, index) => (
                  <Text key={`${day}-${index}`} style={styles.weekDay}>
                    {day}
                  </Text>
                ),
              )}
            </View>

            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return (
                    <View
                      key={`empty-${index}`}
                      style={styles.calendarCell}
                    />
                  );
                }

                const isPresent =
                  selectedMonth.getMonth() === 9 &&
                  selectedMonth.getFullYear() === 2026 &&
                  presentDays.includes(day);

                const isAbsent =
                  selectedMonth.getMonth() === 9 &&
                  selectedMonth.getFullYear() === 2026 &&
                  absentDays.includes(day);

                const isToday =
                  day === today.getDate() &&
                  selectedMonth.getMonth() === today.getMonth() &&
                  selectedMonth.getFullYear() === today.getFullYear();

                return (
                  <View key={day} style={styles.calendarCell}>
                    <View
                      style={[
                        styles.dayCircle,
                        isPresent && styles.presentDay,
                        isAbsent && styles.absentDay,
                        isToday && styles.todayDay,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          isPresent && styles.presentDayText,
                          isAbsent && styles.absentDayText,
                          isToday && styles.todayDayText,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#239653' }]}
                />
                <Text style={styles.legendText}>Present</Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: '#D94A48' }]}
                />
                <Text style={styles.legendText}>Absent</Text>
              </View>

              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: theme.border },
                  ]}
                />
                <Text style={styles.legendText}>No record</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Attendance History */}
        <View style={styles.section}>
          <View style={styles.historyHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent activity</Text>
              <Text style={styles.sectionSubtitle}>
                Your latest attendance records
              </Text>
            </View>

            <Ionicons
              name="time-outline"
              size={23}
              color={theme.secondaryText}
            />
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {['All', 'Present', 'Absent', 'Rest Day'].map((filter) => {
              const active = selectedFilter === filter;

              return (
                <Pressable
                  key={filter}
                  onPress={() => setSelectedFilter(filter)}
                  style={[
                    styles.filterButton,
                    active && {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      active && styles.activeFilterText,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.historyCard}>
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => {
                const isPresent = record.status === 'Present';
                const isAbsent = record.status === 'Absent';

                return (
                  <View
                    key={`${record.date}-${record.status}`}
                    style={[
                      styles.historyItem,
                      index !== filteredRecords.length - 1 &&
                        styles.historyBorder,
                    ]}
                  >
                    <View
                      style={[
                        styles.historyIcon,
                        {
                          backgroundColor: isPresent
                            ? '#E1F8E9'
                            : isAbsent
                              ? '#FDE8E7'
                              : '#E6EDFF',
                        },
                      ]}
                    >
                      <Ionicons
                        name={
                          isPresent
                            ? 'checkmark-circle'
                            : isAbsent
                              ? 'close-circle'
                              : 'bed-outline'
                        }
                        size={22}
                        color={
                          isPresent
                            ? '#239653'
                            : isAbsent
                              ? '#D94A48'
                              : '#536DE8'
                        }
                      />
                    </View>

                    <View style={styles.historyInfo}>
                      <Text style={styles.historyDate}>{record.date}</Text>
                      <Text style={styles.historyDay}>{record.day}</Text>

                      {record.checkIn && (
                        <View style={styles.checkInRow}>
                          <Ionicons
                            name="time-outline"
                            size={13}
                            color={theme.secondaryText}
                          />
                          <Text style={styles.checkInText}>
                            {record.checkIn}
                            {record.duration
                              ? `  ·  ${record.duration}`
                              : ''}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isPresent
                            ? '#E1F8E9'
                            : isAbsent
                              ? '#FDE8E7'
                              : '#E6EDFF',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: isPresent
                              ? '#239653'
                              : isAbsent
                                ? '#D94A48'
                                : '#536DE8',
                          },
                        ]}
                      >
                        {record.status}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={30}
                  color={theme.secondaryText}
                />
                <Text style={styles.emptyTitle}>No records found</Text>
                <Text style={styles.emptySubtitle}>
                  Try selecting another filter.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Motivation Card */}
        <View style={styles.motivationCard}>
          <View style={styles.motivationIcon}>
            <Ionicons name="trophy-outline" size={25} color="#D8A743" />
          </View>

          <View style={styles.motivationContent}>
            <Text style={styles.motivationTitle}>Consistency is key!</Text>
            <Text style={styles.motivationText}>
              Show up for yourself. Every workout counts toward a stronger you.
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: (typeof Colors)['light']) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 22,
    },
    eyebrow: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.5,
      color: theme.primary,
      marginBottom: 6,
    },
    title: {
      fontSize: 29,
      fontWeight: '800',
      color: theme.text,
      letterSpacing: -0.7,
    },
    subtitle: {
      fontSize: 12,
      color: theme.secondaryText,
      marginTop: 5,
      lineHeight: 18,
    },
    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    summaryCard: {
      backgroundColor: theme.primary,
      borderRadius: 22,
      padding: 20,
      marginBottom: 16,
    },
    summaryTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.1,
      color: '#FFFFFF',
      opacity: 0.8,
    },
    percentageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 7,
    },
    percentage: {
      fontSize: 36,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    trendBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255,255,255,0.15)',
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 20,
    },
    trendText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '600',
    },
    summaryDescription: {
      color: '#FFFFFF',
      opacity: 0.85,
      fontSize: 12,
      marginTop: 3,
    },
    targetCircle: {
      width: 55,
      height: 55,
      borderRadius: 18,
      backgroundColor: 'rgba(255,255,255,0.17)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    progressTrack: {
      height: 7,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: 10,
      marginTop: 24,
      overflow: 'hidden',
    },
    progressFill: {
      width: '83%',
      height: '100%',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
    },
    progressFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    progressCaption: {
      color: '#FFFFFF',
      fontSize: 11,
      opacity: 0.85,
    },
    progressTarget: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 27,
    },
    statCard: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderRadius: 17,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.text,
    },
    statLabel: {
      fontSize: 11,
      color: theme.secondaryText,
      marginTop: 4,
    },
    section: {
      marginBottom: 26,
    },
    sectionHeader: {
      marginBottom: 14,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: theme.secondaryText,
      marginTop: 5,
    },
    calendarCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 15,
    },
    monthHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 19,
    },
    monthButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },
    monthTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },
    weekRow: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    weekDay: {
      width: `${100 / 7}%` as `${number}%`,
      textAlign: 'center',
      fontSize: 11,
      fontWeight: '700',
      color: theme.secondaryText,
      paddingVertical: 7,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    calendarCell: {
      width: `${100 / 7}%` as `${number}%`,
      height: 43,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircle: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayText: {
      fontSize: 12,
      color: theme.text,
      fontWeight: '500',
    },
    presentDay: {
      backgroundColor: '#E1F8E9',
    },
    presentDayText: {
      color: '#239653',
      fontWeight: '800',
    },
    absentDay: {
      backgroundColor: '#FDE8E7',
    },
    absentDayText: {
      color: '#D94A48',
      fontWeight: '800',
    },
    todayDay: {
      borderWidth: 2,
      borderColor: theme.primary,
    },
    todayDayText: {
      fontWeight: '800',
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      marginTop: 13,
      paddingTop: 15,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 10,
      color: theme.secondaryText,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    filterContainer: {
      gap: 8,
      paddingBottom: 15,
    },
    filterButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    filterText: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: '600',
    },
    activeFilterText: {
      color: '#FFFFFF',
    },
    historyCard: {
      backgroundColor: theme.card,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: 14,
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      gap: 11,
    },
    historyBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    historyIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    historyInfo: {
      flex: 1,
      minWidth: 0,
    },
    historyDate: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },
    historyDay: {
      fontSize: 11,
      color: theme.secondaryText,
      marginTop: 3,
    },
    checkInRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
    },
    checkInText: {
      fontSize: 10,
      color: theme.secondaryText,
    },
    statusBadge: {
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 9,
      alignSelf: 'center',
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 35,
    },
    emptyTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginTop: 10,
    },
    emptySubtitle: {
      fontSize: 12,
      color: theme.secondaryText,
      marginTop: 5,
    },
    motivationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 13,
      backgroundColor: theme.card,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
      padding: 17,
    },
    motivationIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor: '#FFF4D8',
      alignItems: 'center',
      justifyContent: 'center',
    },
    motivationContent: {
      flex: 1,
    },
    motivationTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text,
    },
    motivationText: {
      fontSize: 11,
      lineHeight: 17,
      color: theme.secondaryText,
      marginTop: 5,
    },
  });
}