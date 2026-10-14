<template>
  <section class="help-page">
    <div class="section-head blog-page-head">
      <div>
        <p class="eyebrow">Help</p>
        <h1>帮助中心</h1>
      </div>
      <a class="secondary-link compact-action" href="/account">返回用户后台</a>
    </div>

    <div class="help-layout">
      <aside class="auth-panel help-sidebar">
        <a href="#faq">常见问题</a>
        <a href="#account">账户问题</a>
        <a href="#publishing">作品发布</a>
        <a href="#review">审核规则</a>
        <a href="#contact">联系支持</a>
      </aside>

      <div class="help-content">
        <section id="faq" class="auth-panel account-card">
          <p class="eyebrow">FAQ</p>
          <h3>常见问题</h3>
          <div class="help-list">
            <article>
              <h4>4399123 社区适合发布什么？</h4>
              <p>适合发布 Vibe Coding 作品、AI 工具、网页实验、项目复盘、需求反馈和围绕站点建设的讨论。</p>
            </article>
            <article>
              <h4>作品为什么需要审核？</h4>
              <p>公开作品集会展示给所有访客，审核用于确认链接可访问、封面安全、内容符合社区规则，并避免垃圾内容。</p>
            </article>
          </div>
        </section>

        <section id="account" class="auth-panel account-card">
          <p class="eyebrow">Account</p>
          <h3>账户问题</h3>
          <div class="help-list">
            <article>
              <h4>注册后可以直接互动吗？</h4>
              <p>注册后可以登录和浏览公开内容；完成邮箱验证后，才可以发帖、回复、点赞、收藏、上传和修改资料。</p>
            </article>
            <article>
              <h4>用户名可以修改吗？</h4>
              <p>可以。用户名为 1-32 位字母、数字（支持中文）、下划线、点或短横线，中文按字符计数。普通用户每 30 天可修改一次，具体可改时间见账户设置。修改用户名不影响账号 ID、已有内容或公开主页链接。</p>
            </article>
          </div>
        </section>

        <section id="publishing" class="auth-panel account-card">
          <p class="eyebrow">Publishing</p>
          <h3>作品发布</h3>
          <div class="help-list">
            <article>
              <h4>提交作品需要准备什么？</h4>
              <p>需要项目名称、简介、作者名、演示地址和封面图；源码地址和 ZIP 源码文件可以按需补充。</p>
            </article>
            <article>
              <h4>支持哪些文件？</h4>
              <p>封面支持 JPG、PNG、WebP、AVIF，最大 5MB；源码文件只支持 ZIP，最大 20MB。</p>
            </article>
          </div>
        </section>

        <section id="review" class="auth-panel account-card">
          <p class="eyebrow">Review</p>
          <h3>审核规则</h3>
          <div class="help-list">
            <article>
              <h4>审核状态有哪些？</h4>
              <p>至少包括待审核、已通过、已拒绝；站点也会使用“标记问题”提醒作者补充信息或修改内容。</p>
            </article>
            <article>
              <h4>哪些内容会被拒绝？</h4>
              <p>无法访问的链接、侵权或恶意内容、欺骗性下载、内网链接、危险文件和明显偏离社区主题的内容会被拒绝。</p>
            </article>
          </div>
        </section>

        <section id="contact" class="auth-panel account-card">
          <p class="eyebrow">Support</p>
          <h3>联系支持</h3>
          <p class="help-contact">遇到账号、作品审核或安全问题，可以在社区“站务”栏目发帖反馈，或通过项目开源仓库提交 issue，我们会尽快跟进。</p>
          <div class="auth-actions">
            <a class="primary-link compact-action" href="/community?channel=meta">前往站务</a>
            <a class="secondary-link compact-action" href="https://github.com/linhucong814-cyber/4399123.com" target="_blank" rel="noopener noreferrer">GitHub 仓库</a>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { setPageSeo } from "../utils/seo";

setPageSeo({
  title: "帮助中心",
  description: "4399123.com 帮助中心：常见问题、账户问题、作品发布、审核规则和联系支持。",
  path: "/help",
});
</script>
