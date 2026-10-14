<template>
  <section class="community-page">
    <div class="community-stream-shell" :aria-hidden="selectedPost ? 'true' : null" :inert="Boolean(selectedPost)">
      <CommunityRail
        :composer-label="composerRailLabel"
        :composer-expanded="isComposerExpanded"
        :is-logged-in="Boolean(user)"
        :login-href="loginHref()"
        @focus-composer="focusComposer"
      />

      <div class="community-main">
        <header class="community-stream-header">
          <div>
            <p class="eyebrow">Community</p>
            <h1>4399123 社区</h1>
            <p class="community-stream-lede">
              围绕 Vibe Coding、AI 工具、作品展示和产品反馈，把构建过程、问题和灵感放到同一个讨论区。
            </p>
          </div>
          <div class="community-stream-status" aria-label="社区状态">
            <strong>{{ posts.length }}</strong>
            <span>条帖子</span>
          </div>
        </header>

        <CommunityFilterTabs
          :sort-options="sortOptions"
          :sort="selectedSort"
          @select-sort="selectSort"
        />

        <InboxPanel
          v-if="user && isInboxOpen"
          :is-open="isInboxOpen"
          :unread-count="unreadNotifications"
          :notifications="notifications"
          :error="notificationError"
          @toggle="toggleInbox"
          @mark-all-read="markAllNotificationsRead"
          @retry="loadNotifications"
          @open-notification="openNotification"
        />

        <div v-if="user" class="community-compose-entry">
          <button
            ref="composerToggle"
            class="secondary-link small-action"
            type="button"
            :aria-expanded="isComposerExpanded"
            aria-controls="community-post-composer"
            :disabled="isSubmitting"
            @click="toggleComposer"
          >
            {{ isComposerExpanded ? "收起发布帖子" : "发布帖子" }}
          </button>
          <p v-if="success && !isComposerExpanded" class="form-message" role="status">{{ success }}</p>
        </div>

        <form
          v-if="user"
          v-show="isComposerExpanded"
          id="community-post-composer"
          ref="composerForm"
          class="composer-panel stream-composer"
          :class="{ 'drag-over': isComposerDragOver, expanded: isComposerExpanded }"
          @submit.prevent="submitPost"
          @paste="handleComposerPaste"
          @dragenter.prevent="handleComposerDragEnter"
          @dragover.prevent="isComposerDragOver = true"
          @dragleave.prevent="handleComposerDragLeave"
          @drop.prevent="handleComposerDrop"
        >
          <div class="composer-head composer-author-row">
            <AuthorAvatar :author="user" />
            <div>
              <strong>@{{ user.username }}</strong>
              <span>{{ composerHeading }}</span>
            </div>
          </div>

          <div class="composer-fields">
            <label class="field-label composer-title-field">
              标题
              <input
                v-model.trim="form.title"
                class="quick-composer-title"
                maxlength="120"
                :placeholder="composerTitlePlaceholder"
                @focus="isComposerExpanded = true"
              />
            </label>
            <label class="field-label composer-body-field">
              内容
              <textarea
                v-model.trim="form.body"
                class="quick-composer-input"
                :rows="isComposerExpanded ? 6 : 4"
                maxlength="4000"
                :placeholder="composerBodyPlaceholder"
                @focus="isComposerExpanded = true"
              ></textarea>
            </label>
          </div>

          <div v-if="isComposerExpanded || attachmentFiles.length" class="attachment-uploader">
            <label class="attachment-trigger">
              <span>添加附件</span>
              <small>{{ attachmentHelperText }}</small>
              <input type="file" multiple accept="image/*,video/*,.pdf,.txt,.zip" @change="handleAttachmentChange" />
            </label>
            <div v-if="attachmentFiles.length" class="attachment-list draft">
              <div v-for="file in attachmentFiles" :key="`${file.name}-${file.size}`" class="attachment-chip">
                <span>{{ attachmentIcon(file.type) }}</span>
                <strong>{{ file.name }}</strong>
                <small>{{ formatFileSize(file.size) }}</small>
                <button type="button" @click="removeAttachment(file)">移除</button>
              </div>
            </div>
          </div>

          <div class="composer-actions">
            <p v-if="error" class="form-message error-state">{{ error }}</p>
            <p v-else-if="success" class="form-message">{{ success }}</p>
            <div class="inline-actions">
              <button
                class="secondary-link small-action"
                type="button"
                :aria-expanded="isComposerExpanded"
                aria-controls="community-post-composer"
                :disabled="isSubmitting"
                @click="toggleComposer"
              >
                收起
              </button>
              <button class="secondary-link small-action" type="button" :disabled="isSubmitting" @click="saveDraft">
                存草稿
              </button>
              <button class="primary-link compact-action" type="submit" :disabled="isSubmitting">
                {{ submitButtonLabel }}
              </button>
            </div>
          </div>
        </form>

        <div v-else class="composer-panel community-login-panel">
          <div>
            <p class="eyebrow">Start Here</p>
            <h2>{{ loginPanelTitle }}</h2>
            <p>{{ loginPanelBody }}</p>
          </div>
          <div class="auth-actions">
            <a class="primary-link" :href="loginHref()">登录</a>
            <a class="secondary-link" :href="registerHref()">注册</a>
          </div>
        </div>
        <div v-if="loginPrompt" class="community-action-prompt">
          <p>{{ loginPrompt }}</p>
          <a class="primary-link compact-action" :href="loginHref()">登录后继续</a>
          <button class="text-action" type="button" @click="loginPrompt = ''">关闭</button>
        </div>

        <div v-if="isLoading" class="blog-state community-loading-state" role="status" aria-live="polite">
          正在读取社区帖子...
        </div>
        <div v-else-if="loadError" class="blog-state community-loading-state error-state" role="alert">
          <p>{{ loadError }}</p>
          <button class="secondary-link small-action" type="button" @click="loadPosts()">重新加载</button>
        </div>
        <div v-else-if="posts.length" class="topic-list">
          <PostCard
            v-for="(post, index) in posts"
            :key="post.id"
            :post="post"
            :index="index"
            :share-status-post-id="shareStatusPostId"
            :like-busy-post-id="likeBusyPostId"
            :bookmark-busy-post-id="bookmarkBusyPostId"
            :follow-busy-user-id="followBusyUserId"
            @open="openPost"
            @share="sharePost"
            @like="toggleLike"
            @bookmark="toggleBookmark"
            @follow="toggleFollow"
          />
          <div v-if="pageInfo.hasNext" class="community-load-more">
            <button
              class="secondary-link compact-action"
              type="button"
              :disabled="isLoadingMore"
              @click="loadMorePosts"
            >
              {{ isLoadingMore ? "加载中..." : "加载更多" }}
            </button>
          </div>
        </div>
        <CommunityEmptyState
          v-else
          :eyebrow="emptyStateEyebrow"
          :title="emptyStateTitle"
          :body="emptyStateBody"
          :prompts="emptyPrompts"
          @use-prompt="usePrompt"
        />
      </div>

      <CommunitySidecard :social-summary="socialSummary" />
    </div>

    <div v-if="selectedPost" class="topic-modal-backdrop" role="presentation" @click.self="closePost">
      <article
        ref="topicModal"
        class="topic-card topic-detail-card topic-modal"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`topic-title-${selectedPost.id}`"
        tabindex="-1"
      >
          <div class="detail-topbar">
            <button class="text-action back-action" type="button" @click="closePost">返回</button>
            <div class="detail-nav-title">
              <strong>主页</strong>
              <span>{{ detailTypeLabel(selectedPost) }}</span>
            </div>
            <div class="detail-nav-tags" aria-label="帖子标签">
              <span class="forum-badge badge-owner">楼主</span>
              <span v-for="badge in selectedPost.badges || []" :key="`nav-${badge.key}`" class="forum-badge" :class="`badge-${badge.key}`">{{ badge.label }}</span>
              <span v-if="selectedPost.isDraft" class="draft-badge">草稿</span>
            </div>
          </div>
          <p v-if="isPostDetailLoading" class="form-message" role="status" aria-live="polite">
            正在加载完整帖子和回复...
          </p>
          <p v-else-if="postActionError && editingPostId !== selectedPost.id" class="form-message error-state" role="alert">
            {{ postActionError }}
            <button class="text-action" type="button" @click="showPostById(selectedPost.id)">重试</button>
          </p>

          <form v-if="editingPostId === selectedPost.id" class="edit-panel" @submit.prevent="submitEdit(selectedPost)">
            <div class="composer-grid">
              <label class="field-label">
                标题
                <input v-model.trim="editForm.title" maxlength="120" />
              </label>
            </div>
            <label class="field-label">
              正文
              <textarea v-model.trim="editForm.body" rows="5" maxlength="4000"></textarea>
            </label>
            <div class="composer-actions">
              <p v-if="postActionError" class="form-message error-state">{{ postActionError }}</p>
              <span v-else></span>
              <div class="inline-actions">
                <button class="secondary-link small-action" type="button" @click="cancelEdit">取消</button>
                <button class="secondary-link small-action" type="button" :disabled="isPostActionBusy" @click="submitEdit(selectedPost, 'draft')">
                  存为草稿
                </button>
                <button class="primary-link compact-action" type="submit" :disabled="isPostActionBusy">
                  发布更新
                </button>
              </div>
            </div>
          </form>

          <template v-else>
            <section class="detail-original">
              <AuthorAvatar :author="selectedPost.author" :href="userProfileUrl(selectedPost.author)" size="large" />
              <div class="detail-original-body">
                <div class="stream-post-meta">
                  <a class="author-name-link" :href="userProfileUrl(selectedPost.author)">@{{ selectedPost.author.username }}</a>
                  <span class="forum-badge badge-owner">楼主</span>
                  <span v-for="badge in selectedPost.badges || []" :key="`detail-${badge.key}`" class="forum-badge" :class="`badge-${badge.key}`">{{ badge.label }}</span>
                  <span v-if="selectedPost.isDraft" class="draft-badge">草稿</span>
                  <time :datetime="selectedPost.createdAt">{{ formatTime(selectedPost.createdAt) }}</time>
                </div>
                <h2 :id="`topic-title-${selectedPost.id}`">{{ selectedPost.title }}</h2>
                <div class="forum-thread-stats" aria-label="帖子统计">
                  <span>{{ selectedPost.replyCount || replyCount(selectedPost) }} 回复</span>
                  <span>{{ selectedPost.viewCount || 0 }} 浏览</span>
                  <span>{{ selectedPost.likeCount || 0 }} 赞</span>
                  <span>最后活跃 {{ formatTime(selectedPost.lastActivityAt || selectedPost.updatedAt) }}</span>
                </div>
                <p>{{ selectedPost.body }}</p>
                <div v-if="selectedPost.attachments?.length" class="attachment-gallery">
                  <div
                    v-for="attachment in selectedPost.attachments"
                    :key="attachment.id"
                    class="attachment-card"
                  >
                    <button
                      v-if="attachment.type === 'image'"
                      class="attachment-preview-button"
                      type="button"
                      @click="openImagePreview(attachment)"
                    >
                      <img :src="attachment.url" :alt="attachment.name" loading="lazy" />
                    </button>
                    <video v-else-if="attachment.type === 'video'" :src="attachment.url" controls preload="metadata"></video>
                    <a v-else class="file-tile" :href="attachment.downloadUrl || attachment.url" :download="attachment.name">{{ attachmentIcon(attachment.contentType) }}</a>
                    <strong>{{ attachment.name }}</strong>
                    <div class="attachment-card-footer">
                      <small>{{ formatFileSize(attachment.size) }}</small>
                      <a class="attachment-download" :href="attachment.downloadUrl || attachment.url" :download="attachment.name">
                        下载
                      </a>
                    </div>
                  </div>
                </div>
                <div class="topic-actions detail-actions">
                  <button class="feed-action" type="button" @click="requestPostReply(selectedPost)">
                    <span>回复</span>
                    <strong>{{ replyCount(selectedPost) }}</strong>
                  </button>
                  <button class="feed-action" type="button" @click="sharePost(selectedPost)">
                    <span>{{ shareStatusPostId === selectedPost.id ? "已分享" : "分享" }}</span>
                    <strong>{{ selectedPost.shareCount || 0 }}</strong>
                  </button>
                  <button
                    class="feed-action like-button"
                    :class="{ active: selectedPost.likedByMe }"
                    type="button"
                    :disabled="likeBusyPostId === selectedPost.id"
                    @click="toggleLike(selectedPost)"
                  >
                    <span>{{ selectedPost.likedByMe ? "已赞" : "点赞" }}</span>
                    <strong>{{ selectedPost.likeCount || 0 }}</strong>
                  </button>
                  <button
                    class="feed-action"
                    :class="{ active: selectedPost.bookmarkedByMe }"
                    type="button"
                    :disabled="bookmarkBusyPostId === selectedPost.id"
                    @click="toggleBookmark(selectedPost)"
                  >
                    <span>{{ selectedPost.bookmarkedByMe ? "已收藏" : "收藏" }}</span>
                    <strong v-if="selectedPost.bookmarkCount">{{ selectedPost.bookmarkCount }}</strong>
                  </button>
                  <button
                    v-if="selectedPost.author?.canFollow"
                    class="feed-action follow-action"
                    :class="{ active: selectedPost.author.followedByMe }"
                    type="button"
                    :disabled="followBusyUserId === selectedPost.author.id"
                    @click="toggleFollow(selectedPost.author)"
                  >
                    <span>{{ selectedPost.author.followedByMe ? "已关注作者" : "关注作者" }}</span>
                  </button>
                  <button v-if="selectedPost.canManage" class="text-action" type="button" @click="startEdit(selectedPost)">编辑</button>
                  <button
                    v-if="selectedPost.canManage"
                    class="text-action danger"
                    type="button"
                    :disabled="isPostActionBusy"
                    @click="removePost(selectedPost)"
                  >
                    删除
                  </button>
                </div>
                <div v-if="reactionSummary(selectedPost).length" class="reaction-summary">
                  <button
                    v-for="reaction in reactionSummary(selectedPost)"
                    :key="`detail-reaction-${selectedPost.id}-${reaction.emoji}`"
                    class="reaction-button"
                    :class="{ active: selectedPost.myReactions?.includes(reaction.emoji) }"
                    type="button"
                    :disabled="reactionBusyKey === `post:${selectedPost.id}:${reaction.emoji}`"
                    @click="togglePostReaction(selectedPost, reaction.emoji)"
                  >
                    {{ reaction.emoji }} {{ reaction.count }}
                  </button>
                </div>
              </div>
            </section>
          </template>

          <div v-if="!selectedPost.isDraft" class="reply-panel">
            <form
              v-if="user"
              class="reply-form inline-reply-form"
              :class="{ 'drag-over': replyDragOverPostId === selectedPost.id }"
              @submit.prevent="submitReply(selectedPost)"
              @paste="handleReplyPaste(selectedPost.id, $event)"
              @dragenter.prevent="handleReplyDragEnter(selectedPost.id)"
              @dragover.prevent="replyDragOverPostId = selectedPost.id"
              @dragleave.prevent="handleReplyDragLeave(selectedPost.id)"
              @drop.prevent="handleReplyDrop(selectedPost.id, $event)"
            >
              <AuthorAvatar :author="user" />
              <div>
                <textarea
                  v-model="replyForms[selectedPost.id]"
                  ref="replyTextarea"
                  rows="3"
                  maxlength="2000"
                  placeholder="发布你的回复"
                  @input="handleMentionInput('reply', selectedPost.id, $event)"
                  @keydown="handleMentionKeydown('reply', selectedPost.id, $event)"
                ></textarea>
                <div
                  v-if="shouldShowMentionPicker('reply', selectedPost.id)"
                  class="mention-picker"
                  role="listbox"
                  aria-label="@ 用户"
                >
                  <button
                    v-for="(candidate, index) in mentionPicker.users"
                    :key="candidate.id"
                    class="mention-option"
                    :class="{ active: index === mentionPicker.selectedIndex }"
                    type="button"
                    role="option"
                    :aria-selected="index === mentionPicker.selectedIndex"
                    @mousedown.prevent="insertMention(candidate)"
                  >
                    <AuthorAvatar :author="candidate" />
                    <span>@{{ candidate.username }}</span>
                  </button>
                  <span v-if="mentionPicker.loading" class="mention-empty">搜索用户...</span>
                  <span v-else-if="!mentionPicker.users.length" class="mention-empty">没有匹配用户</span>
                </div>
                <div class="reply-tool-row" aria-label="回复工具">
                  <div class="reply-emoji-row">
                    <button
                      v-for="emoji in reactionChoices"
                      :key="`reply-input-${emoji}`"
                      class="reaction-button"
                      type="button"
                      @click="insertReplyEmoji(selectedPost.id, emoji)"
                    >
                      {{ emoji }}
                    </button>
                  </div>
                  <label class="reply-image-trigger">
                    <span>图片 / 粘贴 / 拖入</span>
                    <input type="file" multiple accept="image/*" @change="handleReplyImageChange(selectedPost.id, $event)" />
                  </label>
                </div>
                <div v-if="replyImageFiles[selectedPost.id]?.length" class="attachment-list reply-draft">
                  <div v-for="file in replyImageFiles[selectedPost.id]" :key="`${file.name}-${file.size}`" class="attachment-chip">
                    <span>{{ attachmentIcon(file.type) }}</span>
                    <strong>{{ file.name }}</strong>
                    <small>{{ formatFileSize(file.size) }}</small>
                    <button type="button" @click="removeReplyImage(selectedPost.id, file)">移除</button>
                  </div>
                </div>
                <div class="composer-actions">
                  <p v-if="replyError" class="form-message error-state">{{ replyError }}</p>
                  <span v-else></span>
                  <button class="primary-link compact-action" type="submit" :disabled="isReplySubmitting">
                    {{ isReplySubmitting ? "发送中..." : "回复" }}
                  </button>
                </div>
              </div>
            </form>
            <div v-else class="reply-login">
              <span>登录后可以回复这个帖子。</span>
              <a class="primary-link compact-action" :href="loginHref()">登录后回复</a>
            </div>

            <div class="reply-head">
              <div class="reply-summary">
                <strong>{{ replySummaryText }}</strong>
                <span v-if="onlyAuthorReplies">已筛选楼主回复</span>
              </div>
              <div class="inline-actions">
                <button
                  class="secondary-link small-action"
                  type="button"
                  :class="{ active: replySort === 'asc' }"
                  @click="replySort = 'asc'"
                >
                  正序
                </button>
                <button
                  class="secondary-link small-action"
                  type="button"
                  :class="{ active: replySort === 'desc' }"
                  @click="replySort = 'desc'"
                >
                  最新
                </button>
                <button
                  class="secondary-link small-action"
                  type="button"
                  :class="{ active: onlyAuthorReplies }"
                  @click="onlyAuthorReplies = !onlyAuthorReplies"
                >
                  只看楼主
                </button>
              </div>
            </div>

            <div v-if="visibleReplies.length" class="reply-list">
              <article
                v-for="reply in visibleReplies"
                :key="reply.id"
                class="reply-item"
                :class="{ pending: reply.pending, highlighted: highlightedReplyId === reply.id }"
                :data-reply-id="reply.id"
              >
                <AuthorAvatar :author="reply.author" :href="userProfileUrl(reply.author)" />
                <div class="reply-content">
                  <div class="stream-post-meta">
                    <a class="author-name-link" :href="userProfileUrl(reply.author)">@{{ reply.author.username }}</a>
                    <span class="forum-badge badge-floor">#{{ reply.floor }}</span>
                    <span v-if="reply.author?.id === selectedPost.author?.id" class="forum-badge badge-owner">楼主</span>
                    <time :datetime="reply.createdAt">{{ formatTime(reply.createdAt) }}</time>
                    <span v-if="reply.canManage" class="reply-manage-actions">
                      <button class="text-action" type="button" @click="startReplyEdit(reply)">编辑</button>
                      <button
                        class="text-action danger"
                        type="button"
                        :disabled="replyActionBusyId === reply.id"
                        @click="removeReply(reply)"
                      >
                        删除
                      </button>
                    </span>
                  </div>
                  <form v-if="editingReplyId === reply.id" class="reply-edit-form" @submit.prevent="submitReplyEdit(reply)">
                    <textarea v-model="replyEditForm.body" rows="3" maxlength="2000"></textarea>
                    <div class="composer-actions">
                      <p v-if="replyEditError" class="form-message error-state">{{ replyEditError }}</p>
                      <span v-else></span>
                      <div class="inline-actions">
                        <button class="secondary-link small-action" type="button" :disabled="replyActionBusyId === reply.id" @click="cancelReplyEdit">
                          取消
                        </button>
                        <button class="primary-link compact-action" type="submit" :disabled="replyActionBusyId === reply.id">
                          保存
                        </button>
                      </div>
                    </div>
                  </form>
                  <template v-else>
                    <p v-if="reply.body">{{ reply.body }}</p>
                    <div v-if="reply.attachments?.length" class="reply-attachment-grid">
                      <button
                        v-for="attachment in reply.attachments"
                        :key="attachment.id"
                        class="reply-image-card"
                        type="button"
                        @click="openImagePreview(attachment)"
                      >
                        <img :src="attachment.url" :alt="attachment.name" loading="lazy" />
                      </button>
                    </div>
                  </template>
                  <div class="reply-actions">
                    <button
                      class="feed-action like-button"
                      :class="{ active: reply.likedByMe }"
                      type="button"
                      :disabled="likeBusyReplyId === reply.id"
                      @click="toggleReplyLike(reply)"
                    >
                      <span>{{ reply.likedByMe ? "已赞" : "点赞" }}</span>
                      <strong>{{ reply.likeCount || 0 }}</strong>
                    </button>
                    <button
                      class="feed-action"
                      type="button"
                      @click="toggleReplyReaction(reply, '👍')"
                    >
                      <span>回应</span>
                      <strong>{{ reactionCount(reply.reactions, "👍") || "" }}</strong>
                    </button>
                    <button
                      class="feed-action"
                      type="button"
                      @click="requestChildReply(reply)"
                    >
                      <span>回复</span>
                      <strong>{{ reply.children?.length || "" }}</strong>
                    </button>
                  </div>

                  <div v-if="reply.children?.length" class="nested-reply-list">
                    <article
                      v-for="child in reply.children"
                      :key="child.id"
                      class="nested-reply-item"
                      :class="{ pending: child.pending, highlighted: highlightedReplyId === child.id }"
                      :data-reply-id="child.id"
                    >
                      <AuthorAvatar :author="child.author" :href="userProfileUrl(child.author)" />
                      <div class="nested-reply-body">
                        <div class="stream-post-meta">
                          <a class="author-name-link" :href="userProfileUrl(child.author)">@{{ child.author.username }}</a>
                          <span>回复 @{{ child.replyToUser?.username || reply.author.username }}</span>
                          <span v-if="child.author?.id === selectedPost.author?.id" class="forum-badge badge-owner">楼主</span>
                          <time :datetime="child.createdAt">{{ formatTime(child.createdAt) }}</time>
                          <span v-if="child.canManage" class="reply-manage-actions">
                            <button class="text-action" type="button" @click="startReplyEdit(child)">编辑</button>
                            <button
                              class="text-action danger"
                              type="button"
                              :disabled="replyActionBusyId === child.id"
                              @click="removeReply(child)"
                            >
                              删除
                            </button>
                          </span>
                        </div>
                        <form v-if="editingReplyId === child.id" class="reply-edit-form" @submit.prevent="submitReplyEdit(child)">
                          <textarea v-model="replyEditForm.body" rows="3" maxlength="2000"></textarea>
                          <div class="composer-actions">
                            <p v-if="replyEditError" class="form-message error-state">{{ replyEditError }}</p>
                            <span v-else></span>
                            <div class="inline-actions">
                              <button class="secondary-link small-action" type="button" :disabled="replyActionBusyId === child.id" @click="cancelReplyEdit">
                                取消
                              </button>
                              <button class="primary-link compact-action" type="submit" :disabled="replyActionBusyId === child.id">
                                保存
                              </button>
                            </div>
                          </div>
                        </form>
                        <template v-else>
                          <p v-if="child.body">{{ child.body }}</p>
                          <div v-if="child.attachments?.length" class="reply-attachment-grid nested">
                            <button
                              v-for="attachment in child.attachments"
                              :key="attachment.id"
                              class="reply-image-card"
                              type="button"
                              @click="openImagePreview(attachment)"
                            >
                              <img :src="attachment.url" :alt="attachment.name" loading="lazy" />
                            </button>
                          </div>
                        </template>
                      </div>
                    </article>
                  </div>

                  <form
                    v-if="activeChildReplyId === reply.id && user"
                    class="nested-reply-form"
                    :class="{ 'drag-over': childReplyDragOverId === reply.id }"
                    @submit.prevent="submitChildReply(selectedPost, reply)"
                    @paste="handleChildReplyPaste(reply.id, $event)"
                    @dragenter.prevent="handleChildReplyDragEnter(reply.id)"
                    @dragover.prevent="childReplyDragOverId = reply.id"
                    @dragleave.prevent="handleChildReplyDragLeave(reply.id)"
                    @drop.prevent="handleChildReplyDrop(reply.id, $event)"
                  >
                    <div class="nested-reply-context">
                      <span>正在回复</span>
                      <strong>@{{ reply.author.username }}</strong>
                    </div>
                    <textarea
                      v-model="childReplyForms[reply.id]"
                      :data-child-reply-id="reply.id"
                      rows="2"
                      maxlength="2000"
                      :placeholder="`回复 @${reply.author.username}`"
                      @input="handleMentionInput('child', reply.id, $event)"
                      @keydown="handleMentionKeydown('child', reply.id, $event)"
                    ></textarea>
                    <div
                      v-if="shouldShowMentionPicker('child', reply.id)"
                      class="mention-picker nested"
                      role="listbox"
                      aria-label="@ 用户"
                    >
                      <button
                        v-for="(candidate, index) in mentionPicker.users"
                        :key="candidate.id"
                        class="mention-option"
                        :class="{ active: index === mentionPicker.selectedIndex }"
                        type="button"
                        role="option"
                        :aria-selected="index === mentionPicker.selectedIndex"
                        @mousedown.prevent="insertMention(candidate)"
                      >
                        <AuthorAvatar :author="candidate" />
                        <span>@{{ candidate.username }}</span>
                      </button>
                      <span v-if="mentionPicker.loading" class="mention-empty">搜索用户...</span>
                      <span v-else-if="!mentionPicker.users.length" class="mention-empty">没有匹配用户</span>
                    </div>
                    <div class="reply-tool-row" aria-label="楼中楼回复工具">
                      <div class="reply-emoji-row">
                        <button
                          v-for="emoji in reactionChoices"
                          :key="`child-input-${reply.id}-${emoji}`"
                          class="reaction-button"
                          type="button"
                          @click="insertChildReplyEmoji(reply.id, emoji)"
                        >
                          {{ emoji }}
                        </button>
                      </div>
                      <label class="reply-image-trigger">
                        <span>图片 / 粘贴 / 拖入</span>
                        <input type="file" multiple accept="image/*" @change="handleChildReplyImageChange(reply.id, $event)" />
                      </label>
                    </div>
                    <div v-if="childReplyImageFiles[reply.id]?.length" class="attachment-list reply-draft">
                      <div v-for="file in childReplyImageFiles[reply.id]" :key="`${file.name}-${file.size}`" class="attachment-chip">
                        <span>{{ attachmentIcon(file.type) }}</span>
                        <strong>{{ file.name }}</strong>
                        <small>{{ formatFileSize(file.size) }}</small>
                        <button type="button" @click="removeChildReplyImage(reply.id, file)">移除</button>
                      </div>
                    </div>
                    <div class="composer-actions">
                      <p v-if="childReplyError" class="form-message error-state">{{ childReplyError }}</p>
                      <span v-else></span>
                      <div class="inline-actions">
                        <button class="secondary-link small-action" type="button" :disabled="childReplySubmittingId === reply.id" @click="activeChildReplyId = null">
                          取消
                        </button>
                        <button class="primary-link compact-action" type="submit" :disabled="childReplySubmittingId === reply.id">
                          {{ childReplySubmittingId === reply.id ? "发送中..." : "回复" }}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </article>
            </div>
            <p v-else class="reply-empty-state">
              {{ onlyAuthorReplies ? "暂时没有楼主回复。" : "还没有回复，来发布第一条讨论。" }}
            </p>
          </div>
      </article>
    </div>

    <div v-if="imagePreview" class="image-preview-backdrop" role="presentation" @click.self="closeImagePreview">
      <figure
        ref="imagePreviewModal"
        class="image-preview-modal"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-label="`${imagePreview.name} 图片预览`"
      >
        <div class="image-preview-toolbar">
          <span class="image-preview-caption">{{ imagePreview.name }}</span>
          <div>
            <a class="attachment-download" :href="imagePreview.downloadUrl || imagePreview.url" :download="imagePreview.name">
              下载
            </a>
            <button class="text-action" type="button" @click="closeImagePreview">关闭</button>
          </div>
        </div>
        <img :src="imagePreview.url" :alt="imagePreview.name" />
      </figure>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import "./community/tokens.css";
