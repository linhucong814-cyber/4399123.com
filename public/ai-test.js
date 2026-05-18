const dimensions = {
  logic: "理性分析型",
  creative: "灵感创造型",
  social: "共情沟通型",
  action: "行动效率型",
  reflective: "深度内省型",
};

const questionBank = [
  { text: "面对复杂问题，你更喜欢 AI 先拆结构，再给结论。", dimension: "logic" },
  { text: "AI 的回答如果没有依据，你会觉得不够可靠。", dimension: "logic" },
  { text: "做决定时，你希望 AI 把利弊、风险和代价列清楚。", dimension: "logic" },
  { text: "你喜欢让 AI 把一堆信息整理成表格或清单。", dimension: "logic" },
  { text: "比起安慰，你更希望 AI 给你一个站得住的判断。", dimension: "logic" },
  { text: "你会让 AI 帮你检查方案里有没有漏洞。", dimension: "logic" },
  { text: "AI 说“可能”时，你会想知道概率和原因。", dimension: "logic" },
  { text: "你喜欢把问题问到边界条件都清楚为止。", dimension: "logic" },
  { text: "你希望 AI 像一个冷静军师，而不是热闹搭子。", dimension: "logic" },
  { text: "看到混乱内容被 AI 分层归类，你会很舒服。", dimension: "logic" },
  { text: "你会让 AI 帮你比较多个方案，而不是只推荐一个。", dimension: "logic" },
  { text: "你更相信可复盘的推理，而不是一句漂亮结论。", dimension: "logic" },
  { text: "你希望 AI 在关键问题上少发挥，多验证。", dimension: "logic" },
  { text: "如果目标模糊，你会先让 AI 定义问题。", dimension: "logic" },
  { text: "你喜欢 AI 把抽象想法变成步骤、变量和指标。", dimension: "logic" },
  { text: "遇到争论时，你希望 AI 先帮你区分事实和观点。", dimension: "logic" },
  { text: "你对 AI 的准确性要求高于趣味性。", dimension: "logic" },
  { text: "你会让 AI 帮你做反方视角，避免自己想偏。", dimension: "logic" },
  { text: "你喜欢 AI 给出判断依据，而不是只给态度。", dimension: "logic" },
  { text: "当事情变复杂，你会本能地想要一张逻辑地图。", dimension: "logic" },

  { text: "你喜欢让 AI 先给很多脑洞，再慢慢筛选。", dimension: "creative" },
  { text: "普通想法被 AI 加一点巧思，你会很有成就感。", dimension: "creative" },
  { text: "你会让 AI 帮你起标题、命名、写梗或找风格。", dimension: "creative" },
  { text: "比起标准答案，你更期待 AI 给你意外角度。", dimension: "creative" },
  { text: "你愿意和 AI 来回碰撞，把想法磨出火花。", dimension: "creative" },
  { text: "你常用 AI 打开思路，而不是直接拿最终稿。", dimension: "creative" },
  { text: "你喜欢 AI 把内容变得更有画面感。", dimension: "creative" },
  { text: "你会让 AI 提供多个风格版本供你挑选。", dimension: "creative" },
  { text: "你觉得 AI 最迷人的地方，是它能扩展想象边界。", dimension: "creative" },
  { text: "你会把 AI 当作创意陪练，而不是自动写手。", dimension: "creative" },
  { text: "你喜欢让 AI 把严肃内容变得更有趣。", dimension: "creative" },
  { text: "你容易被一个新颖表达激发继续创作。", dimension: "creative" },
  { text: "你希望 AI 能给作品一点独特气质。", dimension: "creative" },
  { text: "你会用 AI 试不同人设、语气或叙事方式。", dimension: "creative" },
  { text: "你喜欢在 AI 的建议里寻找意外的灵感碎片。", dimension: "creative" },
  { text: "你更怕内容无聊，而不是内容暂时不完美。", dimension: "creative" },
  { text: "你会让 AI 帮你把点子变成故事或场景。", dimension: "creative" },
  { text: "你愿意先发散，再慢慢收束。", dimension: "creative" },
  { text: "AI 如果太保守，你会觉得它不够好玩。", dimension: "creative" },
  { text: "你喜欢把 AI 当作灵感搭子一起玩一轮。", dimension: "creative" },

  { text: "你希望 AI 能帮你把话说得更舒服。", dimension: "social" },
  { text: "发重要消息前，你会在意语气是否合适。", dimension: "social" },
  { text: "你希望 AI 能理解情绪，而不只是处理文字。", dimension: "social" },
  { text: "AI 如果很冷，你会觉得体验少了一点温度。", dimension: "social" },
  { text: "你会让 AI 帮你预判别人可能怎么感受。", dimension: "social" },
  { text: "关系微妙时，你希望 AI 帮你拆解双方立场。", dimension: "social" },
  { text: "你喜欢 AI 给出既诚实又不伤人的表达。", dimension: "social" },
  { text: "你更在意沟通是否被接住，而不只是是否说完。", dimension: "social" },
  { text: "你会让 AI 帮你把强硬的话调得更稳。", dimension: "social" },
  { text: "你常常能感觉到话里没说出口的部分。", dimension: "social" },
  { text: "你希望 AI 能做一个低噪音的倾听者。", dimension: "social" },
  { text: "你会用 AI 练习一次重要对话。", dimension: "social" },
  { text: "你希望 AI 能提醒你哪里可能让人误会。", dimension: "social" },
  { text: "你重视表达的分寸感和边界感。", dimension: "social" },
  { text: "你觉得好的 AI 不该只有效率，也要有体贴。", dimension: "social" },
  { text: "你会让 AI 帮你把情绪翻译成清楚的话。", dimension: "social" },
  { text: "你希望 AI 帮你处理尴尬、冲突或冷场。", dimension: "social" },
  { text: "你不喜欢 AI 用太机械的语气回复你。", dimension: "social" },
  { text: "你会关注 AI 回答是否尊重人的感受。", dimension: "social" },
  { text: "你希望 AI 像沟通调音师，而不是判官。", dimension: "social" },

  { text: "你打开 AI 时，经常是想立刻知道下一步。", dimension: "action" },
  { text: "你喜欢 AI 把大目标拆成小任务。", dimension: "action" },
  { text: "拖延时，你希望 AI 给你一个小到不能拒绝的开始。", dimension: "action" },
  { text: "比起讲道理，你更希望 AI 帮你推进。", dimension: "action" },
  { text: "你喜欢 AI 给出清单、优先级和时间安排。", dimension: "action" },
  { text: "计划太空泛时，你会让 AI 落到执行步骤。", dimension: "action" },
  { text: "你希望 AI 像任务推进器，而不是陪聊对象。", dimension: "action" },
  { text: "你会用 AI 逼自己从想法进入行动。", dimension: "action" },
  { text: "你喜欢看到任务被 AI 一个个打勾。", dimension: "action" },
  { text: "你更关心 AI 是否帮你节省时间。", dimension: "action" },
  { text: "你希望 AI 直接告诉你先做什么、后做什么。", dimension: "action" },
  { text: "你容易被明确的第一步带动起来。", dimension: "action" },
  { text: "你会让 AI 帮你把流程变短、变顺。", dimension: "action" },
  { text: "你喜欢 AI 把混乱任务压缩成行动路线。", dimension: "action" },
  { text: "当想法太多时，你希望 AI 帮你选一个先做。", dimension: "action" },
  { text: "你不喜欢 AI 绕很久才给结论。", dimension: "action" },
  { text: "你希望 AI 帮你减少犹豫和启动成本。", dimension: "action" },
  { text: "你会用 AI 做日程、计划、复盘和提醒。", dimension: "action" },
  { text: "你觉得好用的 AI 应该能把事情推过临界点。", dimension: "action" },
  { text: "你最爽的时刻，是 AI 把任务变得可以马上开始。", dimension: "action" },

  { text: "你希望 AI 帮你看清自己真正卡在哪里。", dimension: "reflective" },
  { text: "你会问 AI：我为什么总是这样？", dimension: "reflective" },
  { text: "你不只想解决问题，也想理解自己的模式。", dimension: "reflective" },
  { text: "情绪混乱时，你希望 AI 帮你慢慢梳理。", dimension: "reflective" },
  { text: "你会用 AI 做复盘、日记或自我提问。", dimension: "reflective" },
  { text: "你希望 AI 像一面镜子，而不是命令按钮。", dimension: "reflective" },
  { text: "你会让 AI 帮你区分真实需求和一时冲动。", dimension: "reflective" },
  { text: "你喜欢 AI 提出能让你停下来想一想的问题。", dimension: "reflective" },
  { text: "你关心长期方向，而不只是眼前效率。", dimension: "reflective" },
  { text: "你希望 AI 帮你发现重复出现的选择习惯。", dimension: "reflective" },
  { text: "你会让 AI 帮你把模糊感受说清楚。", dimension: "reflective" },
  { text: "你愿意让 AI 追问你表面答案背后的原因。", dimension: "reflective" },
  { text: "你常常需要先理解自己，才知道下一步。", dimension: "reflective" },
  { text: "你希望 AI 陪你把复杂心事拆成可理解的层次。", dimension: "reflective" },
  { text: "你不喜欢只给鸡血的建议，更想要真实洞察。", dimension: "reflective" },
  { text: "你会用 AI 看见自己反复回避的问题。", dimension: "reflective" },
  { text: "你喜欢 AI 帮你把经历整理成经验。", dimension: "reflective" },
  { text: "你希望 AI 既能帮你行动，也能提醒你为什么行动。", dimension: "reflective" },
  { text: "当别人只看结果时，你会想看过程里的意义。", dimension: "reflective" },
  { text: "你希望 AI 帮你把内心弹窗整理成一句清楚的话。", dimension: "reflective" },
];

