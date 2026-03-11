export const QUEST_GUIDE_SECTIONS = [
  {
    title: "Quest IDs and Planning",
    body: "Assign logical Quest IDs to NPCs and define the state flow before writing script.",
    points: [
      "Use Quest IDs as an abstraction layer over scattered NPC IDs.",
      "Keep a flow list of every transition and failure/backtrack path.",
      "Treat item checks and input links as explicit branch points.",
    ],
  },
  {
    title: "File Naming and Start NPC",
    body: "Name files by quest ID (for example 00013.eqf), or use startnpc to decouple file ID from the starting NPC.",
    points: [
      "Traditional behavior starts quest by matching NPC quest ID to filename quest ID.",
      "startnpc allows a different quest-start binding and multi-quest NPC patterns.",
    ],
  },
  {
    title: "Main Block Contract",
    body: "Main declares quest metadata and startup constraints that remain global for the script.",
    points: [
      'Required: questname "..." and version.',
      "Optional constraints: hidden, hidden_end, disabled, minlevel/maxlevel, needadmin/needclass/needquest, startnpc.",
      "Version increments are used by some server builds for migration/reset behavior.",
    ],
    example: `Main
{
	questname	"Skywonder Rescue"
	version		1.0
	startnpc	13
}`,
  },
  {
    title: "State Structure",
    body: "Begin is mandatory as the initial state. Each state should define intent, behavior, and transition conditions.",
    points: [
      "desc defines quest-book objective text.",
      "action executes behavior within current state.",
      "rule declarations must end in goto StateName.",
      "Use explicit backtracking rules for volatile requirements (for example LostItems).",
    ],
    example: `State GetBirdFeathers
{
	desc	"Find 10 bird feathers"
	rule	GotItems(299,10) goto GiveFeathers
}`,
  },
  {
    title: "Dialog and Input Routing",
    body: "Dialog is usually composed with AddNpcText + AddNpcInput, then routed via InputNpc(InputID).",
    points: [
      "Keep Input IDs stable and non-zero; 0 is reserved for cancel.",
      "Place NPC fallback text in subsequent states so repeated interaction is deterministic.",
      "Use one state per meaningful dialog phase rather than mixing unrelated conditions.",
    ],
  },
  {
    title: "Progress Gating",
    body: "Rules control progression via interactions, items, kills, movement, stats, and timers.",
    points: [
      "Typical item pattern: GotItems forward, LostItems backward.",
      "Coordinate/map checks should include player guidance via ShowHint/AddNpcText.",
      "Avoid hidden transitions where a player cannot infer required action.",
    ],
  },
  {
    title: "Completion Semantics",
    body: "Finalize rewards in a terminal state, then choose repeatable or permanent completion strategy.",
    points: [
      "Use RemoveItem before payout when turning in resources.",
      "Use End() for one-time quest history completion.",
      "Use Reset()/ResetDaily() for repeat loops with predictable cadence.",
    ],
  },
  {
    title: "Extensibility",
    body: "Custom actions/rules generally require server-side changes (often in quest.cpp and related event points).",
    points: [
      "Keep custom command names distinct from stock EO+ command names.",
      "Document argument contract and side effects for future script maintainers.",
    ],
  },
];

export const QUEST_MAIN_DECLARATION_TEMPLATES = [
  'questname "New Quest"',
  "version 1.0",
  "hidden",
  "hidden_end",
  "disabled",
  "minlevel 1",
  "maxlevel 250",
  "needadmin 0",
  "needclass 0",
  "needquest 0",
  "startnpc 13",
];