import AuthorAvatar from "./community/AuthorAvatar.js";
import CommunityEmptyState from "./community/CommunityEmptyState.vue";
import CommunityFilterTabs from "./community/CommunityFilterTabs.vue";
import CommunityRail from "./community/CommunityRail.vue";
import CommunitySidecard from "./community/CommunitySidecard.vue";
import InboxPanel from "./community/InboxPanel.vue";
import PostCard from "./community/PostCard.vue";
import { getCurrentUser } from "../services/auth";
import {
  createCommunityPost,
  createCommunityReply,
  deleteCommunityPost,
  deleteCommunityReply,
  getCommunityNotifications,
  getCommunityPost,
  getCommunityPosts,
  getCommunitySocialSummary,
  searchCommunityMentionUsers,
  markCommunityNotificationsRead,
  recordCommunityPostShare,
  toggleCommunityUserFollow,
  toggleCommunityPostBookmark,
  toggleCommunityPostLike,
  toggleCommunityPostReaction,
  toggleCommunityReplyLike,
  toggleCommunityReplyReaction,
  updateCommunityPost,
  updateCommunityReply,
} from "../services/community";
import { setPageSeo } from "../utils/seo";
import { communityHomeUrl, normalizeCommunityHomeUrl } from "./community/communityHomeRoute";