const extraQuestionBank = [
  { text: "你会让 AI 先指出问题的核心，而不是马上给安慰。", dimension: "logic" },
  { text: "你喜欢 AI 把观点分成事实、推测和建议。", dimension: "logic" },
  { text: "你希望 AI 说明一个结论适用在哪些条件下。", dimension: "logic" },
  { text: "你会让 AI 帮你找出计划中最容易失败的一环。", dimension: "logic" },
  { text: "当信息很多时，你希望 AI 先做分类再总结。", dimension: "logic" },
  { text: "你会让 AI 帮你判断一个说法是不是过度简化。", dimension: "logic" },
  { text: "你希望 AI 对不确定的地方直接标出来。", dimension: "logic" },
  { text: "你喜欢 AI 给出多个判断标准，而不是凭感觉推荐。", dimension: "logic" },
  { text: "你会让 AI 帮你把问题改写得更精确。", dimension: "logic" },
  { text: "你希望 AI 在做建议前先问清目标。", dimension: "logic" },
  { text: "你会用 AI 检查自己的论证有没有跳步。", dimension: "logic" },
  { text: "你喜欢 AI 用简短框架解释复杂概念。", dimension: "logic" },
  { text: "你会让 AI 帮你识别哪些信息是噪音。", dimension: "logic" },
  { text: "你更相信 AI 的推理过程，而不只看最终答案。", dimension: "logic" },
  { text: "你希望 AI 把建议按优先级和影响程度排序。", dimension: "logic" },
  { text: "你会让 AI 帮你找一个观点的反例。", dimension: "logic" },
  { text: "你喜欢 AI 给出清晰的判断边界。", dimension: "logic" },
  { text: "你会让 AI 把长文本压缩成逻辑提纲。", dimension: "logic" },
  { text: "你希望 AI 帮你比较短期收益和长期代价。", dimension: "logic" },
  { text: "你会让 AI 把问题拆成可以验证的小问题。", dimension: "logic" },
  { text: "你喜欢 AI 指出你忽略的前提。", dimension: "logic" },
  { text: "你会让 AI 帮你把模糊目标变成判断标准。", dimension: "logic" },
  { text: "你希望 AI 先澄清定义，再展开讨论。", dimension: "logic" },
  { text: "你会让 AI 帮你评估一个方案的风险等级。", dimension: "logic" },
  { text: "你喜欢 AI 把选择题变成可比较的矩阵。", dimension: "logic" },
  { text: "你希望 AI 在回答里区分确定和猜测。", dimension: "logic" },
  { text: "你会让 AI 帮你找出最关键的那个变量。", dimension: "logic" },
  { text: "你喜欢 AI 用一句话先给结论，再给依据。", dimension: "logic" },

  { text: "你会让 AI 给同一个想法换三种完全不同的表达。", dimension: "creative" },
  { text: "你喜欢 AI 把普通话题变得更有画面。", dimension: "creative" },
  { text: "你会让 AI 帮你找一个更有记忆点的比喻。", dimension: "creative" },
  { text: "你希望 AI 在创作时先大胆一点，再慢慢收住。", dimension: "creative" },
  { text: "你会用 AI 试探一个点子有没有传播感。", dimension: "creative" },
  { text: "你喜欢 AI 给你一些看起来不太常规的方向。", dimension: "creative" },
  { text: "你会让 AI 帮你把一句平淡的话变得更有张力。", dimension: "creative" },
  { text: "你希望 AI 能像一个会接话的创意搭档。", dimension: "creative" },
  { text: "你会让 AI 帮你生成角色、场景或概念设定。", dimension: "creative" },
  { text: "你喜欢 AI 把严肃内容包装得更轻松。", dimension: "creative" },
  { text: "你会让 AI 给作品找一个更鲜明的风格锚点。", dimension: "creative" },
  { text: "你希望 AI 帮你突破第一版的普通感。", dimension: "creative" },
  { text: "你会用 AI 做命名备选，然后自己挑最有感觉的。", dimension: "creative" },
  { text: "你喜欢 AI 提供一些看似奇怪但能启发人的答案。", dimension: "creative" },
  { text: "你会让 AI 帮你把内容做得更适合分享。", dimension: "creative" },
  { text: "你希望 AI 能帮你找到作品的情绪色彩。", dimension: "creative" },
  { text: "你会让 AI 把一个点子扩展成系列。", dimension: "creative" },
  { text: "你喜欢 AI 给你提供不同语气和人设版本。", dimension: "creative" },
  { text: "你会让 AI 帮你制造一点反差感。", dimension: "creative" },
  { text: "你希望 AI 能把抽象概念变成具体画面。", dimension: "creative" },
  { text: "你会让 AI 帮你把一个无聊开头变得更抓人。", dimension: "creative" },
  { text: "你喜欢 AI 给出可以继续延展的灵感线索。", dimension: "creative" },
  { text: "你会让 AI 帮你设计一个更有趣的结构。", dimension: "creative" },
  { text: "你希望 AI 不只是正确，还要有一点惊喜。", dimension: "creative" },
  { text: "你会用 AI 试不同风格，直到出现那个味道。", dimension: "creative" },
  { text: "你喜欢 AI 把旧想法翻出新角度。", dimension: "creative" },
  { text: "你会让 AI 帮你把灵感碎片拼成完整作品。", dimension: "creative" },

  { text: "你会让 AI 帮你把一句强硬的话说得更稳。", dimension: "social" },
  { text: "你希望 AI 能提醒你哪里可能让别人误会。", dimension: "social" },
  { text: "你会用 AI 预演一次难开口的对话。", dimension: "social" },
  { text: "你希望 AI 帮你区分表达立场和攻击别人。", dimension: "social" },
  { text: "你会让 AI 帮你把拒绝说得清楚但不伤人。", dimension: "social" },
  { text: "你喜欢 AI 在沟通建议里考虑对方处境。", dimension: "social" },
  { text: "你会让 AI 帮你判断一段话是否太冷。", dimension: "social" },
  { text: "你希望 AI 能把情绪化的话翻译得更清楚。", dimension: "social" },
  { text: "你会让 AI 帮你处理合作里的尴尬气氛。", dimension: "social" },
  { text: "你喜欢 AI 给出更有分寸的表达版本。", dimension: "social" },
  { text: "你会让 AI 帮你分析别人真正关心什么。", dimension: "social" },
  { text: "你希望 AI 的回答能让人感觉被尊重。", dimension: "social" },
  { text: "你会让 AI 帮你在真诚和礼貌之间找平衡。", dimension: "social" },
  { text: "你不希望 AI 把复杂关系处理得太机械。", dimension: "social" },
  { text: "你会让 AI 帮你把抱怨改成建设性表达。", dimension: "social" },
  { text: "你希望 AI 能读出一句话里的情绪强度。", dimension: "social" },
  { text: "你会让 AI 帮你准备一场重要沟通。", dimension: "social" },
  { text: "你喜欢 AI 在建议里保留人情味。", dimension: "social" },
  { text: "你会让 AI 帮你把歉意表达得更具体。", dimension: "social" },
  { text: "你希望 AI 能帮你避免无意中的冒犯。", dimension: "social" },
  { text: "你会让 AI 帮你把边界说得坚定但不刺耳。", dimension: "social" },
  { text: "你喜欢 AI 给出适合不同对象的说法。", dimension: "social" },
  { text: "你会让 AI 帮你理解沉默背后的可能原因。", dimension: "social" },
  { text: "你希望 AI 在冲突中先帮你降温。", dimension: "social" },
  { text: "你会让 AI 帮你把复杂情绪说成对方能懂的话。", dimension: "social" },
  { text: "你喜欢 AI 像一个耐心的沟通翻译。", dimension: "social" },
  { text: "你会让 AI 帮你判断什么时候该说，什么时候该停。", dimension: "social" },

  { text: "你会让 AI 把目标拆成今天能完成的动作。", dimension: "action" },
  { text: "你希望 AI 直接给你一份可执行清单。", dimension: "action" },
  { text: "你会让 AI 帮你安排先做什么、后做什么。", dimension: "action" },
  { text: "你喜欢 AI 把拖延的事变成很小的第一步。", dimension: "action" },
  { text: "你希望 AI 能帮你快速进入状态。", dimension: "action" },
  { text: "你会让 AI 帮你减少做事前的犹豫。", dimension: "action" },
  { text: "你喜欢 AI 把复杂流程变短。", dimension: "action" },
  { text: "你希望 AI 像一个会提醒你的行动教练。", dimension: "action" },
  { text: "你会让 AI 帮你把计划排进时间表。", dimension: "action" },
  { text: "你喜欢 AI 给出马上能复制执行的模板。", dimension: "action" },
  { text: "你希望 AI 帮你从一堆想法里选一个先做。", dimension: "action" },
  { text: "你会让 AI 帮你设置任务的最低完成版本。", dimension: "action" },
  { text: "你喜欢 AI 给出明确的行动顺序。", dimension: "action" },
  { text: "你希望 AI 把长期目标拆成阶段。", dimension: "action" },
  { text: "你会让 AI 帮你检查任务是否太大。", dimension: "action" },
  { text: "你喜欢 AI 直接告诉你下一步怎么开始。", dimension: "action" },
  { text: "你希望 AI 能帮你把复盘变成下一次行动。", dimension: "action" },
  { text: "你会让 AI 帮你减少重复劳动。", dimension: "action" },
  { text: "你喜欢 AI 给你一个能立刻动手的版本。", dimension: "action" },
  { text: "你希望 AI 帮你把任务从模糊变成具体。", dimension: "action" },
  { text: "你会让 AI 帮你决定今天最该完成哪件事。", dimension: "action" },
  { text: "你喜欢 AI 把计划里的阻力提前指出来。", dimension: "action" },
  { text: "你希望 AI 帮你把事情推进到交付。", dimension: "action" },
  { text: "你会让 AI 给你一个简短但有力的行动提醒。", dimension: "action" },
  { text: "你喜欢 AI 帮你把想法转成任务卡。", dimension: "action" },
  { text: "你希望 AI 能帮你追踪进度。", dimension: "action" },
  { text: "你会让 AI 帮你把复杂项目切成几个里程碑。", dimension: "action" },
  { text: "你喜欢 AI 把开始变得不那么费力。", dimension: "action" },

  { text: "你会让 AI 帮你看见自己真正害怕的是什么。", dimension: "reflective" },
  { text: "你希望 AI 帮你区分情绪和事实。", dimension: "reflective" },
  { text: "你会用 AI 回看一次经历里学到了什么。", dimension: "reflective" },
  { text: "你喜欢 AI 问你一个让你停顿的问题。", dimension: "reflective" },
  { text: "你希望 AI 帮你找到反复拖延背后的原因。", dimension: "reflective" },
  { text: "你会让 AI 帮你把心里的混乱写清楚。", dimension: "reflective" },
  { text: "你希望 AI 帮你看见自己真正想要的东西。", dimension: "reflective" },
  { text: "你会用 AI 做一次不评判自己的复盘。", dimension: "reflective" },
  { text: "你喜欢 AI 帮你把经历整理成下一次的经验。", dimension: "reflective" },
  { text: "你希望 AI 帮你发现自己经常忽略的需求。", dimension: "reflective" },
  { text: "你会让 AI 帮你把情绪命名。", dimension: "reflective" },
  { text: "你喜欢 AI 帮你从表面问题看到深层模式。", dimension: "reflective" },
  { text: "你希望 AI 能陪你把一个困惑慢慢拆开。", dimension: "reflective" },
  { text: "你会让 AI 帮你判断自己是不是在逃避。", dimension: "reflective" },
  { text: "你喜欢 AI 帮你把内心独白变成清晰文字。", dimension: "reflective" },
  { text: "你希望 AI 帮你在行动前确认真正动机。", dimension: "reflective" },
  { text: "你会让 AI 帮你看见自己重复选择的原因。", dimension: "reflective" },
  { text: "你喜欢 AI 提醒你慢一点理解自己。", dimension: "reflective" },
  { text: "你希望 AI 帮你把焦虑拆成可以面对的部分。", dimension: "reflective" },
  { text: "你会用 AI 整理一天里最重要的感受。", dimension: "reflective" },
  { text: "你喜欢 AI 帮你把问题放回更长的时间线里。", dimension: "reflective" },
  { text: "你希望 AI 帮你看清选择背后的价值排序。", dimension: "reflective" },
  { text: "你会让 AI 帮你把失败变成具体经验。", dimension: "reflective" },
  { text: "你喜欢 AI 帮你找到内心真正卡住的句子。", dimension: "reflective" },
  { text: "你希望 AI 不急着给答案，而是先理解你。", dimension: "reflective" },
  { text: "你会让 AI 帮你从关系里看见自己的模式。", dimension: "reflective" },
  { text: "你喜欢 AI 把复杂心事整理成一个可面对的问题。", dimension: "reflective" },
];

