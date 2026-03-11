import { Eif, EifRecord, EoReader, EoWriter } from "eolib";

function toRecord(item, id) {
  return {
    id,
    name: item.name || "",
    graphic: item.graphicId || 0,
    type: item.type || 0,
    subType: item.subtype || 0,
    special: item.special || 0,
    hp: item.hp || 0,
    tp: item.tp || 0,
    minDamage: item.minDamage || 0,
    maxDamage: item.maxDamage || 0,
    accuracy: item.accuracy || 0,
    evade: item.evade || 0,
    armor: item.armor || 0,
    str: item.str || 0,
    int: item.intl || 0,
    wis: item.wis || 0,
    agi: item.agi || 0,
    con: item.con || 0,
    cha: item.cha || 0,
    dollGraphic: item.spec1 || 0,
    gender: item.spec2 || 0,
    levelReq: item.levelRequirement || 0,
    classReq: item.classRequirement || 0,
    strReq: item.strRequirement || 0,
    intReq: item.intRequirement || 0,
    wisReq: item.wisRequirement || 0,
    agiReq: item.agiRequirement || 0,
    conReq: item.conRequirement || 0,
    chaReq: item.chaRequirement || 0,
    weight: item.weight || 0,
    size: item.size || 0,
  };
}

export class EIFParser {
  static parse(buffer) {
    try {
      const reader = new EoReader(new Uint8Array(buffer));
      const eif = Eif.deserialize(reader);

      const records = eif.items
        .filter((item) => item.name.toLowerCase() !== "eof")
        .map((item, index) => toRecord(item, index + 1));

      return {
        fileType: "EIF",
        totalLength: eif.totalItemsCount,
        version: eif.version,
        rid: eif.rid,
        records,
      };
    } catch (error) {
      throw new Error(`Invalid EIF file: ${error.message}`);
    }
  }

  static serialize(data) {
    try {
      const records = Array.isArray(data.records)
        ? data.records
        : Object.values(data.items || {});

      const eif = new Eif();
      eif.totalItemsCount = records.length;
      eif.version = data.version || 1;
      eif.rid = data.rid || [records.length, records.length];
      eif.items = [...records]
        .sort((a, b) => (a.id || 0) - (b.id || 0))
        .map((record, index) => {
          const mapped = new EifRecord();
          mapped.name = record.name || "";
          mapped.graphicId = record.graphic || 0;
          mapped.type = record.type || 0;
          mapped.subtype = record.subType || 0;
          mapped.special = record.special || 0;
          mapped.hp = record.hp || 0;
          mapped.tp = record.tp || 0;
          mapped.minDamage = record.minDamage || 0;
          mapped.maxDamage = record.maxDamage || 0;
          mapped.accuracy = record.accuracy || 0;
          mapped.evade = record.evade || 0;
          mapped.armor = record.armor || 0;
          mapped.returnDamage = 0;
          mapped.str = record.str || 0;
          mapped.intl = record.int || 0;
          mapped.wis = record.wis || 0;
          mapped.agi = record.agi || 0;
          mapped.con = record.con || 0;
          mapped.cha = record.cha || 0;
          mapped.lightResistance = 0;
          mapped.darkResistance = 0;
          mapped.earthResistance = 0;
          mapped.airResistance = 0;
          mapped.waterResistance = 0;
          mapped.fireResistance = 0;
          mapped.spec1 = record.dollGraphic || 0;
          mapped.spec2 = record.gender || 0;
          mapped.spec3 = 0;
          mapped.levelRequirement = record.levelReq || 0;
          mapped.classRequirement = record.classReq || 0;
          mapped.strRequirement = record.strReq || 0;
          mapped.intRequirement = record.intReq || 0;
          mapped.wisRequirement = record.wisReq || 0;
          mapped.agiRequirement = record.agiReq || 0;
          mapped.conRequirement = record.conReq || 0;
          mapped.chaRequirement = record.chaReq || 0;
          mapped.element = 0;
          mapped.elementDamage = 0;
          mapped.weight = record.weight || 0;
          mapped.size = record.size || 0;

          Object.defineProperty(mapped, "rid", {
            value: index + 1,
            writable: true,
            enumerable: true,
            configurable: true,
          });

          return mapped;
        });

      const writer = new EoWriter();
      Eif.serialize(writer, eif);
      return writer.toByteArray();
    } catch (error) {
      throw new Error(`Failed to serialize EIF: ${error.message}`);
    }
  }
}