const props = defineProps({
  postId: {
    type: String,
    default: "",
  },
});

const SHARE_DISCOVERY_CHANNEL = "share-discovery";
const posts = ref([]);
const user = ref(null);
const selectedSort = ref("latest");
const isLoading = ref(true);
const isLoadingMore = ref(false);
const isPostDetailLoading = ref(false);
const isSubmitting = ref(false);
const isPostActionBusy = ref(false);
const isReplySubmitting = ref(false);
const childReplySubmittingId = ref(null);
const likeBusyPostId = ref(null);
const likeBusyReplyId = ref(null);
const reactionBusyKey = ref("");
const error = ref("");
const loadError = ref("");
const success = ref("");
const postActionError = ref("");
const replyError = ref("");
const replyEditError = ref("");
const childReplyError = ref("");
const loginPrompt = ref("");
const isComposerExpanded = ref(false);
const isComposerDragOver = ref(false);
const notifications = ref([]);
const unreadNotifications = ref(0);
const notificationError = ref("");
const isInboxOpen = ref(false);
const activeReplyPostId = ref(null);
const activeChildReplyId = ref(null);
const replyDragOverPostId = ref(null);
const childReplyDragOverId = ref(null);
const editingPostId = ref(null);
const editingReplyId = ref(null);
const selectedPostId = ref(null);
const highlightedReplyId = ref(null);
const imagePreview = ref(null);
const shareStatusPostId = ref(null);
const bookmarkBusyPostId = ref(null);
const followBusyUserId = ref(null);
const replyActionBusyId = ref(null);
const composerForm = ref(null);
const composerToggle = ref(null);
const replyTextarea = ref(null);
const topicModal = ref(null);
const imagePreviewModal = ref(null);
const replyForms = reactive({});
const replyImageFiles = reactive({});
const childReplyForms = reactive({});
const childReplyImageFiles = reactive({});
const mentionPicker = reactive({
  key: "",
  kind: "",
  id: null,
  start: 0,
  end: 0,
  query: "",
  users: [],
  loading: false,
  selectedIndex: 0,
  requestId: 0,
});
const attachmentFiles = ref([]);
const form = reactive({
  channel: "vibe-coding",
  title: "",
  body: "",
});
const socialSummary = reactive({
  activeTopics: [],
  recommendedUsers: [],
  latestMembers: [],
  liveSignals: [],
});
const pageInfo = reactive({
  hasNext: false,
  nextCursor: null,
  pageSize: 20,
});
const editForm = reactive({
  channel: "vibe-coding",
  title: "",
  body: "",
});
const replyEditForm = reactive({
  body: "",
});
const reactionChoices = ["👍", "❤️", "😂", "🎉", "🤔", "👏"];
const sortOptions = [
  { id: "latest", label: "最新发布" },
  { id: "active", label: "最新回复" },
  { id: "hot", label: "热门" },
];
const replySort = ref("asc");
const onlyAuthorReplies = ref(false);
const maxAttachmentCount = 5;
const maxAttachmentSize = 25 * 1024 * 1024;
const maxReplyImageCount = 3;
const maxReplyImageSize = 8 * 1024 * 1024;
let composerDragDepth = 0;
let replyDragDepth = 0;
let childReplyDragDepth = 0;
let postsRequestController = null;
let postsRequestId = 0;
let postDetailRequestController = null;
let postDetailLoadingId = "";
let postDetailPromise = null;
let mentionRequestController = null;
let mentionDebounceTimer = 0;
let savedFeedScrollY = 0;
let postOpener = null;
let imagePreviewOpener = null;
const selectedPost = computed(() => posts.value.find((post) => post.id === selectedPostId.value) || null);
const isStandalonePost = computed(() => Boolean(props.postId));
const isShareDiscoverySelected = computed(() => form.channel === SHARE_DISCOVERY_CHANNEL);
const composerRailLabel = computed(() => (isShareDiscoverySelected.value ? "写分享" : "发帖"));
const composerHeading = computed(() => (isShareDiscoverySelected.value ? "写一篇分享发现" : "发布新帖子"));
const composerTitlePlaceholder = computed(() => (isShareDiscoverySelected.value ? "写一个适合分享传播的标题" : "写一个清楚的标题"));
const composerBodyPlaceholder = computed(() =>
  isShareDiscoverySelected.value
    ? "写下文章摘要、发现来源、关键经验或你推荐它的理由"
    : "补充背景、链接、截图说明，或你希望得到的反馈",
);
const attachmentHelperText = computed(() =>
  isShareDiscoverySelected.value ? "选择、粘贴或拖入文件；第一张图片会作为封面展示" : "选择、粘贴截图，或拖入文件",
);
const submitButtonLabel = computed(() => {
  if (isSubmitting.value) return "保存中...";
  return isShareDiscoverySelected.value ? "发布分享" : "发布帖子";
});
const loginPanelTitle = "登录后参与讨论";
const loginPanelBody = "公开内容可以直接浏览；登录后可以发布作品、提出需求、回复他人并接收互动通知。";
const emptyStateEyebrow = "No Posts";
const emptyStateTitle = "主页还没有内容";
const emptyStateBody = "社区暂时没有帖子。可以发起一个清楚的问题、作品展示或反馈，让后续讨论有上下文。";
const emptyPrompts = [
  { kicker: "Question", title: "提出一个问题", body: "把背景、尝试过的方法和期望结果写清楚。" },
  { kicker: "Showcase", title: "展示一个作品", body: "附上截图、链接和你希望得到的反馈。" },
];
const visibleReplies = computed(() => {
  const post = selectedPost.value;
  if (!post) return [];
  let replies = [...(post.replies || [])];
  if (onlyAuthorReplies.value) {
    replies = replies
      .map((reply) => replyForAuthorFilter(reply, post.author?.id))
      .filter(Boolean);
  }
  if (replySort.value === "desc") {
    replies.reverse();
  }
  return replies;
});
const visibleReplyTotalCount = computed(() => countReplies(visibleReplies.value));
const selectedReplyTotalCount = computed(() => replyCount(selectedPost.value || {}));
const selectedMainReplyCount = computed(() => selectedPost.value?.replies?.length || 0);
const replySummaryText = computed(() => {
  const total = selectedReplyTotalCount.value;
  const mainCount = selectedMainReplyCount.value;
  if (onlyAuthorReplies.value) {
    return `${visibleReplyTotalCount.value} / ${total} 条回复 · ${mainCount} 条主评论`;
  }
  return `共 ${total} 条回复 · ${mainCount} 条主评论`;
});

