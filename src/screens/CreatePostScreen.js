// src/screens/CreatePostScreen.js
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert, Image, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { createPostAsync } from '../store/slices/postsSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const TOOLBAR_ACTIONS = [
  { icon: 'format-bold', action: 'bold', wrap: ['**', '**'] },
  { icon: 'format-italic', action: 'italic', wrap: ['*', '*'] },
  { icon: 'format-header-1', action: 'h1', prefix: '# ' },
  { icon: 'format-header-2', action: 'h2', prefix: '## ' },
  { icon: 'format-list-bulleted', action: 'bullet', prefix: '- ' },
  { icon: 'format-list-numbered', action: 'ordered', prefix: '1. ' },
  { icon: 'code-braces', action: 'code', wrap: ['`', '`'] },
  { icon: 'format-quote-close', action: 'quote', prefix: '> ' },
  { icon: 'link', action: 'link', wrap: ['[', '](url)'] },
];

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { profile } = useSelector((s) => s.auth);
  const { list: categories } = useSelector((s) => s.categories);
  const { theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [status, setStatus] = useState('published');
  const [allowComments, setAllowComments] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('write'); // write | preview | settings
  const [wordCount, setWordCount] = useState(0);
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  const contentRef = useRef(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('إذن مطلوب', 'نحتاج إذن الوصول إلى مكتبة الصور');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled) setCoverImage(result.assets[0].uri);
  };

  const applyFormat = useCallback((action) => {
    const toolbarItem = TOOLBAR_ACTIONS.find((t) => t.action === action);
    if (!toolbarItem) return;

    const selected = content.substring(selectionStart, selectionEnd);

    if (toolbarItem.wrap) {
      const [open, close] = toolbarItem.wrap;
      const formatted = selected
        ? `${open}${selected}${close}`
        : `${open}نص هنا${close}`;
      const newContent = content.substring(0, selectionStart) + formatted + content.substring(selectionEnd);
      setContent(newContent);
    } else if (toolbarItem.prefix) {
      const lineStart = content.lastIndexOf('\n', selectionStart - 1) + 1;
      const newContent = content.substring(0, lineStart) + toolbarItem.prefix + content.substring(lineStart);
      setContent(newContent);
    }
  }, [content, selectionStart, selectionEnd]);

  const addTag = () => {
    const cleaned = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      setTags([...tags, cleaned]);
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handleSubmit = async (publishStatus = 'published') => {
    if (!title.trim()) { Alert.alert('❌', 'العنوان مطلوب'); return; }
    if (!content.trim() || content.length < 100) { Alert.alert('❌', 'المحتوى يجب أن يكون 100 حرف على الأقل'); return; }
    if (!selectedCategory) { Alert.alert('❌', 'اختر تصنيفاً للمقال'); return; }

    setIsSubmitting(true);
    try {
      const result = await dispatch(createPostAsync({
        postData: {
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || content.substring(0, 200),
          categoryId: selectedCategory,
          tags,
          coverImage,
          status: publishStatus,
          allowComments,
          isPremium,
        },
        userId: profile.uid,
      }));

      if (createPostAsync.fulfilled.match(result)) {
        Alert.alert(
          '🎉 تم النشر!',
          publishStatus === 'draft' ? 'تم حفظ المسودة' : 'تم نشر مقالك بنجاح!',
          [{ text: 'حسناً', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('خطأ', result.payload || 'فشل نشر المقال');
      }
    } catch (error) {
      Alert.alert('خطأ', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>مقال جديد</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.draftBtn, { borderColor: colors.divider }]}
            onPress={() => handleSubmit('draft')}
            disabled={isSubmitting}
          >
            <Text style={[styles.draftBtnText, { color: colors.textSecondary }]}>مسودة</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSubmit('published')} disabled={isSubmitting}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.publishBtn}>
              {isSubmitting
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Text style={styles.publishBtnText}>نشر</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* Mode Tabs */}
      <View style={[styles.modeTabs, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        {['write', 'settings'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.modeTab, activeTab === tab && { borderBottomColor: COLORS.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.modeTabText, { color: activeTab === tab ? COLORS.primary : colors.textMuted }]}>
              {tab === 'write' ? '✏️ الكتابة' : '⚙️ الإعدادات'}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.wordCountBadge}>
          <Text style={[styles.wordCountText, { color: colors.textMuted }]}>
            {wordCount} كلمة · {readingTime} د
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {activeTab === 'write' ? (
          <>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {/* Cover Image */}
              <TouchableOpacity style={[styles.coverPicker, coverImage && { height: 200 }]} onPress={pickImage}>
                {coverImage ? (
                  <Image source={{ uri: coverImage }} style={styles.coverPreview} />
                ) : (
                  <View style={[styles.coverPlaceholder, { backgroundColor: colors.inputBg }]}>
                    <MaterialCommunityIcons name="image-plus" size={32} color={colors.textMuted} />
                    <Text style={[styles.coverPlaceholderText, { color: colors.textMuted }]}>إضافة صورة الغلاف</Text>
                    <Text style={[styles.coverPlaceholderSub, { color: colors.textMuted }]}>16:9 موصى به</Text>
                  </View>
                )}
                {coverImage && (
                  <TouchableOpacity style={styles.removeCover} onPress={() => setCoverImage(null)}>
                    <Feather name="x" size={16} color="#FFF" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {/* Title */}
              <TextInput
                style={[styles.titleInput, { color: colors.text }]}
                placeholder="عنوان المقال..."
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
                multiline
                maxLength={150}
                textAlign="right"
              />

              {/* Excerpt */}
              <TextInput
                style={[styles.excerptInput, { color: colors.textSecondary, borderTopColor: colors.divider }]}
                placeholder="ملخص قصير للمقال (اختياري)..."
                placeholderTextColor={colors.textMuted}
                value={excerpt}
                onChangeText={setExcerpt}
                multiline
                maxLength={300}
                textAlign="right"
              />

              {/* Content */}
              <TextInput
                ref={contentRef}
                style={[styles.contentInput, { color: colors.text }]}
                placeholder="ابدأ الكتابة هنا...&#10;&#10;يدعم تنسيق Markdown كاملاً ✨"
                placeholderTextColor={colors.textMuted}
                value={content}
                onChangeText={(t) => {
                  setContent(t);
                  setWordCount(t.trim().split(/\s+/).filter((w) => w.length > 0).length);
                }}
                multiline
                textAlign="right"
                onSelectionChange={({ nativeEvent: { selection } }) => {
                  setSelectionStart(selection.start);
                  setSelectionEnd(selection.end);
                }}
              />
            </ScrollView>

            {/* Markdown Toolbar */}
            <View style={[styles.toolbar, { backgroundColor: colors.surface, borderTopColor: colors.divider }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarScroll}>
                {TOOLBAR_ACTIONS.map((item) => (
                  <TouchableOpacity
                    key={item.action}
                    style={[styles.toolbarBtn, { backgroundColor: colors.inputBg }]}
                    onPress={() => applyFormat(item.action)}
                  >
                    <MaterialCommunityIcons name={item.icon} size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.toolbarBtn, { backgroundColor: colors.inputBg }]}
                  onPress={pickImage}
                >
                  <MaterialCommunityIcons name="image-outline" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </ScrollView>
            </View>
          </>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SPACING.base }}>
            {/* Category */}
            <Text style={[styles.settingLabel, { color: colors.text }]}>التصنيف *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.base }}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catChip,
                    { backgroundColor: selectedCategory === cat.id ? COLORS.primary : colors.inputBg },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Text style={styles.catChipIcon}>{cat.icon}</Text>
                  <Text style={[styles.catChipText, { color: selectedCategory === cat.id ? '#FFF' : colors.textSecondary }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tags */}
            <Text style={[styles.settingLabel, { color: colors.text }]}>الوسوم (Tags)</Text>
            <View style={[styles.tagInputRow, { backgroundColor: colors.inputBg }]}>
              <TextInput
                style={[styles.tagInput, { color: colors.text }]}
                placeholder="أضف وسماً..."
                placeholderTextColor={colors.textMuted}
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={addTag}
                textAlign="right"
              />
              <TouchableOpacity onPress={addTag} style={styles.addTagBtn}>
                <MaterialCommunityIcons name="plus" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.tagsRow}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagPill, { backgroundColor: COLORS.primary + '20' }]}
                  onPress={() => removeTag(tag)}
                >
                  <Text style={[styles.tagPillText, { color: COLORS.primary }]}>#{tag}</Text>
                  <Feather name="x" size={12} color={COLORS.primary} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Toggles */}
            {[
              { label: 'السماح بالتعليقات', value: allowComments, setter: setAllowComments, icon: 'comment-outline' },
              { label: 'محتوى مميز (Premium)', value: isPremium, setter: setIsPremium, icon: 'crown-outline' },
            ].map((toggle) => (
              <TouchableOpacity
                key={toggle.label}
                style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => toggle.setter(!toggle.value)}
              >
                <View style={[styles.toggleSwitch, { backgroundColor: toggle.value ? COLORS.primary : colors.inputBg }]}>
                  <View style={[styles.toggleThumb, { transform: [{ translateX: toggle.value ? 18 : 2 }] }]} />
                </View>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{toggle.label}</Text>
                <MaterialCommunityIcons name={toggle.icon} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  draftBtn: { paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.md, borderWidth: 1 },
  draftBtnText: { fontSize: 13, fontWeight: '600' },
  publishBtn: { paddingHorizontal: SPACING.base, paddingVertical: 8, borderRadius: BORDER_RADIUS.full },
  publishBtnText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  modeTabs: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  modeTab: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm },
  modeTabText: { fontSize: 14, fontWeight: '600' },
  wordCountBadge: { marginLeft: 'auto', paddingHorizontal: SPACING.base },
  wordCountText: { fontSize: 11 },
  coverPicker: { height: 120, margin: SPACING.base, borderRadius: BORDER_RADIUS.xl, overflow: 'hidden' },
  coverPreview: { width: '100%', height: '100%' },
  coverPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
  coverPlaceholderText: { fontSize: 14, fontWeight: '600' },
  coverPlaceholderSub: { fontSize: 11 },
  removeCover: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  titleInput: { fontSize: 22, fontWeight: '800', paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm, lineHeight: 32, minHeight: 70 },
  excerptInput: { fontSize: 15, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, borderTopWidth: 1, color: '#999', minHeight: 60, lineHeight: 22 },
  contentInput: { fontSize: 16, paddingHorizontal: SPACING.base, paddingTop: SPACING.base, lineHeight: 26, minHeight: 300 },
  toolbar: { borderTopWidth: 1, paddingVertical: SPACING.sm },
  toolbarScroll: { paddingHorizontal: SPACING.base, gap: SPACING.xs },
  toolbarBtn: { width: 38, height: 38, borderRadius: BORDER_RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '700', marginBottom: SPACING.sm, textAlign: 'right' },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, marginRight: SPACING.sm, marginBottom: SPACING.sm },
  catChipIcon: { fontSize: 14 },
  catChipText: { fontSize: 13, fontWeight: '600' },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.sm, marginBottom: SPACING.sm },
  tagInput: { flex: 1, paddingVertical: SPACING.sm, fontSize: 14 },
  addTagBtn: { padding: SPACING.sm },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.base },
  tagPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  tagPillText: { fontSize: 12, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, marginBottom: SPACING.sm, gap: SPACING.sm },
  toggleSwitch: { width: 44, height: 26, borderRadius: 13, justifyContent: 'center', padding: 2 },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FFF' },
  toggleLabel: { flex: 1, fontSize: 15, fontWeight: '600', textAlign: 'right' },
});

export default CreatePostScreen;