const optimizedQuestionBank = [
  { text: "判断前，你会先找证据吗？", dimension: "logic" },
  { text: "信息混乱时，你先分类吗？", dimension: "logic" },
  { text: "你会追问结论的前提吗？", dimension: "logic" },
  { text: "做选择时，你会比较代价吗？", dimension: "logic" },
  { text: "你更信推理，不太信感觉吗？", dimension: "logic" },
  { text: "你会主动寻找反例吗？", dimension: "logic" },
  { text: "你在意观点和事实的边界吗？", dimension: "logic" },
  { text: "问题模糊时，你先定义问题吗？", dimension: "logic" },
  { text: "你喜欢把风险提前列出来吗？", dimension: "logic" },
  { text: "你会用标准来判断答案好坏吗？", dimension: "logic" },
  { text: "你会把大问题拆成变量吗？", dimension: "logic" },
  { text: "你讨厌没有依据的建议吗？", dimension: "logic" },

  { text: "看到普通想法，你会想改出新意吗？", dimension: "creative" },
  { text: "你喜欢从意外角度看问题吗？", dimension: "creative" },
  { text: "你会用比喻理解复杂事吗？", dimension: "creative" },
  { text: "你更怕无聊，不太怕第一版粗糙吗？", dimension: "creative" },
  { text: "你常把点子扩展成场景吗？", dimension: "creative" },
  { text: "你会主动尝试不同表达风格吗？", dimension: "creative" },
  { text: "你容易被一句新鲜表达点燃吗？", dimension: "creative" },
  { text: "你喜欢先发散，再筛选吗？", dimension: "creative" },
  { text: "你会给作品找独特气质吗？", dimension: "creative" },
  { text: "你愿意把旧想法翻出新角度吗？", dimension: "creative" },
  { text: "你喜欢让内容更有画面感吗？", dimension: "creative" },
  { text: "你会用脑洞突破标准答案吗？", dimension: "creative" },

  { text: "发消息前，你会检查语气吗？", dimension: "social" },
  { text: "你能察觉别人没说出口的情绪吗？", dimension: "social" },
  { text: "你会预判一句话会不会伤人吗？", dimension: "social" },
  { text: "冲突里，你会先看双方立场吗？", dimension: "social" },
  { text: "你重视表达的分寸感吗？", dimension: "social" },
  { text: "拒绝别人时，你会保留体面吗？", dimension: "social" },
  { text: "你会把强硬的话说得更稳吗？", dimension: "social" },
  { text: "你在意对方是否被理解吗？", dimension: "social" },
  { text: "你会为不同对象调整说法吗？", dimension: "social" },
  { text: "尴尬场面里，你会主动降温吗？", dimension: "social" },
  { text: "你常听出话里的关系信号吗？", dimension: "social" },
  { text: "你希望真话也能被好好接住吗？", dimension: "social" },

  { text: "有目标时，你先找下一步吗？", dimension: "action" },
  { text: "你喜欢把计划拆成小动作吗？", dimension: "action" },
  { text: "拖延时，你需要一个很小的开始吗？", dimension: "action" },
  { text: "你会按优先级处理任务吗？", dimension: "action" },
  { text: "你更想推进，而不是继续讨论吗？", dimension: "action" },
  { text: "你会把想法排进时间表吗？", dimension: "action" },
  { text: "你喜欢能马上执行的建议吗？", dimension: "action" },
  { text: "你会主动减少重复劳动吗？", dimension: "action" },
  { text: "任务太大时，你会切成阶段吗？", dimension: "action" },
  { text: "你容易被明确起点带动吗？", dimension: "action" },
  { text: "你希望计划能直接落地吗？", dimension: "action" },
  { text: "你不喜欢绕很久才给结论吗？", dimension: "action" },

  { text: "情绪乱时，你会先命名感受吗？", dimension: "reflective" },
  { text: "你会复盘自己为什么这样选吗？", dimension: "reflective" },
  { text: "你想看见反复出现的模式吗？", dimension: "reflective" },
  { text: "你会追问真正需求是什么吗？", dimension: "reflective" },
  { text: "失败后，你会整理经验吗？", dimension: "reflective" },
  { text: "你常把问题放到长期方向里看吗？", dimension: "reflective" },
  { text: "你愿意面对自己回避的事吗？", dimension: "reflective" },
  { text: "你会区分事实和情绪吗？", dimension: "reflective" },
  { text: "你需要先理解自己再行动吗？", dimension: "reflective" },
  { text: "你喜欢被一个好问题点醒吗？", dimension: "reflective" },
  { text: "你会观察自己的选择习惯吗？", dimension: "reflective" },
  { text: "你希望答案不只有效，也有意义吗？", dimension: "reflective" },
];

const fullQuestionBank = optimizedQuestionBank;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function createQuestionSet() {
  const targetCount = selectedQuestionCount;
  const dimensionIds = Object.keys(dimensions);
  const baseCount = Math.floor(targetCount / dimensionIds.length);
  const extraCount = targetCount % dimensionIds.length;
  const dimensionsWithExtra = new Set(shuffle(dimensionIds).slice(0, extraCount));
  const selected = dimensionIds.flatMap((dimension) => {
    const count = baseCount + (dimensionsWithExtra.has(dimension) ? 1 : 0);
    return shuffle(fullQuestionBank.filter((question) => question.dimension === dimension)).slice(0, count);
  });

  return shuffle(selected);
}

let selectedQuestionCount = 13;
let questions = createQuestionSet();

const choiceSet = [
  { key: "yes", label: "这很像我", value: 2 },
  { key: "neutral", label: "要看具体情况", value: 1 },
  { key: "no", label: "这不太像我", value: 0 },
];

const scoringWeights = {
  logic: { logic: 1, action: 0.18, reflective: 0.16 },
  creative: { creative: 1, social: 0.16, reflective: 0.14 },
  social: { social: 1, reflective: 0.24, creative: 0.1 },
  action: { action: 1, logic: 0.22, reflective: 0.08 },
  reflective: { reflective: 1, social: 0.16, logic: 0.12 },
};

const responseIntensity = {
  yes: 1,
  neutral: 0.55,
  no: 0.12,
};

const fallbackChoiceToneBank = {
  logic: {
    yes: [
      "先拆清楚，我需要看到结构",
      "理由站得住，我才会安心",
      "我想先看清变量和依据",
      "别只给结论，我要知道为什么",
    ],
    neutral: [
      "重要的事我会认真拆",
      "抓重点就行，不用太复杂",
      "先听大概，必要时再深挖",
      "够用就好，别分析过头",
    ],
    no: [
      "我更想先凭感觉试试",
      "能用就行，不想开辩论赛",
      "我会先行动，边做边修",
      "少点推理，我更想要方向",
    ],
  },
  creative: {
    yes: [
      "来点新鲜的，普通答案不够爽",
      "先把脑洞打开再说",
      "我喜欢越聊越有东西",
      "加点风格，要有记忆点",
    ],
    neutral: [
      "可以有趣，但别飞太远",
      "给点参考，最后我来定",
      "卡住时帮我补位就好",
      "小小发散，别带跑主题",
    ],
    no: [
      "先别加戏，把原版做好",
      "保持简单，我不想太花",
      "核心还是我来定",
      "先收住，别一直发散",
    ],
  },
  social: {
    yes: [
      "帮我救救语气，别把关系弄僵",
      "话要被接得住，感受也要顾到",
      "我希望它能读懂一点空气",
      "真话也要有温柔的出口",
    ],
    neutral: [
      "看对象，重要关系我会在意",
      "修关键句就好，别不像我",
      "稍微润色，自然一点就行",
      "别太用力，分寸刚好最好",
    ],
    no: [
      "我更想直接表达，说清楚最重要",
      "准确就行，语气不是重点",
      "别研究空气，先处理事情",
      "保持原话，这就是我的风格",
    ],
  },
  action: {
    yes: [
      "直接给我下一步，越具体越好",
      "帮我排好，不然我会乱",
      "别让我继续拖，马上开工",
      "拆到很小，小到不能拒绝",
    ],
    neutral: [
      "排个顺序就行，别管太细",
      "轻轻推一下，别突然冲刺",
      "给个起点，后面我自己来",
      "给简易攻略，别剧透太多",
    ],
    no: [
      "先别催，催了我更想躲",
      "我想自由开局，自己找节奏",
      "别塞清单，太满会有压力",
      "让我缓缓，不想被推着走",
    ],
  },
  reflective: {
    yes: [
      "可以看穿一点，但请温柔",
      "帮我复盘，我想看懂模式",
      "继续深问，答案可能在里面",
      "帮我整理内心，把弹窗合并",
    ],
    neutral: [
      "点到为止，别太灵魂拷问",
      "轻轻提醒就好，别太扎心",
      "简单梳理，先不用深潜",
      "看状态，有些时候我愿意",
    ],
    no: [
      "先别扫描我，我想自己消化",
      "先解决事，坑里不谈哲学",
      "别问太深，现在不想打开",
      "回到现实，眼前问题优先",
    ],
  },
};

const contextualChoicePatterns = {
  logic: {
    yes: [
      "是，我会先理清「{focus}」",
      "像我，先看依据再判断「{focus}」",
      "会，我想把「{focus}」拆清楚",
      "认同，「{focus}」需要逻辑支撑",
    ],
    neutral: [
      "看情况，重要时会拆「{focus}」",
      "有点像，够用就不深挖「{focus}」",
      "要分场景，「{focus}」复杂才需要",
      "可以，但别把「{focus}」分析太重",
    ],
    no: [
      "不太像，我会先试「{focus}」",
      "不常这样，「{focus}」能用就行",
      "较少，我更凭感觉处理「{focus}」",
      "不太需要，不想被「{focus}」卡住",
    ],
  },
  creative: {
    yes: [
      "是，我希望「{focus}」有新意",
      "像我，「{focus}」要有火花",
      "会，我想把「{focus}」变有趣",
      "认同，「{focus}」不能太普通",
    ],
    neutral: [
      "看情况，「{focus}」有点灵感就好",
      "有点像，但「{focus}」别跑偏",
      "可以发散，但要收回「{focus}」",
      "偶尔需要，让「{focus}」亮一点",
    ],
    no: [
      "不太像，我想先稳住「{focus}」",
      "不常这样，「{focus}」清楚更重要",
      "较少，不想把「{focus}」弄复杂",
      "不是重点，「{focus}」实用就好",
    ],
  },
  social: {
    yes: [
      "是，我在意「{focus}」的感受",
      "像我，「{focus}」要有分寸",
      "会，我希望「{focus}」被接住",
      "认同，「{focus}」语气很重要",
    ],
    neutral: [
      "看对象，重要时调整「{focus}」",
      "有点像，「{focus}」自然就好",
      "要看关系，「{focus}」不用太细",
      "可以润色，但「{focus}」要像我",
    ],
    no: [
      "不太像，我会直接说「{focus}」",
      "不常这样，「{focus}」准确更重要",
      "较少，不想过度解读「{focus}」",
      "不是重点，先说清「{focus}」",
    ],
  },
  action: {
    yes: [
      "是，我想马上推进「{focus}」",
      "像我，「{focus}」要有下一步",
      "会，把「{focus}」拆小才好做",
      "认同，「{focus}」要能执行",
    ],
    neutral: [
      "看状态，给「{focus}」一个起点",
      "有点像，「{focus}」排顺序就够",
      "可以，但「{focus}」别排太满",
      "要看任务，「{focus}」复杂才需要",
    ],
    no: [
      "不太像，我想自己摸「{focus}」",
      "不常这样，「{focus}」被催有压力",
      "较少，我想按节奏做「{focus}」",
      "不是重点，先想清「{focus}」",
    ],
  },
  reflective: {
    yes: [
      "是，我想看懂「{focus}」",
      "像我，「{focus}」也要理解原因",
      "会，我愿意慢慢拆「{focus}」",
      "认同，「{focus}」背后有模式",
    ],
    neutral: [
      "看状态，「{focus}」点到为止",
      "有点像，但「{focus}」不用深挖",
      "可以聊，但「{focus}」别太重",
      "要看时机，偶尔回看「{focus}」",
    ],
    no: [
      "不太像，先处理「{focus}」",
      "不常这样，「{focus}」别挖太深",
      "较少，我想自己消化「{focus}」",
      "不是重点，先放下「{focus}」",
    ],
  },
};