setPageSeo({
  title: "社区",
  description: "4399123 社区：围绕 Vibe Coding、AI 工具、作品展示、需求反馈和站点建设的轻量讨论区。",
  path: "/community",
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "4399123 社区",
    description: "围绕 Vibe Coding、AI 工具、作品展示、需求反馈和站点建设的轻量讨论区。",
    url: "https://4399123.com/community",
    inLanguage: "zh-CN",
    isPartOf: {
      "@type": "WebSite",
      name: "4399123",
      url: "https://4399123.com",
    },
  },
});

function syncRouteStateFromLocation() {
  const normalizedUrl = normalizeCommunityHomeUrl(window.location.href);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (normalizedUrl !== currentUrl) {
    window.history.replaceState(window.history.state, "", normalizedUrl);
  }
  const searchParams = new URLSearchParams(window.location.search);
  const nextSort = searchParams.get("sort") || "latest";
  const changed = selectedSort.value !== nextSort;
  selectedSort.value = nextSort;
  isInboxOpen.value = searchParams.get("inbox") === "1";
  return changed;
}

onMounted(async () => {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("popstate", handleCommunityRouteChange);
  window.addEventListener("focus", refreshCurrentUserProfile);
  window.addEventListener("auth:user-updated", handleAuthUserUpdated);
  syncRouteStateFromLocation();
  await Promise.all([loadUser(), loadSocialSummary(), isStandalonePost.value ? loadPostDetail(props.postId) : loadPosts()]);
  if (user.value) await loadNotifications();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("popstate", handleCommunityRouteChange);
  window.removeEventListener("focus", refreshCurrentUserProfile);
  window.removeEventListener("auth:user-updated", handleAuthUserUpdated);
  postsRequestController?.abort();
  postDetailRequestController?.abort();
  mentionRequestController?.abort();
  if (mentionDebounceTimer) window.clearTimeout(mentionDebounceTimer);
  unlockPageScroll();
});

watch(
  () => props.postId,
  async (postId) => {
    if (!postId) {
      closePostState();
      return;
    }
    await showPostById(postId);
  },
);

async function loadUser() {
  try {
    const data = await getCurrentUser();
    user.value = data.user || null;
    syncCurrentUserAuthor(data.user || null);
  } catch {
    user.value = null;
  }
}

async function refreshCurrentUserProfile() {
  if (!user.value) return;
  try {
    const data = await getCurrentUser();
    user.value = data.user || null;
    syncCurrentUserAuthor(data.user || null);
  } catch {
    user.value = null;
  }
}

function handleAuthUserUpdated(event) {
  const nextUser = event.detail?.user || null;
  user.value = nextUser;
  syncCurrentUserAuthor(nextUser);
}

function syncCurrentUserAuthor(nextUser) {
  if (!nextUser?.id) return;
  posts.value = posts.value.map((post) => ({
    ...post,
    author: post.author?.id === nextUser.id ? mergeAuthorProfile(post.author, nextUser) : post.author,
    replies: (post.replies || []).map((reply) => ({
      ...reply,
      author: reply.author?.id === nextUser.id ? mergeAuthorProfile(reply.author, nextUser) : reply.author,
      children: (reply.children || []).map((child) => ({
        ...child,
        author: child.author?.id === nextUser.id ? mergeAuthorProfile(child.author, nextUser) : child.author,
        replyToUser: child.replyToUser?.id === nextUser.id ? mergeAuthorProfile(child.replyToUser, nextUser) : child.replyToUser,
      })),
    })),
  }));
}

function mergeAuthorProfile(author = {}, profile = {}) {
  return {
    ...author,
    username: profile.username || author.username,
    avatarUrl: profile.avatarUrl || "",
    bio: profile.bio || "",
  };
}

