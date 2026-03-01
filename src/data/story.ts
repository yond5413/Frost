import { Scene } from '@/lib/store';

export const storyScenes: Record<string, Scene> = {
  // PROLOGUE - EXPANDED
  prologue_start: {
    id: 'prologue_start',
    title: 'One Year Ago',
    description: 'The Washington Lodge, Blackwood Mountain',
    dialogue: [
      { speaker: 'narrator', text: 'February 2, 2014. A group of friends gathers at the Washington lodge for their annual winter getaway. But this night would change everything.', camera: 'wide' }
    ],
    choicesAt: 1,
    environment: 'lodge',
    activeCharacter: 'sam',
    choices: [
      { id: 'prologue_continue', text: 'Continue', nextScene: 'prologue_arrival' },
    ],
  },

  prologue_arrival: {
    id: 'prologue_arrival',
    title: 'The Arrival',
    description: 'Friends gather at the lodge',
    dialogue: [
      { speaker: 'narrator', text: 'Snow blankets Blackwood Mountain as the friends arrive at the Washington lodge.', camera: 'wide' },
      { speaker: 'josh', text: 'Welcome, everyone! Same place as always. Best weekend of the year!', mood: 'happy', camera: 'medium' },
      { speaker: 'mike', text: 'Josh, you outdid yourself. This place is incredible.', mood: 'happy', camera: 'closeup' },
      { speaker: 'sam', text: 'Where are Hannah and Beth? I thought they were coming.', mood: 'neutral', camera: 'over_shoulder' },
      { speaker: 'josh', text: 'They\'re inside. Probably fighting over the bathroom already.', mood: 'happy', camera: 'medium' },
      { speaker: 'ashley', text: 'I\'m just glad we\'re all here together.', mood: 'happy', camera: 'closeup' }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [0, 2, 5],
    choices: [
      { id: 'prologue_evening', text: 'Continue', nextScene: 'prologue_evening' },
    ],
  },

  prologue_evening: {
    id: 'prologue_evening',
    title: 'Before the Storm',
    description: 'Tension builds among friends',
    dialogue: [
      { speaker: 'narrator', text: 'The evening drags on. Some friends grow restless. Mike glances at Jessica, then at the hallway.', camera: 'wide' },
      { speaker: 'emily', text: 'Mike keeps staring at Hannah. It\'s kind of creepy.', mood: 'serious', camera: 'closeup' },
      { speaker: 'jessica', text: 'He\'s just playing around. Right, Mike?', mood: 'nervous', camera: 'over_shoulder' },
      { speaker: 'mike', text: 'Relax. I\'ve got something planned. You\'ll see.', mood: 'serious', camera: 'medium' },
      { speaker: 'hannah', text: 'Mike, this better not be another one of your—', mood: 'nervous', camera: 'closeup' },
      { speaker: 'narrator', text: 'Mike smirks and disappears down the hallway. The others exchange nervous glances.', camera: 'wide' }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [2, 1.5, 3],
    choices: [
      { id: 'prologue_prank', text: 'Continue', nextScene: 'prologue_prank' },
    ],
  },

  prologue_prank: {
    id: 'prologue_prank',
    title: 'The Prank',
    description: 'Inside the cabin - things go too far',
    dialogue: [
      { speaker: 'mike', text: 'Hannah, come here! I need to show you something in the guest room!', mood: 'happy', camera: 'medium' },
      { speaker: 'hannah', text: 'Mike, this better not be another one of your—', mood: 'nervous', camera: 'closeup' },
      { speaker: 'narrator', text: 'Hannah enters the dark room. Suddenly—lights flash! Jessica, Emily, Matt, and Ashley jump out screaming.', camera: 'over_shoulder' },
      { speaker: 'jessica', text: 'SURPRISE! Got you good, Hannah!', mood: 'happy', camera: 'closeup' },
      { speaker: 'hannah', text: '...', mood: 'scared', camera: 'closeup' },
      { speaker: 'hannah', text: 'You... you all planned this? This is humiliation!', mood: 'angry', camera: 'closeup', fearDelta: 10 }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [0, 2, 3],
    choices: [
      { id: 'prologue_hannah_runs', text: 'Continue', nextScene: 'prologue_hannah_runs' },
    ],
  },

  prologue_hannah_runs: {
    id: 'prologue_hannah_runs',
    title: 'Running',
    description: 'Hannah flees into the darkness',
    dialogue: [
      { speaker: 'narrator', text: 'Humiliated and furious, Hannah shoves past the laughing group and runs out the back door into the freezing night.', camera: 'wide' },
      { speaker: 'hannah', text: 'I can\'t believe they would do this to me!', mood: 'angry', camera: 'pov', animation: 'gesture_scared' },
      { speaker: 'narrator', text: 'Snow swirls around her as she sprints into the dark woods, tears streaming down her face.', camera: 'tracking', fearDelta: 20 },
      { speaker: 'mike', text: 'Hannah! Wait! It was just a joke!', mood: 'scared', camera: 'wide' },
      { speaker: 'narrator', text: 'But Hannah doesn\'t stop. She runs deeper into the forest, away from the lodge, away from everyone.', camera: 'pov' },
      { speaker: 'beth', text: 'Hannah! HANNAH!', mood: 'scared', camera: 'medium', animation: 'gesture_scared' }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [5, 3, 5],
    choices: [
      { id: 'prologue_beth_follows', text: 'Continue', nextScene: 'prologue_beth_follows' },
    ],
  },

  prologue_beth_follows: {
    id: 'prologue_beth_follows',
    title: 'Sisters',
    description: 'Beth chases after Hannah',
    dialogue: [
      { speaker: 'narrator', text: 'Beth Washington grabs a flashlight and bursts through the back door after her sister.', camera: 'tracking' },
      { speaker: 'beth', text: 'Hannah! Come back! You\'ll get lost out here!', mood: 'scared', camera: 'medium', animation: 'gesture_scared' },
      { speaker: 'narrator', text: 'The woods are pitch black. Beth\'s flashlight cuts through the swirling snow.', camera: 'wide' },
      { speaker: 'beth', text: 'I see you! Stop running!', mood: 'scared', camera: 'closeup', fearDelta: 15, animation: 'gesture_scared' },
      { speaker: 'narrator', text: 'But somewhere in the darkness, Hannah keeps running. Beth follows, desperate to reach her sister.', camera: 'tracking' },
      { speaker: 'beth', text: 'Please, Hannah! Just—', mood: 'scared', camera: 'over_shoulder', animation: 'gesture_scared' }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [3, 2, 4],
    choices: [
      { id: 'prologue_chase', text: 'Continue', nextScene: 'prologue_chase' },
    ],
  },

  prologue_chase: {
    id: 'prologue_chase',
    title: 'Something Follows',
    description: 'They\'re not alone in the woods',
    dialogue: [
      { speaker: 'narrator', text: 'They ran. But something was following...', camera: 'wide', fearDelta: 20 },
      { speaker: 'beth', text: 'Did you hear that? Something\'s in the trees!', mood: 'scared', camera: 'pov', animation: 'fear' },
      { speaker: 'narrator', text: 'Branches snap. Something heavy moves through the underbrush. Too fast. Too close.', camera: 'panic', fearDelta: 20 },
      { speaker: 'hannah', text: 'Beth! Run! RUN!', mood: 'scared', camera: 'tracking', animation: 'fear' },
      { speaker: 'narrator', text: 'The twins sprint together, their hearts pounding. But the thing in the woods doesn\'t give up.', camera: 'wide', fearDelta: 20 },
      { speaker: 'beth', text: 'There! A cliff! There\'s no way out!', mood: 'scared', camera: 'closeup', animation: 'fear' }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [0, 3, 6],
    choices: [
      { id: 'prologue_cliff', text: 'Continue', nextScene: 'prologue_cliff' },
    ],
  },

  prologue_cliff: {
    id: 'prologue_cliff',
    title: 'No Way Out',
    description: 'Cornered at the edge',
    dialogue: [
      { speaker: 'narrator', text: 'The twins scramble to the edge of a cliff. Below—the rocks await, shrouded in mist.', camera: 'wide' },
      { speaker: 'beth', text: 'There\'s no way out! It\'s coming!', mood: 'scared', camera: 'closeup', fearDelta: 15 },
      { speaker: 'narrator', text: 'In the darkness behind them, something moves. Tall. Skeletal. Wrong.', camera: 'over_shoulder', fearDelta: 15 },
      { speaker: 'hannah', text: 'We have to jump! It\'s the only way!', mood: 'scared', camera: 'closeup' },
      { speaker: 'beth', text: 'Hannah, no! We\'ll die!', mood: 'scared', camera: 'closeup' },
      { speaker: 'hannah', text: 'Better to fall than to let that... that THING catch us!', mood: 'scared', camera: 'closeup' }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [4, 2, 3],
    choices: [
      { id: 'prologue_fall', text: 'Jump!', nextScene: 'prologue_fall' },
    ],
  },

  prologue_fall: {
    id: 'prologue_fall',
    title: 'The Fall',
    description: 'Into the darkness',
    dialogue: [
      { speaker: 'narrator', text: 'Hand in hand, the Washington sisters leap into the void.', camera: 'wide' },
      { speaker: 'beth', text: 'AAAAHHH!', mood: 'scared', camera: 'pov' },
      { speaker: 'hannah', text: 'NOOOO!', mood: 'scared', camera: 'tracking' },
      { speaker: 'narrator', text: 'The fall lasts an eternity. The rocks below—closer, closer—', camera: 'pov', fearDelta: 30 },
      { speaker: 'narrator', text: 'Then darkness.', camera: 'wide' },
      { speaker: 'narrator', text: 'The creature at the cliff edge peers down, then retreats into the shadows.', camera: 'tracking' }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [0, 5, 8],
    choices: [
      { id: 'prologue_aftermath', text: 'Continue', nextScene: 'prologue_aftermath' },
    ],
  },

  prologue_aftermath: {
    id: 'prologue_aftermath',
    title: 'Never Found',
    description: 'The search begins...',
    dialogue: [
      { speaker: 'narrator', text: 'Hannah and Beth Washington were never found.', camera: 'wide', fearDelta: 20 },
      { speaker: 'narrator', text: 'Search teams scoured Blackwood Mountain for weeks. Nothing. No bodies. No traces.', camera: 'wide' },
      { speaker: 'narrator', text: 'The official report: lost in the wilderness. But those who searched knew... something was wrong.', camera: 'wide' },
      { speaker: 'narrator', text: 'They heard sounds in the trees. Saw shapes in the fog. And then—they stopped searching.', camera: 'wide' },
      { speaker: 'narrator', text: 'Fast forward one year. The surviving friends return to the mountain.', camera: 'wide' },
      { speaker: 'narrator', text: 'They never should have come back.', camera: 'wide' }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [0, 3, 6],
    choices: [
      { id: 'chapter1_start', text: 'One Year Later...', nextScene: 'chapter1_start' },
    ],
  },

  // CHAPTER 1 - PRESENT DAY
  chapter1_start: {
    id: 'chapter1_start',
    title: 'Chapter 1: The Return',
    description: 'One year later...',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The surviving friends return to Blackwood Mountain for the anniversary. Josh has invited them back for a memorial weekend. But not everyone is happy to be here.',
        camera: 'wide'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [-3, 2, 5],
    choices: [
      { id: 'ch1_go_arrive', text: 'Head to the lodge', nextScene: 'ch1_arrive' },
    ],
  },

  ch1_lodge_exploration: {
    id: 'ch1_lodge_exploration',
    title: 'Washington Lodge',
    description: 'The familiar yet eerie lodge',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The lodge stands silent. Fresh snow covers the ground. Something feels... different. Wrong. (Click the glowing object to investigate)',
        camera: 'wide'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [0, 2, 3],
    cameraTarget: [0, 1, 0],
    cameraControls: true,
    activeCharacter: 'sam',
    interactables: [
      { id: 'totem_guidance', position: [2, 0.5, -1], label: 'Mysterious Totem', targetScene: 'ch1_clue_found' }
    ],
    choices: [
      { id: 'ch1_skip_investigation', text: 'Find Josh instead', nextScene: 'ch1_meet_josh' }
    ],
  },

  ch1_clue_found: {
    id: 'ch1_clue_found',
    title: 'A Strange Totem',
    description: 'You found a totems',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'A guidance totem rests in the corner. It shows a vision—Emily handing Matt a flare gun. What does it mean?',
        camera: 'wide'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [3, 2, 2],
    cameraTarget: [2, 1, 1],
    cameraControls: false, // choice moment, frame nicely
    activeCharacter: 'sam',
    choices: [
      { id: 'ch1_take_totem', text: 'Take the totem', nextScene: 'ch1_night_fall', consequence: 'butterfly_totem_taken' },
      { id: 'ch1_leave_totem', text: 'Leave it', nextScene: 'ch1_night_fall' },
    ],
  },

  ch1_meet_josh: {
    id: 'ch1_meet_josh',
    title: 'Josh\'s Welcome',
    description: 'The host arrives',
    dialogue: [
      {
        speaker: 'josh',
        text: 'Glad you could make it. This weekend... it means everything to me.',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [2, 1.5, 3],
    choices: [
      { id: 'ch1_josh_friendly', text: '"Happy to be here, Josh"', nextScene: 'ch1_night_fall', consequence: 'sam:honesty:+10' },
      { id: 'ch1_josh_suspicious', text: '"What\'s really going on?"', nextScene: 'ch1_night_fall', consequence: 'sam:honesty:-10' },
    ],
  },

  ch1_night_fall: {
    id: 'ch1_night_fall',
    title: 'Night Falls',
    description: 'The storm approaches',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'A blizzard rolls in. The power flickers. Then—a scream echoes from somewhere in the lodge.',
        camera: 'wide'
      }
    ],
    choicesAt: 1,
    environment: 'cabin',
    cameraPosition: [0, 2, 4],
    choices: [
      { id: 'ch1_investigate', text: 'Investigate the sound', nextScene: 'chapter2_start' },
      { id: 'ch1_hide', text: 'Hide and wait', nextScene: 'chapter2_start_alt' },
    ],
  },

  // CHAPTER 1 - EXPANDED SCENES
  ch1_arrive: {
    id: 'ch1_arrive',
    title: 'The Arrival',
    description: 'Friends return to the lodge',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The Washington Lodge looms against the snowy mountainside. One year after the tragedy, the friends have returned.',
        camera: 'wide'
      },
      {
        speaker: 'sam',
        text: 'I still can\'t believe we\'re actually doing this. Coming back here after... everything.',
        mood: 'nervous',
        animation: 'gesture_sad',
        camera: 'medium'
      },
      {
        speaker: 'mike',
        text: 'Josh asked us to come. The least we can do is show up for our friend.',
        mood: 'serious',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'josh',
        text: 'Hey! You made it! Come on, everyone\'s inside. Took you long enough.',
        mood: 'happy',
        animation: 'gesture_happy',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'Josh waves from the lodge entrance, his smile not quite reaching his eyes. Something about him seems... different.',
        camera: 'wide'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [-5, 2, 8],
    activeCharacter: 'sam',
    choices: [
      { id: 'ch1_arrive_continue', text: 'Enter the lodge', nextScene: 'ch1_meet_sam' },
    ],
  },

  ch1_meet_sam: {
    id: 'ch1_meet_sam',
    title: 'Sam\'s Welcome',
    description: 'Meeting Sam at the door',
    dialogue: [
      {
        speaker: 'sam',
        text: 'Hey! I\'m so glad you\'re here. I... I didn\'t know if I could do this alone.',
        mood: 'happy',
        animation: 'gesture_happy',
        camera: 'closeup'
      },
      {
        speaker: 'sam',
        text: 'The lodge feels different now. Empty. Like the laughter that used to fill these halls just... stopped.',
        mood: 'sad',
        animation: 'gesture_sad',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'Sam pulls you into a hug, her grip tighter than expected. She\'s scared. But of what—the memories or something else?',
        camera: 'over_shoulder'
      },
      {
        speaker: 'sam',
        text: 'Mike and Jessica are already inside. Josh has been... weird since we arrived. Just warning you.',
        mood: 'nervous',
        animation: 'talking',
        camera: 'closeup'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [2, 1.5, 3],
    activeCharacter: 'sam',
    choices: [
      { id: 'ch1_sam_friendly', text: '"I\'m here for you"', nextScene: 'ch1_meet_mike', consequence: 'sam:relationship:+10' },
      { id: 'ch1_sam_cautious', text: '"What do you mean, weird?"', nextScene: 'ch1_meet_mike', consequence: 'sam:relationship:+5' },
    ],
  },

  ch1_meet_mike: {
    id: 'ch1_meet_mike',
    title: 'Mike\'s Attitude',
    description: 'Finding Mike in the lodge',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'Mike leans against the fireplace, arms crossed. His confident stance masks something—nervousness? Guilt?',
        camera: 'medium'
      },
      {
        speaker: 'mike',
        text: 'Well, well. The gang\'s all here. Just like old times, right?',
        mood: 'determined',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'mike',
        text: 'Look, I know this weekend is supposed to be some healing thing for Josh, but let\'s not pretend everything\'s fine.',
        mood: 'serious',
        animation: 'gesture_angry',
        camera: 'medium'
      },
      {
        speaker: 'jessica',
        text: 'Mike, stop being such a downer. We\'re supposed to be here for Josh.',
        mood: 'happy',
        animation: 'gesture_happy',
        camera: 'over_shoulder'
      },
      {
        speaker: 'mike',
        text: 'Yeah, yeah. Just... don\'t go wandering off alone. That\'s all I\'m saying.',
        mood: 'serious',
        animation: 'talking',
        camera: 'medium'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [0, 2, 4],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch1_mike_agree', text: '"We\'ll be careful"', nextScene: 'ch1_meet_jessica', consequence: 'mike:relationship:+5' },
      { id: 'ch1_mike_question', text: '"What do you know?"', nextScene: 'ch1_meet_jessica', consequence: 'mike:relationship:-5' },
    ],
  },

  ch1_meet_jessica: {
    id: 'ch1_meet_jessica',
    title: 'Jessica\'s Charm',
    description: 'Meeting Jessica',
    dialogue: [
      {
        speaker: 'jessica',
        text: 'Oh, hi! You must be the new one. Jessica. Nice to meet you... or re-meet you, I guess.',
        mood: 'happy',
        animation: 'gesture_happy',
        camera: 'closeup'
      },
      {
        speaker: 'jessica',
        text: 'Don\'t let Mike\'s brooding ruin your mood. He\'s always like this. Total drama queen.',
        mood: 'happy',
        animation: 'gesture_happy',
        camera: 'over_shoulder'
      },
      {
        speaker: 'narrator',
        text: 'Jessica loops her arm through yours, pulling you toward the stairs. Her warmth is welcoming, but her eyes dart toward the windows.',
        camera: 'medium'
      },
      {
        speaker: 'jessica',
        text: 'Between you and me? Something feels off about this place. But hey—what\'s a weekend at a creepy lodge between friends?',
        mood: 'nervous',
        animation: 'gesture_happy',
        camera: 'closeup'
      },
      {
        speaker: 'mike',
        text: 'Jess, stop scaring them. We\'re supposed to be having fun.',
        mood: 'determined',
        animation: 'talking',
        camera: 'medium'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [3, 2, 4],
    activeCharacter: 'jessica',
    choices: [
      { id: 'ch1_jess_fun', text: 'Play along', nextScene: 'ch1_explore_lobby' },
      { id: 'ch1_jess_serious', text: '"You feel it too?"', nextScene: 'ch1_explore_lobby' },
    ],
  },

  ch1_explore_lobby: {
    id: 'ch1_explore_lobby',
    title: 'The Grand Lobby',
    description: 'Exploring the lodge lobby',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The grand lobby stretches before you. Crystal chandeliers hang motionless. Dust motes dance in pale light. The silence is deafening.',
        camera: 'wide'
      },
      {
        speaker: 'narrator',
        text: 'Photographs line the walls—happy faces from years past. But among them, you notice gaps. Frames removed. Memories erased.',
        camera: 'medium'
      },
      {
        speaker: 'ashley',
        text: 'It\'s so quiet. I miss the noise. The... life in this place.',
        mood: 'sad',
        animation: 'gesture_sad',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'A grandfather clock stands silent in the corner. Its hands are frozen at midnight. Below it, something glints on the floor.',
        camera: 'closeup'
      },
      {
        speaker: 'emily',
        text: 'Did someone drop something? Or... is that new? I don\'t remember that being there before.',
        mood: 'nervous',
        animation: 'talking',
        camera: 'over_shoulder'
      },
      {
        speaker: 'narrator',
        text: 'You notice a door slightly ajar near the stairs. The kitchen. Something inside catches the light—a flickering glow.',
        camera: 'medium'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [0, 3, 6],
    cameraTarget: [0, 1, 0],
    cameraControls: true,
    activeCharacter: 'sam',
    interactables: [
      { id: 'kitchen_door', position: [4, 1, -2], label: 'Check Kitchen', targetScene: 'ch1_explore_kitchen' },
      { id: 'lobby_totem', position: [-3, 0.5, -1], label: 'Examine Strange Object', targetScene: 'ch1_clue_found' }
    ],
    choices: [],
  },

  ch1_explore_kitchen: {
    id: 'ch1_explore_kitchen',
    title: 'The Kitchen',
    description: 'Investigating the kitchen',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The kitchen is surprisingly warm. A fire crackles in the old stove. Someone has been here recently.',
        camera: 'wide'
      },
      {
        speaker: 'narrator',
        text: 'Cups of hot chocolate sit half-finished on the counter. Steam still rises from one. Four cups. But who—',
        camera: 'medium'
      },
      {
        speaker: 'matt',
        text: 'Woah, hey! I didn\'t hear you come in. Just... warming up, you know?',
        mood: 'nervous',
        animation: 'gesture_happy',
        camera: 'closeup'
      },
      {
        speaker: 'matt',
        text: 'Josh made these for us. Said it was tradition. The hot chocolate, I mean. Before... everything.',
        mood: 'sad',
        animation: 'gesture_sad',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'On the refrigerator door, held by a magnet shaped like a deer, is a note in Josh\'s handwriting: "THE TRUTH LIES BELOW."',
        camera: 'closeup'
      },
      {
        speaker: 'emily',
        text: 'What does that mean? Below? Like... the basement?',
        mood: 'nervous',
        animation: 'talking',
        camera: 'over_shoulder'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [2, 2, 4],
    cameraTarget: [3, 1.5, 0],
    activeCharacter: 'matt',
    choices: [
      { id: 'ch1_ignore_note', text: 'Ignore the note', nextScene: 'ch1_lodge_exploration' },
      { id: 'ch1_ask_josh', text: 'Confront Josh about it', nextScene: 'ch1_meet_josh', fearDelta: 5 },
    ],
  },

  // CHAPTER 2
  chapter2_start: {
    id: 'chapter2_start',
    title: 'Chapter 2: The Disappearance',
    description: 'After the scream...',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'A blood-curdling scream pierces the night. It came from upstairs—Jessica\'s room. You bolt toward the stairs, heart pounding.',
        camera: 'wide'
      },
      {
        speaker: 'mike',
        text: 'JESSICA!',
        mood: 'scared',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'Mike sprints past you, fear etched on his face. Something is terribly wrong.',
        camera: 'medium'
      },
      {
        speaker: 'sam',
        text: 'Wait! Mike, wait—',
        mood: 'scared',
        animation: 'talking',
        camera: 'over_shoulder'
      }
    ],
    choicesAt: 1,
    environment: 'cabin',
    cameraPosition: [0, 2, 4],
    cameraTarget: [0, 1.5, 2],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_follow_mike', text: 'Follow Mike', nextScene: 'ch2_scream_heard' },
    ],
  },

  ch2_scream_heard: {
    id: 'ch2_scream_heard',
    title: 'Jessica\'s Room',
    description: 'The source of the scream',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You reach Jessica\'s room. The door hangs open. Inside—empty. The window is thrown wide open, snow drifting onto the floor.',
        camera: 'wide'
      },
      {
        speaker: 'mike',
        text: 'No... no, no, no! Jess!',
        mood: 'scared',
        animation: 'gesture_angry',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'Mike rushes to the window, staring into the black void beyond. His hands are shaking.',
        camera: 'over_shoulder'
      },
      {
        speaker: 'mike',
        text: 'She wouldn\'t just leave. She wouldn\'t. Something took her. Something—',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'sam',
        text: 'Mike, we need to think. There has to be an explanation.',
        mood: 'nervous',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'Outside, the wind howls. In the snow below the window, you see disturbed marks. Something was dragged away.',
        camera: 'closeup',
        mood: 'scared'
      }
    ],
    choicesAt: 1,
    environment: 'cabin',
    cameraPosition: [2, 2, 3],
    cameraTarget: [4, 1, 0],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_search_room', text: 'Search the room', nextScene: 'ch2_search_room', fearDelta: 10 },
    ],
  },

  ch2_search_room: {
    id: 'ch2_search_room',
    title: 'Searching for Clues',
    description: 'What happened here?',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You scan the room. Jessica\'s phone lies on the floor, screen cracked. Her jacket is gone. She left in a hurry—or was taken.',
        camera: 'medium'
      },
      {
        speaker: 'emily',
        text: 'Her phone! But she never goes anywhere without it. Something\'s wrong. Something is really wrong.',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'mike',
        text: 'I\'m going after her. That\'s it. I\'m going into those woods and I\'m bringing her back.',
        mood: 'determined',
        animation: 'gesture_angry',
        camera: 'medium'
      },
      {
        speaker: 'ashley',
        text: 'Mike, no! You can\'t go out there alone. That\'s crazy!',
        mood: 'scared',
        animation: 'gesture_angry',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'On the nightstand, you notice something else—a small totem, shaped like a wolf. It wasn\'t there before.',
        camera: 'closeup'
      },
      {
        speaker: 'sam',
        text: 'That\'s... that\'s not Jessica\'s. Who put that there?',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      }
    ],
    choicesAt: 1,
    environment: 'cabin',
    cameraPosition: [1, 1.5, 2],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_outside', text: 'Go outside', nextScene: 'ch2_discover_trail', fearDelta: 5 },
    ],
  },

  ch2_discover_trail: {
    id: 'ch2_discover_trail',
    title: 'The Trail',
    description: 'Something dragged through the snow',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You step outside into the freezing night. The snow is pristine white—except for a trail of disturbed powder leading into the woods.',
        camera: 'wide'
      },
      {
        speaker: 'narrator',
        text: 'The trail splits. One set of footprints—smaller, lighter. Jessica. The other marks are deeper. Wider. Something else walked beside her.',
        camera: 'medium',
        mood: 'scared'
      },
      {
        speaker: 'mike',
        text: 'Those aren\'t human footprints. What the hell is out here?',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'jessica',
        text: '...Mike? Is that you? Help me! PLEASE—',
        mood: 'scared',
        animation: 'talking',
        camera: 'pov'
      },
      {
        speaker: 'narrator',
        text: 'The voice echoes from somewhere deep in the darkness. Then—silence.',
        camera: 'wide',
        mood: 'scared'
      },
      {
        speaker: 'mike',
        text: 'I\'m coming, Jess! Hold on!',
        mood: 'scared',
        animation: 'talking',
        camera: 'medium'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [0, 2, 5],
    cameraTarget: [0, 1, -5],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_follow_trail', text: 'Follow the trail', nextScene: 'ch2_woods_entry', fearDelta: 15 },
    ],
  },

  ch2_woods_entry: {
    id: 'ch2_woods_entry',
    title: 'Into the Dark',
    description: 'The forest awaits',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You enter the tree line. The woods swallow you whole. Between the black branches, you see nothing but shadows.',
        camera: 'wide'
      },
      {
        speaker: 'narrator',
        text: 'The trees grow denser. The moonlight barely penetrates the canopy. You can barely see your hand in front of your face.',
        camera: 'medium',
        mood: 'scared'
      },
      {
        speaker: 'sam',
        text: 'This is insane. We\'re going to get lost out here. We should go back, get help—',
        mood: 'nervous',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'mike',
        text: 'Jessica is out here. Alone. I\'m not leaving her.',
        mood: 'determined',
        animation: 'gesture_angry',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'A branch snaps somewhere to your left. Then to your right. Something is moving through the forest around you.',
        camera: 'pov',
        mood: 'scared'
      },
      {
        speaker: 'ashley',
        text: 'I hear it. Do you hear that? Breathing. Something is watching us!',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [-3, 2, 4],
    cameraTarget: [0, 1, -3],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_keep_going', text: 'Push forward', nextScene: 'ch2_woods_deep', fearDelta: 10 },
      { id: 'ch2_stay_quiet', text: 'Stay quiet and listen', nextScene: 'ch2_woods_deep', fearDelta: 5 },
    ],
  },

  ch2_woods_deep: {
    id: 'ch2_woods_deep',
    title: 'Lost in the Woods',
    description: 'Getting deeper',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The forest grows darker, more oppressive. You\'ve been walking for what feels like hours. The trail has faded completely.',
        camera: 'wide',
        mood: 'scared'
      },
      {
        speaker: 'mike',
        text: 'I don\'t know where we are anymore. I can\'t see the lodge. I can\'t see anything.',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'emily',
        text: 'My phone has no signal. We\'re completely cut off. This is bad. This is really, really bad.',
        mood: 'scared',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'The trees around you begin to twist into unnatural shapes. Something about this forest feels wrong. Ancient. Hungry.',
        camera: 'pov',
        mood: 'scared'
      },
      {
        speaker: 'sam',
        text: 'Look! Over there—is that a light? Someone\'s cabin?',
        mood: 'hopeful',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'A flickering light cuts through the darkness. But between you and the light, a massive shape moves. Tall. Skeletal. Wrong.',
        camera: 'wide',
        mood: 'scared'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [0, 3, 3],
    cameraTarget: [2, 1.5, -2],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_toward_light', text: 'Run toward the light', nextScene: 'ch2_woods_chase', fearDelta: 15 },
      { id: 'ch2_away_shape', text: 'Sneak away from the shape', nextScene: 'ch2_wendigo_sighting' },
    ],
  },

  ch2_woods_chase: {
    id: 'ch2_woods_chase',
    title: 'The Chase',
    description: 'Running for your life',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You sprint toward the light, branches tearing at your face. Behind you—footsteps. Fast. Getting closer.',
        camera: 'medium',
        mood: 'scared'
      },
      {
        speaker: 'mike',
        text: 'MOVE! RUN! DON\'T LOOK BACK!',
        mood: 'scared',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'A guttural growl erupts from the darkness behind you. Then you hear it—a high-pitched screech that makes your blood freeze.',
        camera: 'pov',
        mood: 'scared'
      },
      {
        speaker: 'ashley',
        text: 'It\'s following us! It\'s not stopping!',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'You burst into a small clearing. An old miner\'s cabin stands there, door ajar. The only shelter for miles.',
        camera: 'wide'
      },
      {
        speaker: 'sam',
        text: 'In there! Now!',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [-2, 2, 4],
    cameraTarget: [2, 1, 0],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_run_cabin', text: 'Burst into cabin', nextScene: 'ch2_scattered', fearDelta: 30 },
      { id: 'ch2_split_up', text: 'Split up to confuse it', nextScene: 'ch2_scattered', fearDelta: 45 },
    ],
  },

  ch2_wendigo_sighting: {
    id: 'ch2_wendigo_sighting',
    title: 'The Creature',
    description: 'First sight of the monster',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You press yourself against a tree, barely breathing. Through the branches, you see it clearly for the first time.',
        camera: 'closeup',
        mood: 'scared'
      },
      {
        speaker: 'narrator',
        text: 'A creature. Tall—impossibly tall. Its body is skeletal, wrapped in grayish skin. Its arms hang too long, ending in jagged claws.',
        camera: 'wide',
        mood: 'scared'
      },
      {
        speaker: 'narrator',
        text: 'But worst of all are its eyes. Two glowing red orbs that burn in the darkness. They scan the forest... searching.',
        camera: 'closeup',
        mood: 'scared'
      },
      {
        speaker: 'emily',
        text: 'Oh my god. Oh my god. What IS that?!',
        mood: 'scared',
        animation: 'talking',
        camera: 'pov'
      },
      {
        speaker: 'narrator',
        text: 'The creature\'s head snaps toward your direction. It sniffs the air. It knows you\'re here.',
        camera: 'closeup',
        mood: 'scared'
      },
      {
        speaker: 'mike',
        text: 'Don\'t. Move. Don\'t. Breathe.',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [3, 2, 3],
    cameraTarget: [-2, 2, -3],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_run_for_it', text: 'Run!', nextScene: 'ch2_scattered', fearDelta: 40 },
      { id: 'ch2_still_hope', text: 'Stay perfectly still', nextScene: 'ch2_scattered', fearDelta: 35 },
    ],
  },

  ch2_scattered: {
    id: 'ch2_scattered',
    title: 'Separated',
    description: 'Lost and alone',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'Panic takes over. The group scatters in all directions. You find yourself alone in the darkness, heart hammering against your ribs.',
        camera: 'pov',
        mood: 'scared'
      },
      {
        speaker: 'narrator',
        text: 'You can hear footsteps—yours, you think. But also others. Branches snapping. Something breathing. Something close.',
        camera: 'medium',
        mood: 'scared'
      },
      {
        speaker: 'ashley',
        text: 'Is anyone there? Please... please be there!',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'A hand grabs your shoulder. You nearly scream before you recognize the face—Mike. He\'s terrified.',
        camera: 'medium'
      },
      {
        speaker: 'mike',
        text: 'Shh! Over here. I found... I found something. A shed. We can hide.',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'Behind Mike, you see more figures emerging from the darkness. The others made it too. But Jessica is not with them.',
        camera: 'wide',
        mood: 'scared'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [0, 2, 3],
    cameraTarget: [1, 1, 0],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_to_shed', text: 'Follow Mike', nextScene: 'ch2_find_mike', fearDelta: 15 },
    ],
  },

  ch2_find_mike: {
    id: 'ch2_find_mike',
    title: 'The Old Shed',
    description: 'A moment of safety',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You crouch in the old shed, barely breathing. Through gaps in the wood, you watch the darkness beyond.',
        camera: 'medium',
        mood: 'scared'
      },
      {
        speaker: 'mike',
        text: 'Okay. Okay, everyone\'s here. We\'re all here. Where\'s Jessica? Has anyone seen Jessica?',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'The group looks around. Faces pale. No one has seen her since the woods swallowed her.',
        camera: 'wide'
      },
      {
        speaker: 'sam',
        text: 'Mike... we have to accept that Jessica might be...',
        mood: 'sad',
        animation: 'gesture_sad',
        camera: 'medium'
      },
      {
        speaker: 'mike',
        text: 'No! She\'s alive. She has to be. I won\'t leave her out there. Not like this.',
        mood: 'scared',
        animation: 'gesture_angry',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'Outside, something howls. Long. Primal. Then—silence. The creature is waiting. And so are you.',
        camera: 'wide',
        mood: 'scared'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [1, 1.5, 2],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_wait_dawn', text: 'Wait for dawn', nextScene: 'ch2_regroup', fearDelta: 10 },
      { id: 'ch2_go_back_out', text: 'Go back out there', nextScene: 'ch2_regroup', fearDelta: 25 },
    ],
  },

  ch2_regroup: {
    id: 'ch2_regroup',
    title: 'Survivors',
    description: 'Holding on until morning',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'Hours pass. The cold seeps into your bones. But the creature doesn\'t return. Maybe—maybe it\'s gone.',
        camera: 'wide'
      },
      {
        speaker: 'emily',
        text: 'Look—the sky. It\'s getting lighter. Dawn is coming.',
        mood: 'hopeful',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'True to her word, gray light begins to creep over the horizon. The woods that seemed so terrifying now look almost... normal.',
        camera: 'wide'
      },
      {
        speaker: 'ashley',
        text: 'We made it. We actually made it through the night.',
        mood: 'happy',
        animation: 'gesture_happy',
        camera: 'medium'
      },
      {
        speaker: 'mike',
        text: 'We need to get back to the lodge. Find a phone. Get help. And find Jessica.',
        mood: 'determined',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'As the sun rises over Blackwood Mountain, the group begins the long trek back. But the nightmare isn\'t over. It\'s only just beginning.',
        camera: 'wide',
        mood: 'serious'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [-5, 3, 8],
    cameraTarget: [0, 1, 0],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_return_lodge', text: 'Return to the lodge', nextScene: 'chapter3_start', fearDelta: 15 },
    ],
  },

  chapter2_start_alt: {
    id: 'chapter2_start_alt',
    title: 'Chapter 2: Hiding',
    description: 'Too afraid to move...',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You cower in the shadows, paralyzed by fear. Minutes that feel like hours pass. Then Mike bursts in, breathless.',
        camera: 'wide'
      },
      {
        speaker: 'mike',
        text: 'Jessica\'s gone! I heard her scream and when I got to her room—the window was open! She\'s in the woods!',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'Mike grabs a flashlight, his hands trembling. He\'s going into those woods, with or without you.',
        camera: 'medium'
      },
      {
        speaker: 'sam',
        text: 'We have to go with him. We can\'t let him go alone out there.',
        mood: 'scared',
        animation: 'talking',
        camera: 'over_shoulder'
      }
    ],
    choicesAt: 1,
    environment: 'cabin',
    cameraPosition: [-2, 2, 2],
    cameraTarget: [0, 1, 0],
    activeCharacter: 'mike',
    choices: [
      { id: 'ch2_search_together', text: 'Search together', nextScene: 'ch2_scream_heard', fearDelta: 5 },
      { id: 'ch2_stay_hidden', text: 'Stay hidden', nextScene: 'ch2_woods_chase', fearDelta: 15 },
    ],
  },

  chapter3_start: {
    id: 'chapter3_start',
    title: 'Chapter 3: Secrets',
    description: 'Back at the lodge',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'Dawn breaks weakly over Blackwood Mountain. The survivors have regrouped at the lodge, but the night\'s terror still haunts their faces.',
        camera: 'wide'
      },
      {
        speaker: 'sam',
        text: 'I can\'t believe Jessica is still out there. We have to go back for her.',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'mike',
        text: 'And what? Walk right back into that thing\'s territory? We barely made it out alive.',
        mood: 'scared',
        animation: 'gesture_angry',
        camera: 'medium'
      },
      {
        speaker: 'emily',
        text: 'Josh is still missing too. This whole weekend was a setup. He planned this.',
        mood: 'angry',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'The lodge feels colder now. Whatever happened here, it\'s far from over. Strange shadows dance on the walls.',
        camera: 'medium',
        mood: 'scared'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [-3, 2, 5],
    activeCharacter: 'sam',
    choices: [
      { id: 'ch3_find_others', text: 'Search for missing friends', nextScene: 'chapter3_gather', fearDelta: 10 },
      { id: 'ch3_spirit_board', text: 'Try the spirit board', nextScene: 'ch3_spirit_scene' },
      { id: 'ch3_search_lodge', text: 'Search the lodge instead', nextScene: 'ch3_lodge_search' },
    ],
  },

  chapter3_gather: {
    id: 'chapter3_gather',
    title: 'Regrouping',
    description: 'Finding the others',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You search the lodge corridors, calling out names. Finally, you hear responses from multiple directions.',
        camera: 'wide'
      },
      {
        speaker: 'ashley',
        text: 'Over here! Oh thank god, I thought I was alone in this place.',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'matt',
        text: 'Emily! I\'ve been looking everywhere for you. Are you okay?',
        mood: 'scared',
        animation: 'gesture_happy',
        camera: 'medium'
      },
      {
        speaker: 'emily',
        text: 'I\'m fine. But Josh... I saw him running into the woods earlier. He looked completely insane.',
        mood: 'nervous',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'The group gathers in the main hall. Seven of them remain. Jessica and Josh are still missing. And that thing—whatever it is—could still be out there.',
        camera: 'wide'
      },
      {
        speaker: 'sam',
        text: 'We need to stick together. Whatever happens next, we face it as a group.',
        mood: 'determined',
        animation: 'talking',
        camera: 'medium'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [0, 2, 4],
    activeCharacter: 'sam',
    aiDriven: true,
    choices: [
      { id: 'ch3_gather_continue', text: 'Stay together', nextScene: 'chapter3_lodge_return', fearDelta: 5 },
    ],
  },

  chapter3_lodge_return: {
    id: 'chapter3_lodge_return',
    title: 'Locked In',
    description: 'Nowhere left to run',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You barricade the doors and windows. The lodge becomes your fortress—but also your prison.',
        camera: 'wide'
      },
      {
        speaker: 'mike',
        text: 'This won\'t hold that thing for long. Look at those arms—it could rip through these doors like paper.',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'ashley',
        text: 'Maybe we should try to leave. Get to the cars and just... drive.',
        mood: 'nervous',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'emily',
        text: 'And go where? That thing is out there somewhere. At least in here we have walls between us and it.',
        mood: 'scared',
        animation: 'gesture_angry',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'A sound echoes from outside—something heavy dragging across the porch. Then scratching. Patient. Hungry.',
        camera: 'closeup',
        mood: 'scared'
      },
      {
        speaker: 'sam',
        text: 'It knows we\'re in here. It\'s... it\'s testing the doors.',
        mood: 'scared',
        animation: 'talking',
        camera: 'pov'
      }
    ],
    choicesAt: 1,
    environment: 'lodge',
    cameraPosition: [2, 2, 3],
    cameraTarget: [0, 1.5, 0],
    activeCharacter: 'sam',
    choices: [
      { id: 'ch3_prepare_fight', text: 'Prepare to fight', nextScene: 'chapter3_fight', fearDelta: 20 },
      { id: 'ch3_look_weapons', text: 'Search for weapons', nextScene: 'chapter3_fight', fearDelta: 15 },
    ],
  },

  chapter3_fight: {
    id: 'chapter3_fight',
    title: 'Confrontation',
    description: 'Standing your ground',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The creature lunges. You barely escape, stumbling back to the lodge with scratches and torn clothes. But you saw it clearly. Not human. Not animal. Something ancient.',
        camera: 'wide',
        mood: 'scared'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    activeCharacter: 'sam',
    choices: [
      { id: 'ch3_fight_continue', text: 'Continue', nextScene: 'chapter3_start', fearDelta: 20 },
    ],
  },

  chapter3_lodge: {
    id: 'chapter3_lodge',
    title: 'Chapter 3: Alone',
    description: 'The lodge at night',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'While others search, you stay at the lodge. Strange noises echo through the halls. Then you hear it—a breathing behind you.',
        camera: 'wide'
      }
    ],
    choicesAt: 1,
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
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The planchette moves. "B-E-T-H" It spells out a name. Then: "R-U-N". The door slammed shut on its own.',
        camera: 'wide',
        mood: 'scared'
      }
    ],
    choicesAt: 1,
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
    dialogue: [
      {
        speaker: 'narrator',
        text: 'In Josh\'s room, you find hidden cameras. He\'s been watching everyone. But there\'s something else—a newspaper clipping about the 1952 mining accident.',
        camera: 'wide'
      }
    ],
    choicesAt: 1,
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
    dialogue: [
      {
        speaker: 'stranger',
        text: 'The Wendigos... they were men once. Starving miners who ate the flesh of their own.',
        mood: 'serious',
        animation: 'talking',
        camera: 'closeup'
      }
    ],
    choicesAt: 1,
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
    dialogue: [
      {
        speaker: 'stranger',
        text: '"1952. Twelve men trapped in the mines. They ate each other to survive. The ones who survived... became something else. They hunger for human flesh."',
        mood: 'warning',
        animation: 'gesture_angry',
        camera: 'speaker'
      },
      {
        speaker: 'mike',
        text: 'So you\'re saying... that thing was a person once? A human being?',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'stranger',
        text: 'Not just one. There are more. Much more. The mountain is their hunting ground—and we\'re the prey.',
        mood: 'serious',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'The Stranger\'s face is weathered, scarred by years of fear and survival. He\'s seen this before. Many times.',
        camera: 'closeup'
      },
      {
        speaker: 'sam',
        text: 'How do we stop them? Is there... is there any way to kill these things?',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'stranger',
        text: 'Fire. Fire is the only thing that drives them back. And sunlight. They cannot survive the dawn.',
        mood: 'determined',
        animation: 'talking',
        camera: 'medium'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [4, 2, 5],
    choices: [
      { id: 'ch4_learn_more', text: 'Learn more about the Wendigos', nextScene: 'ch4_learn_wendigo', fearDelta: 10 },
    ],
  },

  ch4_learn_wendigo: {
    id: 'ch4_learn_wendigo',
    title: 'The Legend',
    description: 'Understanding the enemy',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The Stranger leads you deeper into the woods, away from the lodge. His flashlight flickers ominously.',
        camera: 'wide'
      },
      {
        speaker: 'stranger',
        text: 'The miners weren\'t the first. This mountain... it\'s cursed land. Native tribes knew to stay away. They left offerings.',
        mood: 'serious',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'emily',
        text: 'So this has been happening for... how long? Years? Decades?',
        mood: 'scared',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'stranger',
        text: 'Centuries. Maybe longer. The mountain remembers what men forget. And it feeds.',
        mood: 'warning',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'You notice symbols carved into the trees—ancient marks that seem to glow faintly in the darkness.',
        camera: 'medium'
      },
      {
        speaker: 'mike',
        text: 'What are these? Some kind of protection?',
        mood: 'nervous',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'stranger',
        text: 'Wards. They keep the Wendigos from certain areas. But they\'re old. Some have already faded. The creatures know the paths.',
        mood: 'serious',
        animation: 'talking',
        camera: 'medium'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [0, 2, 4],
    activeCharacter: 'stranger',
    aiDriven: true,
    choices: [
      { id: 'ch4_ask_path', text: '"How do we escape?"', nextScene: 'ch4_split_decision', fearDelta: 15 },
    ],
  },

  ch4_split_decision: {
    id: 'ch4_split_decision',
    title: 'The Choice',
    description: 'Fight or flee',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The Stranger stops at a fork in the trail. Two paths lie before you—one leads to the cable station, the other to the old mines.',
        camera: 'wide'
      },
      {
        speaker: 'stranger',
        text: 'The cable car is your best bet for escape. But it\'s a long walk through open ground. The mines are faster—but that\'s where they nest.',
        mood: 'serious',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'sam',
        text: 'What about Jessica? And Josh? We can\'t just leave them.',
        mood: 'scared',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'mike',
        text: 'Josh probably planned this whole thing. He\'s the one who brought us here. And Jessica... we tried to save her.',
        mood: 'angry',
        animation: 'gesture_angry',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'A distant howl echoes through the mountains. Time is running out. The Wendigos are hunting, and soon the sun will set again.',
        camera: 'wide',
        mood: 'scared'
      },
      {
        speaker: 'stranger',
        text: 'Whatever you decide—you have to choose now. The night is coming, and with it... them.',
        mood: 'warning',
        animation: 'talking',
        camera: 'medium'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [-3, 2, 5],
    activeCharacter: 'sam',
    choices: [
      { id: 'ch4_cable_route', text: 'Take the cable route', nextScene: 'chapter5_start', fearDelta: 20 },
      { id: 'ch4_mine_route', text: 'Take the mine route', nextScene: 'chapter5_start', fearDelta: 25 },
    ],
  },

  // CHAPTER 5 - FINAL
  chapter5_start: {
    id: 'chapter5_start',
    title: 'Chapter 5: Until Dawn',
    description: 'The final hours',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'Night falls once more over Blackwood Mountain. The final night. The Wendigos are closing in, their screams echoing through the trees.',
        camera: 'wide',
        mood: 'scared'
      },
      {
        speaker: 'sam',
        text: 'The cable station is just ahead. If we can make it there before dawn...',
        mood: 'scared',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'mike',
        text: 'Don\'t jinx it. We\'ve got maybe two hours until sunrise. Two hours to stay alive.',
        mood: 'determined',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'In the distance, you see the outline of the cable car station. But between you and safety lies open ground—perfect hunting ground.',
        camera: 'wide'
      },
      {
        speaker: 'emily',
        text: 'I can see them. In the trees. Dozens of glowing eyes. They\'re waiting.',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'stranger',
        text: 'Stay close. Move fast. And whatever you do—don\'t run unless you have to. They\'re faster than us.',
        mood: 'serious',
        animation: 'talking',
        camera: 'medium'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [0, 3, 7],
    activeCharacter: 'sam',
    aiDriven: true,
    choices: [
      { id: 'ch5_prepare_move', text: 'Prepare to make a run for it', nextScene: 'ch5_prepare', fearDelta: 20 },
    ],
  },

  ch5_prepare: {
    id: 'ch5_prepare',
    title: 'The Last Stand',
    description: 'Final preparations',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You crouch behind an old cabin, catching your breath. The station is only a few hundred yards away, but the path is exposed.',
        camera: 'wide'
      },
      {
        speaker: 'ashley',
        text: 'I can\'t do this. I can\'t. There\'s too many of them.',
        mood: 'scared',
        animation: 'gesture_sad',
        camera: 'closeup'
      },
      {
        speaker: 'matt',
        text: 'Hey, look at me. We\'re going to get through this. All of us. You hear me?',
        mood: 'determined',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'The Stranger checks his shotgun—only two shells left. It won\'t be enough. Nothing will be enough if they all attack at once.',
        camera: 'medium'
      },
      {
        speaker: 'sam',
        text: 'We need a distraction. Someone needs to draw them away while the others run.',
        mood: 'serious',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'mike',
        text: 'I\'ll do it. I\'m the fastest. Just get to the cable car and don\'t look back.',
        mood: 'determined',
        animation: 'gesture_angry',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'A branch snaps nearby. The Wendigos have found you. There\'s no more time for planning.',
        camera: 'closeup',
        mood: 'scared'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [2, 1.5, 3],
    activeCharacter: 'sam',
    aiDriven: true,
    choices: [
      { id: 'ch5_charge', text: 'Charge forward together', nextScene: 'ch5_confrontation', fearDelta: 30 },
      { id: 'ch5_distraction', text: 'Use Mike as distraction', nextScene: 'ending_sacrifice', fearDelta: 35 },
    ],
  },

  ch5_confrontation: {
    id: 'ch5_confrontation',
    title: 'Face the Darkness',
    description: 'The final push',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'You sprint across the open ground. Behind you, the woods erupt into movement—shapes lunging from the shadows.',
        camera: 'medium',
        mood: 'scared'
      },
      {
        speaker: 'mike',
        text: 'KEEP RUNNING! DON\'T STOP!',
        mood: 'scared',
        animation: 'talking',
        camera: 'closeup'
      },
      {
        speaker: 'narrator',
        text: 'A Wendigo bursts from the trees to your right—close enough to touch. Its jaw unhinges, revealing row after row of jagged teeth.',
        camera: 'closeup',
        mood: 'scared'
      },
      {
        speaker: 'stranger',
        text: 'NOW! SHOOT IT!',
        mood: 'scared',
        animation: 'talking',
        camera: 'medium'
      },
      {
        speaker: 'narrator',
        text: 'The shotgun roars. The creature shrieks—but doesn\'t fall. It keeps coming, burned but not stopped.',
        camera: 'medium',
        mood: 'scared'
      },
      {
        speaker: 'sam',
        text: 'The cable car! It\'s right there! We\'re going to make it!',
        mood: 'scared',
        animation: 'talking',
        camera: 'pov'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [-3, 2, 5],
    activeCharacter: 'sam',
    choices: [
      { id: 'ch5_reach_cable', text: 'Reach the cable car', nextScene: 'ending_survival', fearDelta: 25 },
      { id: 'ch5_last_stand', text: 'Make a final stand', nextScene: 'ending_sacrifice', fearDelta: 40 },
    ],
  },

  ending_sacrifice: {
    id: 'ending_sacrifice',
    title: 'The Dawn',
    description: 'Not everyone makes it...',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'The group scatters through the mines. Some escape. Others are lost to the darkness. But as the sun rises over Blackwood Mountain, the creatures retreat into the shadows.',
        camera: 'wide',
        mood: 'somber'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [0, 4, 8],
    aiDriven: true,
    choices: [
      { id: 'ending_restart', text: 'Play Again', nextScene: 'prologue_start' },
    ],
  },

  ending_survival: {
    id: 'ending_survival',
    title: 'Together Until Dawn',
    description: 'You survived... together',
    dialogue: [
      {
        speaker: 'narrator',
        text: 'Through courage and teamwork, the survivors make it to the cable car. The sun rises, casting golden light across the snow. Against all odds, you lived through the night.',
        camera: 'wide',
        mood: 'hopeful'
      }
    ],
    choicesAt: 1,
    environment: 'woods',
    cameraPosition: [0, 4, 8],
    aiDriven: true,
    choices: [
      { id: 'ending_restart', text: 'Play Again', nextScene: 'prologue_start' },
    ],
  },
};

export const getScene = (sceneId: string): Scene => {
  return storyScenes[sceneId] || storyScenes.prologue_start;
};