function getQuestionFocus(text) {
  return text
    .replace(/[，。！？、：；“”]/g, "")
    .replace(/^(看到|有|发|做|问题|信息|情绪|冲突|拒绝|任务|失败后|拖延时)/, "")
    .replace(/(时|前|后)?你(会|能|常|喜欢|希望|需要|愿意|容易|更想|更信|更怕|讨厌|不喜欢|在意|重视|先|主动)?/g, "")
    .replace(/(吗|不太|而不是|是否|自己|别人|AI|答案|建议)/g, "")
    .trim()
    .slice(0, 10) || "这件事";
}

function getQuestionChoices(question, index) {
  const focus = getQuestionFocus(question.text);
  const answerBank = {
    logic: {
      yes: [`会，我需要先看清${focus}`, `是，${focus}要有依据`, `像我，先拆${focus}`],
      neutral: [`看情况，重要时才拆${focus}`, `有点像，${focus}够用就好`, `会参考${focus}，但不想过度分析`],
      no: [`不太像，${focus}我更想先试`, `较少，我会凭直觉处理${focus}`, `${focus}不是重点，我先看方向`],
    },
    creative: {
      yes: [`会，我想让${focus}更有新意`, `像我，${focus}需要火花`, `是，我喜欢打开${focus}的想象`],
      neutral: [`看情况，${focus}有灵感就够`, `${focus}可以发散，但别跑太远`, `偶尔让${focus}有点变化`],
      no: [`不太像，我更想先稳住${focus}`, `较少，${focus}清楚比新奇重要`, `${focus}不是重点，我要实用`],
    },
    social: {
      yes: [`会，我在意${focus}的感受`, `像我，${focus}表达要有分寸`, `是，我会顾到${focus}里的关系`],
      neutral: [`看对象，${focus}重要时会调整`, `有点像，${focus}自然就好`, `会留意${focus}，但不想太用力`],
      no: [`不太像，${focus}我会直接说`, `较少，${focus}准确更重要`, `${focus}不是重点，先说清楚`],
    },
    action: {
      yes: [`会，我需要马上推进${focus}`, `像我，${focus}要能落地`, `是，${focus}的下一步最重要`],
      neutral: [`看状态，${focus}给个起点就好`, `有点像，${focus}别排太满`, `${focus}复杂时才需要这样`],
      no: [`不太像，${focus}我想自己找节奏`, `较少，${focus}被催会有压力`, `${focus}不是重点，我先想清楚`],
    },
    reflective: {
      yes: [`会，我想看懂${focus}`, `像我，${focus}背后的原因很重要`, `是，我会回看${focus}里的模式`],
      neutral: [`看状态，${focus}点到为止`, `有点像，${focus}不用挖太深`, `需要时才慢慢想${focus}`],
      no: [`不太像，我先处理${focus}`, `较少，${focus}我想自己消化`, `${focus}不是重点，先放一放`],
    },
  };

  return ["yes", "neutral", "no"].map((key) => {
    const options = answerBank[question.dimension][key];
    const label = options[(index + question.text.length + key.length) % options.length];
    return { key, label, value: key === "yes" ? 2 : key === "neutral" ? 1 : 0 };
  });
}

function getAnswerLabel(question, index, answerKey) {
  const choices = question.choices || getQuestionChoices(question, index);
  return choices.find((choice) => choice.key === answerKey)?.label || "未作答";
}

const results = {
  logic: {
    title: "AI 策略家",
    rarity: "R",
    image: "/assets/personas/logic.jpg",
    description:
      "你和 AI 的关系像开会时突然有人把白板擦干净，又画出三条清晰路线。你不迷信灵光一闪，更相信证据、结构和可复盘的判断。",
    power: "把一团乱麻整理成三种可选方案。",
    aiRole: "你的 AI 角色：冷静军师。",
    blindSpot: "别把每件事都分析到出报告。有些答案需要先走两步才会出现。",
    share: "我测出了「AI 策略家」：我的 AI 使用方式主打一个有理有据。",
  },
  creative: {
    title: "AI 共创者",
    rarity: "R",
    image: "/assets/personas/creative.jpg",
    description:
      "你不只是让 AI 回答问题，你会把它拉进头脑风暴现场。一个普通想法到你手里，往往会被 AI 加点火花，变成更有画面感的版本。",
    power: "把普通点子加工成有记忆点的作品。",
    aiRole: "你的 AI 角色：灵感搭子。",
    blindSpot: "脑洞开太多时，记得选一个先做出来。灵感不落地，就会在草稿箱里开派对。",
    share: "我测出了「AI 共创者」：AI 像我的灵感搭子，负责把普通想法点亮。",
  },
  social: {
    title: "AI 沟通师",
    rarity: "R",
    image: "/assets/personas/social.jpg",
    description:
      "你用 AI 时很在意一句话背后的温度。你不是怕表达，而是希望真话能被听见，也不把场面弄得太硬。",
    power: "把难说的话调成能被接住的版本。",
    aiRole: "你的 AI 角色：语气调音师。",
    blindSpot: "照顾别人感受很好，但别把自己的边界调成静音。",
    share: "我测出了「AI 沟通师」：说话这件事，我选择带一点分寸感。",
  },
  action: {
    title: "AI 执行官",
    rarity: "R",
    image: "/assets/personas/action.jpg",
    description:
      "你打开 AI 的姿势很明确：少铺垫，给我下一步。对你来说，AI 最好像一个会自动生成任务清单的推进器。",
    power: "把想法压缩成马上能做的第一步。",
    aiRole: "你的 AI 角色：任务推进器。",
    blindSpot: "效率很香，但别把所有问题都做成待办。有些事需要感受，不只需要打勾。",
    share: "我测出了「AI 执行官」：我的 AI 负责把拖延按在地上摩擦。",
  },
  reflective: {
    title: "AI 探索者",
    rarity: "R",
    image: "/assets/personas/reflective.jpg",
    description:
      "你不只想问 AI 怎么办，也想问为什么我总是这样。AI 对你来说像一面会追问的镜子，能把混乱的心事慢慢照清楚。",
    power: "从情绪、选择和反复卡住的地方看见自己。",
    aiRole: "你的 AI 角色：内心镜子。",
    blindSpot: "想清楚很重要，但别在自我探索里无限加载。今天也需要一个小动作。",
    share: "我测出了「AI 探索者」：像被 AI 轻轻照了一下内心。",
  },
};