async function loadPosts({ append = false } = {}) {
  if (append && (!pageInfo.hasNext || !pageInfo.nextCursor)) return;
  postsRequestController?.abort();
  postsRequestController = new AbortController();
  const requestId = ++postsRequestId;
  if (append) isLoadingMore.value = true;
  else isLoading.value = true;
  loadError.value = "";
  try {
    const data = await getCommunityPosts(
      "all",
      selectedSort.value,
      "recommended",
      {
        cursor: append ? pageInfo.nextCursor : null,
        limit: pageInfo.pageSize,
        signal: postsRequestController.signal,
      },
    );
    if (requestId !== postsRequestId) return;
    const incomingPosts = Array.isArray(data.posts) ? data.posts : [];
    if (append) {
      const existingIds = new Set(posts.value.map((post) => post.id));
      posts.value = [...posts.value, ...incomingPosts.filter((post) => !existingIds.has(post.id))];
    } else {
      posts.value = incomingPosts;
    }
    pageInfo.hasNext = Boolean(data.pageInfo?.hasNext);
    pageInfo.nextCursor = data.pageInfo?.nextCursor || null;
    pageInfo.pageSize = Number(data.pageInfo?.pageSize || pageInfo.pageSize);
    if (selectedPostId.value && !posts.value.some((post) => post.id === selectedPostId.value)) {
      closePost();
    }
    if (Object.prototype.hasOwnProperty.call(data, "user")) user.value = data.user;
    unreadNotifications.value = Number(data.unreadNotifications ?? 0);
  } catch (err) {
    if (err.name === "AbortError") return;
    loadError.value = err.message || "读取社区失败。";
    if (!append) posts.value = [];
  } finally {
    if (requestId === postsRequestId) {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }
}

function loadMorePosts() {
  return loadPosts({ append: true });
}

async function loadSocialSummary() {
  try {
    const data = await getCommunitySocialSummary();
    socialSummary.activeTopics = Array.isArray(data.activeTopics) ? data.activeTopics : [];
    socialSummary.recommendedUsers = Array.isArray(data.recommendedUsers) ? data.recommendedUsers : [];
    socialSummary.latestMembers = Array.isArray(data.latestMembers) ? data.latestMembers : [];
    socialSummary.liveSignals = Array.isArray(data.liveSignals) ? data.liveSignals : [];
  } catch {
    socialSummary.activeTopics = [];
    socialSummary.recommendedUsers = [];
    socialSummary.latestMembers = [];
    socialSummary.liveSignals = [];
  }
}

async function loadPostDetail(postId, { standalone = isStandalonePost.value } = {}) {
  postDetailRequestController?.abort();
  postDetailRequestController = new AbortController();
  if (standalone) isLoading.value = true;
  else isPostDetailLoading.value = true;
  if (standalone) loadError.value = "";
  else postActionError.value = "";
  try {
    const data = await getCommunityPost(postId, { signal: postDetailRequestController.signal });
    if (Object.prototype.hasOwnProperty.call(data, "user")) user.value = data.user;
    unreadNotifications.value = Number(data.unreadNotifications ?? 0);
    if (data.post) {
      if (standalone) {
        posts.value = [data.post];
      } else {
        const exists = posts.value.some((post) => post.id === data.post.id);
        posts.value = exists
          ? posts.value.map((post) => (post.id === data.post.id ? data.post : post))
          : [data.post, ...posts.value];
      }
    }
    selectedPostId.value = data.post?.id || null;
    if (selectedPostId.value) {
      lockPageScroll();
      focusPostDialog();
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    if (standalone) {
      loadError.value = err.message || "读取帖子失败。";
      posts.value = [];
      selectedPostId.value = null;
    } else {
      postActionError.value = err.message || "读取帖子详情失败，请重试。";
    }
  } finally {
    if (standalone) isLoading.value = false;
    else isPostDetailLoading.value = false;
  }
}

function selectSort(sort) {
  if (!sortOptions.some((option) => option.id === sort)) return;
  if (isStandalonePost.value) {
    window.location.href = communityHomeUrl(sort);
    return;
  }
  selectedSort.value = sort;
  closePostState();
  window.history.pushState({}, "", communityHomeUrl(sort));
  notifyRouteChange();
  loadPosts();
}

function openPost(post, options = {}) {
  postOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  savedFeedScrollY = window.scrollY;
  window.history.replaceState(
    { ...(window.history.state || {}), communityScrollY: savedFeedScrollY },
    "",
    window.location.href,
  );
  window.history.pushState(
    { communityFromFeed: true, communityScrollY: savedFeedScrollY, focusReply: Boolean(options.focusReply) },
    "",
    postUrl(post),
  );
  notifyRouteChange();
  selectedPostId.value = post.id;
  editingPostId.value = null;
  postActionError.value = "";
  replyError.value = "";
  childReplyError.value = "";
  activeReplyPostId.value = options.focusReply ? post.id : null;
  activeChildReplyId.value = null;
  lockPageScroll();
  if (options.focusReply) {
    focusReplyBox();
  } else {
    focusPostDialog();
  }
  showPostById(post.id);
}

function closePost() {
  const state = window.history.state || {};
  if (window.location.pathname.startsWith("/community/posts/") && state.communityFromFeed) {
    window.history.back();
    return;
  }
  if (window.location.pathname.startsWith("/community/posts/")) {
    window.history.pushState({ communityScrollY: savedFeedScrollY }, "", "/community");
    notifyRouteChange();
  }
  closePostState();
  restoreFeedScroll(savedFeedScrollY);
}

function closePostState() {
  postDetailRequestController?.abort();
  postDetailLoadingId = "";
  postDetailPromise = null;
  isPostDetailLoading.value = false;
  selectedPostId.value = null;
  imagePreview.value = null;
  editingPostId.value = null;
  activeReplyPostId.value = null;
  activeChildReplyId.value = null;
  replyDragOverPostId.value = null;
  childReplyDragOverId.value = null;
  replyDragDepth = 0;
  childReplyDragDepth = 0;
  postActionError.value = "";
  replyError.value = "";
  childReplyError.value = "";
  onlyAuthorReplies.value = false;
  replySort.value = "asc";
  unlockPageScroll();
  restorePostOpenerFocus();
}

async function showPostById(postId) {
  const existing = posts.value.find((post) => String(post.id) === String(postId));
  if (existing) {
    selectedPostId.value = existing.id;
    lockPageScroll();
    if (window.history.state?.focusReply) {
      activeReplyPostId.value = existing.id;
      focusReplyBox();
    } else {
      focusPostDialog();
    }
  }
  const normalizedPostId = String(postId);
  if (postDetailLoadingId === normalizedPostId && postDetailPromise) {
    await postDetailPromise;
  } else {
    postDetailLoadingId = normalizedPostId;
    const standalone = !existing && !window.history.state?.communityFromFeed && !posts.value.length;
    postDetailPromise = loadPostDetail(postId, { standalone }).finally(() => {
      if (postDetailLoadingId === normalizedPostId) {
        postDetailLoadingId = "";
        postDetailPromise = null;
      }
    });
    await postDetailPromise;
  }
  if (window.history.state?.focusReply && selectedPostId.value) {
    activeReplyPostId.value = selectedPostId.value;
    focusReplyBox();
  }
}

function handleCommunityRouteChange(event) {
  const routePostId = communityPostIdFromPath();
  if (routePostId) {
    showPostById(routePostId);
    return;
  }
  const scrollY = Number(event.state?.communityScrollY ?? savedFeedScrollY ?? 0);
  const filtersChanged = syncRouteStateFromLocation();
  closePostState();
  if ((filtersChanged || !posts.value.length) && !isLoading.value) {
    loadPosts().then(() => restoreFeedScroll(scrollY));
    return;
  }
  restoreFeedScroll(scrollY);
}

function communityPostIdFromPath() {
  if (!window.location.pathname.startsWith("/community/posts/")) return "";
  return decodeURIComponent(window.location.pathname.replace(/^\/community\/posts\/?/, "").replace(/\/$/, ""));
}

function notifyRouteChange() {
  window.dispatchEvent(new CustomEvent("community:navigate"));
}

function restoreFeedScroll(scrollY) {
  nextTick(() => {
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY || 0, behavior: "auto" });
    });
  });
}

function focusReplyBox() {
  nextTick(() => {
    const target = Array.isArray(replyTextarea.value) ? replyTextarea.value[0] : replyTextarea.value;
    target?.focus?.();
  });
}

function usePrompt(prompt) {
  if (!user.value) {
    loginPrompt.value = "登录后可以发布新帖子。";
    return;
  }
  if (!form.title) form.title = prompt.title;
  isComposerExpanded.value = true;
  focusComposer();
}

function jumpToReply(post) {
  if (!user.value) {
    promptLoginFor("回复", post);
    return;
  }
  activeReplyPostId.value = post.id;
  nextTick(() => {
    const replyForm = topicModal.value?.querySelector?.(".inline-reply-form");
    replyForm?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    focusReplyBox();
  });
}

function loginHref(target = currentCommunityPath()) {
  return `/login?next=${encodeURIComponent(target)}`;
}

function registerHref(target = currentCommunityPath()) {
  return `/register?next=${encodeURIComponent(target)}`;
}

function currentCommunityPath() {
  return `${window.location.pathname}${window.location.search}`;
}

function focusPostDialog() {
  nextTick(() => {
    topicModal.value?.focus?.({ preventScroll: true });
  });
}

function restorePostOpenerFocus() {
  nextTick(() => {
    if (postOpener?.isConnected) {
      postOpener.focus({ preventScroll: true });
    }
    postOpener = null;
  });
}

function promptLoginFor(action, post = null) {
  const subject = post?.title ? `「${post.title}」` : "这篇帖子";
  loginPrompt.value = `登录后可以${action}${subject}。`;
}

function handleKeydown(event) {
  if (event.key === "Tab" && imagePreview.value) {
    trapFocus(imagePreviewModal.value, event);
    return;
  }
  if (event.key === "Tab" && selectedPost.value) {
    trapFocus(topicModal.value, event);
    return;
  }
  if (event.key === "Escape" && imagePreview.value) {
    closeImagePreview();
    return;
  }
  if (event.key === "Escape" && selectedPost.value) {
    closePost();
  }
}

