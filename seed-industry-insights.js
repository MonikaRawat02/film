require('dotenv').config();
const mongoose = require('mongoose');

const IndustryInsightSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      unique: true,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    readTime: {
      type: String,
      default: "5 min read"
    },
    icon: {
      type: String,
      default: "AlertCircle"
    },
    content: {
      type: [
        {
          heading: String,
          content: String
        }
      ],
      default: []
    },
    faqs: {
      type: [
        {
          question: String,
          answer: String
        }
      ],
      default: []
    },
    relatedTopics: {
      type: [String],
      default: []
    },
    publishedAt: {
      type: Date,
      default: Date.now
    },
    author: {
      type: String,
      default: "FilmyFire Intelligence"
    }
  },
  { timestamps: true }
);

const IndustryInsight = mongoose.models.IndustryInsight || mongoose.model('IndustryInsight', IndustryInsightSchema);

const insights = [
  {
    slug: "why-big-bollywood-films-fail",
    category: "Industry Analysis",
    title: "Why Big Bollywood Films Fail",
    description: "Analysis of star-studded projects that underperformed despite massive budgets and marketing campaigns",
    readTime: "8 min read",
    icon: "AlertCircle",
    content: [
      {
        heading: "The Shift in Audience Behavior",
        content: "In the last decade, Bollywood has witnessed a dramatic shift in audience behavior. Large-scale productions with superstar casts, massive marketing campaigns, and budgets crossing hundreds of crores are no longer guaranteed successes. Films once expected to dominate the box office are now struggling to recover investments, while smaller and content-driven films are finding stronger audience support. This change has forced producers, studios, and actors to rethink how Hindi cinema operates in the modern entertainment era."
      },
      {
        heading: "Disconnect Between Audience Expectations and Product",
        content: "One of the biggest reasons large Bollywood films fail today is the disconnect between audience expectations and the final product. Earlier, star power alone could attract audiences to theaters during opening weekends. Fans would watch films purely because their favorite actor was featured. However, audiences have become more selective due to exposure to global storytelling through streaming platforms. Viewers now compare Bollywood films with international content available on OTT services, including Korean dramas, Hollywood franchises, and regional Indian cinema."
      },
      {
        heading: "Weak Screenplay Development",
        content: "Another major factor is weak screenplay development. Many expensive Bollywood productions prioritize scale over storytelling. Huge budgets are spent on action sequences, visual effects, and foreign shooting locations, while scripts remain underdeveloped. Audiences are increasingly rejecting films that rely solely on glamour without emotional depth or engaging narratives. Social media has accelerated this trend because viewers immediately share reviews online after first-day screenings, influencing public perception within hours."
      },
      {
        heading: "Changing Marketing Strategies",
        content: "Marketing strategies have also changed significantly. In the past, aggressive promotions through television appearances, interviews, and music launches created anticipation. Today, digital audiences are more difficult to convince. Viral marketing cannot save a poorly made film for long. Trailers, teaser reactions, and audience reviews spread instantly across platforms like YouTube, Instagram, and X. If viewers sense weak storytelling, negative buzz begins before release."
      },
      {
        heading: "Repetitive Content and Regional Competition",
        content: "Another issue affecting Bollywood is repetitive content. Audiences are becoming tired of formula-based storytelling that follows predictable patterns. Many big films repeat the same romantic arcs, patriotic themes, action sequences, or comedy structures without introducing fresh ideas. Meanwhile, regional industries such as Telugu, Tamil, and Malayalam cinema are experimenting with unique concepts and rooted storytelling. This competition has reduced Bollywood's dominance in the Indian entertainment market."
      },
      {
        heading: "The Rise of OTT Platforms",
        content: "The rise of OTT platforms has also transformed audience expectations. Earlier, cinema halls were the only major entertainment source for new releases. Today, viewers know that many films will arrive on streaming platforms within weeks. Because of this, audiences carefully choose which films deserve a theatrical experience. Spectacle alone is not enough anymore. Films must create strong emotional engagement or provide extraordinary cinematic value."
      },
      {
        heading: "High Ticket Prices and Declining Attendance",
        content: "High ticket prices in multiplexes further contribute to declining theatrical attendance. Families spending large amounts on tickets, food, and transportation expect quality entertainment. If audiences feel disappointed after watching one expensive film, they become cautious about future releases. This has directly impacted urban box office collections for many major Bollywood projects."
      },
      {
        heading: "Casting Decisions and Authenticity",
        content: "Casting decisions also influence failures. Sometimes producers focus heavily on assembling star-studded casts instead of choosing actors suitable for specific roles. Audiences today prefer authenticity. They appreciate performances that feel natural and emotionally convincing. Miscasting often weakens emotional connection with viewers, especially in films attempting serious storytelling."
      },
      {
        heading: "Overdependence on Remakes and Franchises",
        content: "Another critical challenge is overdependence on remakes and franchise extensions. Bollywood has increasingly adapted South Indian films or revived older franchises without significant innovation. While nostalgia can initially generate curiosity, audiences eventually demand originality. Viewers can easily compare remakes with original versions available online, making it difficult for copied adaptations to impress."
      },
      {
        heading: "Pandemic Impact and Changed Consumer Behavior",
        content: "The pandemic period permanently changed consumer behavior as well. During lockdowns, audiences became comfortable watching content from home. OTT platforms expanded rapidly, providing high-quality entertainment at affordable subscription prices. After theaters reopened, only films with strong word-of-mouth or large-scale cinematic experiences managed to attract crowds consistently."
      },
      {
        heading: "Shifting Music Trends",
        content: "Music trends in Bollywood have also shifted. Earlier, hit soundtracks played a major role in promoting films. Songs became cultural phenomena that increased anticipation before release. Today, many film albums fail to create lasting impact because audiences prefer independent music, global artists, and short-form digital trends. Weak musical appeal reduces long-term hype around releases."
      },
      {
        heading: "Social Media Scrutiny and Celebrity Culture",
        content: "Social media scrutiny has made celebrity culture more complicated. Stars are now constantly analyzed online, and controversies can negatively impact films. Public relations campaigns alone cannot control audience sentiment anymore. Transparency and authenticity have become increasingly important in maintaining audience trust."
      },
      {
        heading: "Unrealistic Budgeting",
        content: "Another reason for failures is unrealistic budgeting. Some Bollywood films recover costs only if they perform exceptionally well in theaters. When production budgets become excessively high, even average box office collections are considered failures. Producers sometimes overspend on actor fees, luxurious production setups, and marketing campaigns without balancing financial risk."
      },
      {
        heading: "Evolving Audience Demographics",
        content: "At the same time, audience demographics are evolving. Younger viewers prefer faster pacing, grounded characters, and emotionally layered stories. Traditional formulas that worked for previous generations no longer guarantee success. Modern viewers value realism and originality more than exaggerated cinematic presentation."
      },
      {
        heading: "The Future of Bollywood",
        content: "Despite these challenges, Bollywood still possesses enormous creative potential. Several recent films have proven that strong storytelling, relatable emotions, and intelligent filmmaking can achieve both critical acclaim and commercial success. Audiences continue to support meaningful cinema regardless of budget size. The future of Bollywood depends on adaptation. Producers must prioritize writing, research, audience understanding, and creative experimentation. Big-budget films can still succeed, but only when scale is supported by compelling narratives. The industry is entering an era where quality matters more than celebrity influence alone."
      }
    ],
    faqs: [
      {
        question: "What is the biggest reason for big budget Bollywood failures today?",
        answer: "The biggest reason is the disconnect between audience expectations and the final product. Modern audiences are more selective due to exposure to global content through streaming platforms and now prioritize storytelling, emotional depth, and authenticity over just star power and scale."
      },
      {
        question: "How has social media impacted Bollywood's box office performance?",
        answer: "Social media has accelerated how quickly audience opinions spread. Viewers share reviews immediately after first-day screenings, influencing public perception within hours. Negative buzz can start before a film releases if trailers or teasers suggest weak storytelling."
      },
      {
        question: "Why are smaller content-driven films succeeding while big-budget films fail?",
        answer: "Smaller films often focus on strong writing, relatable characters, and authentic storytelling. Audiences today appreciate emotional depth and originality more than just spectacle. OTT platforms have also raised the bar for storytelling quality."
      }
    ],
    relatedTopics: ["Box Office", "Budget Analysis", "Audience Behavior"],
    author: "FilmyFire Intelligence"
  },
  {
    slug: "why-remakes-struggle",
    category: "Trend Analysis",
    title: "Why Remakes Struggle",
    description: "Deep dive into Bollywood's remake culture and why most fail to connect with modern audiences",
    readTime: "6 min read",
    icon: "RefreshCw",
    content: [
      {
        heading: "Bollywood's Troubled Relationship with Remakes",
        content: "Bollywood's relationship with remakes has become increasingly controversial in recent years. While remakes once served as reliable commercial projects, modern audiences are showing growing resistance toward adapted content. Several remake films featuring major stars and large production budgets have underperformed at the box office despite strong marketing efforts. This trend reveals deeper changes in audience psychology and entertainment consumption."
      },
      {
        heading: "Accessibility to Original Content",
        content: "One major reason remakes struggle today is accessibility to original content. Earlier, audiences often had limited exposure to regional or international films. Producers could adapt successful stories from other industries for Hindi-speaking audiences without much comparison. However, streaming platforms have changed everything. Today, viewers can easily watch original Tamil, Telugu, Malayalam, Korean, or Hollywood films online with subtitles."
      },
      {
        heading: "Higher Audience Expectations",
        content: "Because audiences can directly compare both versions, remakes face much higher expectations. If the adapted version fails to match the emotional depth, performances, or originality of the original film, viewers immediately criticize it online. Social media discussions amplify these comparisons rapidly, damaging audience perception before theatrical release."
      },
      {
        heading: "Cultural Authenticity",
        content: "Another important issue is cultural authenticity. Many successful regional films work because they are deeply rooted in local culture, traditions, and emotional realities. When Bollywood remakes these stories without preserving their emotional foundation, the result often feels artificial. Viewers can sense when adaptations lack authenticity."
      },
      {
        heading: "Perception of Creative Laziness",
        content: "Creative laziness is another criticism frequently associated with remakes. Audiences increasingly believe Bollywood relies too heavily on existing intellectual properties instead of investing in original storytelling. This perception has damaged trust among viewers who want fresh narratives and innovative filmmaking."
      },
      {
        heading: "Lack of Surprise and Predictability",
        content: "Remakes also struggle because audiences already know the story. Surprise and unpredictability are essential elements of cinematic engagement. When viewers know major plot twists, emotional payoffs become less impactful. Unless the remake offers a significantly different interpretation or improved execution, audiences often prefer revisiting the original film instead."
      },
      {
        heading: "Casting Challenges and Iconic Performances",
        content: "Casting decisions create additional challenges. Original performances often become iconic, making comparisons unavoidable. If Bollywood actors fail to deliver performances that feel equally convincing, audiences criticize the remake harshly. This is especially difficult when adapting emotionally intense or culturally specific roles."
      },
      {
        heading: "Online Fan Communities",
        content: "The rise of fan communities online has intensified audience reactions. Dedicated fans of original films actively defend source material and criticize remakes perceived as inferior. Viral comparisons through YouTube videos, reels, and reviews influence public opinion quickly."
      },
      {
        heading: "Music Adaptation Sensitivity",
        content: "Music adaptation is another sensitive area. Many classic films succeed partly because of memorable soundtracks. When remakes alter beloved songs or fail to create equally powerful music, audiences feel disconnected. Modern Bollywood music trends focused on remixes and recreated tracks have also contributed to audience fatigue."
      },
      {
        heading: "Misunderstanding Original Success Factors",
        content: "Some remakes fail because they misunderstand why the original succeeded. Producers may focus only on surface-level commercial elements such as action scenes or comedy while ignoring emotional complexity and character depth. As a result, the remake feels technically polished but emotionally empty."
      },
      {
        heading: "Evolved Audience Tastes",
        content: "Audience tastes have evolved significantly. Viewers now seek originality and authenticity more than ever before. Independent films, experimental storytelling, and grounded narratives are receiving greater appreciation. Remakes often feel safer and less creative compared to fresh cinematic experiences."
      },
      {
        heading: "Timing Issues",
        content: "Another factor is timing. Some remakes adapt films that are still relatively recent and widely remembered. Audiences question why a remake is necessary when the original remains easily accessible and emotionally effective."
      },
      {
        heading: "Changing Economics of Remakes",
        content: "The economics of remakes are changing too. While producers once considered remakes financially secure because stories were already successful elsewhere, modern audience resistance has increased commercial risk. Negative word-of-mouth spreads rapidly, reducing long-term box office sustainability."
      },
      {
        heading: "When Remakes Succeed",
        content: "Despite these challenges, remakes are not entirely doomed. Successful adaptations still occur when filmmakers genuinely reinterpret stories rather than copying them. Strong remakes usually add new cultural perspectives, emotional layers, or contemporary relevance. Bollywood can learn valuable lessons from industries that successfully adapt stories across languages. Respecting source material while introducing meaningful creative innovation is essential. Audiences appreciate adaptation when it feels purposeful rather than commercially opportunistic."
      },
      {
        heading: "The Future of Remakes",
        content: "The future of remakes depends on balance. Producers must understand that modern audiences are informed, globally connected, and highly critical. Simple replication is no longer enough. Only thoughtful storytelling and authentic filmmaking can transform remakes into meaningful cinematic experiences."
      }
    ],
    faqs: [
      {
        question: "Why do remakes often fail in Bollywood today?",
        answer: "Remakes fail primarily because audiences now have easy access to original content through streaming platforms. They can directly compare versions, and if the remake lacks cultural authenticity, emotional depth, or creative innovation, it faces immediate criticism."
      },
      {
        question: "What makes a successful remake?",
        answer: "Successful remakes genuinely reinterpret stories rather than copying them. They add new cultural perspectives, emotional layers, or contemporary relevance while respecting the original source material."
      },
      {
        question: "How has social media impacted remake reception?",
        answer: "Social media amplifies comparisons between original and remake versions instantly. Fans actively defend source material, and viral reviews, YouTube videos, and reels shape public opinion very quickly."
      }
    ],
    relatedTopics: ["Remakes", "Trend Analysis", "Content vs Remakes"],
    author: "FilmyFire Intelligence"
  },
  {
    slug: "how-ott-impacts-bollywood",
    category: "Digital Trends",
    title: "How OTT Impacts Bollywood",
    description: "Understanding the shift in viewing habits and its effect on theatrical releases and content creation",
    readTime: "10 min read",
    icon: "Monitor",
    content: [
      {
        heading: "Transformation of the Bollywood Ecosystem",
        content: "The rise of OTT platforms has completely transformed the Bollywood ecosystem. Streaming services such as Netflix, Amazon Prime Video, Disney+ Hotstar, JioCinema, and others have reshaped how audiences consume entertainment. This shift has affected theatrical releases, storytelling patterns, celebrity culture, production strategies, and even audience expectations."
      },
      {
        heading: "Changing Revenue Streams",
        content: "Before OTT expansion, theatrical release was the primary revenue source for most Bollywood films. Producers depended heavily on box office collections to recover investments. Today, digital rights have become one of the most important revenue streams. In many cases, streaming deals help producers recover substantial portions of production costs even before theatrical release."
      },
      {
        heading: "Increased Content Diversity",
        content: "One major impact of OTT platforms is increased content diversity. Streaming services allow filmmakers to experiment with genres and storytelling styles that might struggle in traditional theaters. Crime dramas, psychological thrillers, documentaries, dark comedies, and realistic social stories have gained stronger audiences online."
      },
      {
        heading: "Shift in Viewing Habits",
        content: "OTT platforms have also changed audience viewing habits. Viewers now prefer convenience and flexibility. Instead of traveling to theaters, audiences can watch content anytime from home. This convenience became even more normalized during the pandemic lockdown period."
      },
      {
        heading: "Greater Pressure on Theatrical Releases",
        content: "As a result, theatrical releases face greater pressure. Audiences carefully decide which films deserve a cinema experience. Spectacle-driven films with strong visual appeal still attract crowds, but smaller or average entertainers often struggle because viewers are willing to wait for streaming releases."
      },
      {
        heading: "Evolving Storytelling Structure",
        content: "Another major transformation involves storytelling structure. OTT audiences usually consume long-form content through web series and multi-episode narratives. This has encouraged more layered character development and detailed storytelling. Bollywood filmmakers are increasingly adapting cinematic styles influenced by streaming trends."
      },
      {
        heading: "Democratization of Talent Opportunities",
        content: "The rise of OTT has also democratized talent opportunities. Earlier, Bollywood was heavily controlled by established studios and star systems. Streaming platforms opened doors for new actors, writers, directors, and regional creators. Performers who previously struggled to secure major theatrical projects found success through digital content."
      },
      {
        heading: "Increased Exposure to Global Content",
        content: "Audience exposure to international content has increased dramatically because of OTT services. Indian viewers now watch Korean dramas, Hollywood series, Spanish thrillers, Japanese anime, and European films regularly. This global exposure has raised expectations regarding storytelling quality, production standards, and originality."
      },
      {
        heading: "Data-Driven Decision Making",
        content: "Another important effect is data-driven decision making. OTT platforms track viewer behavior extensively, including watch time, completion rates, genre preferences, and audience demographics. This data helps platforms understand consumer trends more accurately than traditional theatrical systems."
      },
      {
        heading: "Evolving Star Culture",
        content: "Bollywood's star culture has also evolved because of streaming platforms. Earlier, theatrical success largely determined celebrity influence. Today, actors gain recognition through digital performances as well. Several performers have revived careers through OTT projects that showcase stronger acting abilities."
      },
      {
        heading: "Changing Economics of Filmmaking",
        content: "The economics of filmmaking are changing rapidly too. Mid-budget films that may struggle in theaters often perform successfully on streaming platforms. This has encouraged producers to invest in more experimental content."
      },
      {
        heading: "Intensified Global Competition",
        content: "At the same time, OTT growth has intensified competition. Audiences now have unlimited entertainment choices. Bollywood is no longer competing only with other Hindi films. Every film now competes against global content libraries available instantly on mobile devices."
      },
      {
        heading: "Shifting Censorship Dynamics",
        content: "Censorship dynamics have also shifted. OTT platforms initially allowed creators more creative freedom compared to traditional cinema regulations. This encouraged bolder storytelling and mature themes. However, increasing government discussions around digital regulations continue shaping the streaming landscape."
      },
      {
        heading: "Evolving Marketing Strategies",
        content: "Marketing strategies have evolved as well. Digital campaigns, influencer promotions, memes, and online engagement now play major roles in audience reach. Viral trends on social media can significantly boost streaming popularity."
      },
      {
        heading: "Rise of Direct-to-Digital Releases",
        content: "Another major trend is the rise of direct-to-digital releases. Several films now skip theatrical release entirely and premiere directly on streaming platforms. This approach became particularly common during the pandemic but continues for selected projects today."
      },
      {
        heading: "Expanded Regional Cinema Visibility",
        content: "OTT platforms have also expanded regional cinema visibility. Malayalam, Tamil, Telugu, Kannada, and Marathi films now reach national audiences more easily through subtitles and dubbing. This increased competition has challenged Bollywood to improve storytelling quality."
      },
      {
        heading: "Cinemas Remain Culturally Significant",
        content: "Despite concerns about declining theatrical attendance, cinemas still remain culturally significant for blockbuster experiences. Large-scale action films, event cinema, and franchise releases continue attracting audiences. However, the overall balance between theaters and streaming has permanently changed."
      },
      {
        heading: "Hybrid Future Strategies",
        content: "The future of Bollywood will likely involve hybrid strategies combining theatrical releases, digital premieres, and franchise expansion across multiple platforms. OTT services are not replacing Bollywood entirely; instead, they are reshaping how the industry creates, markets, and distributes entertainment."
      },
      {
        heading: "Empowered Audiences with Choice",
        content: "The digital revolution has ultimately empowered audiences with greater choice and control. Bollywood's long-term success will depend on its ability to adapt creatively and commercially within this evolving entertainment ecosystem."
      }
    ],
    faqs: [
      {
        question: "How has OTT changed Bollywood's revenue model?",
        answer: "OTT platforms have made digital rights one of the most important revenue streams. Producers often recover substantial portions of costs through streaming deals even before theatrical release."
      },
      {
        question: "What genres have benefited most from OTT?",
        answer: "Crime dramas, psychological thrillers, documentaries, dark comedies, and realistic social stories have gained stronger audiences online since they can be more experimental than traditional theatrical fare."
      },
      {
        question: "Are theaters becoming less important?",
        answer: "While OTT has changed viewing habits, theaters still remain culturally significant for blockbuster experiences. Large-scale action films, event cinema, and franchise releases continue attracting audiences."
      }
    ],
    relatedTopics: ["OTT", "Digital Trends", "Theatrical Releases"],
    author: "FilmyFire Intelligence"
  },
  {
    slug: "star-power-vs-story-power",
    category: "Box Office Intelligence",
    title: "Star Power vs Story Power",
    description: "Data-driven analysis of whether star casting or compelling narratives drive box office success",
    readTime: "7 min read",
    icon: "Users",
    content: [
      {
        heading: "The Traditional Belief in Star Power",
        content: "For decades, Bollywood operated on the belief that star power guaranteed commercial success. Major actors dominated the industry through loyal fan bases, massive opening collections, and strong media presence. Producers invested heavily in celebrities because audiences often watched films purely for their favorite stars."
      },
      {
        heading: "The Modern Entertainment Landscape Shift",
        content: "However, the modern entertainment landscape has changed dramatically. Recent box office trends suggest that story power is becoming increasingly important compared to celebrity influence alone. Audiences are now more selective, informed, and quality-conscious than ever before."
      },
      {
        heading: "Traditional Advantages of Star Power",
        content: "Traditionally, star power provided several advantages. Popular actors attracted opening weekend audiences regardless of reviews. Distributors trusted projects featuring established stars because they appeared financially safer. Brands and advertisers also preferred collaborations with celebrities possessing large fan followings."
      },
      {
        heading: "Digital Media and OTT Impact",
        content: "But the rise of digital media and OTT platforms transformed audience behavior. Viewers now consume global entertainment regularly and compare Bollywood films against international storytelling standards. As a result, audiences are less willing to spend money on weak films simply because a famous actor appears in them."
      },
      {
        heading: "Increasing Importance of Word-of-Mouth",
        content: "One major shift is the increasing importance of word-of-mouth. Social media reviews spread instantly after release. If a film lacks emotional engagement or compelling storytelling, negative reactions impact collections rapidly. Strong opening numbers can no longer guarantee long-term success."
      },
      {
        heading: "Recent Box Office Trends",
        content: "Several recent Bollywood films featuring major stars failed commercially despite aggressive marketing campaigns. In contrast, smaller films with strong scripts achieved critical acclaim and impressive audience support. This trend demonstrates that viewers increasingly prioritize content quality."
      },
      {
        heading: "Story Power Creates Emotional Connection",
        content: "Story power creates stronger emotional connection with audiences. Memorable narratives, relatable characters, and meaningful themes generate lasting cultural impact. Audiences remember films that emotionally resonate with them regardless of budget size."
      },
      {
        heading: "Star Power Remains Important",
        content: "At the same time, star power still remains important. Celebrities continue influencing marketing reach, opening collections, and media visibility. Major actors help films attract initial attention in crowded entertainment markets. However, star influence now works best when combined with quality storytelling."
      },
      {
        heading: "Preference for Realism",
        content: "Another factor changing audience preferences is realism. Modern viewers appreciate grounded performances and believable characters. Overly exaggerated hero-centric storytelling often feels outdated to younger audiences."
      },
      {
        heading: "Influence of Regional Cinema",
        content: "Regional cinema has also influenced this shift. Many successful South Indian and Malayalam films prioritize storytelling over celebrity glamour. Their national success through dubbed releases and streaming platforms has encouraged audiences to value narrative strength more highly."
      },
      {
        heading: "Evolving Filmmaking Economics",
        content: "The economics of filmmaking are evolving because of this trend. Producers are becoming more cautious about spending excessive amounts on actor fees while neglecting script development. Investments in writers, research, and pre-production are gaining importance."
      },
      {
        heading: "Streaming Platforms Strengthen Story-Driven Content",
        content: "Streaming platforms further strengthened story-driven content. OTT audiences focus heavily on writing quality because content competes globally. Several actors who previously struggled in theatrical cinema found renewed recognition through performance-oriented digital roles."
      },
      {
        heading: "Audience Fatigue with Repetitive Formulas",
        content: "Another reason story power is growing involves audience fatigue with repetitive formulas. Films relying only on action, romance, or celebrity image without fresh storytelling often struggle to sustain attention. Audiences now seek originality, emotional complexity, and meaningful experiences."
      },
      {
        heading: "Younger Generation Values Authenticity",
        content: "The younger generation especially values authenticity. They connect more with realistic storytelling than manufactured stardom. Social media also reduced the distance between celebrities and audiences, making traditional star mystique less powerful than before."
      },
      {
        heading: "Completely Dismissing Star Power is Inaccurate",
        content: "However, completely dismissing star power would be inaccurate. Event films featuring major stars still create excitement when supported by strong direction and compelling storytelling. Some of the biggest blockbusters in recent years successfully combined both elements."
      },
      {
        heading: "Ideal Balance for Modern Bollywood",
        content: "The ideal balance for modern Bollywood involves integrating star appeal with narrative quality. Actors who choose meaningful scripts and collaborate with talented filmmakers continue achieving both critical and commercial success."
      },
      {
        heading: "Adapting Marketing Strategies",
        content: "Marketing strategies are also adapting. Earlier campaigns focused mainly on celebrity appearances and glamour. Today, promotional campaigns increasingly emphasize story concepts, audience reactions, and emotional themes."
      },
      {
        heading: "Building Audience Trust",
        content: "Another significant change is audience trust. Viewers support filmmakers and actors who consistently deliver quality content. Reputation is increasingly built through storytelling credibility rather than celebrity status alone."
      },
      {
        heading: "Future Outlook",
        content: "In the future, Bollywood will likely move toward a more balanced industry where stars remain valuable but storytelling becomes the central driving force behind long-term success. Audiences have become smarter, more connected, and more demanding."
      },
      {
        heading: "Conclusion",
        content: "Ultimately, the debate between star power and story power does not require choosing only one side. The most successful films are usually those where powerful performances support emotionally engaging storytelling. Modern Bollywood's evolution suggests that while stars may attract attention, stories are what truly sustain audience loyalty and cultural relevance."
      }
    ],
    faqs: [
      {
        question: "What matters more today: star power or story power?",
        answer: "While star power still helps with initial marketing and opening collections, story power has become increasingly important for long-term success. Audiences now prioritize emotional engagement and compelling narratives."
      },
      {
        question: "Can star power alone guarantee box office success today?",
        answer: "No, recent trends show that star power alone no longer guarantees success. Several major star films have failed commercially, while smaller content-driven films have succeeded."
      },
      {
        question: "What is the ideal combination for success?",
        answer: "The most successful films combine star power with strong storytelling. Stars help attract initial attention, but quality narratives create emotional connection and lasting audience loyalty."
      }
    ],
    relatedTopics: ["Box Office", "Star Power", "Audience Trends"],
    author: "FilmyFire Intelligence"
  }
];

async function seedIndustryInsights() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/filmyfire');
    console.log('Connected to MongoDB');

    // Clear existing industry insights (if collection exists)
    try {
      await IndustryInsight.deleteMany({});
      console.log('Cleared existing industry insights');
    } catch (err) {
      console.log('No existing industry insights to clear');
    }

    const result = await IndustryInsight.insertMany(insights);
    console.log(`Successfully inserted ${result.length} industry insights`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding industry insights:', error);
    process.exit(1);
  }
}

seedIndustryInsights();
