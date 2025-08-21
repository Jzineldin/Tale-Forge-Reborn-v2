// Mock AI Service for Development
// Provides realistic mock responses when API keys are not available

export class MockAIService {
  private static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private static generateMockStorySegment(genre: string, theme: string, childName: string) {
    const segments = {
      fantasy: [
        `Once upon a time, ${childName || 'a brave young adventurer'} discovered a magical portal hidden behind an old oak tree. The portal shimmered with rainbow colors, and mysterious whispers could be heard from the other side. As ${childName || 'they'} approached, the portal began to glow brighter, revealing glimpses of an enchanted realm filled with floating islands and gentle dragons.`,
        
        `${childName || 'The young hero'} stepped through the portal and found themselves in a magnificent crystal cave. Tiny fairy lights danced around glowing crystals, and in the center stood a wise old wizard with a long silver beard. "Welcome, ${childName || 'young one'}," he said warmly. "I have been waiting for someone brave enough to help save our magical kingdom."`
      ],
      adventure: [
        `${childName || 'A curious explorer'} was hiking through the misty mountains when they stumbled upon an ancient treasure map tucked inside a hollow tree. The map showed the location of the legendary Golden Compass, said to guide its owner to their greatest treasure. With excitement building, ${childName || 'our hero'} decided to follow the mysterious trail marked on the weathered parchment.`,
        
        `Following the map led ${childName || 'the adventurer'} to the edge of a rushing river where an old rope bridge swayed in the wind. On the other side, they could see the entrance to a cave marked with ancient symbols. The bridge looked sturdy enough, but the water below was deep and fast-moving. ${childName || 'They'} had to make an important decision about how to proceed.`
      ],
      mystery: [
        `${childName || 'A young detective'} was walking home from school when they noticed something strange. The old library's lights were on, even though it was supposed to be closed. Through the window, they could see books floating through the air by themselves! ${childName || 'They'} knew this was definitely not normal and decided to investigate this peculiar mystery.`,
        
        `Creeping closer to the library window, ${childName || 'the young sleuth'} saw a small, friendly-looking creature with pointy ears organizing the floating books. The creature appeared to be a library fairy, working hard to sort through hundreds of stories. When it noticed ${childName || 'them'} watching, it waved cheerfully and gestured toward the front door, as if inviting them inside.`
      ],
      'sci-fi': [
        `${childName || 'A space cadet'} was stargazing from their backyard when a small, silver spaceship landed softly in their garden. A friendly alien with big, kind eyes emerged and introduced itself as Zorp from the planet Zigzag. "Greetings, Earth friend," Zorp said in a musical voice. "We need your help to find our lost cosmic pet, Sparkle, who loves to hide among the stars."`,
        
        `${childName || 'The space explorer'} climbed aboard Zorp's amazing spacecraft, which was filled with blinking lights and floating buttons. Through the transparent dome, they could see Earth getting smaller as they zoomed toward a nearby asteroid field where Sparkle was last seen. Zorp handed ${childName || 'them'} a special helmet that would help them breathe in space and communicate with cosmic creatures.`
      ],
      bedtime: [
        `As the sun set and painted the sky in soft purples and golds, ${childName || 'a sleepy child'} was getting ready for bed when they heard a gentle tapping at their window. Outside sat a wise old owl wearing tiny spectacles, holding a glowing book in its wings. "Hello there," hooted the owl softly. "I'm Luna, the Dream Keeper, and I have wonderful bedtime stories to share with you."`,
        
        `Luna the owl invited ${childName || 'the child'} on a peaceful journey through the Cloud Kingdom, where everything was soft and silvery. They floated gently on a cloud-boat, watching sleepy star-children dance in the moonlight while gentle lullabies drifted through the air. The Cloud Kingdom was a place where all worries melted away and dreams came to life in the most beautiful ways.`
      ]
    };

    const genreSegments = segments[genre as keyof typeof segments] || segments.fantasy;
    const randomIndex = Math.floor(Math.random() * genreSegments.length);
    return genreSegments[randomIndex];
  }

