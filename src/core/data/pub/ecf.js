import { Ecf, EcfRecord, EoReader, EoWriter } from "eolib";

function toRecord(cls, id) {
  return {
    id,
    name: cls.name || "",
    parentType: cls.parentType || 0,
    statGroup: cls.statGroup || 0,
    str: cls.str || 0,
    int: cls.intl || 0,
    wis: cls.wis || 0,
    agi: cls.agi || 0,
    con: cls.con || 0,
    cha: cls.cha || 0,
  };
}

export class ECFParser {
  static parse(buffer) {
    try {
      const reader = new EoReader(new Uint8Array(buffer));
      const ecf = Ecf.deserialize(reader);
      const records = ecf.classes
        .filter((cls) => cls.name.toLowerCase() !== "eof")
        .map((cls, index) => toRecord(cls, index + 1));

      return {
        fileType: "ECF",
        totalLength: ecf.totalClassesCount,
        version: ecf.version,
        rid: ecf.rid,
        records,
      };
    } catch (error) {
      throw new Error(`Invalid ECF file: ${error.message}`);
    }
  }

  static serialize(data) {
    try {
      const records = Array.isArray(data.records)
        ? data.records
        : Object.values(data.classes || {});

      const ecf = new Ecf();
      ecf.totalClassesCount = records.length;
      ecf.version = data.version || 1;
      ecf.rid = data.rid || [records.length, records.length];
      ecf.classes = [...records]
        .sort((a, b) => (a.id || 0) - (b.id || 0))
        .map((record) => {
          const mapped = new EcfRecord();
          mapped.name = record.name || "";
          mapped.parentType = record.parentType || 0;
          mapped.statGroup = record.statGroup || 0;
          mapped.str = record.str || 0;
          mapped.intl = record.int || 0;
          mapped.wis = record.wis || 0;
          mapped.agi = record.agi || 0;
          mapped.con = record.con || 0;
          mapped.cha = record.cha || 0;
          return mapped;
        });

      const writer = new EoWriter();
      Ecf.serialize(writer, ecf);
      return writer.toByteArray();
    } catch (error) {
      throw new Error(`Failed to serialize ECF: ${error.message}`);
    }
  }
}
