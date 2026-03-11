import { Esf, EsfRecord, EoReader, EoWriter } from "eolib";

function toRecord(skill, id) {
  return {
    id,
    name: skill.name || "",
    chant: skill.chant || "",
    iconId: skill.iconId || 0,
    graphicId: skill.graphicId || 0,
    tpCost: skill.tpCost || 0,
    spCost: skill.spCost || 0,
    castTime: skill.castTime || 0,
    nature: skill.nature || 0,
    type: skill.type || 0,
    element: skill.element || 0,
    elementPower: skill.elementPower || 0,
    targetRestrict: skill.targetRestrict || 0,
    targetType: skill.targetType || 0,
    targetTime: skill.targetTime || 0,
    maxSkillLevel: skill.maxSkillLevel || 0,
    minDamage: skill.minDamage || 0,
    maxDamage: skill.maxDamage || 0,
    accuracy: skill.accuracy || 0,
    evade: skill.evade || 0,
    armor: skill.armor || 0,
    returnDamage: skill.returnDamage || 0,
    hpHeal: skill.hpHeal || 0,
    tpHeal: skill.tpHeal || 0,
    spHeal: skill.spHeal || 0,
    str: skill.str || 0,
    intl: skill.intl || 0,
    wis: skill.wis || 0,
    agi: skill.agi || 0,
    con: skill.con || 0,
    cha: skill.cha || 0,
  };
}

export class ESFParser {
  static parse(buffer) {
    try {
      const reader = new EoReader(new Uint8Array(buffer));
      const esf = Esf.deserialize(reader);
      const records = esf.skills.map((skill, index) =>
        toRecord(skill, index + 1),
      );

      return {
        fileType: "ESF",
        totalLength: esf.totalSkillsCount,
        version: esf.version,
        rid: esf.rid,
        records,
      };
    } catch (error) {
      throw new Error(`Invalid ESF file: ${error.message}`);
    }
  }

  static serialize(data) {
    try {
      const records = Array.isArray(data.records)
        ? data.records
        : Object.values(data.skills || {});

      const esf = new Esf();
      esf.totalSkillsCount = records.length;
      esf.version = data.version || 1;
      esf.rid = data.rid || [records.length, records.length];
      esf.skills = [...records]
        .sort((a, b) => (a.id || 0) - (b.id || 0))
        .map((skill) => {
          const mapped = new EsfRecord();
          mapped.name = skill.name || "";
          mapped.chant = skill.chant || "";
          mapped.iconId = skill.iconId || 0;
          mapped.graphicId = skill.graphicId || 0;
          mapped.tpCost = skill.tpCost || 0;
          mapped.spCost = skill.spCost || 0;
          mapped.castTime = skill.castTime || 0;
          mapped.nature = skill.nature || 0;
          mapped.type = skill.type || 0;
          mapped.element = skill.element || 0;
          mapped.elementPower = skill.elementPower || 0;
          mapped.targetRestrict = skill.targetRestrict || 0;
          mapped.targetType = skill.targetType || 0;
          mapped.targetTime = skill.targetTime || 0;
          mapped.maxSkillLevel = skill.maxSkillLevel || 0;
          mapped.minDamage = skill.minDamage || 0;
          mapped.maxDamage = skill.maxDamage || 0;
          mapped.accuracy = skill.accuracy || 0;
          mapped.evade = skill.evade || 0;
          mapped.armor = skill.armor || 0;
          mapped.returnDamage = skill.returnDamage || 0;
          mapped.hpHeal = skill.hpHeal || 0;
          mapped.tpHeal = skill.tpHeal || 0;
          mapped.spHeal = skill.spHeal || 0;
          mapped.str = skill.str || 0;
          mapped.intl = skill.intl || 0;
          mapped.wis = skill.wis || 0;
          mapped.agi = skill.agi || 0;
          mapped.con = skill.con || 0;
          mapped.cha = skill.cha || 0;
          return mapped;
        });

      const writer = new EoWriter();
      Esf.serialize(writer, esf);
      return writer.toByteArray();
    } catch (error) {
      throw new Error(`Failed to serialize ESF: ${error.message}`);
    }
  }
}