  private static generateMockChoices(genre: string) {
    const choices = {
      fantasy: [
        "Cast a protection spell and enter bravely",
        "Ask the wizard for help and guidance",
        "Search for magical allies first"
      ],
      adventure: [
        "Cross the rope bridge carefully",
        "Look for another way around",
        "Call out to see if anyone is there"
      ],
      mystery: [
        "Knock on the library door politely",
        "Circle around to find another entrance",
        "Wait and watch to learn more"
      ],
      'sci-fi': [
        "Use the space scanner to locate Sparkle",
        "Explore the nearest asteroid cave",
        "Send out a friendly cosmic signal"
      ],
      bedtime: [
        "Ask Luna to tell a dream story",
        "Visit the Palace of Peaceful Sleep",
        "Dance with the sleepy star-children"
      ]
    };

    const genreChoices = choices[genre as keyof typeof choices] || choices.fantasy;
    return genreChoices.map((text, index) => ({
      id: `mock-choice-${Date.now()}-${index}`,
      text,
      next_segment_id: null
    }));
  }

  static async createMockStory(storyData: any) {
    console.log('🎭 Using Mock AI Service for story creation');
    await this.delay(2000); // Simulate AI processing time

    const mockStorySegment = this.generateMockStorySegment(
      storyData.genre,
      storyData.theme,
      storyData.child_name || storyData.childName
    );

    const mockChoices = this.generateMockChoices(storyData.genre);

    return {
      success: true,
      story: {
        id: `mock-story-${Date.now()}`,
        title: storyData.title,
        description: storyData.description,
        genre: storyData.genre,
        age_group: storyData.age_group,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'mock-user-id',
        theme: storyData.theme,
        setting: storyData.setting,
        characters: storyData.characters || [],
        conflict: storyData.conflict,
        quest: storyData.quest,
        moralLesson: storyData.moral_lesson
      },
      firstSegment: {
        id: `mock-segment-${Date.now()}`,
        story_id: `mock-story-${Date.now()}`,
        content: mockStorySegment,
        position: 1,
        choices: mockChoices,
        image_prompt: `Children's book illustration: ${mockStorySegment.substring(0, 100)}... in ${storyData.genre} style`,
        created_at: new Date().toISOString()
      },
      tokensUsed: 250,
      model: 'Mock-AI-Storyteller-v1',
      message: 'Mock story created successfully! 🎭'
    };
  }

  static async generateMockSegment(storyId: string, choiceIndex?: number) {
    console.log('🎭 Using Mock AI Service for segment generation');
    await this.delay(1500); // Simulate AI processing time

    // Generate a continuation segment
    const continuations = [
      "The adventure continued as our hero discovered new wonders around every corner. Magic sparkled in the air, and friendly creatures appeared to offer help and guidance. Each step forward revealed more of the amazing world that awaited exploration.",
      
      "With courage in their heart, our brave explorer pressed onward into the unknown. The path ahead was filled with exciting possibilities and new friends waiting to be met. Every challenge became an opportunity to learn and grow stronger.",
      
      "The mystery deepened as new clues appeared like pieces of a puzzle waiting to be solved. Our clever detective noticed important details that others might have missed, leading them closer to the amazing truth that lay hidden just out of sight.",
      
      "As the journey continued, our hero realized that the greatest treasures were not gold or jewels, but the friendship, kindness, and wisdom gained along the way. Each new experience added to their growing understanding of the wonderful world around them."
    ];

    const randomContent = continuations[Math.floor(Math.random() * continuations.length)];
    const mockChoices = [
      "Continue exploring with confidence",
      "Stop to help a friend in need",
      "Discover a hidden secret passage"
    ].map((text, index) => ({
      id: `mock-choice-${Date.now()}-${index}`,
      text,
      next_segment_id: null
    }));

    return {
      success: true,
      segment: {
        id: `mock-segment-${Date.now()}`,
        story_id: storyId,
        content: randomContent,
        position: Math.floor(Math.random() * 10) + 2,
        choices: mockChoices,
        image_prompt: `Children's book illustration: ${randomContent.substring(0, 100)}...`,
        created_at: new Date().toISOString()
      },
      imagePrompt: `Children's book illustration: ${randomContent.substring(0, 100)}...`,
      message: 'Mock story segment generated successfully! 🎭'
    };
  }

  static async generateMockAudio(storyId: string) {
    console.log('🎭 Using Mock AI Service for audio generation');
    await this.delay(3000); // Simulate audio processing time

    return {
      success: true,
      story: {
        id: storyId,
        audio_url: `https://mock-audio-service.example.com/story-${storyId}.mp3`
      },
      audioUrl: `https://mock-audio-service.example.com/story-${storyId}.mp3`,
      message: 'Mock audio narration generated successfully! 🎭 (Note: This is a placeholder URL for development)'
    };
  }
}