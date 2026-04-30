import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { saveUserProfile, createTeam, getTeam, serverTimestamp } from '../services/firestore';
import { getCurrentUser } from '../services/auth';

/**
 * OnboardingScreen — shown once after the user logs in for the first time.
 * Collects: Name, Grade, and team info (join existing team or create a new one).
 * "Start Exploring" at the bottom navigates to the main tab navigator.
 */
export default function OnboardingScreen() {
  const router = useRouter();

  // ── Personal info fields ──────────────────────────────────────────────────
  const [name, setName]     = useState('');
  const [grade, setGrade]   = useState('');
  const [gradeOpen, setGradeOpen] = useState(false);

  // ── Team choice: null = not answered yet, true = in a team, false = create one
  const [inTeam, setInTeam] = useState<boolean | null>(null);

  // ── Join existing team ────────────────────────────────────────────────────
  const [teamId, setTeamId] = useState('');

  // ── Create new team ───────────────────────────────────────────────────────
  const [teamName, setTeamName]         = useState('');
  const [memberEmail, setMemberEmail]   = useState(''); // current input value
  const [members, setMembers]           = useState<string[]>([]); // confirmed member list
  const [emailError, setEmailError]     = useState('');

  // ── Form-level validation error ───────────────────────────────────────────
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * addMember — validates the email input and appends it to the members list.
   * Clears the input field on success.
   */
  const addMember = () => {
    const trimmed = memberEmail.trim();

    // Basic email format check
    if (!trimmed || !trimmed.includes('@')) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    // Prevent adding the same email twice
    if (members.includes(trimmed)) {
      setEmailError('This member has already been added.');
      return;
    }

    setEmailError('');
    setMembers((prev) => [...prev, trimmed]); // append to the list
    setMemberEmail('');                        // reset the input
  };

  /**
   * removeMember — removes a member from the list by their email string.
   */
  const removeMember = (email: string) => {
    setMembers((prev) => prev.filter((m) => m !== email));
  };

  /**
   * handleStart — validates the form then navigates to the main app.
   * Does not persist data yet; wire up Firestore here when ready.
   */
  const handleStart = async () => {
    // Name and grade are always required
    if (!name.trim() || !grade.trim()) {
      setError('Please fill in your name and grade.');
      return;
    }

    // Team choice must be answered
    if (inTeam === null) {
      setError('Please tell us whether you are in a team yet.');
      return;
    }

    // Join path: Team ID is required
    if (inTeam && !teamId.trim()) {
      setError('Please enter your Team ID.');
      return;
    }

    // Create path: Team name is required (members are optional)
    if (!inTeam && !teamName.trim()) {
      setError('Please enter a name for your team.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const user = getCurrentUser();

      let resolvedTeamId = teamId.trim().toUpperCase();

      if (inTeam) {
        // Validate the entered team ID exists in Firestore
        const teamSnap = await getTeam(resolvedTeamId);
        if (!teamSnap.exists()) {
          setError('Team ID not found. Please check and try again.');
          setLoading(false);
          return;
        }
      } else {
        // Create a new team — the ID is generated inside createTeam
        resolvedTeamId = await createTeam({
          name: teamName.trim(),
          members: [user.email, ...members],
          createdAt: serverTimestamp(),
        });
      }

      await saveUserProfile(user.uid, {
        name: name.trim(),
        grade,
        teamId: resolvedTeamId,
        email: user.email,
        createdAt: serverTimestamp(),
      });

      router.replace('/(tabs)');
      
    } catch (e: any) {
      setError(e.message ?? 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView lifts the card above the keyboard on iOS
    <KeyboardAvoidingView
      style={s.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.card}>

          {/* ── Header ── */}
          <Text style={s.title}>Almost There!</Text>
          <Text style={s.subtitle}>Tell us a bit about yourself</Text>

          {/* ── Global error banner ── */}
          {error ? <Text style={s.error}>{error}</Text> : null}

          {/* ── Name ── */}
          <Text style={s.label}>Your Name</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Alex Johnson"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />

          {/* ── Grade ── */}
          <Text style={s.label}>Grade / Year Level</Text>
          <Pressable
            style={s.dropdownTrigger}
            onPress={() => setGradeOpen((o) => !o)}
          >
            <Text style={[s.dropdownValue, !grade && s.dropdownPlaceholder]}>
              {grade ? `Grade ${grade}` : 'Select your grade'}
            </Text>
            <MaterialCommunityIcons
              name={gradeOpen ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </Pressable>
          {gradeOpen && (
            <View style={s.dropdownList}>
              {['5', '6', '7', '8', '9', '10', '11', '12'].map((g, i, arr) => (
                <Pressable
                  key={g}
                  style={[
                    s.dropdownItem,
                    grade === g && s.dropdownItemActive,
                    i < arr.length - 1 && s.dropdownItemBorder,
                  ]}
                  onPress={() => { setGrade(g); setGradeOpen(false); }}
                >
                  <Text style={[s.dropdownItemText, grade === g && s.dropdownItemTextActive]}>
                    Grade {g}
                  </Text>
                  {grade === g && (
                    <MaterialCommunityIcons name="check" size={16} color="#3977fd" />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {/* ── Team question ── */}
          <Text style={s.label}>Are you in a team yet?</Text>
          <View style={s.toggleRow}>

            {/* YES button */}
            <Pressable
              style={[s.toggleBtn, inTeam === true && s.toggleBtnActive]}
              onPress={() => setInTeam(true)}
            >
              <Text style={[s.toggleText, inTeam === true && s.toggleTextActive]}>
                Yes
              </Text>
            </Pressable>

            {/* NO button */}
            <Pressable
              style={[s.toggleBtn, inTeam === false && s.toggleBtnActive]}
              onPress={() => setInTeam(false)}
            >
              <Text style={[s.toggleText, inTeam === false && s.toggleTextActive]}>
                No
              </Text>
            </Pressable>

          </View>

          {/* ── Join existing team (shown when inTeam === true) ── */}
          {inTeam === true && (
            <View style={s.subCard}>
              <Text style={s.subCardTitle}>Enter Your Team ID</Text>
              <Text style={s.label}>Team ID</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. A3K9Z"
                placeholderTextColor="#9CA3AF"
                value={teamId}
                onChangeText={setTeamId}
                autoCapitalize="characters"
              />
            </View>
          )}
          {/* ── Create new team (shown when inTeam === false) ── */}
          {inTeam === false && (
            <View style={s.subCard}>
              <Text style={s.subCardTitle}>Create Your Team</Text>

              {/* Team name input */}
              <Text style={s.label}>Team Name</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Team Nova"
                placeholderTextColor="#9CA3AF"
                value={teamName}
                onChangeText={setTeamName}
              />

              {/* Add researchers section */}
              <Text style={s.label}>Active Researchers</Text>
              <Text style={s.hint}>Add teammates by email address</Text>

              {/* Email input + Add button row */}
              <View style={s.addRow}>
                <TextInput
                  style={[s.input, s.addInput]}
                  placeholder="teammate@example.com"
                  placeholderTextColor="#9CA3AF"
                  value={memberEmail}
                  onChangeText={(t) => { setMemberEmail(t); setEmailError(''); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Pressable style={s.addBtn} onPress={addMember}>
                  <MaterialCommunityIcons name="plus" size={22} color="#fff" />
                </Pressable>
              </View>

              {/* Email validation error */}
              {emailError ? <Text style={s.emailError}>{emailError}</Text> : null}

              {/* List of added members */}
              {members.map((m) => (
                <View key={m} style={s.memberRow}>
                  {/* Avatar initial circle */}
                  <View style={s.memberAvatar}>
                    <Text style={s.memberInitial}>{m[0].toUpperCase()}</Text>
                  </View>

                  {/* Email label */}
                  <Text style={s.memberEmail} numberOfLines={1}>{m}</Text>

                  {/* Remove button */}
                  <Pressable onPress={() => removeMember(m)} hitSlop={8}>
                    <MaterialCommunityIcons name="close-circle" size={20} color="#9CA3AF" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* ── Start Exploring button ── */}
          <Pressable
            style={({ pressed }) => [s.btn, pressed && { opacity: 0.85 }]}
            onPress={handleStart}
          >
            <Text style={s.btnText}>Start Exploring</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" style={{ marginLeft: 6 }} />
          </Pressable>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles (same palette and card format as login/register screens) ──────────

const s = StyleSheet.create({
  // Blue background matching the login screen
  screen: {
    flex: 1,
    backgroundColor: '#E6F4FE',
  },

  // Centres the card and adds breathing room at top/bottom
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 40,
  },

  // White rounded card — same as login
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },

  // Field label above each input
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },

  // Text input — same as login
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },

  // Yes / No toggle container
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  // Individual Yes/No pill button (inactive state)
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },

  // Selected state for Yes/No button
  toggleBtnActive: {
    backgroundColor: '#3977fd',
    borderColor: '#3977fd',
  },

  toggleText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },

  // Text colour when toggle is selected
  toggleTextActive: {
    color: '#fff',
  },

  dropdownTrigger: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  dropdownValue: {
    fontSize: 15,
    color: '#1F2937',
  },

  dropdownPlaceholder: {
    color: '#9CA3AF',
  },

  dropdownList: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  dropdownItemActive: {
    backgroundColor: '#EEF4FF',
  },

  dropdownItemText: {
    fontSize: 15,
    color: '#374151',
  },

  dropdownItemTextActive: {
    color: '#3977fd',
    fontWeight: '600',
  },

  // Indented card shown below the toggle for team forms
  subCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },

  subCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 14,
  },

  // Small helper text below a label
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: -10,
    marginBottom: 10,
  },

  // Row containing the email input + Add button
  addRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  // Email input stretches to fill remaining space
  addInput: {
    flex: 1,
    marginBottom: 0,
  },

  // Blue square Add button
  addBtn: {
    backgroundColor: '#3977fd',
    borderRadius: 12,
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Small red error text under the email add row
  emailError: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 6,
    marginBottom: 8,
  },

  // Row showing a confirmed team member
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Circular avatar with member's initial
  memberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3977fd',
    justifyContent: 'center',
    alignItems: 'center',
  },

  memberInitial: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },

  // Email text in the member row — truncates if too long
  memberEmail: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },

  // Primary CTA button — same blue as login
  btn: {
    backgroundColor: '#3977fd',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Red error banner at the top of the card
  error: {
    color: '#E74C3C',
    fontSize: 13,
    marginBottom: 12,
    backgroundColor: '#FDECEA',
    padding: 10,
    borderRadius: 8,
  },
});