export const QUEST_ACTION_TEMPLATES = [
  {
    name: "AddNpcText",
    snippet: 'AddNpcText(13, "Hello there.");',
    description: "Add NPC dialog text.",
  },
  {
    name: "AddNpcInput",
    snippet: 'AddNpcInput(13, 1, "Continue");',
    description: "Add a clickable dialog input.",
  },
  {
    name: "AddNpcChat",
    snippet: 'AddNpcChat(13, "Good luck.");',
    description: "Add NPC chat balloon text.",
  },
  {
    name: "AddNpcPM",
    snippet: 'AddNpcPM("Guide", "Welcome.");',
    description: "Add PM-style dialog text.",
  },
  {
    name: "ShowHint",
    snippet: 'ShowHint("Check your quest log.");',
    description: "Show a hint in the client information bar.",
  },
  {
    name: "RemoveItem",
    snippet: "RemoveItem(299, 10);",
    description: "Remove items from inventory.",
  },
  {
    name: "GiveItem",
    snippet: "GiveItem(1, 500);",
    description: "Give item reward.",
  },
  {
    name: "GiveExp",
    snippet: "GiveExp(500);",
    description: "Give EXP reward.",
  },
  {
    name: "GiveKarma",
    snippet: "GiveKarma(10);",
    description: "Give karma.",
  },
  {
    name: "GiveStat",
    snippet: "GiveStat(level, 1);",
    description: "Increase a stat by amount.",
  },
  {
    name: "GiveBankItem",
    snippet: "GiveBankItem(1, 1);",
    description: "Give item directly to bank.",
  },
  {
    name: "GiveRandomItem",
    snippet: "GiveRandomItem(RewardPool);",
    description: "Give random item from random block.",
  },
  {
    name: "SetState",
    snippet: 'SetState("Begin");',
    description: "Force current quest state.",
  },
  {
    name: "SetClass",
    snippet: "SetClass(2);",
    description: "Set player class.",
  },
  {
    name: "SetRace",
    snippet: "SetRace(1);",
    description: "Set player race.",
  },
  {
    name: "SetTitle",
    snippet: 'SetTitle("Hero");',
    description: "Set player title.",
  },
  {
    name: "SetMap",
    snippet: "SetMap(1, 100, 100);",
    description: "Warp player to map coordinate.",
  },
  {
    name: "SetCoord",
    snippet: "SetCoord(1, 100, 100);",
    description: "Set player coordinate on a map.",
  },
  {
    name: "SetHome",
    snippet: 'SetHome("Aeven");',
    description: "Set home town.",
  },
  {
    name: "SetFiance",
    snippet: 'SetFiance("Name");',
    description: "Set fiance name.",
  },
  {
    name: "SetPartner",
    snippet: 'SetPartner("Name");',
    description: "Set partner name.",
  },
  {
    name: "SetStat",
    snippet: "SetStat(level, 10);",
    description: "Set stat value.",
  },
  {
    name: "PlaySound",
    snippet: "PlaySound(23);",
    description: "Play a sound effect.",
  },
  {
    name: "PlayMusic",
    snippet: "PlayMusic(5);",
    description: "Play a music file.",
  },
  {
    name: "PlayEffect",
    snippet: "PlayEffect(1);",
    description: "Play a visual effect.",
  },
  {
    name: "Quake",
    snippet: "Quake(4);",
    description: "Trigger quake on current map.",
  },
  {
    name: "QuakeWorld",
    snippet: "QuakeWorld(4);",
    description: "Trigger quake on all maps.",
  },
  {
    name: "LoadMap",
    snippet: "LoadMap(1);",
    description: "Load map or map alias.",
  },
  {
    name: "AddMapItem",
    snippet: "AddMapItem(1, 100, 100, 1, 1);",
    description: "Add shared map ground item.",
  },
  {
    name: "RemoveMapItems",
    snippet: "RemoveMapItems(1);",
    description: "Clear map ground items.",
  },
  {
    name: "AddChestItem",
    snippet: "AddChestItem(1, 10, 10, 1, 1);",
    description: "Add item to chest.",
  },
  {
    name: "RemoveChestItem",
    snippet: "RemoveChestItem(1, 1, 1);",
    description: "Remove chest item entries.",
  },
  {
    name: "EmptyChests",
    snippet: "EmptyChests(1);",
    description: "Clear all chests on map.",
  },
  {
    name: "RemoveBankItem",
    snippet: "RemoveBankItem(1, 1);",
    description: "Remove bank item.",
  },
  {
    name: "RemoveKarma",
    snippet: "RemoveKarma(10);",
    description: "Remove karma.",
  },
  {
    name: "RemoveStat",
    snippet: "RemoveStat(level, 1);",
    description: "Decrease a stat by amount.",
  },
  {
    name: "StartQuest",
    snippet: "StartQuest(12);",
    description: "Start another quest.",
  },
  {
    name: "ResetQuest",
    snippet: "ResetQuest(12);",
    description: "Reset another quest.",
  },
  {
    name: "ResetDaily",
    snippet: "ResetDaily();",
    description: "Reset current quest and increment daily count.",
  },
  {
    name: "Reset",
    snippet: "Reset();",
    description: "Reset current quest to Begin.",
  },
  {
    name: "End",
    snippet: "End();",
    description: "Complete quest permanently.",
  },
  {
    name: "Roll",
    snippet: "Roll(100);",
    description: "Generate random number.",
  },
];