const hiddenPersonas = [
  {
    title: "提示词炼金术士",
    rarity: "SSR",
    image: "/assets/personas/prompt-alchemist.jpg",
    match: (scores) => scores.logic >= 58 && scores.creative >= 58,
    description:
      "你不是在问 AI，你是在调 AI。别人输入一句话等答案，你像在实验室里配方、控温、看反应，直到普通想法冒出高级气泡。",
    power: "把模糊想法炼成结构、语言和成品方向。",
    aiRole: "你的 AI 角色：灵感实验室助手。",
    blindSpot: "别一直优化提示词优化到天亮。作品不会自己从提示词里走出来。",
    share: "我解锁了隐藏人格「提示词炼金术士」：不是我会用 AI，是我会调 AI。",
  },
  {
    title: "未来导演",
    rarity: "SSR",
    image: "/assets/personas/future-director.jpg",
    match: (scores) => scores.creative >= 58 && scores.action >= 58,
    description:
      "你脑子里常常先出现一个画面，然后开始倒推今天该做什么。AI 在你这里不是工具，是副导演、制片和分镜板。",
    power: "把脑内画面剪成可执行计划。",
    aiRole: "你的 AI 角色：人生项目副导演。",
    blindSpot: "新片场开太多会来不及杀青。给每个计划一个收尾镜头。",
    share: "我解锁了隐藏人格「未来导演」：我的 AI 已经在帮我拉片了。",
  },
  {
    title: "情绪翻译官",
    rarity: "SR",
    image: "/assets/personas/emotion-translator.jpg",
    match: (scores) => scores.social >= 58 && scores.reflective >= 58,
    description:
      "你经常能听见话外音，也能感到空气里的小变化。AI 对你来说像情绪字幕机，专门把没说出口的东西翻译成人话。",
    power: "把说不清的感受翻译成能被理解的话。",
    aiRole: "你的 AI 角色：低噪音倾听者。",
    blindSpot: "别替所有人写内心独白。有些边界需要直接说出来。",
    share: "我解锁了隐藏人格「情绪翻译官」：这个结果多少有点懂我。",
  },
  {
    title: "混乱驯服者",
    rarity: "SR",
    image: "/assets/personas/chaos-tamer.jpg",
    match: (scores) => scores.logic >= 58 && scores.action >= 58,
    description:
      "你最擅长把一团混乱压缩成清单、路径和下一步。AI 在你手里不像聊天工具，更像一个安静但好用的作战面板。",
    power: "把压力、信息和任务压缩成下一步动作。",
    aiRole: "你的 AI 角色：战术参谋。",
    blindSpot: "推进很强，但别把所有问题都当副本刷。有些关系不能只靠流程通关。",
    share: "我解锁了隐藏人格「混乱驯服者」：我的 AI 是作战面板。",
  },
  {
    title: "梦境建筑师",
    rarity: "SSR",
    image: "/assets/personas/dream-architect.jpg",
    match: (scores) => scores.creative >= 58 && scores.reflective >= 58,
    description:
      "你脑子里有很多还没命名的世界。AI 对你来说像一个世界观搭建师，负责把梦里的雾、光和情绪搭成能被看见的房间。",
    power: "把感受、画面和概念搭成可被看见的作品。",
    aiRole: "你的 AI 角色：世界观搭建师。",
    blindSpot: "氛围感很美，但别只停在氛围里。问一句：它现在能被谁看见？",
    share: "我解锁了隐藏人格「梦境建筑师」：我的脑内宇宙开始施工了。",
  },
  {
    title: "沉默指挥官",
    rarity: "SR",
    image: "/assets/personas/silent-commander.jpg",
    match: (scores) => scores.action >= 68 && scores.social <= 35,
    description:
      "你不太迷恋铺垫，也不想在过程里绕圈。你要的是推进、完成、交付。AI 在你这里最好少废话，直接开工。",
    power: "迅速判断优先级，并把事情推过临界点。",
    aiRole: "你的 AI 角色：执行中枢。",
    blindSpot: "目标感很强，但重要关系不是进度条。偶尔也需要一点缓冲区。",
    share: "我解锁了隐藏人格「沉默指挥官」：少说点，先推进。",
  },
  {
    title: "温柔反叛者",
    rarity: "SR",
    image: "/assets/personas/soft-rebel.jpg",
    match: (scores) => scores.social >= 58 && scores.creative >= 58,
    description:
      "你看起来温和，其实很不想被标准答案困住。AI 是你的表达共犯，帮你用不刺人的方式说出不普通的观点。",
    power: "用柔软的方式说出不普通的观点。",
    aiRole: "你的 AI 角色：表达共犯。",
    blindSpot: "照顾感受时，别把锋芒全部收起来。温柔也可以有边界。",
    share: "我解锁了隐藏人格「温柔反叛者」：温和，但不想普通。",
  },
  {
    title: "宇宙观察员",
    rarity: "SSR",
    image: "/assets/personas/cosmic-observer.jpg",
    match: (scores) => scores.reflective >= 68 && scores.logic >= 45,
    description:
      "你不只是想知道答案，你还想知道答案背后的答案。AI 对你来说像一张星图，能陪你从一个问题走到更大的系统里。",
    power: "从普通问题里看见更大的系统和意义。",
    aiRole: "你的 AI 角色：星图观察员。",
    blindSpot: "想太深时，别忘了回到地面。今天也需要一个能完成的小动作。",
    share: "我解锁了隐藏人格「宇宙观察员」：我和 AI 在问题里看星图。",
  },
  {
    title: "数据预言家",
    rarity: "SR",
    image: "/assets/personas/data-oracle.jpg",
    match: (scores) => scores.logic >= 68 && scores.reflective >= 45,
    description:
      "你习惯从证据、模式和细节里预判下一步。AI 在你身边，像一个把迷雾转成概率地图的顾问。",
    power: "从杂乱信息里读出趋势、风险和机会。",
    aiRole: "你的 AI 角色：概率参谋。",
    blindSpot: "别等所有变量都清楚才行动。有些答案不是算出来的，是试出来的。",
    share: "我解锁了隐藏人格「数据预言家」：我的 AI 会把迷雾算成概率。",
  },
  {
    title: "人生游戏设计师",
    rarity: "SSR",
    image: "/assets/personas/life-game-designer.jpg",
    match: (scores) => scores.action >= 58 && scores.reflective >= 58,
    description:
      "你会把成长、目标和任务设计成一关一关的游戏。AI 对你来说既是任务系统，也是升级提示，还会提醒你别忘了领奖励。",
    power: "把长期目标设计成有反馈、有奖励的行动路线。",
    aiRole: "你的 AI 角色：升级系统管理员。",
    blindSpot: "别只追求升级感，也要确认这场游戏真的是你想玩的。",
    share: "我解锁了隐藏人格「人生游戏设计师」：我的人生任务栏亮了。",
  },
  {
    title: "现实黑客",
    rarity: "SSR",
    image: "/assets/personas/reality-hacker.jpg",
    match: (scores) => scores.logic >= 48 && scores.creative >= 48 && scores.action >= 48,
    description:
      "你喜欢把 AI 当成现实世界的外挂接口：找规律、做实验、搭流程，然后用一个小改动撬动一大片结果。",
    power: "用系统思维和快速实验改造现实工作流。",
    aiRole: "你的 AI 角色：模块化外挂。",
    blindSpot: "玩法很多时，先跑通一个真的有收益的。别让生活插件装太多。",
    share: "我解锁了隐藏人格「现实黑客」：像给生活装了一个插件。",
  },
];

const profileStories = {
  "AI 策略家":
    "你像随身带着一张看不见的地图。别人先被问题吓住，你会先找入口、岔路和出口。AI 对你最有用的地方，不是替你拍板，而是把雾气擦开，让判断有路可走。",
  "AI 共创者":
    "你的想法常常不是直线，而是一小片会发光的枝叶。AI 在你身边时，像一盏能调色的灯，把普通句子、普通点子照出新的纹理。",
  "AI 沟通师":
    "你知道一句话不只有意思，还有温度、方向和落点。你用 AI，不是为了把话说得更圆滑，而是让真实表达更容易被听见。",
  "AI 执行官":
    "你最怕想法一直停在脑海里。AI 对你来说像一只干净利落的手，把目标拆开，把第一步推到你面前，让事情开始发生。",
  "AI 探索者":
    "你常常在问题后面看见另一个问题。AI 像一面不会打断你的镜子，帮你把情绪、选择和反复出现的模式慢慢照清楚。",
  "提示词炼金术士":
    "你进入 AI 的方式像进入实验室。你不满足于一个答案，而是会调语气、换角度、加限制，让一次普通提问变成一场精密反应。",
  "未来导演":
    "你先看见画面，再倒推路径。AI 像你的分镜板，把远处的想象切成今天能拍的一场戏。",
  "情绪翻译官":
    "你能听见很多没说出口的东西。AI 像一台低噪音翻译机，把复杂感受翻成能说、能听、也能被理解的话。",
  "混乱驯服者":
    "混乱到你手里，会被压缩成路线、清单和下一步。AI 是你的作战面板，负责把噪音变成可执行信号。",
  "梦境建筑师":
    "你的脑内有很多尚未命名的房间。AI 像建筑师，帮你把感觉、画面和气味搭成一座能被别人走进去的世界。",
  "沉默指挥官":
    "你不爱在原地解释太久。AI 最适合站在你旁边，少说废话，帮你判断优先级，然后把事情推过临界点。",
  "温柔反叛者":
    "你看起来柔和，但内心并不愿意交出自己的独特。AI 是你的表达共犯，帮你把锋芒藏进更好被接住的语言里。",
  "宇宙观察员":
    "你会从一个小问题里看见更大的系统。AI 像星图，陪你把零散的疑问连成线，看见背后的秩序和意义。",
  "数据预言家":
    "你习惯从模式里听见未来的脚步。AI 像概率参谋，把杂乱信息铺开，让风险、机会和趋势慢慢显影。",
  "人生游戏设计师":
    "你会把成长拆成关卡，把目标做成任务栏。AI 是你的升级系统，提醒你领取反馈，也提醒你别忘了为什么出发。",
  "现实黑客":
    "你把生活看成可以调试的系统。AI 是你的插件接口，帮你找规律、搭流程，用小实验撬动真实改变。",
};

const usageTiers = [
  {
    grade: "A",
    title: "高频重度型",
    note: "使用次数多，用量也大。AI 往往已经进入日常工作流，像工具箱、外挂或作战面板。",
    personas: ["现实黑客", "提示词炼金术士", "AI 执行官", "混乱驯服者", "沉默指挥官"],
  },
  {
    grade: "B",
    title: "高频专业型",
    note: "使用频率稳定，用量偏高。通常在分析、创作、项目推进或长期目标里深度调用 AI。",
    personas: ["未来导演", "数据预言家", "人生游戏设计师", "AI 策略家", "AI 共创者"],
  },
  {
    grade: "C",
    title: "场景增强型",
    note: "不是时时都用，但一到表达、关系、作品气质和情绪场景，AI 会明显提升体验。",
    personas: ["AI 沟通师", "情绪翻译官", "温柔反叛者", "梦境建筑师"],
  },
  {
    grade: "D",
    title: "低频深潜型",
    note: "使用次数未必高，但单次使用更深。AI 像镜子、星图或安静的复盘空间。",
    personas: ["AI 探索者", "宇宙观察员"],
  },
];

const usagePersonaNotes = {
  "现实黑客": "用 AI 搭流程、找规律、做实验，用量像给生活装插件。",
  "提示词炼金术士": "高频调参型用户，一次问题常常会迭代很多轮。",
  "AI 执行官": "大量用于清单、计划、拆任务和推进，启动成本明显下降。",
  "混乱驯服者": "信息越乱越会打开 AI，把压力压缩成路径。",
  "沉默指挥官": "不爱闲聊，但会高密度调用 AI 做决策和执行。",
  "未来导演": "常用 AI 做分镜、项目规划和创意落地，用量集中在作品周期。",
  "数据预言家": "习惯用 AI 做分析、趋势、风险和概率判断。",
  "人生游戏设计师": "常用 AI 管目标、复盘和任务系统，适合长期陪跑。",
  "AI 策略家": "稳定使用 AI 做研究、拆解、比较和判断。",
  "AI 共创者": "常用 AI 发散想法、试风格、打磨表达。",
  "AI 沟通师": "多在重要消息、关系沟通和语气调整时调用 AI。",
  "情绪翻译官": "适合用 AI 梳理感受、练习表达和理解关系张力。",
  "温柔反叛者": "用 AI 把独特观点调成更容易被听见的表达。",
  "梦境建筑师": "用 AI 搭世界观、氛围和作品质感，频率不一定高但沉浸感强。",
  "AI 探索者": "更多在复盘、日记、自我提问时使用，少而深。",
  "宇宙观察员": "用 AI 陪自己想深问题，像低频打开的星图。",
};

const basisBank = {
  logic: "你更常用证据、结构和边界感处理问题。",
  creative: "你更常用联想、风格和开放视角打开问题。",
  social: "你更常关注关系感受、表达分寸和他人立场。",
  action: "你更常把想法转成步骤、顺序和可执行动作。",
  reflective: "你更常回看动机、情绪和长期模式。",
};

const stageList = [
  { title: "第 1 章 · 迷雾整理", reward: "获得一枚清晰碎片" },
  { title: "第 2 章 · 灵感点火", reward: "获得一枚灵感火花" },
  { title: "第 3 章 · 语气调频", reward: "获得一枚分寸徽记" },
  { title: "第 4 章 · 行动启动", reward: "获得一枚行动齿轮" },
  { title: "第 5 章 · 内心复盘", reward: "获得一枚镜面碎片" },
];

const feedbackBank = {
  logic: {
    yes: "清晰度上升，混乱开始排队。",
    neutral: "抓住了重点，不必展开成报告。",
    no: "直觉路线开启，先走两步再看。",
  },
  creative: {
    yes: "灵感点亮，画面多了一层颜色。",
    neutral: "火花刚好，仍然留在地面。",
    no: "收束成功，原想法被稳稳托住。",
  },
  social: {
    yes: "语气变软，表达仍然站得住。",
    neutral: "分寸上线，关键处会多看一眼。",
    no: "直球路线开启，先把意思说清。",
  },
  action: {
    yes: "行动条推进，第一步已经出现。",
    neutral: "节奏稳定，起点已经够用。",
    no: "自由路线保留，先不被清单接管。",
  },
  reflective: {
    yes: "镜面变亮，卡点开始显影。",
    neutral: "轻度复盘，点到为止刚刚好。",
    no: "现实任务优先，先把眼前事处理掉。",
  },
};

