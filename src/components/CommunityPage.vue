<template>
  <section class="community-page">
    <div class="community-stream-shell" :aria-hidden="selectedPost ? 'true' : null" :inert="Boolean(selectedPost)">
      <aside class="community-rail" aria-label="社区快捷入口">
        <a class="rail-link active" href="/community">信息流</a>
        <button class="rail-link" type="button" @click="focusComposer">{{ composerRailLabel }}</button>
        <a v-if="user" class="rail-link" href="/community?inbox=1">消息</a>
        <a v-else class="rail-link" :href="loginHref()">登录</a>
      </aside>

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

        <nav class="community-feed-tabs" aria-label="动态流类型">
          <button
            class="feed-tab"
            :class="{ active: selectedFeed === 'recommended' }"
            type="button"
            @click="selectFeed('recommended')"
          >
            推荐动态
          </button>
          <button
            class="feed-tab"
            :class="{ active: selectedFeed === 'following' }"
            type="button"
            @click="selectFeed('following')"
          >
            关注动态
          </button>
        </nav>

        <nav class="community-channel-tabs" aria-label="社区栏目">
          <button
            class="channel-pill"
            :class="{ active: selectedChannel === 'all' }"
            type="button"
            @click="selectChannel('all')"
          >
            全部
          </button>
          <button
            v-for="channel in channels"
            :key="channel.id"
            class="channel-pill"
            :class="{ active: selectedChannel === channel.id }"
            type="button"
            @click="selectChannel(channel.id)"
          >
            {{ channel.label }}
          </button>
        </nav>

        <div class="forum-sort-tabs" aria-label="帖子排序">
          <button
            v-for="option in sortOptions"
            :key="option.id"
            class="channel-pill"
            :class="{ active: selectedSort === option.id }"
            type="button"
            @click="selectSort(option.id)"
          >
            {{ option.label }}
          </button>
        </div>

        <section v-if="user" class="inbox-panel" :class="{ open: isInboxOpen }" aria-label="社区消息信箱">
          <button class="inbox-toggle" type="button" @click="toggleInbox">
            <span>
              <b>消息信箱</b>
              <small>{{ unreadNotifications ? `${unreadNotifications} 条未读` : "暂无未读" }}</small>
            </span>
            <strong>{{ isInboxOpen ? "收起" : "查看" }}</strong>
          </button>
          <div v-if="isInboxOpen" class="inbox-list">
            <div class="inbox-actions">
              <p>{{ notifications.length ? "有人回复或点赞你的内容时，会出现在这里。" : "暂时没有社区消息。" }}</p>
              <button v-if="unreadNotifications" class="secondary-link small-action" type="button" @click="markAllNotificationsRead">
                全部已读
              </button>
            </div>
            <a
              v-for="notification in notifications"
              :key="notification.id"
              class="inbox-item"
              :class="{ unread: !notification.isRead }"
              :href="notification.post.url"
              @click="markNotificationRead(notification)"
            >
              <div>
                <strong>{{ notification.title }}</strong>
                <p>{{ notification.body }}</p>
              </div>
              <time :datetime="notification.createdAt">{{ formatTime(notification.createdAt) }}</time>
            </a>
          </div>
        </section>

        <form
          v-if="user"
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

          <div v-if="isComposerExpanded" class="composer-grid">
            <label class="field-label">
              栏目
              <select v-model="form.channel">
                <option v-for="channel in channels" :key="channel.id" :value="channel.id">
                  {{ channel.label }}
                </option>
              </select>
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
              <button class="secondary-link small-action" type="button" @click="isComposerExpanded = !isComposerExpanded">
                {{ isComposerExpanded ? "收起" : "更多" }}
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

        <div v-if="isLoading" class="blog-state community-loading-state">
          正在读取社区帖子...
        </div>
        <div v-else-if="loadError" class="blog-state community-loading-state error-state">
          {{ loadError }}
        </div>
        <div v-else-if="posts.length" class="topic-list">
          <article
            v-for="(post, index) in posts"
            :key="post.id"
            v-reveal="index"
            class="topic-card topic-summary-card stream-post"
            :class="{ 'share-discovery-post': isSharePost(post) }"
          >
            <AuthorAvatar :author="post.author" :href="userProfileUrl(post.author)" />
            <div class="stream-post-body">
              <span class="stream-post-meta">
                <a class="author-name-link" :href="userProfileUrl(post.author)" @click.stop>@{{ post.author.username }}</a>
                <a class="topic-inline-link" :href="post.topic?.href || communityListUrl(post.channel)" @click.stop>{{ post.topic?.label || post.channelLabel }}</a>
                <span v-for="badge in post.badges || []" :key="`${post.id}-${badge.key}`" class="forum-badge" :class="`badge-${badge.key}`">{{ badge.label }}</span>
                <span v-if="post.isDraft" class="draft-badge">草稿</span>
                <time :datetime="post.createdAt">{{ formatTime(post.createdAt) }}</time>
              </span>
              <button
                class="stream-post-click"
                type="button"
                @click="openPost(post)"
              >
                <span v-if="isSharePost(post)" class="share-cover" :class="{ empty: !coverImage(post) }">
                  <img v-if="coverImage(post)" :src="coverImage(post).url" :alt="coverImage(post).name" loading="lazy" />
                  <span v-else>分享发现</span>
                </span>
                <span v-if="shouldShowTitle(post)" class="stream-post-title">{{ post.title }}</span>
                <span class="topic-excerpt">{{ excerpt(post.body) }}</span>
              </button>
              <div class="forum-summary-row">
                <span>{{ post.replyCount || replyCount(post) }} 回复</span>
                <span>{{ post.viewCount || 0 }} 浏览</span>
                <span>最后活跃 {{ formatTime(post.lastActivityAt || post.updatedAt) }}</span>
              </div>
              <div v-if="post.attachments?.length" class="feed-media-grid" @click.stop>
                <button
                  v-for="attachment in post.attachments.slice(0, 4)"
                  :key="attachment.id"
                  class="feed-media-tile"
                  type="button"
                  @click="openPost(post)"
                >
                  <img v-if="attachment.type === 'image'" :src="attachment.url" :alt="attachment.name" loading="lazy" />
                  <video v-else-if="attachment.type === 'video'" :src="attachment.url" preload="metadata" muted></video>
                  <span v-else>{{ attachmentIcon(attachment.contentType) }}</span>
                </button>
              </div>
              <div class="topic-actions" @click.stop>
                <button class="feed-action" type="button" @click="openPost(post, { focusReply: true })">
                  <span>回</span>
                  <strong>{{ replyCount(post) }}</strong>
                </button>
                <button class="feed-action" type="button" @click="sharePost(post)">
                  <span>{{ shareStatusPostId === post.id ? "已复制" : "转" }}</span>
                  <strong>{{ post.shareCount || 0 }}</strong>
                </button>
                <button
                  class="feed-action like-button"
                  :class="{ active: post.likedByMe }"
                  type="button"
                  :disabled="likeBusyPostId === post.id"
                  @click="toggleLike(post)"
                >
                  <span>{{ post.likedByMe ? "已赞" : "赞" }}</span>
                  <strong>{{ post.likeCount || 0 }}</strong>
                </button>
                <button
                  class="feed-action"
                  :class="{ active: post.bookmarkedByMe }"
                  type="button"
                  :disabled="bookmarkBusyPostId === post.id"
                  @click="toggleBookmark(post)"
                >
                  <span>{{ post.bookmarkedByMe ? "已藏" : "藏" }}</span>
                  <strong v-if="post.bookmarkCount">{{ post.bookmarkCount }}</strong>
                </button>
                <button
                  v-if="post.author?.canFollow"
                  class="feed-action follow-action"
                  :class="{ active: post.author.followedByMe }"
                  type="button"
                  :disabled="followBusyUserId === post.author.id"
                  @click="toggleFollow(post.author)"
                >
                  <span>{{ post.author.followedByMe ? "已关注" : "关注" }}</span>
                </button>
              </div>
            </div>
          </article>
        </div>
        <section v-else class="community-empty-state">
          <div class="community-empty-head">
            <p class="eyebrow">{{ emptyStateEyebrow }}</p>
            <h2>{{ emptyStateTitle }}</h2>
            <p>{{ emptyStateBody }}</p>
          </div>
          <div class="community-prompt-grid">
            <button
              v-for="prompt in emptyPrompts"
              :key="prompt.title"
              class="community-prompt-card"
              type="button"
              @click="usePrompt(prompt)"
            >
              <span>{{ prompt.kicker }}</span>
              <strong>{{ prompt.title }}</strong>
              <small>{{ prompt.body }}</small>
            </button>
          </div>
        </section>
      </div>

      <aside class="community-sidecard" aria-label="社区说明">
        <div v-if="socialSummary.liveSignals.length" class="sidecard-panel live-panel">
          <p class="eyebrow">Live</p>
          <h2>正在发生</h2>
          <a
            v-for="signal in socialSummary.liveSignals"
            :key="`${signal.kind}-${signal.href}-${signal.createdAt}`"
            class="live-signal"
            :href="signal.href"
          >
            <span>{{ signal.text }}</span>
            <time :datetime="signal.createdAt">{{ formatTime(signal.createdAt) }}</time>
          </a>
        </div>
        <div v-if="socialSummary.activeTopics.length" class="sidecard-panel">
          <p class="eyebrow">Topics</p>
          <h2>热门话题</h2>
          <div class="topic-chip-list">
            <a
              v-for="topic in socialSummary.activeTopics"
              :key="topic.id"
              class="topic-chip"
              :href="topic.href"
            >
              <strong>{{ topic.label }}</strong>
              <span>{{ topic.postCount }} 内容 · {{ topic.replyCount }} 讨论</span>
            </a>
          </div>
        </div>
        <div v-if="socialSummary.recommendedUsers.length" class="sidecard-panel">
          <p class="eyebrow">People</p>
          <h2>推荐用户</h2>
          <div class="recommended-user-list">
            <a
              v-for="person in socialSummary.recommendedUsers"
              :key="person.id"
              class="recommended-user"
              :href="userProfileUrl(person)"
            >
              <AuthorAvatar :author="person" />
              <span>
                <strong>@{{ person.username }}</strong>
                <small>{{ person.postCount }} 发布 · {{ person.followerCount }} 粉丝</small>
              </span>
            </a>
          </div>
        </div>
        <div class="sidecard-panel">
          <p class="eyebrow">What To Post</p>
          <h2>适合发布什么</h2>
          <ul>
            <li>展示一个刚做完的 Vibe Coding 作品，请别人看可用性和表达。</li>
            <li>在“分享发现”里整理文章、资料线索、行业观察和经验复盘。</li>
            <li>记录一次 AI 工具链、提示词或自动化流程的真实踩坑。</li>
            <li>提出希望 4399123 增加或改进的功能，并说明使用场景。</li>
          </ul>
        </div>
        <div class="sidecard-panel">
          <p class="eyebrow">Rules</p>
          <h2>社区共识</h2>
          <p>标题说清问题，正文补足上下文；作品展示建议附链接、截图和想要的反馈。避免刷屏、广告、攻击和泄露隐私。</p>
        </div>
        <div class="sidecard-panel">
          <p class="eyebrow">First Move</p>
          <h2>新用户下一步</h2>
          <p>先选一个栏目浏览；如果当前没有内容，可以用左侧“发帖”发起第一条讨论。</p>
        </div>
      </aside>
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
              <strong>{{ selectedPost.channelLabel }}</strong>
              <span>{{ detailTypeLabel(selectedPost) }}</span>
            </div>
            <div class="detail-nav-tags" aria-label="帖子标签">
              <span class="forum-badge badge-owner">楼主</span>
              <span v-for="badge in selectedPost.badges || []" :key="`nav-${badge.key}`" class="forum-badge" :class="`badge-${badge.key}`">{{ badge.label }}</span>
              <span v-if="selectedPost.isDraft" class="draft-badge">草稿</span>
            </div>
          </div>

          <form v-if="editingPostId === selectedPost.id" class="edit-panel" @submit.prevent="submitEdit(selectedPost)">
            <div class="composer-grid">
              <label class="field-label">
                栏目
                <select v-model="editForm.channel">
                  <option v-for="channel in channels" :key="channel.id" :value="channel.id">
                    {{ channel.label }}
                  </option>
                </select>
              </label>
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
                  <a class="topic-inline-link" :href="selectedPost.topic?.href || communityListUrl(selectedPost.channel)">{{ selectedPost.topic?.label || selectedPost.channelLabel }}</a>
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
                    <span>{{ shareStatusPostId === selectedPost.id ? "已复制" : "分享" }}</span>
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
      <figure class="image-preview-modal" role="dialog" aria-modal="true" :aria-label="`${imagePreview.name} 图片预览`">
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
import { computed, h, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
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

const props = defineProps({
  postId: {
    type: String,
    default: "",
  },
});

const SHARE_DISCOVERY_CHANNEL = "share-discovery";
const fallbackChannels = [
  { id: "meta", label: "站务", description: "账号、公告、社区规则和站点建设讨论。" },
  { id: "vibe-coding", label: "Vibe Coding", description: "快速成型、AI 辅助开发、实验项目复盘。" },
  { id: "ai-tools", label: "AI 工具", description: "模型、提示词、工作流和工具链经验。" },
  { id: SHARE_DISCOVERY_CHANNEL, label: "分享发现", description: "发布文章、行业发现、经验复盘和有价值的资料线索。" },
  { id: "image-prompts", label: "image提示词", description: "分享图像生成提示词、风格参数、案例和复用模板。" },
  { id: "showcase", label: "作品展示", description: "展示你做出的网页、小游戏、图片和原型。" },
  { id: "requests", label: "需求与反馈", description: "提出想要的工具、改进建议和协作需求。" },
  { id: "lounge", label: "闲聊", description: "轻松话题、灵感碎片和日常交流。" },
];

const channels = ref([...fallbackChannels]);
const posts = ref([]);
const user = ref(null);
const selectedChannel = ref("all");
const selectedSort = ref("latest");
const selectedFeed = ref("recommended");
const isLoading = ref(true);
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
const replyTextarea = ref(null);
const topicModal = ref(null);
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
const avatarPalette = ["#1e6f5c", "#294f8f", "#c84f3a", "#7b5d15", "#5b5fc7", "#20736f"];
let composerDragDepth = 0;
let replyDragDepth = 0;
let childReplyDragDepth = 0;
let savedFeedScrollY = 0;
let postOpener = null;
const selectedPost = computed(() => posts.value.find((post) => post.id === selectedPostId.value) || null);
const isStandalonePost = computed(() => Boolean(props.postId));
const isShareDiscoverySelected = computed(() => selectedChannel.value === SHARE_DISCOVERY_CHANNEL || form.channel === SHARE_DISCOVERY_CHANNEL);
const selectedChannelLabel = computed(() => {
  if (selectedChannel.value === "all") return "全部";
  return channels.value.find((channel) => channel.id === selectedChannel.value)?.label || "当前栏目";
});
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
const loginPanelTitle = computed(() => (selectedChannel.value === SHARE_DISCOVERY_CHANNEL ? "登录后发布分享" : "登录后参与讨论"));
const loginPanelBody = computed(() =>
  selectedChannel.value === SHARE_DISCOVERY_CHANNEL
    ? "公开分享可以直接浏览；登录后可以发布文章、发现、经验复盘并接收互动通知。"
    : "公开内容可以直接浏览；登录后可以发布作品、提出需求、回复他人并接收互动通知。",
);
const emptyStateEyebrow = computed(() => (selectedChannel.value === SHARE_DISCOVERY_CHANNEL ? "Share Discovery" : "No Posts"));
const emptyStateTitle = computed(() =>
  selectedChannel.value === SHARE_DISCOVERY_CHANNEL ? "还没有分享发现" : `${selectedChannelLabel.value}还没有内容`,
);
const emptyStateBody = computed(() =>
  selectedChannel.value === SHARE_DISCOVERY_CHANNEL
    ? "这里会展示文章、行业发现、经验分享和资料线索。第一篇可以从一个有用链接、一段复盘或一次工具实践开始。"
    : "当前栏目暂时没有帖子。可以发起一个清楚的问题、作品展示或反馈，让后续讨论有上下文。",
);
const emptyPrompts = computed(() =>
  selectedChannel.value === SHARE_DISCOVERY_CHANNEL
    ? [
        { kicker: "Article", title: "整理一篇文章", body: "写下标题、核心摘要、来源和你认为值得看的原因。" },
        { kicker: "Finding", title: "记录一个发现", body: "可以是工具、资料、产品变化、行业信号或使用技巧。" },
        { kicker: "Experience", title: "复盘一次经验", body: "说明背景、做法、结果和下次可以复用的判断。" },
      ]
    : [
        { kicker: "Question", title: "提出一个问题", body: "把背景、尝试过的方法和期望结果写清楚。" },
        { kicker: "Showcase", title: "展示一个作品", body: "附上截图、链接和你希望得到的反馈。" },
      ],
);
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

const AuthorAvatar = {
  props: {
    author: {
      type: Object,
      default: () => ({}),
    },
    size: {
      type: String,
      default: "",
    },
    href: {
      type: String,
      default: "",
    },
  },
  data() {
    return { imageFailed: false };
  },
  computed: {
    username() {
      return this.author?.username || "user";
    },
    avatarUrl() {
      return this.imageFailed ? "" : this.author?.avatarUrl || "";
    },
    initial() {
      return authorInitial(this.username);
    },
    style() {
      return avatarStyle(this.username);
    },
    label() {
      return `${this.username} 的头像`;
    },
  },
  watch: {
    "author.avatarUrl"() {
      this.imageFailed = false;
    },
  },
  render() {
    const tag = this.href ? "a" : "span";
    return h(
      tag,
      {
        href: this.href || undefined,
        class: ["author-avatar", { large: this.size === "large", "has-image": Boolean(this.avatarUrl) }],
        style: this.style,
        "aria-label": this.label,
        onClick: this.href
          ? (event) => {
              event.stopPropagation();
            }
          : undefined,
      },
      this.avatarUrl
        ? [
            h("img", {
              src: this.avatarUrl,
              alt: this.label,
              loading: "lazy",
              onError: () => {
                this.imageFailed = true;
              },
            }),
          ]
        : [h("span", { "aria-hidden": "true" }, this.initial)],
    );
  },
};

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

onMounted(async () => {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("popstate", handleCommunityRouteChange);
  window.addEventListener("focus", refreshCurrentUserProfile);
  window.addEventListener("auth:user-updated", handleAuthUserUpdated);
  const searchParams = new URLSearchParams(window.location.search);
  isInboxOpen.value = searchParams.get("inbox") === "1";
  const routeChannel = searchParams.get("channel");
  if (routeChannel && (routeChannel === "all" || fallbackChannels.some((channel) => channel.id === routeChannel))) {
    selectedChannel.value = routeChannel;
  }
  const routeSort = searchParams.get("sort");
  if (routeSort && sortOptions.some((option) => option.id === routeSort)) {
    selectedSort.value = routeSort;
  }
  const routeFeed = searchParams.get("feed");
  if (routeFeed === "following" || routeFeed === "recommended") {
    selectedFeed.value = routeFeed;
  }
  await Promise.all([loadUser(), loadSocialSummary(), isStandalonePost.value ? loadPostDetail(props.postId) : loadPosts()]);
  if (user.value) await loadNotifications();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("popstate", handleCommunityRouteChange);
  window.removeEventListener("focus", refreshCurrentUserProfile);
  window.removeEventListener("auth:user-updated", handleAuthUserUpdated);
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

async function loadPosts() {
  isLoading.value = true;
  loadError.value = "";
  try {
    const data = await getCommunityPosts(selectedChannel.value, selectedSort.value, selectedFeed.value);
    channels.value = Array.isArray(data.channels) && data.channels.length ? data.channels : fallbackChannels;
    posts.value = Array.isArray(data.posts) ? data.posts : [];
    if (selectedPostId.value && !posts.value.some((post) => post.id === selectedPostId.value)) {
      closePost();
    }
    user.value = data.user || user.value;
    unreadNotifications.value = Number(data.unreadNotifications || unreadNotifications.value || 0);
  } catch (err) {
    loadError.value = err.message || "读取社区失败。";
    posts.value = [];
  } finally {
    isLoading.value = false;
  }
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

async function loadPostDetail(postId) {
  isLoading.value = true;
  loadError.value = "";
  try {
    const data = await getCommunityPost(postId);
    channels.value = Array.isArray(data.channels) && data.channels.length ? data.channels : fallbackChannels;
    user.value = data.user || user.value;
    unreadNotifications.value = Number(data.unreadNotifications || unreadNotifications.value || 0);
    posts.value = data.post ? [data.post] : [];
    selectedPostId.value = data.post?.id || null;
    if (selectedPostId.value) {
      lockPageScroll();
      focusPostDialog();
    }
  } catch (err) {
    loadError.value = err.message || "读取帖子失败。";
    posts.value = [];
    selectedPostId.value = null;
  } finally {
    isLoading.value = false;
  }
}

function selectChannel(channel) {
  if (isStandalonePost.value) {
    window.location.href = communityListUrl(channel, selectedSort.value);
    return;
  }
  selectedChannel.value = channel;
  if (channel !== "all") form.channel = channel;
  closePostState();
  window.history.pushState({}, "", communityListUrl(channel, selectedSort.value));
  notifyRouteChange();
  loadPosts();
}

function selectSort(sort) {
  if (!sortOptions.some((option) => option.id === sort)) return;
  if (isStandalonePost.value) {
    window.location.href = communityListUrl(selectedChannel.value, sort);
    return;
  }
  selectedSort.value = sort;
  closePostState();
  window.history.pushState({}, "", communityListUrl(selectedChannel.value, sort));
  notifyRouteChange();
  loadPosts();
}

function selectFeed(feed) {
  if (!["recommended", "following"].includes(feed)) return;
  if (isStandalonePost.value) {
    window.location.href = communityListUrl(selectedChannel.value, selectedSort.value, feed);
    return;
  }
  selectedFeed.value = feed;
  closePostState();
  window.history.pushState({}, "", communityListUrl(selectedChannel.value, selectedSort.value, feed));
  notifyRouteChange();
  loadPosts();
}

function communityListUrl(channel = selectedChannel.value, sort = selectedSort.value, feed = selectedFeed.value) {
  const params = new URLSearchParams();
  if (channel && channel !== "all") params.set("channel", channel);
  if (sort && sort !== "latest") params.set("sort", sort);
  if (feed && feed !== "recommended") params.set("feed", feed);
  const query = params.toString();
  return query ? `/community?${query}` : "/community";
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
    return;
  }
  await loadPostDetail(postId);
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
  closePostState();
  if (!posts.value.length && !isLoading.value) {
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
  if (selectedChannel.value !== "all") {
    form.channel = selectedChannel.value;
  }
  if (!user.value) {
    loginPrompt.value =
      selectedChannel.value === SHARE_DISCOVERY_CHANNEL
        ? "登录后可以发布分享发现。"
        : "登录后可以发布新帖子。";
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
  if (event.key === "Escape" && imagePreview.value) {
    closeImagePreview();
    return;
  }
  if (event.key === "Escape" && selectedPost.value) {
    closePost();
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
    selectedChannel.value = data.post.channel || form.channel;
    window.history.pushState({}, "", communityListUrl(selectedChannel.value, selectedSort.value));
    notifyRouteChange();
    posts.value = [
      data.post,
      ...posts.value.filter((post) => post.id !== data.post.id && post.channel === selectedChannel.value),
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
  imagePreview.value = attachment;
}

function closeImagePreview() {
  imagePreview.value = null;
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

function authorInitial(username = "") {
  return String(username || "U").trim().slice(0, 1).toUpperCase() || "U";
}

function avatarStyle(username = "") {
  const text = String(username || "user");
  let hash = 0;
  for (const char of text) {
    hash = (hash + char.charCodeAt(0)) % avatarPalette.length;
  }
  return { "--avatar-bg": avatarPalette[hash] };
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
    const data = await toggleCommunityPostBookmark(post.id);
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
    const data = await toggleCommunityUserFollow(author.id);
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
  shareStatusPostId.value = post.id;
  try {
    const data = await recordCommunityPostShare(post.id);
    updatePostEngagementState(post.id, { shareCount: data.shareCount });
    if (navigator.share) {
      await navigator.share({ title: post.title, text: post.title, url });
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    }
  } catch {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(url);
    } catch {
      error.value = "分享链接复制失败。";
    }
  } finally {
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
    const data = await toggleCommunityPostLike(post.id);
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
    const data = await toggleCommunityReplyLike(reply.id);
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
    const data = await toggleCommunityPostReaction(post.id, emoji);
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
    const data = await toggleCommunityReplyReaction(reply.id, emoji);
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

async function handleMentionInput(kind, id, event) {
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

  try {
    const data = await searchCommunityMentionUsers(range.query);
    if (mentionPicker.requestId !== requestId || mentionPicker.key !== key) return;
    mentionPicker.users = Array.isArray(data.users) ? data.users : [];
  } catch {
    if (mentionPicker.requestId === requestId) mentionPicker.users = [];
  } finally {
    if (mentionPicker.requestId === requestId) mentionPicker.loading = false;
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
  try {
    const data = await getCommunityNotifications();
    notifications.value = Array.isArray(data.notifications) ? data.notifications : [];
    unreadNotifications.value = Number(data.unread || 0);
  } catch {
    notifications.value = [];
    unreadNotifications.value = 0;
  }
}

async function toggleInbox() {
  isInboxOpen.value = !isInboxOpen.value;
  if (isInboxOpen.value) await loadNotifications();
}

async function markNotificationRead(notification) {
  if (notification.isRead) return;
  notification.isRead = true;
  unreadNotifications.value = Math.max(0, unreadNotifications.value - 1);
  try {
    await markCommunityNotificationsRead(notification.id);
  } catch {
    await loadNotifications();
  }
}

async function markAllNotificationsRead() {
  try {
    await markCommunityNotificationsRead();
    await loadNotifications();
  } catch {
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