function trapFocus(container, event) {
  if (!container) return;
  const focusable = Array.from(
    container.querySelectorAll(
      "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
    ),
  ).filter((element) => !element.hidden && element.getClientRects().length);
  if (!focusable.length) {
    event.preventDefault();
    container.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function lockPageScroll() {
  document.body.classList.add("modal-open");
}

function unlockPageScroll() {
  document.body.classList.remove("modal-open");
}

async function submitPost() {
  await savePost(CommunityPostStatus.PUBLISHED);
}

async function saveDraft() {
  await savePost(CommunityPostStatus.DRAFT);
}

async function savePost(status) {
  if (isSubmitting.value) return;
  isComposerExpanded.value = true;
  error.value = "";
  success.value = "";
  const normalizedBody = form.body.trim();
  const payloadSource = {
    ...form,
    body: normalizedBody,
    title: form.title.trim() || titleFromBody(normalizedBody),
  };
  if (payloadSource.title.length < 4) {
    error.value = "标题至少需要 4 个字符。";
    isComposerExpanded.value = true;
    return;
  }
  if (status === CommunityPostStatus.PUBLISHED && payloadSource.body.length < 6) {
    error.value = "正文至少需要 6 个字符。";
    return;
  }
  if (status === CommunityPostStatus.DRAFT && payloadSource.body.length < 1) {
    error.value = "草稿正文至少需要 1 个字符。";
    return;
  }
  const attachmentError = validateSelectedAttachments(attachmentFiles.value);
  if (attachmentError) {
    error.value = attachmentError;
    return;
  }

  isSubmitting.value = true;
  try {
    const payload = buildPostPayload(payloadSource, status, attachmentFiles.value);
    const data = await createCommunityPost(payload);
    window.history.pushState({}, "", communityHomeUrl(selectedSort.value));
    notifyRouteChange();
    posts.value = [
      data.post,
      ...posts.value.filter((post) => post.id !== data.post.id),
    ];
    openPost(data.post);
    form.title = "";
    form.body = "";
    attachmentFiles.value = [];
    isComposerExpanded.value = false;
    success.value = status === CommunityPostStatus.DRAFT ? "草稿已保存。" : "发布成功。";
  } catch (err) {
    error.value = err.message || "保存失败。";
  } finally {
    isSubmitting.value = false;
  }
}

function titleFromBody(body = "") {
  const firstLine = body.replace(/\s+/g, " ").trim();
  if (!firstLine) return "";
  return firstLine.length >= 4 ? firstLine.slice(0, 42) : "社区动态";
}

function shouldShowTitle(post) {
  if (isSharePost(post)) return true;
  const normalizedTitle = String(post.title || "").replace(/\s+/g, " ").trim();
  const normalizedBody = String(post.body || "").replace(/\s+/g, " ").trim();
  return normalizedTitle && !normalizedBody.startsWith(normalizedTitle);
}

function isSharePost(post = {}) {
  return post.channel === SHARE_DISCOVERY_CHANNEL;
}

function coverImage(post = {}) {
  return (post.attachments || []).find((attachment) => attachment.type === "image") || null;
}

function detailTypeLabel(post = {}) {
  if (post.isDraft) return "草稿";
  return isSharePost(post) ? "分享详情" : "帖子详情";
}

function buildPostPayload(source, status, files = []) {
  if (!files.length) {
    return { ...source, status };
  }
  const payload = new FormData();
  payload.set("channel", source.channel);
  payload.set("title", source.title);
  payload.set("body", source.body);
  payload.set("status", status);
  for (const file of files) {
    payload.append("attachments", file);
  }
  return payload;
}

function handleAttachmentChange(event) {
  error.value = "";
  addAttachmentFiles(Array.from(event.target.files || []));
  event.target.value = "";
}

function handleComposerPaste(event) {
  const files = Array.from(event.clipboardData?.files || []);
  if (!files.length) return;
  addAttachmentFiles(files);
}

function handleComposerDragEnter() {
  composerDragDepth += 1;
  isComposerDragOver.value = true;
}

function handleComposerDragLeave() {
  composerDragDepth = Math.max(0, composerDragDepth - 1);
  if (!composerDragDepth) {
    isComposerDragOver.value = false;
  }
}

function handleComposerDrop(event) {
  composerDragDepth = 0;
  isComposerDragOver.value = false;
  addAttachmentFiles(Array.from(event.dataTransfer?.files || []));
}

function addAttachmentFiles(files) {
  if (!files.length) return;
  error.value = "";
  const merged = [...attachmentFiles.value, ...files].slice(0, maxAttachmentCount);
  const validationError = validateSelectedAttachments(merged, files.length + attachmentFiles.value.length > maxAttachmentCount);
  if (validationError) {
    error.value = validationError;
    if (merged.some((file) => file.size > maxAttachmentSize)) {
      return;
    }
  }
  attachmentFiles.value = merged;
}

function validateSelectedAttachments(files, exceededCount = false) {
  if (exceededCount || files.length > maxAttachmentCount) {
    return `一次最多添加 ${maxAttachmentCount} 个附件。`;
  }
  if (files.some((file) => file.size > maxAttachmentSize)) {
    return "单个附件不能超过 25MB。";
  }
  return "";
}

function removeAttachment(file) {
  attachmentFiles.value = attachmentFiles.value.filter((item) => item !== file);
}

function attachmentIcon(type = "") {
  if (type.startsWith("image/")) return "🖼";
  if (type.startsWith("video/")) return "🎬";
  return "📎";
}

function openImagePreview(attachment) {
  imagePreviewOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  imagePreview.value = attachment;
  nextTick(() => imagePreviewModal.value?.focus?.({ preventScroll: true }));
}

function closeImagePreview() {
  imagePreview.value = null;
  nextTick(() => {
    imagePreviewOpener?.focus?.({ preventScroll: true });
    imagePreviewOpener = null;
  });
}

function formatFileSize(size = 0) {
  if (!size) return "0 B";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}

function postUrl(post) {
  return `/community/posts/${encodeURIComponent(post.id)}`;
}

function userProfileUrl(author = {}) {
  return author?.id ? `/users/${encodeURIComponent(author.id)}` : "/community";
}

function replyCount(post) {
  if (Number.isFinite(Number(post.replyCount))) return Number(post.replyCount);
  return countReplies(post.replies || []);
}

function countReplies(replies = []) {
  return replies.reduce((count, reply) => count + 1 + (reply.children?.length || 0), 0);
}

function replyForAuthorFilter(reply, authorId) {
  if (!authorId) return null;
  const children = reply.children || [];
  if (reply.author?.id === authorId) {
    return reply;
  }
  const authorChildren = children.filter((child) => child.author?.id === authorId);
  if (!authorChildren.length) return null;
  return { ...reply, children: authorChildren };
}

function reactionSummary(post) {
  return (post.reactions || []).filter((reaction) => Number(reaction.count) > 0);
}

async function toggleBookmark(post) {
  if (!user.value) {
    promptLoginFor("收藏", post);
    return;
  }
  if (bookmarkBusyPostId.value) return;
  bookmarkBusyPostId.value = post.id;
  try {
    const data = await toggleCommunityPostBookmark(post.id, !post.bookmarkedByMe);
    updatePostEngagementState(post.id, {
      bookmarkedByMe: data.bookmarked,
      bookmarkCount: data.bookmarkCount,
    });
  } catch (err) {
    error.value = err.message || "收藏失败。";
  } finally {
    bookmarkBusyPostId.value = null;
  }
}

async function toggleFollow(author) {
  if (!user.value) {
    loginPrompt.value = "登录后可以关注作者，并在关注动态里看到更新。";
    return;
  }
  if (!author?.id || followBusyUserId.value) return;
  followBusyUserId.value = author.id;
  try {
    const data = await toggleCommunityUserFollow(author.id, !author.followedByMe);
    syncAuthorFollowState(author.id, data.following, data.followerCount);
    socialSummary.recommendedUsers = socialSummary.recommendedUsers.map((person) =>
      person.id === author.id ? { ...person, followedByMe: data.following, followerCount: data.followerCount } : person,
    );
  } catch (err) {
    error.value = err.message || "关注失败。";
  } finally {
    followBusyUserId.value = null;
  }
}

function syncAuthorFollowState(authorId, followedByMe, followerCount) {
  posts.value = posts.value.map((post) => ({
    ...post,
    author:
      post.author?.id === authorId
        ? { ...post.author, followedByMe, followerCount }
        : post.author,
    replies: (post.replies || []).map((reply) => ({
      ...reply,
      author: reply.author?.id === authorId ? { ...reply.author, followedByMe, followerCount } : reply.author,
      children: (reply.children || []).map((child) => ({
        ...child,
        author: child.author?.id === authorId ? { ...child.author, followedByMe, followerCount } : child.author,
      })),
    })),
  }));
}

async function sharePost(post) {
  const url = new URL(postUrl(post), window.location.origin).toString();
  let shared = false;
  try {
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.title, url });
      shared = true;
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      shared = true;
    } else {
      throw new Error("clipboard_unavailable");
    }
  } catch (err) {
    if (err?.name === "AbortError") return;
    error.value = "分享链接失败，请重试。";
    return;
  }

  if (shared) {
    shareStatusPostId.value = post.id;
    try {
      const data = await recordCommunityPostShare(post.id);
      updatePostEngagementState(post.id, { shareCount: data.shareCount });
    } catch {
      // 分享已经完成；统计失败不应反向提示用户操作失败。
    }
    window.setTimeout(() => {
      if (shareStatusPostId.value === post.id) shareStatusPostId.value = null;
    }, 1600);
  }
}

function startEdit(post) {
  postActionError.value = "";
  editingPostId.value = post.id;
  editForm.channel = post.channel;
  editForm.title = post.title;
  editForm.body = post.body;
}

function cancelEdit() {
  editingPostId.value = null;
  postActionError.value = "";
}

async function submitEdit(post, status = CommunityPostStatus.PUBLISHED) {
  postActionError.value = "";
  if (editForm.title.length < 4) {
    postActionError.value = "标题至少需要 4 个字符。";
    return;
  }
  if (status === CommunityPostStatus.PUBLISHED && editForm.body.length < 6) {
    postActionError.value = "正文至少需要 6 个字符。";
    return;
  }
  if (status === CommunityPostStatus.DRAFT && editForm.body.length < 1) {
    postActionError.value = "草稿正文至少需要 1 个字符。";
    return;
  }

  isPostActionBusy.value = true;
  try {
    const data = await updateCommunityPost(post.id, { ...editForm, status });
    posts.value = posts.value.map((item) => (item.id === post.id ? data.post : item));
    editingPostId.value = null;
  } catch (err) {
    postActionError.value = err.message || "更新失败。";
  } finally {
    isPostActionBusy.value = false;
  }
}

async function removePost(post) {
  postActionError.value = "";
  if (!window.confirm("确定删除这篇帖子吗？")) return;

  isPostActionBusy.value = true;
  try {
    await deleteCommunityPost(post.id);
    posts.value = posts.value.filter((item) => item.id !== post.id);
    if (selectedPostId.value === post.id) closePost();
  } catch (err) {
    postActionError.value = err.message || "删除失败。";
  } finally {
    isPostActionBusy.value = false;
  }
}

function excerpt(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > 128 ? `${text.slice(0, 128)}...` : text;
}

function toggleReply(postId) {
  replyError.value = "";
  activeReplyPostId.value = activeReplyPostId.value === postId ? null : postId;
}

function requestPostReply(post) {
  replyError.value = "";
  if (!user.value) {
    replyError.value = "请先登录后再回复这个帖子。";
    nextTick(() => {
      topicModal.value?.querySelector?.(".reply-login")?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    });
    return;
  }
  activeReplyPostId.value = post.id;
  focusReplyBox();
}

async function toggleLike(post) {
  if (!user.value) {
    promptLoginFor("点赞", post);
    return;
  }
  if (likeBusyPostId.value) return;
  likeBusyPostId.value = post.id;
  try {
    const data = await toggleCommunityPostLike(post.id, !post.likedByMe);
    updatePostLikeState(post.id, data.liked, data.likeCount);
  } catch (err) {
    error.value = err.message || "点赞失败。";
  } finally {
    likeBusyPostId.value = null;
  }
}

function updatePostLikeState(postId, liked, likeCount) {
  updatePostEngagementState(postId, { likedByMe: liked, likeCount });
}

function updatePostEngagementState(postId, patch) {
  posts.value = posts.value.map((item) =>
    item.id === postId ? { ...item, ...patch } : item,
  );
}

async function toggleReplyLike(reply) {
  if (!user.value) {
    replyError.value = "请先登录后再点赞。";
    return;
  }
  if (likeBusyReplyId.value) return;
  likeBusyReplyId.value = reply.id;
  try {
    const data = await toggleCommunityReplyLike(reply.id, !reply.likedByMe);
    updateReplyState(reply.id, { likedByMe: data.liked, likeCount: data.likeCount });
  } catch (err) {
    replyError.value = err.message || "点赞失败。";
  } finally {
    likeBusyReplyId.value = null;
  }
}

async function togglePostReaction(post, emoji) {
  if (!user.value) {
    promptLoginFor("添加表情", post);
    return;
  }
  const key = `post:${post.id}:${emoji}`;
  if (reactionBusyKey.value) return;
  reactionBusyKey.value = key;
  try {
    const data = await toggleCommunityPostReaction(post.id, emoji, !post.myReactions?.includes(emoji));
    updatePostReactionState(post.id, data.reactions, data.myReactions);
  } catch (err) {
    error.value = err.message || "表情回应失败。";
  } finally {
    reactionBusyKey.value = "";
  }
}

async function toggleReplyReaction(reply, emoji) {
  if (!user.value) {
    replyError.value = "请先登录后再添加表情。";
    return;
  }
  const key = `reply:${reply.id}:${emoji}`;
  if (reactionBusyKey.value) return;
  reactionBusyKey.value = key;
  try {
    const data = await toggleCommunityReplyReaction(reply.id, emoji, !reply.myReactions?.includes(emoji));
    updateReplyState(reply.id, { reactions: data.reactions, myReactions: data.myReactions });
  } catch (err) {
    replyError.value = err.message || "表情回应失败。";
  } finally {
    reactionBusyKey.value = "";
  }
}

function updatePostReactionState(postId, reactions, myReactions) {
  posts.value = posts.value.map((item) =>
    item.id === postId ? { ...item, reactions, myReactions } : item,
  );
}