const fishmanLines = [
  "Balabla! 我的鱼鳞被你的选择刮到了！",
  "Bala... blaaa! 这题你居然真会选！",
  "Blubla-balala! 鱼人防线裂开一小块！",
  "Balabala! 不许用这么清醒的答案打我！",
  "Blaaa! 我刚搭好的水草逻辑塌了！",
  "Balabla噜！这一下有点会心！",
  "Bala? Bala! 鱼人开始怀疑人生水域！",
  "Blabla咕噜！你的 AI 能量太直了！",
  "Balabala! 我的小怪血条在认真下降！",
  "Bla-bla-bla! 这不是普通回答，这是技能！",
  "Balalaa! 鱼人退后半步但嘴还硬！",
  "Blub blub! 我听见血条在冒泡！",
  "Balabla! 这题命中我的软鳍了！",
  "Bala咕噜! 鱼人装作没事但 HP 不同意！",
  "Blaaaala! 你选择得太像主角了！",
  "Balabla! 我被你的判断拍到浅水区！",
  "咕噜balabla! 这一下扣得很有礼貌！",
  "Bala-bala! 鱼人申请暂停三秒！",
  "Blabla! 我的反派台词还没说完！",
  "Balabla噜！下一关我一定更凶一点点！",
  "Bla! 你这一击叫做认真回答吗？",
  "Balabala! 鱼人被迫尊重你的选择！",
  "咕噜咕噜balabla! 血条开始讲道理了！",
  "Bala! 我只是路过，为什么被测评打中！",
];

const fishmanEggs = [
  { rarity: "稀有", text: "鱼人掉落：一枚湿漉漉的提示词碎片。Balabla... 它说要写清目标。" },
  { rarity: "稀有", text: "鱼人突然认真：你的答案里有一种稳定的判断力。" },
  { rarity: "稀有", text: "鱼人掉落：水草便签。上面写着：先问好问题，再要好答案。" },
  { rarity: "稀有", text: "鱼人小声嘀咕：这不像测试，像你在给自己开地图。" },
  { rarity: "史诗", text: "鱼人暴击台词：Balabla! 你刚刚打中了我的认知盲区！" },
  { rarity: "史诗", text: "鱼人掉落：发光贝壳。它能把普通想法照出第二层意思。" },
  { rarity: "史诗", text: "鱼人低头看血条：原来认真回答也算一种魔法。" },
  { rarity: "传说", text: "隐藏彩蛋：鱼人递给你一张皱巴巴的纸，上面写着：你不是在找 AI，你是在找更顺手的自己。" },
  { rarity: "传说", text: "鱼人停止 balabla 三秒：这次回答，很像一个真正的选择。" },
];

let currentIndex = 0;
let answers = Array(questions.length).fill(null);
let pulsePoints = Array(questions.length).fill(0);

const intro = document.querySelector("#intro");
const quiz = document.querySelector("#quiz");
const result = document.querySelector("#result");
const startButton = document.querySelector("#startButton");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const restartButton = document.querySelector("#restartButton");
const questionCounter = document.querySelector("#questionCounter");
const questionText = document.querySelector("#questionText");
const choiceGrid = document.querySelector("#choiceGrid");
const progressBar = document.querySelector("#progressBar");
const pulseScore = document.querySelector("#pulseScore");
const quizTimer = document.querySelector("#quizTimer");
const answerFeedback = document.querySelector("#answerFeedback");
const resultTitle = document.querySelector("#resultTitle");
const resultDescription = document.querySelector("#resultDescription");
const resultImage = document.querySelector("#resultImage");
const resultMeta = document.querySelector("#resultMeta");
const insightGrid = document.querySelector("#insightGrid");
const scoreList = document.querySelector("#scoreList");
const shareButton = document.querySelector("#shareButton");
const saveResultButton = document.querySelector("#saveResultButton");
const rankingGrid = document.querySelector("#rankingGrid");
const personaAtlas = document.querySelector("#personaAtlas");
const personaDetail = document.querySelector("#personaDetail");
const scoreBurstLayer = document.querySelector("#scoreBurstLayer");
const modePicker = document.querySelector("#modePicker");
const usageTierGrid = document.querySelector("#usageTierGrid");
const answerHistoryMeta = document.querySelector("#answerHistoryMeta");
const answerHistoryList = document.querySelector("#answerHistoryList");
const statsSummary = document.querySelector("#statsSummary");
const statsTree = document.querySelector("#statsTree");
const statsNotice = document.querySelector("#statsNotice");

let latestResult = null;
let quizStartedAt = null;
let quizFinishedAt = null;
let quizTimerId = null;
const MIN_STATS_DURATION_MS = 33000;

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getElapsedTime() {
  if (!quizStartedAt) return 0;
  return (quizFinishedAt || Date.now()) - quizStartedAt;
}

function updateQuizTimer() {
  if (!quizTimer) return;
  quizTimer.textContent = `用时 ${formatDuration(getElapsedTime())}`;
}

function startQuizTimer() {
  quizStartedAt = Date.now();
  quizFinishedAt = null;
  clearInterval(quizTimerId);
  updateQuizTimer();
  quizTimerId = setInterval(updateQuizTimer, 1000);
}

function stopQuizTimer() {
  if (!quizStartedAt) return 0;
  quizFinishedAt = Date.now();
  clearInterval(quizTimerId);
  quizTimerId = null;
  updateQuizTimer();
  return quizFinishedAt - quizStartedAt;
}

function getPersonaCatalog() {
  const base = Object.entries(results).map(([id, profile]) => ({
    id,
    kind: "基础人格",
    dimension: id,
    ...profile,
  }));
  const hidden = hiddenPersonas.map((profile) => ({
    id: profile.title,
    kind: "隐藏人格",
    dimension: "hidden",
    ...profile,
  }));

  return [...base, ...hidden];
}

function getPersonaByTitle(title) {
  return getPersonaCatalog().find((profile) => profile.title === title);
}

function getPulsePoints(choiceKey, questionIndex) {
  const base = { yes: 9, neutral: 6, no: 4 }[choiceKey];
  return base + (questionIndex % 3);
}

function getStage(questionIndex = currentIndex) {
  return stageList[Math.floor(questionIndex / 3)] || stageList[stageList.length - 1];
}

function getStageRewardText(questionIndex = currentIndex) {
  const stage = getStage(questionIndex);
  return (questionIndex + 1) % 3 === 0 ? stage.reward : "关卡已记录";
}

function createScoreBurst(points) {
  const burstHost = scoreBurstLayer;
  if (!burstHost) return;
  const burst = document.createElement("div");
  burst.className = "score-burst";
  burst.textContent = `+${points}`;
  burstHost.appendChild(burst);
  setTimeout(() => burst.remove(), 760);
}

function updatePulseScore() {
  const total = pulsePoints.reduce((sum, value) => sum + value, 0);
  const answeredCount = answers.filter(Boolean).length;
  const stage = getStage(Math.min(answeredCount, questions.length - 1));
  pulseScore.textContent = `能量 ${total} · ${stage.title}`;
}

function resetQuizState() {
  questions = createQuestionSet();
  currentIndex = 0;
  answers = Array(questions.length).fill(null);
  pulsePoints = Array(questions.length).fill(0);
}

function commitCurrentAnswer() {
  const answerKey = answers[currentIndex];
  if (!answerKey) return null;

  const points = getPulsePoints(answerKey, currentIndex);

  pulsePoints[currentIndex] = points;
  createScoreBurst(points);
  return { points };
}

function renderQuestion() {
  const question = questions[currentIndex];
  const selected = answers[currentIndex];

  const stage = getStage();
  questionCounter.textContent = `第 ${currentIndex + 1} 关 / 共 ${questions.length} 关`;
  questionText.textContent = question.text;
  progressBar.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  updatePulseScore();

  choiceGrid.innerHTML = "";
  const choices = question.choices || getQuestionChoices(question, currentIndex);
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.className = `choice-button${selected === choice.key ? " selected" : ""}`;
    button.type = "button";
    button.textContent = choice.label;
    button.addEventListener("click", () => {
      answers[currentIndex] = choice.key;
      pulsePoints[currentIndex] = 0;
      renderQuestion();
    });
    choiceGrid.appendChild(button);
  });

  if (selected === null) {
    answerFeedback.classList.add("hidden");
    answerFeedback.innerHTML = "";
  } else {
    answerFeedback.classList.add("hidden");
    answerFeedback.innerHTML = "";
  }

  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = selected === null;
  nextButton.textContent = currentIndex === questions.length - 1 ? "查看结果" : "进入下一关";
}

function calculateScores() {
  const scores = Object.fromEntries(Object.keys(dimensions).map((key) => [key, 0]));

  answers.forEach((answerKey, index) => {
    const question = questions[index];
    const intensity = responseIntensity[answerKey] ?? 0;
    const weights = scoringWeights[question.dimension] || { [question.dimension]: 1 };

    Object.entries(weights).forEach(([dimension, weight]) => {
      scores[dimension] += intensity * weight;
    });
  });

  return scores;
}

function getMaxScores() {
  return questions.reduce((maxScores, question) => {
    const weights = scoringWeights[question.dimension] || { [question.dimension]: 1 };
    Object.entries(weights).forEach(([dimension, weight]) => {
      maxScores[dimension] += weight;
    });
    return maxScores;
  }, Object.fromEntries(Object.keys(dimensions).map((key) => [key, 0])));
}

function getScorePercents(scores) {
  const maxScores = getMaxScores();
  return Object.fromEntries(
    Object.entries(scores).map(([key, value]) => [
      key,
      maxScores[key] ? Math.round((value / maxScores[key]) * 100) : 0,
    ]),
  );
}

function findTopDimension(scores) {
  const percentScores = getScorePercents(scores);
  return Object.entries(percentScores).sort((a, b) => b[1] - a[1])[0][0];
}

function findHiddenPersona(scores) {
  const percentScores = getScorePercents(scores);
  return hiddenPersonas.find((persona) => persona.match(percentScores));
}

function getBeatPercent(scores, hasHiddenPersona) {
  const percentScores = getScorePercents(scores);
  const total = Object.values(percentScores).reduce((sum, value) => sum + value, 0) / 5;
  const spread = Math.max(...Object.values(percentScores)) - Math.min(...Object.values(percentScores));
  const pulseTotal = pulsePoints.reduce((sum, value) => sum + value, 0);
  const percent = 42 + total * 0.38 + spread * 0.18 + Math.floor(pulseTotal / 60) + (hasHiddenPersona ? 8 : 0);
  return Math.min(98, percent);
}

function normalize(value, max) {
  return Math.round(Math.max(0, Math.min(100, (value / max) * 100)));
}

function getTemperament(scores) {
  const percentScores = getScorePercents(scores);
  const rational = (percentScores.logic + percentScores.action) / 2;
  const emotional = (percentScores.social + percentScores.creative) / 2;
  const neutral = Math.max(0, 100 - Math.abs(rational - emotional) + percentScores.reflective * 0.2);
  const rows = [
    { label: "理性", value: Math.round(rational) },
    { label: "感性", value: Math.round(emotional) },
    { label: "平衡", value: Math.min(100, Math.round(neutral)) },
  ].sort((a, b) => b.value - a.value);

  return rows;
}

