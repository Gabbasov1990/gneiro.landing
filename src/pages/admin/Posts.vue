<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAdminStore } from '@/store/admin';
import EntityTable from '@/components/admin/EntityTable.vue';
import EntityEditor from '@/components/admin/EntityEditor.vue';
import Card from 'primevue/card';

const adminStore = useAdminStore();

// State
const showEditor = ref(false);
const currentPost = ref(null);
const isNewPost = ref(false);

// Fetch posts when component mounts
onMounted(async () => {
  console.log('Fetching posts...');
  await adminStore.fetchPosts();
});

// Add new post
const handleAddPost = () => {
  currentPost.value = null;
  isNewPost.value = true;
  showEditor.value = true;
};

// Edit post
const handleEditPost = (post) => {
  currentPost.value = post;
  isNewPost.value = false;
  showEditor.value = true;
};

// View post
const handleViewPost = (post) => {
  // In a real app, open the post in a new tab or display a preview
  window.open(`/blog/${post.slug}`, '_blank');
};

// Delete post
const handleDeletePost = async (post) => {
  await adminStore.deletePost(post.id);
};

// Refresh posts
const handleRefresh = async () => {
  await adminStore.fetchPosts();
};

// Save post
const handleSavePost = async (post) => {
  try {
    if (isNewPost.value) {
      await adminStore.createPost(post);
    } else {
      await adminStore.updatePost(post.id, post);
    }
    showEditor.value = false;
  } catch (error) {
    console.error('Error saving post:', error);
  }
};

// Preview post
const handlePreviewPost = (post) => {
  // For preview, we'd typically open a new window or display a preview modal
  // For now, just log the post data
  console.log('Preview post:', post);

  // Could also open a placeholder URL with query params
  // window.open(`/blog/preview?title=${encodeURIComponent(post.title)}`, '_blank');
};
</script>

<template>
  <div class="posts-page">
    <Card>
      <template #content>
        <EntityTable :items="adminStore.posts" :loading="adminStore.isLoading" entityName="статью"
          entityNamePlural="статьи" @add="handleAddPost" @edit="handleEditPost" @view="handleViewPost"
          @delete="handleDeletePost" @refresh="handleRefresh" />
      </template>
    </Card>

    <EntityEditor v-model:visible="showEditor" :entity="currentPost" entityType="post" :isNew="isNewPost"
      @save="handleSavePost" @preview="handlePreviewPost" />
  </div>
</template>

<style scoped>
.posts-page {
  margin-bottom: 2rem;
}
</style>