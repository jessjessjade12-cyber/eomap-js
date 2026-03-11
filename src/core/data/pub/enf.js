import { Enf, EnfRecord, EoReader, EoWriter } from "eolib";

function toRecord(npc, id) {
  return {
    id,
    name: npc.name || "",
    graphic: npc.graphicId || 0,
    race: npc.race || 0,
    boss: npc.boss || false,
    child: npc.child || false,
    type: npc.type || 0,
    behaviorId: npc.behaviorId || 0,
    hp: npc.hp || 0,
    tp: npc.tp || 0,
    minDamage: npc.minDamage || 0,
    maxDamage: npc.maxDamage || 0,
    accuracy: npc.accuracy || 0,
    evade: npc.evade || 0,
    armor: npc.armor || 0,
    returnDamage: npc.returnDamage || 0,
    element: npc.element || 0,
    elementDamage: npc.elementDamage || 0,
    elementWeakness: npc.elementWeakness || 0,
    elementWeaknessDamage: npc.elementWeaknessDamage || 0,
    level: npc.level || 0,
    exp: npc.experience || 0,
  };
}

export class ENFParser {
  static parse(buffer) {
    try {
      const reader = new EoReader(new Uint8Array(buffer));
      const enf = Enf.deserialize(reader);
      const records = enf.npcs
        .filter((npc) => npc.name.toLowerCase() !== "eof")
        .map((npc, index) => toRecord(npc, index + 1));

      return {
        fileType: "ENF",
        totalLength: enf.totalNpcsCount,
        version: enf.version,
        records,
      };
    } catch (error) {
      throw new Error(`Invalid ENF file: ${error.message}`);
    }
  }

  static serialize(data) {
    try {
      const records = Array.isArray(data.records)
        ? data.records
        : Object.values(data.npcs || {});

      const enf = new Enf();
      enf.totalNpcsCount = records.length;
      enf.version = data.version || 1;
      enf.npcs = [...records]
        .sort((a, b) => (a.id || 0) - (b.id || 0))
        .map((record) => {
          const mapped = new EnfRecord();
          mapped.name = record.name || "";
          mapped.graphicId = record.graphic || 0;
          mapped.race = record.race || 0;
          mapped.boss = !!record.boss;
          mapped.child = !!record.child;
          mapped.type = record.type || 0;
          mapped.behaviorId = record.behaviorId || 0;
          mapped.hp = record.hp || 0;
          mapped.tp = record.tp || 0;
          mapped.minDamage = record.minDamage || 0;
          mapped.maxDamage = record.maxDamage || 0;
          mapped.accuracy = record.accuracy || 0;
          mapped.evade = record.evade || 0;
          mapped.armor = record.armor || 0;
          mapped.returnDamage = record.returnDamage || 0;
          mapped.element = record.element || 0;
          mapped.elementDamage = record.elementDamage || 0;
          mapped.elementWeakness = record.elementWeakness || 0;
          mapped.elementWeaknessDamage = record.elementWeaknessDamage || 0;
          mapped.level = record.level || 0;
          mapped.experience = record.exp || 0;
          return mapped;
        });

      const writer = new EoWriter();
      Enf.serialize(writer, enf);
      return writer.toByteArray();
    } catch (error) {
      throw new Error(`Failed to serialize ENF: ${error.message}`);
    }
  }
}