function buildRankingData(scores) {
  const percentScores = getScorePercents(scores);
  const psychRows = [
    { label: "认知结构感", value: Math.round(percentScores.logic * 0.72 + percentScores.reflective * 0.28) },
    { label: "开放想象力", value: Math.round(percentScores.creative * 0.76 + percentScores.reflective * 0.24) },
    { label: "情绪觉察度", value: Math.round(percentScores.social * 0.7 + percentScores.reflective * 0.3) },
    { label: "目标控制感", value: Math.round(percentScores.action * 0.72 + percentScores.logic * 0.28) },
  ];

  const socioRows = [
    { label: "关系协调力", value: Math.round(percentScores.social * 0.76 + percentScores.reflective * 0.24) },
    { label: "创意传播力", value: Math.round(percentScores.creative * 0.68 + percentScores.social * 0.32) },
    { label: "组织影响力", value: Math.round(percentScores.logic * 0.46 + percentScores.action * 0.54) },
    { label: "边界表达力", value: Math.round(percentScores.social * 0.56 + percentScores.action * 0.28 + percentScores.logic * 0.16) },
  ];

  const behaviorRows = [
    { label: "启动速度", value: Math.round(percentScores.action * 0.8 + getBeatPercent(scores, false) * 0.2) },
    { label: "试错倾向", value: Math.round(percentScores.creative * 0.55 + percentScores.action * 0.45) },
    { label: "复盘深度", value: Math.round(percentScores.reflective * 0.68 + percentScores.logic * 0.32) },
    { label: "反馈敏感度", value: Math.round(percentScores.social * 0.66 + percentScores.creative * 0.34) },
  ];

  return [
    {
      title: "心理学倾向榜",
      note: "参考认知风格、开放性、情绪觉察和自我调节，判断你如何处理信息。",
      rows: psychRows,
      temperament: getTemperament(scores),
    },
    {
      title: "社会学协作榜",
      note: "参考关系互动、群体沟通、角色边界和影响方式，判断你如何与人协作。",
      rows: socioRows,
    },
    {
      title: "行为学行动榜",
      note: "参考启动、反馈、试错和复盘行为，判断你如何从想法进入行动。",
      rows: behaviorRows,
    },
  ];
}

function renderRankings(scores) {
  rankingGrid.innerHTML = buildRankingData(scores)
    .map((ranking) => {
      const rows = ranking.rows
        .sort((a, b) => b.value - a.value)
        .map(
          (row, index) => `
            <div class="rank-row">
              <div class="rank-num">${index + 1}</div>
              <div class="rank-label">${row.label}</div>
              <div class="rank-score">${row.value}</div>
              <div class="rank-bar"><div class="rank-fill" style="width: ${row.value}%"></div></div>
            </div>
          `,
        )
        .join("");

      const temperament = ranking.temperament
        ? `
          <div class="temperament-strip">
            ${ranking.temperament
              .map(
                (item) => `
                  <div class="temperament-pill">
                    <strong>${item.label}</strong>
                    <span>${item.value}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
        `
        : "";

      return `
        <article class="ranking-card">
          <h4 class="ranking-title">${ranking.title}</h4>
          <p class="ranking-note">${ranking.note}</p>
          ${rows}
          ${temperament}
        </article>
      `;
    })
    .join("");
}

function renderPersonaDetail(profile) {
  personaDetail.innerHTML = `
    <img src="${profile.image}" alt="${profile.title}" />
    <div>
      <h4>${profile.title} · ${profile.rarity}</h4>
      <p>${profileStories[profile.title] || profile.description}</p>
    </div>
  `;
}

function renderPersonaAtlas(activeTitle) {
  const catalog = getPersonaCatalog();
  personaAtlas.innerHTML = catalog
    .map(
      (profile) => `
        <button class="persona-card${profile.title === activeTitle ? " active" : ""}" type="button" data-title="${profile.title}">
          <img src="${profile.image}" alt="${profile.title}" />
          <strong>${profile.title}</strong>
          <span>${profile.kind} · ${profile.rarity}</span>
        </button>
      `,
    )
    .join("");

  personaAtlas.querySelectorAll(".persona-card").forEach((card) => {
    card.addEventListener("click", () => {
      const profile = catalog.find((item) => item.title === card.dataset.title);
      personaAtlas.querySelectorAll(".persona-card").forEach((item) => item.classList.remove("active"));
      card.classList.add("active");
      renderPersonaDetail(profile);
    });
  });

  renderPersonaDetail(catalog.find((item) => item.title === activeTitle) || catalog[0]);
}

function renderUsageTiers(activeTitle) {
  if (!usageTierGrid) return;

  usageTierGrid.innerHTML = usageTiers
    .map(
      (tier) => `
        <article class="usage-tier-card">
          <div class="usage-tier-head">
            <strong>${tier.grade}</strong>
            <div>
              <h4>${tier.title}</h4>
              <p>${tier.note}</p>
            </div>
          </div>
          <div class="usage-persona-list">
            ${tier.personas
              .map(
                (name, index) => `
                  <div class="usage-persona${name === activeTitle ? " current" : ""}">
                    <img class="usage-persona-avatar" src="${getPersonaByTitle(name)?.image || "/assets/personas/prompt-alchemist.jpg"}" alt="${name}" />
                    <div>
                      <span>${tier.grade}${index + 1}</span>
                      <strong>${name}${name === activeTitle ? " · 你的结果" : ""}</strong>
                      <p>${usagePersonaNotes[name]}</p>
                    </div>
                  </div>
                `,
              )
              .join("")}
          </div>
        </article>
      `,
    )
    .join("");
}

function renderInsights(profile, scores, topDimension, isHidden, durationText, isStatsEligible) {
  const beatPercent = getBeatPercent(scores, isHidden);
  resultMeta.innerHTML = `
    <span class="meta-pill">稀有度 ${profile.rarity}</span>
    <span class="meta-pill">匹配强度 ${beatPercent}%</span>
    <span class="meta-pill">${dimensions[topDimension]}</span>
    <span class="meta-pill">用时 ${durationText}</span>
  `;

  const insightCards = [
    ["判断依据", basisBank[topDimension]],
    ["你的拿手戏", profile.power],
    ["AI 站位", profile.aiRole.replace("你的 AI 角色：", "").replace("。", "")],
    ["提醒", profile.blindSpot],
  ];

  insightGrid.innerHTML = `
    <article class="insight-card story-toggle">
      <details>
        <summary>点开查看人格故事</summary>
        <p>${profileStories[profile.title]}</p>
      </details>
    </article>
    ${insightCards
    .map(
      ([label, text]) => `
        <article class="insight-card">
          <p class="insight-label">${label}</p>
          <p>${text}</p>
        </article>
      `,
    )
    .join("")}
  `;

  shareButton.dataset.shareText = `我测出了「${profile.title}」：${profile.share}`;
  return { beatPercent, insightCards };
}

function renderAnswerHistory(durationText) {
  if (!answerHistoryMeta || !answerHistoryList) return;

  answerHistoryMeta.innerHTML = `
    <span class="meta-pill">总用时 ${durationText}</span>
    <span class="meta-pill">完成 ${answers.filter(Boolean).length} / ${questions.length} 题</span>
  `;

  answerHistoryList.innerHTML = questions
    .map((question, index) => {
      const answerKey = answers[index];
      return `
        <article class="answer-history-item">
          <div class="answer-history-index">${index + 1}</div>
          <div>
            <p class="answer-history-question">${question.text}</p>
            <p class="answer-history-answer">你的回答：${getAnswerLabel(question, index, answerKey)}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStatsTree(stats, currentTitle, recorded) {
  if (!statsSummary || !statsTree || !statsNotice) return;

  const total = stats?.total || 0;
  const personas = stats?.personas || [];
  statsSummary.innerHTML = `
    <span class="meta-pill">有效样本 ${total}</span>
    <span class="meta-pill">统计门槛 33 秒</span>
  `;

  if (!personas.length) {
    statsTree.innerHTML = `
      <div class="stats-empty">还没有可计入统计的结果。完整答完且用时不少于 33 秒后，会出现在这里。</div>
    `;
  } else {
    statsTree.innerHTML = `
      <div class="stats-root">本站人格统计</div>
      ${personas
        .map(
          (item) => `
            <div class="stats-branch${item.title === currentTitle ? " current" : ""}">
              <img class="stats-avatar" src="${getPersonaByTitle(item.title)?.image || "/assets/personas/prompt-alchemist.jpg"}" alt="${item.title}" />
              <div class="stats-node">
                <strong>${item.title}</strong>
                <span>${item.kind} · ${item.count} 人 · ${item.percent}%</span>
              </div>
              <div class="stats-bar" aria-hidden="true">
                <div class="stats-fill" style="width: ${Math.max(item.percent, 3)}%"></div>
              </div>
            </div>
          `,
        )
        .join("")}
    `;
  }

  statsNotice.textContent = recorded
    ? "本次结果已计入本站统计。"
    : "本次用时少于 33 秒，已在结果中标出，但不会计入本站统计。";
}

async function loadStats(currentTitle, recorded = false) {
  if (!statsSummary || !statsTree || !statsNotice) return;
  statsSummary.innerHTML = `<span class="meta-pill">统计加载中</span>`;
  statsTree.innerHTML = "";
  statsNotice.textContent = "";

  try {
    const response = await fetch("/api/stats", { cache: "no-store" });
    if (!response.ok) throw new Error("Stats request failed");
    renderStatsTree(await response.json(), currentTitle, recorded);
  } catch (error) {
    console.error(error);
    statsSummary.innerHTML = `<span class="meta-pill">统计暂不可用</span>`;
    statsTree.innerHTML = `<div class="stats-empty">统计服务暂时没有响应，请稍后再看。</div>`;
    statsNotice.textContent = "";
  }
}

async function submitStats(resultData) {
  if (!resultData) return;

  if (resultData.durationMs < MIN_STATS_DURATION_MS) {
    await loadStats(resultData.profile.title, false);
    return;
  }

  try {
    const response = await fetch("/api/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personaTitle: resultData.profile.title,
        kind: resultData.isHidden ? "隐藏人格" : "基础人格",
        durationMs: resultData.durationMs,
      }),
    });
    if (!response.ok) throw new Error("Stats submit failed");
    const payload = await response.json();
    renderStatsTree(payload.stats, resultData.profile.title, payload.recorded);
  } catch (error) {
    console.error(error);
    await loadStats(resultData.profile.title, false);
  }
}

