import { Scene } from '@/lib/store';

export const storyScenes: Record<string, Scene> = {
  // PROLOGUE
  prologue_start: {
    id: 'prologue_start',
    title: 'One Year Ago',
    description: 'The Washington Lodge, Blackwood Mountain',
    narratorText: 'February 2, 2014. A group of friends gathers at the Washington lodge for their annual winter getaway. But this night would change everything.',
    environment: 'lodge',
    choices: [
      { id: 'prologue_continue', text: 'Continue', nextScene: 'prologue_night' },
    ],
  },
  
  prologue_night: {
    id: 'prologue_night',
    title: 'The Prank',
    description: 'Late night in the lodge',
    narratorText: 'Mike leads Hannah to a guest room. Jessica, Emily, Matt, and Ashley hide inside, ready to prank her. But things go too far...',
    environment: 'cabin',
    cameraPosition: [0, 2, 5],
    choices: [
      { id: 'prologue_watch', text: 'Watch what happens next', nextScene: 'prologue_escape' },
    ],
  },
  
  prologue_escape: {
    id: 'prologue_escape',
    title: 'Into the Woods',
    description: 'The snow-covered forest',
    narratorText: 'Humiliated, Hannah runs into the snowy woods. Beth chases after her sister. The twins find themselves cornered at a cliff edge...',
    environment: 'woods',
    cameraPosition: [5, 3, 5],
    choices: [
      { id: 'prologue_fall', text: 'Continue', nextScene: 'chapter1_start' },
    ],
  },
  
  // CHAPTER 1 - PRESENT DAY
  chapter1_start: {
    id: 'chapter1_start',
    title: 'Chapter 1: The Return',
    description: 'One year later...',
    narratorText: 'The surviving friends return to Blackwood Mountain for the anniversary. Josh has invited them back for a memorial weekend. But not everyone is happy to be here.',
    environment: 'lodge',
    cameraPosition: [-3, 2, 5],
    choices: [
      { id: 'ch1_explore_lodge', text: 'Explore the lodge', nextScene: 'ch1_lodge_exploration' },
      { id: 'ch1_meet_josh', text: 'Find Josh', nextScene: 'ch1_meet_josh' },
    ],
  },
  
  ch1_lodge_exploration: {
    id: 'ch1_lodge_exploration',
    title: 'Washington Lodge',
    description: 'The familiar yet eerie lodge',
    narratorText: 'The lodge stands silent. Fresh snow covers the ground. Something feels... different. Wrong.',
    environment: 'lodge',
    cameraPosition: [0, 2, 3],
    choices: [
      { id: 'ch1_find_clue', text: 'Search for clues', nextScene: 'ch1_clue_found', consequence: 'found_totem' },
      { id: 'ch1_go_to_bed', text: 'Head to bed', nextScene: 'ch1_night_fall' },
    ],
  },
  
  ch1_clue_found: {
    id: 'ch1_clue_found',
    title: 'A Strange Totem',
    description: 'You found a totems',
    narratorText: 'A guidance totem rests in the corner. It shows a vision—Emily handing Matt a flare gun. What does it mean?',
    environment: 'lodge',
    choices: [
      { id: 'ch1_take_totem', text: 'Take the totem', nextScene: 'ch1_night_fall', consequence: 'took_totem' },
      { id: 'ch1_leave_totem', text: 'Leave it', nextScene: 'ch1_night_fall' },
    ],
  },
  
  ch1_meet_josh: {
    id: 'ch1_meet_josh',
    title: 'Josh\'s Welcome',
    description: 'The host arrives',
    narratorText: 'Josh Washington greets you with nervous energy. "Glad you could make it. This weekend... it means everything to me."',
    environment: 'lodge',
    cameraPosition: [2, 1.5, 3],
    choices: [
      { id: 'ch1_josh_friendly', text: '"Happy to be here, Josh"', nextScene: 'ch1_night_fall', consequence: 'josh_trust_high' },
      { id: 'ch1_josh_suspicious', text: '"What\'s really going on?"', nextScene: 'ch1_night_fall', consequence: 'josh_trust_low' },
    ],
  },
  
  ch1_night_fall: {
    id: 'ch1_night_fall',
    title: 'Night Falls',
    description: 'The storm approaches',
    narratorText: 'A blizzard rolls in. The power flickers. Then—a scream echoes from somewhere in the lodge.',
    environment: 'cabin',
    cameraPosition: [0, 2, 4],
    choices: [
      { id: 'ch1_investigate', text: 'Investigate the sound', nextScene: 'chapter2_start' },
      { id: 'ch1_hide', text: 'Hide and wait', nextScene: 'chapter2_start_alt' },
    ],
  },
  
  // CHAPTER 2
  chapter2_start: {
    id: 'chapter2_start',
    title: 'Chapter 2: The Disappearance',
    description: 'After the scream...',
    narratorText: 'You rush toward the sound. Jessica\'s room is empty. The window is open. Snow trails lead into the darkness...',
    environment: 'cabin',
    cameraPosition: [3, 2, 3],
    choices: [
      { id: 'ch2_chase_outside', text: 'Chase into the woods', nextScene: 'ch2_woods_chase' },
      { id: 'ch2_get_mike', text: 'Find Mike', nextScene: 'ch2_find_mike' },
    ],
  },
  
  chapter2_start_alt: {
    id: 'chapter2_start_alt',
    title: 'Chapter 2: Hiding',
    description: 'Too afraid to move...',
    narratorText: 'You cower in the shadows. Minutes pass. Then Mike bursts in, breathless. "Jessica\'s gone! I heard her scream!"',
    environment: 'cabin',
    choices: [
      { id: 'ch2_search_together', text: 'Search together', nextScene: 'ch2_find_mike' },
    ],
  },
  
  ch2_woods_chase: {
    id: 'ch2_woods_chase',
    title: 'The Woods',
    description: 'Darkness surrounds you',
    narratorText: 'The snow blinds you. You hear twigs snapping—something is nearby. Then you see it. A figure. No... something else. A WENDIGO!',
    environment: 'woods',
    cameraPosition: [0, 3, 6],
    choices: [
      { id: 'ch2_run_cabin', text: 'Run back to cabin', nextScene: 'chapter3_start', fearDelta: 15 },
      { id: 'ch2_fight_back', text: 'Stand your ground', nextScene: 'chapter3_fight', fearDelta: 25 },
    ],
  },
  
  ch2_find_mike: {
    id: 'ch2_find_mike',
    title: 'Mike\'s Search',
    description: 'Together with Mike',
    narratorText: 'Mike grabs a flashlight. "I\'m going after her. You coming?"',
    environment: 'cabin',
    choices: [
      { id: 'ch2_go_with_mike', text: 'Go with Mike', nextScene: 'ch2_woods_chase' },
      { id: 'ch2_stay_behind', text: 'Stay at lodge', nextScene: 'chapter3_lodge' },
    ],
  },
  
  chapter3_start: {
    id: 'chapter3_start',
    title: 'Chapter 3: Secrets',
    description: 'Back at the lodge',
    narratorText: 'The group reunites, shaken. Ashley suggests using a spirit board to contact the dead. "Josh\'s sisters... maybe they know something."',
    environment: 'lodge',
    choices: [
      { id: 'ch3_spirit_board', text: 'Try the spirit board', nextScene: 'ch3_spirit_scene' },
      { id: 'ch3_search_lodge', text: 'Search the lodge instead', nextScene: 'ch3_lodge_search' },
    ],
  },
  
  chapter3_fight: {
    id: 'chapter3_fight',
    title: 'Confrontation',
    description: 'Standing your ground',
    narratorText: 'The creature lunges. You barely escape, stumbling back to the lodge with scratches and torn clothes. But you saw it clearly. Not human. Not animal. Something ancient.',
    environment: 'woods',
    choices: [
      { id: 'ch3_fight_continue', text: 'Continue', nextScene: 'chapter3_start', fearDelta: 20 },
    ],
  },
  
  chapter3_lodge: {
    id: 'chapter3_lodge',
    title: 'Chapter 3: Alone',
    description: 'The lodge at night',
    narratorText: 'While others search, you stay at the lodge. Strange noises echo through the halls. Then you hear it—a breathing behind you.',
    environment: 'lodge',
    cameraPosition: [-2, 2, 4],
    choices: [
      { id: 'ch3_turn_around', text: 'Turn around', nextScene: 'chapter3_start' },
    ],
  },
  
  ch3_spirit_scene: {
    id: 'ch3_spirit_scene',
    title: 'The Spirit Board',
    description: 'Contacting the dead',
    narratorText: 'The planchette moves. "B-E-T-H" It spells out a name. Then: "R-U-N". The door slammed shut on its own.',
    environment: 'lodge',
    choices: [
      { id: 'ch3_escape_room', text: 'Force the door open', nextScene: 'chapter4_start', fearDelta: 20 },
      { id: 'ch3_wait_it_out', text: 'Wait in terror', nextScene: 'chapter4_start', fearDelta: 25 },
    ],
  },
  
  ch3_lodge_search: {
    id: 'ch3_lodge_search',
    title: 'Hidden Secrets',
    description: 'Searching the lodge',
    narratorText: 'In Josh\'s room, you find hidden cameras. He\'s been watching everyone. But there\'s something else—a newspaper clipping about the 1952 mining accident.',
    environment: 'lodge',
    choices: [
      { id: 'ch3_read_clipping', text: 'Read the article', nextScene: 'chapter4_start', consequence: 'learned_history' },
      { id: 'ch3_ignore', text: 'Ignore and continue', nextScene: 'chapter4_start' },
    ],
  },
  
  // CHAPTER 4
  chapter4_start: {
    id: 'chapter4_start',
    title: 'Chapter 4: The Truth',
    description: 'Dawn approaches... slowly',
    narratorText: 'The Stranger appears—a mysterious hunter who knows the mountain\'s secrets. "The Wendigos... they were men once. Starving miners who ate the flesh of their own."',
    environment: 'woods',
    cameraPosition: [4, 2, 5],
    choices: [
      { id: 'ch4_listen_stranger', text: 'Listen to his story', nextScene: 'ch4_stranger_tells', fearDelta: 15 },
      { id: 'ch4_doubt', text: 'Demand proof', nextScene: 'ch4_stranger_tells', fearDelta: 15 },
    ],
  },
  
  ch4_stranger_tells: {
    id: 'ch4_stranger_tells',
    title: 'The Hunter\'s Warning',
    description: 'The truth revealed',
    narratorText: '"1952. Twelve men trapped in the mines. They ate each other to survive. The ones who survived... became something else. They hunger for human flesh."',
    environment: 'woods',
    choices: [
      { id: 'ch4_ask_survival', text: '"How do we survive?"', nextScene: 'chapter5_start' },
    ],
  },
  
  // CHAPTER 5 - FINAL
  chapter5_start: {
    id: 'chapter5_start',
    title: 'Chapter 5: Until Dawn',
    description: 'The final hours',
    narratorText: 'The Wendigos are closing in. The Stranger offers a way out—if you can make it to the cable car station before dawn, you might escape.',
    environment: 'woods',
    cameraPosition: [0, 3, 7],
    choices: [
      { id: 'ch5_split_up', text: 'Split up to cover more ground', nextScene: 'ending_sacrifice', fearDelta: 30 },
      { id: 'ch5_stay_together', text: 'Stay together', nextScene: 'ending_survival', fearDelta: 15 },
    ],
  },
  
  ending_sacrifice: {
    id: 'ending_sacrifice',
    title: 'The Dawn',
    description: 'Not everyone makes it...',
    narratorText: 'The group scatters through the mines. Some escape. Others are lost to the darkness. But as the sun rises over Blackwood Mountain, the creatures retreat into the shadows.',
    environment: 'woods',
    cameraPosition: [0, 4, 8],
    choices: [
      { id: 'ending_restart', text: 'Play Again', nextScene: 'prologue_start' },
    ],
  },
  
  ending_survival: {
    id: 'ending_survival',
    title: 'Together Until Dawn',
    description: 'You survived... together',
    narratorText: 'Through courage and teamwork, the survivors make it to the cable car. The sun rises, casting golden light across the snow. Against all odds, you lived through the night.',
    environment: 'woods',
    cameraPosition: [0, 4, 8],
    choices: [
      { id: 'ending_restart', text: 'Play Again', nextScene: 'prologue_start' },
    ],
  },
};

export const getScene = (sceneId: string): Scene => {
  return storyScenes[sceneId] || storyScenes.prologue_start;
};