export const QUEST_RULE_TEMPLATES = [
  { name: "Always", snippet: "Always() goto NextState" },
  { name: "TalkedToNpc", snippet: "TalkedToNpc(13) goto NextState" },
  { name: "InputNpc", snippet: "InputNpc(1) goto NextState" },
  { name: "GotItems", snippet: "GotItems(299, 10) goto NextState" },
  { name: "LostItems", snippet: "LostItems(299, 10) goto PreviousState" },
  { name: "KilledNpcs", snippet: "KilledNpcs(2, 5) goto NextState" },
  { name: "KilledPlayers", snippet: "KilledPlayers(1) goto NextState" },
  { name: "UsedItem", snippet: "UsedItem(299, 1) goto NextState" },
  { name: "UsedSpell", snippet: "UsedSpell(10, 5) goto NextState" },
  { name: "GotSpell", snippet: "GotSpell(10) goto NextState" },
  { name: "LostSpell", snippet: "LostSpell(10) goto PreviousState" },
  { name: "EnterCoord", snippet: "EnterCoord(1, 6, 21) goto NextState" },
  { name: "LeaveCoord", snippet: "LeaveCoord(1, 6, 21) goto NextState" },
  { name: "EnterArea", snippet: "EnterArea(1, 50, 50, 3) goto NextState" },
  { name: "LeaveArea", snippet: "LeaveArea(1, 50, 50, 3) goto NextState" },
  { name: "EnterMap", snippet: "EnterMap(1) goto NextState" },
  { name: "LeaveMap", snippet: "LeaveMap(1) goto NextState" },
  { name: "FinishedQuest", snippet: "FinishedQuest(12) goto NextState" },
  { name: "DoneDaily", snippet: "DoneDaily(1) goto NextState" },
  { name: "CheckDaily", snippet: "CheckDaily() goto NextState" },
  { name: "TimeElapsed", snippet: "TimeElapsed(10m) goto NextState" },
  { name: "WaitMinutes", snippet: "WaitMinutes(5) goto NextState" },
  { name: "WaitSeconds", snippet: "WaitSeconds(30) goto NextState" },
  { name: "Stepped", snippet: "Stepped(100) goto NextState" },
  { name: "HasStepped", snippet: "HasStepped(1000) goto NextState" },
  { name: "HasKilled", snippet: "HasKilled(2, 50) goto NextState" },
  {
    name: "PickupFakeItem",
    snippet: "PickupFakeItem(1, 10, 10, 1, 1) goto NextState",
  },
  {
    name: "PickupRandomItem",
    snippet: "PickupRandomItem(RandomCoords, 1, 1) goto NextState",
  },
  { name: "CitizenOf", snippet: 'CitizenOf("Aeven") goto NextState' },
  { name: "Disconnected", snippet: "Disconnected() goto NextState" },
  { name: "Die", snippet: "Die() goto NextState" },
  { name: "ArenaWins", snippet: "ArenaWins(1) goto NextState" },
  { name: "IsClass", snippet: "IsClass(2) goto NextState" },
  { name: "IsRace", snippet: "IsRace(1) goto NextState" },
  { name: "IsGender", snippet: "IsGender(0) goto NextState" },
  { name: "IsNamed", snippet: 'IsNamed("Stephen") goto NextState' },
  { name: "IsWearing", snippet: "IsWearing(1) goto NextState" },
  { name: "NotWearing", snippet: "NotWearing(1) goto NextState" },
  { name: "Unequipped", snippet: "Unequipped() goto NextState" },
  { name: "StatBetween", snippet: "StatBetween(level, 5, 10) goto NextState" },
  { name: "StatGreater", snippet: "StatGreater(level, 5) goto NextState" },
  { name: "StatIs", snippet: "StatIs(level, 5) goto NextState" },
  { name: "StatLess", snippet: "StatLess(level, 5) goto NextState" },
  { name: "StatNot", snippet: "StatNot(level, 5) goto NextState" },
  { name: "StatRPN", snippet: "StatRPN(level, level 10 >) goto NextState" },
];

export const QUEST_STAT_MODIFIERS = [
  "accuracy",
  "agi",
  "armor",
  "cha",
  "con",
  "base_agi",
  "base_cha",
  "base_con",
  "base_int",
  "base_str",
  "base_wis",
  "evade",
  "exp",
  "goldbank",
  "hp",
  "int",
  "level",
  "mapid",
  "maxhp",
  "maxtp",
  "maxsp",
  "maxdam",
  "maxweight",
  "mindam",
  "skillpoints",
  "statpoints",
  "str",
  "tp",
  "weight",
  "wis",
  "x",
  "y",
];

export const QUEST_DEPRECATED_STAT_MODIFIERS = [
  "admin",
  "bot",
  "class",
  "direction",
  "gender",
  "haircolor",
  "hairstyle",
  "hidden",
  "karma",
  "race",
  "sitting",
  "usage",
  "whispers",
];

export const QUEST_ACTION_NAMES = new Set(
  QUEST_ACTION_TEMPLATES.map((template) => template.name.toLowerCase()),
);

export const QUEST_RULE_NAMES = new Set(
  QUEST_RULE_TEMPLATES.map((template) => template.name.toLowerCase()).concat([
    "arena",
  ]),
);