function showResult() {
  const durationMs = stopQuizTimer();
  const durationText = formatDuration(durationMs);
  const isStatsEligible = durationMs >= MIN_STATS_DURATION_MS;
  const scores = calculateScores();
  const topDimension = findTopDimension(scores);
  const percentScores = getScorePercents(scores);
  const hiddenPersona = findHiddenPersona(scores);
  const profile = hiddenPersona || results[topDimension];

  quiz.classList.add("hidden");
  result.classList.remove("hidden");
  resultTitle.textContent = hiddenPersona ? `解锁隐藏人格：${profile.title}` : profile.title;
  resultDescription.textContent = profile.description;
  resultImage.src = profile.image;
  resultImage.alt = profile.title;
  const insightData = renderInsights(profile, scores, topDimension, Boolean(hiddenPersona), durationText, isStatsEligible);
  renderRankings(scores);
  renderUsageTiers(profile.title);
  renderPersonaAtlas(profile.title);
  renderAnswerHistory(durationText);
  latestResult = {
    profile,
    scores,
    percentScores,
    topDimension,
    isHidden: Boolean(hiddenPersona),
    beatPercent: insightData.beatPercent,
    insightCards: insightData.insightCards,
    displayTitle: hiddenPersona ? `解锁隐藏人格：${profile.title}` : profile.title,
    durationMs,
    durationText,
    isStatsEligible,
  };
  submitStats(latestResult);

  scoreList.innerHTML = "";
  Object.entries(percentScores)
    .sort((a, b) => b[1] - a[1])
    .forEach(([key, value]) => {
      const row = document.createElement("div");
      row.className = "score-row";
      row.innerHTML = `
        <div class="score-name">${dimensions[key]}</div>
        <div class="score-track"><div class="score-fill" style="width: ${value}%"></div></div>
        <div class="score-value">${value}</div>
      `;
      scoreList.appendChild(row);
    });
}

startButton.addEventListener("click", () => {
  resetQuizState();
  startQuizTimer();
  intro.classList.add("hidden");
  quiz.classList.remove("hidden");
  renderQuestion();
});

modePicker.querySelectorAll(".mode-card").forEach((card) => {
  card.addEventListener("click", () => {
    selectedQuestionCount = Number(card.dataset.count);
    modePicker.querySelectorAll(".mode-card").forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
  });
});

prevButton.addEventListener("click", () => {
  currentIndex = Math.max(0, currentIndex - 1);
  renderQuestion();
});

nextButton.addEventListener("click", () => {
  commitCurrentAnswer();

  if (currentIndex === questions.length - 1) {
    showResult();
    return;
  }

  currentIndex += 1;
  renderQuestion();
});

restartButton.addEventListener("click", () => {
  resetQuizState();
  clearInterval(quizTimerId);
  quizTimerId = null;
  quizStartedAt = null;
  quizFinishedAt = null;
  updateQuizTimer();
  latestResult = null;
  result.classList.add("hidden");
  intro.classList.remove("hidden");
});

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const chars = [...text];
  const lines = [];
  let line = "";

  chars.forEach((char) => {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = testLine;
    }
  });
  if (line) lines.push(line);

  const visibleLines = lines.slice(0, maxLines);
  visibleLines.forEach((visibleLine, index) => {
    const content = index === maxLines - 1 && lines.length > maxLines ? `${visibleLine.slice(0, -2)}...` : visibleLine;
    ctx.fillText(content, x, y + index * lineHeight);
  });

  return visibleLines.length * lineHeight;
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function downloadCanvas(canvas, filename) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas export failed"));
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        resolve();
      }, "image/png");
    } catch (error) {
      reject(error);
    }
  });
}

let personaImageDataPromise;

function loadPersonaImageData() {
  if (window.PERSONA_IMAGE_DATA) {
    return Promise.resolve(window.PERSONA_IMAGE_DATA);
  }

  if (!personaImageDataPromise) {
    personaImageDataPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/assets/personas/persona-image-data.js";
      script.async = true;
      script.onload = () => resolve(window.PERSONA_IMAGE_DATA || {});
      script.onerror = () => reject(new Error("Persona image data failed to load"));
      document.head.appendChild(script);
    });
  }

  return personaImageDataPromise;
}

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = window.PERSONA_IMAGE_DATA?.[src] || src;
  });
}

function drawCoverImage(ctx, image, x, y, width, height) {
  const ratio = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawResultBadge(ctx, x, y, size, profile, topDimension) {
  drawRoundRect(ctx, x, y, size, size, 24);
  ctx.fillStyle = "#fffdf9";
  ctx.fill();
  ctx.strokeStyle = "rgba(222, 211, 197, 0.96)";
  ctx.lineWidth = 3;
  ctx.stroke();

  const colors = {
    logic: ["#315e9f", "#0f7b70"],
    creative: ["#d1663f", "#315e9f"],
    social: ["#0f7b70", "#d1663f"],
    action: ["#2a231d", "#d1663f"],
    reflective: ["#725f52", "#315e9f"],
    hidden: ["#0f7b70", "#d1663f"],
  };
  const [main, accent] = colors[topDimension] || colors.hidden;

  ctx.save();
  drawRoundRect(ctx, x + 34, y + 34, size - 68, size - 68, 22);
  ctx.clip();
  ctx.fillStyle = "rgba(15, 123, 112, 0.08)";
  ctx.fillRect(x + 34, y + 34, size - 68, size - 68);

  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.moveTo(x + 92, y + 245);
  ctx.lineTo(x + 178, y + 82);
  ctx.lineTo(x + 268, y + 245);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + 180, y + 150, 58, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fffdf9";
  ctx.font = "900 74px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(profile.title.slice(0, 2), x + size / 2, y + 156);

  ctx.strokeStyle = "rgba(42, 35, 29, 0.18)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x + 98, y + 260);
  ctx.lineTo(x + 262, y + 260);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#2a231d";
  ctx.font = "900 28px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.fillText(profile.title, x + size / 2, y + size - 42);
  ctx.fillStyle = "#725f52";
  ctx.font = "800 20px 'Microsoft YaHei', 'PingFang SC', sans-serif";
  ctx.fillText("人格结果徽章", x + size / 2, y + size - 16);
  ctx.textAlign = "start";
}

function drawPersonaPortrait(ctx, x, y, size, image) {
  drawRoundRect(ctx, x, y, size, size, 28);
  ctx.save();
  ctx.clip();
  drawCoverImage(ctx, image, x, y, size, size);
  ctx.restore();
  ctx.strokeStyle = "rgba(222, 211, 197, 0.96)";
  ctx.lineWidth = 4;
  ctx.stroke();
}

async function saveResultImage() {
  if (!latestResult || !saveResultButton) return;

  const { profile, percentScores, topDimension, beatPercent, displayTitle, insightCards, durationText } = latestResult;
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  const orderedScores = Object.entries(percentScores).sort((a, b) => b[1] - a[1]);

  saveResultButton.disabled = true;
  saveResultButton.textContent = "生成中...";

  try {
    await loadPersonaImageData();
    const avatar = await loadCanvasImage(profile.image);

    ctx.fillStyle = "#fbf7f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(15, 123, 112, 0.08)";
    drawRoundRect(ctx, 54, 54, 972, 1812, 30);
    ctx.fill();
    ctx.strokeStyle = "rgba(49, 94, 159, 0.16)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#0f7b70";
    ctx.font = "700 30px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText("AI Collaboration Test", 96, 122);

    drawPersonaPortrait(ctx, 96, 166, 352, avatar);

    ctx.fillStyle = "#2a231d";
    ctx.font = "900 58px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    wrapCanvasText(ctx, displayTitle, 486, 238, 440, 70, 2);

    ctx.fillStyle = "#725f52";
    ctx.font = "500 30px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    wrapCanvasText(ctx, profile.description, 486, 390, 440, 44, 4);

    const pills = [`稀有度 ${profile.rarity}`, `匹配强度 ${beatPercent}%`, dimensions[topDimension]];
    let pillX = 96;
    let pillY = 568;
    ctx.font = "800 24px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    pills.forEach((pill) => {
      const width = ctx.measureText(pill).width + 42;
      drawRoundRect(ctx, pillX, pillY, width, 52, 26);
      ctx.fillStyle = "rgba(15, 123, 112, 0.12)";
      ctx.fill();
      ctx.fillStyle = "#0f7b70";
      ctx.fillText(pill, pillX + 21, pillY + 34);
      pillX += width + 14;
      if (pillX > 760) {
        pillX = 96;
        pillY += 66;
      }
    });

    const coreInsights = [
      ["你的拿手戏", profile.power],
      ["AI 最佳站位", profile.aiRole],
      ["小心翻车点", profile.blindSpot],
      ["判断依据", insightCards[0][1]],
    ];

    coreInsights.forEach(([label, text], index) => {
      const x = 96;
      const y = 700 + index * 170;
      drawRoundRect(ctx, x, y, 888, 134, 16);
      ctx.fillStyle = "rgba(255, 255, 255, 0.64)";
      ctx.fill();
      ctx.strokeStyle = "rgba(222, 211, 197, 0.92)";
      ctx.stroke();
      ctx.fillStyle = "#d1663f";
      ctx.font = "900 24px 'Microsoft YaHei', 'PingFang SC', sans-serif";
      ctx.fillText(label, x + 28, y + 42);
      ctx.fillStyle = "#2a231d";
      ctx.font = "700 27px 'Microsoft YaHei', 'PingFang SC', sans-serif";
      wrapCanvasText(ctx, text, x + 28, y + 88, 820, 36, 2);
    });

    ctx.fillStyle = "#2a231d";
    ctx.font = "900 34px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText("五维得分", 96, 1430);

    orderedScores.forEach(([key, value], index) => {
      const y = 1490 + index * 66;
      ctx.fillStyle = "#725f52";
      ctx.font = "800 26px 'Microsoft YaHei', 'PingFang SC', sans-serif";
      ctx.fillText(dimensions[key], 96, y);
      drawRoundRect(ctx, 294, y - 22, 560, 18, 9);
      ctx.fillStyle = "rgba(49, 94, 159, 0.12)";
      ctx.fill();
      drawRoundRect(ctx, 294, y - 22, 560 * (value / 100), 18, 9);
      ctx.fillStyle = key === topDimension ? "#d1663f" : "#0f7b70";
      ctx.fill();
      ctx.fillStyle = "#2a231d";
      ctx.font = "900 25px 'Microsoft YaHei', 'PingFang SC', sans-serif";
      ctx.fillText(String(value), 890, y);
    });

    ctx.fillStyle = "#725f52";
    ctx.font = "700 24px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText(`生成自 AI 协作人格测试 · 用时 ${durationText} · 9:16 结果图`, 96, 1810);

    const filename = `AI人格测试-${profile.title}.png`.replace(/[\\/:*?"<>|]/g, "");
    await downloadCanvas(canvas, filename);
    saveResultButton.textContent = "已保存";
  } catch (error) {
    console.error(error);
    saveResultButton.textContent = "保存失败";
  } finally {
    setTimeout(() => {
      saveResultButton.disabled = false;
      saveResultButton.textContent = "保存结果图";
    }, 1400);
  }
}

saveResultButton?.addEventListener("click", saveResultImage);

shareButton.addEventListener("click", async () => {
  const text = shareButton.dataset.shareText || "我刚测完 AI 协作人格测试。";

  try {
    await navigator.clipboard.writeText(text);
    shareButton.textContent = "已复制";
    setTimeout(() => {
      shareButton.textContent = "复制结果";
    }, 1400);
  } catch {
    shareButton.textContent = "复制失败";
    setTimeout(() => {
      shareButton.textContent = "复制结果";
    }, 1400);
  }
});