function updateReplyState(replyId, patch) {
  posts.value = posts.value.map((post) => ({
    ...post,
    replies: (post.replies || []).map((reply) => {
      if (reply.id === replyId) {
        const nextReply = { ...reply, ...patch };
        if (!patch.parentId && reply.children?.length && !patch.children?.length) {
          nextReply.children = reply.children;
        }
        return nextReply;
      }
      return {
        ...reply,
        children: (reply.children || []).map((child) => (child.id === replyId ? { ...child, ...patch } : child)),
      };
    }),
  }));
}

function scrollToReply(replyId) {
  if (!replyId) return;
  highlightedReplyId.value = replyId;
  nextTick(() => {
    const selector = `[data-reply-id="${CSS.escape(String(replyId))}"]`;
    const target = topicModal.value?.querySelector?.(selector) || document.querySelector(selector);
    target?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    window.setTimeout(() => {
      if (highlightedReplyId.value === replyId) highlightedReplyId.value = null;
    }, 2200);
  });
}

function syncPostReplyCount(post) {
  return { ...post, replyCount: countReplies(post.replies || []) };
}

function reactionCount(reactions, emoji) {
  return reactions?.find((reaction) => reaction.emoji === emoji)?.count || 0;
}

function replyImages(postId) {
  return replyImageFiles[postId] || [];
}

function childReplyImages(replyId) {
  return childReplyImageFiles[replyId] || [];
}

function validateReplyImages(files) {
  const allowedExtensions = [".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"];
  if (files.length > maxReplyImageCount) {
    return `一次最多添加 ${maxReplyImageCount} 张回复图片。`;
  }
  if (files.some((file) => file.size > maxReplyImageSize)) {
    return "单张回复图片不能超过 8MB。";
  }
  if (files.some((file) => {
    const extension = `.${String(file.name || "").split(".").pop()}`.toLowerCase();
    return !file.type.startsWith("image/") || !allowedExtensions.includes(extension);
  })) {
    return "回复只能添加图片。";
  }
  return "";
}

function handleReplyImageChange(postId, event) {
  replyError.value = "";
  const files = Array.from(event.target.files || []);
  addReplyImageFiles(postId, files);
  event.target.value = "";
}

function addReplyImageFiles(postId, files) {
  if (!files.length) return false;
  replyError.value = "";
  const currentFiles = replyImages(postId);
  const imageFiles = files.filter(isReplyImageFile);
  if (!imageFiles.length) {
    replyError.value = "回复只能添加图片。";
    return false;
  }
  const merged = [...currentFiles, ...imageFiles].slice(0, maxReplyImageCount);
  const validationError = validateReplyImages(merged);
  if (validationError || imageFiles.length + currentFiles.length > maxReplyImageCount) {
    replyError.value = validationError || `一次最多添加 ${maxReplyImageCount} 张回复图片。`;
    return false;
  }
  replyImageFiles[postId] = merged;
  return true;
}

function removeReplyImage(postId, file) {
  replyImageFiles[postId] = replyImages(postId).filter((item) => item !== file);
}

function handleChildReplyImageChange(replyId, event) {
  childReplyError.value = "";
  const files = Array.from(event.target.files || []);
  addChildReplyImageFiles(replyId, files);
  event.target.value = "";
}

function addChildReplyImageFiles(replyId, files) {
  if (!files.length) return false;
  childReplyError.value = "";
  const currentFiles = childReplyImages(replyId);
  const imageFiles = files.filter(isReplyImageFile);
  if (!imageFiles.length) {
    childReplyError.value = "回复只能添加图片。";
    return false;
  }
  const merged = [...currentFiles, ...imageFiles].slice(0, maxReplyImageCount);
  const validationError = validateReplyImages(merged);
  if (validationError || imageFiles.length + currentFiles.length > maxReplyImageCount) {
    childReplyError.value = validationError || `一次最多添加 ${maxReplyImageCount} 张回复图片。`;
    return false;
  }
  childReplyImageFiles[replyId] = merged;
  return true;
}

function removeChildReplyImage(replyId, file) {
  childReplyImageFiles[replyId] = childReplyImages(replyId).filter((item) => item !== file);
}

function isReplyImageFile(file) {
  return Boolean(file?.type?.startsWith("image/"));
}

function filesFromClipboard(event) {
  return Array.from(event.clipboardData?.items || [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter(Boolean);
}

function filesFromDrop(event) {
  return Array.from(event.dataTransfer?.files || []);
}

function handleReplyPaste(postId, event) {
  const files = filesFromClipboard(event);
  if (!files.length) return;
  event.preventDefault();
  addReplyImageFiles(postId, files);
}

function handleReplyDragEnter(postId) {
  replyDragDepth += 1;
  replyDragOverPostId.value = postId;
}

function handleReplyDragLeave(postId) {
  replyDragDepth = Math.max(0, replyDragDepth - 1);
  if (!replyDragDepth && replyDragOverPostId.value === postId) {
    replyDragOverPostId.value = null;
  }
}

function handleReplyDrop(postId, event) {
  replyDragDepth = 0;
  replyDragOverPostId.value = null;
  addReplyImageFiles(postId, filesFromDrop(event));
}

function handleChildReplyPaste(replyId, event) {
  const files = filesFromClipboard(event);
  if (!files.length) return;
  event.preventDefault();
  addChildReplyImageFiles(replyId, files);
}

function handleChildReplyDragEnter(replyId) {
  childReplyDragDepth += 1;
  childReplyDragOverId.value = replyId;
}

function handleChildReplyDragLeave(replyId) {
  childReplyDragDepth = Math.max(0, childReplyDragDepth - 1);
  if (!childReplyDragDepth && childReplyDragOverId.value === replyId) {
    childReplyDragOverId.value = null;
  }
}

function handleChildReplyDrop(replyId, event) {
  childReplyDragDepth = 0;
  childReplyDragOverId.value = null;
  addChildReplyImageFiles(replyId, filesFromDrop(event));
}

function mentionKey(kind, id) {
  return `${kind}:${id}`;
}

function shouldShowMentionPicker(kind, id) {
  return mentionPicker.key === mentionKey(kind, id) && (mentionPicker.loading || mentionPicker.users.length || mentionPicker.query);
}

function closeMentionPicker() {
  if (mentionDebounceTimer) window.clearTimeout(mentionDebounceTimer);
  mentionDebounceTimer = 0;
  mentionRequestController?.abort();
  mentionRequestController = null;
  mentionPicker.requestId += 1;
  mentionPicker.key = "";
  mentionPicker.kind = "";
  mentionPicker.id = null;
  mentionPicker.start = 0;
  mentionPicker.end = 0;
  mentionPicker.query = "";
  mentionPicker.users = [];
  mentionPicker.loading = false;
  mentionPicker.selectedIndex = 0;
}

function activeMentionRange(value, cursor) {
  const textBeforeCursor = String(value || "").slice(0, cursor);
  const atIndex = textBeforeCursor.lastIndexOf("@");
  if (atIndex < 0) return null;
  const prefix = textBeforeCursor.slice(0, atIndex);
  if (prefix && !/[\s([{，。！？、；：]$/.test(prefix)) return null;
  const query = textBeforeCursor.slice(atIndex + 1);
  if (query.length > 30 || /[\s@]/.test(query)) return null;
  return { start: atIndex, end: cursor, query };
}

function handleMentionInput(kind, id, event) {
  const target = event?.target;
  const value = target?.value || "";
  const cursor = Number.isInteger(target?.selectionStart) ? target.selectionStart : value.length;
  const range = activeMentionRange(value, cursor);
  if (!range) {
    closeMentionPicker();
    return;
  }

  const key = mentionKey(kind, id);
  const requestId = mentionPicker.requestId + 1;
  mentionPicker.key = key;
  mentionPicker.kind = kind;
  mentionPicker.id = id;
  mentionPicker.start = range.start;
  mentionPicker.end = range.end;
  mentionPicker.query = range.query;
  mentionPicker.loading = true;
  mentionPicker.selectedIndex = 0;
  mentionPicker.requestId = requestId;
  if (mentionDebounceTimer) window.clearTimeout(mentionDebounceTimer);
  mentionRequestController?.abort();
  mentionDebounceTimer = window.setTimeout(() => {
    mentionDebounceTimer = 0;
    runMentionSearch(range.query, key, requestId);
  }, 280);
}

async function runMentionSearch(query, key, requestId) {
  mentionRequestController = new AbortController();
  try {
    const data = await searchCommunityMentionUsers(query, { signal: mentionRequestController.signal });
    if (mentionPicker.requestId !== requestId || mentionPicker.key !== key) return;
    mentionPicker.users = Array.isArray(data.users) ? data.users : [];
  } catch (err) {
    if (err.name === "AbortError") return;
    if (mentionPicker.requestId === requestId) mentionPicker.users = [];
  } finally {
    if (mentionPicker.requestId === requestId) mentionPicker.loading = false;
    mentionRequestController = null;
  }
}

function handleMentionKeydown(kind, id, event) {
  if (mentionPicker.key !== mentionKey(kind, id)) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeMentionPicker();
    return;
  }
  if (!mentionPicker.users.length) return;
  if (event.key === "ArrowDown") {
    event.preventDefault();
    mentionPicker.selectedIndex = (mentionPicker.selectedIndex + 1) % mentionPicker.users.length;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    mentionPicker.selectedIndex = (mentionPicker.selectedIndex - 1 + mentionPicker.users.length) % mentionPicker.users.length;
  } else if (event.key === "Enter" || event.key === "Tab") {
    event.preventDefault();
    insertMention(mentionPicker.users[mentionPicker.selectedIndex]);
  }
}

function mentionTextarea() {
  if (mentionPicker.kind === "reply") {
    return Array.isArray(replyTextarea.value) ? replyTextarea.value[0] : replyTextarea.value;
  }
  if (mentionPicker.kind === "child") {
    return document.querySelector(`[data-child-reply-id="${CSS.escape(String(mentionPicker.id))}"]`);
  }
  return null;
}

function insertMention(candidate) {
  if (!candidate?.username || !mentionPicker.key) return;
  const target = mentionTextarea();
  const kind = mentionPicker.kind;
  const id = mentionPicker.id;
  const current = kind === "child" ? childReplyForms[id] || "" : replyForms[id] || "";
  const nextValue = `${current.slice(0, mentionPicker.start)}@${candidate.username} ${current.slice(mentionPicker.end)}`;
  const cursor = mentionPicker.start + candidate.username.length + 2;
  if (kind === "child") {
    childReplyForms[id] = nextValue;
  } else {
    replyForms[id] = nextValue;
  }
  closeMentionPicker();
  nextTick(() => {
    target?.focus?.();
    target?.setSelectionRange?.(cursor, cursor);
  });
}

function insertReplyEmoji(postId, emoji) {
  const target = Array.isArray(replyTextarea.value) ? replyTextarea.value[0] : replyTextarea.value;
  const current = replyForms[postId] || "";
  if (!target) {
    replyForms[postId] = `${current}${emoji}`;
    return;
  }
  const start = Number.isInteger(target.selectionStart) ? target.selectionStart : current.length;
  const end = Number.isInteger(target.selectionEnd) ? target.selectionEnd : start;
  replyForms[postId] = `${current.slice(0, start)}${emoji}${current.slice(end)}`;
  nextTick(() => {
    target.focus();
    const cursor = start + emoji.length;
    target.setSelectionRange?.(cursor, cursor);
  });
}

function insertChildReplyEmoji(replyId, emoji) {
  const target = document.querySelector(`[data-child-reply-id="${CSS.escape(String(replyId))}"]`);
  const current = childReplyForms[replyId] || "";
  if (!target) {
    childReplyForms[replyId] = `${current}${emoji}`;
    return;
  }
  const start = Number.isInteger(target.selectionStart) ? target.selectionStart : current.length;
  const end = Number.isInteger(target.selectionEnd) ? target.selectionEnd : start;
  childReplyForms[replyId] = `${current.slice(0, start)}${emoji}${current.slice(end)}`;
  nextTick(() => {
    target.focus();
    const cursor = start + emoji.length;
    target.setSelectionRange?.(cursor, cursor);
  });
}

function buildReplyPayload(body, files, parentId = null) {
  if (!files.length) {
    return parentId ? { body, parentId } : { body };
  }
  const payload = new FormData();
  payload.set("body", body);
  if (parentId) payload.set("parentId", parentId);
  for (const file of files) {
    payload.append("attachments", file);
  }
  return payload;
}

async function submitReply(post) {
  if (isReplySubmitting.value) return;
  replyError.value = "";
  const body = (replyForms[post.id] || "").trim();
  const files = replyImages(post.id);
  const imageError = validateReplyImages(files);
  if (imageError) {
    replyError.value = imageError;
    return;
  }
  if (!body && !files.length) {
    replyError.value = "回复内容不能为空。";
    return;
  }

  isReplySubmitting.value = true;
  const tempReplyId = `temp-${post.id}-${Date.now()}`;
  const tempReply = {
    id: tempReplyId,
    body,
    author: user.value,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 0,
    likedByMe: false,
    attachments: [],
    reactions: [],
    myReactions: [],
    children: [],
    floor: (post.replies?.length || 0) + 1,
    pending: true,
  };
  posts.value = posts.value.map((item) =>
    item.id === post.id ? { ...item, replies: [...(item.replies || []), tempReply] } : item,
  );
  replyForms[post.id] = "";
  replyImageFiles[post.id] = [];
  scrollToReply(tempReplyId);
  try {
    const data = await createCommunityReply(post.id, buildReplyPayload(body, files));
    posts.value = posts.value.map((item) =>
      item.id === post.id
        ? {
            ...item,
            replies: (item.replies || []).map((reply) => (reply.id === tempReplyId ? data.reply : reply)),
            replyCount: Number(item.replyCount || 0) + 1,
            lastActivityAt: data.reply?.createdAt || item.lastActivityAt,
          }
        : item,
    );
    activeReplyPostId.value = null;
    scrollToReply(data.reply?.id);
    await loadNotifications();
  } catch (err) {
    posts.value = posts.value.map((item) =>
      item.id === post.id
        ? { ...item, replies: (item.replies || []).filter((reply) => reply.id !== tempReplyId) }
        : item,
    );
    replyForms[post.id] = body;
    replyImageFiles[post.id] = files;
    replyError.value = err.message || "回复失败。";
  } finally {
    isReplySubmitting.value = false;
  }
}

function toggleChildReply(reply) {
  childReplyError.value = "";
  activeChildReplyId.value = activeChildReplyId.value === reply.id ? null : reply.id;
  if (activeChildReplyId.value === reply.id && childReplyForms[reply.id] === undefined) {
    childReplyForms[reply.id] = "";
  }
  nextTick(() => {
    document.querySelector(`[data-child-reply-id="${CSS.escape(String(reply.id))}"]`)?.focus?.();
  });
}

function requestChildReply(reply) {
  if (!user.value) {
    replyError.value = "请先登录后再回复评论。";
    nextTick(() => {
      topicModal.value?.querySelector?.(".reply-login")?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    });
    return;
  }
  toggleChildReply(reply);
}

async function submitChildReply(post, parentReply) {
  if (childReplySubmittingId.value === parentReply.id) return;
  childReplyError.value = "";
  const body = (childReplyForms[parentReply.id] || "").trim();
  const files = childReplyImages(parentReply.id);
  const imageError = validateReplyImages(files);
  if (imageError) {
    childReplyError.value = imageError;
    return;
  }
  if (!body && !files.length) {
    childReplyError.value = "回复内容不能为空。";
    return;
  }

  childReplySubmittingId.value = parentReply.id;
  const tempReplyId = `temp-child-${parentReply.id}-${Date.now()}`;
  const tempReply = {
    id: tempReplyId,
    parentId: parentReply.id,
    body,
    author: user.value,
    replyToUser: parentReply.author,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    likeCount: 0,
    likedByMe: false,
    attachments: [],
    reactions: [],
    myReactions: [],
    pending: true,
    canManage: true,
  };
  posts.value = posts.value.map((item) =>
    item.id === post.id
      ? {
          ...item,
          replies: (item.replies || []).map((reply) =>
            reply.id === parentReply.id
              ? { ...reply, children: [...(reply.children || []), tempReply] }
              : reply,
          ),
        }
      : item,
  );
  childReplyForms[parentReply.id] = "";
  childReplyImageFiles[parentReply.id] = [];
  scrollToReply(tempReplyId);
  try {
    const data = await createCommunityReply(post.id, buildReplyPayload(body, files, parentReply.id));
    posts.value = posts.value.map((item) =>
      item.id === post.id
        ? {
            ...item,
            replies: (item.replies || []).map((reply) =>
              reply.id === parentReply.id
                ? {
                    ...reply,
                    children: (reply.children || []).map((child) => (child.id === tempReplyId ? data.reply : child)),
                  }
                : reply,
            ),
            replyCount: Number(item.replyCount || 0) + 1,
            lastActivityAt: data.reply?.createdAt || item.lastActivityAt,
          }
        : item,
    );
    activeChildReplyId.value = null;
    scrollToReply(data.reply?.id);
    await loadNotifications();
  } catch (err) {
    posts.value = posts.value.map((item) =>
      item.id === post.id
        ? {
            ...item,
            replies: (item.replies || []).map((reply) =>
              reply.id === parentReply.id
                ? { ...reply, children: (reply.children || []).filter((child) => child.id !== tempReplyId) }
                : reply,
            ),
          }
        : item,
    );
    childReplyForms[parentReply.id] = body;
    childReplyImageFiles[parentReply.id] = files;
    childReplyError.value = err.message || "回复失败。";
  } finally {
    childReplySubmittingId.value = null;
  }
}

function startReplyEdit(reply) {
  editingReplyId.value = reply.id;
  replyEditForm.body = reply.body || "";
  replyEditError.value = "";
}

function cancelReplyEdit() {
  editingReplyId.value = null;
  replyEditForm.body = "";
  replyEditError.value = "";
}

async function submitReplyEdit(reply) {
  replyEditError.value = "";
  const body = replyEditForm.body.trim();
  if (!body) {
    replyEditError.value = "回复内容不能为空。";
    return;
  }
  replyActionBusyId.value = reply.id;
  try {
    const data = await updateCommunityReply(reply.id, { body });
    updateReplyState(reply.id, data.reply);
    cancelReplyEdit();
  } catch (err) {
    replyEditError.value = err.message || "更新失败。";
  } finally {
    replyActionBusyId.value = null;
  }
}

async function removeReply(reply) {
  replyError.value = "";
  if (!window.confirm("确定删除这条回复吗？")) return;
  replyActionBusyId.value = reply.id;
  try {
    await deleteCommunityReply(reply.id);
    posts.value = posts.value.map((post) => {
      const replies = (post.replies || [])
        .filter((item) => item.id !== reply.id)
        .map((item) => ({
          ...item,
          children: (item.children || []).filter((child) => child.id !== reply.id),
        }));
      return syncPostReplyCount({ ...post, replies });
    });
    if (editingReplyId.value === reply.id) {
      cancelReplyEdit();
    }
    if (activeChildReplyId.value === reply.id || reply.parentId === activeChildReplyId.value) {
      activeChildReplyId.value = null;
    }
  } catch (err) {
    replyError.value = err.message || "删除失败。";
  } finally {
    replyActionBusyId.value = null;
  }
}

function toggleComposer() {
  if (isSubmitting.value) return;
  if (!isComposerExpanded.value) {
    focusComposer();
    return;
  }
  isComposerExpanded.value = false;
  isComposerDragOver.value = false;
  composerDragDepth = 0;
  nextTick(() => composerToggle.value?.focus?.({ preventScroll: true }));
}

function focusComposer() {
  if (!user.value) {
    loginPrompt.value = isShareDiscoverySelected.value ? "登录后可以发布分享发现。" : "登录后可以发布新帖子。";
    return;
  }
  isComposerExpanded.value = true;
  nextTick(() => {
    composerForm.value?.querySelector?.(".quick-composer-title")?.focus?.();
  });
}

async function loadNotifications() {
  notificationError.value = "";
  try {
    const data = await getCommunityNotifications();
    notifications.value = Array.isArray(data.notifications) ? data.notifications : [];
    unreadNotifications.value = Number(data.unread || 0);
  } catch (err) {
    notificationError.value = err.message || "消息读取失败。";
  }
}

async function toggleInbox() {
  isInboxOpen.value = !isInboxOpen.value;
  const url = new URL(window.location.href);
  if (isInboxOpen.value) url.searchParams.set("inbox", "1");
  else url.searchParams.delete("inbox");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  if (isInboxOpen.value) await loadNotifications();
}

async function markNotificationRead(notification) {
  if (notification.isRead) return true;
  notification.isRead = true;
  unreadNotifications.value = Math.max(0, unreadNotifications.value - 1);
  try {
    const data = await markCommunityNotificationsRead(notification.id);
    unreadNotifications.value = Number(data.unread ?? unreadNotifications.value);
    return true;
  } catch (err) {
    notificationError.value = err.message || "消息状态更新失败。";
    await loadNotifications();
    return false;
  }
}

async function openNotification(notification) {
  await markNotificationRead(notification);
  window.location.assign(notification.post.url);
}

async function markAllNotificationsRead() {
  notificationError.value = "";
  try {
    const data = await markCommunityNotificationsRead();
    unreadNotifications.value = Number(data.unread ?? 0);
    notifications.value = notifications.value.map((notification) => ({ ...notification, isRead: true }));
  } catch (err) {
    notificationError.value = err.message || "全部已读操作失败。";
    await loadNotifications();
  }
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const CommunityPostStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
};
</script>

<style scoped>
.community-compose-entry {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.community-compose-entry .form-message {
  margin: 0;
}
</style>
